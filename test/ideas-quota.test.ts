import assert from "node:assert/strict";
import { test } from "node:test";
import type { Candidate } from "../src/candidates/model.js";
import { describe, previousSnapshotFile } from "../src/ideas/report.js";
import {
  DEFAULT_QUOTA,
  isNoise,
  isTrendLed,
  rankCandidates,
  readSnapshot,
  scoreCandidate,
  trendSignals,
} from "../src/ideas/rank.js";

const DATE = "2026-11-23";
const point = (
  source: string,
  metric: string,
  value: number,
  url = `https://${source}.test/${metric}`,
) => ({
  source,
  metric,
  value,
  date: DATE,
  url,
});
const candidate = (
  key: string,
  name: string,
  sources: string[],
  dataPoints: ReturnType<typeof point>[],
  extra: Partial<Candidate> = {},
): Candidate => ({ key, name, url: `https://${key}.app`, sources, dataPoints, ...extra });

/** 20 revenue-only products with very large MRR: by score alone they fill the whole top 20. */
function revenueOnly(count: number): Candidate[] {
  return Array.from({ length: count }, (_, index) =>
    candidate(
      `rev${index}`,
      `Revenue ${index}`,
      ["trustmrr"],
      [point("trustmrr", "mrr_usd", 50000 - index), point("trustmrr", "growth_mrr_30d_pct", 20)],
      { description: "a real product" },
    ),
  );
}

/** Single-source Show HN launches above the trend threshold (100 points), no revenue. */
function trendOnly(count: number, offset = 0): Candidate[] {
  return Array.from({ length: count }, (_, index) =>
    candidate(
      `hn${offset + index}`,
      `Launch ${offset + index}`,
      ["showhn"],
      [point("showhn", "hn_points", 100 + index), point("showhn", "hn_comments", 10)],
    ),
  );
}

test("quota: without a quota the revenue cards would fill the top 20 (baseline)", () => {
  const input = [...revenueOnly(20), ...trendOnly(10)];
  const scored = rankCandidates(input, new Map(), { limit: 20, minTrend: 0, minRevenue: 0 });
  assert.equal(scored.length, 20);
  assert.equal(scored.filter((entry) => entry.labels.includes("trend")).length, 0);
});

test("quota: top 20 holds at least 8 trend-led and 8 revenue-led cards", () => {
  const ranked = rankCandidates([...revenueOnly(20), ...trendOnly(10)]);
  assert.equal(DEFAULT_QUOTA.limit, 20);
  assert.equal(ranked.length, 20);
  const trend = ranked.filter((entry) => entry.labels.includes("trend"));
  const revenue = ranked.filter((entry) => entry.labels.includes("gelir"));
  assert.equal(trend.length, 8);
  assert.equal(revenue.length, 12);
  assert.ok(trend.length >= 8 && revenue.length >= 8);
  // Every card carries at least one label.
  assert.ok(ranked.every((entry) => entry.labels.length > 0));
  // Output stays ordered by score, not by quota group.
  for (let index = 1; index < ranked.length; index += 1) {
    assert.ok(ranked[index - 1]!.score.total >= ranked[index]!.score.total);
  }
});

test("quota: a short kind is reported as short, not padded with the other kind", () => {
  const ranked = rankCandidates([...revenueOnly(20), ...trendOnly(3)]);
  assert.equal(ranked.length, 20);
  assert.equal(ranked.filter((entry) => entry.labels.includes("trend")).length, 3);
});

test("quota: a card with both labels counts toward both minimums", () => {
  const both = candidate(
    "both",
    "Both",
    ["trustmrr", "showhn"],
    [
      point("trustmrr", "mrr_usd", 1000),
      point("showhn", "hn_points", 150),
      point("showhn", "hn_comments", 20),
    ],
    { description: "a real product" },
  );
  const ranked = rankCandidates([both]);
  assert.deepEqual(ranked[0]!.labels, ["trend", "gelir"]);
  assert.equal(ranked.length, 1);
});

test("quota: jokes and HN one-offs with no product URL never reach the list", () => {
  const joke = candidate(
    "joke",
    "Steal My Bitcoin",
    ["showhn"],
    [point("showhn", "hn_points", 900), point("showhn", "hn_comments", 300)],
  );
  const hnOwn = candidate(
    "hnown",
    "Ask-style post",
    ["showhn"],
    [point("showhn", "hn_points", 900), point("showhn", "hn_comments", 300)],
    { url: "https://news.ycombinator.com/item?id=9" },
  );
  assert.ok(isNoise(joke));
  assert.equal(isTrendLed(hnOwn), false);
  assert.deepEqual(rankCandidates([joke, hnOwn]), []);
});

test("trend-led: multi-source with a real URL, or one strong observation", () => {
  const multi = candidate(
    "m",
    "Multi",
    ["producthunt", "apple"],
    [point("producthunt", "ph_feed_position", 40), point("apple", "apple_tr_top_free_rank", 90)],
  );
  const weakSingle = candidate(
    "w",
    "Weak",
    ["reddit"],
    [point("reddit", "reddit_score", 5), point("reddit", "reddit_comments", 1)],
  );
  const strongReddit = candidate(
    "r",
    "Strong",
    ["reddit"],
    [point("reddit", "reddit_score", 25), point("reddit", "reddit_comments", 1)],
  );
  assert.equal(isTrendLed(multi), true);
  // Regression: a lone Apple chart rank 21-50 (Gmail, Amazon Shopping in the live run) is not a trend card.
  const gmail = candidate(
    "google",
    "Gmail",
    ["apple"],
    [point("apple", "apple_us_top_free_rank", 23), point("apple", "apple_tr_top_free_rank", 21)],
    { url: "https://apps.apple.com/us/app/gmail/id422689480" },
  );
  assert.equal(isTrendLed(gmail), false);
  assert.equal(isTrendLed(weakSingle), false);
  assert.equal(isTrendLed(strongReddit), true);
});

test("trend section: only trend metrics, with their links and the Show HN date", () => {
  const signals = trendSignals(
    candidate(
      "t",
      "T",
      ["trustmrr", "showhn"],
      [
        point("trustmrr", "mrr_usd", 1000, "https://trustmrr.test/t"),
        point("showhn", "hn_points", 180, "https://news.ycombinator.com/item?id=5"),
      ],
    ),
  );
  assert.deepEqual(
    signals.map((p) => [p.metric, p.value, p.date, p.url]),
    [["hn_points", 180, DATE, "https://news.ycombinator.com/item?id=5"]],
  );
});

test("momentum: first observation, unchanged, and changed metrics are distinguished", () => {
  const snapshot = readSnapshot({
    candidates: [
      { key: "k", dataPoints: [{ metric: "hn_points", value: 300 }] },
      { key: "other", dataPoints: [{ metric: "reddit_score", value: 10 }] },
    ],
  });
  const risen = scoreCandidate(
    candidate(
      "k",
      "K",
      ["showhn"],
      [point("showhn", "hn_points", 350), point("showhn", "hn_comments", 9)],
    ),
    snapshot,
  );
  const dropped = scoreCandidate(
    candidate("k", "K", ["showhn"], [point("showhn", "hn_points", 250)]),
    snapshot,
  );
  const unchanged = scoreCandidate(
    candidate("k", "K", ["showhn"], [point("showhn", "hn_points", 300)]),
    snapshot,
  );
  const newcomer = scoreCandidate(
    candidate("n", "N", ["showhn"], [point("showhn", "hn_points", 300)]),
    snapshot,
  );
  const noCommon = scoreCandidate(
    candidate("other", "O", ["reddit"], [point("reddit", "reddit_comments", 3)]),
    snapshot,
  );
  assert.equal(risen.momentum, "hn_points 300→350");
  assert.ok(risen.score.momentum > 0);
  assert.equal(dropped.momentum, "hn_points 300→250");
  assert.equal(dropped.score.momentum, 0);
  assert.equal(unchanged.momentum, "değişim yok");
  assert.equal(newcomer.momentum, "ilk gözlem");
  assert.equal(noCommon.momentum, "ortak metrik yok");
});

test("momentum: with no earlier snapshot every card is an ilk gözlem", () => {
  const ranked = rankCandidates([...revenueOnly(2), ...trendOnly(9)]);
  assert.ok(ranked.length > 0);
  assert.ok(ranked.every((entry) => entry.momentum === "ilk gözlem"));
});

test("momentum: rank drops on a chart count as rises; the snapshot is the run's previous day", () => {
  const snapshot = readSnapshot({
    candidates: [{ key: "a", dataPoints: [{ metric: "apple_us_top_free_rank", value: 40 }] }],
  });
  const climbed = scoreCandidate(
    candidate("a", "A", ["apple"], [point("apple", "apple_us_top_free_rank", 20)]),
    snapshot,
  );
  assert.equal(climbed.score.momentum, 0.5);
  assert.equal(climbed.momentum, "apple_us_top_free_rank 40→20");
});

test("snapshot file: the newest earlier day, never the run's own file", () => {
  const files = [
    "2026-11-20.json",
    "2026-11-22.json",
    "2026-11-23.json",
    "latest.json",
    "ideas.json",
  ];
  assert.equal(previousSnapshotFile(files, "2026-11-23"), "2026-11-22.json");
  assert.equal(previousSnapshotFile(["2026-11-23.json", "latest.json"], "2026-11-23"), null);
  assert.equal(
    previousSnapshotFile(["ideas.md", "2026-11-21.json"], "2026-11-23"),
    "2026-11-21.json",
  );
});

test("ne olduğu: a Reddit title is shown as written, with the product host, no LLM", () => {
  const reddit = candidate(
    "conv.example",
    "I built a free app that converts foreign prices with your camera",
    ["reddit"],
    [point("reddit", "reddit_score", 37), point("reddit", "reddit_comments", 24)],
    { url: "https://www.converter.example/app" },
  );
  assert.equal(
    describe(reddit),
    "Reddit başlığı: free app that converts foreign prices with your camera (converter.example)",
  );
});
