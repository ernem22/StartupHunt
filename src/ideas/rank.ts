import type { Candidate, DataPoint } from "../candidates/model.js";
import { shortProductName } from "./names.js";

export type Label = "trend" | "gelir";

export type ScoreBreakdown = {
  sources: number;
  revenue: number;
  product: number;
  quality: number;
  signals: number;
  momentum: number;
  total: number;
};

export type RankedCandidate = {
  candidate: Candidate;
  score: ScoreBreakdown;
  labels: Label[];
  /** "ilk gözlem" when no earlier snapshot holds this product; otherwise the metric changes. */
  momentum: string;
};

export type Quota = { limit: number; minTrend: number; minRevenue: number };

export const DEFAULT_QUOTA: Quota = { limit: 20, minTrend: 8, minRevenue: 8 };

export type PreviousSnapshot = Map<string, Map<string, number>>;

/** Metrics that describe trend interest (rank, points, score). Revenue metrics are not trend signals. */
export const TREND_METRICS: readonly string[] = [
  "ph_feed_position",
  "apple_us_top_free_rank",
  "apple_tr_top_free_rank",
  "hn_points",
  "hn_comments",
  "reddit_score",
  "reddit_comments",
];

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

/** One-off HN jokes and non-product posts are not fast-follower ideas. */
const NON_PRODUCT = [
  /\bsteal my\b/i,
  /\b(?:ask|tell) (?:hn|hacker news)\b/i,
  /\b(?:am i the only one|anyone else|tifu|showerthought)\b/i,
  /\b(?:meme|joke|parody|satire)\b/i,
];

/** Links to social networks, media and code hosts are not the product's own URL. */
export function hasProductUrl(candidate: Candidate): boolean {
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

/** Giants in the top-20 of a store chart are not fast-follower ideas; neither are point-less rows. */
export function isNoise(candidate: Candidate): boolean {
  if (NOISE.some((pattern) => pattern.test(candidate.name.trim()))) return true;
  if (NON_PRODUCT.some((pattern) => pattern.test(candidate.name))) return true;
  const numeric = candidate.dataPoints.filter((point) => Number.isFinite(point.value));
  // Every idea card must be backed by at least two numeric observations.
  if (numeric.length < 2) return true;
  const onlyApple = candidate.sources.length === 1 && candidate.sources[0] === "apple";
  return (
    onlyApple &&
    numeric.some(
      (point) =>
        (point.metric === "apple_us_top_free_rank" || point.metric === "apple_tr_top_free_rank") &&
        point.value <= 20,
    )
  );
}

/** A single observation strong enough to make a one-source product a trend card. */
function isStrongSignal(point: DataPoint): boolean {
  switch (point.metric) {
    case "hn_points":
      return point.value >= 100;
    case "reddit_score":
      return point.value >= 20;
    // PH feed order is the only PH number (no vote counts): the top 10 of the feed.
    case "ph_feed_position":
      return point.value <= 10;
    // Apple ranks alone are not strong: ranks 21-50 of top-free are mostly big brands (Gmail, Amazon).
    // A single top-20 Apple row is already dropped as noise, so Apple counts only with another source.
    default:
      return false;
  }
}

export function trendSignals(candidate: Candidate): DataPoint[] {
  return candidate.dataPoints.filter((point) => TREND_METRICS.includes(point.metric));
}

/** Trend-led: a real product URL plus either several sources or one strong trend observation. */
export function isTrendLed(candidate: Candidate): boolean {
  if (!hasProductUrl(candidate)) return false;
  if (candidate.sources.length >= 2) return true;
  return candidate.dataPoints.some(isStrongSignal);
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

export function scoreCandidate(
  candidate: Candidate,
  snapshot: PreviousSnapshot = new Map(),
): RankedCandidate {
  const sourceScore = 3 * Math.max(0, candidate.sources.length - 1);
  const revenueScore = isRevenueLed(candidate) ? 3 : 0;
  const productScore =
    (hasProductUrl(candidate) ? 0.5 : -0.5) +
    (candidate.description ? 0.5 : 0) +
    (shortProductName(candidate.name).split(" ").length > 5 ? -0.5 : 0);
  let signals = 0;
  for (const point of candidate.dataPoints) {
    const value = point.value;
    if (!Number.isFinite(value)) continue;
    switch (point.metric) {
      case "hn_points":
        // HN interest alone is weak evidence; a single-source Show HN post needs other signals.
        signals += Math.min(1, logSignal(value, 300)) * (candidate.sources.length === 1 ? 0.5 : 1);
        break;
      case "hn_comments":
        signals +=
          Math.min(0.5, logSignal(value, 100) * 0.5) * (candidate.sources.length === 1 ? 0.5 : 1);
        break;
      case "reddit_score":
        signals += Math.min(1, logSignal(value, 100));
        break;
      case "reddit_comments":
        signals += Math.min(0.5, logSignal(value, 50) * 0.5);
        break;
      case "mrr_usd":
        signals += Math.min(1.5, logSignal(value, 10000));
        break;
      case "growth_mrr_30d_pct":
        signals += Math.min(1, Math.max(0, value) / 100);
        break;
      case "ph_feed_position":
        signals += Math.max(0, 1 - value / 50);
        break;
      case "apple_us_top_free_rank":
      case "apple_tr_top_free_rank":
        signals += Math.max(0, 1 - value / 100) * 0.5;
        break;
    }
  }

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
        // A lower rank number is a rise in the chart.
        if (delta < 0) momentum += 0.5;
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

  const total = sourceScore + revenueScore + productScore + signals + momentum;
  return {
    candidate,
    labels: labelsOf(candidate),
    score: {
      sources: round(sourceScore),
      revenue: round(revenueScore),
      product: round(productScore),
      quality: round(sourceScore + revenueScore + productScore),
      signals: round(signals),
      momentum: round(momentum),
      total: round(total),
    },
    momentum: momentumText,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function byScore(a: RankedCandidate, b: RankedCandidate): number {
  return (
    b.score.total - a.score.total ||
    b.candidate.sources.length - a.candidate.sources.length ||
    a.candidate.name.localeCompare(b.candidate.name, "en")
  );
}

/**
 * Quota: the top `limit` must hold at least `minTrend` trend-led and `minRevenue` revenue-led
 * cards. The best of each kind are reserved first (a card can count for both), the rest fill by score.
 * A kind with fewer candidates than its minimum is simply short; the caller reports the counts.
 */
export function selectWithQuota(
  sorted: readonly RankedCandidate[],
  quota: Quota,
): RankedCandidate[] {
  const trend = sorted.filter((entry) => entry.labels.includes("trend"));
  const revenue = sorted.filter((entry) => entry.labels.includes("gelir"));
  const chosen = new Set<RankedCandidate>([
    ...trend.slice(0, quota.minTrend),
    ...revenue.slice(0, quota.minRevenue),
  ]);
  for (const entry of sorted) {
    if (chosen.size >= quota.limit) break;
    chosen.add(entry);
  }
  return sorted.filter((entry) => chosen.has(entry)).slice(0, quota.limit);
}

/** Deterministic: score desc, then source count desc, then name; ties never depend on input order. */
export function rankCandidates(
  candidates: readonly Candidate[],
  snapshot: PreviousSnapshot = new Map(),
  quota: Quota = DEFAULT_QUOTA,
): RankedCandidate[] {
  // Low-signal rows (neither trend-led nor revenue-led) never reach the list.
  const eligible = candidates.filter(
    (candidate) => !isNoise(candidate) && labelsOf(candidate).length > 0,
  );
  const sorted = eligible.map((candidate) => scoreCandidate(candidate, snapshot)).sort(byScore);
  return selectWithQuota(sorted, quota);
}
