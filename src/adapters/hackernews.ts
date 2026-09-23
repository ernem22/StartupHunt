// HackerNewsAdapter — Algolia Search API (plan v3.1 FAZ 1)
// Story + comment; `numericFilters=created_at_i>imleç` ile catch-up sayfalama.
// Firebase API'si canlı akış için; bu adapter Algolia üzerinden hem story hem comment çeker.
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash, loadAdapterState, saveAdapterState } from "../db.js";

/** Dry-run'da DB yok — bellek içi state (test amacıyla yeterli). */
function makeStateStore<T>(dryRun: boolean, initial: () => T) {
  let mem: T | null = null;
  return {
    async load(): Promise<T> {
      if (dryRun) return (mem ??= initial());
      return (await loadAdapterState<T>("hackernews")) ?? initial();
    },
    async save(v: T): Promise<void> {
      if (dryRun) {
        mem = v;
        return;
      }
      await saveAdapterState("hackernews", v, {});
    },
  };
}

interface AlgoliaHit {
  objectID: string;
  created_at: string; // ISO
  author?: string;
  title?: string;
  story_title?: string | null;
  story_id?: number | null;
  url?: string | null;
  story_url?: string | null;
  comment_text?: string | null;
  points?: number | null;
  num_comments?: number | null;
  _tags?: string[]; // "story" | "comment" | "author_x" | "story_yyy"
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

const BASE = "https://hn.algolia.com/api/v1/search";
const PAGE_DELAY_MS = 700; // nazik ol — resmi limit yok ama tavan: nbPages=1000
const BACKFILL_SINCE = Math.floor(new Date("2020-01-01T00:00:00Z").getTime() / 1000);

/** Backfill süresi boyunca SaaS/startup ile ilgili anahtar kelimeler —
 *  HN'in tamamı değil, sinyal radarına hizmet eden dilim. */
const QUERY_TERMS = [
  "SaaS",
  "startup",
  "indie hackers",
  "Show HN",
  "Ask HN",
  "no-code",
  "product hunt",
];

interface HnCursor {
  lastCreatedAt: number; // unix sn — en son işlenen created_at
  doneBackfill: boolean;
}

function isStory(h: AlgoliaHit): boolean {
  return (h._tags ?? []).includes("story");
}

function toNormalized(h: AlgoliaHit): NormalizedObservation | null {
  const story = isStory(h);
  const storyId = h.story_id ?? null;
  const title = story ? (h.title ?? null) : (h.story_title ?? null);
  const text = story ? null : h.comment_text ?? null;
  const itemUrl = `https://news.ycombinator.com/item?id=${h.objectID}`;

  if (!title && !text) return null; // içeriksiz

  return {
    source: "hackernews",
    sourceId: h.objectID,
    sourceUrl: itemUrl,
    title,
    // story: title (selftext HN'de yok — Ask HN gövdesi metni text'te taşınır), comment: comment_text
    text: text ?? title ?? "",
    author: h.author ?? null,
    observedAt: h.created_at ? new Date(h.created_at) : null,
    language: null,
    metadata: {
      kind: story ? "story" : "comment",
      parent_story_id: storyId,
      points: h.points ?? null,
      num_comments: h.num_comments ?? null,
      url: (story ? h.url : h.story_url) ?? null,
    },
  };
}

export class HackerNewsAdapter implements Adapter {
  name = "hackernews";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    const store = makeStateStore<HnCursor>(opts.dryRun, () => ({
      lastCreatedAt: BACKFILL_SINCE,
      doneBackfill: false,
    }));
    const cursor: HnCursor = await store.load();

    let processed = 0;
    const sinceUnix = cursor.lastCreatedAt;

    for (const term of QUERY_TERMS) {
      let page = 0;
      let done = false;
      console.log(`▶ HN "${term}" — created_at_i > ${sinceUnix}`);

      while (!done) {
        if (opts.limit !== undefined && processed >= opts.limit) {
          console.log(`oturum limiti (${opts.limit}) doldu.`);
          await store.save(cursor);
          return;
        }

        const params = new URLSearchParams({
          query: term,
          tags: "(story,comment)",
          numericFilters: `created_at_i>${sinceUnix}`,
          hitsPerPage: "100",
          page: String(page),
        });

        let res: AlgoliaResponse;
        try {
          const http = await fetch(`${BASE}?${params.toString()}`);
          if (!http.ok) throw new Error(`HTTP ${http.status}`);
          res = (await http.json()) as AlgoliaResponse;
        } catch (e) {
          console.warn(`  [hata] "${term}" sayfa ${page} atlandı: ${(e as Error).message}`);
          break;
        }

        for (const hit of res.hits) {
          const norm = toNormalized(hit);
          if (!norm) continue;

          const createdAtUnix = Math.floor(new Date(hit.created_at).getTime() / 1000);
          if (createdAtUnix > (cursor.lastCreatedAt ?? 0)) cursor.lastCreatedAt = createdAtUnix;

          if (!opts.dryRun) {
            await upsertRaw({ source: "hackernews", sourceId: hit.objectID, rawData: hit });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
          }
          processed++;
          opts.onProgress?.({ processed, totalFetched: processed });
        }

        page++;
        if (page >= res.nbPages || res.hits.length === 0) done = true;
        await sleep(PAGE_DELAY_MS);
      }
      console.log(`  "${term}" tamam.`);
    }

    cursor.doneBackfill = true;
    await store.save(cursor);
    console.log(`✔ HN oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
