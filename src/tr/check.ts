import { collectChannel } from "./channels.js";
import {
  buildQueries,
  decideVerdict,
  type TrCandidate,
  type TrVerdict,
  isRealMatch,
} from "./logic.js";

export type { TrCandidate, TrEvidence, TrVerdict } from "./logic.js";

export async function checkTrSaturation(candidate: TrCandidate): Promise<TrVerdict> {
  const queries = buildQueries(candidate);
  const [apple, play] = await Promise.all([
    collectChannel("apple_tr", queries),
    collectChannel("play_tr", queries),
  ]);

  const evidence = [...apple.evidence, ...play.evidence].filter((item) =>
    queries.some((query) => isRealMatch(candidate.name, item.name, query)),
  );

  const seen = new Set<string>();
  const unique = evidence.filter((item) => {
    const key = `${item.channel}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return decideVerdict({
    candidate,
    queries,
    evidence: unique,
    channelErrors: { apple_tr: apple.errors, play_tr: play.errors },
  });
}
