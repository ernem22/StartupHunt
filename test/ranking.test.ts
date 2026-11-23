import assert from "node:assert/strict";
import { test } from "node:test";
import type { Candidate } from "../src/candidates/model.js";
import { isNoise, rankCandidates, readSnapshot, scoreCandidate } from "../src/ideas/rank.js";
import { describe, gapLabel, renderMarkdown, revenueEvidence } from "../src/ideas/report.js";
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
    ["trustmrr", "showhn", "reddit"],
    [
      point("trustmrr", "mrr_usd", 1000),
      point("showhn", "hn_points", 10),
      point("reddit", "reddit_score", 5),
    ],
  );
  const loudSingle = candidate(
    "b",
    "Loud",
    ["showhn"],
    [point("showhn", "hn_points", 500), point("showhn", "hn_comments", 100)],
  );
  const ranked = rankCandidates([loudSingle, multi]);
  assert.deepEqual(
    ranked.map((entry) => entry.candidate.key),
    ["a", "b"],
  );
  assert.ok(ranked[0]!.score.sources >= 6);
});

test("ranking: MRR growth and PH position are normalized, negative growth adds nothing", () => {
  const growing = scoreCandidate(
    candidate(
      "g",
      "Growing",
      ["trustmrr"],
      [point("trustmrr", "mrr_usd", 1000), point("trustmrr", "growth_mrr_30d_pct", 100)],
    ),
  );
  const shrinking = scoreCandidate(
    candidate(
      "s",
      "Shrinking",
      ["trustmrr"],
      [point("trustmrr", "mrr_usd", 1000), point("trustmrr", "growth_mrr_30d_pct", -100)],
    ),
  );
  assert.ok(growing.score.signals > shrinking.score.signals);
  const top = scoreCandidate(
    candidate("p1", "Top", ["producthunt"], [point("producthunt", "ph_feed_position", 1)]),
  );
  const bottom = scoreCandidate(
    candidate("p2", "Bottom", ["producthunt"], [point("producthunt", "ph_feed_position", 50)]),
  );
  assert.ok(top.score.signals > bottom.score.signals);
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
  assert.match(improved.momentumDetail!, /apple_us_top_free_rank 40→20/);
});

test("ranking: noise filter drops anonymous and store-giant rows, keeps small apps", () => {
  const anonymous = candidate(
    "x",
    "Anonymous startup",
    ["trustmrr"],
    [point("trustmrr", "mrr_usd", 1)],
  );
  const giant = candidate("y", "ChatGPT", ["apple"], [point("apple", "apple_us_top_free_rank", 2)]);
  const small = candidate(
    "z",
    "Niş uygulama",
    ["apple"],
    [point("apple", "apple_us_top_free_rank", 80)],
  );
  assert.ok(isNoise(anonymous));
  assert.ok(isNoise(giant));
  assert.equal(isNoise(small), false);
  assert.deepEqual(
    rankCandidates([anonymous, giant, small]).map((entry) => entry.candidate.key),
    ["z"],
  );
});

test("ranking: ties are deterministic regardless of input order", () => {
  const a = candidate("a", "Alpha", ["reddit"], [point("reddit", "reddit_score", 10)]);
  const b = candidate("b", "Beta", ["reddit"], [point("reddit", "reddit_score", 10)]);
  assert.deepEqual(
    rankCandidates([a, b]).map((entry) => entry.candidate.key),
    rankCandidates([b, a]).map((entry) => entry.candidate.key),
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
  assert.match(revenueEvidence(c), /MRR \$1527.*30g büyüme 30%.*trustmrr\.com/);
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
  const md = renderMarkdown({
    generatedAt: "2026-11-23",
    sourceFile: "data/latest.json",
    snapshotFile: null,
    ideas: [
      {
        rank: 1,
        key: "a",
        name: "A",
        url: "https://x",
        whatItIs: "AI tool",
        category: null,
        sources: ["showhn"],
        score: { sources: 0, signals: 1, momentum: 0, total: 1 },
        momentum: null,
        dataPoints: [point("showhn", "hn_points", 5, "https://news.ycombinator.com/item?id=1")],
        revenueEvidence: "aranmadı",
        tr: { ...gapVerdict(verdict("not_found")), queries: ["sorgu"], evidence: [] },
      },
    ],
  });
  assert.match(md, /TR boşluğu: boş/);
  assert.match(md, /hn_points: \*\*5\*\*.*news\.ycombinator\.com/);
});

function gapVerdict(v: TrVerdict) {
  return {
    verdict: v.verdict,
    reason: v.reason,
    queries: v.queries,
    evidence: v.evidence.map((e) => ({
      name: e.name,
      channel: e.channel,
      url: e.url,
      ...(e.ratingCount === undefined ? {} : { ratingCount: e.ratingCount }),
    })),
    gapLabel: gapLabel(v),
  };
}
