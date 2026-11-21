import assert from "node:assert/strict";
import { test } from "node:test";
import { AppleTrCatalog, trQueries, type TrCatalog } from "../src/radar/apple.js";
import { completedWeeks, type CandidateSeries } from "../src/radar/github.js";
import { runRadar, type Manifest, type RadarStore } from "../src/radar/run.js";

const at = new Date("2026-11-21T13:19:05Z");
const weeks = completedWeeks(at);

function fixture(
  total: number,
  name = "owner/tool",
  description = "Developer tool",
): CandidateSeries {
  return {
    name,
    description,
    url: `https://github.com/${name}`,
    historyUrl: `https://api.github.com/repos/${name}/stargazers/history?per_page=5`,
    weeks: weeks.map((week, i) => ({ week, total: i === 3 ? total : 10 })),
  };
}

class MemoryStore implements RadarStore {
  manifest?: Manifest;
  series?: CandidateSeries[];
  failed = false;
  async start(manifest: Manifest): Promise<string> {
    this.manifest = manifest;
    return "1";
  }
  async complete(_id: string, series: CandidateSeries[]): Promise<void> {
    this.series = series;
  }
  async fail(): Promise<void> {
    this.failed = true;
  }
}

function fakeCatalog(statuses: Record<string, TrStatusLite>): TrCatalog {
  return {
    catalog: "Fake Apple TR",
    async lookup(candidate) {
      return (
        statuses[candidate.name] ?? {
          status: "belirsiz",
          queries: [],
          catalog: "Fake Apple TR",
        }
      );
    },
  };
}

type TrStatusLite = Awaited<ReturnType<TrCatalog["lookup"]>>;

test("trQueries uses repo name and meaningful description tokens without duplicates", () => {
  assert.deepEqual(
    trQueries(fixture(20, "owner/visual-studio", "Visual Studio Code for the web")),
    ["visual studio", "visual studio code web"],
  );
  assert.deepEqual(trQueries(fixture(20, "owner/zzz", "")), ["zzz"]);
});

test("Apple TR lookup finds a named match and records the attempted query", async () => {
  const seen: string[] = [];
  const request: typeof fetch = async (input) => {
    seen.push(String(input));
    return Response.json({
      resultCount: 1,
      results: [
        {
          trackName: "GitHub",
          trackViewUrl: "https://apps.apple.com/tr/app/github/id1477376905",
        },
      ],
    });
  };
  const status = await new AppleTrCatalog(request).lookup(
    fixture(20, "owner/github", "GitHub official command line tool"),
  );
  assert.equal(status.status, "bulundu");
  assert.deepEqual(status.queries, ["github"]);
  assert.deepEqual(status.match, {
    name: "GitHub",
    url: "https://apps.apple.com/tr/app/github/id1477376905",
  });
  const url = new URL(seen[0]!);
  assert.equal(url.searchParams.get("term"), "github");
  assert.equal(url.searchParams.get("country"), "tr");
  assert.equal(url.searchParams.get("entity"), "software");
});

test("zero results across every query is bulunamadı with all attempted queries", async () => {
  const request: typeof fetch = async () => Response.json({ resultCount: 0, results: [] });
  const status = await new AppleTrCatalog(request).lookup(fixture(20, "owner/zzz", "quux corge"));
  assert.equal(status.status, "bulunamadı");
  assert.deepEqual(status.queries, ["zzz", "quux corge"]);
  assert.equal(status.match, undefined);
});

test("catalog HTTP failure and malformed bodies become belirsiz instead of throwing", async () => {
  for (const request of [
    (async () => new Response("down", { status: 500 })) as typeof fetch,
    (async () => Response.json({})) as typeof fetch,
    (async () => {
      throw new Error("network down");
    }) as typeof fetch,
  ]) {
    const status = await new AppleTrCatalog(request).lookup(fixture(20));
    assert.equal(status.status, "belirsiz");
    assert.ok(status.note);
  }
});

test("runRadar marks each card with TR status and orders the gap view with not-found first", async () => {
  const store = new MemoryStore();
  const statuses: Record<string, TrStatusLite> = {
    "owner/found": {
      status: "bulundu",
      queries: ["found"],
      catalog: "Fake Apple TR",
      match: { name: "Found App", url: "https://apps.apple.com/tr/app/found/id1" },
    },
    "owner/missing": { status: "bulunamadı", queries: ["missing"], catalog: "Fake Apple TR" },
    "owner/unknown": { status: "belirsiz", queries: ["unknown"], catalog: "Fake Apple TR" },
  };
  const output = await runRadar(
    {
      collect: async () => [
        fixture(40, "owner/found"),
        fixture(30, "owner/missing"),
        fixture(20, "owner/unknown"),
      ],
    },
    store,
    at,
    "hash",
    fakeCatalog(statuses),
  );

  assert.match(
    output,
    /TR durumu: bulundu \(Found App, https:\/\/apps\.apple\.com\/tr\/app\/found\/id1\)/,
  );
  assert.match(output, /TR durumu: bulunamadı \(bu sorgularda sonuç yok; "yok" iddiası değil\)/);
  assert.match(output, /TR durumu: belirsiz — doğrulanmadı/);
  assert.match(output, /## TR boşluğu görünümü/);

  const gap = output.slice(output.indexOf("## TR boşluğu görünümü"));
  assert.ok(gap.indexOf("owner/missing") < gap.indexOf("owner/unknown"));
  assert.ok(gap.indexOf("owner/unknown") < gap.indexOf("owner/found"));
  assert.equal(store.manifest?.parameters.trCatalog, "Fake Apple TR");
  assert.equal(store.failed, false);
});

test("runRadar keeps legacy placeholder when no catalog is supplied", async () => {
  const store = new MemoryStore();
  const output = await runRadar({ collect: async () => [fixture(20)] }, store, at, "hash");
  assert.match(output, /TR durumu: belirsiz — doğrulanmadı \(aranmadı\)/);
  assert.ok(!output.includes("TR boşluğu görünümü"));
  assert.equal(store.manifest?.parameters.trCatalog, undefined);
});

test("a throwing catalog is downgraded to belirsiz and does not fail the run", async () => {
  const store = new MemoryStore();
  const output = await runRadar({ collect: async () => [fixture(20)] }, store, at, "hash", {
    catalog: "Broken TR",
    lookup: async () => {
      throw new Error("boom");
    },
  });
  assert.match(output, /TR durumu: belirsiz — doğrulanmadı \(katalog ulaşılamadı: boom\)/);
  assert.equal(store.failed, false);
});
