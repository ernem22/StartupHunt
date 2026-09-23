// DB erişim katmanı — idempotent upsert'ler (plan v3.1 FAZ 3/4)
import pg from "pg";
import type { NormalizedObservation, RawObservation } from "./types.js";
import { config } from "./config.js";
import { detectLanguage } from "./language.js";

const pool = new pg.Pool({ connectionString: config.databaseUrl });

export async function withDb<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/** Ham veriyi değiştirmeden sakla — unique (source, source_id) upsert. */
export async function upsertRaw(
  obs: RawObservation,
  collectedAt: Date = new Date()
): Promise<"inserted" | "unchanged"> {
  return withDb(async (c) => {
    const r = await c.query(
      `insert into raw_observations (source, source_id, raw_data, collected_at)
       values ($1, $2, $3, $4)
       on conflict (source, source_id) do nothing
       returning id`,
      [obs.source, obs.sourceId, JSON.stringify(obs.rawData), collectedAt]
    );
    return r.rowCount && r.rowCount > 0 ? "inserted" : "unchanged";
  });
}

/** Normalized observation — status='new' olarak girer, pipeline ilerletir.
 *  language: adapter null verdiyse burada tespit edilir (plan FAZ 4: toplama anında). */
export async function upsertNormalized(
  o: NormalizedObservation & { contentHash: string | null }
): Promise<"inserted" | "unchanged"> {
  const language = o.language ?? detectLanguage(o.title, o.text);
  return withDb(async (c) => {
    const r = await c.query(
      `insert into observations
         (source, source_id, source_url, title, text, author, observed_at,
          collected_at, language, metadata, content_hash, status)
       values ($1,$2,$3,$4,$5,$6,$7, now(), $8, $9, $10, 'new')
       on conflict (source, source_id) do nothing
       returning id`,
      [
        o.source,
        o.sourceId,
        o.sourceUrl,
        o.title,
        o.text,
        o.author,
        o.observedAt,
        language,
        JSON.stringify(o.metadata ?? {}),
        o.contentHash,
      ]
    );
    return r.rowCount !== null && r.rowCount > 0 ? "inserted" : "unchanged";
  });
}

/** content_hash — exact-match dedup (plan FAZ 5). */
export function contentHash(o: NormalizedObservation): string {
  const normalized = `${(o.title ?? "").toLowerCase().trim()}\n${o.text.toLowerCase().trim()}`;
  // basit FNV-1a — deneysel pilot için yeterli; SHA-256 gerekirse sonradan
  let h = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export async function closeDb(): Promise<void> {
  await pool.end();
}

/** Adapter imleci — catch-up semantiği (plan v3.1 FAZ 13). */
export async function loadAdapterState<T>(name: string): Promise<T | null> {
  return withDb(async (c) => {
    const r = await c.query<{ last_cursor: T | null }>(
      `select last_cursor from adapter_state where name = $1`,
      [name]
    );
    return r.rows[0]?.last_cursor ?? null;
  });
}

export async function saveAdapterState(name: string, cursor: unknown, counters: unknown): Promise<void> {
  await withDb(async (c) => {
    await c.query(
      `insert into adapter_state (name, last_run_at, last_success_at, last_cursor, counters)
       values ($1, now(), now(), $2, $3)
       on conflict (name)
       do update set last_run_at = now(), last_success_at = now(),
                     last_cursor = $2, counters = $3`,
      [name, JSON.stringify(cursor ?? {}), JSON.stringify(counters ?? {})]
    );
  });
}
