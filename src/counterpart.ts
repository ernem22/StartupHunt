// Counterpart — TR karşılık araması (plan v3.2 FAZ 14).
// `pnpm counterpart --pattern <id>` — YALNIZCA insan onaylı (review_status='interesting') pattern.
// Akış: keywords → TR sorgu (kurallı; LLM yalnızca yorum katmanında) → SearXNG /search?q=&language=tr
// → snippet'ler observations'a (source='searxng', metadata.parent_pattern_id) → idempotent (counterpart_searches).
import pg from "pg";
import { config } from "./config.js";
import { upsertRaw, upsertNormalized, contentHash } from "./db.js";
import type { NormalizedObservation } from "./types.js";

const SEARXNG_URL = process.env.SEARXNG_URL ?? "http://localhost:8888";

interface PatternRow {
  id: number;
  name: string | null;
  keywords: string[] | null;
}

interface SearResult {
  url: string;
  title: string;
  content: string;
  engine: string;
  publishedDate?: string | null;
}

interface SearResponse {
  results: SearResult[];
  query: string;
}

/** Kurallı TR sorgu üretimi (deterministik): pattern adı + top keywords, EN terimleri bırakılır.
 *  LLM TR çevirisi YALNIZ yorum katmanı kuralından bağımsızdır — v0.1 kurallı yeter (FAZ 14). */
function buildQueries(name: string | null, keywords: string[]): string[] {
  const terms = keywords.slice(0, 5).join(" ");
  const q1 = terms;
  const q2 = name ?? "";
  const qs = [q1, q2].filter((s) => s && s.trim().length > 2);
  return Array.from(new Set(qs));
}

async function searxSearch(q: string): Promise<SearResult[]> {
  const res = await fetch(
    `${SEARXNG_URL}/search?q=${encodeURIComponent(q)}&language=tr&format=json`,
    { signal: AbortSignal.timeout(60_000) },
  );
  if (!res.ok) throw new Error(`SearXNG HTTP ${res.status}`);
  const j = (await res.json()) as { results: SearResult[] };
  return j.results ?? [];
}

async function runForPattern(pool: pg.Pool, patternId: number, dryRun: boolean): Promise<void> {
  const p = await pool.query<PatternRow>(
    `select id, name, keywords from patterns where id = $1 and review_status = 'interesting' and status = 'active'`,
    [patternId],
  );
  const pat = p.rows[0];
  if (!pat) {
    // onaysız/bulunamadı — FAZ 14 koşulu ihlal; sessiz çık (kuyruğu da bloklamaz)
    console.log(`pattern #${patternId}: koşul yok (interesting değil ya da arşiv) — atlandı`);
    return;
  }
  const queries = buildQueries(pat.name, pat.keywords ?? []);
  if (queries.length === 0) {
    console.log(`pattern #${patternId}: sorgu üretilemedi (isim+keywords yok)`);
    return;
  }

  const collected: NormalizedObservation[] = [];
  let searched = 0;
  for (const q of queries) {
    searched++;
    // idempotentlik: bu sorgu daha önce done ise tekrar koşma
    const prior = await pool.query(
      `select 1 from counterpart_searches where pattern_id=$1 and query=$2 and status='done'`,
      [patternId, q],
    );
    if (prior.rows.length > 0) {
      console.log(`  "${q}" (done kayıtlı — atla)`);
      continue;
    }
    let results: SearResult[] = [];
    let status = "done";
    try {
      results = await searxSearch(q);
    } catch (e) {
      console.warn(`  [hata] SearXNG "${q}": ${(e as Error).message}`);
      status = "error";
    }
    console.log(`  query "${q}" → ${results.length} sonuç`);

    // sorgunun kaydi — idempotentlik anahtarı (fail de kaydedilir: sonraki koşum tekrar dener)
    await pool.query(
      `insert into counterpart_searches (pattern_id, query, engine, result_count, status)
       values ($1, $2, 'searxng', $3, $4)`,
      [patternId, q, status === "done" ? results.length : 0, status],
    );

    for (const r of results.slice(0, 20)) {
      const text = `${r.title}\n\n${r.content}`.trim();
      if (text.length < 40) continue;
      collected.push({
        source: "searxng",
        sourceId: shaUrl(r.url),
        sourceUrl: r.url,
        title: r.title,
        text,
        author: null,
        observedAt: r.publishedDate ? new Date(r.publishedDate) : null,
        language: "tr",
        metadata: { parent_pattern_id: patternId, query: q, engine: r.engine ?? null },
      });
    }

    if (status !== "done") break;
  }

  if (!dryRun) {
    for (const o of collected) {
      await upsertRaw({ source: o.source, sourceId: o.sourceId, rawData: o });
      try {
        await upsertNormalized({ ...o, contentHash: contentHash(o) });
      } catch (err) {
        if (!(err as Error).message.includes("duplicate key")) throw err;
      }
    }
  }
  console.log(
    `✔ pattern #${pat.id}: sorgu=${searched}; sonuç obs (dry-run'da yazılmaz): ${collected.length}`,
  );
}

function shaUrl(url: string): string {
  // sourceId: aynı URL farklı sorguda tek obs kalsın — FNV-1a kısa hash
  let h = 0x811c9dc5;
  for (let i = 0; i < url.length; i++) {
    h ^= url.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `searx:${h.toString(16)}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--pattern");
  const dryRun = args.includes("--dry-run");
  const patternId = idx >= 0 ? Number(args[idx + 1]) : NaN;
  if (!Number.isInteger(patternId)) {
    console.log("kullanım: pnpm counterpart -- --pattern <id> [-- --dry-run]");
    process.exit(0);
  }
  const pool = new pg.Pool({ connectionString: config.databaseUrl });
  try {
    await runForPattern(pool, patternId, dryRun);
  } finally {
    await pool.end().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
