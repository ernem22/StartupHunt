import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import type { ObservationForExtraction } from "../../src/opportunities/types.js";

export interface TestDb {
  schema: string;
  admin: pg.Client;
  url: string;
}

export type SeedObservation = Omit<ObservationForExtraction, "id"> & {
  metadata?: Record<string, unknown>;
};

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const schemaPath = path.join(repoRoot, "db", "schema.sql");
const cliPath = path.join(repoRoot, "src", "opportunities", "cli.ts");

function withSearchPath(connectionString: string, schema: string): string {
  const options = `-c search_path=${schema},public`;
  try {
    const url = new URL(connectionString);
    url.searchParams.set("options", options);
    return url.toString();
  } catch {
    const separator = connectionString.includes("?") ? "&" : "?";
    return `${connectionString}${separator}options=${encodeURIComponent(options)}`;
  }
}

export async function createTestDb(connectionString: string): Promise<TestDb> {
  const admin = new pg.Client({ connectionString });
  await admin.connect();
  const schema = `opp_test_${process.pid}_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  let schemaCreated = false;

  try {
    await admin.query("create extension if not exists vector");
    await admin.query(`create schema "${schema}"`);
    schemaCreated = true;
    await admin.query(`set search_path to "${schema}", public`);
    await admin.query(readFileSync(schemaPath, "utf8"));
  } catch (error) {
    if (schemaCreated) {
      await admin.query(`drop schema if exists "${schema}" cascade`).catch(() => undefined);
    }
    await admin.end().catch(() => undefined);
    throw error;
  }

  return {
    schema,
    admin,
    url: withSearchPath(connectionString, schema),
  };
}

export async function dropTestDb(db: TestDb): Promise<void> {
  try {
    await db.admin.query(`drop schema if exists "${db.schema}" cascade`);
  } finally {
    await db.admin.end();
  }
}

export async function seedObservations(
  db: TestDb,
  observations: SeedObservation[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const observation of observations) {
    const result = await db.admin.query<{ id: string }>(
      `insert into observations
         (source, source_id, source_url, title, text, author, observed_at, language, metadata, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'new')
       returning id`,
      [
        observation.source,
        observation.sourceId,
        observation.sourceUrl,
        observation.title,
        observation.text,
        observation.author,
        observation.observedAt,
        observation.language,
        JSON.stringify(observation.metadata ?? {}),
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("seed observation id dönmedi");
    }
    ids.push(row.id);
  }
  return ids;
}

export function runOpportunitiesCli(seam: string, args: string[], databaseUrl: string): string {
  const result = spawnSync(process.execPath, ["--import", "tsx", cliPath, ...args], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(`${seam} seam başlatılamadı: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${seam} seam başarısız (exit ${result.status ?? "?"})\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result.stdout;
}
