// FAZ 5/6 pipeline komutları — `npm run pipeline [clean|embed]`
import pg from "pg";
import { runCleaning } from "./pipeline/clean.js";
import { runEmbedding } from "./pipeline/embed.js";
import { config } from "./config.js";

async function main() {
  const cmd = process.argv[2];
  const pool = new pg.Pool({ connectionString: config.databaseUrl });

  try {
    if (cmd === "clean") {
      const s = await runCleaning();
      console.log(`✔ cleaning: scanned=${s.scanned} cleaned=${s.cleaned} discarded=${s.discarded}`);
    } else if (cmd === "embed") {
      const s = await runEmbedding(pool);
      console.log(
        `✔ embedding: embedded=${s.embedded} failed=${s.failed} dim-check=${s.dimensionCheck ? "ok" : "yok (0 kayıt)"}`
      );
    } else if (cmd === "all") {
      const c = await runCleaning();
      console.log(`✔ cleaning: ${c.cleaned} cleaned, ${c.discarded} discarded`);
      const e = await runEmbedding(pool);
      console.log(`✔ embedding: ${e.embedded} embedded`);
    } else {
      console.log("kullanım: npm run pipeline [clean|embed|all]");
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
