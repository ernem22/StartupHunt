import { completedWeeks, type CandidateSeries, type MomentumCollector } from "./github.js";

// Separate from the frozen text-observation Adapter contract.
// HN is a candidate-producing source: weekly story counts per product domain.
const API = "https://hn.algolia.com/api/v1/search_by_date";
const WEEK = 7 * 86400;
const HITS_PER_PAGE = 1000;
interface Hit {
  objectID: string | number;
  created_at: string;
  title?: string | null;
  url?: string | null;
}

function isHit(value: unknown): value is Hit {
  if (!value || typeof value !== "object") return false;
  const hit = value as Record<string, unknown>;
  const validId = typeof hit.objectID === "string" || Number.isSafeInteger(hit.objectID as number);
  const validCreated =
    typeof hit.created_at === "string" && !Number.isNaN(Date.parse(hit.created_at));
  const validTitle = hit.title === null || hit.title === undefined || typeof hit.title === "string";
  const validUrl = hit.url === null || hit.url === undefined || typeof hit.url === "string";
  return validId && validCreated && validTitle && validUrl;
}

function identify(raw: string): { name: string; url: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!host) return null;
  if (host === "github.com") {
    const match = /^\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/|$)/.exec(parsed.pathname);
    if (match && match[1] !== "features" && match[1] !== "topics") {
      const name = `${match[1]}/${match[2]}`;
      return { name, url: `https://github.com/${name}` };
    }
  }
  return { name: host, url: `https://${host}` };
}

function windowUrl(queries: readonly string[], from: number, to: number, perPage?: number): string {
  const params = new URLSearchParams({
    query: queries.join(" | "),
    tags: "story",
    numericFilters: `created_at_i>=${from},created_at_i<${to}`,
  });
  if (perPage !== undefined) params.set("hitsPerPage", String(perPage));
  return `${API}?${params}`;
}

export class HackerNewsMomentumCollector implements MomentumCollector {
  constructor(
    private readonly queries: readonly string[],
    private readonly request: typeof fetch = fetch,
  ) {}

  private async json(url: string): Promise<unknown> {
    const response = await this.request(url, {
      headers: { "User-Agent": "StartupHunt/0.1" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`HN Algolia HTTP ${response.status}`);
    return response.json();
  }

  async collect(at: Date): Promise<CandidateSeries[]> {
    const weeks = completedWeeks(at);
    const from = weeks[0]!;
    const to = weeks[3]! + WEEK;
    const sourceUrl = windowUrl(this.queries, from, to);
    const hits = new Map<string, Hit>();
    for (const query of this.queries) {
      const body = await this.json(windowUrl([query], from, to, HITS_PER_PAGE));
      if (
        !body ||
        typeof body !== "object" ||
        !("hits" in body) ||
        !Array.isArray(body.hits) ||
        !("nbHits" in body) ||
        !Number.isSafeInteger(body.nbHits) ||
        (body.nbHits as number) < 0
      ) {
        throw new Error("Invalid HN Algolia response");
      }
      // A truncated page would silently drop candidates; fail instead of publishing partial data.
      if ((body.nbHits as number) > body.hits.length) {
        throw new Error(`HN Algolia response truncated: ${query}`);
      }
      for (const hit of body.hits) {
        if (!isHit(hit)) throw new Error("Invalid HN Algolia hit");
        const key = String(hit.objectID);
        if (!hits.has(key)) hits.set(key, hit);
      }
    }

    interface Acc {
      name: string;
      url: string;
      description: string;
      descriptionAt: number;
      counts: number[];
    }
    const byKey = new Map<string, Acc>();
    for (const hit of hits.values()) {
      const created = Date.parse(hit.created_at) / 1000;
      const index = Math.floor((created - from) / WEEK);
      if (index < 0 || index > 3) continue;
      if (!hit.url) continue; // Ask HN/self posts carry no product link.
      const product = identify(hit.url);
      if (!product) continue;
      const title = hit.title ?? "";
      let acc = byKey.get(product.name);
      if (!acc) {
        acc = {
          ...product,
          description: title,
          descriptionAt: created,
          counts: [0, 0, 0, 0],
        };
        byKey.set(product.name, acc);
      } else if (title && created >= acc.descriptionAt) {
        acc.description = title;
        acc.descriptionAt = created;
      }
      acc.counts[index]! += 1;
    }

    return [...byKey.values()].map((acc) => ({
      name: acc.name,
      description: acc.description,
      url: acc.url,
      historyUrl: sourceUrl,
      // A zero week is observed (no stories), not missing data.
      weeks: weeks.map((week, i) => ({ week, total: acc.counts[i]! })),
    }));
  }
}
