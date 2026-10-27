import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export type KnownLikelihood = "likely_new" | "uncertain" | "likely_known";

export interface KnownProfile {
  tokenCounts: Map<string, number>;
  documentCounts: Map<string, number>;
  documentCount: number;
}

export interface ProfileCard {
  actor: string;
  job: string;
  problem: string;
  workaround: string | null;
}

export interface ProfileScore {
  likelyKnown: KnownLikelihood;
  knownReason: string;
}

export const KNOWN_COVERAGE_MIN = 0.6;
export const NEW_COVERAGE_MAX = 0.2;
const DEFAULT_PROFILE_ROOTS = [
  "reports",
  "research_notes",
  "plan.md",
  "LOG.md",
  "docs",
] as const;

const STOPWORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "all",
  "also",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "each",
  "even",
  "every",
  "for",
  "from",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "him",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "like",
  "many",
  "may",
  "me",
  "might",
  "more",
  "most",
  "much",
  "my",
  "no",
  "not",
  "now",
  "of",
  "on",
  "only",
  "or",
  "other",
  "our",
  "out",
  "over",
  "own",
  "per",
  "same",
  "she",
  "should",
  "so",
  "some",
  "still",
  "such",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "up",
  "us",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "already",
  "always",
  "bad",
  "big",
  "business",
  "came",
  "come",
  "companies",
  "company",
  "copied",
  "copies",
  "copy",
  "copying",
  "customer",
  "customers",
  "daily",
  "day",
  "days",
  "eight",
  "employee",
  "employees",
  "every",
  "find",
  "finds",
  "first",
  "five",
  "found",
  "four",
  "full",
  "gave",
  "get",
  "gets",
  "getting",
  "give",
  "gives",
  "giving",
  "go",
  "goes",
  "good",
  "got",
  "half",
  "hand",
  "hands",
  "high",
  "hour",
  "hours",
  "job",
  "jobs",
  "keep",
  "keeps",
  "kept",
  "knew",
  "know",
  "knows",
  "large",
  "last",
  "long",
  "look",
  "looks",
  "lot",
  "lots",
  "low",
  "made",
  "make",
  "makes",
  "making",
  "manual",
  "manually",
  "match",
  "matched",
  "matches",
  "matching",
  "member",
  "members",
  "minute",
  "minutes",
  "month",
  "monthly",
  "months",
  "never",
  "new",
  "next",
  "nine",
  "often",
  "old",
  "one",
  "owner",
  "owners",
  "part",
  "people",
  "person",
  "put",
  "puts",
  "ran",
  "run",
  "running",
  "runs",
  "said",
  "saw",
  "say",
  "says",
  "second",
  "see",
  "sees",
  "seven",
  "short",
  "six",
  "small",
  "solo",
  "sometimes",
  "take",
  "takes",
  "taking",
  "team",
  "teams",
  "tell",
  "tells",
  "ten",
  "thing",
  "things",
  "think",
  "thinks",
  "third",
  "thought",
  "three",
  "time",
  "times",
  "today",
  "told",
  "tomorrow",
  "took",
  "two",
  "use",
  "used",
  "user",
  "users",
  "uses",
  "using",
  "usually",
  "want",
  "wanted",
  "wants",
  "way",
  "ways",
  "week",
  "weekly",
  "weeks",
  "went",
  "whole",
  "work",
  "worked",
  "working",
  "works",
  "year",
  "yearly",
  "years",
  "yesterday",
  "acaba",
  "ama",
  "ancak",
  "arasında",
  "aslında",
  "bazı",
  "belki",
  "bile",
  "bir",
  "biraz",
  "bu",
  "buna",
  "bunun",
  "çok",
  "çünkü",
  "da",
  "daha",
  "de",
  "değil",
  "diye",
  "dolayı",
  "eğer",
  "en",
  "gibi",
  "göre",
  "hem",
  "her",
  "hiç",
  "için",
  "ile",
  "ise",
  "kadar",
  "ki",
  "mı",
  "mi",
  "mu",
  "mü",
  "nasıl",
  "ne",
  "neden",
  "nerede",
  "o",
  "olarak",
  "oldu",
  "olduğu",
  "olmak",
  "olan",
  "önce",
  "öyle",
  "sadece",
  "şey",
  "şu",
  "tarafından",
  "üzere",
  "üzerinde",
  "var",
  "ve",
  "veya",
  "ya",
  "yani",
  "yok",
  "adet",
  "ay",
  "aylık",
  "bütün",
  "çalışan",
  "çalışır",
  "çalışma",
  "çalışmak",
  "defa",
  "demek",
  "diğer",
  "düşünmek",
  "ekip",
  "eski",
  "etmek",
  "farklı",
  "firma",
  "gün",
  "günlük",
  "hafta",
  "haftalık",
  "ihtiyaç",
  "insan",
  "istek",
  "iş",
  "işler",
  "iyi",
  "kez",
  "kere",
  "kişi",
  "kişiler",
  "kötü",
  "kullanıcı",
  "kullanır",
  "kullanmak",
  "küçük",
  "müşteri",
  "saat",
  "saatlik",
  "söylemek",
  "şirket",
  "tam",
  "tane",
  "tüm",
  "uzun",
  "yapmak",
  "yapar",
  "yapıyor",
  "yarım",
  "yıl",
  "yıllık",
  "yol",
  "yollar",
  "zaman",
]);

export interface LoadKnownProfileOptions {
  roots?: readonly string[];
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\u0307/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function contentTokens(value: string): string[] {
  return tokenize(value).filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

export function tokenSet(value: string): Set<string> {
  return new Set(contentTokens(value));
}

function collectFiles(target: string, out: string[]): void {
  let stats;
  try {
    stats = statSync(target);
  } catch {
    return;
  }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(target).sort()) {
      collectFiles(path.join(target, entry), out);
    }
    return;
  }
  if (!stats.isFile()) return;
  const extension = path.extname(target).toLowerCase();
  if (extension === ".md" || extension === ".txt") out.push(target);
}

export function loadKnownProfile(options: LoadKnownProfileOptions = {}): KnownProfile {
  const roots = options.roots ?? DEFAULT_PROFILE_ROOTS;
  const files: string[] = [];
  for (const root of roots) collectFiles(root, files);

  const seenFiles = new Set<string>();
  const tokenCounts = new Map<string, number>();
  const documentCounts = new Map<string, number>();
  let documentCount = 0;

  for (const file of files) {
    if (seenFiles.has(file)) continue;
    seenFiles.add(file);
    const tokens = contentTokens(readFileSync(file, "utf8"));
    for (const token of tokens) {
      tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
    }
    for (const token of new Set(tokens)) {
      documentCounts.set(token, (documentCounts.get(token) ?? 0) + 1);
    }
    documentCount++;
  }

  return { tokenCounts, documentCounts, documentCount };
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function reasonFor(profile: KnownProfile, matched: string[]): string {
  if (matched.length === 0) return "profilde eşleşme yok";
  const terms = [...matched]
    .sort(
      (a, b) => (profile.tokenCounts.get(b) ?? 0) - (profile.tokenCounts.get(a) ?? 0) || compareText(a, b)
    )
    .slice(0, 3);
  return `profilde eşleşen terimler: ${terms.join(", ")}`;
}

export function scoreCard(profile: KnownProfile, card: ProfileCard): ProfileScore {
  const tokens = [
    ...tokenSet([card.actor, card.job, card.problem, card.workaround ?? ""].join(" ")),
  ];
  if (tokens.length === 0) {
    return { likelyKnown: "likely_new", knownReason: "profilde eşleşme yok" };
  }

  const matched = tokens.filter((token) => profile.documentCounts.has(token));
  const coverage = matched.length / tokens.length;
  const knownReason = reasonFor(profile, matched);

  if (coverage >= KNOWN_COVERAGE_MIN) {
    return { likelyKnown: "likely_known", knownReason };
  }
  if (coverage <= NEW_COVERAGE_MAX) {
    return { likelyKnown: "likely_new", knownReason };
  }
  return { likelyKnown: "uncertain", knownReason };
}
