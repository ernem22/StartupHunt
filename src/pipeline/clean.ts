// FAZ 5 — Cleaning + status worker
// new → (cleaning) → cleaned | discarded
// Kurallar (plan): boş içerik, çok kısa içerik, boilerplate spam → discarded.
// content_hash zaten DB'de; exact-dup tekil bırakılır (unique değil, bilinçli: FAZ 6 near-dup tamamlayacak).
import { withDb } from "../db.js";

const MIN_TEXT_LENGTH = 40; // title+text toplam karakter; kısa YouTube yorumları vs. zaten <20'de dil null
const SPAM_PATTERNS = [
  /^\s*(\[removed\]|\[deleted\])\s*$/i,
  /^\s*(http|https):\/\/\S+\s*$/, // sadece link, metin yok
  /\b(crypto giveaway|free bitcoin|casino bonus)\b/i,
];

export interface CleaningStats {
  scanned: number;
  cleaned: number;
  discarded: number;
  unchanged: number;
}

export async function runCleaning(batchSize = 1000): Promise<CleaningStats> {
  return withDb(async (c) => {
    const stats: CleaningStats = { scanned: 0, cleaned: 0, discarded: 0, unchanged: 0 };

    // batch loop — status='new' olanları al
    for (;;) {
      const rows = await c.query<{ id: number; title: string | null; text: string }>(
        `select id, title, text from observations
         where status = 'new'
         order by id
         limit $1`,
        [batchSize]
      );
      if (rows.rows.length === 0) break;

      const discardedIds: number[] = [];

      for (const r of rows.rows) {
        stats.scanned++;
        const title = (r.title ?? "").trim();
        const text = (r.text ?? "").trim();
        const combined = `${title}\n${text}`.trim();

        // 1) boş / çok kısa
        if (combined.length < MIN_TEXT_LENGTH) {
          discardedIds.push(r.id);
          continue;
        }
        // 2) spam / boilerplate
        if (SPAM_PATTERNS.some((p) => p.test(text) || p.test(title))) {
          discardedIds.push(r.id);
          continue;
        }
      }

      // discard'lar
      if (discardedIds.length > 0) {
        await c.query(`update observations set status = 'discarded' where id = any($1)`, [discardedIds]);
        stats.discarded += discardedIds.length;
      }

      // kalanlar cleaned'a (tek update, discard edilmeyenler)
      const kept = rows.rows.map((r) => r.id).filter((id) => !discardedIds.includes(id));
      if (kept.length > 0) {
        await c.query(`update observations set status = 'cleaned' where id = any($1)`, [kept]);
        stats.cleaned += kept.length;
      }

      if (rows.rows.length < batchSize) break;
    }

    return stats;
  });
}
