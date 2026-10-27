import { closeDb } from "../db.js";
import { runBuild } from "./build.js";
import { renderDigestMarkdown, runDigest } from "./digest.js";
import { FixtureEvidenceExtractor } from "./extractors/fixture.js";
import { isFeedbackVerdict, recordFeedback } from "./feedback.js";

function flagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function usage(): void {
  console.log("kullanım:");
  console.log("  pnpm opportunities build --fixture <path>");
  console.log("  pnpm opportunities digest --format json|md [--now <ISO>]");
  console.log("  pnpm opportunities feedback --id <opportunity_key> --verdict open|investigate|drop|knew [--note \"...\"]");
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
    if (format !== "json" && format !== "md") {
      throw new Error(`bilinmeyen format: ${format} (json veya md)`);
    }
    const nowRaw = flagValue(args, "--now");
    const now = nowRaw ? new Date(nowRaw) : undefined;
    if (now && Number.isNaN(now.getTime())) {
      throw new Error(`geçersiz --now: ${nowRaw}`);
    }
    const digest = await runDigest({ now });
    if (format === "json") {
      process.stdout.write(JSON.stringify(digest, null, 2) + "\n");
    } else {
      process.stdout.write(renderDigestMarkdown(digest));
    }
    return;
  }

  if (command === "feedback") {
    const id = flagValue(args, "--id");
    const verdict = flagValue(args, "--verdict");
    if (!id) {
      throw new Error("feedback için --id <opportunity_key> gerekli");
    }
    if (!verdict || !isFeedbackVerdict(verdict)) {
      throw new Error(
        `geçersiz verdict: ${verdict ?? "yok"} (open, investigate, drop veya knew)`
      );
    }
    const note = flagValue(args, "--note") ?? null;
    const event = await recordFeedback(id, verdict, note);
    console.log(
      `feedback: key=${id} verdict=${verdict} at=${event.createdAt.toISOString()}`
    );
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
