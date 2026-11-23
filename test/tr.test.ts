import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildQueries, decideVerdict, isRealMatch } from "../src/tr/logic.js";
import type { TrCandidate, TrEvidence } from "../src/tr/logic.js";

type Fixture = {
  candidate: TrCandidate;
  queries: string[];
  evidence: TrEvidence[];
  expected: { verdict: string; reasonContains: string[] };
};

const fixtures = JSON.parse(
  readFileSync(new URL("./fixtures/tr-verdicts.json", import.meta.url), "utf8"),
) as Fixture[];

test("sorgu uretimi: ad + TR + EN anahtar kelime sorgulari (fixtures)", () => {
  for (const fixture of fixtures) {
    assert.deepEqual(buildQueries(fixture.candidate), fixture.queries, fixture.candidate.name);
  }
});

test("eslesme: gercek benzerlik ve anahtar kelime cakismasi", () => {
  assert.equal(isRealMatch("Bubilet", "Bubilet: Konser & Tiyatro", "Bubilet"), true);
  assert.equal(
    isRealMatch("ContentsKeeper", "Sigorta Policesi", "ev eşyası envanteri sigorta"),
    false,
  );
  assert.equal(
    isRealMatch("prepi", "Haftalık Yemek Planı", "haftalık yemek planı market listesi"),
    false,
  );
});

test("hukum mantigi: kaydedilmis fixture ciktilari", () => {
  for (const fixture of fixtures) {
    const result = decideVerdict({
      candidate: fixture.candidate,
      queries: fixture.queries,
      evidence: fixture.evidence,
      channelErrors: { apple_tr: [], play_tr: [] },
    });
    assert.equal(result.verdict, fixture.expected.verdict, fixture.candidate.name);
    for (const fragment of fixture.expected.reasonContains) {
      assert.ok(result.reason.includes(fragment), `${fixture.candidate.name}: ${fragment}`);
    }
    assert.ok(result.queries.length > 0, "hukum sorgusuz yazilamaz");
  }
});

test("hukum mantigi: kanal hatasi uncertain uretir, bos sonuc not_found olur", () => {
  const candidate: TrCandidate = { name: "Bilinmeyen Urun", description: "test" };
  const failed = decideVerdict({
    candidate,
    queries: ["Bilinmeyen Urun"],
    evidence: [],
    channelErrors: { apple_tr: ["HTTP 500"], play_tr: [] },
  });
  assert.equal(failed.verdict, "uncertain");
  assert.match(failed.reason, /Kanal hatası/);

  const none = decideVerdict({
    candidate,
    queries: ["Bilinmeyen Urun"],
    evidence: [],
    channelErrors: { apple_tr: [], play_tr: [] },
  });
  assert.equal(none.verdict, "not_found");
  assert.match(none.reason, /Bilinmeyen Urun/);
});
