// RedditBackfillAdapter — Arctic Shift API (plan v3.1 FAZ 1)
// son 18 ay (BACKFILL_SINCE) post'ları subreddit bazlı çeker; idempotent upsert + catch-up imleci.
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { config, SUBREDDITS, BACKFILL_SINCE } from "../config.js";
import { upsertRaw, upsertNormalized, contentHash } from "../db.js";

/** Arctic Shift post (pushshift şemasının alt kümesi) */
interface ArcticPost {
  id: string;
  subreddit: string;
  title?: string;
  selftext?: string;
  author?: string;
  created_utc?: number;
  permalink?: string;
  url?: string;
  score?: number;
  num_comments?: number;
  upvote_ratio?: number;
  link_flair_text?: string | null;
  over_18?: boolean;
  removed_by_category?: string | null;
  crosspost_parent_id?: string | null;
}

interface SearchResponse {
  data: ArcticPost[];
  metadata?: { after?: string | null; before?: string | null; total?: number };
}

const BASE = config.arcticShiftBaseUrl;

async function fetchPage(subreddit: string, after: string | null, limit: number): Promise<SearchResponse | null> {
  const params = new URLSearchParams({
    subreddit,
    sort: "asc",
    limit: String(Math.min(limit, 100)),
  });
  if (after) params.set("after", after); // ISO tarih; imleç = son post'un created_utc'si
  const url = `${BASE}/api/posts/search?${params.toString()}`;

  for (let attempt = 0; attempt < config.arcticShift.maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "StartupHunt/0.1 (research; contact: local)" },
      });
      if (res.status === 429) {
        // Arctic Shift: X-RateLimit-Reset'e uy
        const reset = Number(res.headers.get("x-ratelimit-reset") ?? "30");
        const waitMs = (Number.isFinite(reset) ? reset : 30) * 1000;
        console.warn(`  [429] ${subreddit}: bekleniyor ${Math.round(waitMs / 1000)}s`);
        await sleep(Math.max(waitMs, config.arcticShift.retryBackoffMs));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
      return (await res.json()) as SearchResponse;
    } catch (e) {
      if (attempt === config.arcticShift.maxRetries - 1) {
        console.error(`  [hata] ${subreddit} sayfa atlandı: ${(e as Error).message}`);
        return null;
      }
      await sleep(config.arcticShift.retryBackoffMs * (attempt + 1));
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function toNormalized(p: ArcticPost): NormalizedObservation {
  const text = (p.selftext ?? "").trim();
  const removed = Boolean(p.removed_by_category);
  const createdAt = p.created_utc ? new Date(p.created_utc * 1000) : null;
  const sourceUrl = p.permalink
    ? `https://www.reddit.com${p.permalink}`
    : `https://www.reddit.com/r/${p.subreddit}/comments/${p.id}`;

  return {
    source: "reddit",
    sourceId: p.id,
    sourceUrl,
    title: p.title ?? null,
    // silinmiş/moderasyon postu veya [removed] gövdesi observation değeri taşımaz → title-only
    text: text.length > 0 && !removed ? text : (p.title ?? ""),
    author: p.author ?? null,
    observedAt: createdAt,
    // Backfill TR taraması değil; dil tespiti FAZ 4'te normalize katmanında — şimdilik null
    language: null,
    metadata: {
      subreddit: p.subreddit,
      score: p.score ?? null,
      num_comments: p.num_comments ?? null,
      upvote_ratio: p.upvote_ratio ?? null,
      flair: p.link_flair_text ?? null,
      nsfw: p.over_18 === true,
      removed,
      crosspost_parent_id: p.crosspost_parent_id ?? null,
      is_self: text.length > 0,
      backfill: true,
    },
  };
}

/**
 * Backfill stratejisi (plan v3.1):
 * - BACKFILL_SINCE (2020) → bugün, subreddit başına sıralı tarama
 * - Her sayfa 100 post; son postun created_utc → sonraki `after`
 * - Sadece anlamlı postlar: nsfw/removed [silinmiş gövde] elenmez ama flag'lenir;
 *   tam boş (title+selftext yok) atlanır
 */
export class RedditBackfillAdapter implements Adapter {
  name = "reddit-backfill";

  async collect(since: Date | null, opts: CollectOptions): Promise<void> {
    const start = since ?? BACKFILL_SINCE;
    const subs = [...SUBREDDITS];
    let processed = 0;

    for (const sub of subs) {
      let after: string | null = start.toISOString();
      let fetchedThisSub = 0;
      console.log(`▶ r/${sub} — başlangıç: ${after}`);

      while (true) {
        const remaining = opts.limit ? opts.limit - processed : undefined;
        if (remaining !== undefined && remaining <= 0) {
          console.log(`  oturum limiti doldu (${opts.limit}); kalan subredditler sonraki çalıştırmada.`);
          return;
        }

        const page = await fetchPage(sub, after, remaining ?? 100);
        if (!page || page.data.length === 0) {
          console.log(`  r/${sub} tamam (≈${fetchedThisSub} post).`);
          break;
        }

        for (const p of page.data) {
          // skip: tamamen içeriksiz
          if (!p.title && !p.selftext) continue;

          const norm = toNormalized(p);
          if (!opts.dryRun) {
            const rawRes = await upsertRaw({ source: "reddit", sourceId: p.id, rawData: p });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              // source_url çakışması (crosspost vb.): raw kayıtlı kalır, normalized pas
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
            if (rawRes === "inserted") processed++;
          } else {
            processed++;
          }
          fetchedThisSub++;
        }

        opts.onProgress?.({ processed, totalFetched: fetchedThisSub });

        // imleç: son post'un created_utc (+1s, aynı saniyedekileri kaçırmamak için)
        const last = page.data.at(-1);
        const lastUtc = last?.created_utc;
        if (!lastUtc) break;
        after = new Date((lastUtc + 1) * 1000).toISOString();

        if (page.data.length < 100) {
          console.log(`  r/${sub} tamam (≈${fetchedThisSub} post).`);
          break;
        }
        await sleep(config.arcticShift.pageDelayMs);
      }
    }
    console.log(`✔ backfill oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}
