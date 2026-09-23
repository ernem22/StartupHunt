// Deepen — geçmiş destek modu (plan v3.2 PILOT / Geçmiş destek modu).
// `pnpm deepen -- --pattern <id> --months N` : yakındaki bir "olasılık" pattern'ın keywords'ünü
// Arctic Shift title/selftext aramasıyla BACKFILL_SINCE'ten N ay geriye tarar.
// Geçicilik: observations.metadata.deep_dive_for = pattern_id — kalıcı corpus'a karışmaz.
// Temizlik: pnpm prune-deep-dive (aynı metadata işaretini bulup obs+raw siler).
import pg from "pg";
import { config, SUBREDDITS, BACKFILL_SINCE } from "./config.js";
import { upsertRaw, upsertNormalized, contentHash } from "./db.js";
import type { NormalizedObservation } from "./types.js";

const BASE = config.arcticShiftBaseUrl;

interface ArcticPost {
  id: string;
  subreddit: string;
  title?: string;
  selftext?: string;
  author?: string;
  created_utc?: number;
  permalink?: string;
}

interface SearchResponse {
  data: ArcticPost[];
}

async function fetchSearch(sub: string, q: string, afterIso: string, untilIso: string, limit: number): Promise<ArcticPost[]> {
  const params = new URLSearchParams({
    subreddit: sub,
    title: q, // Arctic Shift: title/selftext araması yalnız subreddit/author filtresiyle çalışır (plan FAZ 1)
    after: afterIso,
    before: untilIso,
    sort: "asc",
    limit: String(Math.min(limit, 100)),
  });
  const url = `${BASE}/api/posts/search?${params.toString()}`;
  for (let attempt = 0; attempt < config.arcticShift.maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "StartupHunt/0.1 (research; contact: local)" },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status === 429) {
        const reset = Number(res.headers.get("x-ratelimit-reset") ?? "30");
        await sleep(Math.max(reset * 1000, config.arcticShift.retryBackoffMs));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as SearchResponse;
      return j.data ?? [];
    } catch (e) {
      if (attempt === config.arcticShift.maxRetries - 1) {
        console.warn(`  [hata] r/${sub} "${q}" sayfa atlandı: ${(e as Error).message}`);
        return [];
      }
      await sleep(config.arcticShift.retryBackoffMs);
    }
  }
  return [];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const gid = args.indexOf("--pattern");
  const gm = args.indexOf("--months");
  const dryRun = args.includes("--dry-run");
  const patternId = gid >= 0 ? Number(args[gid + 1]) : NaN;
  const months = gm >= 0 ? Number(args[gm + 1]) : NaN;

  if (args[0] === "prune") return void prune();

  if (!Number.isInteger(patternId) || !Number.isFinite(months) || months <= 0) {
    console.log("kullanım: pnpm deepen -- --pattern <id> --months <N> [-- --dry-run]");
    console.log("          pnpm deepen prune");
    process.exit(0);
  }

  const pool = new pg.Pool({ connectionString: config.databaseUrl });
  try {
    // pattern'in kendi subreddit dağılımı — hangi sub'ların geçmişine bakılacak (kapsam daraltır, anlamı korur)
    const seen = await pool.query<{ subreddit: string }>(
      `select distinct o.metadata->>'subreddit' as subreddit
       from pattern_observations po join observations o on o.id = po.observation_id
       where po.pattern_id = $1 and o.source = 'reddit' and o.metadata ? 'subreddit'`,
      [patternId],
    );
    const subs = seen.rows.map((r) => r.subreddit).filter(Boolean);
    const subsToScan = subs.length > 0 ? subs : [...SUBREDDITS];
    const pat = await pool.query<{ id: number; keywords: string[] | null; name: string | null }>(
      `select id, keywords, name from patterns where id = $1 and status = 'active'`,
      [patternId],
    );
    if (!pat.rows[0]) {
      console.log(`pattern #${patternId} yok ya da arşiv`);
      return;
    }
    const keywords = (pat.rows[0]?.keywords ?? []).slice(0, 3); // Arctic Shift tek sorgu terimi bekler
    const query = keywords.join(" ").trim();
    if (!query) {
      console.log(`pattern #${patternId}: keywords yok — sorgu üretilemedi`);
      return;
    }

    // derin pencere: [BACKFILL_SINCE - months, BACKFILL_SINCE) — 18 ay tabanının ÖNCESİ
    const until = new Date(BACKFILL_SINCE);
    const after = new Date(until);
    after.setUTCMonth(after.getUTCMonth() - months);
    const afterIso = after.toISOString();
    const untilIso = until.toISOString();
    console.log(
      `deepen #${patternId} "${query}" — r/${subsToScan.join(",r/")} · ${afterIso.slice(0, 10)} → ${untilIso.slice(0, 10)}${dryRun ? " (dry-run)" : ""}`,
    );

    let obs = 0;
    const MAX_OBS = 2000; // oturum güvenlik tavanı (geçici data — aşırı derin dalmıyoruz)
    for (const sub of subsToScan) {
      let cursorIso = afterIso;
      while (cursorIso < untilIso) {
        const batch = await fetchSearch(sub, query, cursorIso, untilIso, 100);
        if (batch.length === 0) break;
        for (const p of batch) {
          const text = `${p.title ?? ""}\n\n${p.selftext ?? ""}`.trim();
          if (text.length < 40) continue; // clean kurallarıyla uyum
          const norm: NormalizedObservation = {
            source: "reddit",
            sourceId: p.id,
            sourceUrl: p.permalink
              ? `https://www.reddit.com${p.permalink}`
              : `https://www.reddit.com/r/${p.subreddit}/comments/${p.id}`,
            title: p.title ?? null,
            text,
            author: p.author && p.author !== "[deleted]" ? p.author : null,
            observedAt: p.created_utc ? new Date(p.created_utc * 1000) : null,
            language: null,
            metadata: {
              subreddit: p.subreddit,
              deep_dive_for: patternId,
              deep_dive_window: `${afterIso.slice(0, 10)}..${untilIso.slice(0, 10)}`,
            },
          };
          obs++;
          if (!dryRun) {
            await upsertRaw({ source: "reddit", sourceId: p.id, rawData: p });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
          }
        }
        const lastIso = batch[batch.length - 1]?.created_utc
          ? new Date((batch[batch.length - 1]!.created_utc! * 1000)).toISOString()
          : untilIso;
        if (batch.length < 100 || lastIso >= untilIso || obs >= MAX_OBS) break;
        cursorIso = lastIso;
        await sleep(config.arcticShift.pageDelayMs);
      }
      console.log(`  r/${sub} tamam (obs=${obs}, toplam)`);
      await sleep(config.arcticShift.pageDelayMs);
    }
    console.log(
      `✔ deepen #${patternId}: ${obs} eski obs (deep_dive_for işaretli)${dryRun ? " (dry-run; yazılmadı)" : " — geçici: prune bekler"}`,
    );
  } finally {
    await pool.end().catch(() => {});
  }
}

/** pnpm deepen prune — deep_dive_for işaretli obs + raw satırlarını siler (geçicilik garantisi). */
async function prune(): Promise<void> {
  const pool = new pg.Pool({ connectionString: config.databaseUrl });
  try {
    const c = await pool.query<{ count: string }>(
      `select count(*)::text  as count from observations where metadata ? 'deep_dive_for'`,
    );
    console.log(`deep_dive_for işaretli obs: ${c.rows[0]?.count ?? 0} — siliniyor...`);
    const r = await pool.query(
      `with dd as (
         delete from observations where metadata ? 'deep_dive_for'
         returning source, source_id
       ), dr as (
         delete from raw_observations rw
         using dd where rw.source = dd.source and rw.source_id = dd.source_id
         returning 1
       )
       select (select count(*) from dd) as del_obs, (select count(*) from dr) as del_raw`,
    );
    console.log(
      `✔ prune: obs=${r.rows[0]?.del_obs} silindi, raw=${r.rows[0]?.del_raw} silindi`,
    );
  } finally {
    await pool.end().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
