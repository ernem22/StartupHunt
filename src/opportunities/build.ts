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
  thread_url: string | null;
}

export type RejectReason =
  | "missing_actor"
  | "missing_job"
  | "missing_problem"
  | "missing_workaround_or_spend"
  | "missing_quote"
  | "missing_link"
  | "missing_date"
  | "same_thread"
  | "single_source_without_next_step"
  | "missing_next_step";

export interface BuildStats {
  observations: number;
  evidence: number;
  opportunities: number;
  signals: number;
  skipped: number;
}

interface DraftEntry {
  observation: ObservationForExtraction;
  draft: EvidenceDraft;
  threadUrl: string;
}

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

function nextStepOf(entries: DraftEntry[]): string | null {
  for (const { draft } of entries) {
    if (!isBlank(draft.nextStep)) return draft.nextStep!.trim();
  }
  return null;
}

function rejectReason(entries: DraftEntry[]): RejectReason | null {
  for (const { draft } of entries) {
    if (isBlank(draft.actor)) return "missing_actor";
    if (isBlank(draft.job)) return "missing_job";
    if (isBlank(draft.problem)) return "missing_problem";
  }
  const hasWork = entries.some(
    ({ draft }) =>
      !isBlank(draft.workaround) || !isBlank(draft.costTime) || !isBlank(draft.costMoney)
  );
  if (!hasWork) return "missing_workaround_or_spend";
  if (entries.some(({ draft }) => isBlank(draft.quote))) return "missing_quote";
  if (entries.some(({ observation }) => isBlank(observation.sourceUrl))) return "missing_link";
  if (entries.some(({ observation }) => !observation.observedAt)) return "missing_date";

  const threadUrls = new Set(entries.map(({ threadUrl }) => threadUrl));
  if (threadUrls.size === 1 && entries.length > 1) return "same_thread";
  if (threadUrls.size === 1) {
    const minutes = entries[0]?.draft.nextStepMinutes;
    if (minutes == null || minutes > 15) return "single_source_without_next_step";
  }

  if (!nextStepOf(entries)) return "missing_next_step";
  return null;
}

export async function runBuild(extractor: EvidenceExtractor): Promise<BuildStats> {
  return withDb(async (client) => {
    await client.query("begin");
    try {
      const result = await client.query<ObservationRow>(
        `select id, source, source_id, source_url, title, text, author, observed_at, language,
                metadata->>'thread_url' as thread_url
           from observations
          order by id`
      );

      const groups = new Map<string, DraftEntry[]>();
      let observationsWithDrafts = 0;

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
        observationsWithDrafts++;
        for (const draft of drafts) {
          const key = opportunityKey(draft);
          const entries = groups.get(key) ?? [];
          entries.push({
            observation,
            draft,
            threadUrl: row.thread_url ?? row.source_url,
          });
          groups.set(key, entries);
        }
      }

      let evidence = 0;
      let signals = 0;
      const touched = new Set<string>();

      for (const [key, entries] of groups) {
        const reason = rejectReason(entries);
        if (reason) {
          for (const entry of entries) {
            await upsertSignal(client, key, entry, reason);
            signals++;
          }
          await client.query(
            `update opportunities
                set source_count = 0,
                    communities = '{}',
                    updated_at = now()
              where opportunity_key = $1`,
            [key]
          );
          continue;
        }

        const nextStep = nextStepOf(entries);
        for (const entry of entries) {
          await upsertOpportunity(client, key, entry.draft, nextStep);
          await upsertEvidence(client, key, entry, extractor.name);
          evidence++;
        }
        await client.query(
          `delete from opportunity_signals
            where opportunity_key = $1
              and observation_id = any($2::bigint[])`,
          [key, entries.map(({ observation }) => observation.id)]
        );
        touched.add(key);
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
                      count(distinct thread_url)::int as source_count,
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
        signals,
        skipped: result.rows.length - observationsWithDrafts,
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
  draft: EvidenceDraft,
  nextStep: string | null
): Promise<void> {
  await client.query(
    `insert into opportunities
       (opportunity_key, actor, job, problem, workaround, cost_time, cost_money, frequency, next_step)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (opportunity_key) do update
       set actor = excluded.actor,
           job = excluded.job,
           problem = excluded.problem,
           workaround = coalesce(opportunities.workaround, excluded.workaround),
           cost_time = coalesce(opportunities.cost_time, excluded.cost_time),
           cost_money = coalesce(opportunities.cost_money, excluded.cost_money),
           frequency = coalesce(opportunities.frequency, excluded.frequency),
           next_step = coalesce(excluded.next_step, opportunities.next_step),
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
      nextStep,
    ]
  );
}

async function upsertEvidence(
  client: pg.PoolClient,
  key: string,
  entry: DraftEntry,
  extractor: string
): Promise<void> {
  const { observation, draft } = entry;
  await client.query(
    `insert into opportunity_evidence
       (observation_id, opportunity_key, actor, job, problem, workaround,
        cost_time, cost_money, frequency, quote, source, source_url, thread_url, author,
        observed_at, language, extractor)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
           thread_url = excluded.thread_url,
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
      entry.threadUrl,
      observation.author,
      observation.observedAt,
      draft.language ?? observation.language,
      extractor,
    ]
  );
}

async function upsertSignal(
  client: pg.PoolClient,
  key: string,
  entry: DraftEntry,
  reason: RejectReason
): Promise<void> {
  await client.query(
    `insert into opportunity_signals (observation_id, opportunity_key, reason, draft)
     values ($1, $2, $3, $4)
     on conflict (observation_id, opportunity_key) do update
       set reason = excluded.reason,
           draft = excluded.draft,
           created_at = now()`,
    [entry.observation.id, key, reason, JSON.stringify(entry.draft)]
  );
}
