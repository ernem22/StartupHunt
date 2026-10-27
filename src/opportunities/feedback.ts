import type pg from "pg";
import { withDb } from "../db.js";
import { normalizeText, tokenSet } from "./profile.js";

export type FeedbackVerdict = "open" | "investigate" | "drop" | "knew";

export const FEEDBACK_VERDICTS: readonly FeedbackVerdict[] = [
  "open",
  "investigate",
  "drop",
  "knew",
];

export const DEFAULT_DROP_WEEKS = 8;

export interface FeedbackCard {
  id: string;
  actor: string;
  job: string;
  problem: string;
}

export interface DropEvent {
  opportunityKey: string;
  actor: string | null;
  job: string | null;
  problem: string | null;
}

interface DropRow {
  opportunity_key: string;
  actor: string | null;
  job: string | null;
  problem: string | null;
}

export function isFeedbackVerdict(value: string): value is FeedbackVerdict {
  return FEEDBACK_VERDICTS.includes(value as FeedbackVerdict);
}

export function dropWeeks(): number {
  const raw = process.env.OPPORTUNITY_DROP_WEEKS;
  if (!raw) return DEFAULT_DROP_WEEKS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DROP_WEEKS;
}

export async function recordFeedback(
  opportunityKey: string,
  verdict: FeedbackVerdict,
  note: string | null
): Promise<{ id: string; createdAt: Date }> {
  return withDb(async (client) => {
    const result = await client.query<{ id: string; created_at: Date }>(
      `insert into opportunity_feedback (opportunity_key, verdict, note)
       values ($1, $2, $3)
       returning id, created_at`,
      [opportunityKey, verdict, note]
    );
    const row = result.rows[0];
    if (!row) throw new Error("feedback kaydı dönmedi");
    return { id: row.id, createdAt: row.created_at };
  });
}

export async function loadRecentDrops(
  client: pg.PoolClient,
  now: Date,
  weeks: number = dropWeeks()
): Promise<DropEvent[]> {
  const result = await client.query<DropRow>(
    `select f.opportunity_key, o.actor, o.job, o.problem
       from opportunity_feedback f
       left join opportunities o on o.opportunity_key = f.opportunity_key
      where f.verdict = 'drop'
        and f.created_at >= $1::timestamptz - ($2::int * interval '1 week')
      order by f.created_at desc, f.id desc`,
    [now, weeks]
  );
  return result.rows.map((row) => ({
    opportunityKey: row.opportunity_key,
    actor: row.actor,
    job: row.job,
    problem: row.problem,
  }));
}

function normalizedActorJob(actor: string | null, job: string | null): string | null {
  if (!actor || !job) return null;
  return `${normalizeText(actor)}\u0000${normalizeText(job)}`;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) {
    if (b.has(token)) shared++;
  }
  return shared / (a.size + b.size - shared);
}

export function isSuppressed(
  opportunityKey: string,
  card: FeedbackCard,
  drops: DropEvent[]
): boolean {
  const cardActorJob = normalizedActorJob(card.actor, card.job);
  const cardProblem = tokenSet(card.problem);

  return drops.some((drop) => {
    if (drop.opportunityKey === opportunityKey) return true;

    const dropActorJob = normalizedActorJob(drop.actor, drop.job);
    if (cardActorJob !== null && dropActorJob !== null && cardActorJob === dropActorJob) {
      return true;
    }

    return jaccard(cardProblem, tokenSet(drop.problem ?? "")) >= 0.9;
  });
}
