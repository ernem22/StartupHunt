import { buildIdeas } from "./report.js";

async function main(): Promise<void> {
  if (process.argv.length > 2) throw new Error("Usage: pnpm ideas");
  const output = await buildIdeas();
  console.error(`${output.ideas.length} fikir: data/ideas.json, data/ideas.md`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Ideas failed");
  process.exitCode = 1;
});
