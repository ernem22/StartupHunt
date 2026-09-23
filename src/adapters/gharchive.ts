// GhArchiveAdapter — GH Archive saatlik event dump (plan v3.2 FAZ 1: GitHub backfill+gap-fill).
// Kaynak: https://data.gharchive.org/{YYYY-MM-DD}-{H}.json.gz — 2011+ tüm public event'ler.
// Kapsam (deterministik, keyword'süz): IssuesEvent(action=opened) = şikâyet/gap akışı,
// CreateEvent(ref_type=repository) = launch sinyali. Push/Watch/fork vb. metin yok → obs değil.
// raw_observations'a event ham haliyle; BACKFILL_SINCE (18 ay) + saatlik imleç catch-up.
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";
import { createInterface } from "node:readline";
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash, loadAdapterState, saveAdapterState } from "../db.js";
import { BACKFILL_SINCE } from "../config.js";

/** Dry-run'da DB yok — bellek içi state (aynı desen: hackernews). */
function makeStateStore<T>(dryRun: boolean, initial: () => T) {
  let mem: T | null = null;
  return {
    async load(): Promise<T> {
      if (dryRun) return (mem ??= initial());
      return (await loadAdapterState<T>("gharchive")) ?? initial();
    },
    async save(v: T): Promise<void> {
      if (dryRun) {
        mem = v;
        return;
      }
      await saveAdapterState("gharchive", v, {});
    },
  };
}

/** İmleç: son işlenen saat "YYYY-MM-DDTHH" (catch-up anahtarı). */
interface GhaCursor {
  lastHour: string;
  doneBackfill: boolean;
}

type GhEvent = {
  id: string | number;
  type: string;
  created_at: string;
  actor?: { login?: string };
  repo?: { name?: string };
  payload?: {
    action?: string;
    ref_type?: string;
    description?: string | null;
    issue?: { title?: string | null; body?: string | null; html_url?: string | null };
  };
};

const BASE = "https://data.gharchive.org";
const HOUR_DELAY_MS = 1000; // arşive nazik ol — saat başı dosya

/** "YYYY-MM-DDTHH" string. BACKFILL_SINCE'in ilk saati initial imleçtir. */
function formatHour(d: Date): string {
  return d.toISOString().slice(0, 13);
}
function nextHour(hour: string): string {
  const d = new Date(`${hour}:00:00.000Z`);
  d.setUTCHours(d.getUTCHours() + 1);
  return formatHour(d);
}

function isIssueOpened(e: GhEvent): boolean {
  return e.type === "IssuesEvent" && e.payload?.action === "opened";
}
function isRepoCreate(e: GhEvent): boolean {
  return e.type === "CreateEvent" && e.payload?.ref_type === "repository";
}

function toNormalized(e: GhEvent): NormalizedObservation | null {
  const repo = e.repo?.name ?? "";
  const author = e.actor?.login ?? null;

  if (isIssueOpened(e)) {
    const title = e.payload?.issue?.title ?? null;
    const body = e.payload?.issue?.body ?? "";
    const text = `${title ?? ""}\n\n${body ?? ""}`.trim() || title?.trim() || "";
    if (!text) return null;
    return {
      source: "github",
      sourceId: String(e.id),
      sourceUrl: e.payload?.issue?.html_url ?? `https://github.com/${repo}`,
      title,
      text,
      author,
      observedAt: new Date(e.created_at),
      language: null,
      metadata: { kind: "issue_opened", repo },
    };
  }

  if (isRepoCreate(e)) {
    const desc = e.payload?.description ?? "";
    const title = repo || null;
    const text = desc.trim() || repo;
    if (!text) return null;
    return {
      source: "github",
      sourceId: `create:${e.id}`,
      sourceUrl: `https://github.com/${repo}`,
      title,
      text,
      author,
      observedAt: new Date(e.created_at),
      language: null,
      metadata: { kind: "repo_launch", repo },
    };
  }

  return null;
}

export class GhArchiveAdapter implements Adapter {
  name = "gharchive";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    const store = makeStateStore<GhaCursor>(opts.dryRun, () => ({
      lastHour: formatHour(BACKFILL_SINCE),
      doneBackfill: false,
    }));
    const cursor: GhaCursor = await store.load();

    // işlenmemiş ilk saatten şimdiye; imleç = son işlenen saat
    let currentHour = nextHour(cursor.lastHour);
    const nowHour = formatHour(new Date());
    let processed = 0;
    let hoursThisRun = 0;

    while (currentHour < nowHour) {
      if (opts.limit !== undefined && processed >= opts.limit) {
        console.log(`oturum limiti (${opts.limit}) doldu — imleç: ${cursor.lastHour}`);
        await store.save(cursor);
        return;
      }
      if (hoursThisRun >= 24) {
        console.log(`24 saat/dosya oturum tavanı — imleç: ${cursor.lastHour}`);
        await store.save(cursor);
        return;
      }

      const path = `${currentHour.slice(0, 4)}-${currentHour.slice(5, 7)}-${currentHour.slice(8, 10)}-${currentHour.slice(11, 13)}.json.gz`;
      console.log(`▼ ${path}`);
      let limitHit = false; // dosya ortasında limit doldu → imleç İLERLEMEZ (kalan satırlar sonraki koşumda)
      try {
        const res = await fetch(`${BASE}/${path}`, { signal: AbortSignal.timeout(300_000) });
        if (res.status === 404) {
          console.warn(`  [atlandı] ${path} yok (404)`);
          cursor.lastHour = currentHour;
          currentHour = nextHour(currentHour);
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // streaming parse — dosya ~139MB; tamamı gerekmiyor, line limitsiz akar
        let lineCount = 0;
        const nodeStream = Readable.fromWeb(
          res.body as unknown as import("node:stream/web").ReadableStream,
        ).pipe(createGunzip());
        nodeStream.on("error", (err) => console.warn(`  [stream hata] ${(err as Error).message}`));
        const rl = createInterface({ input: nodeStream, crlfDelay: Infinity });
        for await (const line of rl) {
          lineCount++;
          if (opts.limit !== undefined && processed >= opts.limit) {
            limitHit = true;
            break;
          }
          let ev: GhEvent;
          try {
            ev = JSON.parse(line) as GhEvent;
          } catch {
            continue; // bozuk satır — atla
          }
          const norm = toNormalized(ev);
          if (!norm) continue;
          if (!opts.dryRun) {
            await upsertRaw({ source: "github", sourceId: norm.sourceId, rawData: ev });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
          }
          processed++;
          opts.onProgress?.({ processed, totalFetched: processed });
        }
        rl.close();
        nodeStream.destroy();
        console.log(`  ${lineCount} satır okundu${limitHit ? " — limit doldu, dosya terk edildi" : ""}`);
      } catch (e) {
        console.warn(`  [hata] ${path} atlandı: ${(e as Error).message}`);
        // imleç kaydırmadan geç — sonraki koşumda tekrar dener (catch-up)
      }

      if (limitHit) {
        console.log(`dosya ortasında limit — imleç ${cursor.lastHour}'de kaldı (kalan: sonraki koşum)`);
        await store.save(cursor);
        return;
      }
      cursor.lastHour = currentHour;
      currentHour = nextHour(currentHour);
      hoursThisRun++;
      await sleep(HOUR_DELAY_MS);
    }

    await store.save(cursor);
    console.log(
      `✔ GH Archive oturumu bitti. hours=${hoursThisRun} processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`,
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
