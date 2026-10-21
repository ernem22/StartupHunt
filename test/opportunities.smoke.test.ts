import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import type { Digest } from "../src/opportunities/digest.js";
import { FixtureEvidenceExtractor } from "../src/opportunities/extractors/fixture.js";
import type { ObservationForExtraction } from "../src/opportunities/types.js";
import {
  createTestDb,
  dropTestDb,
  runOpportunitiesCli,
  seedObservations,
  type TestDb,
} from "./helpers/test-db.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixturePath = path.join(repoRoot, "test", "fixtures", "opportunity-extraction.json");
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const skipReason = testDatabaseUrl
  ? false
  : "TEST_DATABASE_URL yok: DB smoke testi atlandı (3060'ta tam koşar)";

const observation: ObservationForExtraction = {
  id: "1",
  source: "hackernews",
  sourceId: "hn-1001",
  sourceUrl: "https://news.ycombinator.com/item?id=1001",
  title: "Invoicing is eating my month",
  text: "I run a one-person agency and every month I copy invoices from Gmail into a spreadsheet by hand. It takes me about four hours every month.",
  author: "alice",
  observedAt: new Date("2026-09-01T00:00:00.000Z"),
  language: "en",
};

test("fixture extractor quote'u metnin birebir alt dizisi olarak doğrular", () => {
  const extractor = new FixtureEvidenceExtractor(fixturePath);
  const drafts = extractor.extract(observation);

  assert.equal(drafts.length, 1);
  assert.equal(drafts[0]?.actor, "one-person agency owner");
  assert.equal(drafts[0]?.job, "invoicing");
  assert.throws(
    () => extractor.extract({ ...observation, text: "alakasız metin" }),
    /birebir alt dizisi/
  );
});

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

test("opportunity smoke: build -> digest", { skip: skipReason }, async () => {
  let db: TestDb;
  try {
    db = await createTestDb(testDatabaseUrl!);
  } catch (error) {
    throw new Error(`setup seam: ${message(error)}`);
  }

  try {
    let ids: string[];
    try {
      ids = await seedObservations(db, [
        {
          source: "hackernews",
          sourceId: "hn-1001",
          sourceUrl: "https://news.ycombinator.com/item?id=1001",
          title: observation.title,
          text: observation.text,
          author: "alice",
          observedAt: new Date("2026-09-01T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "stackexchange",
          sourceId: "se-2002",
          sourceUrl: "https://stackoverflow.com/q/2002",
          title: "Automating invoice export",
          text: "As a solo agency owner, I still export invoices from Gmail to a spreadsheet manually. It costs me half a day each month.",
          author: "bob",
          observedAt: new Date("2026-08-15T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "reddit",
          sourceId: "r-3003",
          sourceUrl: "https://www.reddit.com/r/SaaS/comments/3003",
          title: "Unrelated",
          text: "I like coffee.",
          author: "carol",
          observedAt: new Date("2026-07-01T00:00:00.000Z"),
          language: "en",
        },
      ]);
    } catch (error) {
      throw new Error(`seed seam: ${message(error)}`);
    }
    assert.equal(ids.length, 3, "seed seam: üç fixture observation seed edilemedi");

    const buildOut = runOpportunitiesCli(
      "build",
      ["build", "--fixture", fixturePath],
      db.url
    );
    assert.match(
      buildOut,
      /build: observations=3 evidence=2 opportunities=1 skipped=1/,
      "build seam: özet satırı beklenen sayıları vermedi"
    );

    const digestOut = runOpportunitiesCli("digest", ["digest", "--format", "json"], db.url);
    let digest: Digest;
    try {
      digest = JSON.parse(digestOut) as Digest;
    } catch (error) {
      throw new Error(
        `digest seam: JSON çözümlenemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    assert.equal(digest.cardCount, 1, "digest seam: kart sayısı");
    assert.equal(digest.cards.length, 1, "digest seam: kart listesi");
    const card = digest.cards[0]!;
    assert.equal(card.actor, "one-person agency owner", "digest seam: aktör");
    assert.equal(card.job, "invoicing", "digest seam: iş");
    assert.equal(
      card.workaround,
      "copy invoices from Gmail into a spreadsheet by hand",
      "digest seam: workaround"
    );
    assert.equal(card.sourceCount, 2, "digest seam: bağımsız kaynak sayısı");
    assert.deepEqual(
      card.communities,
      ["hackernews", "stackexchange"],
      "digest seam: topluluklar"
    );
    assert.equal(
      card.quote,
      "every month I copy invoices from Gmail into a spreadsheet by hand",
      "digest seam: quote"
    );
    assert.equal(
      card.sourceUrl,
      "https://news.ycombinator.com/item?id=1001",
      "digest seam: kaynak URL"
    );
    assert.equal(card.observedAt, "2026-09-01T00:00:00.000Z", "digest seam: tarih");

    const counts = await db.admin.query<{ evidence: string; opportunities: string }>(
      `select (select count(*) from opportunity_evidence) as evidence,
              (select count(*) from opportunities) as opportunities`
    );
    assert.equal(Number(counts.rows[0]?.evidence), 2, "build seam: evidence sayısı");
    assert.equal(Number(counts.rows[0]?.opportunities), 1, "build seam: opportunity sayısı");

    runOpportunitiesCli("build", ["build", "--fixture", fixturePath], db.url);
    const again = await db.admin.query<{ evidence: string; opportunities: string }>(
      `select (select count(*) from opportunity_evidence) as evidence,
              (select count(*) from opportunities) as opportunities`
    );
    assert.equal(Number(again.rows[0]?.evidence), 2, "build seam: ikinci koşum duplicate üretti");
    assert.equal(
      Number(again.rows[0]?.opportunities),
      1,
      "build seam: ikinci koşum duplicate opportunity üretti"
    );
  } finally {
    await dropTestDb(db);
  }
});
