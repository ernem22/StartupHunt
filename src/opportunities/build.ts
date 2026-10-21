import type pg from "pg";
import { withDb } from "../db.js";
import { opportunityKey } from "./key.js";
import type { EvidenceDraft, EvidenceExtractor, ObservationForExtraction } from "./types.js";

interface ObservationRow {
  id: string;
  source: string;
  source_id: string;
  source_url: string;
  title: string | null;
  text: string;
  author: string | null;
  observed_at: Date | null;
  language: string | null;
}

export interface BuildStats {
  observations: number;
  evidence: number;
  opportunities: number;
  skipped: number;
}

export async function runBuild(extractor: EvidenceExtractor): Promise<BuildStats> {
  return withDb(async (client) => {
    await client.query("begin");
    try {
      const result = await client.query<ObservationRow>(
        `select id, source, source_id, source_url, title, text, author, observed_at, language
           from observations
          order by id`
      );
      const touched = new Set<string>();
      let evidence = 0;
      let withEvidence = 0;

      for (const row of result.rows) {
        const observation: ObservationForExtraction = {
          id: row.id,
          source: row.source,
          sourceId: row.source_id,
          sourceUrl: row.source_url,
          title: row.title,
          text: row.text,
          author: row.author,
          observedAt: row.observed_at,
          language: row.language,
        };
        const drafts = extractor.extract(observation);
        if (drafts.length === 0) continue;
        withEvidence++;
        for (const draft of drafts) {
          const key = opportunityKey(draft);
          await upsertOpportunity(client, key, draft);
          await upsertEvidence(client, key, observation, draft, extractor.name);
          touched.add(key);
          evidence++;
        }
      }

      if (touched.size > 0) {
        await client.query(
          `update opportunities o
              set source_count = s.source_count,
                  communities = s.communities,
                  first_seen = s.first_seen,
                  last_seen = s.last_seen,
                  updated_at = now()
             from (
               select opportunity_key,
                      count(distinct source_url)::int as source_count,
                      array_agg(distinct source order by source) as communities,
                      min(observed_at) as first_seen,
                      max(observed_at) as last_seen
                 from opportunity_evidence
                where opportunity_key = any($1::text[])
                group by opportunity_key
             ) s
            where s.opportunity_key = o.opportunity_key`,
          [[...touched]]
        );
      }

      await client.query("commit");
      return {
        observations: result.rows.length,
        evidence,
        opportunities: touched.size,
        skipped: result.rows.length - withEvidence,
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

async function upsertOpportunity(
  client: pg.PoolClient,
  key: string,
  draft: EvidenceDraft
): Promise<void> {
  await client.query(
    `insert into opportunities
       (opportunity_key, actor, job, problem, workaround, cost_time, cost_money, frequency)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (opportunity_key) do update
       set actor = excluded.actor,
           job = excluded.job,
           problem = excluded.problem,
           workaround = coalesce(opportunities.workaround, excluded.workaround),
           cost_time = coalesce(opportunities.cost_time, excluded.cost_time),
           cost_money = coalesce(opportunities.cost_money, excluded.cost_money),
           frequency = coalesce(opportunities.frequency, excluded.frequency),
           updated_at = now()`,
    [
      key,
      draft.actor,
      draft.job,
      draft.problem,
      draft.workaround,
      draft.costTime,
      draft.costMoney,
      draft.frequency,
    ]
  );
}

async function upsertEvidence(
  client: pg.PoolClient,
  key: string,
  observation: ObservationForExtraction,
  draft: EvidenceDraft,
  extractor: string
): Promise<void> {
  await client.query(
    `insert into opportunity_evidence
       (observation_id, opportunity_key, actor, job, problem, workaround,
        cost_time, cost_money, frequency, quote, source, source_url, author,
        observed_at, language, extractor)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     on conflict (observation_id, opportunity_key) do update
       set actor = excluded.actor,
           job = excluded.job,
           problem = excluded.problem,
           workaround = excluded.workaround,
           cost_time = excluded.cost_time,
           cost_money = excluded.cost_money,
           frequency = excluded.frequency,
           quote = excluded.quote,
           source = excluded.source,
           source_url = excluded.source_url,
           author = excluded.author,
           observed_at = excluded.observed_at,
           language = excluded.language,
           extractor = excluded.extractor`,
    [
      observation.id,
      key,
      draft.actor,
      draft.job,
      draft.problem,
      draft.workaround,
      draft.costTime,
      draft.costMoney,
      draft.frequency,
      draft.quote,
      observation.source,
      observation.sourceUrl,
      observation.author,
      observation.observedAt,
      draft.language ?? observation.language,
      extractor,
    ]
  );
}
