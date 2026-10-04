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
  review_note: string;
}

async function listPatterns(status: "active" | "archived" = "active"): Promise<PatternRow[]> {
  const r = await pool.query<PatternRow>(
    `select id, name, description, keywords, observation_count,
            first_seen, last_seen, review_status,
            coalesce(review_note, '') as review_note
     from patterns where status = $1
     order by observation_count desc, id asc`,
    [status],
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
        `<div class="obs${r.is_newest ? " hot" : ""}"><span class="src ${esc(r.source)}">${esc(r.source)}</span><span class="meta">${day(r.observed_at)}${r.is_newest ? `<span class="tagnew">yeni</span>` : ""}</span> <a class="u" href="${esc(r.source_url)}">${esc(r.title || "(başlık yok)")}</a><br>${esc(r.text.slice(0, 400))}</div>`,
    )
    .join("\n");
  const srcHtml = src.rows.map((s) => `${esc(s.source)}:${s.c}`).join(" · ");
  const noteHtml = p.review_note ? `<p class="note">not: ${esc(p.review_note)}</p>` : "";
  const noteForm = `<form method="post" action="/note" class="inline"><input type="hidden" name="id" value="${p.id}"><input name="note" value="${esc(p.review_note)}" size="38" placeholder="not: hangi cümle değerli?"><button>kaydet</button></form>`;
  // junk (arşivde) kartta yalnızca geri-al butonları: BU / gördüm (applyVerdict active'e çevirir)
  const allowed = Object.entries(VERDICTS).filter(([k]) => p.review_status !== "junk" || k !== "junk");
  const btns =
    (p.review_status === "junk" ? `<em>junk — arşivde · geri al:</em> ` : "") +
    allowed
      .map(
        ([k, v]) =>
          `<form method="post" action="/review" class="inline"><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="v" value="${k}"><button class="${k === "bu" ? "bu" : k === "junk" ? "junkb" : ""}">${esc(v.label)}</button></form>`,
      )
      .join(" ");
  return `
  <details id="p-${p.id}"><summary><b>#${p.id}</b> ${esc(p.name ?? "(isimsiz)")}${badge}<span class="pill">${p.observation_count} obs</span>
    <span class="meta">${srcHtml} · ${day(p.first_seen)}→${day(p.last_seen)}</span></summary>
    <p>${esc(p.description ?? "")}</p>
    <p class="kw">${(p.keywords ?? []).map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</p>
    ${noteHtml}
    ${noteForm}
    ${obsHtml}
    <div class="acts">${btns}</div>
  </details>`;
}

function page(cards: string[], stats: string, nav: string): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<title>StartupHunt — review</title><style>
:root{--bg:#eef1f4;--card:#fff;--ink:#1c2330;--mut:#68738a;--line:#e3e8ef;--acc:#0b5fff;--ok:#137a3f;--okbg:#e2f4e8;--bad:#b4232a;--badbg:#fdecec;--warn:#92600a;--warnbg:#fff4d6;--note:#7a5b00;--notebg:#fff8dd}
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-width:960px;margin:0 auto;padding:0 1.2rem 4rem;color:var(--ink);background:var(--bg);line-height:1.5}
summary{cursor:pointer;padding:.35rem 0;list-style:none}
summary::-webkit-details-marker{display:none}
summary b{font-size:1.02rem}
.meta{color:#68738a;font-size:.85em}
details{background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:.55rem 1rem;margin:.7rem 0;box-shadow:0 1px 2px rgba(16,24,40,.05)}
details[open]{box-shadow:0 4px 14px rgba(16,24,40,.1)}
.pill{display:inline-block;background:#e8edf5;border-radius:999px;padding:.05rem .6rem;font-size:.8em;color:#33415c;margin-left:.4rem}
.obs{margin:.55rem 0;font-size:.92em;background:#f6f8fb;padding:.6rem .8rem;border-radius:8px;border-left:3px solid #c3cfdf}
.obs.hot{border-left-color:#0b5fff}
.src{display:inline-block;font-size:.75em;font-weight:700;padding:.05rem .5rem;border-radius:4px;margin-right:.4rem}
.src.reddit{background:#ffede3;color:#b34a12}
.src.hackernews{background:#e8edf5;color:#33415c}
.u{color:#0b3d91;font-weight:600;text-decoration:none}
.badge{padding:.12rem .55rem;border-radius:999px;font-size:.78em;font-weight:700}
.badge.interesting{background:#e2f4e8;color:#137a3f}.badge.junk{background:#fdecec;color:#b4232a}.badge.seen{background:#fff4d6;color:#92600a}
.chip{display:inline-block;background:#eaf1ff;color:#173f7a;border-radius:999px;padding:.1rem .65rem;font-size:.82em;margin:.12rem .2rem .12rem 0}
.note{background:#fff8dd;border-left:3px solid #db0;padding:.4rem .7rem;font-size:.9em;border-radius:0 6px 6px 0;color:#7a5b00}
.acts{margin:.7rem 0;display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
input[name=note]{width:60%;min-width:220px;padding:.4rem .6rem;border:1px solid #e3e8ef;border-radius:8px}
button{cursor:pointer;padding:.42rem 1rem;border-radius:8px;border:1px solid #e3e8ef;background:#fff;font-weight:600;font-size:.88em}
button:hover{border-color:#1c2330}
button.bu{background:#137a3f;border-color:#137a3f;color:#fff}
button.junkb{background:#fff;border-color:#b4232a;color:#b4232a}
.tagnew{display:inline-block;background:#0b5fff;color:#fff;font-size:.72em;border-radius:4px;padding:.05rem .4rem;margin-left:.3rem}
header{position:sticky;top:0;background:rgba(238,241,244,.96);padding:.7rem 0 .6rem;border-bottom:2px solid #1c2330;z-index:10}
nav{font-size:.87em;margin-top:.35rem}nav a{margin-right:.55rem;color:#0b5fff;text-decoration:none;font-weight:600}
h1{font-size:1.3rem;margin:.1rem 0}h2{font-size:1.05rem;margin:2rem 0 .5rem;color:#68738a;text-transform:uppercase;letter-spacing:.04em}
</style></head><body>
<header><h1>Pattern inceleme</h1><span class="meta">${stats}</span><nav>${nav}</nav></header>
${cards.join("\n")}</body></html>`;
}

async function loadStats(): Promise<string> {
  const r = await pool.query<{ review_status: string; c: string }>(
    `select review_status, count(*)::int as c from patterns where status='active'
     group by review_status`,
  );
  const map = new Map(r.rows.map((x) => [x.review_status, Number(x.c)]));
  const total = r.rows.reduce((a, x) => a + Number(x.c), 0);
  const a = await pool.query<{ c: string }>(
    `select count(*)::int as c from patterns where status='archived'`,
  );
  const archived = Number(a.rows[0]?.c ?? 0);
  return `${total} aktif (+${archived} arşiv) · BU:${map.get("interesting") ?? 0} · seen:${map.get("seen") ?? 0} · junk(arşivde):${archived} · unreviewed:${map.get("unreviewed") ?? 0}`;
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
  await pool.query(`alter table patterns add column if not exists review_note text not null default ''`);
  const server = http.createServer(async (req, res) => {
    try {
      if ((req.method === "GET" && req.url === "/") || (req.method === "GET" && req.url?.startsWith("/?"))) {
        const q = new URL(req.url ?? "/", "http://localhost").searchParams;
        const f = q.get("f") ?? "all";
        const sort = q.get("sort") ?? "size";
        const filters = ["all", "unreviewed", "interesting", "seen", "junk"] as const;
        const filter = (filters as readonly string[]).includes(f) ? f : "all";
        const sorts = ["size", "id", "new"] as const;
        const sortKey = (sorts as readonly string[]).includes(sort) ? sort : "size";

        const allActive = await listPatterns("active");
        const done = allActive.filter((p) => p.review_status !== "unreviewed").length;
        const pct = allActive.length > 0 ? Math.round((done * 100) / allActive.length) : 0;
        const next = allActive.find((p) => p.review_status === "unreviewed");

        let shown = filter === "all" ? allActive : allActive.filter((p) => p.review_status === filter);
        shown = [...shown].sort((a, b) =>
          sortKey === "id"
            ? a.id - b.id
            : sortKey === "new"
              ? (b.last_seen?.getTime() ?? 0) - (a.last_seen?.getTime() ?? 0) || a.id - b.id
              : b.observation_count - a.observation_count || a.id - b.id,
        );
        const cards: string[] = [];
        for (const p of shown) cards.push(await cardFor(p));
        const archived = filter === "all" ? await listPatterns("archived") : [];
        if (archived.length > 0) {
          cards.push(`<h2>Arşiv (junk) — ${archived.length}</h2>`);
          for (const p of archived) cards.push(await cardFor(p));
        }
        const link = (label: string, ff: string, ss: string) =>
          `<a href="/?f=${ff}&sort=${ss}">${label}</a>`;
        const nav =
          `ilerleme: ${done}/${allActive.length} (%${pct})` +
          (next ? ` · sıradaki: <a href="#p-${next.id}">#${next.id}</a>` : ` · bitti`) +
          ` · süz: ${link("tümü", "all", sortKey)} ${link("incelenmemiş", "unreviewed", sortKey)} ${link("BU", "interesting", sortKey)} ${link("gördüm", "seen", sortKey)}` +
          ` · diz: ${link("boyut", filter, "size")} ${link("id", filter, "id")} ${link("yeni", filter, "new")}`;
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(page(cards, `${await loadStats()} · gösterilen:${shown.length}`, nav));
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
        // junk kartı arşive taşır — aynı çapaya dönmek sayfayı dibe atar;
        // onun yerine sıradaki incelenmemiş karta git (akış korunur)
        let anchor = `/#p-${id}`;
        if (v === "junk") {
          const nx = await pool.query<{ id: number }>(
            `select id from patterns where status = 'active' and review_status = 'unreviewed'
             order by observation_count desc, id asc limit 1`,
          );
          anchor = nx.rows[0] ? `/#p-${nx.rows[0].id}` : "/";
        }
        res.writeHead(303, { location: anchor });
        res.end();
        return;
      }
      if (req.method === "POST" && req.url === "/note") {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const form = new URLSearchParams(Buffer.concat(chunks).toString());
        const id = Number(form.get("id"));
        const note = (form.get("note") ?? "").slice(0, 500);
        if (!Number.isFinite(id)) {
          res.writeHead(400).end("geçersiz istek");
          return;
        }
        await pool.query(`update patterns set review_note = $2, updated_at = now() where id = $1`, [
          id,
          note,
        ]);
        res.writeHead(303, { location: `/#p-${id}` });
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
