import { candidatePool, type CandidateSeries, type MomentumCollector } from "./github.js";
import { TRUSTMRR_AI_URL, type RevenueEvidenceCollector } from "./revenue.js";

export interface Manifest {
  source: string;
  parameters: {
    pool: typeof candidatePool;
    discoveryLimit: number;
    weeks: number;
    revenueSource: string;
    at: string;
  };
  seed: number;
  commitHash: string;
}

export interface RadarStore {
  start(manifest: Manifest): Promise<string>;
  complete(id: string, series: CandidateSeries[]): Promise<void>;
  fail(id: string): Promise<void>;
}

function momentum(weeks: CandidateSeries["weeks"]): number | null {
  const previous = weeks.at(-2)!.total;
  return previous === 0 ? null : (weeks.at(-1)!.total - previous) / previous;
}

function text(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/[\\`*_[\]<>|]/g, "\\$&");
}

export async function runRadar(
  collector: MomentumCollector,
  store: RadarStore,
  at: Date,
  commitHash: string,
  revenueCollector?: RevenueEvidenceCollector,
): Promise<string> {
  const id = await store.start({
    source: "github",
    parameters: {
      pool: candidatePool,
      discoveryLimit: 30,
      weeks: 4,
      revenueSource: `TrustMRR keyless AI endpoint (${TRUSTMRR_AI_URL})`,
      at: at.toISOString(),
    },
    seed: 0,
    commitHash,
  });
  try {
    const series = await collector.collect(at);
    const revenueByCandidate =
      revenueCollector &&
      (await revenueCollector.collect(
        at,
        series.filter((candidate) => !candidate.revenueEvidence),
      ));
    const ranked = series
      .map((candidate) => {
        const revenueEvidence = candidate.revenueEvidence ?? revenueByCandidate?.get(candidate.url);
        if (!revenueEvidence) {
          throw new Error(`Missing revenue evidence for ${candidate.name}`);
        }
        return {
          ...candidate,
          revenueEvidence,
          momentum: momentum(candidate.weeks),
        };
      })
      .filter((candidate) => candidate.momentum !== null)
      .sort((a, b) => b.momentum! - a.momentum! || a.name.localeCompare(b.name, "en"))
      .slice(0, 20);
    const lines = [
      `# GitHub adayları — ${at.toISOString()}`,
      "",
      "Keşif: developer-tools sorgusunun güncellenme sırasındaki ilk 30 reposu; küresel ilk 20 iddiası değildir.",
      "Son dört tamamlanmış UTC haftası (Pazar başlangıcı); ivme = (son hafta − önceki hafta) / önceki hafta.",
      "Sıfır tabanlı oran hesaplanamaz ve sıralamaya girmez. Sparkline haftalık yeni yıldızları gösterir.",
      `Koşu: ${id}; commit: ${commitHash}; tohum: 0.`,
      "",
    ];
    for (const candidate of ranked) {
      const totals = candidate.weeks.map((w) => w.total);
      const max = Math.max(...totals, 1);
      const sparkline = totals.map((v) => "▁▂▃▄▅▆▇█"[Math.round((v / max) * 7)]).join("");
      lines.push(
        `## ${text(candidate.name)}`,
        `Ad/açıklama: ${text(candidate.description || "yok")} — ikincil (repo sahibinin beyanı); ${candidate.url}; ${at.toISOString()}`,
        `İvme: ${(candidate.momentum! * 100).toFixed(1)}%; ${sparkline} [${totals.join(", ")}] — doğrulandı (GitHub haftalık yıldız verisinden hesaplandı); ${candidate.historyUrl}; ${at.toISOString()}`,
        `Gelir kanıtı: ${text(candidate.revenueEvidence!.finding)} — ${text(candidate.revenueEvidence!.label)} (${text(candidate.revenueEvidence!.detail)}); ${candidate.revenueEvidence!.sourceUrl}; ${candidate.revenueEvidence!.observedAt}`,
        `TR durumu: belirsiz — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
        "",
      );
    }
    lines.push(
      `Sıfır taban nedeniyle sıralanmayan: ${series.length - series.filter((c) => momentum(c.weeks) !== null).length}.`,
    );
    await store.complete(id, series);
    return lines.join("\n");
  } catch (error) {
    await store.fail(id);
    throw error;
  }
}
