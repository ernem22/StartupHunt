import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildQueries, classifyWebProduct, decideVerdict, isRealMatch } from "../src/tr/logic.js";
import type { TrCandidate, TrEvidence } from "../src/tr/logic.js";
import { isDirectoryResult, isTrLocalResult, parseYandexHtml, webQueries } from "../src/tr/web.js";

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
  assert.equal(isRealMatch("Bubilet", "Bubilet: Konser & Tiyatro"), true);
  assert.equal(isRealMatch("ContentsKeeper", "Sigorta Policesi"), false);
  assert.equal(isRealMatch("prepi", "Haftalık Yemek Planı"), false);
});

test("eslesme: ortak tek kelime yetmez (PDF Vault != Scanner Vault)", () => {
  assert.equal(isRealMatch("PDF Vault", "Scanner Vault: PDF & OCR Scan"), false);
  assert.equal(isRealMatch("PDF Vault", "Mockup Vault PDF Maker"), false);
  // A product name followed by a subtitle is still the same name.
  assert.equal(isRealMatch("PDF Vault", "PDF Vault - Document App"), true);
});

test("web sinifi: TrustMRR isMobileApp bayragi ozel alan adini ezer (Screeny)", () => {
  const screeny: TrCandidate = {
    name: "Screeny",
    url: "https://getscreeny.app",
    sources: ["trustmrr"],
  };
  // Custom domain + TrustMRR alone reads as web SaaS; the store-app flag must override it.
  assert.equal(classifyWebProduct(screeny), true);
  assert.equal(classifyWebProduct({ ...screeny, webProduct: false }), false);
});

test("hukum mantigi: kaydedilmis fixture ciktilari", () => {
  for (const fixture of fixtures) {
    const result = decideVerdict({
      candidate: fixture.candidate,
      queries: fixture.queries,
      evidence: fixture.evidence,
      channelErrors: { apple_tr: [], play_tr: [], web_tr: [] },
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
    channelErrors: { apple_tr: ["HTTP 500"], play_tr: [], web_tr: [] },
  });
  assert.equal(failed.verdict, "uncertain");
  assert.match(failed.reason, /Kanal hatası/);

  const none = decideVerdict({
    candidate,
    queries: ["Bilinmeyen Urun"],
    evidence: [],
    channelErrors: { apple_tr: [], play_tr: [], web_tr: [] },
  });
  assert.equal(none.verdict, "not_found");
  assert.match(none.reason, /Bilinmeyen Urun/);
});

test("web product: store miss is uncertain, never 'empty'; TR web evidence gives found", () => {
  const candidate: TrCandidate = {
    name: "Scalereach.ai",
    description: "AI video repurposing tool for short clips",
    url: "https://scalereach.ai",
    sources: ["trustmrr"],
  };
  assert.equal(classifyWebProduct(candidate), true);
  assert.equal(
    classifyWebProduct({ name: "Oyun", url: "https://apps.apple.com/tr/app/id1" }),
    false,
  );
  const miss = decideVerdict({
    candidate,
    queries: ["Scalereach.ai"],
    evidence: [],
    channelErrors: { apple_tr: [], play_tr: [], web_tr: [] },
  });
  assert.equal(miss.verdict, "uncertain");
  assert.match(miss.reason, /mağazada bulunamadı/);
  assert.doesNotMatch(miss.reason, /boş/);

  const found = decideVerdict({
    candidate,
    queries: ["Scalereach.ai", "video klip aracı"],
    evidence: [],
    channelErrors: { apple_tr: [], play_tr: [], web_tr: [] },
    webEvidence: [
      {
        channel: "web_tr",
        name: "AI Video Klip | örnek.com.tr",
        id: "ornek.com.tr",
        url: "https://ornek.com.tr/ai-video-klip",
      },
    ],
  });
  assert.equal(found.verdict, "found");
  assert.match(found.reason, /TR web kanalında ad eşleşmesi/);

  const similarOnly = decideVerdict({
    candidate,
    queries: ["Scalereach.ai", "yapay zeka video aracı"],
    evidence: [],
    channelErrors: { apple_tr: [], play_tr: [], web_tr: [] },
    webEvidence: [
      {
        channel: "web_tr",
        name: "Ücretsiz Yapay Zeka Video Oluşturucu",
        id: "similar:video.com.tr",
        url: "https://video.com.tr",
      },
    ],
  });
  assert.equal(similarOnly.verdict, "uncertain");
  assert.match(similarOnly.reason, /yalnızca benzer ürünler/);
});

test("Yandex TR parser: keeps short result titles/links and detects Turkish-localized pages", () => {
  const html = `<a class="Link OrganicTitle-Link" href="https://www.kapwing.com/tr/ai/clip-maker">AI Clip Maker: Ücretsiz Dene</a>
  <a class="Link OrganicTitle-Link" href="https://www.scalereach.ai/">Turn One Video Into Viral Shorts</a>`;
  const results = parseYandexHtml(html);
  assert.equal(results.length, 2);
  assert.deepEqual(webQueries("Scalereach.ai", "AI video clips tool"), [
    "Scalereach.ai",
    "yapay zeka video aracı",
  ]);
  assert.equal(isTrLocalResult("www.kapwing.com", "AI Clip Maker: Ücretsiz Dene"), true);
  assert.equal(isTrLocalResult("www.scalereach.ai", "Turn One Video Into Viral Shorts"), false);
  assert.equal(isDirectoryResult("unite.ai", "En İyi 10 Yapay Zeka Uygulaması"), true);
  assert.equal(
    isDirectoryResult("ekatalox.com", "Online Katalog ve WhatsApp Sipariş Sistemi"),
    false,
  );
});
