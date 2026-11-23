export const candidatePool = [
  {
    type: "geliştirici aracı",
    trendSources: ["GitHub Search", "GitHub stargazers/history", "HN Algolia"],
    revenueSources: [],
    licenseNote:
      "Kişisel kullanım; repo lisansı ve HN bağlantıları ayrıca incelenir, kod ve marka kopyalanmaz.",
    query: "topic:developer-tools archived:false fork:false",
    hnQueries: ["developer", "AI tools"],
  },
  {
    type: "yapay zekâ modeli",
    trendSources: ["Hugging Face trendingScore"],
    revenueSources: [],
    licenseNote: "Kişisel kullanım; model lisansı ayrıca incelenir, kod ve marka kopyalanmaz.",
  },
] as const;

export interface WeeklyStars {
  week: number;
  total: number;
}

/** Sources whose API provides no weekly history rank by a current momentum score. */
export interface MomentumScore {
  value: number;
  label: string;
  evidence: string;
}

export interface CandidateSeries {
  name: string;
  description: string;
  url: string;
  historyUrl: string;
  weeks: WeeklyStars[];
  /** Snapshot metric name; defaults to weekly_new_stars (GitHub, #78 contract). */
  metric?: string;
  score?: MomentumScore;
}

// Separate from the frozen text-observation Adapter contract.
export interface MomentumCollector {
  collect(at: Date): Promise<CandidateSeries[]>;
  /** Optional count of entries dropped because they are not a product. */
  readonly excluded?: number;
  /** Optional per-item problems (e.g. rate-limited requests) that were skipped, not fatal. */
  readonly skipped?: string[];
}

const API = "https://api.github.com";
const WEEK = 7 * 86400;

export function completedWeeks(at: Date): number[] {
  const start = new Date(at);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return Array.from({ length: 4 }, (_, i) => start.getTime() / 1000 - (4 - i) * WEEK);
}

export class GitHubRateLimitError extends Error {}

export class GitHubMomentumCollector implements MomentumCollector {
  readonly skipped: string[] = [];

  constructor(
    private readonly query: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  private async json(path: string): Promise<unknown> {
    const headers: Record<string, string> = {
      accept: "application/vnd.github+json",
      "User-Agent": "StartupHunt/0.1",
      "X-GitHub-Api-Version": "2026-03-10",
    };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const response = await this.request(`${API}${path}`, {
      headers,
      signal: AbortSignal.timeout(30000),
    });
    if (response.status === 403 || response.status === 429) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      const reset = response.headers.get("x-ratelimit-reset");
      const retryAfter = response.headers.get("retry-after");
      const parts = [
        remaining !== null ? `kalan limit: ${remaining}` : null,
        reset ? `sıfırlanma: ${new Date(Number(reset) * 1000).toISOString()}` : null,
        retryAfter ? `Retry-After: ${retryAfter}s` : null,
        process.env.GITHUB_TOKEN ? null : "GITHUB_TOKEN yok",
      ].filter(Boolean);
      throw new GitHubRateLimitError(
        `GitHub HTTP ${response.status} (hız sınırı?): ${path} [${parts.join("; ")}]`,
      );
    }
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}: ${path}`);
    return response.json();
  }

  async collect(at: Date): Promise<CandidateSeries[]> {
    // shortcut: one 30-repo discovery page, expand only after this slice is calibrated.
    const params = new URLSearchParams({
      q: this.query,
      sort: "updated",
      order: "desc",
      per_page: "30",
    });
    const search = await this.json(`/search/repositories?${params}`);
    if (
      !search ||
      typeof search !== "object" ||
      !("items" in search) ||
      !Array.isArray(search.items) ||
      !("incomplete_results" in search) ||
      search.incomplete_results !== false
    ) {
      throw new Error("Invalid or incomplete GitHub Search response");
    }
    const result: CandidateSeries[] = [];
    let rateLimited = false;
    for (const repo of search.items) {
      if (rateLimited) continue;
      if (
        !repo ||
        typeof repo.full_name !== "string" ||
        !/^[\w.-]+\/[\w.-]+$/.test(repo.full_name) ||
        !(repo.description === null || typeof repo.description === "string")
      ) {
        throw new Error("Invalid GitHub repository");
      }
      const path = `/repos/${repo.full_name}/stargazers/history?per_page=5`;
      let history: unknown;
      try {
        history = await this.json(path);
      } catch (error) {
        if (!(error instanceof GitHubRateLimitError)) throw error;
        // The limit is per client, not per repo: stop calling, report once, keep what we have.
        rateLimited = true;
        this.skipped.push(
          `${repo.full_name} ve sonraki repolar denenmedi (${search.items.length - result.length} repo atlandı): ${error.message}`,
        );
        continue;
      }
      if (
        !Array.isArray(history) ||
        history.some(
          (w) =>
            !w ||
            !Number.isSafeInteger(w.week) ||
            w.week < 0 ||
            !Number.isSafeInteger(w.total) ||
            w.total < 0,
        )
      ) {
        throw new Error(`Invalid GitHub history: ${repo.full_name}`);
      }
      if (new Set(history.map((w) => w.week)).size !== history.length) {
        throw new Error(`Duplicate GitHub history weeks: ${repo.full_name}`);
      }
      const expected = completedWeeks(at);
      if (expected.some((week) => !history.some((w) => w.week === week))) {
        console.warn(`History incomplete, excluded: ${repo.full_name}`);
        continue;
      }
      const weeks = expected.map((week) => {
        const point = history.find((w) => w.week === week);
        // Missing history is unknown, never a fabricated zero.
        if (!point) throw new Error(`Incomplete four-week history: ${repo.full_name}`);
        return { week, total: point.total };
      });
      result.push({
        name: repo.full_name,
        description: repo.description ?? "",
        url: `https://github.com/${repo.full_name}`,
        historyUrl: `${API}${path}`,
        weeks,
      });
    }
    return result;
  }
}
