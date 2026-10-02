// SeArchiveAdapter — Stack Exchange Data Dump backfill (plan v3.2 FAZ 1: SE backfill).
// Kaynak: https://archive.org/download/stackexchange/<site>.7z — üç aylık snapshot, Posts.xml.
// Kapsam (deterministik): PostTypeId=1 (soru) + Title zorunlu; cevaplar v0.1'de YOK (sorular
// pain-point taşır; cevaplar "çözüm" katmanı — pilot sonrası genişletilebilir).
// Akış: 7z indir (yoksa) → `7z x -so Posts.xml` stream → satır satır <row/> parse → upsert.
// İmleç: site başına son işlenen Id (dump snapshot olduğu için re-parse idempotent upsert ile güvenli).
// Gereksinim: 7-Zip binary (SEVEN_ZIP_BIN env, varsayılan "C:\\Program Files\\7-Zip\\7z.exe").
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import fs from "node:fs";
import path from "node:path";
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash, loadAdapterState, saveAdapterState } from "../db.js";
import { BACKFILL_SINCE } from "../config.js";

const SEVEN_ZIP =
  process.env.SEVEN_ZIP_BIN ?? "C:\\Program Files\\7-Zip\\7z.exe";
const DUMP_BASE = "https://archive.org/download/stackexchange";
const DATA_DIR = process.env.SE_DUMP_DIR ?? "data/se-dump";

/** V0.1 site listesi — pain-point yoğun, dump boyutu yönetilebilir siteler.
 *  stackoverflow (devasa) bilinçli olarak DIŞARIDA — pilot sonrası ayrı karar.
 *  Test/kısıt için env override: SE_SITES="softwarerecs.stackexchange.com" */
const SITES = (process.env.SE_SITES?.split(",").map((s) => s.trim()).filter(Boolean) ?? [
  "softwarerecs.stackexchange.com",
  "superuser.com",
  "serverfault.com",
]);

function makeStateStore<T>(dryRun: boolean, initial: () => T) {
  let mem: T | null = null;
  return {
    async load(): Promise<T> {
      if (dryRun) return (mem ??= initial());
      return (await loadAdapterState<T>("searchive")) ?? initial();
    },
    async save(v: T): Promise<void> {
      if (dryRun) {
        mem = v;
        return;
      }
      await saveAdapterState("searchive", v, {});
    },
  };
}

interface SeCursor {
  lastId: Record<string, number>; // site → son işlenen Posts.Id
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRow(line: string): Record<string, string> | null {
  if (!line.includes("<row ")) return null;
  const attrs: Record<string, string> = {};
  const re = /(\w+)="((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) attrs[m[1]!] = m[2]!;
  return attrs.Id ? attrs : null;
}

function toNormalized(site: string, a: Record<string, string>): NormalizedObservation | null {
  if (a["PostTypeId"] !== "1") return null; // yalnız soru
  const title = (a["Title"] ?? "").trim();
  const body = stripHtml(a["Body"] ?? "");
  const text = `${title}\n\n${body}`.trim();
  if (!title || text.length < 40) return null;
  const id = Number(a["Id"]);
  return {
    source: "stackexchange",
    sourceId: `dump:${site}:${id}`,
    sourceUrl: `https://${site}/questions/${id}`,
    title,
    text,
    author: null, // dump OwnerUserId sayısal; display name ayrı tabloda — v0.1'de null
    observedAt: a["CreationDate"] ? new Date(a["CreationDate"]) : null,
    language: null,
    metadata: {
      site,
      kind: "question",
      score: Number(a["Score"] ?? 0),
      answers: Number(a["AnswerCount"] ?? 0),
      views: Number(a["ViewCount"] ?? 0),
      tags: (a["Tags"] ?? "").replace(/[<>]/g, " ").trim(),
      from_dump: true,
    },
  };
}

async function ensureDump(site: string): Promise<string> {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${site}.7z`);
  if (fs.existsSync(file)) {
    console.log(`  ${site}.7z mevcut (${(fs.statSync(file).size / 1e6).toFixed(1)} MB)`);
    return file;
  }
  console.log(`▼ ${site}.7z indiriliyor...`);
  let res: Response;
  try {
    res = await fetch(`${DUMP_BASE}/${site}.7z`, { signal: AbortSignal.timeout(600_000) });
  } catch (e) {
    if (fs.existsSync(file)) fs.unlinkSync(file); // yarım dosya kalmasın — sonraki koşum baştan
    throw e;
  }
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const ws = fs.createWriteStream(file);
  await res.body.pipeTo(
    new WritableStream({
      write: (c) => new Promise<void>((ok, bad) => ws.write(c, (e) => (e ? bad(e) : ok()))),
      close: () => new Promise<void>((ok) => ws.end(ok)),
    }),
  );
  return file;
}

export class SeArchiveAdapter implements Adapter {
  name = "searchive";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    const store = makeStateStore<SeCursor>(opts.dryRun, () => ({ lastId: {} }));
    const cursor = await store.load();
    let processed = 0;

    for (const site of SITES) {
      const file = await ensureDump(site);
      const seenFrom = cursor.lastId[site] ?? 0;
      console.log(`▶ ${site} — Posts.xml stream (lastId>${seenFrom})`);

      const seven = spawn(SEVEN_ZIP, ["x", "-so", "-bd", file, "Posts.xml"], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      const rl = createInterface({ input: seven.stdout!, crlfDelay: Infinity });
      let maxId = seenFrom;
      let rows = 0;
      // Posts.xml: Body içindeki newline'lar satırı böler — "/>" görene kadar biriktir
      let buf = "";
      for await (const line of rl) {
        buf += line;
        if (!buf.includes("/>")) continue;
        const row = buf;
        buf = "";
        const a = parseRow(row);
        if (!a) continue;
        const id = Number(a["Id"]);
        if (id <= seenFrom) continue; // snapshot re-parse: idempotent, hızlı geç
        rows++;
        const norm = toNormalized(site, a);
        if (id > maxId) maxId = id;
        if (!norm) continue;
        // BACKFILL_SINCE öncesi bayat sorular v0.1'de atlanır (18 ay penceresi).
        // Test override: SE_MIN_DATE=2020-01-01 (yalnız dry-run doğrulama için)
        const minDate = process.env.SE_MIN_DATE ? new Date(process.env.SE_MIN_DATE) : BACKFILL_SINCE;
        if (norm.observedAt && norm.observedAt < minDate) continue;
        if (opts.limit !== undefined && processed >= opts.limit) {
          console.log(`oturum limiti (${opts.limit}) doldu — imleç ${site}:${maxId}'de kaldı`);
          cursor.lastId[site] = maxId;
          await store.save(cursor);
          seven.kill();
          return;
        }
        if (!opts.dryRun) {
          await upsertRaw({ source: "stackexchange", sourceId: norm.sourceId, rawData: a });
          try {
            await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
          } catch (err) {
            if (!(err as Error).message.includes("duplicate key")) throw err;
          }
        }
        processed++;
        opts.onProgress?.({ processed, totalFetched: processed });
      }

      await new Promise<void>((ok) => seven.on("close", () => ok()));
      cursor.lastId[site] = maxId;
      await store.save(cursor);
      console.log(`  ${site} tamam (satır=${rows}, obs=${processed} toplam, imleç=${maxId}).`);
    }

    console.log(`✔ SE dump oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}
