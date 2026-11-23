import { execFileSync } from "node:child_process";
import { candidatePool, GitHubMomentumCollector } from "./github.js";
import { HackerNewsMomentumCollector } from "./hackernews.js";
import { HFMomentumCollector } from "./hf.js";
import { githubSource, hackerNewsSource, huggingFaceSource, runRadar } from "./run.js";
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
  const outputs = [
    await runRadar(githubSource(new GitHubMomentumCollector(pool.query)), store, at, commit),
    await runRadar(
      hackerNewsSource(new HackerNewsMomentumCollector(pool.hnQueries)),
      store,
      at,
      commit,
    ),
    await runRadar(huggingFaceSource(new HFMomentumCollector()), store, at, commit),
  ];
  const files = await store.write("data", at, commit);
  console.log(outputs.join("\n\n"));
  console.error(`JSON: ${files.join(", ")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Radar failed");
  process.exitCode = 1;
});
