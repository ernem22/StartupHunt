import { checkTrSaturation } from "./check.js";

async function main(): Promise<void> {
  const [name, description, url] = process.argv.slice(2);
  if (!name) {
    console.error('Kullanim: pnpm tr-check "<urun adi>" "<aciklama>" [<url>]');
    process.exitCode = 1;
    return;
  }
  const verdict = await checkTrSaturation({
    name,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
  });
  console.log(JSON.stringify(verdict, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "TR check failed");
  process.exitCode = 1;
});
