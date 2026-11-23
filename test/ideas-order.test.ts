import assert from "node:assert/strict";
import { test } from "node:test";
import type { Candidate } from "../src/candidates/model.js";
import type { TrVerdict } from "../src/tr/check.js";
import {
  isNoise,
  isTrendLed,
  LIST_SIZE,
  readSnapshot,
  scoreCandidate,
  selectTop,
  trendSignals,
} from "../src/ideas/rank.js";
import { previousSnapshotFile, toIdea } from "../src/ideas/report.js";

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

const verdict = (v: TrVerdict["verdict"], ratingCount?: number): TrVerdict => ({
  verdict: v,
  reason: "test",
  queries: ["q"],
  evidence:
    ratingCount === undefined
      ? []
      : [{ channel: "apple_tr", name: "Rival", id: "1", ratingCount, url: "https://apple" }],
});

/** Strong Reddit launches (trend) and revenue-only TrustMRR rows with very large MRR. */
function fixture(): Candidate[] {
  const trend = Array.from({ length: 25 }, (_, index) =>
    candidate(
      `t${index}`,
      `Launch ${index}`,
      ["reddit"],
      [point("reddit", "reddit_score", 20 + index * 10), point("reddit", "reddit_comments", 5)],
    ),
  );
  const revenue = Array.from({ length: 25 }, (_, index) =>
    candidate(
      `r${index}`,
      `Revenue ${index}`,
      ["trustmrr"],
      [point("trustmrr", "mrr_usd", 90000 - index), point("trustmrr", "growth_mrr_30d_pct", 20)],
      { description: "a real product" },
    ),
  );
  return [...revenue, ...trend];
}

test("order: TR never changes the order; different verdicts keep the same ranks", () => {
  const ranked = selectTop(fixture());
  const keys = ranked.map((entry) => entry.candidate.key);
  const asDusty = ranked.map((entry, index) => toIdea(entry, index + 1, verdict("found", 500)));
  const asEmpty = ranked.map((entry, index) => toIdea(entry, index + 1, verdict("not_found")));
  assert.deepEqual(
    asDusty.map((idea) => idea.key),
    keys,
  );
  assert.deepEqual(
    asEmpty.map((idea) => idea.key),
    keys,
  );
  // "dolu" stays in the list and is only labelled.
  assert.equal(asDusty[0]!.tr.gapLabel, "dolu");
  assert.equal(asDusty.length, ranked.length);
});

test("order: no label quota; the list is ordered by global trend strength and capped", () => {
  const ranked = selectTop(fixture());
  assert.equal(ranked.length, LIST_SIZE);
  for (let index = 1; index < ranked.length; index += 1) {
    assert.ok(ranked[index - 1]!.score.base >= ranked[index]!.score.base);
  }
  // Revenue-only rows have no trend number and never enter; the cap is the only limit.
  assert.ok(ranked.every((entry) => entry.labels.includes("trend")));
  assert.ok(ranked.every((entry) => entry.candidate.sources[0] === "reddit"));
});

test("order: a very strong trend card stays on top even if its TR market is saturated", () => {
  const hot = candidate(
    "hot",
    "Hot",
    ["reddit", "producthunt"],
    [point("reddit", "reddit_score", 400), point("producthunt", "ph_feed_position", 1)],
    { url: "https://hot.app" },
  );
  const cool = candidate("cool", "Cool", ["reddit"], [point("reddit", "reddit_score", 25)], {
    url: "https://cool.app",
  });
  const ranked = selectTop([cool, hot]);
  assert.equal(ranked[0]!.candidate.key, "hot");
  // Saturation is a label on the card, not an input to the order.
  const first = toIdea(ranked[0]!, 1, verdict("found", 900));
  assert.equal(first.tr.gapLabel, "dolu");
  assert.equal(first.rank, 1);
});

test("HN toys: 'but for', X-for-Y and media clones are dropped even with huge points", () => {
  const toy = (name: string) =>
    candidate(
      name,
      name,
      ["showhn"],
      [point("showhn", "hn_points", 1870), point("showhn", "hn_comments", 300)],
      { url: "https://toy.example", description: "Like YouTube, but for books" },
    );
  assert.ok(isNoise(toy("HackerBooks – HackerTube, but for books mentioned on HN")));
  assert.ok(isNoise(toy("Hacker Times, a New York Times-inspired version of Hacker News")));
  assert.ok(isNoise(toy("Cornhole-for-Teams")));
  assert.ok(isNoise(toy("Hackertv")));
});

test("HN: a Show HN post is trend-led only with its own product description", () => {
  const withDescription = candidate(
    "realhn",
    "Ledger Tool",
    ["showhn"],
    [point("showhn", "hn_points", 180), point("showhn", "hn_comments", 30)],
    { url: "https://ledger.example", description: "Double-entry bookkeeping for freelancers" },
  );
  const titleOnly = candidate(
    "titleonly",
    "Ledger Tool",
    ["showhn"],
    [point("showhn", "hn_points", 180), point("showhn", "hn_comments", 30)],
    { url: "https://ledger.example" },
  );
  assert.equal(isTrendLed(withDescription), true);
  assert.equal(isTrendLed(titleOnly), false);
  assert.deepEqual(
    selectTop([titleOnly, withDescription]).map((entry) => entry.candidate.key),
    ["realhn"],
  );
});

test("Apple: a new app in the US top-free chart is trend-led; an old brand is not", () => {
  const newApp = candidate(
    "new",
    "Fresh App",
    ["apple"],
    [
      point("apple", "apple_us_top_free_rank", 23),
      point("apple", "apple_us_days_since_release", 60),
    ],
    { url: "https://apps.apple.com/us/app/fresh/id1" },
  );
  const oldBrand = candidate(
    "old",
    "Gmail",
    ["apple"],
    [
      point("apple", "apple_us_top_free_rank", 23),
      point("apple", "apple_us_days_since_release", 6000),
    ],
    { url: "https://apps.apple.com/us/app/gmail/id2" },
  );
  assert.equal(isTrendLed(newApp), true);
  assert.equal(isTrendLed(oldBrand), false);
  assert.deepEqual(
    selectTop([oldBrand, newApp]).map((entry) => entry.candidate.key),
    ["new"],
  );
});

test("Apple TR rank is shown as data but does not feed the trend order", () => {
  const usOnly = candidate(
    "u",
    "App",
    ["apple"],
    [
      point("apple", "apple_us_top_free_rank", 30),
      point("apple", "apple_us_days_since_release", 90),
    ],
    { url: "https://apps.apple.com/us/app/app/id3" },
  );
  const withTr = candidate(
    "u",
    "App",
    ["apple"],
    [
      point("apple", "apple_us_top_free_rank", 30),
      point("apple", "apple_us_days_since_release", 90),
      point("apple", "apple_tr_top_free_rank", 3),
    ],
    { url: "https://apps.apple.com/us/app/app/id3" },
  );
  assert.equal(scoreCandidate(usOnly).score.trend, scoreCandidate(withTr).score.trend);
  assert.ok(trendSignals(withTr).some((p) => p.metric === "apple_tr_top_free_rank"));
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

test("momentum: first observation, unchanged, changed and no-common-metric are distinguished", () => {
  const snapshot = readSnapshot({
    candidates: [
      { key: "k", dataPoints: [{ metric: "reddit_score", value: 300 }] },
      { key: "other", dataPoints: [{ metric: "reddit_score", value: 10 }] },
    ],
  });
  const risen = scoreCandidate(
    candidate("k", "K", ["reddit"], [point("reddit", "reddit_score", 350)]),
    snapshot,
  );
  const unchanged = scoreCandidate(
    candidate("k", "K", ["reddit"], [point("reddit", "reddit_score", 300)]),
    snapshot,
  );
  const newcomer = scoreCandidate(
    candidate("n", "N", ["reddit"], [point("reddit", "reddit_score", 300)]),
    snapshot,
  );
  const noCommon = scoreCandidate(
    candidate("other", "O", ["reddit"], [point("reddit", "reddit_comments", 3)]),
    snapshot,
  );
  assert.equal(risen.momentum, "reddit_score 300→350");
  assert.ok(risen.score.momentum > 0);
  assert.equal(unchanged.momentum, "değişim yok");
  assert.equal(newcomer.momentum, "ilk gözlem");
  assert.equal(noCommon.momentum, "ortak metrik yok");
});

test("momentum: a chart rank drop counts as a rise, scaled by the places gained", () => {
  const snapshot = readSnapshot({
    candidates: [{ key: "a", dataPoints: [{ metric: "ph_feed_position", value: 8 }] }],
  });
  const climbed = scoreCandidate(
    candidate("a", "A", ["producthunt"], [point("producthunt", "ph_feed_position", 3)]),
    snapshot,
  );
  // 5 places: log10(6) / log10(101) = 0.39
  assert.equal(climbed.score.momentum, 0.39);
  assert.equal(climbed.momentum, "ph_feed_position 8→3");
  const snapshotFar = readSnapshot({
    candidates: [{ key: "a", dataPoints: [{ metric: "ph_feed_position", value: 60 }] }],
  });
  const climbedFar = scoreCandidate(
    candidate("a", "A", ["producthunt"], [point("producthunt", "ph_feed_position", 3)]),
    snapshotFar,
  );
  assert.ok(climbedFar.score.momentum > climbed.score.momentum);
});

test("Product Hunt: a feed position alone is not a card; with a second source it counts", () => {
  // The feed order is a straight line, not a trend number: a PH-only row never enters the list.
  const alone = candidate(
    "ph1",
    "Top Launch",
    ["producthunt"],
    [point("producthunt", "ph_feed_position", 1)],
    { url: "https://www.producthunt.com/products/top-launch" },
  );
  assert.deepEqual(selectTop([alone]), []);
  const withReddit = candidate(
    "ph2",
    "Second Launch",
    ["producthunt", "reddit"],
    [
      point("producthunt", "ph_feed_position", 1),
      point("reddit", "reddit_score", 30),
      point("reddit", "reddit_comments", 4),
    ],
    { url: "https://second.app" },
  );
  const [entry] = selectTop([withReddit, alone]);
  assert.equal(entry!.candidate.key, "ph2");
  assert.ok(entry!.score.parts.some((part) => part.label === "PH sırası"));
});

test("tie-break: equal base scores are ordered by name; revenue never breaks a tie", () => {
  const zed = candidate(
    "z",
    "Zed",
    ["reddit"],
    [
      point("reddit", "reddit_score", 30),
      point("reddit", "reddit_comments", 4),
      point("trustmrr", "mrr_usd", 90000),
    ],
    { url: "https://zed.app" },
  );
  const alpha = candidate(
    "a",
    "Alpha",
    ["reddit"],
    [
      point("reddit", "reddit_score", 30),
      point("reddit", "reddit_comments", 4),
      point("trustmrr", "mrr_usd", 9000),
    ],
    { url: "https://alpha.app" },
  );
  assert.deepEqual(
    selectTop([zed, alpha]).map((entry) => entry.candidate.key),
    ["a", "z"],
  );
});

test("GitHub stars: a repo with enough new stars in 7 days is trend-led; revenue-only rows are not", () => {
  const repo = candidate(
    "github:acme/tool",
    "Acme Tool",
    ["showhn"],
    [
      point("showhn", "hn_points", 40),
      point("github", "github_stars_7d", 120, "https://github.com/acme/tool/stargazers"),
    ],
    { url: "https://github.com/acme/tool", description: "a developer tool" },
  );
  const quiet = candidate(
    "github:acme/quiet",
    "Quiet",
    ["showhn"],
    [
      point("showhn", "hn_points", 40),
      point("github", "github_stars_7d", 3, "https://github.com/acme/quiet/stargazers"),
    ],
    { url: "https://github.com/acme/quiet", description: "a developer tool" },
  );
  const revenue = candidate("rev.app", "Rev", ["trustmrr"], [point("trustmrr", "mrr_usd", 500)], {
    url: "https://rev.app",
  });
  const ranked = selectTop([repo, quiet, revenue]);
  assert.deepEqual(
    ranked.map((entry) => entry.candidate.key),
    ["github:acme/tool"],
  );
  // log10(121) / log10(10001) = 0.52; the Show HN points part is the other real number.
  assert.ok(
    ranked[0]!.score.parts.some(
      (part) => part.label === "GitHub yıldız (7g)" && part.value === 0.52,
    ),
  );
});
