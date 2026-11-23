import type { Candidate, DataPoint } from "../candidates/model.js";

export type Label = "trend" | "gelir";

/** Final list length. A shorter list is fine; padding with jokes is not. */
export const LIST_SIZE = 20;

/** One named part of the trend strength, shown on the card next to the total. */
export type TrendPart = { label: string; value: number };

export type Score = {
  /** Global trend strength: the sum of `parts`. */
  trend: number;
  /** Rank or metric change against the previous day's snapshot. */
  momentum: number;
  /** trend + momentum, before the TR gap. Revenue is not part of the score. */
  base: number;
  parts: TrendPart[];
};

export type RankedCandidate = {
  candidate: Candidate;
  score: Score;
  labels: Label[];
  /** "ilk gözlem" when no earlier snapshot holds this product; otherwise the metric changes. */
  momentum: string;
};

export type PreviousSnapshot = Map<string, Map<string, number>>;

/** Metrics that describe trend interest. Revenue metrics are not trend signals. */
export const TREND_METRICS: readonly string[] = [
  "ph_feed_position",
  "apple_us_top_free_rank",
  "apple_tr_top_free_rank",
  "apple_us_days_since_release",
  "hn_points",
  "hn_comments",
  "reddit_score",
  "reddit_comments",
  "github_stars_7d",
];

/** New GitHub stars in the last 7 days that make a repo trend-led on its own. */
export const GITHUB_STRONG_STARS_7D = 50;

/** Loads numeric points from a previous data/YYYY-MM-DD.json snapshot, keyed by candidate key then metric. */
export function readSnapshot(value: unknown): PreviousSnapshot {
  const snapshot: PreviousSnapshot = new Map();
  if (!value || typeof value !== "object") return snapshot;
  const candidates = (value as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return snapshot;
  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const key = (item as { key?: unknown }).key;
    const points = (item as { dataPoints?: unknown }).dataPoints;
    if (typeof key !== "string" || !Array.isArray(points)) continue;
    const metrics = new Map<string, number>();
    for (const point of points) {
      if (!point || typeof point !== "object") continue;
      const metric = (point as { metric?: unknown }).metric;
      const number = (point as { value?: unknown }).value;
      if (typeof metric === "string" && typeof number === "number" && Number.isFinite(number)) {
        // Later observations overwrite earlier ones; the last value is the latest one.
        metrics.set(metric, number);
      }
    }
    snapshot.set(key, metrics);
  }
  return snapshot;
}

const NOISE = [
  /^anonymous startup$/i,
  /^stealth(?: mode)?$/i,
  /^untitled/i,
  /^test(?: app| project)?$/i,
  /\bagency\b/i,
];

/** Jokes, toys and clones of media sites that show up as Show HN posts. Not product ideas. */
const NON_PRODUCT = [
  /\bsteal my\b/i,
  /\b(?:ask|tell) (?:hn|hacker news)\b/i,
  /\b(?:am i the only one|anyone else|tifu|showerthought)\b/i,
  /\b(?:meme|joke|parody|satire)\b/i,
];

/** Show HN toys and clones: "X, but for Y" and "X-for-Y" headlines (HackerTube, HackerTV, ...). */
const HN_TOY = [/\bbut for\b/i, /\b\w+-for-\w+\b/i, /\bhacker\s?(?:tube|tv|times|books)\b/i];

/** Links to social networks, media and code hosts are not the product's own URL. */
export function hasProductUrl(candidate: Candidate): boolean {
  // A GitHub repo is the product's own page for developer tools (its stars are the trend numbers).
  if (candidate.key.startsWith("github:")) return true;
  try {
    const url = new URL(candidate.url);
    if (!/^https?:$/.test(url.protocol)) return false;
    return !/^(?:www\.)?(?:twitter\.com|x\.com|facebook\.com|instagram\.com|linkedin\.com|reddit\.com|news\.ycombinator\.com|youtube\.com|medium\.com|substack\.com|github\.com|hackernews\.com)$/.test(
      url.hostname,
    );
  } catch {
    return false;
  }
}

function appleNewRelease(candidate: Candidate): boolean {
  return candidate.dataPoints.some(
    (p) => p.metric === "apple_us_days_since_release" && p.value <= 365,
  );
}

function isHnOnly(candidate: Candidate): boolean {
  return candidate.sources.length === 1 && candidate.sources[0] === "showhn";
}

/** Giants in the top-20 of a store chart are not fast-follower ideas unless the app is new. */
export function isNoise(candidate: Candidate): boolean {
  if (NOISE.some((pattern) => pattern.test(candidate.name.trim()))) return true;
  if (NON_PRODUCT.some((pattern) => pattern.test(candidate.name))) return true;
  if (isHnOnly(candidate) && HN_TOY.some((pattern) => pattern.test(candidate.name))) return true;
  const numeric = candidate.dataPoints.filter((point) => Number.isFinite(point.value));
  // Every idea card must be backed by at least two numeric observations.
  if (numeric.length < 2) return true;
  const onlyApple = candidate.sources.length === 1 && candidate.sources[0] === "apple";
  return (
    onlyApple &&
    !appleNewRelease(candidate) &&
    numeric.some(
      (point) =>
        (point.metric === "apple_us_top_free_rank" || point.metric === "apple_tr_top_free_rank") &&
        point.value <= 20,
    )
  );
}

/** A single observation strong enough to make a one-source product trend-led. */
function isStrongSignal(point: DataPoint): boolean {
  switch (point.metric) {
    case "reddit_score":
      return point.value >= 20;
    default:
      return false;
  }
}

export function trendSignals(candidate: Candidate): DataPoint[] {
  return candidate.dataPoints.filter((point) => TREND_METRICS.includes(point.metric));
}

function githubStarsStrong(candidate: Candidate): boolean {
  return candidate.dataPoints.some(
    (p) => p.metric === "github_stars_7d" && p.value >= GITHUB_STRONG_STARS_7D,
  );
}

/**
 * Trend-led: a real product URL and either several sources, a new app in the US top-free chart
 * (rank <= 50, released within a year), a strong Reddit observation, or a GitHub repo that
 * gained enough stars in the last 7 days. A Show HN post counts only with its own product
 * description; the HN title alone is not enough.
 */
export function isTrendLed(candidate: Candidate): boolean {
  if (!hasProductUrl(candidate)) return false;
  if (candidate.sources.length >= 2) return true;
  if (githubStarsStrong(candidate)) return true;
  if (isHnOnly(candidate)) {
    return Boolean(candidate.description) && candidate.dataPoints.some(isHnStrong);
  }
  const usRank = candidate.dataPoints.find((p) => p.metric === "apple_us_top_free_rank");
  if (usRank && usRank.value <= 50 && appleNewRelease(candidate)) return true;
  return candidate.dataPoints.some(isStrongSignal);
}

function isHnStrong(point: DataPoint): boolean {
  return point.metric === "hn_points" && point.value >= 100;
}

export function isRevenueLed(candidate: Candidate): boolean {
  return candidate.dataPoints.some((point) => point.metric === "mrr_usd");
}

export function labelsOf(candidate: Candidate): Label[] {
  return [
    ...(isTrendLed(candidate) ? (["trend"] as const) : []),
    ...(isRevenueLed(candidate) ? (["gelir"] as const) : []),
  ];
}

function logSignal(value: number, scale: number): number {
  return Math.log10(1 + Math.max(0, value)) / Math.log10(1 + scale);
}

/**
 * Named parts of a candidate's trend strength, each from one real number (or the source count).
 * Zero parts are dropped. TR chart ranks are shown on the card but add nothing here.
 */
export function trendParts(candidate: Candidate): TrendPart[] {
  const parts: TrendPart[] = [];
  const add = (label: string, value: number) => {
    if (value > 0) parts.push({ label, value: round(value) });
  };
  add("kaynak uyumu", Math.max(0, candidate.sources.length - 1));
  for (const point of candidate.dataPoints) {
    const value = point.value;
    if (!Number.isFinite(value)) continue;
    switch (point.metric) {
      case "ph_feed_position":
        add("PH sırası", Math.max(0, 1 - value / 20));
        break;
      case "apple_us_top_free_rank":
        add("Apple US sırası", Math.max(0, 1 - value / 100));
        break;
      case "apple_us_days_since_release":
        add("uygulama yaşı", value <= 30 ? 1 : value <= 180 ? 0.5 : value <= 365 ? 0.25 : 0);
        break;
      case "hn_points":
        // Only a Show HN post with its own product description adds trend weight.
        if (candidate.description) add("HN puanı", Math.min(1, logSignal(value, 300)));
        break;
      case "hn_comments":
        if (candidate.description) add("HN yorumu", Math.min(0.5, logSignal(value, 100) * 0.5));
        break;
      case "reddit_score":
        add("Reddit skoru", Math.min(1, logSignal(value, 100)));
        break;
      case "reddit_comments":
        add("Reddit yorumu", Math.min(0.5, logSignal(value, 50) * 0.5));
        break;
      case "github_stars_7d":
        // Log scale saturating at 10 000 new stars a week; a 500 cap made every busy repo tie at 1.
        add("GitHub yıldız (7g)", Math.min(1, logSignal(value, 10000)));
        break;
    }
  }
  return parts;
}

export function scoreCandidate(
  candidate: Candidate,
  snapshot: PreviousSnapshot = new Map(),
): RankedCandidate {
  const parts = trendParts(candidate);
  const trend = parts.reduce((sum, part) => sum + part.value, 0);

  let momentum = 0;
  let momentumText: string;
  const previous = snapshot.get(candidate.key);
  if (!previous) {
    momentumText = "ilk gözlem";
  } else {
    const parts: string[] = [];
    let compared = 0;
    for (const point of candidate.dataPoints) {
      const before = previous.get(point.metric);
      if (before === undefined) continue;
      compared += 1;
      if (before === point.value) continue;
      parts.push(`${point.metric} ${before}→${point.value}`);
      const delta = point.value - before;
      if (point.metric === "ph_feed_position" || point.metric.endsWith("_rank")) {
        // A lower rank number is a rise in the chart; the places gained scale like a count.
        if (delta < 0) momentum += Math.min(1, logSignal(-delta, 100));
      } else if (delta > 0) {
        momentum += Math.min(1, logSignal(delta, Math.max(1, Math.abs(before))));
      }
    }
    momentumText =
      compared === 0
        ? "ortak metrik yok"
        : parts.length === 0
          ? "değişim yok"
          : parts.slice(0, 3).join(", ");
  }

  return {
    candidate,
    labels: labelsOf(candidate),
    score: {
      trend: round(trend),
      momentum: round(momentum),
      base: round(trend + momentum),
      parts,
    },
    momentum: momentumText,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function byBase(a: RankedCandidate, b: RankedCandidate): number {
  return (
    b.score.base - a.score.base ||
    b.candidate.sources.length - a.candidate.sources.length ||
    a.candidate.name.localeCompare(b.candidate.name, "en")
  );
}

/**
 * Ranking uses global trend strength and momentum only. TR is checked afterwards for the chosen
 * cards and never changes the order. Eligible: not noise and trend-led, i.e. it carries at least
 * one real trend number with its link. Revenue-only rows are left out.
 */
export function selectTop(
  candidates: readonly Candidate[],
  snapshot: PreviousSnapshot = new Map(),
  size = LIST_SIZE,
): RankedCandidate[] {
  return candidates
    .filter((candidate) => !isNoise(candidate) && isTrendLed(candidate))
    .map((candidate) => scoreCandidate(candidate, snapshot))
    .sort(byBase)
    .slice(0, size);
}
