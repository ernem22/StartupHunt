import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Candidate, DataPoint } from "../candidates/model.js";
import { checkTrSaturation, type TrVerdict } from "../tr/check.js";
import { rankCandidates, readSnapshot, type RankedCandidate } from "./rank.js";

export type Idea = {
  rank: number;
  key: string;
  name: string;
  url: string;
  whatItIs: string;
  category: string | null;
  sources: string[];
  score: RankedCandidate["score"];
  momentum: string | null;
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

/** One line, only from fields already in the candidate. No invented prose. */
export function describe(candidate: Candidate): string {
  const description = candidate.description?.replace(/\s+/g, " ").trim();
  if (description) return description.slice(0, 220);
  if (candidate.sources.includes("showhn")) {
    return `Show HN başlığı: ${candidate.name.replace(/\s+/g, " ").trim().slice(0, 220)}`;
  }
  const points = candidate.dataPoints.map((point) => `${point.metric}=${point.value}`).join(", ");
  const category = candidate.category ? `${candidate.category}; ` : "";
  return `${category}${candidate.sources.join(" + ")} sinyalı: ${points}`;
}

export function revenueEvidence(candidate: Candidate): string {
  const mrr = candidate.dataPoints.find((point) => point.metric === "mrr_usd");
  if (!mrr) return "aranmadı";
  const growth = candidate.dataPoints.find((point) => point.metric === "growth_mrr_30d_pct");
  const growthText = growth ? `, 30g büyüme ${Math.round(growth.value * 10) / 10}%` : "";
  return `MRR $${Math.round(mrr.value)} (TrustMRR)${growthText} — ${mrr.url}`;
}

/** found + traction (>5 TR rating) = dolu; found without traction = zayıf; others as mapped. */
export function gapLabel(verdict: TrVerdict): string {
  if (verdict.verdict !== "found") return TR_LABEL[verdict.verdict];
  const strong = verdict.evidence.some((item) => (item.ratingCount ?? 0) > 5);
  return strong ? "dolu" : "zayıf";
}

export function renderMarkdown(output: IdeasOutput): string {
  const lines: string[] = [
    "# Startup fikirleri",
    "",
    `Üretim: ${output.generatedAt} · Kaynak: ${output.sourceFile} · Snapshot: ${output.snapshotFile ?? "yok"} · ${output.ideas.length} fikir`,
    "",
    "Sıralama: kaynak sayısı (her ek kaynak +3), sinyaller (log ölçekli HN/Reddit/MRR, doğrusal büyüme ve sıra), snapshot ivmesi. TR boşluğu: dolu/zayıf/boş/belirsiz.",
    "",
  ];
  for (const idea of output.ideas) {
    lines.push(
      `## ${idea.rank}. ${idea.name}`,
      "",
      `- **Ne olduğu:** ${idea.whatItIs}`,
      `- **Neden listede:** ${idea.sources.join(" + ")} · skor ${idea.score.total} (kaynak ${idea.score.sources}, sinyal ${idea.score.signals}, ivme ${idea.score.momentum})${idea.momentum ? ` · ivme: ${idea.momentum}` : ""}`,
      `- **Ürün:** ${idea.url}`,
    );
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

async function exists(file: string): Promise<boolean> {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

export async function buildIdeas(dir = "data"): Promise<IdeasOutput> {
  const sourceFile = path.join(dir, "latest.json");
  if (!(await exists(sourceFile))) {
    console.error("data/latest.json yok, pnpm radar çalıştırılıyor");
    execFileSync("pnpm", ["radar"], { stdio: "inherit" });
  }
  const raw = JSON.parse(await readFile(sourceFile, "utf8")) as unknown;
  const candidates = (raw as { candidates?: Candidate[] }).candidates ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const snapshotFile = path.join(dir, `${today}.json`);
  const snapshot = (await exists(snapshotFile))
    ? readSnapshot(JSON.parse(await readFile(snapshotFile, "utf8")) as unknown)
    : new Map();

  const ranked = rankCandidates(candidates, snapshot);
  const ideas: Idea[] = [];
  // TR checks are sequential: the iTunes channel already spaces its own requests (3 s).
  for (const [index, entry] of ranked.entries()) {
    const candidate = entry.candidate;
    const verdict = await checkTrSaturation({
      name: candidate.name,
      ...(candidate.description ? { description: candidate.description } : {}),
      ...(candidate.url ? { url: candidate.url } : {}),
    });
    console.error(
      `TR ${index + 1}/${ranked.length}: ${candidate.name} → ${verdict.verdict} (${verdict.evidence.length} kanıt)`,
    );
    ideas.push({
      rank: index + 1,
      key: candidate.key,
      name: candidate.name,
      url: candidate.url,
      whatItIs: describe(candidate),
      category: candidate.category ?? null,
      sources: candidate.sources,
      score: entry.score,
      momentum: entry.momentumDetail,
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
    snapshotFile: (await exists(snapshotFile)) ? snapshotFile : null,
    ideas,
  };
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "ideas.json"), `${JSON.stringify(output, null, 2)}\n`);
  await writeFile(path.join(dir, "ideas.md"), renderMarkdown(output));
  return output;
}
