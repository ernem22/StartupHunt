import assert from "node:assert/strict";
import { test } from "node:test";
import { completedWeeks, type CandidateSeries } from "../src/radar/github.js";
import { HFMomentumCollector } from "../src/radar/hf.js";
import {
  githubSource,
  hackerNewsSource,
  huggingFaceSource,
  runRadar,
  type Manifest,
  type RadarStore,
} from "../src/radar/run.js";

const at = new Date("2026-11-21T13:19:05Z");
const week = completedWeeks(at).at(-1)!;

function hfFixture(): unknown[] {
  return [
    { id: "org/model-a", pipeline_tag: "text-generation", trendingScore: 627, downloads: 8120 },
    { id: "org/model-b", pipeline_tag: "image-text-to-text", trendingScore: 1002, likes: 1275 },
    { id: "org/no-score", trendingScore: undefined },
  ];
}

class MemoryStore implements RadarStore {
  manifests: Manifest[] = [];
  series: CandidateSeries[] = [];
  failed = 0;
  async start(manifest: Manifest): Promise<string> {
    this.manifests.push(manifest);
    return String(this.manifests.length);
  }
  async complete(_id: string, series: CandidateSeries[]): Promise<void> {
    this.series.push(...series);
  }
  async fail(): Promise<void> {
    this.failed++;
  }
}

function hfRequest(body: unknown, status = 200): typeof fetch {
  return async () => (status === 200 ? Response.json(body) : new Response("boom", { status }));
}

function hfSeries(value: number, name = "org/model"): CandidateSeries {
  return {
    name,
    description: "Yapay zekâ modeli (text-generation)",
    url: `https://huggingface.co/${name}`,
    historyUrl: "https://huggingface.co/api/models?sort=trendingScore&limit=30",
    weeks: [{ week, total: value }],
    metric: "hf_trending_score",
    score: {
      value,
      label: "trendingScore",
      evidence: "Hugging Face'in kendi son dönem ilgi ölçüsü",
    },
  };
}

test("HF collector validates the listing, skips missing scores and keeps evidence metadata", async () => {
  const series = await new HFMomentumCollector(hfRequest(hfFixture())).collect(at);
  assert.deepEqual(
    series.map((s) => ({ name: s.name, score: s.score?.value, week: s.weeks[0]!.week })),
    [
      { name: "org/model-a", score: 627, week },
      { name: "org/model-b", score: 1002, week },
    ],
  );
  assert.equal(series[0]!.metric, "hf_trending_score");
  assert.equal(series[0]!.url, "https://huggingface.co/org/model-a");
  assert.match(series[0]!.description, /text-generation/);
});

test("HF collector fails closed on HTTP and malformed listings", async () => {
  await assert.rejects(new HFMomentumCollector(hfRequest([], 503)).collect(at), /503/);
  await assert.rejects(new HFMomentumCollector(hfRequest({ models: [] })).collect(at), /Invalid/);
  await assert.rejects(
    new HFMomentumCollector(hfRequest([{ trendingScore: 5 }])).collect(at),
    /Invalid Hugging Face model entry/,
  );
});

test("HF source ranks by trendingScore with labeled evidence and placeholders", async () => {
  const store = new MemoryStore();
  const empty = await runRadar(
    huggingFaceSource(new HFMomentumCollector(hfRequest([]))),
    store,
    at,
    "abc123",
  );
  const listing = [
    { id: "org/model-b", pipeline_tag: "image-text-to-text", trendingScore: 1002 },
    { id: "org/model-a", pipeline_tag: "text-generation", trendingScore: 627 },
  ];
  const text = await runRadar(
    huggingFaceSource(new HFMomentumCollector(hfRequest(listing))),
    store,
    at,
    "abc123",
  );
  assert.match(text, /# Hugging Face adayları — 2026-11-21T13:19:05\.000Z/);
  assert.ok(text.indexOf("## org/model-b") < text.indexOf("## org/model-a"));
  assert.match(text, /Kaynak ailesi: ivme ölçüsü \(Hugging Face; kaynak: huggingface\)/);
  assert.match(
    text,
    /İvme \(trendingScore\): 1002 — doğrulandı \(Hugging Face'in kendi son dönem ilgi ölçüsü\)/,
  );
  assert.match(text, /— ikincil \(model kimliği yükleme beyanı\)/);
  assert.match(text, /Gelir kanıtı: yok — doğrulanmadı/);
  assert.match(text, /TR durumu: belirsiz — doğrulanmadı/);
  assert.match(text, /hf_trending_score/);
  assert.ok(!text.includes("Sıfır taban"));
  assert.equal(store.manifests[1]?.source, "huggingface");
  assert.ok(!empty.includes("## "));
});

test("three sources produce separate sections and per-source manifests", async () => {
  const store = new MemoryStore();
  const github = {
    name: "owner/tool",
    description: "Dev tool",
    url: "https://github.com/owner/tool",
    historyUrl: "https://api.github.com/repos/owner/tool/stargazers/history",
    weeks: [...completedWeeks(at)].map((w, i) => ({ week: w, total: i === 3 ? 20 : 10 })),
  };
  const hn = {
    name: "example.com",
    description: "Show HN: tool",
    url: "https://example.com",
    historyUrl: "https://hn.algolia.com/api/v1/search_by_date",
    weeks: [...completedWeeks(at)].map((w, i) => ({ week: w, total: i === 3 ? 3 : 1 })),
  };
  const outputs = [
    await runRadar(githubSource({ collect: async () => [github] }), store, at, "abc123"),
    await runRadar(hackerNewsSource({ collect: async () => [hn] }), store, at, "abc123"),
    await runRadar(
      huggingFaceSource({ collect: async () => [hfSeries(627, "org/model-a")] }),
      store,
      at,
      "abc123",
    ),
  ];
  const output = outputs.join("\n\n");
  assert.match(output, /# GitHub adayları —/);
  assert.match(output, /# HN Algolia adayları —/);
  assert.match(output, /# Hugging Face adayları —/);
  assert.match(output, /İvme: 100\.0%;/);
  assert.equal(store.manifests.length, 3);
  assert.equal(store.series.length, 3);
});

test("a failing source marks its run failed without publishing output", async () => {
  const store = new MemoryStore();
  await assert.rejects(
    runRadar(
      huggingFaceSource({
        collect: async () => {
          throw new Error("HF down");
        },
      }),
      store,
      at,
      "hash",
    ),
    /HF down/,
  );
  assert.equal(store.failed, 1);
});
