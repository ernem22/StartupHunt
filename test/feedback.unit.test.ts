import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DROP_WEEKS,
  dropWeeks,
  isSuppressed,
  type DropEvent,
  type FeedbackCard,
} from "../src/opportunities/feedback.js";

const card: FeedbackCard = {
  id: "card-a",
  actor: "solo bookkeeper",
  job: "bank reconciliation",
  problem: "bank transactions are matched to invoices by hand",
};

const drop: DropEvent = {
  opportunityKey: "card-a",
  actor: "solo bookkeeper",
  job: "bank reconciliation",
  problem: "bank transactions are matched to invoices by hand",
};

test("drop penceresi varsayılan 8 hafta ve env ile override edilir", () => {
  const previous = process.env.OPPORTUNITY_DROP_WEEKS;
  try {
    delete process.env.OPPORTUNITY_DROP_WEEKS;
    assert.equal(dropWeeks(), DEFAULT_DROP_WEEKS);
    process.env.OPPORTUNITY_DROP_WEEKS = "3";
    assert.equal(dropWeeks(), 3);
    process.env.OPPORTUNITY_DROP_WEEKS = "geçersiz";
    assert.equal(dropWeeks(), DEFAULT_DROP_WEEKS);
  } finally {
    if (previous === undefined) {
      delete process.env.OPPORTUNITY_DROP_WEEKS;
    } else {
      process.env.OPPORTUNITY_DROP_WEEKS = previous;
    }
  }
});

test("aynı opportunity_key drop ile bastırılır", () => {
  assert.equal(isSuppressed("card-a", card, [drop]), true);
});

test("aynı actor+job taşıyan benzer kart drop ile bastırılır", () => {
  const similar = {
    ...card,
    id: "card-b",
    problem: "payments are reconciled to invoices manually each morning",
  };
  assert.equal(isSuppressed(similar.id, similar, [drop]), true);
});

test("problem Jaccard 0.9 üstü olan kart drop ile bastırılır", () => {
  const similar = {
    ...card,
    id: "card-c",
    actor: "freelance accountant",
    job: "monthly close",
    problem: "bank transactions are matched to invoices by hand",
  };
  assert.equal(isSuppressed(similar.id, similar, [drop]), true);
});

test("ilgisiz kart drop ile bastırılmaz", () => {
  const unrelated = {
    ...card,
    id: "card-d",
    actor: "dental clinic owner",
    job: "payroll",
    problem: "payroll runs take a full day every month",
  };
  assert.equal(isSuppressed(unrelated.id, unrelated, [drop]), false);
});
