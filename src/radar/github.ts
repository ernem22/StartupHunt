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
];

export interface WeeklyStars {
  week: number;
  total: number;
}

export interface CandidateSeries {
  name: string;
  description: string;
  url: string;
  historyUrl: string;
  weeks: WeeklyStars[];
}

// Separate from the frozen text-observation Adapter contract.
export interface MomentumCollector {
  collect(at: Date): Promise<CandidateSeries[]>;
}

const API = "https://api.github.com";
const WEEK = 7 * 86400;

export function completedWeeks(at: Date): number[] {
  const start = new Date(at);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return Array.from({ length: 4 }, (_, i) => start.getTime() / 1000 - (4 - i) * WEEK);
}

export class GitHubMomentumCollector implements MomentumCollector {
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
    for (const repo of search.items) {
      if (
        !repo ||
        typeof repo.full_name !== "string" ||
        !/^[\w.-]+\/[\w.-]+$/.test(repo.full_name) ||
        !(repo.description === null || typeof repo.description === "string")
      ) {
        throw new Error("Invalid GitHub repository");
      }
      const path = `/repos/${repo.full_name}/stargazers/history?per_page=5`;
      const history = await this.json(path);
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
