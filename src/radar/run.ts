import { candidatePool, type CandidateSeries, type MomentumCollector } from "./github.js";

export type SourceFamily = "aday üretici" | "doğrulayıcı" | "ivme ölçüsü";

// The pool is opaque metadata for the manifest; sources declare their own shape.
export type RadarPool = readonly Readonly<Record<string, unknown>>[];

export interface RadarSource {
  source: string;
  family: SourceFamily;
  label: string;
  entityType: string;
  metric: string;
  unit: string;
  heading: string;
  discoveryNote: string;
  sparklineNote: string;
  declarationLabel: string;
  pool: RadarPool;
  discoveryLimit: number;
  /** How candidates are ranked; defaults to weekly growth. */
  ranking?: "weekly" | "score";
  collector: MomentumCollector;
}

export interface Manifest {
  source: string;
  parameters: { pool: RadarPool; discoveryLimit: number; weeks: number; at: string };
  seed: number;
  commitHash: string;
}

export interface RadarStore {
  start(manifest: Manifest): Promise<string>;
  complete(
    id: string,
    series: CandidateSeries[],
    source?: { entityType: string; metric: string },
  ): Promise<void>;
  fail(id: string): Promise<void>;
}

const githubDefaults = {
  source: "github",
  family: "doğrulayıcı" as const,
  label: "GitHub",
  entityType: "github_repo",
  metric: "weekly_new_stars",
  unit: "haftalık yeni yıldız",
  heading: "GitHub adayları",
  discoveryNote:
    "Keşif: developer-tools sorgusunun güncellenme sırasındaki ilk 30 reposu; küresel ilk 20 iddiası değildir.",
  sparklineNote: "Sparkline haftalık yeni yıldızları gösterir.",
  declarationLabel: "repo sahibinin beyanı",
  discoveryLimit: 30,
  ranking: "weekly" as const,
};

const hackerNewsDefaults = {
  source: "hackernews",
  family: "aday üretici" as const,
  label: "HN Algolia",
  entityType: "hn_domain",
  metric: "weekly_stories",
  unit: "haftalık hikâye",
  heading: "HN Algolia adayları",
  discoveryNote:
    'Keşif: HN Algolia\'da "developer" ve "AI tools" sorgularının son dört tamamlanmış haftadaki hikâyeleri bağlantı alan adına göre toplanır; küresel ilk 20 iddiası değildir.',
  sparklineNote: "Sparkline haftalık hikâye sayılarını gösterir.",
  declarationLabel: "HN hikâye başlığı",
  discoveryLimit: 1000,
  ranking: "weekly" as const,
};

// Hugging Face is not a candidate producer like GitHub/HN: it exposes a single
// point-in-time ranking score, so it is labelled as its own momentum measure.
const huggingFaceDefaults = {
  source: "huggingface",
  family: "ivme ölçüsü" as const,
  label: "Hugging Face",
  entityType: "hf_model",
  metric: "hf_trending_score",
  unit: "trendingScore",
  heading: "Hugging Face adayları",
  discoveryNote:
    "Keşif: HF trendingScore sıralamasının ilk 30 modeli; küresel ilk 20 iddiası değildir; ürün niteliği elle incelenir.",
  sparklineNote: "",
  declarationLabel: "model kimliği yükleme beyanı",
  discoveryLimit: 30,
  ranking: "score" as const,
};

export function githubSource(collector: MomentumCollector): RadarSource {
  return { ...githubDefaults, pool: candidatePool, collector };
}

export function hackerNewsSource(collector: MomentumCollector): RadarSource {
  return { ...hackerNewsDefaults, pool: candidatePool, collector };
}

export function huggingFaceSource(collector: MomentumCollector): RadarSource {
  return { ...huggingFaceDefaults, pool: candidatePool, collector };
}

function momentum(candidate: CandidateSeries): number | null {
  // Sources without weekly history (e.g. Hugging Face) rank by their single score.
  if (candidate.score) return candidate.score.value;
  if (candidate.weeks.length < 2) return null;
  const previous = candidate.weeks.at(-2)!.total;
  return previous === 0 ? null : (candidate.weeks.at(-1)!.total - previous) / previous;
}

function text(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/[\\`*_[\]<>|]/g, "\\$&");
}

function isRadarSource(value: MomentumCollector | RadarSource): value is RadarSource {
  return "collector" in value;
}

export async function runRadar(
  input: MomentumCollector | RadarSource,
  store: RadarStore,
  at: Date,
  commitHash: string,
): Promise<string> {
  const source = isRadarSource(input) ? input : githubSource(input);
  const ranking = source.ranking ?? "weekly";
  const id = await store.start({
    source: source.source,
    parameters: {
      pool: source.pool,
      discoveryLimit: source.discoveryLimit,
      weeks: 4,
      at: at.toISOString(),
    },
    seed: 0,
    commitHash,
  });
  try {
    const series = await source.collector.collect(at);
    const ranked = series
      .map((candidate) => ({ ...candidate, momentum: momentum(candidate) }))
      .filter((candidate) => candidate.momentum !== null)
      .sort((a, b) => b.momentum! - a.momentum! || a.name.localeCompare(b.name, "en"))
      .slice(0, 20);
    const lines: string[] = [`# ${source.heading} — ${at.toISOString()}`, "", source.discoveryNote];
    if (ranking === "score") {
      lines.push(
        "HF API haftalık geçmiş sağlamaz: sıralama trendingScore (Hugging Face'in kendi son dönem ilgi ölçüsü) ile yapılır; haftalık artış oranı snapshot'lar biriktikten sonra değerlendirilir.",
        `Snapshot: metric_snapshots'a ${source.metric}, son tamamlanmış hafta başlığıyla yazılır; tekrarlanan koşular ayrı kayıt bırakır.`,
      );
    } else {
      lines.push(
        "Son dört tamamlanmış UTC haftası (Pazar başlangıcı); ivme = (son hafta − önceki hafta) / önceki hafta.",
        `Sıfır tabanlı oran hesaplanamaz ve sıralamaya girmez. ${source.sparklineNote}`,
      );
    }
    lines.push(`Koşu: ${id}; commit: ${commitHash}; tohum: 0.`, "");
    for (const candidate of ranked) {
      const totals = candidate.weeks.map((w) => w.total);
      lines.push(
        `## ${text(candidate.name)}`,
        `Kaynak ailesi: ${source.family} (${source.label}; kaynak: ${source.source}); ${candidate.url}; ${at.toISOString()}`,
      );
      if (candidate.score) {
        // Single point metric: present the source's own score, never a weekly ratio.
        lines.push(
          `Ad: ${text(candidate.name)} — ikincil (${source.declarationLabel}); ${candidate.url}; ${at.toISOString()}`,
          `Açıklama: ${text(candidate.description || "yok")} — doğrulandı (${source.label} API alanı); ${candidate.url}; ${at.toISOString()}`,
          `İvme (${candidate.score.label}): ${candidate.score.value} — doğrulandı (${candidate.score.evidence}); ${candidate.historyUrl}; ${at.toISOString()}`,
        );
      } else {
        const max = Math.max(...totals, 1);
        const sparkline = totals.map((v) => "▁▂▃▄▅▆▇█"[Math.round((v / max) * 7)]).join("");
        lines.push(
          `Ad/açıklama: ${text(candidate.description || "yok")} — ikincil (${source.declarationLabel}); ${candidate.url}; ${at.toISOString()}`,
          `İvme: ${(candidate.momentum! * 100).toFixed(1)}%; ${sparkline} [${totals.join(", ")}] — doğrulandı (${source.label} ${source.unit} verisinden hesaplandı); ${candidate.historyUrl}; ${at.toISOString()}`,
        );
      }
      lines.push(
        `Gelir kanıtı: yok — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
        `TR durumu: belirsiz — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
        "",
      );
    }
    if (ranking !== "score") {
      const unranked = series.filter((c) => momentum(c) === null).length;
      lines.push(`Sıfır taban nedeniyle sıralanmayan: ${unranked}.`);
    }
    if (source.collector.excluded !== undefined) {
      lines.push(`Ürün olmadığı için elenen: ${source.collector.excluded}.`);
    }
    await store.complete(id, series, {
      entityType: source.entityType,
      metric: source.metric,
    });
    return lines.join("\n");
  } catch (error) {
    await store.fail(id);
    throw error;
  }
}
