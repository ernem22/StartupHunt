export interface ObservationForExtraction {
  id: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  title: string | null;
  text: string;
  author: string | null;
  observedAt: Date | null;
  language: string | null;
}

export type CounterArgumentStrength = "weak" | "moderate" | "strong";

export interface EvidenceDraft {
  actor: string;
  job: string;
  problem: string;
  workaround: string | null;
  costTime: string | null;
  costMoney: string | null;
  frequency: string | null;
  existingSolution: string | null;
  existingSolutionGap: string | null;
  counterArgument: string | null;
  counterArgumentStrength: CounterArgumentStrength | null;
  nextStep: string | null;
  nextStepMinutes: number | null;
  quote: string;
  language: string | null;
}

export interface EvidenceExtractor {
  name: string;
  extract(observation: ObservationForExtraction): EvidenceDraft[];
}
