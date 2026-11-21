import assert from "node:assert/strict";
import { test } from "node:test";
import {
  candidatePool,
  completedWeeks,
  GitHubMomentumCollector,
  type CandidateSeries,
} from "../src/radar/github.js";
import { HackerNewsMomentumCollector } from "../src/radar/hackernews.js";
import { hackerNewsSource, runRadar, type Manifest, type RadarStore } from "../src/radar/run.js";
import { PostgresRadarStore } from "../src/radar/store.js";
import type pg from "pg";

const at = new Date("2026-11-21T13:19:05Z");
const weeks = completedWeeks(at);

function fixture(total: number, name = "owner/tool"): CandidateSeries {
  return {
    name,
    description: "Developer tool",
    url: `https://github.com/${name}`,
    historyUrl: `https://api.github.com/repos/${name}/stargazers/history?per_page=5`,
    weeks: weeks.map((week, i) => ({ week, total: i === 3 ? total : 10 })),
  };
}

class MemoryStore implements RadarStore {
  manifest?: Manifest;
  series?: CandidateSeries[];
  source?: { entityType: string; metric: string };
  failed = false;
  async start(manifest: Manifest): Promise<string> {
    this.manifest = manifest;
    return "1";
  }
  async complete(
    _id: string,
    series: CandidateSeries[],
    source?: { entityType: string; metric: string },
  ): Promise<void> {
    this.series = series;
    this.source = source;
  }
  async fail(): Promise<void> {
    this.failed = true;
  }
}

function requestFixture(history: unknown, incomplete = false): typeof fetch {
  return async (input) => {
    const url = String(input);
    return Response.json(
      url.includes("/search/")
        ? {
            incomplete_results: incomplete,
            items: [{ full_name: "owner/tool", description: "Developer tool" }],
          }
        : history,
    );
  };
}

test("fixture pipeline emits top 20 by weekly growth, saves all series and a replay manifest", async () => {
  const store = new MemoryStore();
  const series = Array.from({ length: 25 }, (_, i) => fixture(i + 11, `owner/tool${i}`));
  const output = await runRadar({ collect: async () => series }, store, at, "abc123");
  assert.equal(output.match(/^## /gm)?.length, 20);
  assert.ok(output.indexOf("## owner/tool24") < output.indexOf("## owner/tool23"));
  assert.ok(!output.includes("## owner/tool0\n"));
  assert.match(output, /İvme: 250\.0%;/);
  assert.match(output, /▃▃▃█ \[10, 10, 10, 35\]/);
  assert.match(output, /Gelir kanıtı: yok — doğrulanmadı/);
  assert.match(output, /TR durumu: belirsiz — doğrulanmadı/);
  assert.match(output, /ikincil/);
  assert.match(output, /doğrulandı/);
  assert.match(output, /2026-11-21T13:19:05\.000Z/);
  assert.deepEqual(store.series, series);
  assert.deepEqual(store.manifest, {
    source: "github",
    parameters: {
      pool: candidatePool,
      discoveryLimit: 30,
      weeks: 4,
      at: at.toISOString(),
    },
    seed: 0,
    commitHash: "abc123",
  });
});

test("history ignores current partial week, sorts chronologically, and drives Markdown", async () => {
  const history = [...fixture(20).weeks, { week: weeks[3]! + 604800, total: 9999 }].reverse();
  const store = new MemoryStore();
  const output = await runRadar(
    new GitHubMomentumCollector(candidatePool[0]!.query!, requestFixture(history)),
    store,
    at,
    "abc123",
  );
  assert.match(output, /100\.0%;/);
  assert.match(output, /\[10, 10, 10, 20\]/);
  assert.ok(!output.includes("9999"));
  assert.equal(new Date(weeks[0]! * 1000).toISOString(), "2026-10-18T00:00:00.000Z");
});

test("zero baseline is unranked, negative/zero growth preserved, ties stable, text escaped", async () => {
  const zero = fixture(10, "owner/zero");
  zero.weeks[2]!.total = 0;
  const store = new MemoryStore();
  const unsafe = fixture(10, "owner/a");
  unsafe.description = "[click](evil)\n## fake";
  const output = await runRadar(
    { collect: async () => [zero, fixture(5), fixture(10, "owner/b"), unsafe] },
    store,
    at,
    "hash",
  );
  assert.ok(!output.includes("## owner/zero"));
  assert.match(output, /-50\.0%/);
  assert.match(output, /Sıfır taban nedeniyle sıralanmayan: 1/);
  assert.ok(output.indexOf("## owner/a") < output.indexOf("## owner/b"));
  assert.ok(!output.includes("\n## fake"));
  assert.equal(store.series?.length, 4);
});

test("HTTP, malformed data and incomplete Search fail without publishing a partial run", async () => {
  for (const request of [
    (async () => new Response("rate limited", { status: 403 })) as typeof fetch,
    requestFixture([{ week: weeks[0], total: -1 }]),
    requestFixture(fixture(20).weeks, true),
    requestFixture([...fixture(20).weeks, fixture(20).weeks[0]]),
  ]) {
    const store = new MemoryStore();
    await assert.rejects(
      runRadar(new GitHubMomentumCollector("query", request), store, at, "hash"),
    );
    assert.equal(store.failed, true);
    assert.equal(store.series, undefined);
    assert.ok(store.manifest);
  }
});

test("missing history is excluded rather than zero-filled", async () => {
  const store = new MemoryStore();
  const output = await runRadar(
    new GitHubMomentumCollector("query", requestFixture([])),
    store,
    at,
    "hash",
  );
  assert.ok(!output.includes("## owner/tool"));
  assert.deepEqual(store.series, []);
});

test("persistence errors fail the run and never return a success list", async () => {
  const store = new MemoryStore();
  store.complete = async () => {
    throw new Error("write failed");
  };
  await assert.rejects(
    runRadar({ collect: async () => [fixture(20)] }, store, at, "hash"),
    /write failed/,
  );
  assert.equal(store.failed, true);
});

test("Postgres contract writes dated metrics atomically; failure rolls back", async () => {
  for (const failInsert of [false, true]) {
    const calls: { sql: string; values?: unknown[] }[] = [];
    const client = {
      query: async (sql: string, values?: unknown[]) => {
        calls.push({ sql, values });
        if (failInsert && sql.includes("insert into metric_snapshots"))
          throw new Error("DB failure");
        return { rows: [{ id: "1" }] };
      },
    } as unknown as pg.Client;
    const store = new PostgresRadarStore(client);
    await store.start({
      source: "github",
      parameters: { pool: candidatePool, discoveryLimit: 30, weeks: 4, at: at.toISOString() },
      seed: 0,
      commitHash: "hash",
    });
    if (failInsert) {
      await assert.rejects(store.complete("1", [fixture(20)]), /DB failure/);
      assert.equal(calls.at(-1)?.sql, "rollback");
      assert.ok(!calls.some((call) => call.sql === "commit"));
    } else {
      await store.complete("1", [fixture(20)]);
      assert.equal(
        calls.filter((call) => call.sql.includes("insert into metric_snapshots")).length,
        4,
      );
      assert.deepEqual(calls[2]?.values, [
        "github_repo",
        "https://github.com/owner/tool",
        "weekly_new_stars",
        10,
        new Date("2026-10-18T00:00:00Z"),
      ]);
      assert.equal(calls.at(-1)?.sql, "commit");
    }
  }
});

function hnHit(objectID: string, week: number, url: string, title = "Show HN: tool") {
  return {
    objectID,
    created_at: new Date((weeks[week]! + 3600) * 1000).toISOString(),
    title,
    url,
  };
}

function hnRequestFixture(
  byQuery: Record<string, unknown[]>,
  nbHits?: Record<string, number>,
): typeof fetch {
  return async (input) => {
    const query = new URL(String(input)).searchParams.get("query") ?? "";
    const hits = byQuery[query] ?? [];
    return Response.json({ nbHits: nbHits?.[query] ?? hits.length, hits });
  };
}

test("HN Algolia emits a second momentum source with family and weekly story sparkline", async () => {
  const hits = [
    hnHit("1", 2, "https://example.com/tool"),
    hnHit("2", 3, "https://example.com/tool"),
    hnHit("3", 3, "https://www.example.com/again"),
    hnHit("4", 3, "https://example.com/third"),
    hnHit("5", 3, "https://github.com/owner/repo"),
    hnHit("6", 2, "https://github.com/owner/repo"),
    // Duplicate across queries must count once.
    hnHit("1", 2, "https://example.com/tool"),
  ];
  const store = new MemoryStore();
  const output = await runRadar(
    hackerNewsSource(
      new HackerNewsMomentumCollector(
        ["developer", "AI tools"],
        hnRequestFixture({ developer: hits, "AI tools": hits.slice(0, 2) }),
      ),
    ),
    store,
    at,
    "hash",
  );
  assert.match(output, /# HN Algolia adayları/);
  assert.match(output, /Kaynak ailesi: aday üretici \(HN Algolia; kaynak: hackernews\)/);
  assert.match(output, /İvme: 200\.0%;/);
  assert.match(output, /\[0, 0, 1, 3\]/);
  assert.match(output, /doğrulandı \(HN Algolia haftalık hikâye verisinden hesaplandı\)/);
  assert.match(output, /Sparkline haftalık hikâye sayılarını gösterir/);
  assert.match(output, /## owner\/repo/);
  assert.ok(!output.includes("## www.example.com"));
  assert.equal(output.match(/^## /gm)?.length, 2);
  assert.deepEqual(store.manifest, {
    source: "hackernews",
    parameters: {
      pool: candidatePool,
      discoveryLimit: 1000,
      weeks: 4,
      at: at.toISOString(),
    },
    seed: 0,
    commitHash: "hash",
  });
  assert.deepEqual(store.source, { entityType: "hn_domain", metric: "weekly_stories" });
  assert.equal(store.series?.length, 2);
  assert.equal(
    store.series
      ?.find((c) => c.name === "example.com")
      ?.historyUrl.includes("hn.algolia.com/api/v1/search_by_date"),
    true,
  );
});

test("non-product domains are excluded and counted; product domains and repos are kept", async () => {
  const hits = [
    hnHit("1", 2, "https://medium.com/@author/tool"),
    hnHit("2", 3, "https://medium.com/@author/tool"),
    hnHit("3", 2, "https://www.youtube.com/watch?v=abc"),
    hnHit("4", 3, "https://youtu.be/abc"),
    hnHit("5", 2, "https://example.com/tool"),
    hnHit("6", 3, "https://example.com/tool"),
    hnHit("7", 2, "https://github.com/owner/repo"),
    hnHit("8", 3, "https://github.com/owner/repo"),
    // A bare GitHub profile link is not a product.
    hnHit("9", 3, "https://github.com/owner"),
  ];
  const store = new MemoryStore();
  const output = await runRadar(
    hackerNewsSource(
      new HackerNewsMomentumCollector(["developer"], hnRequestFixture({ developer: hits })),
    ),
    store,
    at,
    "hash",
  );
  assert.match(output, /## example\.com/);
  assert.match(output, /## owner\/repo/);
  assert.ok(!output.includes("medium.com"));
  assert.ok(!output.includes("youtube.com"));
  assert.ok(!output.includes("youtu.be"));
  assert.match(output, /Ürün olmadığı için elenen: 5\./);
});

test("HN Algolia zero baseline is unranked and HTTP/truncated/malformed responses fail", async () => {
  const store = new MemoryStore();
  const output = await runRadar(
    hackerNewsSource(
      new HackerNewsMomentumCollector(
        ["developer"],
        hnRequestFixture({ developer: [hnHit("1", 3, "https://only-last.example")] }),
      ),
    ),
    store,
    at,
    "hash",
  );
  assert.ok(!output.includes("## only-last.example"));
  assert.match(output, /Sıfır taban nedeniyle sıralanmayan: 1/);

  for (const request of [
    (async () => new Response("down", { status: 500 })) as typeof fetch,
    hnRequestFixture({ developer: [hnHit("1", 3, "https://x.example")] }, { developer: 5 }),
    hnRequestFixture({
      developer: [{ objectID: "1", created_at: "not-a-date", url: "https://x" }],
    }),
  ]) {
    const failing = new MemoryStore();
    await assert.rejects(
      runRadar(
        hackerNewsSource(new HackerNewsMomentumCollector(["developer"], request)),
        failing,
        at,
        "hash",
      ),
    );
    assert.equal(failing.failed, true);
    assert.equal(failing.series, undefined);
    assert.ok(failing.manifest);
  }
});
