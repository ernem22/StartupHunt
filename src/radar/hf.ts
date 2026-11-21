import { completedWeeks, type CandidateSeries, type MomentumCollector } from "./github.js";

const API = "https://huggingface.co/api";
const PARAMS = "sort=trendingScore&limit=30";

// Separate from the frozen text-observation Adapter contract.
export class HFMomentumCollector implements MomentumCollector {
  readonly source = "huggingface";
  readonly title = "Hugging Face adayları";

  constructor(private readonly request: typeof fetch = fetch) {}

  async collect(at: Date): Promise<CandidateSeries[]> {
    const response = await this.request(`${API}/models?${PARAMS}`, {
      headers: { "User-Agent": "StartupHunt/0.1" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Hugging Face HTTP ${response.status}: /models`);
    const models: unknown = await response.json();
    if (!Array.isArray(models)) throw new Error("Invalid Hugging Face listing");
    // HF provides no weekly history; the score is a point metric captured at the
    // last completed week so repeated runs accumulate comparable snapshots.
    const week = completedWeeks(at).at(-1)!;
    const result: CandidateSeries[] = [];
    for (const model of models) {
      if (
        !model ||
        typeof model.id !== "string" ||
        !/^[\w.-]+\/[\w.-]+$/.test(model.id) ||
        !(model.pipeline_tag === undefined || typeof model.pipeline_tag === "string")
      ) {
        throw new Error("Invalid Hugging Face model entry");
      }
      if (!Number.isFinite(model.trendingScore)) {
        console.warn(`trendingScore missing, excluded: ${model.id}`);
        continue;
      }
      result.push({
        name: model.id,
        description:
          typeof model.pipeline_tag === "string"
            ? `Yapay zekâ modeli (${model.pipeline_tag})`
            : "Yapay zekâ modeli",
        url: `https://huggingface.co/${model.id}`,
        historyUrl: `${API}/models?${PARAMS}`,
        weeks: [{ week, total: model.trendingScore }],
        metric: "hf_trending_score",
        score: {
          value: model.trendingScore,
          label: "trendingScore",
          evidence: "Hugging Face'in kendi son dönem ilgi ölçüsü",
        },
      });
    }
    return result;
  }
}
