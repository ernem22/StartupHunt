import { candidatePool, type CandidateSeries, type MomentumCollector } from "./github.js";

export type SourceFamily = "aday üretici" | "doğrulayıcı";

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
};

export function githubSource(collector: MomentumCollector): RadarSource {
  return { ...githubDefaults, pool: candidatePool, collector };
}

export function hackerNewsSource(collector: MomentumCollector): RadarSource {
  return { ...hackerNewsDefaults, pool: candidatePool, collector };
}

function momentum(weeks: CandidateSeries["weeks"]): number | null {
  const previous = weeks.at(-2)!.total;
  return previous === 0 ? null : (weeks.at(-1)!.total - previous) / previous;
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
      .map((candidate) => ({ ...candidate, momentum: momentum(candidate.weeks) }))
      .filter((candidate) => candidate.momentum !== null)
      .sort((a, b) => b.momentum! - a.momentum! || a.name.localeCompare(b.name, "en"))
      .slice(0, 20);
    const lines = [
      `# ${source.heading} — ${at.toISOString()}`,
      "",
      source.discoveryNote,
      "Son dört tamamlanmış UTC haftası (Pazar başlangıcı); ivme = (son hafta − önceki hafta) / önceki hafta.",
      `Sıfır tabanlı oran hesaplanamaz ve sıralamaya girmez. ${source.sparklineNote}`,
      `Koşu: ${id}; commit: ${commitHash}; tohum: 0.`,
      "",
    ];
    for (const candidate of ranked) {
      const totals = candidate.weeks.map((w) => w.total);
      const max = Math.max(...totals, 1);
      const sparkline = totals.map((v) => "▁▂▃▄▅▆▇█"[Math.round((v / max) * 7)]).join("");
      lines.push(
        `## ${text(candidate.name)}`,
        `Ad/açıklama: ${text(candidate.description || "yok")} — ikincil (${source.declarationLabel}); ${candidate.url}; ${at.toISOString()}`,
        `Kaynak ailesi: ${source.family} (${source.label}; kaynak: ${source.source}); ${candidate.url}; ${at.toISOString()}`,
        `İvme: ${(candidate.momentum! * 100).toFixed(1)}%; ${sparkline} [${totals.join(", ")}] — doğrulandı (${source.label} ${source.unit} verisinden hesaplandı); ${candidate.historyUrl}; ${at.toISOString()}`,
        `Gelir kanıtı: yok — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
        `TR durumu: belirsiz — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
        "",
      );
    }
    lines.push(
      `Sıfır taban nedeniyle sıralanmayan: ${series.length - series.filter((c) => momentum(c.weeks) !== null).length}.`,
    );
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
