import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CandidateSeries } from "./github.js";
import type { Manifest, RadarStore } from "./run.js";
import { momentum } from "./run.js";

export interface StoredSource {
  manifest: Manifest;
  status: "running" | "completed" | "failed";
  entityType?: string;
  metric?: string;
  candidates: (CandidateSeries & { momentum: number | null })[];
}

/** Keeps runs in memory; `write` publishes them as JSON files (no database). */
export class JsonRadarStore implements RadarStore {
  readonly sources: StoredSource[] = [];
  readonly errors: { source: string; message: string }[] = [];

  addError(source: string, message: string): void {
    this.errors.push({ source, message });
  }

  async start(manifest: Manifest): Promise<string> {
    this.sources.push({ manifest, status: "running", candidates: [] });
    return String(this.sources.length - 1);
  }

  async complete(
    id: string,
    series: CandidateSeries[],
    source?: { entityType: string; metric: string },
  ): Promise<void> {
    const entry = this.sources[Number(id)]!;
    entry.status = "completed";
    entry.entityType = source?.entityType;
    entry.metric = source?.metric;
    entry.candidates = series.map((candidate) => ({ ...candidate, momentum: momentum(candidate) }));
  }

  async fail(id: string): Promise<void> {
    this.sources[Number(id)]!.status = "failed";
  }

  /** Writes `<dir>/latest.json` and `<dir>/YYYY-MM-DD.json` (UTC); returns the paths. */
  async write(dir: string, at: Date, commit: string): Promise<string[]> {
    const sources = this.sources.filter((s) => s.status === "completed");
    if (sources.length === 0) throw new Error("Refusing to publish JSON: no source completed");
    const body = `${JSON.stringify({ generatedAt: at.toISOString(), commit, errors: this.errors, sources }, null, 2)}
`;
    await mkdir(dir, { recursive: true });
    const paths = [
      path.join(dir, "latest.json"),
      path.join(dir, `${at.toISOString().slice(0, 10)}.json`),
    ];
    for (const file of paths) await writeFile(file, body);
    return paths;
  }
}
