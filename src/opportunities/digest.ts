import { withDb } from "../db.js";
import { isSuppressed, loadRecentDrops } from "./feedback.js";
import { loadKnownProfile, scoreCard, type KnownLikelihood } from "./profile.js";
import type { CounterArgumentStrength } from "./types.js";

export const MAX_DIGEST_CARDS = 10;
export const NO_CANDIDATES_MESSAGE = "Bu hafta araştırmaya değer bir şey yok.";

const PRIOR_RANK: Record<KnownLikelihood, number> = {
  likely_new: 0,
  uncertain: 1,
  likely_known: 2,
};

export interface OpportunityCard {
  id: string;
  likelyKnown: KnownLikelihood;
  knownReason: string;
  actor: string;
  job: string;
  problem: string;
  workaround: string | null;
  cost: {
    time: string | null;
    money: string | null;
  };
  frequency: string | null;
  existingSolution: string | null;
  existingSolutionGap: string | null;
  counterArgument: string | null;
  counterArgumentStrength: CounterArgumentStrength | null;
  falsificationNote: string;
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

export interface DigestDropReason {
  reason: string;
  count: number;
}

export interface Digest {
  cardCount: number;
  eligibleCount: number;
  maxCards: number;
  message: string | null;
  dropped: DigestDropReason[];
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
  existing_solution: string | null;
  existing_solution_gap: string | null;
  counter_argument: string | null;
  counter_argument_strength: CounterArgumentStrength | null;
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

interface DropRow {
  reason: string;
  count: string;
}

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function falsificationNoteFor(nextStep: string | null): string {
  if (!nextStep) return "Yanlışlama: bir sonraki adım sorunu çözüyorsa bu fırsat düşer.";
  return `Yanlışlama: "${nextStep}" adımı sorunu çözüyorsa bu fırsat düşer.`;
}

function compareCards(a: OpportunityCard, b: OpportunityCard): number {
  const byPrior = PRIOR_RANK[a.likelyKnown] - PRIOR_RANK[b.likelyKnown];
  if (byPrior !== 0) return byPrior;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function composeDigest(
  cards: OpportunityCard[],
  dropped: DigestDropReason[]
): Digest {
  const ordered = [...cards].sort(compareCards);
  const limited = ordered.slice(0, MAX_DIGEST_CARDS);
  return {
    cardCount: limited.length,
    eligibleCount: cards.length,
    maxCards: MAX_DIGEST_CARDS,
    message: limited.length === 0 ? NO_CANDIDATES_MESSAGE : null,
    dropped,
    cards: limited,
  };
}

function display(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : "—";
}

export function renderDigestMarkdown(digest: Digest): string {
  const lines: string[] = ["# Fırsat digest'i", ""];

  if (digest.cardCount === 0) {
    lines.push(digest.message ?? NO_CANDIDATES_MESSAGE, "");
    lines.push("Düşme gerekçeleri:");
    if (digest.dropped.length === 0) {
      lines.push("- Kayıt yok.");
    } else {
      for (const entry of digest.dropped) {
        lines.push(`- ${entry.reason}: ${entry.count}`);
      }
    }
    return `${lines.join("\n")}\n`;
  }

  const truncated =
    digest.eligibleCount > digest.cardCount
      ? ` (${digest.eligibleCount} uygun adaydan ilk ${digest.cardCount})`
      : "";
  lines.push(`${digest.cardCount} kart, en fazla ${digest.maxCards}${truncated}.`, "");

  digest.cards.forEach((card, index) => {
    lines.push(`## ${index + 1}. ${card.actor} — ${card.job}`, "");
    lines.push(`- **Kimlik:** ${card.id}`);
    lines.push(`- **Bilinen profil:** ${card.likelyKnown} — ${card.knownReason}`);
    lines.push(`- **Problem:** ${card.problem}`);
    lines.push(`- **Workaround:** ${display(card.workaround)}`);
    lines.push(
      `- **Maliyet:** zaman ${display(card.cost.time)}; para ${display(card.cost.money)}`
    );
    lines.push(`- **Sıklık:** ${display(card.frequency)}`);
    lines.push(
      `- **Bağımsız kaynak:** ${card.sourceCount} (${display(card.communities.join(", "))})`
    );
    lines.push(
      `- **İlk/son görülme:** ${display(card.firstSeen)} / ${display(card.lastSeen)}`
    );
    lines.push(`- **Bilinen çözüm:** ${display(card.existingSolution)}`);
    lines.push(`- **Neden yetmiyor:** ${display(card.existingSolutionGap)}`);
    lines.push(`- **Sonraki adım:** ${display(card.nextStep)}`);
    lines.push(
      `- **Karşı görüş (${display(card.counterArgumentStrength)}):** ${display(card.counterArgument)}`
    );
    lines.push(`- **Yanlışlama notu:** ${card.falsificationNote}`);
    lines.push(`- **Alıntı:** "${card.quote}"`);
    lines.push(
      `- **Kaynak:** ${card.sourceUrl} — ${display(card.observedAt)} (${display(card.author)})`,
      ""
    );
  });

  return `${lines.join("\n").trimEnd()}\n`;
}

export interface DigestOptions {
  now?: Date;
}

export async function runDigest(options: DigestOptions = {}): Promise<Digest> {
  const now = options.now ?? new Date();
  const profile = loadKnownProfile();

  return withDb(async (client) => {
    const result = await client.query<CardRow>(
      `select o.opportunity_key, o.actor, o.job, o.problem, o.workaround,
              o.cost_time, o.cost_money, o.frequency,
              o.existing_solution, o.existing_solution_gap,
              o.counter_argument, o.counter_argument_strength,
              o.next_step, o.source_count, o.communities,
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
        where o.source_count > 0
          and o.existing_solution is not null
          and o.existing_solution_gap is not null
          and o.counter_argument is not null
          and o.counter_argument_strength in ('weak', 'moderate')
          and o.next_step is not null
          and e.observed_at is not null
        order by o.opportunity_key`
    );

    const drops = await loadRecentDrops(client, now);
    const cards: OpportunityCard[] = [];
    for (const row of result.rows) {
      const score = scoreCard(profile, {
        actor: row.actor,
        job: row.job,
        problem: row.problem,
        workaround: row.workaround,
      });
      const card: OpportunityCard = {
        id: row.opportunity_key,
        likelyKnown: score.likelyKnown,
        knownReason: score.knownReason,
        actor: row.actor,
        job: row.job,
        problem: row.problem,
        workaround: row.workaround,
        cost: {
          time: row.cost_time,
          money: row.cost_money,
        },
        frequency: row.frequency,
        existingSolution: row.existing_solution,
        existingSolutionGap: row.existing_solution_gap,
        counterArgument: row.counter_argument,
        counterArgumentStrength: row.counter_argument_strength,
        falsificationNote: falsificationNoteFor(row.next_step),
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
      };
      if (isSuppressed(card.id, card, drops)) continue;
      cards.push(card);
    }

    const droppedResult = await client.query<DropRow>(
      `select s.reason, count(distinct s.opportunity_key) as count
         from opportunity_signals s
        where not exists (
                select 1
                  from opportunities o
                 where o.opportunity_key = s.opportunity_key
                   and o.source_count > 0
              )
        group by s.reason
        order by s.reason`
    );

    return composeDigest(
      cards,
      droppedResult.rows.map((row) => ({
        reason: row.reason,
        count: Number(row.count),
      }))
    );
  });
}
