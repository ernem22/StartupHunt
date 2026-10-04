// Deney karşılaştırma — `pnpm experiment:compare [-- --samples N]`
// Salt-okunur: skor üretmez, sayım + denetim listeleri döker (plan v3.3 §13-14).
import pg from "pg";
import { config } from "../config.js";

const pool = new pg.Pool({ connectionString: config.databaseUrl });

interface RunRow {
  id: number;
  name: string;
  type: string;
  model: string | null;
  status: string;
  snapshot_n: number;
}

async function runs(): Promise<RunRow[]> {
  const r = await pool.query<RunRow>(
    `select id, name, type, model, status,
            coalesce(jsonb_array_length(snapshot->'ids'), 0) as snapshot_n
     from experiment_runs order by id`,
  );
  return r.rows;
}

async function block(run: RunRow): Promise<string> {
  const q = async (sql: string) =>
    (await pool.query<{ c: string }>(sql, [run.id])).rows[0]?.c ?? "0";
  const keep = Number(await q(
    `select count(*) as c from preprocessing_results where experiment_id=$1 and decision='keep'`));
  const rej = Number(await q(
    `select count(*) as c from preprocessing_results where experiment_id=$1 and decision='reject'`));
  const err = Number(await q(
    `select count(*) as c from preprocessing_results where experiment_id=$1 and decision='processing_error'`));
  const pat = await pool.query<{ n: string; avg: string }>(
    `select count(*) as n, coalesce(round(avg(observation_count)),0) as avg
     from experiment_patterns where experiment_id=$1`,
    [run.id],
  );
  const members = Number(
    (await pool.query<{ c: string }>(
      `select count(distinct observation_id) as c from experiment_pattern_observations where experiment_id=$1`,
      [run.id],
    )).rows[0]?.c ?? "0",
  );
  const base = run.type === "baseline" ? run.snapshot_n : keep;
  const noise = base - members;
  const lines = [
    `Experiment ${run.name} [${run.type}${run.model ? ` / ${run.model}` : ""}] (${run.status})`,
    `  snapshot: ${run.snapshot_n} | tutulan: ${run.type === "baseline" ? run.snapshot_n : keep} | elenen: ${run.type === "baseline" ? 0 : rej} | hata: ${err}`,
    `  cluster: ${pat.rows[0]?.n} | noise: ${noise} | ort. uye: ${pat.rows[0]?.avg}`,
  ];
  return lines.join("\n");
}

async function disagreement(): Promise<string> {
  const b = await expId("llm-filter-v1");
  const c = await expId("laya-filter-v1");
  if (b === null || c === null) return "karsilastirma icin B ve C run gerekli";
  const r = await pool.query<{
    b_keep: string; c_keep: string; both_keep: string; both_rej: string; n: string;
  }>(
    `select sum((b.decision='keep')::int) as b_keep, sum((cc.decision='keep')::int) as c_keep,
            sum(((b.decision='keep') and (cc.decision='keep'))::int) as both_keep,
            sum(((b.decision='reject') and (cc.decision='reject'))::int) as both_rej,
            count(*) as n
     from preprocessing_results b join preprocessing_results cc
       on cc.observation_id = b.observation_id
     where b.experiment_id=$1 and cc.experiment_id=$2`,
    [b, c],
  );
  const x = r.rows[0]!;
  const agree = Number(x.both_keep) + Number(x.both_rej);
  return [
    `Anlasma B/C: ikisi-tutar ${x.both_keep} | ikisi-eler ${x.both_rej} | anlasma ${agree}/${x.n}`,
    `  B-only tutar: ${Number(x.b_keep) - Number(x.both_keep)} | C-only tutar: ${Number(x.c_keep) - Number(x.both_keep)}`,
  ].join("\n");
}

async function expId(name: string): Promise<number | null> {
  const r = await pool.query<{ id: number }>(`select id from experiment_runs where name=$1`, [name]);
  return r.rows[0]?.id ?? null;
}

async function samples(n: number): Promise<string> {
  const b = await expId("llm-filter-v1");
  const c = await expId("laya-filter-v1");
  if (b === null || c === null) return "B/C run yok";
  const q = async (cond: string) =>
    (
      await pool.query<{ t: string }>(
        `select left(o.title, 75) as t from observations o
         join preprocessing_results b on b.observation_id=o.id and b.experiment_id=$1
         join preprocessing_results c on c.observation_id=o.id and c.experiment_id=$2
         where ${cond} order by random() limit $3`,
        [b, c, n],
      )
    ).rows.map((r, i) => `${i + 1}. ${r.t}`);
  const out = ["-- B eledi / C tuttu --", ...(await q("b.decision='reject' and c.decision='keep'"))];
  out.push("-- C eledi / B tuttu --", ...(await q("b.decision='keep' and c.decision='reject'")));
  return out.join("\n");
}

async function main() {
  const ai = process.argv.indexOf("--samples");
  const n = ai >= 0 ? Number(process.argv[ai + 1] ?? 15) : 15;
  for (const run of await runs()) console.log(await block(run));
  console.log(await disagreement());
  console.log(await samples(Number.isFinite(n) ? n : 15));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
