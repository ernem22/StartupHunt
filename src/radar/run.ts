import type { TrCatalog, TrStatus } from "./apple.js";
import { candidatePool, type CandidateSeries, type MomentumCollector } from "./github.js";

export interface Manifest {
  source: string;
  parameters: {
    pool: typeof candidatePool;
    discoveryLimit: number;
    weeks: number;
    at: string;
    trCatalog?: string;
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

function quoted(queries: string[]): string {
  return queries.length === 0 ? "yok" : queries.map((query) => `"${text(query)}"`).join(", ");
}

async function trStatusOf(
  catalog: TrCatalog | undefined,
  candidate: CandidateSeries,
): Promise<TrStatus> {
  if (!catalog) {
    return { status: "belirsiz", queries: [], catalog: "yok", note: "aranmadı" };
  }
  try {
    return await catalog.lookup(candidate);
  } catch (error) {
    return {
      status: "belirsiz",
      queries: [],
      catalog: catalog.catalog,
      note: error instanceof Error ? error.message : "katalog hatası",
    };
  }
}

function trLine(status: TrStatus, date: string): string {
  if (status.status === "bulundu" && status.match) {
    return `TR durumu: bulundu (${text(status.match.name)}, ${status.match.url}) — doğrulandı (${status.catalog}, country=tr); denenen sorgular: ${quoted(status.queries)}; ${date}`;
  }
  if (status.status === "bulunamadı") {
    return `TR durumu: bulunamadı (bu sorgularda sonuç yok; "yok" iddiası değil) — doğrulandı (${status.catalog}); denenen sorgular: ${quoted(status.queries)}; ${date}`;
  }
  return `TR durumu: belirsiz — doğrulanmadı (katalog ulaşılamadı${status.note ? `: ${text(status.note)}` : ""}); denenen sorgular: ${quoted(status.queries)}; ${status.catalog}; ${date}`;
}

function trGapDetail(status: TrStatus): string {
  if (status.status === "bulundu" && status.match) {
    return `bulundu: ${text(status.match.name)} ${status.match.url}`;
  }
  if (status.status === "bulunamadı") {
    return `bulunamadı (denenen: ${quoted(status.queries)})`;
  }
  return `belirsiz${status.note ? ` (${text(status.note)})` : ""}`;
}

export async function runRadar(
  collector: MomentumCollector,
  store: RadarStore,
  at: Date,
  commitHash: string,
  trCatalog?: TrCatalog,
): Promise<string> {
  const id = await store.start({
    source: "github",
    parameters: {
      pool: candidatePool,
      discoveryLimit: 30,
      weeks: 4,
      at: at.toISOString(),
      ...(trCatalog ? { trCatalog: trCatalog.catalog } : {}),
    },
    seed: 0,
    commitHash,
  });
  try {
    const series = await collector.collect(at);
    const ranked = series
      .map((candidate) => ({ ...candidate, momentum: momentum(candidate.weeks) }))
      .filter((candidate) => candidate.momentum !== null)
      .sort((a, b) => b.momentum! - a.momentum! || a.name.localeCompare(b.name, "en"))
      .slice(0, 20);
    const trStatuses: TrStatus[] = [];
    for (const candidate of ranked) {
      trStatuses.push(await trStatusOf(trCatalog, candidate));
    }
    const lines = [
      `# GitHub adayları — ${at.toISOString()}`,
      "",
      "Keşif: developer-tools sorgusunun güncellenme sırasındaki ilk 30 reposu; küresel ilk 20 iddiası değildir.",
      "Son dört tamamlanmış UTC haftası (Pazar başlangıcı); ivme = (son hafta − önceki hafta) / önceki hafta.",
      "Sıfır tabanlı oran hesaplanamaz ve sıralamaya girmez. Sparkline haftalık yeni yıldızları gösterir.",
      `Koşu: ${id}; commit: ${commitHash}; tohum: 0.`,
      "",
    ];
    for (const [index, candidate] of ranked.entries()) {
      const totals = candidate.weeks.map((w) => w.total);
      const max = Math.max(...totals, 1);
      const sparkline = totals.map((v) => "▁▂▃▄▅▆▇█"[Math.round((v / max) * 7)]).join("");
      const tr = trCatalog
        ? trLine(trStatuses[index]!, at.toISOString())
        : `TR durumu: belirsiz — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`;
      lines.push(
        `## ${text(candidate.name)}`,
        `Ad/açıklama: ${text(candidate.description || "yok")} — ikincil (repo sahibinin beyanı); ${candidate.url}; ${at.toISOString()}`,
        `İvme: ${(candidate.momentum! * 100).toFixed(1)}%; ${sparkline} [${totals.join(", ")}] — doğrulandı (GitHub haftalık yıldız verisinden hesaplandı); ${candidate.historyUrl}; ${at.toISOString()}`,
        `Gelir kanıtı: yok — doğrulanmadı (aranmadı); ${candidate.url}; ${at.toISOString()}`,
        tr,
        "",
      );
    }
    if (trCatalog) {
      const priority = { bulunamadı: 0, belirsiz: 1, bulundu: 2 } as const;
      const gap = ranked
        .map((candidate, index) => ({ candidate, status: trStatuses[index]! }))
        .sort((a, b) => priority[a.status.status] - priority[b.status.status]);
      lines.push(
        "## TR boşluğu görünümü",
        'TR muadili bulunamayanlar önde. "Bulunamadı" yalnız denenen sorgular içindir, "yok" iddiası değildir; son hüküm kullanıcıdadır.',
        ...gap.map(({ candidate, status }) => `- ${text(candidate.name)} — ${trGapDetail(status)}`),
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
