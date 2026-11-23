import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  isDirectoryResult,
  isForeignLocaleHost,
  isNonCompetitorHost,
  isTrLocalResult,
  webEvidenceFromHtml,
} from "../src/tr/web.js";

const appzokuSerp = readFileSync(
  new URL("./fixtures/yandex-appzoku.html", import.meta.url),
  "utf8",
);

test("AppZoku SERP: scanner, whois, ranking, review and foreign-locale pages are not evidence", () => {
  const evidence = webEvidenceFromHtml("AppZoku", appzokuSerp, true);
  const hosts = evidence.map((item) => item.url);
  assert.equal(
    hosts.some((url) => url.includes("gridinsoft")),
    false,
    "gridinsoft scanner page must not count",
  );
  assert.equal(
    hosts.some((url) => url.includes("whois") || url.includes("similarweb")),
    false,
  );
  assert.equal(
    hosts.some((url) => url.includes("trustpilot")),
    false,
  );
  assert.equal(
    hosts.some((url) => url.includes("es.appzoku")),
    false,
  );
});

test("AppZoku SERP: a real TR page naming the product is an exact match (found)", () => {
  const evidence = webEvidenceFromHtml("AppZoku", appzokuSerp, true);
  const exact = evidence.filter((item) => !item.id.startsWith("similar:"));
  assert.deepEqual(
    exact.map((item) => item.id),
    ["www.pazarlamaci.com.tr"],
  );
});

test("TR roundup pages with 'En İyi' headers are not competitors", () => {
  const evidence = webEvidenceFromHtml("AppZoku", appzokuSerp, true);
  assert.equal(
    evidence.some((item) => item.url.includes("en-iyi-pazarlama")),
    false,
  );
  assert.equal(isDirectoryResult("www.example.com.tr", "En İyi 10 Pazarlama Aracı"), true);
});

test("similar-only results never produce an exact match when the query is not the first", () => {
  const evidence = webEvidenceFromHtml("AppZoku", appzokuSerp, false);
  assert.ok(evidence.length > 0);
  assert.equal(
    evidence.every((item) => item.id.startsWith("similar:")),
    true,
  );
});

test("denylist covers subdomains of scanner, whois, review and ranking domains", () => {
  assert.equal(isNonCompetitorHost("pt.gridinsoft.com"), true);
  assert.equal(isNonCompetitorHost("gridinsoft.com"), true);
  assert.equal(isNonCompetitorHost("www.whois.com"), true);
  assert.equal(isNonCompetitorHost("www.similarweb.com"), true);
  assert.equal(isNonCompetitorHost("www.trustpilot.com"), true);
  assert.equal(isNonCompetitorHost("www.virustotal.com"), true);
  // Substring matches must not hit unrelated domains.
  assert.equal(isNonCompetitorHost("notgridinsoft.com"), false);
  assert.equal(isNonCompetitorHost("appzoku.com.tr"), false);
  assert.equal(isNonCompetitorHost("www.pazarlamaci.com.tr"), false);
});

test("foreign language subdomains are not TR, even with Turkish-looking characters", () => {
  assert.equal(isForeignLocaleHost("pt.gridinsoft.com"), true);
  assert.equal(isForeignLocaleHost("es.appzoku.example.com"), true);
  assert.equal(isForeignLocaleHost("www.pazarlamaci.com.tr"), false);
  assert.equal(isForeignLocaleHost("tr.elfsight.com"), false);
  // Portuguese "ç" alone must not make a page TR-localized.
  assert.equal(isTrLocalResult("pt.gridinsoft.com", "Verificação de segurança"), false);
  assert.equal(isTrLocalResult("pt.example.com", "AppZoku Ücretsiz"), false);
  assert.equal(isTrLocalResult("www.pazarlamaci.com.tr", "AppZoku Alternatifi"), true);
});
