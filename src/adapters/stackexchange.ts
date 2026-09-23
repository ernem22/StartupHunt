// StackExchangeAdapter — API v2.3 (plan v3.1 FAZ 1)
// search/advanced + questions — dev/SaaS pain point kaynağı (stackoverflow, softwarerecs)
// Kota: key'li 10.000/gün; 30 req/sn tavan; `backoff` alanı ZORUNLU uygulanır.
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash, loadAdapterState, saveAdapterState } from "../db.js";

interface SeQuestion {
  question_id: number;
  title: string;
  body?: string; // filter=withbody gerekir
  link: string;
  creation_date: number;
  score: number;
  answer_count: number;
  is_answered: boolean;
  tags: string[];
  owner?: { display_name: string } | null;
}

interface SeResponse {
  items: SeQuestion[] | null;
  has_more: boolean;
  backoff?: number; // saniye — uygulanması zorunlu (docs throttle)
  quota_max?: number;
  quota_remaining?: number;
}

const API = "https://api.stackexchange.com/2.3";
const PAGE_DELAY_MS = 1200;
const FILTER = "withbody"; // title + body + tags döner

/** Sinyal radarı hedefli siteler + sorgular. */
const SITE_QUERIES: { site: string; q: string }[] = [
  { site: "stackoverflow", q: "how to export data" },
  { site: "stackoverflow", q: "missing feature api" },
  { site: "softwarerecs", q: "alternative to" },
  { site: "softwarerecs", q: "saas for" },
];

interface SeCursor {
  pages: string[];
}

function key(): string | undefined {
  return process.env.STACK_EXCHANGE_KEY || undefined;
}

async function seFetch(path: string, site: string): Promise<SeResponse | null> {
  const params = new URLSearchParams({ filter: FILTER, site });
  const k = key();
  if (k) params.set("key", k);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url = `${API}${path}${path.includes("?") ? "&" : "?"}${params.toString()}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.status === 429) {
        console.warn("  [429] 60s bekleniyor");
        await sleep(60000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as SeResponse;
    } catch (e) {
      if (attempt === 2) {
        console.warn(`  [hata] ${path}: ${(e as Error).message}`);
        return null;
      }
      await sleep(5000 * (attempt + 1));
    }
  }
  return null;
}

function toNormalized(site: string, q: SeQuestion): NormalizedObservation | null {
  const body = (q.body ?? "").replace(/<[^>]+>/g, " ").trim(); // HTML strip — embedding temiz metin ister
  if (!q.title && !body) return null;
  return {
    source: "stackexchange",
    sourceId: `${site}-${q.question_id}`,
    sourceUrl: q.link,
    title: q.title,
    text: body.length > 0 ? body : q.title,
    author: q.owner?.display_name ?? null,
    observedAt: new Date(q.creation_date * 1000),
    language: null,
    metadata: {
      site,
      tags: q.tags,
      score: q.score,
      answer_count: q.answer_count,
      is_answered: q.is_answered,
    },
  };
}

export class StackExchangeAdapter implements Adapter {
  name = "stackexchange";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    // imleç: seyrek recluster benzeri — SE'de backfill tam geçmişe inmez;
    // 'activity' sıralı sayfalama + upsert idempotent → tekrar çalıştırma güvenli.
    let processed = 0;

    for (const { site, q } of SITE_QUERIES) {
      console.log(`▶ SE ${site}: "${q}"`);
      for (let page = 1; page <= 5; page++) {
        if (opts.limit !== undefined && processed >= opts.limit) {
          console.log(`oturum limiti (${opts.limit}) doldu.`);
          return;
        }
        const res = await seFetch(
          `/search/advanced?order=desc&sort=activity&q=${encodeURIComponent(q)}&page=${page}&pagesize=50`,
          site
        );
        if (!res || !res.items || res.items.length === 0) break;

        for (const question of res.items) {
          const norm = toNormalized(site, question);
          if (!norm) continue;
          if (!opts.dryRun) {
            await upsertRaw({ source: "stackexchange", sourceId: norm.sourceId, rawData: question });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
          }
          processed++;
          opts.onProgress?.({ processed, totalFetched: processed });
        }

        if (res.backoff) {
          console.log(`  [backoff] ${res.backoff}s uygulanıyor (zorunlu)`);
          await sleep(res.backoff * 1000);
        }
        if (!res.has_more) break;
        await sleep(PAGE_DELAY_MS);
      }
      console.log(`  ${site} "${q}" tamam.`);
    }

    console.log(`✔ StackExchange oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
