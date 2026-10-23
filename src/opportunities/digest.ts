import { withDb } from "../db.js";

export interface OpportunityCard {
  id: string;
  actor: string;
  job: string;
  problem: string;
  workaround: string | null;
  cost: {
    time: string | null;
    money: string | null;
  };
  frequency: string | null;
  nextStep: string | null;
  sourceCount: number;
  communities: string[];
  firstSeen: string | null;
  lastSeen: string | null;
  quote: string;
  source: string;
  sourceUrl: string;
  author: string | null;
  observedAt: string | null;
}

export interface Digest {
  generatedAt: string;
  cardCount: number;
  cards: OpportunityCard[];
}

interface CardRow {
  opportunity_key: string;
  actor: string;
  job: string;
  problem: string;
  workaround: string | null;
  cost_time: string | null;
  cost_money: string | null;
  frequency: string | null;
  next_step: string | null;
  source_count: number;
  communities: string[];
  first_seen: Date | null;
  last_seen: Date | null;
  quote: string;
  source: string;
  source_url: string;
  author: string | null;
  observed_at: Date | null;
}

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export async function runDigest(): Promise<Digest> {
  return withDb(async (client) => {
    const result = await client.query<CardRow>(
      `select o.opportunity_key, o.actor, o.job, o.problem, o.workaround,
              o.cost_time, o.cost_money, o.frequency, o.next_step, o.source_count, o.communities,
              o.first_seen, o.last_seen,
              e.quote, e.source, e.source_url, e.author, e.observed_at
         from opportunities o
         join lateral (
           select quote, source, source_url, author, observed_at
             from opportunity_evidence
            where opportunity_key = o.opportunity_key
            order by observed_at desc nulls last, id desc
            limit 1
         ) e on true
        order by o.opportunity_key`
    );

    const cards = result.rows.map((row) => ({
      id: row.opportunity_key,
      actor: row.actor,
      job: row.job,
      problem: row.problem,
      workaround: row.workaround,
      cost: {
        time: row.cost_time,
        money: row.cost_money,
      },
      frequency: row.frequency,
      nextStep: row.next_step,
      sourceCount: row.source_count,
      communities: row.communities,
      firstSeen: iso(row.first_seen),
      lastSeen: iso(row.last_seen),
      quote: row.quote,
      source: row.source,
      sourceUrl: row.source_url,
      author: row.author,
      observedAt: iso(row.observed_at),
    }));

    return {
      generatedAt: new Date().toISOString(),
      cardCount: cards.length,
      cards,
    };
  });
}
