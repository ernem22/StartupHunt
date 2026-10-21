import { readFileSync } from "node:fs";
import type { EvidenceDraft, EvidenceExtractor, ObservationForExtraction } from "../types.js";

interface FixtureFile {
  extractions: Record<string, EvidenceDraft[]>;
}

export class FixtureEvidenceExtractor implements EvidenceExtractor {
  readonly name = "fixture";
  private readonly extractions: Record<string, EvidenceDraft[]>;

  constructor(path: string) {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as FixtureFile;
    if (!parsed || typeof parsed !== "object" || !parsed.extractions) {
      throw new Error(`fixture extraction dosyası geçersiz: ${path}`);
    }
    this.extractions = parsed.extractions;
  }

  extract(observation: ObservationForExtraction): EvidenceDraft[] {
    const key = `${observation.source}:${observation.sourceId}`;
    const drafts = this.extractions[key] ?? [];
    for (const draft of drafts) {
      if (draft.quote.length === 0 || !observation.text.includes(draft.quote)) {
        throw new Error(`fixture quote metnin birebir alt dizisi değil (${key})`);
      }
    }
    return drafts;
  }
}
