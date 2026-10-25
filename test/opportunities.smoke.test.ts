import "dotenv/config";
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
  type SeedObservation,
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

const bankReconciliationObservations: SeedObservation[] = [
  {
    source: "hackernews",
    sourceId: "hn-8010",
    sourceUrl: "https://news.ycombinator.com/item?id=8010",
    title: "Bank reconciliation",
    text: "I am a solo bookkeeper and I match bank transactions to invoices by hand every day. It takes an hour each day.",
    author: "oscar",
    observedAt: new Date("2026-08-09T00:00:00.000Z"),
    language: "en",
  },
  {
    source: "stackexchange",
    sourceId: "se-8011",
    sourceUrl: "https://stackoverflow.com/q/8011",
    title: "Bank reconciliation again",
    text: "As a solo bookkeeper I still match bank transactions to invoices manually every day; it costs me about an hour a day.",
    author: "peggy",
    observedAt: new Date("2026-08-10T00:00:00.000Z"),
    language: "en",
  },
];

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

  let failed = false;
  let failure: unknown;

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
        {
          source: "hackernews",
          sourceId: "hn-5005",
          sourceUrl: "https://news.ycombinator.com/item?id=5005",
          title: "Tax forms",
          text: "As a solo founder I retype quarterly tax forms by hand; it takes two hours per quarter.",
          author: "dave",
          observedAt: new Date("2026-08-01T00:00:00.000Z"),
          language: "en",
          metadata: { parent_story_id: "5005" },
        },
        {
          source: "hackernews",
          sourceId: "hn-5006",
          sourceUrl: "https://news.ycombinator.com/item?id=5006",
          title: "Tax forms again",
          text: "I am a solo founder and I retype quarterly tax forms by hand every quarter.",
          author: "erin",
          observedAt: new Date("2026-08-02T00:00:00.000Z"),
          language: "en",
          metadata: { parent_story_id: "5005" },
        },
        {
          source: "hackernews",
          sourceId: "hn-7007",
          sourceUrl: "https://news.ycombinator.com/item?id=7007",
          title: "Payroll",
          text: "I run a small shop; payroll takes me a full day every month because I run payroll manually.",
          author: "frank",
          observedAt: new Date("2026-08-03T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "stackexchange",
          sourceId: "se-8008",
          sourceUrl: "https://stackoverflow.com/q/8008",
          title: "Client reports",
          text: "I copy metrics into slides by hand every week for client reporting.",
          author: "grace",
          observedAt: new Date("2026-08-04T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "stackexchange",
          sourceId: "se-9009",
          sourceUrl: "https://stackoverflow.com/q/9009",
          title: "Receipts",
          text: "I am an indie hacker and I file receipts by hand every month.",
          author: "heidi",
          observedAt: new Date("2026-08-05T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "hackernews",
          sourceId: "hn-6006",
          sourceUrl: "https://news.ycombinator.com/item?id=6006",
          title: "Dashboards",
          text: "As a solo consultant I rebuild weekly dashboards by hand, which takes three hours every week.",
          author: "ivan",
          observedAt: new Date("2026-08-06T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "stackexchange",
          sourceId: "se-6007",
          sourceUrl: "https://stackoverflow.com/q/6007",
          title: "Dashboards copy",
          text: "As a solo consultant I rebuild my weekly dashboards by hand, which takes three hours every week.",
          author: "judy",
          observedAt: new Date("2026-08-07T00:00:00.000Z"),
          language: "en",
        },
        {
          source: "hackernews",
          sourceId: "hn-8008",
          sourceUrl: "https://news.ycombinator.com/item?id=8008",
          title: "Insurance claims",
          text: "I own a two-chair dental clinic and every Friday I reconcile insurance claims against payments by hand. It takes about six hours every week.",
          author: "mallory",
          observedAt: new Date("2026-08-08T00:00:00.000Z"),
          language: "en",
        },
        ...bankReconciliationObservations,
      ]);
    } catch (error) {
      throw new Error(`seed seam: ${message(error)}`);
    }
    assert.equal(ids.length, 13, "seed seam: on fixture observation seed edilemedi");

    const buildOut = runOpportunitiesCli(
      "build",
      ["build", "--fixture", fixturePath],
      db.url
    );
    assert.match(
      buildOut,
      /build: observations=13 evidence=5 opportunities=3 signals=7 skipped=1/,
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

    assert.equal(digest.cardCount, 3, "digest seam: kart sayısı");
    assert.equal(digest.cards.length, 3, "digest seam: kart listesi");
    assert.equal(digest.eligibleCount, 3, "digest seam: uygun aday sayısı");
    assert.equal(digest.maxCards, 10, "digest seam: haftalık kart sınırı");
    assert.equal(digest.message, null, "digest seam: aday varken mesaj olmamalı");
    assert.deepEqual(
      digest.dropped,
      [
        { reason: "counter_argument_strong", count: 1 },
        { reason: "missing_actor", count: 1 },
        { reason: "missing_next_step", count: 1 },
        { reason: "same_thread", count: 1 },
        { reason: "single_source_without_next_step", count: 1 },
      ],
      "digest seam: düşme gerekçeleri sayılmadı"
    );
    const card = digest.cards.find((candidate) => candidate.job === "invoicing")!;
    assert.equal(card.actor, "one-person agency owner", "digest seam: aktör");
    assert.equal(card.job, "invoicing", "digest seam: iş");
    assert.equal(
      card.workaround,
      "copy invoices from Gmail into a spreadsheet by hand",
      "digest seam: workaround"
    );
    assert.equal(
      card.existingSolution,
      "Gmail saved search plus CSV export",
      "digest seam: bilinen çözüm"
    );
    assert.equal(
      card.existingSolutionGap,
      "still requires copying each invoice into the spreadsheet by hand",
      "digest seam: bilinen çözüm gerekçesi"
    );
    assert.equal(
      card.counterArgument,
      "agencies are small and may tolerate four hours a month",
      "digest seam: karşı görüş"
    );
    assert.equal(card.counterArgumentStrength, "weak", "digest seam: karşı görüş gücü");
    assert.match(
      card.falsificationNote,
      /^Yanlışlama: "Spend 15 minutes checking whether a saved Gmail search plus CSV export removes the manual copy" adımı sorunu çözüyorsa bu fırsat düşer\.$/,
      "digest seam: yanlışlama notu"
    );
    assert.equal(card.sourceCount, 2, "digest seam: bağımsız kaynak sayısı");
    assert.equal(
      card.nextStep,
      "Spend 15 minutes checking whether a saved Gmail search plus CSV export removes the manual copy",
      "digest seam: next step"
    );
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

    const secondBuildOut = runOpportunitiesCli(
      "build",
      ["build", "--fixture", fixturePath],
      db.url
    );
    assert.match(
      secondBuildOut,
      /build: observations=13 evidence=5 opportunities=3 signals=7 skipped=1/,
      "build seam: ikinci koşum aynı sayıları vermedi"
    );
    const secondDigest = JSON.parse(
      runOpportunitiesCli("digest", ["digest", "--format", "json"], db.url)
    ) as Digest;
    assert.deepEqual(
      secondDigest,
      digest,
      "digest seam: JSON çıktı stabil değil"
    );

    const markdown = runOpportunitiesCli("digest", ["digest", "--format", "md"], db.url);
    assert.equal(
      (markdown.match(/^## /gm) ?? []).length,
      digest.cardCount,
      "digest seam: markdown kart sayısı JSON ile aynı değil"
    );
    assert.equal(
      (markdown.match(/\*\*Yanlışlama notu:\*\*/g) ?? []).length,
      digest.cardCount,
      "digest seam: markdown yanlışlama notu eksik"
    );
    for (const cardEntry of digest.cards) {
      assert.ok(markdown.includes(cardEntry.id), "digest seam: markdown kart kimliği eksik");
      assert.ok(markdown.includes(cardEntry.sourceUrl), "digest seam: markdown kaynak linki eksik");
      assert.ok(markdown.includes(cardEntry.quote), "digest seam: markdown quote eksik");
      assert.ok(markdown.includes(cardEntry.observedAt!), "digest seam: markdown tarih eksik");
    }
    assert.ok(
      !markdown.includes("https://news.ycombinator.com/item?id=8008"),
      "digest seam: güçlü karşı görüşlü aday markdown'a sızdı"
    );

    const singleSourceCard = digest.cards.find(
      (candidate) => candidate.job === "client reporting"
    )!;
    assert.equal(singleSourceCard.sourceCount, 1, "digest seam: tek kaynak istisnası");
    assert.equal(
      singleSourceCard.nextStep,
      "Spend 15 minutes checking if a report template removes the manual copy",
      "digest seam: tek kaynak next step"
    );

    const dashboardCards = digest.cards.filter((candidate) => candidate.job === "dashboards");
    assert.equal(dashboardCards.length, 1, "digest seam: yakın-duplicate tek fırsat üretmedi");
    assert.equal(
      dashboardCards[0]?.sourceCount,
      1,
      "digest seam: yakın-duplicate bağımsız kaynak sayısı"
    );

    const signals = await db.admin.query<{ reason: string; count: string }>(
      `select reason, count(*) as count
         from opportunity_signals
        group by reason
        order by reason`
    );
    assert.deepEqual(
      signals.rows.map((row) => [row.reason, Number(row.count)]),
      [
        ["counter_argument_strong", 1],
        ["missing_actor", 1],
        ["missing_next_step", 2],
        ["same_thread", 2],
        ["single_source_without_next_step", 1],
      ],
      "build seam: reddedilen adaylar gerekçesiyle saklanmadı"
    );

    const archived = await db.admin.query<{ quote: string }>(
      `select draft->>'quote' as quote
         from opportunity_signals s
         join observations o on o.id = s.observation_id
        where o.source_id = 'se-9009'`
    );
    assert.equal(
      archived.rows[0]?.quote,
      "I file receipts by hand every month",
      "build seam: sinyal draft'ı saklanmadı"
    );

    const signalSources = await db.admin.query<{ source_count: number }>(
      `select distinct source_count from opportunity_signals order by source_count`
    );
    assert.deepEqual(
      signalSources.rows.map((row) => Number(row.source_count)),
      [1, 2],
      "build seam: sinyal kaynak sayısı saklanmadı"
    );

    const strongCounter = await db.admin.query<{ reason: string; strength: string }>(
      `select reason, draft->>'counterArgumentStrength' as strength
         from opportunity_signals s
         join observations o on o.id = s.observation_id
        where o.source_id = 'hn-8008'`
    );
    assert.deepEqual(
      strongCounter.rows.map((row) => [row.reason, row.strength]),
      [["counter_argument_strong", "strong"]],
      "build seam: güçlü karşı görüş gerekçesiyle arşivlenmedi"
    );

    const counts = await db.admin.query<{ evidence: string; opportunities: string }>(
      `select (select count(*) from opportunity_evidence) as evidence,
              (select count(*) from opportunities) as opportunities`
    );
    assert.equal(Number(counts.rows[0]?.evidence), 5, "build seam: evidence sayısı");
    assert.equal(Number(counts.rows[0]?.opportunities), 3, "build seam: opportunity sayısı");
  } catch (error) {
    failed = true;
    failure = error;
  }

  try {
    await dropTestDb(db);
  } catch (error) {
    if (!failed) {
      throw new Error(`cleanup seam: ${message(error)}`);
    }
    console.error(`cleanup seam: ${message(error)}`);
  }

  if (failed) {
    throw failure;
  }
});

test("opportunity smoke: 0 uygun aday -> dolgusuz digest", { skip: skipReason }, async () => {
  let db: TestDb;
  try {
    db = await createTestDb(testDatabaseUrl!);
  } catch (error) {
    throw new Error(`setup seam: ${message(error)}`);
  }

  let failed = false;
  let failure: unknown;

  try {
    try {
      await seedObservations(db, bankReconciliationObservations);
    } catch (error) {
      throw new Error(`seed seam: ${message(error)}`);
    }

    const buildOut = runOpportunitiesCli(
      "build",
      ["build", "--fixture", fixturePath],
      db.url
    );
    assert.match(
      buildOut,
      /build: observations=2 evidence=0 opportunities=0 signals=2 skipped=0/,
      "build seam: kapıyı geçmeyen aday fırsata dönüştü"
    );

    const digest = JSON.parse(
      runOpportunitiesCli("digest", ["digest", "--format", "json"], db.url)
    ) as Digest;
    assert.equal(digest.cardCount, 0, "digest seam: dolgu kartı üretildi");
    assert.equal(digest.eligibleCount, 0, "digest seam: uygun aday sayısı");
    assert.deepEqual(digest.cards, [], "digest seam: kart listesi boş değil");
    assert.equal(
      digest.message,
      "Bu hafta araştırmaya değer bir şey yok.",
      "digest seam: aday yok mesajı"
    );
    assert.deepEqual(
      digest.dropped,
      [{ reason: "missing_next_step", count: 1 }],
      "digest seam: düşme gerekçesi sayılmadı"
    );

    const markdown = runOpportunitiesCli("digest", ["digest", "--format", "md"], db.url);
    assert.ok(
      markdown.includes("Bu hafta araştırmaya değer bir şey yok."),
      "digest seam: markdown aday yok mesajı eksik"
    );
    assert.ok(
      markdown.includes("missing_next_step: 1"),
      "digest seam: markdown düşme gerekçesi eksik"
    );
    assert.doesNotMatch(markdown, /^## /m, "digest seam: markdown dolgu kartı üretti");
  } catch (error) {
    failed = true;
    failure = error;
  }

  try {
    await dropTestDb(db);
  } catch (error) {
    if (!failed) {
      throw new Error(`cleanup seam: ${message(error)}`);
    }
    console.error(`cleanup seam: ${message(error)}`);
  }

  if (failed) {
    throw failure;
  }
});
