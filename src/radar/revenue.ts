import type { RevenueEvidence } from "./github.js";

export const TRUSTMRR_KEYLESS_URL = "https://trustmrr.com/api/v1/startups?limit=3";

export interface RevenueEvidenceCollector {
  collect(at: Date): Promise<RevenueEvidence>;
}

const UNAVAILABLE: Omit<RevenueEvidence, "observedAt"> = {
  finding: "yok",
  label: "doğrulanmadı",
  detail: "TrustMRR anahtarsız uç 401 — anahtarsız gelir kanıtı alınamadı",
  sourceUrl: TRUSTMRR_KEYLESS_URL,
};

export function unavailableRevenueEvidence(at: Date): RevenueEvidence {
  return { ...UNAVAILABLE, observedAt: at.toISOString() };
}

export class TrustMrrKeylessCollector implements RevenueEvidenceCollector {
  constructor(private readonly request: typeof fetch = fetch) {}

  async collect(at: Date): Promise<RevenueEvidence> {
    // Keyless probe only: no token is read, stored or embedded. A 401 is the
    // expected outcome and is recorded as unverified, never guessed as revenue.
    const response = await this.request(TRUSTMRR_KEYLESS_URL, {
      headers: { accept: "application/json", "User-Agent": "StartupHunt/0.1" },
      signal: AbortSignal.timeout(30000),
    });
    if (response.status === 401 || response.status === 403) {
      return unavailableRevenueEvidence(at);
    }
    if (!response.ok) throw new Error(`TrustMRR HTTP ${response.status}`);
    return {
      finding: "yok",
      label: "doğrulanmadı",
      detail: `TrustMRR anahtarsız uç HTTP ${response.status}; beklenen 401 gelmedi, kanıt olarak kullanılmadı`,
      sourceUrl: TRUSTMRR_KEYLESS_URL,
      observedAt: at.toISOString(),
    };
  }
}
