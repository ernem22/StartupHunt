import { candidatePool, type CandidateSeries, type MomentumCollector } from "./github.js";

export interface Manifest {
  source: string;
  parameters: { pool: typeof candidatePool; discoveryLimit: number; weeks: number; at: string };
  seed: number;
  commitHash: string;
}

export interface RadarStore {
  start(manifest: Manifest): Promise<string>;
  complete(id: string, series: CandidateSeries[]): Promise<void>;
  fail(id: string): Promise<void>;
}

function momentum(candidate: CandidateSeries): number | null {
  if (candidate.weeks.length >= 2) {
    const previous = candidate.weeks.at(-2)!.total;
    return previous === 0 ? null : (candidate.weeks.at(-1)!.total - previous) / previous;
  }
  // Sources without weekly history (e.g. Hugging Face) rank by their score.
  return candidate.score ? candidate.score.value : null;
}

function text(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/[\\`*_[\]<>|]/g, "\\$&");
}

function sparkline(totals: number[]): string {
  const max = Math.max(...totals, 1);
  return totals.map((v) => "▁▂▃▄▅▆▇█"[Math.round((v / max) * 7)]).join("");
}

function section(
  collector: MomentumCollector,
  series: CandidateSeries[],
  at: Date,
  commitHash: string,
  id: string,
): string {
  const source = collector.source ?? "github";
  const title = collector.title ?? "GitHub adayları";
  const ranked = series
    .map((candidate) => ({ ...candidate, momentum: momentum(candidate) }))
    .filter((candidate) => candidate.momentum !== null)
    .sort((a, b) => b.momentum! - a.momentum! || a.name.localeCompare(b.name, "en"))
    .slice(0, 20);
  const lines: string[] = [
    `# ${title} — ${at.toISOString()}`,
    "",
    `Koşu: ${id}; commit: ${commitHash}; tohum: 0.`,
  ];
  if (source === "huggingface") {
    lines.push(
      "Keşif: HF trendingScore sıralamasının ilk 30 modeli; küresel ilk 20 iddiası değildir; ürün niteliği elle incelenir.",
      "HF API haftalık geçmiş sağlamaz: sıralama trendingScore (HF'in son dönem ilgi ölçüsü) ile yapılır; haftalık artış oranı snapshot'lar biriktikten sonra değerlendirilir.",
      "Snapshot: metric_snapshots'a hf_trending_score, son tamamlanmış hafta başlığıyla yazılır; tekrarlanan koşular ayrı kayıt bırakır.",
      "",
    );
  } else {
    lines.push(
      "Keşif: developer-tools sorgusunun güncellenme sırasındaki ilk 30 reposu; küresel ilk 20 iddiası değildir.",
      "Son dört tamamlanmış UTC haftası (Pazar başlangıcı); ivme = (son hafta − önceki hafta) / önceki hafta.",
      "Sıfır tabanlı oran hesaplanamaz ve sıralamaya girmez. Sparkline haftalık yeni yıldızları gösterir.",
      "",
    );
  }
  for (const candidate of ranked) {
    const totals = candidate.weeks.map((w) => w.total);
    lines.push(`## ${text(candidate.name)}`);
    if (candidate.score) {
      lines.push(
        `Ad: ${text(candidate.name)} — ikincil (model kimliği yükleme beyanı); ${candidate.url}; ${at.toISOString()}`,
        `Açıklama: ${text(candidate.description || "yok")} — doğrulandı (HF API alanı); ${candidate.url}; ${at.toISOString()}`,
        `İvme (${candidate.score.label}): ${candidate.score.value} — doğrulandı (${candidate.score.evidence}); ${candidate.historyUrl}; ${at.toISOString()}`,
      );
    } else {
      lines.push(
        `Ad/açıklama: ${text(candidate.description || "yok")} — ikincil (repo sahibinin beyanı); ${candidate.url}; ${at.toISOString()}`,
        `İvme: ${(candidate.momentum! * 100).toFixed(1)}%; ${sparkline(totals)} [${totals.join(", ")}] — doğrulandı (GitHub haftalık yıldız verisinden hesaplandı); ${candidate.historyUrl}; ${at.toISOString()}`,
      );
    }
    lines.push(
      `Gelir kanıtı: yok — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
      `TR durumu: belirsiz — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
      "",
    );
  }
  const unranked = series.filter((c) => momentum(c) === null).length;
  if (unranked > 0) {
    lines.push(`Sıfır taban nedeniyle sıralanmayan: ${unranked}.`, "");
  }
  return lines.join("\n");
}

export async function runRadar(
  collector: MomentumCollector | MomentumCollector[],
  store: RadarStore,
  at: Date,
  commitHash: string,
): Promise<string> {
  const collectors = Array.isArray(collector) ? collector : [collector];
  const sections: string[] = [];
  for (const item of collectors) {
    const id = await store.start({
      source: item.source ?? "github",
      parameters: { pool: candidatePool, discoveryLimit: 30, weeks: 4, at: at.toISOString() },
      seed: 0,
      commitHash,
    });
    try {
      const series = await item.collect(at);
      sections.push(section(item, series, at, commitHash, id));
      await store.complete(id, series);
    } catch (error) {
      await store.fail(id);
      throw error;
    }
  }
  return sections.join("\n");
}
