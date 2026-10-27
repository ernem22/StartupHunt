import "dotenv/config";
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import type { Digest } from "../src/opportunities/digest.js";
import {
  createTestDb,
  dropTestDb,
  runOpportunitiesCli,
  seedObservations,
  type SeedObservation,
  type TestDb,
} from "./helpers/test-db.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixturePath = path.join(repoRoot, "test", "fixtures", "feedback-extraction.json");
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const skipReason = testDatabaseUrl
  ? false
  : "TEST_DATABASE_URL yok: DB feedback testi atlandı (CI'da tam koşar)";

const observations: SeedObservation[] = [
  {
    source: "hackernews",
    sourceId: "hn-f1",
    sourceUrl: "https://news.ycombinator.com/item?id=f1",
    title: "Bank reconciliation",
    text: "I match bank transactions to invoices by hand every day. It takes about an hour each day.",
    author: "oscar",
    observedAt: new Date("2026-09-01T00:00:00.000Z"),
    language: "en",
  },
  {
    source: "stackexchange",
    sourceId: "se-f2",
    sourceUrl: "https://stackoverflow.com/q/f2",
    title: "Bank reconciliation again",
    text: "I reconcile payments to invoices manually every morning. It costs me about an hour a day.",
    author: "peggy",
    observedAt: new Date("2026-09-02T00:00:00.000Z"),
    language: "en",
  },
  {
    source: "hackernews",
    sourceId: "hn-f3",
    sourceUrl: "https://news.ycombinator.com/item?id=f3",
    title: "Payroll",
    text: "payroll takes me a full day every month because I run it manually.",
    author: "frank",
    observedAt: new Date("2026-09-03T00:00:00.000Z"),
    language: "en",
  },
];

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readDigest(url: string, extra: string[] = []): Digest {
  const output = runOpportunitiesCli("digest", ["digest", "--format", "json", ...extra], url);
  return JSON.parse(output) as Digest;
}

test("feedback: event kaydı, drop bastırma ve geri gelme", { skip: skipReason }, async () => {
  let db: TestDb;
  try {
    db = await createTestDb(testDatabaseUrl!);
  } catch (error) {
    throw new Error(`setup seam: ${message(error)}`, { cause: error });
  }

  let failed = false;
  let failure: unknown;

  try {
    try {
      await seedObservations(db, observations);
    } catch (error) {
      throw new Error(`seed seam: ${message(error)}`, { cause: error });
    }

    const buildOut = runOpportunitiesCli("build", ["build", "--fixture", fixturePath], db.url);
    assert.match(
      buildOut,
      /build: observations=3 evidence=3 opportunities=3 signals=0 skipped=0/,
      "build seam: beklenen fırsat sayıları",
    );

    await db.admin.query(
      `insert into patterns (name, status, review_status)
       values ('BU pattern', 'active', 'interesting')`,
    );

    const patternBefore = await db.admin.query<{ row: unknown }>(
      "select to_jsonb(p) as row from patterns p",
    );
    const countsBefore = await db.admin.query<{
      opportunities: string;
      evidence: string;
    }>(
      `select (select count(*) from opportunities) as opportunities,
              (select count(*) from opportunity_evidence) as evidence`,
    );

    const digestBefore = readDigest(db.url);
    assert.equal(digestBefore.cardCount, 3, "digest seam: başlangıç kart sayısı");
    for (const card of digestBefore.cards) {
      assert.ok(
        ["likely_new", "uncertain", "likely_known"].includes(card.likelyKnown),
        "digest seam: likelyKnown alanı eksik",
      );
      assert.notEqual(card.knownReason.trim(), "", "digest seam: knownReason boş");
    }

    const cardA = digestBefore.cards.find((card) => card.problem.startsWith("bank transactions"))!;
    const cardB = digestBefore.cards.find((card) => card.problem.startsWith("payments"))!;
    const cardC = digestBefore.cards.find((card) => card.job === "payroll")!;
    assert.ok(cardA && cardB && cardC, "digest seam: beklenen kartlar bulunamadı");

    const eventSummaries = [
      runOpportunitiesCli("feedback", ["feedback", "--id", cardA.id, "--verdict", "open"], db.url),
      runOpportunitiesCli(
        "feedback",
        ["feedback", "--id", cardB.id, "--verdict", "investigate"],
        db.url,
      ),
      runOpportunitiesCli(
        "feedback",
        ["feedback", "--id", cardA.id, "--verdict", "knew", "--note", "zaten biliyordum"],
        db.url,
      ),
      runOpportunitiesCli("feedback", ["feedback", "--id", cardA.id, "--verdict", "drop"], db.url),
    ];
    for (const summary of eventSummaries) {
      assert.match(
        summary.trim(),
        /^feedback: key=\S+ verdict=\S+ at=\S+$/,
        "feedback seam: özet satırı",
      );
    }

    const events = await db.admin.query<{ verdict: string; created_at: Date }>(
      "select verdict, created_at from opportunity_feedback order by id",
    );
    assert.deepEqual(
      events.rows.map((row) => row.verdict),
      ["open", "investigate", "knew", "drop"],
      "feedback seam: event sırası",
    );
    for (const event of events.rows) {
      assert.ok(event.created_at instanceof Date, "feedback seam: zaman damgası eksik");
    }

    const digestAfter = readDigest(db.url);
    assert.equal(digestAfter.cardCount, 1, "digest seam: drop sonrası kart sayısı");
    assert.equal(digestAfter.cards[0]?.id, cardC.id, "digest seam: yanlış kart bastırıldı");

    const markdown = runOpportunitiesCli("digest", ["digest", "--format", "md"], db.url);
    assert.equal((markdown.match(/^## /gm) ?? []).length, 1, "digest seam: markdown kart sayısı");
    assert.ok(markdown.includes(cardC.id), "digest seam: markdown kart kimliği eksik");
    assert.ok(!markdown.includes(cardA.id), "digest seam: drop edilen kart markdown'a sızdı");
    assert.ok(
      markdown.includes("**Bilinen profil:**"),
      "digest seam: markdown profil satırı eksik",
    );
    assert.ok(markdown.includes(cardC.knownReason), "digest seam: markdown knownReason eksik");

    const countsAfter = await db.admin.query<{
      opportunities: string;
      evidence: string;
    }>(
      `select (select count(*) from opportunities) as opportunities,
              (select count(*) from opportunity_evidence) as evidence`,
    );
    assert.deepEqual(
      countsAfter.rows,
      countsBefore.rows,
      "feedback seam: drop kanıt/opportunity satırlarını sildi",
    );

    const patternAfter = await db.admin.query<{ row: unknown }>(
      "select to_jsonb(p) as row from patterns p",
    );
    assert.deepEqual(
      patternAfter.rows,
      patternBefore.rows,
      "feedback seam: review_status/BU değişti",
    );

    const future = new Date(Date.now() + 9 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const restored = readDigest(db.url, ["--now", future]);
    assert.equal(restored.cardCount, 3, "digest seam: drop penceresi bitince kart dönmedi");
    assert.deepEqual(
      restored.cards.map((card) => card.id).sort(),
      digestBefore.cards.map((card) => card.id).sort(),
      "digest seam: geri gelen kart seti farklı",
    );
  } catch (error) {
    failed = true;
    failure = error;
  }

  try {
    await dropTestDb(db);
  } catch (error) {
    if (!failed) {
      throw new Error(`cleanup seam: ${message(error)}`, { cause: error });
    }
    console.error(`cleanup seam: ${message(error)}`);
  }

  if (failed) {
    throw failure;
  }
});
