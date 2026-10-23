import { closeDb } from "../db.js";
import { runBuild } from "./build.js";
import { runDigest } from "./digest.js";
import { FixtureEvidenceExtractor } from "./extractors/fixture.js";

function flagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function usage(): void {
  console.log("kullanım:");
  console.log("  pnpm opportunities build --fixture <path>");
  console.log("  pnpm opportunities digest --format json");
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (command === "build") {
    const fixture = flagValue(args, "--fixture");
    if (!fixture) {
      throw new Error("build için --fixture <path> gerekli");
    }
    const stats = await runBuild(new FixtureEvidenceExtractor(fixture));
    console.log(
      `build: observations=${stats.observations} evidence=${stats.evidence} opportunities=${stats.opportunities} signals=${stats.signals} skipped=${stats.skipped}`
    );
    return;
  }

  if (command === "digest") {
    const format = flagValue(args, "--format") ?? "json";
    if (format !== "json") {
      throw new Error(`bilinmeyen format: ${format} (şu an yalnızca json)`);
    }
    const digest = await runDigest();
    process.stdout.write(JSON.stringify(digest, null, 2) + "\n");
    return;
  }

  usage();
  process.exitCode = 1;
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
