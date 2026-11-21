import type { CandidateSeries, RevenueEvidence } from "./github.js";

export const TRUSTMRR_AI_URL = "https://trustmrr.com/api/ai";

export interface RevenueEvidenceCollector {
  collect(at: Date, candidates: readonly CandidateSeries[]): Promise<Map<string, RevenueEvidence>>;
}

interface TrustMrrRevenue {
  last30Days?: number | null;
  mrr?: number | null;
  total?: number | null;
}

interface TrustMrrEntry {
  name?: string;
  slug?: string;
  url?: string;
  website?: string | null;
  revenue?: TrustMrrRevenue | null;
}

interface TrustMrrAiResponse {
  recentlyListedStartups?: TrustMrrEntry[];
  bestDeals?: TrustMrrEntry[];
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeDomain(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return host && host !== "github.com" ? host : null;
  } catch {
    return null;
  }
}

function formatUsd(value: number): string {
  const rounded = Math.round(value);
  return `$${rounded.toLocaleString("en-US")}`;
}

function revenueFinding(revenue: TrustMrrRevenue | null | undefined): string | null {
  if (!revenue) return null;
  const parts: string[] = [];
  if (typeof revenue.mrr === "number") parts.push(`MRR ${formatUsd(revenue.mrr)}`);
  if (typeof revenue.last30Days === "number")
    parts.push(`son 30 gün ${formatUsd(revenue.last30Days)}`);
  if (typeof revenue.total === "number") parts.push(`toplam ${formatUsd(revenue.total)}`);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function unmatchedRevenueEvidence(at: Date, sampleSize: number): RevenueEvidence {
  return {
    finding: "yok",
    label: "doğrulanmadı",
    detail: `${sampleSize} kayıtlık örnekte eşleşme yok, kapsam sınırlı, bu bir kanıt değil`,
    sourceUrl: TRUSTMRR_AI_URL,
    observedAt: at.toISOString(),
  };
}

export function unavailableRevenueEvidence(at: Date, detail: string): RevenueEvidence {
  return {
    finding: "yok",
    label: "doğrulanmadı",
    detail,
    sourceUrl: TRUSTMRR_AI_URL,
    observedAt: at.toISOString(),
  };
}

export class TrustMrrAiCollector implements RevenueEvidenceCollector {
  constructor(private readonly request: typeof fetch = fetch) {}

  async collect(
    at: Date,
    candidates: readonly CandidateSeries[],
  ): Promise<Map<string, RevenueEvidence>> {
    // Keyless read-only probe: no token read/stored/embedded; data is not sent to any LLM.
    const response = await this.request(TRUSTMRR_AI_URL, {
      headers: { accept: "application/json", "User-Agent": "StartupHunt/0.1" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`TrustMRR HTTP ${response.status}`);

    const body = (await response.json()) as TrustMrrAiResponse;
    const entries = [...(body.recentlyListedStartups ?? []), ...(body.bestDeals ?? [])];
    const byDomain = new Map<string, TrustMrrEntry>();
    const byName = new Map<string, TrustMrrEntry>();
    for (const entry of entries) {
      const domain = normalizeDomain(entry.website);
      if (domain && !byDomain.has(domain)) byDomain.set(domain, entry);
      for (const name of [entry.name, entry.slug]) {
        const normalized = name ? normalizeName(name) : "";
        if (normalized && !byName.has(normalized)) byName.set(normalized, entry);
      }
    }

    const result = new Map<string, RevenueEvidence>();
    for (const candidate of candidates) {
      const match = this.matchCandidate(candidate, byDomain, byName);
      if (!match) {
        result.set(candidate.url, unmatchedRevenueEvidence(at, entries.length));
        continue;
      }
      const finding = revenueFinding(match.revenue);
      if (!finding) {
        result.set(
          candidate.url,
          unavailableRevenueEvidence(
            at,
            `TrustMRR eşleşmesi bulundu (${match.url ?? TRUSTMRR_AI_URL}) ancak gelir/MRR alanı yok`,
          ),
        );
        continue;
      }
      result.set(candidate.url, {
        finding,
        label: "ikincil",
        detail: `TrustMRR /api/ai kaydında adayla ad/domain eşleşmesi bulundu`,
        sourceUrl: match.url ?? TRUSTMRR_AI_URL,
        observedAt: at.toISOString(),
      });
    }
    return result;
  }

  private matchCandidate(
    candidate: CandidateSeries,
    byDomain: Map<string, TrustMrrEntry>,
    byName: Map<string, TrustMrrEntry>,
  ): TrustMrrEntry | undefined {
    const candidateDomain = normalizeDomain(candidate.homepage);
    if (candidateDomain) {
      const domainMatch = byDomain.get(candidateDomain);
      if (domainMatch) return domainMatch;
    }
    const repoName = candidate.name.includes("/")
      ? candidate.name.split("/").at(-1)!
      : candidate.name;
    for (const raw of [candidate.name, repoName]) {
      const normalized = normalizeName(raw);
      if (!normalized) continue;
      const nameMatch = byName.get(normalized);
      if (nameMatch) return nameMatch;
    }
    return undefined;
  }
}
