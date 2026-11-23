import type { Candidate } from "../candidates/model.js";

export type ScoreBreakdown = {
  sources: number;
  signals: number;
  momentum: number;
  total: number;
};

export type RankedCandidate = {
  candidate: Candidate;
  score: ScoreBreakdown;
  momentumDetail: string | null;
};

export type PreviousSnapshot = Map<string, Map<string, number>>;

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

/** Giants in the top-20 of a store chart are not fast-follower ideas; neither are point-less rows. */
export function isNoise(candidate: Candidate): boolean {
  if (NOISE.some((pattern) => pattern.test(candidate.name.trim()))) return true;
  const numeric = candidate.dataPoints.filter((point) => Number.isFinite(point.value));
  if (numeric.length === 0) return true;
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

function logSignal(value: number, scale: number): number {
  return Math.log10(1 + Math.max(0, value)) / Math.log10(1 + scale);
}

export function scoreCandidate(
  candidate: Candidate,
  snapshot: PreviousSnapshot = new Map(),
): RankedCandidate {
  const sourceScore = 3 * Math.max(0, candidate.sources.length - 1);
  let signals = 0;
  for (const point of candidate.dataPoints) {
    const value = point.value;
    if (!Number.isFinite(value)) continue;
    switch (point.metric) {
      case "hn_points":
        signals += Math.min(1.5, logSignal(value, 300));
        break;
      case "hn_comments":
        signals += Math.min(0.5, logSignal(value, 100) * 0.5);
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
  let momentumDetail: string | null = null;
  const previous = snapshot.get(candidate.key);
  if (previous) {
    const parts: string[] = [];
    for (const point of candidate.dataPoints) {
      const before = previous.get(point.metric);
      if (before === undefined || !Number.isFinite(before) || before === point.value) continue;
      const delta = point.value - before;
      if (point.metric === "ph_feed_position" || point.metric.endsWith("_rank")) {
        if (delta < 0) momentum += 0.5;
        parts.push(`${point.metric} ${before}→${point.value}`);
      } else if (delta > 0) {
        momentum += Math.min(1, logSignal(delta, Math.max(1, Math.abs(before))));
        parts.push(`${point.metric} ${before}→${point.value}`);
      }
    }
    if (parts.length > 0) momentumDetail = parts.slice(0, 3).join(", ");
  }

  const total = sourceScore + signals + momentum;
  return {
    candidate,
    score: {
      sources: round(sourceScore),
      signals: round(signals),
      momentum: round(momentum),
      total: round(total),
    },
    momentumDetail,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Deterministic: score desc, then source count desc, then name; ties never depend on input order. */
export function rankCandidates(
  candidates: readonly Candidate[],
  snapshot: PreviousSnapshot = new Map(),
  limit = 15,
): RankedCandidate[] {
  return candidates
    .filter((candidate) => !isNoise(candidate))
    .map((candidate) => scoreCandidate(candidate, snapshot))
    .sort(
      (a, b) =>
        b.score.total - a.score.total ||
        b.candidate.sources.length - a.candidate.sources.length ||
        a.candidate.name.localeCompare(b.candidate.name, "en"),
    )
    .slice(0, limit);
}
