// HackerNewsAdapter — Algolia Search API (plan v3.2 FAZ 1)
// Story + comment; **arama tarihi-sıralı** (search_by_date) ve **sorgu terimi başına ayrı
// imleç** — relevance-sorted result üzerinden ortak imleç ilerlemek sayfa atlatabilir
// (CodeRabbit review düzeltmesi). Catch-up: created_at_i mantığı korunur.
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash, loadAdapterState, saveAdapterState } from "../db.js";
import { BACKFILL_SINCE } from "../config.js";

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

const BASE = "https://hn.algolia.com/api/v1/search_by_date"; // tarih-sıralı (created desc)
const PAGE_DELAY_MS = 700; // nazik ol — resmi limit yok ama tavan: nbPages=1000

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
  /** sorgu terimi başına yüksek su işareti (unix sn) — ortak imleç yanlış ilerletirdi */
  lastByTerm: Record<string, number>;
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
    const initial = () => ({
      lastByTerm: Object.fromEntries(QUERY_TERMS.map((t) => [t, Math.floor(BACKFILL_SINCE.getTime() / 1000)])),
      doneBackfill: false,
    });
    const store = makeStateStore<HnCursor>(opts.dryRun, initial);
    const cursor = await store.load();
    if (!cursor.lastByTerm || typeof cursor.lastByTerm !== "object") {
      cursor.lastByTerm = initial().lastByTerm;
    }

    let processed = 0;

    for (const term of QUERY_TERMS) {
      let page = 0;
      let done = false;
      const termSince = cursor.lastByTerm[term] ?? Math.floor(BACKFILL_SINCE.getTime() / 1000);
      console.log(`▶ HN "${term}" — created_at_i > ${termSince}`);

      while (!done) {
        if (opts.limit !== undefined && processed >= opts.limit) {
          console.log(`oturum limiti (${opts.limit}) doldu.`);
          await store.save(cursor);
          return;
        }

        const params = new URLSearchParams({
          query: term,
          tags: "(story,comment)",
          numericFilters: `created_at_i>${termSince}`,
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

        // search_by_date: desc sıra — sayfanın ilk hit'i en yeni; imleç = en yeni işlenen
        const first = res.hits.at(0);
        const firstUnix = first ? Math.floor(new Date(first.created_at).getTime() / 1000) : 0;
        if (firstUnix > (cursor.lastByTerm[term] ?? 0)) cursor.lastByTerm[term] = firstUnix;

        for (const hit of res.hits) {
          const norm = toNormalized(hit);
          if (!norm) continue;
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

        // capazo sayfa ilerlemesinden sonra imleç kaydet (kaybetmez catch-up)
        await store.save(cursor);
        page++;
        if (page >= res.nbPages || res.hits.length === 0) done = true;
        await sleep(PAGE_DELAY_MS);
      }
      console.log(`  "${term}" tamam (cursor=${cursor.lastByTerm[term]}).`);
    }

    cursor.doneBackfill = true;
    await store.save(cursor);
    console.log(`✔ HN oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
