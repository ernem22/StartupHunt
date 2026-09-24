// Review server — pilot inceleme aracı (plan v3.2 PILOT/Sıra 2; FAZ 12'den bağımsız).
// `pnpm review` → localhost server; pattern kartları + [BU]/[junk]/[seen] → patterns.review_status.
// Deterministik temsil: centroid'e en yakın 5 + en yeni 3 (sabit kural).
// Değer eşlemesi: BU→interesting (FAZ 14 TR tetiği), junk→'junk' + status='archived' (görünürlük), seen→'seen'.
import http from "node:http";
import pg from "pg";
import { config } from "./config.js";

const PORT = 3001;
const pool = new pg.Pool({ connectionString: config.databaseUrl });

const VERDICTS = {
  bu: { reviewStatus: "interesting", label: "BU" },
  junk: { reviewStatus: "junk", label: "junk (gizle)" },
  seen: { reviewStatus: "seen", label: "gördüm" },
} as const;
type VerdictKey = keyof typeof VERDICTS;

function esc(s: unknown): string {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function day(d: Date | string | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "?";
}

// pattern_observations içinden: centroid'e en yakın 5 (halfvec <=> karşılaştırma)
// + en yeni 3 (5'te olmayanlar) → 8 temsili. Sabit kural, tekrar çalıştırılabilir.
const REP_SQL = `
  with near as (
    select po.observation_id, o.title, o.text, o.source, o.source_url, o.observed_at
    from pattern_observations po
    join observations o on o.id = po.observation_id
    join patterns pt on pt.id = po.pattern_id
    where po.pattern_id = $1 and pt.centroid is not null and o.embedding is not null
    order by o.embedding <=> pt.centroid
    limit 5
  ),
  newest as (
    select po.observation_id, o.title, o.text, o.source, o.source_url, o.observed_at
    from pattern_observations po
    join observations o on o.id = po.observation_id
    where po.pattern_id = $1
      and po.observation_id not in (select observation_id from near)
    order by o.observed_at desc nulls last
    limit 3
  )
  select observation_id, title, text, source, source_url, observed_at, false as is_newest from near
  union all
  select observation_id, title, text, source, source_url, observed_at, true as is_newest from newest`;

interface RepRow {
  observation_id: number;
  title: string | null;
  text: string;
  source: string;
  source_url: string;
  observed_at: Date | null;
  is_newest: boolean;
}

interface PatternRow {
  id: number;
  name: string | null;
  description: string | null;
  keywords: string[] | null;
  observation_count: number;
  first_seen: Date | null;
  last_seen: Date | null;
  review_status: string;
}

async function listPatterns(): Promise<PatternRow[]> {
  const r = await pool.query<PatternRow>(
    `select id, name, description, keywords, observation_count,
            first_seen, last_seen, review_status
     from patterns where status = 'active'
     order by observation_count desc, id asc`,
  );
  return r.rows;
}

async function repsFor(patternId: number): Promise<RepRow[]> {
  const seen = new Set<number>();
  const out: RepRow[] = [];
  for (const row of (await pool.query<RepRow>(REP_SQL, [patternId])).rows) {
    if (!seen.has(row.observation_id)) {
      seen.add(row.observation_id);
      out.push(row);
    }
  }
  return out.slice(0, 8);
}

async function cardFor(p: PatternRow): Promise<string> {
  const reps = await repsFor(p.id);
  const src = await pool.query<{ source: string; c: string }>(
    `select o.source, count(*)::int as c from pattern_observations po
     join observations o on o.id = po.observation_id
     where po.pattern_id = $1 group by o.source order by c desc`,
    [p.id],
  );
  const badge =
    p.review_status === "unreviewed"
      ? ""
      : ` <span class="badge ${esc(p.review_status)}">${esc(p.review_status)}${p.review_status === "interesting" ? " (BU)" : ""}</span>`;
  const obsHtml = reps
    .map(
      (r) =>
        `<div class="obs"><span class="meta">[${esc(r.source)} · ${day(r.observed_at)}${r.is_newest ? " · yeni" : ""}]</span> <a class="u" href="${esc(r.source_url)}">${esc(r.title || "(başlık yok)")}</a><br>${esc(r.text.slice(0, 400))}</div>`,
    )
    .join("\n");
  const srcHtml = src.rows.map((s) => `${esc(s.source)}:${s.c}`).join(" · ");
  const btns =
    p.review_status === "junk"
      ? `<em>junk — arşivde</em>`
      : Object.entries(VERDICTS)
          .map(
            ([k, v]) =>
              `<form method="post" action="/review" class="inline"><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="v" value="${k}"><button>${esc(v.label)}</button></form>`,
          )
          .join(" ");
  return `
  <details><summary><b>#${p.id}</b> ${esc(p.name ?? "(isimsiz)")}${badge}
    <span class="meta"> · ${p.observation_count} obs · ${srcHtml} · ${day(p.first_seen)}→${day(p.last_seen)}</span></summary>
    <p>${esc(p.description ?? "")}</p>
    <p class="kw">kw: ${esc((p.keywords ?? []).join(", "))}</p>
    ${obsHtml}
    <div class="acts">${btns}</div>
  </details>`;
}

function page(cards: string[], stats: string): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<title>StartupHunt — review</title><style>
body{font-family:sans-serif;max-width:860px;margin:1rem auto;padding:0 1rem;color:#222}
summary{cursor:pointer;padding:.5rem 0;border-bottom:1px solid #ddd}
.meta{color:#777;font-size:.85em}.kw{color:#067;font-size:.9em}
.obs{margin:.5rem 0;font-size:.9em;background:#f7f7f7;padding:.5rem;border-radius:6px}
.u{color:#036}.badge{padding:.1rem .4rem;border-radius:4px;font-size:.8em}
.badge.interesting{background:#dfd}.badge.junk{background:#fdd}.badge.seen{background:#ffd}
.acts{margin:.6rem 0}.inline{display:inline;margin-right:.5rem}
header{display:flex;justify-content:space-between;align-items:baseline}
</style></head><body>
<header><h1>Pattern inceleme</h1><span class="meta">${stats}</span></header>
${cards.join("\n")}</body></html>`;
}

async function loadStats(): Promise<string> {
  const r = await pool.query<{ review_status: string; c: string }>(
    `select review_status, count(*)::int as c from patterns where status='active'
     group by review_status`,
  );
  const map = new Map(r.rows.map((x) => [x.review_status, Number(x.c)]));
  const total = r.rows.reduce((a, x) => a + Number(x.c), 0);
  return `${total} pattern · BU=interesting:${map.get("interesting") ?? 0} · seen:${map.get("seen") ?? 0} · junk:${map.get("junk") ?? 0} · unreviewed:${map.get("unreviewed") ?? 0}`;
}

async function applyVerdict(id: number, v: VerdictKey): Promise<void> {
  const d = VERDICTS[v];
  await pool.query(
    `update patterns
     set review_status = $2,
         status = case
                    when $2 = 'junk' then 'archived'
                    when review_status = 'junk' and status = 'archived' then 'active'
                    else status
                  end,
         updated_at = now()
     where id = $1`,
    [id, d.reviewStatus],
  );
}

async function main(): Promise<void> {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/") {
        const patterns = await listPatterns();
        const cards: string[] = [];
        for (const p of patterns) cards.push(await cardFor(p));
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(page(cards, await loadStats()));
        return;
      }
      if (req.method === "POST" && req.url === "/review") {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const form = new URLSearchParams(Buffer.concat(chunks).toString());
        const id = Number(form.get("id"));
        const v = form.get("v") as VerdictKey | null;
        if (!Number.isFinite(id) || !v || !(v in VERDICTS)) {
          res.writeHead(400).end("geçersiz istek");
          return;
        }
        await applyVerdict(id, v);
        res.writeHead(303, { location: "/" });
        res.end();
        return;
      }
      res.writeHead(404).end("not found");
    } catch (e) {
      res.writeHead(500).end(`hata: ${e instanceof Error ? e.message : e}`);
    }
  });
  server.listen(PORT, () => console.log(`review server: http://localhost:${PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
