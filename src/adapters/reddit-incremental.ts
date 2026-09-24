// DURUM (plan v3.2): BU adapter SCRAPER TABANLIOLDUĞU İÇİN KULLANIMDA DEĞİL — v3.2 kararında
// reddit-universal-scraper iptal edildi; canlı uç = RedditLiveAdapter (resmî OAuth API),
// pilot sonrası yazılacak. Bu dosya referans/basitCSV yolu olarak tutuluyor; orchestrator
// "collect all" akışına dahil etme.
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash } from "../db.js";

/** Scraper CSV satırı — extract_post_data() alanları (repo, async_scraper.py). */
interface ScraperPostRow {
  id: string;
  title: string;
  author: string;
  created_utc: string; // ISO
  permalink: string;
  url: string;
  score: string;
  upvote_ratio: string;
  num_comments: string;
  num_crossposts: string;
  selftext: string;
  post_type: string; // text|image|video|gallery|link
  is_nsfw: string;   // True/False
  is_spoiler: string;
  flair: string;
  total_awards: string;
  has_media: string;
  media_downloaded: string;
  source: string; // "Async-Scraper"
}

/** İşlenen CSV dosyalarının imleç kaydı — data/.processed.json */
interface ProcessedState {
  // dosya → son işlenen satır sayısı + mtime (dosya büyüdüyse sadece yeni satırlar)
  [file: string]: { rows: number; size: number };
}

const DATA_DIR = process.env.REDDIT_SCRAPER_DATA_DIR ?? "data";
const STATE_FILE = path.join(DATA_DIR, ".processed.json");

function loadState(): ProcessedState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) as ProcessedState;
  } catch {
    return {};
  }
}

function saveState(s: ProcessedState): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function toNormalized(row: ScraperPostRow): NormalizedObservation {
  const selftext = (row.selftext ?? "").trim();
  return {
    source: "reddit",
    sourceId: row.id,
    sourceUrl: `https://www.reddit.com${row.permalink}`,
    title: row.title ?? null,
    text: selftext.length > 0 ? selftext : (row.title ?? ""),
    author: row.author ?? null,
    observedAt: row.created_utc ? new Date(row.created_utc) : null,
    language: null,
    metadata: {
      subreddit: row.permalink.split("/")[2], // /r/<sub>/comments/...
      score: Number(row.score) || 0,
      num_comments: Number(row.num_comments) || 0,
      upvote_ratio: Number(row.upvote_ratio) || null,
      flair: row.flair || null,
      post_type: row.post_type,
      nsfw: row.is_nsfw === "True",
      incremental: true,
    },
  };
}

function readNewRows(file: string, state: ProcessedState): ScraperPostRow[] {
  const content = fs.readFileSync(file, "utf-8");
  const records = parse(content, { columns: true, skip_empty_lines: true }) as ScraperPostRow[];
  const prev = state[file];
  if (prev) {
    // dosya sadece append edilir (scraper to_csv mode='a') → eski satırlar sabit
    return records.slice(prev.rows);
  }
  return records;
}

export class RedditIncrementalAdapter implements Adapter {
  name = "reddit-incremental";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    // since: scraper kendi monitor loop'unda çalıştığı için yok sayılır;
    // catch-up Arctic Shift backfill adapter'ının görevidir.
    const state = loadState();
    const files = fs
      .readdirSync(DATA_DIR, { recursive: true, withFileTypes: false } as never)
      .map((f) => String(f))
      .filter((f) => f.includes(path.sep) && f.endsWith("posts.csv"));
    // Not: recursive readdir burada data/r_<sub>/posts.csv desenini yakalar.

    let processed = 0;
    for (const rel of files) {
      const file = path.join(DATA_DIR, rel);
      const rows = readNewRows(file, state);
      const prevRows = state[file]?.rows ?? 0;

      for (const row of rows) {
        if (!row.id || (!row.title && !row.selftext)) continue;
        if (opts.limit !== undefined && processed >= opts.limit) {
          console.log(`oturum limiti (${opts.limit}) doldu — dosya yarıda: ${rel}`);
          // dry-run state KAYDETMEMEZ — işlenmemiş satırlar sonraki gerçek koşumda (CodeRabbit)
          if (!opts.dryRun) saveState(state);
          return;
        }

        const norm = toNormalized(row);
        if (!opts.dryRun) {
          await upsertRaw({ source: "reddit", sourceId: row.id, rawData: row });
          try {
            await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
          } catch (err) {
            if (!(err as Error).message.includes("duplicate key")) throw err;
          }
        }
        processed++;
        opts.onProgress?.({ processed, totalFetched: processed });
      }

      state[file] = { rows: prevRows + rows.length, size: fs.statSync(file).size };
      console.log(`  ${rel}: +${rows.length} satır işlendi`);
    }

    if (!opts.dryRun) saveState(state);
    console.log(`✔ incremental oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}
