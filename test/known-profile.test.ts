import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { loadKnownProfile, scoreCard } from "../src/opportunities/profile.js";

const fixtureRoot = path.join(import.meta.dirname, "fixtures", "known-profile");

test("profil fixture dokümanından terim frekansı ve doküman frekansı çıkarır", () => {
  const profile = loadKnownProfile({ roots: [fixtureRoot] });

  assert.equal(profile.documentCount, 1);
  assert.ok(profile.documentCounts.has("invoice"));
  assert.ok(profile.documentCounts.has("reconciliation"));
  assert.ok((profile.tokenCounts.get("invoice") ?? 0) >= 1);
});

test("profildeki terimleri içeren kart likely_known olur", () => {
  const profile = loadKnownProfile({ roots: [fixtureRoot] });
  const score = scoreCard(profile, {
    actor: "solo bookkeeper",
    job: "invoice reconciliation",
    problem: "bank transactions are matched to invoices by hand",
    workaround: "match bank transactions to invoices by hand",
  });

  assert.equal(score.likelyKnown, "likely_known");
  assert.notEqual(score.knownReason, "profilde eşleşme yok");
  assert.match(score.knownReason, /invoice|reconciliation|transactions/);
});

test("ilgisiz kart likely_new olur ve eşleşme yok gerekçesi taşır", () => {
  const profile = loadKnownProfile({ roots: [fixtureRoot] });
  const score = scoreCard(profile, {
    actor: "poultry farmer",
    job: "barn ventilation",
    problem: "drone flights disturb the hens",
    workaround: null,
  });

  assert.equal(score.likelyKnown, "likely_new");
  assert.equal(score.knownReason, "profilde eşleşme yok");
});

test("kısmi kapsama uncertain verir", () => {
  const profile = loadKnownProfile({ roots: [fixtureRoot] });
  const score = scoreCard(profile, {
    actor: "poultry farmer",
    job: "invoice reconciliation",
    problem: "barn ventilation and drone flights",
    workaround: null,
  });

  assert.equal(score.likelyKnown, "uncertain");
  assert.match(score.knownReason, /invoice|reconciliation/);
});
