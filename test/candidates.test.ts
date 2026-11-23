import assert from "node:assert/strict";
import { test } from "node:test";
import { collectCandidates } from "../src/candidates/run.js";
import { canonicalKey } from "../src/candidates/key.js";
import { mergeCandidates } from "../src/candidates/merge.js";
import type { RawCandidate } from "../src/candidates/model.js";
import {
  parseProductHuntFeed,
  redditCandidates,
  type CandidateProducer,
} from "../src/candidates/sources.js";

const at = new Date("2026-11-23T12:00:00Z");

function raw(
  overrides: Partial<RawCandidate> & Pick<RawCandidate, "key" | "source">,
): RawCandidate {
  return {
    name: overrides.key,
    url: `https://${overrides.key}`,
    dataPoints: [
      {
        source: overrides.source,
        metric: "m",
        value: 1,
        date: "2026-11-23",
        url: `https://${overrides.key}`,
      },
    ],
    ...overrides,
  };
}

test("canonical keys: domain, store ids, GitHub repos and non-product links", () => {
  assert.equal(canonicalKey("https://www.Landy-AI.com/pricing"), "landy-ai.com");
  assert.equal(
    canonicalKey("https://apps.apple.com/us/app/predika/id6792365508?uo=4"),
    "apple:6792365508",
  );
  assert.equal(
    canonicalKey("https://play.google.com/store/apps/details?id=com.example.app"),
    "play:com.example.app",
  );
  assert.equal(canonicalKey("https://github.com/Owner/Repo.git"), "github:owner/repo");
  assert.equal(canonicalKey("https://github.com/topics/ai"), null);
  assert.equal(
    canonicalKey("https://www.producthunt.com/products/wispim-online-teleprompter"),
    "producthunt:wispim-online-teleprompter",
  );
  assert.equal(canonicalKey("https://www.reddit.com/r/SideProject/comments/1x"), null);
  assert.equal(canonicalKey("https://i.redd.it/abc.png"), null);
  assert.equal(canonicalKey("ftp://example.com/file"), null);
  assert.equal(canonicalKey("not a url"), null);
});

test("merge joins the same product across sources and keeps the most authoritative name", () => {
  const merged = mergeCandidates([
    raw({ key: "landy-ai.com", source: "reddit", name: "I built a landing page thing" }),
    raw({ key: "landy-ai.com", source: "trustmrr", name: "Landy AI" }),
    raw({ key: "other.dev", source: "showhn", name: "Other" }),
  ]);
  const landy = merged.find((c) => c.key === "landy-ai.com")!;
  assert.equal(merged.length, 2);
  assert.equal(landy.name, "Landy AI");
  assert.deepEqual(landy.sources, ["trustmrr", "reddit"]);
  assert.equal(landy.dataPoints.length, 2);
  // Most-shared candidates first.
  assert.equal(merged[0]!.key, "landy-ai.com");
});

test("merge drops a duplicate data point (same source, metric, link) but keeps distinct ones", () => {
  const point = {
    source: "apple",
    metric: "apple_us_top_free_rank",
    value: 3,
    date: "2026-11-23",
    url: "https://apps.apple.com/x/id1",
  };
  const merged = mergeCandidates([
    {
      name: "A",
      key: "apple:1",
      url: "https://apps.apple.com/x/id1",
      source: "apple",
      dataPoints: [point, { ...point, metric: "apple_tr_top_free_rank", value: 9 }],
    },
    {
      name: "A",
      key: "apple:1",
      url: "https://apps.apple.com/x/id1",
      source: "apple",
      dataPoints: [point],
    },
  ]);
  assert.equal(merged[0]!.dataPoints.length, 2);
});

test("Product Hunt feed: entries become candidates with feed position as the numeric point", () => {
  const xml = `<?xml version="1.0"?><feed><title>Product Hunt</title>
<entry><title>Wispim</title><link rel="alternate" type="text/html" href="https://www.producthunt.com/products/wispim-online-teleprompter"/>
<published>2026-11-05T08:46:59-08:00</published></entry>
<entry><title>Q &amp; A Tool</title><link rel="alternate" type="text/html" href="https://www.producthunt.com/products/qa-tool"/>
<published>2026-11-19T10:00:00-08:00</published></entry></feed>`;
  const candidates = parseProductHuntFeed(xml);
  assert.equal(candidates.length, 2);
  assert.equal(candidates[1]!.name, "Q & A Tool");
  assert.equal(candidates[1]!.key, "producthunt:qa-tool");
  assert.equal(candidates[1]!.dataPoints[0]!.metric, "ph_feed_position");
  assert.equal(candidates[1]!.dataPoints[0]!.value, 2);
  assert.equal(candidates[1]!.dataPoints[0]!.date, "2026-11-19");
});

test("Reddit: self posts and non-product links are skipped; the rest are ranked by score", () => {
  const post = (id: string, score: number, url: string, isSelf = false) => ({
    id,
    title: `Post ${id}`,
    url,
    is_self: isSelf,
    score,
    num_comments: 2,
    created_utc: 1794777884,
  });
  const result = redditCandidates("SideProject", [
    post("a", 1, "https://self.example", true),
    post("b", 5, "https://reddit.com/r/x"),
    post("c", 2, "https://tool.example/landing"),
    post("d", 9, "https://apps.apple.com/us/app/x/id42"),
  ]);
  assert.deepEqual(
    result.map((c) => c.key),
    ["apple:42", "tool.example"],
  );
  assert.equal(result[0]!.dataPoints[0]!.metric, "reddit_score");
  assert.equal(result[0]!.dataPoints[0]!.value, 9);
  assert.throws(() => redditCandidates("SideProject", [{ id: "x" }]));
});

test("runner isolates a failing producer and still publishes the others", async () => {
  const failing: CandidateProducer = {
    source: "broken",
    collect: async () => {
      throw new Error("HTTP 500");
    },
  };
  const working: CandidateProducer = {
    source: "good",
    collect: async () => ({
      candidates: [raw({ key: "ok.dev", source: "good" })],
      skipped: ["one request skipped"],
    }),
  };
  const run = await collectCandidates([failing, working], at);
  assert.equal(run.candidates.length, 1);
  assert.deepEqual(run.rawCounts, { broken: 0, good: 1 });
  assert.deepEqual(run.errors, [
    { source: "broken", message: "HTTP 500" },
    { source: "good", message: "one request skipped" },
  ]);
});
