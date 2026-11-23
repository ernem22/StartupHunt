import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Candidate, DataPoint } from "../candidates/model.js";
import { checkTrSaturation, type TrVerdict } from "../tr/check.js";
import { shortProductName, shortTrQueries } from "./names.js";
import {
  LIST_SIZE,
  readSnapshot,
  selectTop,
  trendSignals,
  type Label,
  type PreviousSnapshot,
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
  /** Display labels: "trend" (trend-led), "gelir" (revenue-led) or both. Nothing is selected by them. */
  labels: Label[];
  sources: string[];
  score: { trend: number; momentum: number; revenue: number; total: number };
  /** "Neden bu sırada": the global factors that set the order. TR is not one of them. */
  reason: string;
  trend: {
    /** Trend observations only (PH rank, Apple ranks and release age, HN/Reddit numbers with the Show HN date). */
    signals: DataPoint[];
    /** "ilk gözlem" when no earlier snapshot holds the product; otherwise the changed metrics. */
    momentum: string;
  };
  dataPoints: DataPoint[];
  revenueEvidence: string;
  /** Checked after the order is fixed; it never changes the rank or the selection. */
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

/** "Neden bu sırada": the global factors that set the order. */
export function reasonLine(entry: RankedCandidate): string {
  const { trend, momentum, revenue, base } = entry.score;
  return `trend ${trend} + ivme ${momentum} + gelir ${revenue} = ${base}`;
}

export function renderMarkdown(output: IdeasOutput): string {
  const lines: string[] = [
    "# Startup fikirleri",
    "",
    `Üretim: ${output.generatedAt} · Kaynak: ${output.sourceFile} · Snapshot: ${output.snapshotFile ?? "yok (ilk gözlem)"} · ${output.ideas.length} fikir`,
    "",
    "Sıralama yalnızca küresel trend gücüyle yapılır: çoklu kaynak, PH/Apple US sırası, uygulama yaşı, HN/Reddit puanları ve ivme; gelir kanıtı küçük bir ek terimdir (+0,25). TR durumu sıralamaya girmez; her kartta ayrı TR alanı olarak yazılır (dolu olanlar da listede kalır).",
    "",
  ];
  for (const idea of output.ideas) {
    lines.push(
      `## ${idea.rank}. ${idea.name}`,
      "",
      `- **Etiket:** ${idea.labels.join(" + ") || "yok"}`,
      `- **Ne olduğu:** ${idea.whatItIs}`,
      ...(idea.originalName !== idea.name ? [`- **Ham başlık:** ${idea.originalName}`] : []),
      `- **Neden bu sırada:** ${idea.reason} · toplam ${idea.score.total}`,
      `- **Ürün:** ${idea.url}`,
      `- **Kaynaklar:** ${idea.sources.join(" + ")}`,
      `- **Trend:** ivme: ${idea.trend.momentum}`,
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

/** One card: the order comes from `entry`; the TR verdict only fills the TR fields. */
export function toIdea(entry: RankedCandidate, rank: number, verdict: TrVerdict): Idea {
  const candidate = entry.candidate;
  return {
    rank,
    key: candidate.key,
    name: shortProductName(candidate.name),
    originalName: candidate.name,
    url: candidate.url,
    whatItIs: describe(candidate),
    category: candidate.category ?? null,
    labels: entry.labels,
    sources: candidate.sources,
    score: {
      trend: entry.score.trend,
      momentum: entry.score.momentum,
      revenue: entry.score.revenue,
      total: entry.score.base,
    },
    reason: reasonLine(entry),
    trend: { signals: trendSignals(candidate), momentum: entry.momentum },
    dataPoints: candidate.dataPoints,
    revenueEvidence: revenueEvidence(candidate),
    tr: {
      verdict: verdict.verdict,
      reason: verdict.reason,
      queries: verdict.queries,
      evidence: verdict.evidence.map((evidence) => ({
        name: evidence.name,
        channel: evidence.channel,
        ...(evidence.ratingCount === undefined ? {} : { ratingCount: evidence.ratingCount }),
        url: evidence.url,
      })),
      gapLabel: gapLabel(verdict),
    },
  };
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
  const snapshot: PreviousSnapshot = snapshotFile
    ? readSnapshot(JSON.parse(await readFile(snapshotFile, "utf8")) as unknown)
    : new Map();

  // The order is fixed by trend strength; TR is checked afterwards for the chosen cards only.
  const top = selectTop(candidates, snapshot, LIST_SIZE);
  const ideas: Idea[] = [];
  // TR checks are sequential: the iTunes channel already spaces its own requests (3 s).
  for (const [index, entry] of top.entries()) {
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
      `TR ${index + 1}/${top.length}: ${name} → ${verdict.verdict} (${verdict.evidence.length} kanıt)`,
    );
    ideas.push(toIdea(entry, index + 1, verdict));
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
