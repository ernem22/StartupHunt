// SeArchiveAdapter — Stack Exchange Data Dump backfill (plan v3.2 FAZ 1: SE backfill).
// Kaynak: https://archive.org/download/stackexchange/<site>.7z — üç aylık snapshot, Posts.xml.
// Kapsam (deterministik): PostTypeId=1 (soru) + Title zorunlu; cevaplar v0.1'de YOK (sorular
// pain-point taşır; cevaplar "çözüm" katmanı — pilot sonrası genişletilebilir).
// Akış: 7z indir (yoksa) → `7z x -so Posts.xml` stream → satır satır <row/> parse → upsert.
// İmleç: site başına son işlenen Id (dump snapshot olduğu için re-parse idempotent upsert ile güvenli).
// Gereksinim: 7-Zip binary (SEVEN_ZIP_BIN env, varsayılan "C:\\Program Files\\7-Zip\\7z.exe").
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
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

/** HTML etiketlerini söker; entity'ler parseRow'da önceden çözülmüş olur. */
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** XML attribute entity'lerini çözer: &#xA; &#39; &quot; &amp; &lt; &gt; &apos; */
function decodeXml(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Tek <row .../> bloğunu attribute map'ine çevirir (değerler decode'lu).
 *  XML'de backslash kaçışı yoktur — değer bir sonraki literal tırnakta biter. */
function parseRow(line: string): Record<string, string> | null {
  if (!line.includes("<row ")) return null;
  const attrs: Record<string, string> = {};
  const re = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) attrs[m[1]!] = decodeXml(m[2]!);
  return attrs.Id ? attrs : null;
}

/** SE soru satırını normalize observation'a çevirir (PostTypeId=1 + Title zorunlu). */
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

/** Site dump'unu indirir (yoksa); yarım indirme .part dosyasında kalır, rename atomiktir. */
async function ensureDump(site: string): Promise<string> {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${site}.7z`);
  if (fs.existsSync(file)) {
    console.log(`  ${site}.7z mevcut (${(fs.statSync(file).size / 1e6).toFixed(1)} MB)`);
    return file;
  }
  console.log(`▼ ${site}.7z indiriliyor...`);
  // benzersiz temp adı: aynı dizinde çakışan/ölü .part'lar birbirini ezmesin
  const part = `${file}.${process.pid}.part`;
  try {
    const res = await fetch(`${DUMP_BASE}/${site}.7z`, { signal: AbortSignal.timeout(600_000) });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const ws = fs.createWriteStream(part);
    // pipeline: fetch-abort/yazma hatalarını yayar, iki akışı da kapatır
    await pipeline(Readable.fromWeb(res.body as never), ws);
    if (fs.existsSync(file)) {
      // yarış: bu arada geçerli dosya belirdiyse üzerine yazma, temp'i at
      fs.unlinkSync(part);
    } else {
      fs.renameSync(part, file); // atomik: yarım dosya asla geçerli sayılmaz
    }
  } catch (e) {
    if (fs.existsSync(part)) fs.unlinkSync(part);
    throw e;
  }
  return file;
}

export class SeArchiveAdapter implements Adapter {
  name = "searchive";

  /** SE dump backfill koşusu: site → Posts.xml stream → soru obs'leri + site imleci. */
  async collect(since: Date | null, opts: CollectOptions): Promise<void> {
    const store = makeStateStore<SeCursor>(opts.dryRun, () => ({ lastId: {} }));
    const cursor = await store.load();
    // since = catch-up sınırı (Adapter kontratı): verilen tarihten öncesi atlanır;
    // config/test tabanıyla birleşir — büyük olan kazanır
    const baseMinStr = process.env.SE_MIN_DATE;
    if (baseMinStr && Number.isNaN(Date.parse(baseMinStr))) {
      throw new Error(`SE_MIN_DATE geçersiz tarih: ${baseMinStr}`);
    }
    const baseMin = baseMinStr ? new Date(baseMinStr) : BACKFILL_SINCE;
    const minDate = since && since > baseMin ? since : baseMin;
    let processed = 0;

    for (const site of SITES) {
      const file = await ensureDump(site);
      const seenFrom = cursor.lastId[site] ?? 0;
      console.log(`▶ ${site} — Posts.xml stream (lastId>${seenFrom})`);

      const seven = spawn(SEVEN_ZIP, ["x", "-so", "-bd", file, "Posts.xml"], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      // 7z hatası sessiz geçilemez: nonzero exit / spawn error → site atlanır, imleç İLERLEMEZ
      const sevenDone = new Promise<void>((ok, bad) => {
        seven.on("error", (e) => bad(e));
        seven.on("close", (code, signal) => {
          if (code !== 0 && signal !== "SIGTERM" && signal !== "SIGKILL") {
            bad(new Error(`7z exit=${code}`));
          } else ok();
        });
      });
      const rl = createInterface({ input: seven.stdout!, crlfDelay: Infinity });
      let maxId = seenFrom;
      let rows = 0;
      // Posts.xml: Body içindeki newline'lar satırı böler — "/>" görene kadar biriktir
      // (ayraç korunur: birleşen satırlar arası kelime yapışmasın)
      let buf = "";
      try {
        for await (const line of rl) {
          buf += `${line}\n`;
          if (!buf.includes("/>")) continue;
          const row = buf;
          buf = "";
          const a = parseRow(row);
          if (!a) continue;
          const id = Number(a["Id"]);
          if (id <= seenFrom) continue; // snapshot re-parse: idempotent, hızlı geç
          rows++;
          const norm = toNormalized(site, a);
          // soru-değil / tarih-dışı satırlar da imleci ilerletir (tekrar parse edilmez)
          if (id > maxId) maxId = id;
          if (!norm) continue;
          if (norm.observedAt && norm.observedAt < minDate) continue;
          if (opts.limit !== undefined && processed >= opts.limit) {
            // limit: BU soru işlenmedi → imleç bu sorunun ÖNCESİNDE kalır (kayıp yok)
            const resumeFrom = maxId > id ? maxId : id - 1;
            console.log(`oturum limiti (${opts.limit}) doldu — imleç ${site}:${resumeFrom}'de kaldı`);
            cursor.lastId[site] = resumeFrom;
            await store.save(cursor);
            seven.kill();
            return;
          }
          if (!opts.dryRun) {
            try {
              await upsertRaw({ source: "stackexchange", sourceId: norm.sourceId, rawData: a });
              try {
                await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
              } catch (err) {
                if (!(err as Error).message.includes("duplicate key")) throw err;
              }
            } catch (err) {
              // satır-hatası: child leak olmasın — öldür, kapanışı bekle, sonra fırlat
              // (imleç ilerlemez; sonraki koşum kaldığı yerden — catch-up)
              seven.kill();
              try {
                await sevenDone;
              } catch {
                /* kapanış hatası zaten loglandı */
              } finally {
                rl.close();
              }
              throw err;
            }
          }
          processed++;
          opts.onProgress?.({ processed, totalFetched: processed });
        }
      } finally {
        rl.close();
      }

      await sevenDone; // nonzero → throw: imleç ilerlemez, site sonraki koşumda tekrar
      cursor.lastId[site] = maxId;
      await store.save(cursor);
      console.log(`  ${site} tamam (satır=${rows}, obs=${processed} toplam, imleç=${maxId}).`);
    }

    console.log(`✔ SE dump oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}
