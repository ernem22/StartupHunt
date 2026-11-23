import assert from "node:assert/strict";
import { test } from "node:test";
import type { Candidate } from "../src/candidates/model.js";
import { shortProductName, shortTrQueries } from "../src/ideas/names.js";
import { isNoise, readSnapshot, scoreCandidate, selectTop } from "../src/ideas/rank.js";
import {
  describe,
  gapLabel,
  renderMarkdown,
  revenueEvidence,
  toIdea,
} from "../src/ideas/report.js";
import { parsePlayRating } from "../src/tr/channels.js";
import type { TrVerdict } from "../src/tr/check.js";

const point = (source: string, metric: string, value: number, url = "https://x") => ({
  source,
  metric,
  value,
  date: "2026-11-23",
  url,
});

const candidate = (
  key: string,
  name: string,
  sources: string[],
  dataPoints: ReturnType<typeof point>[],
  extra: Partial<Candidate> = {},
): Candidate => ({ key, name, url: "https://x", sources, dataPoints, ...extra });

test("ranking: cross-source presence outweighs any single-source signal", () => {
  const multi = candidate(
    "a",
    "Multi",
    ["trustmrr", "producthunt", "reddit"],
    [
      point("trustmrr", "mrr_usd", 1000),
      point("producthunt", "ph_feed_position", 30),
      point("reddit", "reddit_score", 5),
    ],
    { url: "https://multi.app" },
  );
  const strongSingle = candidate(
    "b",
    "Strong",
    ["reddit"],
    [point("reddit", "reddit_score", 90), point("reddit", "reddit_comments", 40)],
    { url: "https://strong.app" },
  );
  const ranked = selectTop([strongSingle, multi]);
  assert.deepEqual(
    ranked.map((entry) => entry.candidate.key),
    ["a", "b"],
  );
  assert.ok(ranked[0]!.score.trend >= 2);
});

test("ranking: top PH feed position outranks a low one", () => {
  const top = scoreCandidate(
    candidate("p1", "Top", ["producthunt"], [point("producthunt", "ph_feed_position", 1)], {
      url: "https://top.app",
    }),
  );
  const bottom = scoreCandidate(
    candidate("p2", "Bottom", ["producthunt"], [point("producthunt", "ph_feed_position", 9)], {
      url: "https://bottom.app",
    }),
  );
  assert.ok(top.score.trend > bottom.score.trend);
});

test("ranking: revenue is not a trend signal; a revenue-only row is left out of the list", () => {
  const revenueRow = candidate(
    "g",
    "Growing",
    ["trustmrr"],
    [point("trustmrr", "mrr_usd", 1000000), point("trustmrr", "growth_mrr_30d_pct", 900)],
    { url: "https://growing.app" },
  );
  const trendRow = candidate(
    "t",
    "Trend",
    ["reddit"],
    [point("reddit", "reddit_score", 25), point("reddit", "reddit_comments", 3)],
    {
      url: "https://trend.app",
    },
  );
  const revenue = scoreCandidate(revenueRow);
  assert.equal(revenue.score.trend, 0);
  assert.equal("revenue" in revenue.score, false);
  assert.deepEqual(
    selectTop([revenueRow, trendRow]).map((entry) => entry.candidate.key),
    ["t"],
  );
});

test("ranking: momentum from previous snapshot rewards rank drops and metric growth", () => {
  const snapshot = readSnapshot({
    candidates: [
      {
        key: "a",
        dataPoints: [
          { metric: "apple_us_top_free_rank", value: 40 },
          { metric: "reddit_score", value: 10 },
        ],
      },
      { key: "b", dataPoints: [{ metric: "reddit_score", value: 100 }] },
    ],
  });
  const improved = scoreCandidate(
    candidate(
      "a",
      "A",
      ["apple", "reddit"],
      [point("apple", "apple_us_top_free_rank", 20), point("reddit", "reddit_score", 40)],
    ),
    snapshot,
  );
  const declined = scoreCandidate(
    candidate("b", "B", ["reddit"], [point("reddit", "reddit_score", 50)]),
    snapshot,
  );
  assert.ok(improved.score.momentum > 0);
  assert.equal(declined.score.momentum, 0);
  assert.match(improved.momentum, /apple_us_top_free_rank 40→20/);
  assert.equal(declined.momentum, "reddit_score 100→50");
  assert.equal(
    scoreCandidate(candidate("c", "C", ["reddit"], [point("reddit", "reddit_score", 1)])).momentum,
    "ilk gözlem",
  );
});

test("ranking: noise filter drops anonymous and store-giant rows, keeps small apps", () => {
  const anonymous = candidate(
    "x",
    "Anonymous startup",
    ["trustmrr"],
    [point("trustmrr", "mrr_usd", 1)],
  );
  const giant = candidate(
    "y",
    "ChatGPT",
    ["apple"],
    [
      point("apple", "apple_us_top_free_rank", 2),
      point("apple", "apple_us_days_since_release", 4000),
    ],
    { url: "https://apps.apple.com/y" },
  );
  const small = candidate(
    "z",
    "Niş uygulama",
    ["apple", "trustmrr"],
    [
      point("apple", "apple_us_top_free_rank", 30),
      point("apple", "apple_us_days_since_release", 90),
      point("trustmrr", "mrr_usd", 100),
    ],
    { url: "https://small.app" },
  );
  assert.ok(isNoise(anonymous));
  assert.ok(isNoise(giant));
  assert.equal(isNoise(small), false);
  assert.deepEqual(
    selectTop([anonymous, giant, small]).map((entry) => entry.candidate.key),
    ["z"],
  );
});

test("ranking: ties are deterministic regardless of input order", () => {
  const points = [point("reddit", "reddit_score", 50), point("reddit", "reddit_comments", 2)];
  const a = candidate("a", "Alpha", ["reddit"], points, { url: "https://alpha.app" });
  const b = candidate("b", "Beta", ["reddit"], points, { url: "https://beta.app" });
  assert.deepEqual(
    selectTop([a, b]).map((entry) => entry.candidate.key),
    selectTop([b, a]).map((entry) => entry.candidate.key),
  );
});

test("report: revenue fallback, description, TR gap labels and markdown links", () => {
  const c = candidate(
    "a",
    "A",
    ["trustmrr"],
    [
      point("trustmrr", "mrr_usd", 1527, "https://trustmrr.com/startup/a"),
      point("trustmrr", "growth_mrr_30d_pct", 30, "https://trustmrr.com/startup/a"),
    ],
    { description: "AI marketing tool for solo developers" },
  );
  assert.equal(describe(c), "AI marketing tool for solo developers");
  assert.match(revenueEvidence(c), /MRR \$1527.*MRR 30g büyümesi 30%.*trustmrr\.com/);
  assert.equal(
    revenueEvidence(candidate("b", "B", ["showhn"], [point("showhn", "hn_points", 4)])),
    "aranmadı",
  );

  const base = { reason: "gerekçe", queries: ["sorgu"], evidence: [] };
  const verdict = (v: TrVerdict["verdict"], ratingCount?: number): TrVerdict => ({
    ...base,
    verdict: v,
    ...(ratingCount === undefined
      ? {}
      : {
          evidence: [
            {
              channel: "apple_tr" as const,
              name: "Rakip",
              id: "1",
              ratingCount,
              url: "https://apple",
            },
          ],
        }),
  });
  assert.equal(gapLabel(verdict("not_found")), "boş");
  assert.equal(gapLabel(verdict("uncertain")), "belirsiz");
  assert.equal(gapLabel(verdict("found", 2)), "zayıf");
  assert.equal(gapLabel(verdict("found", 500)), "dolu");

  const entry = scoreCandidate(
    candidate(
      "h",
      "A",
      ["showhn"],
      [point("showhn", "hn_points", 5, "https://news.ycombinator.com/item?id=1")],
      {
        url: "https://a.app",
        description: "A small tool",
      },
    ),
  );
  const idea = toIdea(entry, 1, verdict("not_found"));
  const md = renderMarkdown({
    generatedAt: "2026-11-23",
    sourceFile: "data/latest.json",
    snapshotFile: null,
    ideas: [idea],
  });
  assert.match(md, /TR boşluğu: boş/);
  assert.match(md, /hn_points: \*\*5\*\*.*news\.ycombinator\.com/);
  assert.match(md, /Neden bu sırada:\*\* trend /);
});

test("names: long Show HN headlines become short product names and short TR queries", () => {
  assert.equal(
    shortProductName("HackerBooks – HackerTube, but for books mentioned on HN"),
    "HackerBooks",
  );
  assert.equal(shortProductName("Show HN: Screeny: Mockup & Product Demo"), "Screeny");
  assert.equal(
    shortProductName("Every satellite that passed over any place this week, and its photos"),
    "Every satellite",
  );
  const queries = shortTrQueries(
    shortProductName("HackerBooks – HackerTube, but for books mentioned on HN"),
    "A site that lists books mentioned on Hacker News with discussions and reviews",
  );
  assert.deepEqual(queries, ["HackerBooks", "HackerBooks lists books"]);
  assert.ok(queries.every((query) => query.length < 60));
  assert.equal(shortTrQueries("Screeny", undefined).length, 1);
});

test("Play rating parser: accepts explicit counts, ignores average scores and missing data", () => {
  assert.equal(parsePlayRating('<div itemprop="ratingCount" content="1,234"></div>'), 1234);
  assert.equal(parsePlayRating('<span>"ratingCount":987</span>'), 987);
  assert.equal(parsePlayRating("<span>4,3 değerlendirme</span>"), undefined);
  assert.equal(parsePlayRating("<div>no rating here</div>"), undefined);
});

test("ranking: low-signal HN posts (under the trend threshold) are excluded", () => {
  const good = Array.from({ length: 12 }, (_, index) =>
    candidate(
      `g${index}`,
      `Product ${index}`,
      ["reddit"],
      [point("reddit", "reddit_score", 30), point("reddit", "reddit_comments", 4)],
      { url: `https://product${index}.com`, description: "a real web product" },
    ),
  );
  const weak = Array.from({ length: 6 }, (_, index) =>
    candidate(
      `w${index}`,
      `Wikihack ${index}`,
      ["showhn"],
      [point("showhn", "hn_points", 20), point("showhn", "hn_comments", 5)],
      { url: `https://wiki${index}.example` },
    ),
  );
  const ranked = selectTop([...weak, ...good]);
  assert.equal(ranked.length, 12);
  assert.ok(ranked.every((entry) => entry.candidate.key.startsWith("g")));
  assert.ok(ranked.every((entry) => entry.labels.includes("trend")));
});
