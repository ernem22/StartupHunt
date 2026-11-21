import { execFileSync } from "node:child_process";
import pg from "pg";
import { candidatePool, GitHubMomentumCollector } from "./github.js";
import { runRadar } from "./run.js";
import { PostgresRadarStore } from "./store.js";

async function main(): Promise<void> {
  if (process.argv.length > 2) throw new Error("Usage: pnpm radar");
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL must be provided in the process environment");
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
  try {
    await client.connect();
    console.log(
      await runRadar(
        new GitHubMomentumCollector(candidatePool[0]!.query),
        new PostgresRadarStore(client),
        new Date(),
        commit,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Radar failed");
  process.exitCode = 1;
});
