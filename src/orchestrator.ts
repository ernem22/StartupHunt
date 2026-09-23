// Orchestrator — günlük koşum çalıştırıcısı (plan v3.2 FAZ 13 Çalıştırma modeli).
// Sabit sıra: compose up → sağlık → collect all → clean → embed → assign →
// recluster (tetik: atanmamış embedded oran eşiği + güvenlik ağı) → counterpart kuyruğu.
// Her adım idempotent; çöken adım loglanır ve SIRADAKİ adıma devam eder (catch-up ilkesi).
// 3060 PC'de koşar (Docker + GPU gerekli); tetik: Task Scheduler logon.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { config } from "./config.js";

const runcmd = promisify(execFile);

const RECLUSTER_UNASSIGNED_RATIO = Number(process.env.RECLUSTER_UNASSIGNED_RATIO ?? "0.05");
const RECLUSTER_MAX_GAP_DAYS = Number(process.env.RECLUSTER_MAX_GAP_DAYS ?? "7");
const HEALTH_TIMEOUT_S = 15;

function ts(): string {
  return new Date().toISOString();
}

/** Adım sonuçlarını logs/orchestrator.log'a da yazar (plan: özet log). */
function logFile(msg: string): void {
  const dir = path.join(process.cwd(), "logs");
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.appendFileSync(path.join(dir, "orchestrator.log"), `${ts()} ${msg}\n`);
  } catch {
    /* dosya yazılamazsa yalnız konsol */
  }
}

async function step(name: string, cmd: string, args: string[]): Promise<boolean> {
  console.log(`\n══ [${ts()}] ${name}: ${cmd} ${args.join(" ")}`);
  logFile(`START ${name}: ${cmd} ${args.join(" ")}`);
  try {
    const { stdout } = await runcmd(cmd, args, {
      cwd: process.cwd(),
      shell: process.platform === "win32",
      timeout: 120 * 60 * 1000,
      maxBuffer: 32 * 1024 * 1024,
    });
    const tail = stdout.trim().split("\n").slice(-3).join(" | ");
    console.log(`  ok: ${tail}`);
    logFile(`OK ${name}: ${tail}`);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`  [hata] ${name}: ${msg}`);
    logFile(`FAIL ${name}: ${msg}`);
    return false; // sıradaki adım devam eder (idempotent — sonraki koşum yerine koyar)
  }
}

/** compose up + Postgres/TEI sağlık kontrolü; hazır olana kadar bekler (makine az önce açıldıysa). */
async function infrastructure(): Promise<boolean> {
  console.log(`\n══ [${ts()}] compose up`);
  try {
    await runcmd("docker", ["compose", "up", "-d"], { timeout: 180_000, shell: process.platform === "win32" });
  } catch (e) {
    console.warn(`compose hata (zaten çalışıyor olabilir): ${(e as Error).message}`);
  }
  const pool = new pg.Pool({ connectionString: config.databaseUrl });
  try {
    for (let i = 0; i < HEALTH_TIMEOUT_S; i++) {
      try {
        await pool.query("select 1");
        console.log("pg ✓");
        // TEI: 8080'de /health — ayakta olmadan embed koşamaz; o zaman da 'pipeline embed' kendisi durur.
        return true;
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    console.warn("pg ayağa kalkamadı — collect adımları yine de dener (DB olmayan çağrılar hata verir)");
    logFile("WARN pg hazır değil");
    return false;
  } finally {
    await pool.end().catch(() => {}); // her çıkış yolunda pool kapanır (CodeRabbit)
  }
}

/** Recluster tetiği: atanmamış embedded oranı eşiği + güvenlik ağı (gün sayısı). */
async function reclusterNeeded(): Promise<boolean> {
  const pool = new pg.Pool({ connectionString: config.databaseUrl });
  try {
    const r = await pool.query<{ total: string; unassigned: string; last_run: Date | null }>(
      `select
          -- total: HDBSCAN noise işaretlileri dışla (bunlar bileşen olmayan obs olarak işlendi)
         (select count(*) from observations
           where status='embedded' and embedding is not null and status <> 'embedded_noise')::text as total,
         (select count(*) from observations o
            where o.status='embedded' and o.embedding is not null
              and not exists (select 1 from pattern_observations po where po.observation_id=o.id))::text as unassigned,
         (select max(assigned_at) from pattern_observations where run_kind='recluster') as last_run`,
    );
    const total = Number(r.rows[0]?.total ?? 0);
    const unassigned = Number(r.rows[0]?.unassigned ?? 0);
    const lastRun = r.rows[0]?.last_run ?? null;
    const gapDays = lastRun ? (Date.now() - new Date(lastRun).getTime()) / 86400_000 : Infinity;
    const ratio = total === 0 ? 0 : unassigned / total;
    const decision =
      total > 0 && (ratio > RECLUSTER_UNASSIGNED_RATIO || gapDays > RECLUSTER_MAX_GAP_DAYS);
    console.log(
      `recluster tetik: total=${total} unassigned=${unassigned} ratio=${ratio.toFixed(3)} eşik=${RECLUSTER_UNASSIGNED_RATIO} gap_gün=${gapDays === Infinity ? "∞" : gapDays.toFixed(0)} → ${decision ? "KOŞ" : "atla"}`,
    );
    logFile(`RECLUSTER_DECISION total=${total} unassigned=${unassigned} → koş=${decision}`);
    return decision;
  } finally {
    await pool.end().catch(() => {});
  }
}

async function counterpartQueue(): Promise<string[]> {
  const pool = new pg.Pool({ connectionString: config.databaseUrl });
  try {
    const r = await pool.query<{ id: number }>(
      `select p.id from patterns p
       where p.status='active' and p.review_status='interesting'
         and not exists (
           select 1 from counterpart_searches cs
           where cs.pattern_id = p.id and cs.status='done')
       order by p.observation_count desc`,
    );
    return r.rows.map((x) => String(x.id));
  } finally {
    await pool.end().catch(() => {});
  }
}

async function main(): Promise<void> {
  console.log(`=== orchestrator ${ts()} ===`);
  await infrastructure();

  // 1) collect all — adapter'lar kendi imleçlerinden devam eder (catch-up)
  await step("collect", "pnpm", ["collect"]);
  // 2) clean
  await step("clean", "pnpm", ["pipeline", "clean"]);
  // 3) embed
  await step("embed", "pnpm", ["pipeline", "embed"]);
  // 4) assign (Python — centroid assignment)
  await step("assign", "python", ["-m", "cluster.assign"]);
  // 5) recluster — tetik bazlı, takvim yok
  if (await reclusterNeeded()) {
    await step("recluster", "python", ["-m", "cluster.recluster"]);
  }
  // 6) counterpart kuyruğu — yalnızca onaylı (review_status='interesting') ve edilmemiş
  const queue = await counterpartQueue();
  if (queue.length > 0) {
    console.log(`counterpart kuyruğu: ${queue.length} pattern (onaylı, aranmamış)`);
    for (const id of queue) {
      await step(`counterpart #${id}`, "pnpm", ["counterpart", "--pattern", id]);
    }
  }
  console.log(`=== orchestratör bitti ${ts()} ===`);
  logFile("END OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
