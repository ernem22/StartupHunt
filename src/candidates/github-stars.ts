import { DELAY_MS, fetchResponse, isoDay, sleep } from "./http.js";
import type { Candidate, DataPoint } from "./model.js";

// New stars in the last 7 UTC days, from the same stargazers/history endpoint the radar's GitHub
// collector uses (per-day counts, weeks start on Sunday). The standard stargazers list answers 404
// here, so it is not used. The history endpoint is undocumented: a failure is recorded, never guessed.
const API = "https://api.github.com";
const DAY_MS = 86400_000;
const WINDOW_DAYS = 7;

export interface StarWeek {
  /** Start of the week, Unix seconds (UTC, Sunday). */
  week: number;
  total: number;
  /** Stars per day, index 0 = the week's first day. */
  days: number[];
}

/** owner/repo for a `github:owner/repo` candidate key; null for any other key. */
export function repoOfKey(key: string): string | null {
  const repo = key.startsWith("github:") ? key.slice("github:".length) : "";
  return /^[\w.-]+\/[\w.-]+$/.test(repo) ? repo : null;
}

function isStarWeek(value: unknown): value is StarWeek {
  if (!value || typeof value !== "object") return false;
  const week = value as Record<string, unknown>;
  return (
    typeof week.week === "number" &&
    Number.isFinite(week.week) &&
    typeof week.total === "number" &&
    Array.isArray(week.days) &&
    week.days.length === 7 &&
    week.days.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

/**
 * Stars received on the last `days` UTC days, today included. A day counts when its start falls
 * inside the window; the partial current day counts with what it has so far.
 */
export function starsInLastDays(weeks: readonly StarWeek[], at: Date, days = WINDOW_DAYS): number {
  const today = Math.floor(at.getTime() / DAY_MS) * DAY_MS;
  const first = today - (days - 1) * DAY_MS;
  let count = 0;
  for (const week of weeks) {
    const start = week.week * 1000;
    week.days.forEach((stars, index) => {
      const dayStart = start + index * DAY_MS;
      if (dayStart >= first && dayStart <= today) count += stars;
    });
  }
  return count;
}

/** New stars in the window for one repo; one request covers the two weeks the window can span. */
export async function fetchWeeklyStars(
  repo: string,
  at: Date,
  token: string | undefined,
): Promise<number> {
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : {};
  const response = await fetchResponse(
    `${API}/repos/${repo}/stargazers/history?per_page=2`,
    "application/json",
    headers,
  );
  const body = (await response.json()) as unknown;
  if (!Array.isArray(body) || !body.every(isStarWeek)) {
    throw new Error(`Invalid GitHub star history: ${repo}`);
  }
  return starsInLastDays(body, at);
}

export interface GitHubStarsRun {
  candidates: Candidate[];
  skipped: string[];
}

/**
 * Adds `github_stars_7d` to every merged candidate whose key is a GitHub repo. A repo that fails
 * is recorded in `skipped` and keeps its other data points; the run is never aborted.
 */
export async function enrichGithubStars(
  candidates: readonly Candidate[],
  at: Date,
  token: string | undefined,
): Promise<GitHubStarsRun> {
  const skipped: string[] = [];
  const date = isoDay(at.getTime());
  const out: Candidate[] = [];
  let requested = false;
  for (const candidate of candidates) {
    const repo = repoOfKey(candidate.key);
    if (!repo) {
      out.push(candidate);
      continue;
    }
    if (requested) await sleep(DELAY_MS);
    requested = true;
    try {
      const value = await fetchWeeklyStars(repo, at, token);
      const point: DataPoint = {
        source: "github",
        metric: "github_stars_7d",
        value,
        date,
        url: `https://github.com/${repo}/stargazers`,
      };
      out.push({ ...candidate, dataPoints: [...candidate.dataPoints, point] });
    } catch (error) {
      skipped.push(
        `GitHub yıldız ${repo}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      out.push(candidate);
    }
  }
  return { candidates: out, skipped };
}
