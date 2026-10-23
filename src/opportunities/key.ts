import { createHash } from "node:crypto";
import type { EvidenceDraft } from "./types.js";

function normalizePart(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function opportunityKey(draft: Pick<EvidenceDraft, "actor" | "job" | "problem">): string {
  const normalized = [draft.actor, draft.job, draft.problem].map(normalizePart).join("\u0000");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}
