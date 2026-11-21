import assert from "node:assert/strict";
import { test } from "node:test";
import { runRadar, type RadarStore } from "../src/radar/run.js";
import { candidatePool, type CandidateSeries } from "../src/radar/github.js";
import { TRUSTMRR_AI_URL, TrustMrrAiCollector } from "../src/radar/revenue.js";

const at = new Date("2026-11-21T13:19:05Z");

const trustMrrBody = JSON.stringify({
  metricAccess: {
    public: "Public responses may include current or last-30-day summary metrics",
  },
  recentlyListedStartups: [
    {
      name: "Acme Tool",
      slug: "acme-tool",
      url: "https://trustmrr.com/startup/acme-tool",
      website: "https://acme.example",
      revenue: { last30Days: 1200, mrr: 900, total: 15000 },
    },
    {
      name: "No Revenue Fields",
      slug: "no-revenue",
      url: "https://trustmrr.com/startup/no-revenue",
      website: "https://norevenue.example",
      revenue: null,
    },
  ],
  bestDeals: [],
});

function aiCollector(body = trustMrrBody, status = 200): typeof fetch {
  return async (input) => {
    assert.equal(String(input), TRUSTMRR_AI_URL);
    return new Response(body, {
      status,
      headers: { "content-type": "application/json" },
    });
  };
}

function candidate(overrides: Partial<CandidateSeries> = {}): CandidateSeries {
  return {
    name: "owner/tool",
    description: "Developer tool",
    url: "https://github.com/owner/tool",
    homepage: null,
    historyUrl: "https://api.github.com/repos/owner/tool/stargazers/history?per_page=5",
    weeks: [
      { week: 1, total: 10 },
      { week: 2, total: 10 },
      { week: 3, total: 10 },
      { week: 4, total: 20 },
    ],
    ...overrides,
  };
}

const store: RadarStore = {
  start: async () => "1",
  complete: async () => {},
  fail: async () => {},
};

test("TrustMRR /api/ai 200 maps per-candidate by strict domain/name match; unmatched is not evidence", async () => {
  const collector = new TrustMrrAiCollector(aiCollector());
  const evidence = await collector.collect(at, [
    candidate({ name: "owner/acme-tool", homepage: "https://acme.example/docs" }),
    candidate({ name: "owner/other", url: "https://github.com/owner/other", homepage: null }),
  ]);

  assert.deepEqual(evidence.get("https://github.com/owner/tool"), {
    finding: "MRR $900, son 30 gün $1,200, toplam $15,000",
    label: "ikincil",
    detail: "TrustMRR /api/ai kaydında adayla ad/domain eşleşmesi bulundu",
    sourceUrl: "https://trustmrr.com/startup/acme-tool",
    observedAt: at.toISOString(),
  });
  assert.deepEqual(evidence.get("https://github.com/owner/other"), {
    finding: "yok",
    label: "doğrulanmadı",
    detail: "2 kayıtlık örnekte eşleşme yok, kapsam sınırlı, bu bir kanıt değil",
    sourceUrl: TRUSTMRR_AI_URL,
    observedAt: at.toISOString(),
  });
});

test("normalized name equality matches but substring/similar names do not", async () => {
  const collector = new TrustMrrAiCollector(aiCollector());
  const evidence = await collector.collect(at, [
    candidate({ name: "owner/Acme-Tool", url: "https://github.com/owner/Acme-Tool" }),
    candidate({ name: "owner/acme", url: "https://github.com/owner/acme" }),
  ]);
  assert.equal(evidence.get("https://github.com/owner/Acme-Tool")?.label, "ikincil");
  assert.equal(evidence.get("https://github.com/owner/acme")?.label, "doğrulanmadı");
  assert.match(evidence.get("https://github.com/owner/acme")?.detail ?? "", /eşleşme yok/);
});

test("matched record without revenue/MRR fields is reported explicitly, not fabricated", async () => {
  const collector = new TrustMrrAiCollector(aiCollector());
  const evidence = await collector.collect(at, [
    candidate({ name: "owner/no-revenue", homepage: "https://norevenue.example" }),
  ]);
  assert.deepEqual(evidence.get("https://github.com/owner/tool"), {
    finding: "yok",
    label: "doğrulanmadı",
    detail:
      "TrustMRR eşleşmesi bulundu (https://trustmrr.com/startup/no-revenue) ancak gelir/MRR alanı yok",
    sourceUrl: TRUSTMRR_AI_URL,
    observedAt: at.toISOString(),
  });
});

test("unexpected HTTP status fails the probe instead of fabricating evidence", async () => {
  await assert.rejects(
    new TrustMrrAiCollector(aiCollector("err", 500)).collect(at, [candidate()]),
    /TrustMRR HTTP 500/,
  );
});

test("each card carries per-candidate revenue evidence with label, source and date", async () => {
  const output = await runRadar(
    {
      collect: async () => [
        candidate({ name: "owner/acme-tool", homepage: "https://acme.example" }),
        candidate({ name: "owner/other", url: "https://github.com/owner/other" }),
      ],
    },
    store,
    at,
    "hash",
    new TrustMrrAiCollector(aiCollector()),
  );
  assert.match(
    output,
    /## owner\/acme-tool[\s\S]*Gelir kanıtı: MRR \$900, son 30 gün \$1,200, toplam \$15,000 — ikincil \(TrustMRR \/api\/ai kaydında adayla ad\/domain eşleşmesi bulundu\); https:\/\/trustmrr\.com\/startup\/acme-tool; 2026-11-21T13:19:05\.000Z/,
  );
  assert.match(
    output,
    /## owner\/other[\s\S]*Gelir kanıtı: yok — doğrulanmadı \(2 kayıtlık örnekte eşleşme yok, kapsam sınırlı, bu bir kanıt değil\); https:\/\/trustmrr\.com\/api\/ai; 2026-11-21T13:19:05\.000Z/,
  );
  assert.equal(
    candidatePool[0]!.revenueSources[0],
    "TrustMRR /api/ai (anahtarsız, salt okunur; eşleşme aday başına domain/ad)",
  );
});

test("candidate-provided revenue evidence is preserved without collector lookup", async () => {
  const given = {
    finding: "$12k MRR",
    label: "ikincil" as const,
    detail: "fixture",
    sourceUrl: "https://example.org/evidence",
    observedAt: at.toISOString(),
  };
  const output = await runRadar(
    { collect: async () => [{ ...candidate(), revenueEvidence: given }] },
    store,
    at,
    "hash",
  );
  assert.match(
    output,
    /Gelir kanıtı: \$12k MRR — ikincil \(fixture\); https:\/\/example\.org\/evidence/,
  );
});
