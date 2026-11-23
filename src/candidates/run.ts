import { mergeCandidates } from "./merge.js";
import type { Candidate, ProducerError, RawCandidate } from "./model.js";
import type { CandidateProducer } from "./sources.js";

export interface CandidateRun {
  candidates: Candidate[];
  /** Number of raw (pre-merge) candidates each source produced. */
  rawCounts: Record<string, number>;
  errors: ProducerError[];
}

/**
 * Runs every producer in turn. A failing producer is recorded in `errors` and the others
 * still run; only producers that returned data contribute to the merged list.
 */
export async function collectCandidates(
  producers: readonly CandidateProducer[],
  at: Date,
): Promise<CandidateRun> {
  const raw: RawCandidate[] = [];
  const rawCounts: Record<string, number> = {};
  const errors: ProducerError[] = [];
  for (const producer of producers) {
    try {
      const result = await producer.collect(at);
      for (const message of result.skipped) errors.push({ source: producer.source, message });
      rawCounts[producer.source] = result.candidates.length;
      raw.push(...result.candidates);
    } catch (error) {
      rawCounts[producer.source] = 0;
      errors.push({
        source: producer.source,
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  }
  return { candidates: mergeCandidates(raw), rawCounts, errors };
}
