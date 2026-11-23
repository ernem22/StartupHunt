import { canonicalKey } from "./key.js";
import { DELAY_MS, finite, fetchJson, fetchText, isoDay, sleep } from "./http.js";
import type { DataPoint, RawCandidate } from "./model.js";

// Each producer is one candidate source. A producer may skip individual requests
// (recorded in `skipped`) but throws only when the whole source is unusable.
export interface ProducerResult {
  candidates: RawCandidate[];
  skipped: string[];
}

export interface CandidateProducer {
  readonly source: string;
  collect(at: Date): Promise<ProducerResult>;
}

const DAY = 86400_000;

function point(
  source: string,
  metric: string,
  value: number | undefined,
  date: string,
  url: string,
): DataPoint[] {
  return value === undefined ? [] : [{ source, metric, value, date, url }];
}

// ---------------------------------------------------------------- Product Hunt (Atom)

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Parses the Product Hunt Atom feed. Feed order is the only numeric signal (no vote counts). */
export function parseProductHuntFeed(xml: string): RawCandidate[] {
  const entries = xml.split("<entry>").slice(1);
  const result: RawCandidate[] = [];
  entries.forEach((entry, index) => {
    const title = /<title>([\s\S]*?)<\/title>/.exec(entry)?.[1];
    const link = /<link rel="alternate" type="text\/html" href="([^"]+)"/.exec(entry)?.[1];
    const published = /<published>([^<]+)<\/published>/.exec(entry)?.[1];
    if (!title || !link || !published) throw new Error("Invalid Product Hunt entry");
    const url = decodeEntities(link);
    const key = canonicalKey(url);
    if (!key) return;
    const date = isoDay(published);
    const description = /<content[^>]*>([\s\S]*?)<\/content>/.exec(entry)?.[1];
    const firstParagraph = description
      ? /<p>([\s\S]*?)<\/p>/.exec(decodeEntities(description))?.[1]
      : undefined;
    const summary = firstParagraph
      ? decodeEntities(firstParagraph)
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";
    result.push({
      name: decodeEntities(title).trim(),
      key,
      url,
      source: "producthunt",
      dataPoints: point("producthunt", "ph_feed_position", index + 1, date, url),
      ...(summary ? { description: summary.slice(0, 300) } : {}),
    });
  });
  return result;
}

export class ProductHuntProducer implements CandidateProducer {
  readonly source = "producthunt";

  async collect(): Promise<ProducerResult> {
    const xml = await fetchText("https://www.producthunt.com/feed");
    if (!xml.includes("<feed")) throw new Error("Product Hunt feed is not Atom");
    return { candidates: parseProductHuntFeed(xml), skipped: [] };
  }
}

// ---------------------------------------------------------------- Reddit via Arctic Shift

const ARCTIC = "https://arctic-shift.photon-reddit.com/api/posts/search";
const SUBREDDITS = ["SideProject", "startups", "AppIdeas"] as const;
const PAGES_PER_SUBREDDIT = 2;
const PAGE_SIZE = 100;
const KEEP_PER_SUBREDDIT = 10;

interface RedditPost {
  id: string;
  title: string;
  url: string;
  is_self: boolean;
  score: number;
  num_comments: number;
  created_utc: number;
}

function isRedditPost(value: unknown): value is RedditPost {
  if (!value || typeof value !== "object") return false;
  const post = value as Record<string, unknown>;
  return (
    typeof post.id === "string" &&
    typeof post.title === "string" &&
    typeof post.url === "string" &&
    typeof post.is_self === "boolean" &&
    finite(post.score) !== undefined &&
    finite(post.num_comments) !== undefined &&
    finite(post.created_utc) !== undefined
  );
}

/**
 * Keeps posts that link to an outside product (self posts carry no product link), ranked by score.
 * Arctic Shift cannot sort by score, so this ranks only the posts actually fetched.
 */
export function redditCandidates(subreddit: string, posts: unknown[]): RawCandidate[] {
  const external: RawCandidate[] = [];
  for (const post of posts) {
    if (!isRedditPost(post)) throw new Error(`Invalid Reddit post in r/${subreddit}`);
    if (post.is_self) continue;
    const key = canonicalKey(post.url);
    if (!key) continue;
    const link = `https://www.reddit.com/r/${subreddit}/comments/${post.id}`;
    const date = isoDay(post.created_utc * 1000);
    external.push({
      name: post.title.trim().slice(0, 120),
      key,
      url: post.url,
      source: "reddit",
      dataPoints: [
        ...point("reddit", "reddit_score", post.score, date, link),
        ...point("reddit", "reddit_comments", post.num_comments, date, link),
      ],
    });
  }
  return external
    .sort((a, b) => (b.dataPoints[0]?.value ?? 0) - (a.dataPoints[0]?.value ?? 0))
    .slice(0, KEEP_PER_SUBREDDIT);
}

export class RedditProducer implements CandidateProducer {
  readonly source = "reddit";

  async collect(at: Date): Promise<ProducerResult> {
    // Posts from the day 7-8 days ago: old enough that scores have settled.
    const after = Math.floor((at.getTime() - 8 * DAY) / 1000);
    const candidates: RawCandidate[] = [];
    const skipped: string[] = [];
    let requests = 0;
    for (const subreddit of SUBREDDITS) {
      let before = Math.floor((at.getTime() - 7 * DAY) / 1000);
      const posts: unknown[] = [];
      for (let page = 0; page < PAGES_PER_SUBREDDIT; page += 1) {
        // A failed later page keeps the posts already fetched for this subreddit.
        if (requests > 0) await sleep(DELAY_MS);
        requests += 1;
        try {
          const params = new URLSearchParams({
            subreddit,
            after: String(after),
            before: String(before),
            limit: String(PAGE_SIZE),
            sort: "desc",
          });
          const body = (await fetchJson(`${ARCTIC}?${params}`)) as { data?: unknown };
          if (!body || !Array.isArray(body.data)) throw new Error("Invalid Arctic Shift response");
          posts.push(...body.data);
          // A short page means the window is exhausted.
          if (body.data.length < PAGE_SIZE) break;
          const oldest = Math.min(...body.data.map((p) => (p as RedditPost).created_utc));
          if (!Number.isFinite(oldest) || oldest <= after) break;
          before = oldest;
        } catch (error) {
          skipped.push(
            `r/${subreddit}: ${error instanceof Error ? error.message : "unknown error"}`,
          );
          break;
        }
      }
      try {
        candidates.push(...redditCandidates(subreddit, posts));
      } catch (error) {
        skipped.push(`r/${subreddit}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }
    return { candidates, skipped };
  }
}

// ---------------------------------------------------------------- Show HN (Algolia)

const HN = "https://hn.algolia.com/api/v1/search";

interface ShowHnHit {
  objectID: string;
  title: string;
  url?: string | null;
  points: number;
  num_comments: number;
  created_at: string;
}

function isShowHnHit(value: unknown): value is ShowHnHit {
  if (!value || typeof value !== "object") return false;
  const hit = value as Record<string, unknown>;
  return (
    typeof hit.objectID === "string" &&
    typeof hit.title === "string" &&
    (hit.url === undefined || hit.url === null || typeof hit.url === "string") &&
    finite(hit.points) !== undefined &&
    finite(hit.num_comments) !== undefined &&
    typeof hit.created_at === "string"
  );
}

export class ShowHnProducer implements CandidateProducer {
  readonly source = "showhn";

  async collect(at: Date): Promise<ProducerResult> {
    const from = Math.floor((at.getTime() - 30 * DAY) / 1000);
    // numericFilters is URL-encoded: sent raw, Algolia answers 400.
    const params = new URLSearchParams({
      tags: "show_hn",
      hitsPerPage: "100",
      numericFilters: `created_at_i>${from}`,
    });
    const body = (await fetchJson(`${HN}?${params}`)) as { hits?: unknown };
    if (!body || !Array.isArray(body.hits)) throw new Error("Invalid HN Algolia response");
    const candidates: RawCandidate[] = [];
    for (const hit of body.hits) {
      if (!isShowHnHit(hit)) throw new Error("Invalid Show HN hit");
      if (!hit.url) continue;
      const key = canonicalKey(hit.url);
      if (!key) continue;
      const link = `https://news.ycombinator.com/item?id=${hit.objectID}`;
      const date = isoDay(hit.created_at);
      candidates.push({
        name: hit.title.replace(/^Show HN:\s*/i, "").trim(),
        key,
        url: hit.url,
        source: "showhn",
        dataPoints: [
          ...point("showhn", "hn_points", hit.points, date, link),
          ...point("showhn", "hn_comments", hit.num_comments, date, link),
        ],
      });
    }
    return { candidates, skipped: [] };
  }
}

// ---------------------------------------------------------------- TrustMRR (revenue)

interface TrustMrrStartup {
  name: string;
  slug: string;
  url: string;
  website?: string | null;
  description?: string | null;
  category?: string | null;
  revenue?: { mrr?: unknown };
  growthMRR30d?: unknown;
}

export class TrustMrrProducer implements CandidateProducer {
  readonly source = "trustmrr";

  async collect(at: Date): Promise<ProducerResult> {
    const body = (await fetchJson("https://trustmrr.com/api/ai")) as Record<string, unknown>;
    if (!body || !Array.isArray(body.recentlyListedStartups) || !Array.isArray(body.bestDeals)) {
      throw new Error("Invalid TrustMRR response");
    }
    const seen = new Map<string, TrustMrrStartup>();
    for (const item of [...body.recentlyListedStartups, ...body.bestDeals] as TrustMrrStartup[]) {
      if (typeof item?.slug !== "string" || typeof item.name !== "string") {
        throw new Error("Invalid TrustMRR startup");
      }
      if (!seen.has(item.slug)) seen.set(item.slug, item);
    }
    const date = isoDay(at.getTime());
    const candidates: RawCandidate[] = [];
    for (const item of seen.values()) {
      // The product's own website is the merge key; the TrustMRR page is the proof link.
      const websiteKey = item.website ? canonicalKey(item.website) : null;
      candidates.push({
        name: item.name,
        key: websiteKey ?? `trustmrr:${item.slug}`,
        url: item.website || item.url,
        source: "trustmrr",
        dataPoints: [
          ...point("trustmrr", "mrr_usd", finite(item.revenue?.mrr), date, item.url),
          ...point("trustmrr", "growth_mrr_30d_pct", finite(item.growthMRR30d), date, item.url),
        ],
        ...(item.description ? { description: item.description.trim().slice(0, 300) } : {}),
        ...(item.category ? { category: item.category.trim() } : {}),
      });
    }
    return { candidates, skipped: [] };
  }
}

// ---------------------------------------------------------------- Apple top free (US, TR)

interface AppleEntry {
  id: string;
  name: string;
  url: string;
}

function isAppleEntry(value: unknown): value is AppleEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    /^\d+$/.test(entry.id) &&
    typeof entry.name === "string" &&
    typeof entry.url === "string"
  );
}

export class AppleTopFreeProducer implements CandidateProducer {
  readonly source = "apple";

  async collect(at: Date): Promise<ProducerResult> {
    const date = isoDay(at.getTime());
    const candidates: RawCandidate[] = [];
    const skipped: string[] = [];
    for (const [index, country] of ["us", "tr"].entries()) {
      if (index > 0) await sleep(DELAY_MS);
      try {
        const body = (await fetchJson(
          `https://rss.applemarketingtools.com/api/v2/${country}/apps/top-free/100/apps.json`,
        )) as { feed?: { results?: unknown } };
        const results = body?.feed?.results;
        if (!Array.isArray(results)) throw new Error("Invalid Apple chart");
        // Validate the whole chart before adding any of it, so a broken chart adds nothing.
        const entries = results.map((entry) => {
          if (!isAppleEntry(entry)) throw new Error("Invalid Apple chart entry");
          return entry;
        });
        entries.forEach((entry, rankIndex) => {
          candidates.push({
            name: entry.name,
            key: `apple:${entry.id}`,
            url: entry.url,
            source: "apple",
            dataPoints: point(
              "apple",
              `apple_${country}_top_free_rank`,
              rankIndex + 1,
              date,
              entry.url,
            ),
          });
        });
      } catch (error) {
        skipped.push(
          `Apple ${country.toUpperCase()}: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
    }
    return { candidates, skipped };
  }
}

export const PRODUCERS: readonly CandidateProducer[] = [
  new ProductHuntProducer(),
  new RedditProducer(),
  new ShowHnProducer(),
  new TrustMrrProducer(),
  new AppleTopFreeProducer(),
];
