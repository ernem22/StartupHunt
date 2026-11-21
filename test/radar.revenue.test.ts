import assert from "node:assert/strict";
import { test } from "node:test";
import { runRadar, type RadarStore } from "../src/radar/run.js";
import { candidatePool, type CandidateSeries } from "../src/radar/github.js";
import {
  TRUSTMRR_KEYLESS_URL,
  TrustMrrKeylessCollector,
  unavailableRevenueEvidence,
} from "../src/radar/revenue.js";

const at = new Date("2026-11-21T13:19:05Z");

function collector(status: number, body = "unauthorized"): typeof fetch {
  return async () => new Response(body, { status });
}

const series: CandidateSeries[] = [
  {
    name: "owner/tool",
    description: "Developer tool",
    url: "https://github.com/owner/tool",
    historyUrl: "https://api.github.com/repos/owner/tool/stargazers/history",
    weeks: [
      { week: 1, total: 10 },
      { week: 2, total: 10 },
      { week: 3, total: 10 },
      { week: 4, total: 20 },
    ],
  },
];

const store: RadarStore = {
  start: async () => "1",
  complete: async () => {},
  fail: async () => {},
};

test("TrustMRR keyless 401 is recorded as yok / doğrulanmadı, never as revenue", async () => {
  const evidence = await new TrustMrrKeylessCollector(collector(401)).collect(at);
  assert.deepEqual(evidence, {
    finding: "yok",
    label: "doğrulanmadı",
    detail: "TrustMRR anahtarsız uç 401 — anahtarsız gelir kanıtı alınamadı",
    sourceUrl: TRUSTMRR_KEYLESS_URL,
    observedAt: at.toISOString(),
  });
  assert.equal(TRUSTMRR_KEYLESS_URL, "https://trustmrr.com/api/v1/startups?limit=3");
});

test("403 is treated like 401; 200 without expected 401 is not claimed as evidence", async () => {
  const forbidden = await new TrustMrrKeylessCollector(collector(403)).collect(at);
  assert.equal(forbidden.label, "doğrulanmadı");
  assert.equal(forbidden.finding, "yok");
  const unexpected = await new TrustMrrKeylessCollector(collector(200)).collect(at);
  assert.equal(unexpected.label, "doğrulanmadı");
  assert.equal(unexpected.finding, "yok");
  assert.match(unexpected.detail, /beklenen 401 gelmedi/);
});

test("unexpected HTTP status fails the probe instead of fabricating evidence", async () => {
  await assert.rejects(
    new TrustMrrKeylessCollector(collector(500)).collect(at),
    /TrustMRR HTTP 500/,
  );
});

test("each card carries sourced revenue evidence with label and date", async () => {
  const revenueCollector = new TrustMrrKeylessCollector(collector(401));
  const output = await runRadar(
    { collect: async () => series },
    store,
    at,
    "hash",
    revenueCollector,
  );
  assert.match(output, /## owner\/tool/);
  assert.match(
    output,
    /Gelir kanıtı: yok — doğrulanmadı \(TrustMRR anahtarsız uç 401[^)]*\); https:\/\/trustmrr\.com\/api\/v1\/startups\?limit=3; 2026-11-21T13:19:05\.000Z/,
  );
  assert.equal(candidatePool[0]!.revenueSources.length, 1);
});

test("candidate-provided revenue evidence is preserved", async () => {
  const given = {
    finding: "$12k MRR",
    label: "ikincil" as const,
    detail: "fixture",
    sourceUrl: "https://example.org/evidence",
    observedAt: at.toISOString(),
  };
  const output = await runRadar(
    { collect: async () => [{ ...series[0]!, revenueEvidence: given }] },
    store,
    at,
    "hash",
  );
  assert.match(
    output,
    /Gelir kanıtı: \$12k MRR — ikincil \(fixture\); https:\/\/example\.org\/evidence/,
  );
});

test("default fallback without a collector stays 'yok / doğrulanmadı'", async () => {
  assert.equal(unavailableRevenueEvidence(at).finding, "yok");
  assert.equal(unavailableRevenueEvidence(at).label, "doğrulanmadı");
});
