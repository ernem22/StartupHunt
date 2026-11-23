import type { TrEvidence } from "./logic.js";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const YANDEX = "https://yandex.com.tr/search/?lr=213&text=";

/** English product-description words mapped to Turkish search terms for the web channel. */
const TR_TERMS: Record<string, string> = {
  ai: "yapay zeka",
  video: "video",
  clips: "klip",
  clip: "klip",
  meal: "yemek",
  grocery: "market",
  budget: "bütçe",
  inventory: "envanter",
  insurance: "sigorta",
  marketing: "pazarlama",
  catalog: "katalog",
  orders: "sipariş",
  chatbot: "sohbet botu",
  encryption: "şifreleme",
  design: "tasarım",
  mockup: "maket",
  booking: "rezervasyon",
  ticket: "bilet",
  notes: "not",
  spreadsheet: "tablo",
  sheets: "tablo",
  email: "e-posta",
  resume: "cv",
  photo: "fotoğraf",
  photos: "fotoğraf",
};

/** Builds at most two short Turkish keyword queries; never a long headline. */
export function webQueries(name: string, description?: string): string[] {
  const queries = [name];
  if (!description) return queries;
  const words = description
    .toLowerCase()
    .replace(/[^a-zçğıöşü\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2);
  const terms: string[] = [];
  for (const word of words) {
    const term = TR_TERMS[word];
    if (term && !terms.includes(term)) terms.push(term);
    if (terms.length === 2) break;
  }
  if (terms.length > 0) queries.push(`${terms.join(" ")} aracı`);
  return queries;
}

/**
 * Scanner, whois, review and ranking sites mention product names but are never TR competitors.
 * Matched on the registrable domain and its subdomains (pt.gridinsoft.com → gridinsoft.com).
 */
const NON_COMPETITOR_DOMAINS = [
  "gridinsoft.com",
  "virustotal.com",
  "urlvoid.com",
  "scamadviser.com",
  "sucuri.net",
  "urlscan.io",
  "whois.com",
  "who.is",
  "domaintools.com",
  "similarweb.com",
  "semrush.com",
  "ahrefs.com",
  "alexa.com",
  "trustpilot.com",
  "sitejabber.com",
  "g2.com",
  "capterra.com",
  "alternativeto.net",
];

/** Language subdomains (pt.x.com, es.x.com): a page there is not Turkish evidence. */
const FOREIGN_LOCALE_LABELS = new Set([
  "pt",
  "es",
  "de",
  "fr",
  "it",
  "ru",
  "ar",
  "nl",
  "pl",
  "ja",
  "zh",
  "ko",
  "hi",
  "vi",
  "id",
  "th",
]);

export function isNonCompetitorHost(host: string): boolean {
  const lowerHost = host.toLowerCase();
  return NON_COMPETITOR_DOMAINS.some(
    (domain) => lowerHost === domain || lowerHost.endsWith(`.${domain}`),
  );
}

export function isForeignLocaleHost(host: string): boolean {
  const labels = host.toLowerCase().split(".");
  return labels.length >= 3 && FOREIGN_LOCALE_LABELS.has(labels[0]!);
}

/** Directory/roundup pages are not competitors; they must not create a "found" verdict. */
export function isDirectoryResult(host: string, title: string): boolean {
  return (
    /\b(?:en iyi|top \d|\d+ (?:iyi|en iyi)|araçları|araçlar|listesi|dizin|directory|roundup|kataloğu)\b/i.test(
      title.toLocaleLowerCase("tr-TR"),
    ) || /(?:^|\.)(?:unite\.ai|blackseaai|toolify|there's an ai for that|taaft)\b/i.test(host)
  );
}

/** True when a Yandex result is TR-localized (domain, path or explicitly Turkish title). */
export function isTrLocalResult(host: string, title: string): boolean {
  const lowerHost = host.toLowerCase();
  if (isForeignLocaleHost(lowerHost)) return false;
  if (lowerHost.endsWith(".com.tr") || lowerHost.endsWith(".tr")) return true;
  if (/(^|\/)(tr|tr-tr|tr_TR)(\/|$)/i.test(lowerHost + title)) return true;
  return /[\u011f\u0131\u015f\u00fc\u00f6\u00e7\u011e\u0130\u015e\u00dc\u00d6\u00c7]|\b(yapay zeka|aracı|ücretsiz|için|nasıl|hakkında|klip|yemek|pazarlama)\b/i.test(
    title,
  );
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extracts Yandex organic result titles and URLs from its server-rendered HTML. */
export function parseYandexHtml(html: string): { name: string; url: string }[] {
  const results: { name: string; url: string }[] = [];
  const seen = new Set<string>();
  const pattern =
    /<a[^>]+class="[^"]*OrganicTitle-Link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]{0,400}?)<\/a>/g;
  for (const match of html.matchAll(pattern)) {
    const url = decode(match[1]!);
    const name = decode(match[2]!);
    if (!name || !url.startsWith("http") || seen.has(url)) continue;
    seen.add(url);
    results.push({ name, url });
    if (results.length >= 10) break;
  }
  return results;
}

function titleHasName(title: string, name: string): boolean {
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9çğıöşü]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const short = normalize(name).split(" ").slice(0, 2).join(" ");
  return short.length >= 3 && normalize(title).includes(short);
}

/**
 * Turns one Yandex TR page into web evidence. Only TR-localized, non-directory, non-scanner pages
 * survive. A "found" (exact) match needs the first query and a title naming the product.
 */
export function webEvidenceFromHtml(
  name: string,
  html: string,
  isFirstQuery: boolean,
): TrEvidence[] {
  const evidence: TrEvidence[] = [];
  for (const result of parseYandexHtml(html)) {
    let host: string;
    try {
      host = new URL(result.url).hostname;
    } catch {
      continue;
    }
    if (isNonCompetitorHost(host)) continue;
    if (!isTrLocalResult(host, result.name) || isDirectoryResult(host, result.name)) continue;
    const exact = isFirstQuery && titleHasName(result.name, name);
    evidence.push({
      channel: "web_tr",
      name: result.name,
      id: exact ? host : `similar:${host}`,
      url: result.url,
    });
  }
  return evidence;
}

export async function collectWeb(
  name: string,
  queries: string[],
): Promise<{ evidence: TrEvidence[]; errors: string[] }> {
  const evidence: TrEvidence[] = [];
  const errors: string[] = [];
  for (const [index, query] of queries.entries()) {
    try {
      const response = await fetch(`${YANDEX}${encodeURIComponent(query)}`, {
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "tr-TR,tr;q=0.9" },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      evidence.push(...webEvidenceFromHtml(name, await response.text(), index === 0));
    } catch (error) {
      errors.push(`${query}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  const seen = new Set<string>();
  return {
    evidence: evidence.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    }),
    errors,
  };
}
