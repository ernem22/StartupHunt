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

function normalizeText(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(normalizeText(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const token of a) {
    if (b.has(token)) shared++;
  }
  const total = a.size + b.size - shared;
  return total === 0 ? 1 : shared / total;
}

function independentSourceCount(entries: DraftEntry[]): number {
  const parent = entries.map((_, index) => index);
  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root]!;
    let current = index;
    while (parent[current] !== root) {
      const next = parent[current]!;
      parent[current] = root;
      current = next;
    }
    return root;
  };
  const union = (a: number, b: number): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  const firstIndex = new Map<string, number>();
  const link = (identity: string, index: number): void => {
    const first = firstIndex.get(identity);
    if (first === undefined) {
      firstIndex.set(identity, index);
      return;
    }
    union(first, index);
  };

  entries.forEach((entry, index) => {
    link(`thread:${entry.threadUrl}`, index);
    const author = entry.observation.author?.trim().toLowerCase();
    if (author) link(`author:${author}`, index);
  });

  const tokens = entries.map((entry) => tokenSet(entry.observation.text));
  for (let left = 0; left < entries.length; left++) {
    for (let right = left + 1; right < entries.length; right++) {
      if (jaccard(tokens[left]!, tokens[right]!) >= 0.9) union(left, right);
    }
  }

  return new Set(entries.map((_, index) => find(index))).size;
}

function nextStepMinutesOf(entries: DraftEntry[]): number | null {
  for (const { draft } of entries) {
    if (!isBlank(draft.nextStep)) return draft.nextStepMinutes;
  }
  return null;
}

function rejectReason(entries: DraftEntry[], sources: number): RejectReason | null {
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

  if (sources < 2) {
    const threadUrls = new Set(entries.map(({ threadUrl }) => threadUrl));
    if (threadUrls.size === 1 && entries.length > 1) return "same_thread";

    const minutes = nextStepMinutesOf(entries);
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
                coalesce(
                  metadata->>'thread_url',
                  case when metadata ? 'parent_story_id'
                       then source || ':story:' || (metadata->>'parent_story_id') end,
                  case when metadata ? 'video_id'
                       then source || ':video:' || (metadata->>'video_id') end,
                  source_url
                ) as thread_url
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
        const sources = independentSourceCount(entries);
        const reason = rejectReason(entries, sources);
        if (reason) {
          for (const entry of entries) {
            await upsertSignal(client, key, entry, reason, sources);
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
          await upsertOpportunity(client, key, entry.draft, nextStep, sources);
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
              set communities = s.communities,
                  first_seen = s.first_seen,
                  last_seen = s.last_seen,
                  updated_at = now()
             from (
               select opportunity_key,
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
  nextStep: string | null,
  sourceCount: number
): Promise<void> {
  await client.query(
    `insert into opportunities
       (opportunity_key, actor, job, problem, workaround, cost_time, cost_money, frequency,
        next_step, source_count)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (opportunity_key) do update
       set actor = excluded.actor,
           job = excluded.job,
           problem = excluded.problem,
           workaround = coalesce(opportunities.workaround, excluded.workaround),
           cost_time = coalesce(opportunities.cost_time, excluded.cost_time),
           cost_money = coalesce(opportunities.cost_money, excluded.cost_money),
           frequency = coalesce(opportunities.frequency, excluded.frequency),
           next_step = coalesce(excluded.next_step, opportunities.next_step),
           source_count = excluded.source_count,
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
      sourceCount,
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
  reason: RejectReason,
  sourceCount: number
): Promise<void> {
  await client.query(
    `insert into opportunity_signals (observation_id, opportunity_key, reason, draft, source_count)
     values ($1, $2, $3, $4, $5)
     on conflict (observation_id, opportunity_key) do update
       set reason = excluded.reason,
           draft = excluded.draft,
           source_count = excluded.source_count,
           created_at = now()`,
    [entry.observation.id, key, reason, JSON.stringify(entry.draft), sourceCount]
  );
}
