import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Candidate, DataPoint } from "../candidates/model.js";
import { checkTrSaturation, type TrVerdict } from "../tr/check.js";
import { shortProductName, shortTrQueries } from "./names.js";
import {
  rankCandidates,
  readSnapshot,
  trendSignals,
  type Label,
  type RankedCandidate,
} from "./rank.js";

export type Idea = {
  rank: number;
  key: string;
  name: string;
  originalName: string;
  url: string;
  whatItIs: string;
  category: string | null;
  /** "trend" (trend-led), "gelir" (revenue-led) or both. */
  labels: Label[];
  sources: string[];
  score: RankedCandidate["score"];
  trend: {
    /** Trend observations only (PH rank, Apple ranks, HN points/comments with the Show HN date, Reddit score/comments). */
    signals: DataPoint[];
    /** "ilk gözlem" when no earlier snapshot holds the product; otherwise the changed metrics. */
    momentum: string;
  };
  dataPoints: DataPoint[];
  revenueEvidence: string;
  tr: {
    verdict: TrVerdict["verdict"];
    reason: string;
    queries: string[];
    evidence: { name: string; channel: string; ratingCount?: number; url: string }[];
    gapLabel: string;
  };
};

export type IdeasOutput = {
  generatedAt: string;
  sourceFile: string;
  snapshotFile: string | null;
  ideas: Idea[];
};

const TR_LABEL: Record<TrVerdict["verdict"], string> = {
  found: "dolu",
  not_found: "boş",
  uncertain: "belirsiz",
};

const REDDIT_PREFIX = /^I (?:built|made|created|wrote|launched)\s+(?:a|an|my|the)?\s*/i;

/**
 * One line, only from fields already in the candidate. No LLM and no translation:
 * a Reddit or Show HN title is shown as written, with the product's host.
 */
export function describe(candidate: Candidate): string {
  const description = candidate.description?.replace(/\s+/g, " ").trim();
  if (description) return description.slice(0, 220);
  const title = candidate.name.replace(/\s+/g, " ").trim();
  if (candidate.sources.includes("showhn")) {
    return `Show HN başlığı: ${title.slice(0, 220)}`;
  }
  if (candidate.sources.includes("reddit")) {
    const host = hostOf(candidate.url);
    const text = title.replace(REDDIT_PREFIX, "").slice(0, 200);
    return `Reddit başlığı: ${text}${host ? ` (${host})` : ""}`;
  }
  const points = candidate.dataPoints.map((point) => `${point.metric}=${point.value}`).join(", ");
  const category = candidate.category ? `${candidate.category}; ` : "";
  return `${category}${candidate.sources.join(" + ")} sinyalı: ${points}`;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function revenueEvidence(candidate: Candidate): string {
  const mrr = candidate.dataPoints.find((point) => point.metric === "mrr_usd");
  if (!mrr) return "aranmadı";
  const growth = candidate.dataPoints.find((point) => point.metric === "growth_mrr_30d_pct");
  // TrustMRR "MRR growth, last 30 days" (API growthMRR30d); not the "Revenue growth" field.
  const growthText = growth ? `, MRR 30g büyümesi ${Math.round(growth.value * 10) / 10}%` : "";
  return `MRR $${Math.round(mrr.value)} (TrustMRR)${growthText} — ${mrr.url}`;
}

/** found + traction (>5 TR rating) = dolu; found without traction = zayıf; others as mapped. */
export function gapLabel(verdict: TrVerdict): string {
  if (verdict.verdict !== "found") return TR_LABEL[verdict.verdict];
  const strong = verdict.evidence.some((item) => (item.ratingCount ?? 0) > 5);
  return strong ? "dolu" : "zayıf";
}

/**
 * Picks the snapshot to measure momentum against: the newest data/YYYY-MM-DD.json strictly older
 * than the run's own date. The run's own file is the same data as latest.json, so it never counts.
 */
export function previousSnapshotFile(files: readonly string[], runDate: string): string | null {
  const earlier = files
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file) && file.slice(0, 10) < runDate)
    .sort();
  return earlier.at(-1) ?? null;
}

export function renderMarkdown(output: IdeasOutput): string {
  const trendCount = output.ideas.filter((idea) => idea.labels.includes("trend")).length;
  const revenueCount = output.ideas.filter((idea) => idea.labels.includes("gelir")).length;
  const lines: string[] = [
    "# Startup fikirleri",
    "",
    `Üretim: ${output.generatedAt} · Kaynak: ${output.sourceFile} · Snapshot: ${output.snapshotFile ?? "yok (ilk gözlem)"} · ${output.ideas.length} fikir`,
    "",
    `Kota: trend ${trendCount} (en az 8), gelir ${revenueCount} (en az 8). Etiket: **trend** = çoklu kaynak veya güçlü HN/Reddit/PH/Apple sinyali, ürün URL'si var; **gelir** = TrustMRR MRR kanıtı.`,
    "",
    "Sıralama: gelir kanıtı +3, kaynak sayısı (her ek kaynak +3), ürünlük (URL/açıklama/kısa ad), sinyaller (log ölçekli HN/Reddit/MRR), ivme (önceki günlük snapshot'a göre). TR boşluğu: dolu/zayıf/boş/belirsiz.",
    "",
  ];
  for (const idea of output.ideas) {
    lines.push(
      `## ${idea.rank}. ${idea.name}`,
      "",
      `- **Etiket:** ${idea.labels.join(" + ")}`,
      `- **Ne olduğu:** ${idea.whatItIs}`,
      ...(idea.originalName !== idea.name ? [`- **Ham başlık:** ${idea.originalName}`] : []),
      `- **Neden listede:** ${idea.sources.join(" + ")} · skor ${idea.score.total} (kalite ${idea.score.quality}: gelir ${idea.score.revenue}, kaynak ${idea.score.sources}, ürünlük ${idea.score.product}; sinyal ${idea.score.signals}, ivme ${idea.score.momentum})`,
      `- **Ürün:** ${idea.url}`,
      `- **Trend:** kaynaklar ${idea.sources.join(" + ")} · ivme: ${idea.trend.momentum}`,
    );
    for (const point of idea.trend.signals) {
      lines.push(
        `  - ${point.source} · ${point.metric}: **${point.value}** (${point.date}) — ${point.url}`,
      );
    }
    lines.push("- **Veri noktaları:**");
    for (const point of idea.dataPoints) {
      lines.push(
        `  - ${point.source} · ${point.metric}: **${point.value}** (${point.date}) — ${point.url}`,
      );
    }
    lines.push(`- **Gelir kanıtı:** ${idea.revenueEvidence}`);
    lines.push(
      `- **TR doygunluğu:** ${idea.tr.verdict} · **TR boşluğu: ${idea.tr.gapLabel}** — ${idea.tr.reason}`,
    );
    lines.push(`  - Sorgular: ${idea.tr.queries.join(" | ") || "yok"}`);
    for (const item of idea.tr.evidence) {
      const rating =
        item.ratingCount === undefined ? "rating yok" : `${item.ratingCount} TR rating`;
      lines.push(`  - ${item.channel} · ${item.name} (${rating}) — ${item.url}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

export async function buildIdeas(dir = "data"): Promise<IdeasOutput> {
  const sourceFile = path.join(dir, "latest.json");
  if (!(await exists(sourceFile))) {
    console.error("data/latest.json yok, pnpm radar çalıştırılıyor");
    execFileSync("pnpm", ["radar"], { stdio: "inherit" });
  }
  const raw = JSON.parse(await readFile(sourceFile, "utf8")) as {
    generatedAt?: unknown;
    candidates?: Candidate[];
  };
  const candidates = raw.candidates ?? [];
  const runDate = typeof raw.generatedAt === "string" ? raw.generatedAt.slice(0, 10) : "";
  const snapshotName = previousSnapshotFile(await readdir(dir), runDate);
  const snapshotFile = snapshotName ? path.join(dir, snapshotName) : null;
  const snapshot = snapshotFile
    ? readSnapshot(JSON.parse(await readFile(snapshotFile, "utf8")) as unknown)
    : new Map();

  const ranked = rankCandidates(candidates, snapshot);
  const ideas: Idea[] = [];
  // TR checks are sequential: the iTunes channel already spaces its own requests (3 s).
  for (const [index, entry] of ranked.entries()) {
    const candidate = entry.candidate;
    const name = shortProductName(candidate.name);
    const verdict = await checkTrSaturation({
      name,
      ...(candidate.description ? { description: candidate.description } : {}),
      ...(candidate.url ? { url: candidate.url } : {}),
      queries: shortTrQueries(name, candidate.description),
      sources: candidate.sources,
      // A store-app flag from TrustMRR decides web vs app; without it the TR check infers from text.
      ...(candidate.isMobileApp === undefined ? {} : { webProduct: !candidate.isMobileApp }),
    });
    console.error(
      `TR ${index + 1}/${ranked.length}: ${name} → ${verdict.verdict} (${verdict.evidence.length} kanıt)`,
    );
    ideas.push({
      rank: index + 1,
      key: candidate.key,
      name,
      originalName: candidate.name,
      url: candidate.url,
      whatItIs: describe(candidate),
      category: candidate.category ?? null,
      labels: entry.labels,
      sources: candidate.sources,
      score: entry.score,
      trend: { signals: trendSignals(candidate), momentum: entry.momentum },
      dataPoints: candidate.dataPoints,
      revenueEvidence: revenueEvidence(candidate),
      tr: {
        verdict: verdict.verdict,
        reason: verdict.reason,
        queries: verdict.queries,
        evidence: verdict.evidence.map((item) => ({
          name: item.name,
          channel: item.channel,
          ...(item.ratingCount === undefined ? {} : { ratingCount: item.ratingCount }),
          url: item.url,
        })),
        gapLabel: gapLabel(verdict),
      },
    });
  }

  const output: IdeasOutput = {
    generatedAt: new Date().toISOString(),
    sourceFile,
    snapshotFile,
    ideas,
  };
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "ideas.json"), `${JSON.stringify(output, null, 2)}\n`);
  await writeFile(path.join(dir, "ideas.md"), renderMarkdown(output));
  return output;
}

async function exists(file: string): Promise<boolean> {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}
