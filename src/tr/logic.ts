export type TrCandidate = {
  name: string;
  description?: string;
  url?: string;
};

export type TrChannel = "apple_tr" | "play_tr";

export type TrEvidence = {
  channel: TrChannel;
  name: string;
  id: string;
  seller?: string;
  ratingCount?: number;
  url: string;
};

export type TrVerdict = {
  verdict: "found" | "not_found" | "uncertain";
  reason: string;
  queries: string[];
  evidence: TrEvidence[];
};

const STOPWORDS_TR = new Set([
  "bir",
  "ile",
  "ve",
  "için",
  "icin",
  "olan",
  "the",
  "and",
  "for",
  "with",
  "app",
  "uygulaması",
  "uygulamasi",
  "websitesi",
  "web",
  "site",
  "siteyi",
  "yapan",
  "oluşturan",
  "olusturan",
  "kullanan",
  "yardımcı",
  "yardimci",
  "birlikte",
]);

const KEYWORD_TR: Record<string, string> = {
  landing: "landing page",
  "landing page": "landing page",
  ai: "yapay zeka",
  "yapay zeka": "yapay zeka",
  weekly: "haftalık",
  haftalık: "haftalık",
  meal: "yemek",
  yemek: "yemek",
  plan: "planı",
  plans: "planı",
  planı: "planı",
  grocery: "market",
  market: "market",
  budget: "bütçe",
  bütçe: "bütçe",
  list: "listesi",
  listesi: "listesi",
  inventory: "envanter",
  envanter: "envanter",
  home: "ev",
  ev: "ev",
  insurance: "sigorta",
  sigorta: "sigorta",
  ticket: "bilet",
  bilet: "bilet",
  booking: "rezervasyon",
  rezervasyon: "rezervasyon",
  consert: "konser",
  konser: "konser",
  tiyatro: "tiyatro",
};

const KEYWORD_EN: Record<string, string> = {
  "yapay zeka": "AI",
  ai: "AI",
  haftalık: "weekly",
  weekly: "weekly",
  yemek: "meal",
  meal: "meal",
  market: "grocery",
  grocery: "grocery",
  bütçe: "budget",
  budget: "budget",
  planı: "planner",
  plan: "planner",
  listesi: "list",
  list: "list",
  envanter: "inventory",
  inventory: "inventory",
  ev: "home",
  home: "home",
  sigorta: "insurance",
  insurance: "insurance",
  bilet: "ticket",
  ticket: "ticket",
  rezervasyon: "booking",
  booking: "booking",
  konser: "concert",
  concert: "concert",
  tiyatro: "theater",
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripStopwords(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 1 && !STOPWORDS_TR.has(word));
}

export function buildQueries(candidate: TrCandidate): string[] {
  const name = candidate.name.trim();
  const description = (candidate.description ?? "").trim();
  const queries: string[] = [];
  const push = (value: string) => {
    const text = value.trim();
    if (text && !queries.includes(text)) queries.push(text);
  };

  push(name);

  if (!description) return queries;

  const words = stripStopwords(description);
  const trParts: string[] = [];
  const enParts: string[] = [];
  const seenTr = new Set<string>();
  const seenEn = new Set<string>();

  for (const word of words) {
    const tr = KEYWORD_TR[word];
    const en = KEYWORD_EN[word] ?? (KEYWORD_TR[word] ? undefined : word);
    if (tr && !seenTr.has(tr)) {
      seenTr.add(tr);
      trParts.push(tr);
    }
    if (en && !seenEn.has(en)) {
      seenEn.add(en);
      enParts.push(en);
    }
  }

  push(trParts.slice(0, 4).join(" "));
  push(enParts.slice(0, 4).join(" "));

  return queries;
}

export function isWebSaas(candidate: TrCandidate): boolean {
  const text = `${candidate.name} ${candidate.description ?? ""} ${candidate.url ?? ""}`;
  return /\b(web|web\s?sitesi|web\s?app|web\s?tabanl|saas|tarayıcı|tarayici|browser|online|hosting|website)\b/i.test(
    text,
  );
}

function similarity(a: string, b: string): number {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const boundary = (long: string, short: string) =>
    long.startsWith(short) && /^[ :-]/.test(long.slice(short.length));
  if (Math.min(x.length, y.length) >= 4 && (boundary(x, y) || boundary(y, x))) return 0.9;
  const xWords = new Set(x.split(" "));
  const yWords = new Set(y.split(" "));
  const shared = [...xWords].filter((word) => yWords.has(word)).length;
  return shared / Math.max(xWords.size, yWords.size);
}

export function isRealMatch(candidateName: string, resultName: string, query: string): boolean {
  if (similarity(candidateName, resultName) >= 0.65) return true;
  const keywords = stripStopwords(candidateName).filter((word) => word.length > 2);
  if (keywords.length === 0) return false;
  const hits = keywords.filter((word) => normalize(resultName).includes(word)).length;
  if (hits >= 2) return true;
  const queryWords = stripStopwords(query).filter((word) => word.length > 3);
  const queryHits = queryWords.filter((word) => normalize(resultName).includes(word)).length;
  return queryWords.length >= 2 && queryHits >= 2 && hits >= 1;
}

export type VerdictInput = {
  candidate: TrCandidate;
  queries: string[];
  evidence: TrEvidence[];
  channelErrors: Record<TrChannel, string[]>;
};

export function decideVerdict(input: VerdictInput): TrVerdict {
  const { candidate, queries, evidence, channelErrors } = input;
  const triedChannels: TrChannel[] = (["apple_tr", "play_tr"] as const).filter(
    (channel) => channelErrors[channel].length === 0,
  );
  const attempted = `Denene(n) sorgular: ${queries.join(" | ")}. Kanallar: ${triedChannels.join(", ") || "yok"}.`;
  const failures = (Object.entries(channelErrors) as [TrChannel, string[]][])
    .filter(([, errors]) => errors.length > 0)
    .map(([channel, errors]) => `${channel}: ${errors.join("; ")}`)
    .join(" | ");

  if (failures)
    return {
      verdict: "uncertain",
      reason: `Kanal hatası: ${failures} ${attempted}`,
      queries,
      evidence,
    };

  if (evidence.length === 0) {
    return {
      verdict: "not_found",
      reason: `TR mağazalarında eşleşme bulunamadı. ${attempted}`,
      queries,
      evidence,
    };
  }

  const best = [...evidence].sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0))[0]!;
  const ratingText = (item: TrEvidence) =>
    item.ratingCount === undefined ? "rating bilinmiyor" : `${item.ratingCount} TR rating`;
  const strong = evidence.filter((item) => (item.ratingCount ?? 0) > 5);

  if (isWebSaas(candidate) && strong.length === 0) {
    return {
      verdict: "uncertain",
      reason: `Web SaaS için mağaza sinyali yetersiz; ${best.name} (${ratingText(best)}) benzeri bir uygulama. Asıl rakipler mağaza aramasında görünmez olabilir. ${attempted}`,
      queries,
      evidence,
    };
  }

  if (best.ratingCount === undefined) {
    return {
      verdict: "uncertain",
      reason: `${best.name} (${best.channel}) eşleşti ama TR rating sayısı okunamadı; çekiş ayırt edilemiyor. ${attempted}`,
      queries,
      evidence,
    };
  }

  const traction = strong.length > 0;
  const state = traction ? "var ve çekiş var" : "var ama çekiş yok (rating <= 5)";
  return {
    verdict: "found",
    reason: `TR mağazasında gerçek eşleşme: ${best.name} (${ratingText(best)}, ${best.channel}). Durum: ${state}. ${attempted}`,
    queries,
    evidence,
  };
}
