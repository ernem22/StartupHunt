import { execFileSync } from "node:child_process";
import { enrichGithubStars } from "../candidates/github-stars.js";
import { collectCandidates } from "../candidates/run.js";
import { PRODUCERS } from "../candidates/sources.js";
import { candidatePool, GitHubMomentumCollector, type MomentumCollector } from "./github.js";
import { HackerNewsMomentumCollector } from "./hackernews.js";
import { HFMomentumCollector } from "./hf.js";
import {
  githubSource,
  hackerNewsSource,
  huggingFaceSource,
  runRadar,
  type RadarSource,
} from "./run.js";
import { JsonRadarStore } from "./store.js";

function gitCommit(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function main(): Promise<void> {
  if (process.argv.length > 2) throw new Error("Usage: pnpm radar");
  const commit = gitCommit();
  const pool = candidatePool[0]!;
  const store = new JsonRadarStore();
  const at = new Date();
  const github = new GitHubMomentumCollector(pool.query);
  const sources: RadarSource[] = [
    githubSource(github),
    hackerNewsSource(new HackerNewsMomentumCollector(pool.hnQueries)),
    huggingFaceSource(new HFMomentumCollector()),
  ];
  const outputs: string[] = [];
  // A failing source must not take the others down; its error is published in the JSON.
  for (const source of sources) {
    try {
      outputs.push(await runRadar(source, store, at, commit));
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      store.addError(source.source, message);
      console.error(`${source.source} başarısız: ${message}`);
    }
    for (const skipped of (source.collector as MomentumCollector).skipped ?? []) {
      store.addError(source.source, `atlandı: ${skipped}`);
      console.error(`${source.source} atlandı: ${skipped}`);
    }
  }
  // Candidate producers: each failure is isolated and recorded in the JSON errors list.
  const candidateRun = await collectCandidates(PRODUCERS, at);
  for (const error of candidateRun.errors) {
    store.addError(error.source, error.message);
    console.error(`${error.source}: ${error.message}`);
  }
  console.error(`ham aday: ${JSON.stringify(candidateRun.rawCounts)}`);
  console.error(`birleştirilmiş aday: ${candidateRun.candidates.length}`);
  // GitHub repo links get a 7-day star count; GITHUB_TOKEN raises the anonymous rate limit.
  const stars = await enrichGithubStars(candidateRun.candidates, at, process.env.GITHUB_TOKEN);
  for (const message of stars.skipped) {
    store.addError("github", message);
    console.error(message);
  }
  const files = await store.write("data", at, commit, stars.candidates);
  console.log(outputs.join("\n\n"));
  console.error(`JSON: ${files.join(", ")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Radar failed");
  process.exitCode = 1;
});
