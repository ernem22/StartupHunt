import assert from "node:assert/strict";
import test from "node:test";
import {
  composeDigest,
  falsificationNoteFor,
  NO_CANDIDATES_MESSAGE,
  renderDigestMarkdown,
  type OpportunityCard,
} from "../src/opportunities/digest.js";

function card(index: number): OpportunityCard {
  const nextStep = "Spend 15 minutes checking the bank CSV export";
  return {
    id: `opp-${index}`,
    actor: "solo bookkeeper",
    job: "bank reconciliation",
    problem: "bank transactions are matched by hand",
    workaround: "match transactions by hand",
    cost: { time: "1 hour/day", money: null },
    frequency: "daily",
    existingSolution: "accounting software bank feed",
    existingSolutionGap: "manual matching still required",
    counterArgument: "software may auto-match most invoices",
    counterArgumentStrength: "weak",
    falsificationNote: falsificationNoteFor(nextStep),
    nextStep,
    sourceCount: 2,
    communities: ["hackernews", "stackexchange"],
    firstSeen: "2026-08-01T00:00:00.000Z",
    lastSeen: "2026-08-10T00:00:00.000Z",
    quote: "I match bank transactions by hand",
    source: "hackernews",
    sourceUrl: `https://example.com/${index}`,
    author: "alice",
    observedAt: "2026-08-10T00:00:00.000Z",
  };
}

test("digest en fazla 10 kart verir, dolgu üretmez", () => {
  const digest = composeDigest(
    Array.from({ length: 12 }, (_, index) => card(index)),
    [{ reason: "missing_actor", count: 2 }]
  );

  assert.equal(digest.maxCards, 10);
  assert.equal(digest.cardCount, 10);
  assert.equal(digest.eligibleCount, 12);
  assert.equal(digest.message, null);
});

test("0 adayda mesaj ve düşme gerekçeleri markdown'a yazılır", () => {
  const digest = composeDigest(
    [],
    [
      { reason: "counter_argument_strong", count: 2 },
      { reason: "missing_next_step", count: 1 },
    ]
  );

  assert.equal(digest.cardCount, 0);
  assert.equal(digest.message, NO_CANDIDATES_MESSAGE);
  const markdown = renderDigestMarkdown(digest);
  assert.ok(markdown.includes(NO_CANDIDATES_MESSAGE));
  assert.ok(markdown.includes("counter_argument_strong: 2"));
  assert.ok(markdown.includes("missing_next_step: 1"));
  assert.doesNotMatch(markdown, /^## /m);
});

test("markdown aynı kart setini ve izlenebilir kanıtı taşır", () => {
  const digest = composeDigest([card(1), card(2)], []);
  const markdown = renderDigestMarkdown(digest);

  for (const entry of digest.cards) {
    assert.ok(markdown.includes(entry.id));
    assert.ok(markdown.includes(entry.sourceUrl));
    assert.ok(markdown.includes(entry.quote));
    assert.ok(markdown.includes(entry.observedAt!));
    assert.ok(markdown.includes(entry.falsificationNote));
    assert.ok(markdown.includes(entry.existingSolutionGap!));
    assert.ok(markdown.includes(entry.counterArgument!));
  }
  assert.equal((markdown.match(/^## /gm) ?? []).length, 2);
});
