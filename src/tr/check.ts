import { collectChannel } from "./channels.js";
import {
  buildQueries,
  classifyWebProduct,
  decideVerdict,
  type TrCandidate,
  type TrVerdict,
  isRealMatch,
} from "./logic.js";
import { collectWeb, webQueries } from "./web.js";

export type { TrCandidate, TrEvidence, TrVerdict } from "./logic.js";

export async function checkTrSaturation(candidate: TrCandidate): Promise<TrVerdict> {
  const queries = buildQueries(candidate);
  const webProduct = classifyWebProduct(candidate);
  const [apple, play, web] = await Promise.all([
    collectChannel("apple_tr", queries),
    collectChannel("play_tr", queries),
    webProduct
      ? collectWeb(candidate.name, webQueries(candidate.name, candidate.description))
      : Promise.resolve({ evidence: [], errors: [] }),
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

  const verdict = decideVerdict({
    candidate: { ...candidate, webProduct },
    queries: [
      ...new Set([
        ...queries,
        ...(webProduct ? webQueries(candidate.name, candidate.description) : []),
      ]),
    ],
    evidence: unique,
    channelErrors: { apple_tr: apple.errors, play_tr: play.errors, web_tr: web.errors },
    webEvidence: web.evidence,
  });
  return verdict;
}
