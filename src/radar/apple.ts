import type { CandidateSeries } from "./github.js";

export type TrStatusKind = "bulundu" | "bulunamadı" | "belirsiz";

export interface TrMatch {
  name: string;
  url: string;
}

export interface TrStatus {
  status: TrStatusKind;
  queries: string[];
  catalog: string;
  match?: TrMatch;
  note?: string;
}

export interface TrCatalog {
  readonly catalog: string;
  lookup(candidate: CandidateSeries): Promise<TrStatus>;
}

const ENDPOINT = "https://itunes.apple.com/search";
const CATALOG = "Apple iTunes Search (country=tr, entity=software)";
const MIN_REQUEST_INTERVAL_MS = 1000;

type Delay = (ms: number) => Promise<void>;

const sleep: Delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "your",
  "from",
  "that",
  "this",
  "are",
  "tool",
  "tools",
  "app",
  "apps",
  "official",
  "open",
  "source",
  "based",
  "using",
]);

function normalized(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(value: string): string[] {
  return normalized(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function meaningful(token: string): boolean {
  return token.length >= 3 && !STOPWORDS.has(token);
}

export function trQueries(candidate: CandidateSeries): string[] {
  const repo = candidate.name.split("/").pop() ?? candidate.name;
  const repoQuery = repo.replace(/[._-]+/g, " ").trim();
  const description = tokens(candidate.description).filter(meaningful).slice(0, 5).join(" ");
  const seen = new Set<string>();
  return [repoQuery, description].filter((query) => {
    if (query.length < 2) return false;
    const key = normalized(query);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matches(query: string, trackName: string): boolean {
  const wanted = new Set(tokens(query).filter(meaningful));
  if (wanted.size === 0) return false;
  const found = new Set(tokens(trackName));
  return [...wanted].every((token) => found.has(token));
}

interface AppleHit {
  trackName: string;
  trackViewUrl: string;
}

function parseHits(body: unknown): AppleHit[] {
  if (!body || typeof body !== "object") throw new Error("Malformed Apple response");
  const record = body as Record<string, unknown>;
  if (
    !Number.isSafeInteger(record.resultCount) ||
    (record.resultCount as number) < 0 ||
    !Array.isArray(record.results)
  ) {
    throw new Error("Malformed Apple response");
  }
  return record.results
    .filter((hit): hit is Record<string, unknown> => Boolean(hit) && typeof hit === "object")
    .filter(
      (hit): hit is { trackName: string; trackViewUrl: string } =>
        typeof hit.trackName === "string" && typeof hit.trackViewUrl === "string",
    )
    .map((hit) => ({ trackName: hit.trackName, trackViewUrl: hit.trackViewUrl }));
}

export class AppleTrCatalog implements TrCatalog {
  readonly catalog = CATALOG;
  private nextRequestAt = 0;

  constructor(
    private readonly request: typeof fetch = fetch,
    private readonly delay: Delay = sleep,
    private readonly now: () => number = Date.now,
  ) {}

  private async pace(): Promise<void> {
    const wait = this.nextRequestAt - this.now();
    if (wait > 0) await this.delay(wait);
    this.nextRequestAt = this.now() + MIN_REQUEST_INTERVAL_MS;
  }

  private async search(query: string): Promise<AppleHit[]> {
    await this.pace();
    const params = new URLSearchParams({
      term: query,
      country: "tr",
      entity: "software",
      limit: "5",
    });
    const response = await this.request(`${ENDPOINT}?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Apple HTTP ${response.status}`);
    return parseHits(await response.json());
  }

  async lookup(candidate: CandidateSeries): Promise<TrStatus> {
    const queries = trQueries(candidate);
    if (queries.length === 0) {
      return { status: "belirsiz", queries, catalog: CATALOG, note: "sorgu üretilemedi" };
    }
    const attempted: string[] = [];
    for (const query of queries) {
      attempted.push(query);
      try {
        const hits = await this.search(query);
        const match = hits.find((hit) => matches(query, hit.trackName));
        if (match) {
          return {
            status: "bulundu",
            queries: [...attempted],
            catalog: CATALOG,
            match: { name: match.trackName, url: match.trackViewUrl },
          };
        }
      } catch (error) {
        return {
          status: "belirsiz",
          queries: [...attempted],
          catalog: CATALOG,
          note: error instanceof Error ? error.message : "katalog hatası",
        };
      }
    }
    return { status: "bulunamadı", queries: attempted, catalog: CATALOG };
  }
}
