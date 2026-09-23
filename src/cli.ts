// CLI — npm run collect [adapter] [-- --dry-run] [-- --limit N]
import { closeDb } from "./db.js";
import { RedditBackfillAdapter } from "./adapters/reddit-backfill.js";
import { RedditIncrementalAdapter } from "./adapters/reddit-incremental.js";
import { HackerNewsAdapter } from "./adapters/hackernews.js";
import { GitHubAdapter } from "./adapters/github.js";
import { StackExchangeAdapter } from "./adapters/stackexchange.js";
import { YouTubeAdapter } from "./adapters/youtube.js";
import type { Adapter, CollectOptions } from "./types.js";

const ADAPTERS: Record<string, () => Adapter> = {
  "reddit-backfill": () => new RedditBackfillAdapter(),
  hackernews: () => new HackerNewsAdapter(),
  github: () => new GitHubAdapter(),
  stackexchange: () => new StackExchangeAdapter(),
  youtube: () => new YouTubeAdapter(),
};

// OPT_IN — "collect all" a dahil DEĞİL; yalnızca adı verilirse koşar.
// reddit-incremental: plan v3.2'de scraper iptal edildi; RedditLiveAdapter
// (resmî OAuth) pilot sonrası bu slotu devralacak.
const OPT_IN: Record<string, () => Adapter> = {
  "reddit-incremental": () => new RedditIncrementalAdapter(),
};

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const opts: CollectOptions = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--limit") opts.limit = Number(argv[++i]);
    else positional.push(a);
  }
  return { positional, opts };
}

async function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const [command, adapterName] = positional;

  if (command !== "collect") {
    console.log("kullanım: npm run collect [adapter] [-- --dry-run] [-- --limit N]");
    console.log(`adapter'lar: ${Object.keys(ADAPTERS).join(", ")}`);
    process.exit(0);
  }

  const names = adapterName ? [adapterName] : Object.keys(ADAPTERS);
  for (const name of names) {
    const adapter = ADAPTERS[name]?.() ?? OPT_IN[name]?.();
    if (!adapter) {
      console.error(`bilinmeyen adapter: ${name}`);
      console.log(`collect all'da olanlar: ${Object.keys(ADAPTERS).join(", ")}`);
      console.log(`opt-in (yalnız isim veriler): ${Object.keys(OPT_IN).join(", ")}`);
      process.exit(1);
    }
    console.log(`=== ${adapter.name} ===`);
    opts.onProgress = (info) => {
      if (info.processed % 500 === 0) console.log(`  ... ${info.processed} processed`);
    };
    await adapter.collect(null, opts);
  }
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
