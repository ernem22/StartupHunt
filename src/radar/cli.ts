import { execFileSync } from "node:child_process";
import pg from "pg";
import { candidatePool, GitHubMomentumCollector } from "./github.js";
import { HackerNewsMomentumCollector } from "./hackernews.js";
import { HFMomentumCollector } from "./hf.js";
import { githubSource, hackerNewsSource, huggingFaceSource, runRadar } from "./run.js";
import { PostgresRadarStore } from "./store.js";

async function main(): Promise<void> {
  if (process.argv.length > 2) throw new Error("Usage: pnpm radar");
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL must be provided in the process environment");
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const pool = candidatePool[0]!;
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
  try {
    await client.connect();
    const store = new PostgresRadarStore(client);
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
    console.log(outputs.join("\n\n"));
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Radar failed");
  process.exitCode = 1;
});
