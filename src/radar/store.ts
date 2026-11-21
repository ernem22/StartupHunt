import type pg from "pg";
import type { CandidateSeries } from "./github.js";
import type { Manifest, RadarStore } from "./run.js";

export class PostgresRadarStore implements RadarStore {
  constructor(private readonly client: pg.Client) {}

  async start(manifest: Manifest): Promise<string> {
    const result = await this.client.query<{ id: string }>(
      `insert into stage_runs (source, parameters, seed, commit_hash)
       values ($1, $2, $3, $4) returning id`,
      [manifest.source, JSON.stringify(manifest.parameters), manifest.seed, manifest.commitHash],
    );
    return result.rows[0]!.id;
  }

  async complete(id: string, series: CandidateSeries[]): Promise<void> {
    await this.client.query("begin");
    try {
      for (const candidate of series) {
        for (const point of candidate.weeks) {
          await this.client.query(
            `insert into metric_snapshots (entity_type, entity_id, metric, value, captured_at)
             values ('github_repo', $1, 'weekly_new_stars', $2, $3)`,
            [candidate.url, point.total, new Date(point.week * 1000)],
          );
        }
      }
      await this.client.query(
        "update stage_runs set status = 'completed', finished_at = now() where id = $1",
        [id],
      );
      await this.client.query("commit");
    } catch (error) {
      await this.client.query("rollback");
      throw error;
    }
  }

  async fail(id: string): Promise<void> {
    await this.client.query(
      "update stage_runs set status = 'failed', finished_at = now() where id = $1",
      [id],
    );
  }
}
