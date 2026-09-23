// FAZ 6 — Embedding client (TEI + Qwen3-Embedding-0.6B, plan v3.1)
// cleaned → embedding (halfvec 1024) → status='embedded'
// Temsil metni: title + text (tek vektör kararı — plan FAZ 6).
// TEI endpoint: POST /embed {"inputs": [...]} — batch 256.
import pg from "pg";
import { config } from "../config.js";

const TEI_URL = process.env.TEI_URL ?? "http://localhost:8080";
const BATCH = 64; // TEI max-client-batch 256; DB okuma yazma dengesi için 64
const EXPECTED_DIM = 1024; // Qwen3-0.6B — halfvec(1024) şema uyumu kontrolü

/** Temsil metni — plan v3.1 FAZ 6: kırpma yok, context 32k zaten bol.
 *  Yine de aşırı uzun issue gövdelerinde token israfını sınırla (güvenlik). */
function represent(title: string | null, text: string): string {
  const t = (title ?? "").trim();
  const b = text.trim();
  return t && b ? `${t}\n\n${b}` : (t || b);
}

export interface EmbeddingStats {
  embedded: number;
  failed: number;
  dimensionCheck: boolean;
}

async function teiEmbed(inputs: string[]): Promise<number[][] | null> {
  try {
    const res = await fetch(`${TEI_URL}/embed`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inputs }),
    });
    if (!res.ok) {
      console.warn(`  [tei] HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as number[][];
  } catch (e) {
    console.warn(`  [tei] ${(e as Error).message}`);
    return null;
  }
}

export async function runEmbedding(pool: pg.Pool, batchSize = BATCH): Promise<EmbeddingStats> {
  const stats: EmbeddingStats = { embedded: 0, failed: 0, dimensionCheck: false };

  for (;;) {
    const rows = await pool.query<{ id: number; title: string | null; text: string }>(
      `select id, title, text from observations
       where status = 'cleaned' and embedding is null
       order by id
       limit $1`,
      [batchSize]
    );
    if (rows.rows.length === 0) break;

    const inputs = rows.rows.map((r) => represent(r.title, r.text));
    const vecs = await teiEmbed(inputs);
    if (!vecs) {
      // TEI down — kalan batch'leri boşa dönme; tekrar denenecek (status hâlâ 'cleaned')
      console.warn("  [tei] endpoint yanıt vermiyor; embedding oturumu durdu — sonra tekrar çalıştır");
      break;
    }
    if (vecs.length !== rows.rows.length) {
      console.warn(`  [tei] boyut uyumsuz: ${vecs.length}/${rows.rows.length}; batch atlandı`);
      stats.failed += rows.rows.length;
      break;
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      for (let i = 0; i < rows.rows.length; i++) {
        const v = vecs[i]!;
        if (!stats.dimensionCheck) {
          if (v.length !== EXPECTED_DIM) {
            throw new Error(`vektör boyutu ${v.length} ≠ ${EXPECTED_DIM} — model/şema uyumsuzluğu`);
          }
          stats.dimensionCheck = true;
        }
        // halfvec: [0.1,0.2,...] string gösterimi
        await client.query(
          `update observations
             set embedding = $1::halfvec, status = 'embedded'
           where id = $2`,
          [`[${v.join(",")}]`, rows.rows[i]!.id]
        );
        stats.embedded++;
      }
      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  }
  return stats;
}
