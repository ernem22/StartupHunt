import type { Candidate, RawCandidate } from "./model.js";

// The name and url of a merged candidate come from the most authoritative source present.
const NAME_PRIORITY = ["trustmrr", "apple", "producthunt", "showhn", "reddit"];

function rank(source: string): number {
  const index = NAME_PRIORITY.indexOf(source);
  return index === -1 ? NAME_PRIORITY.length : index;
}

/** Merges raw candidates that share a canonical key; output is sorted by source count, then name. */
export function mergeCandidates(raw: readonly RawCandidate[]): Candidate[] {
  const byKey = new Map<string, RawCandidate[]>();
  for (const candidate of raw) {
    const group = byKey.get(candidate.key);
    if (group) group.push(candidate);
    else byKey.set(candidate.key, [candidate]);
  }

  const merged: Candidate[] = [];
  for (const [key, group] of byKey) {
    const ordered = [...group].sort((a, b) => rank(a.source) - rank(b.source));
    const primary = ordered[0]!;
    const sources = [...new Set(ordered.map((c) => c.source))];
    // Same source, same metric, same observation link is one data point, not two.
    const seen = new Set<string>();
    const dataPoints = ordered.flatMap((c) =>
      c.dataPoints.filter((point) => {
        const id = `${point.source}|${point.metric}|${point.url}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }),
    );
    const described = ordered.find((c) => c.description);
    const categorized = ordered.find((c) => c.category);
    const storeFlag = ordered.find((c) => c.isMobileApp !== undefined)?.isMobileApp;
    merged.push({
      key,
      name: primary.name,
      url: primary.url,
      sources,
      dataPoints,
      ...(described?.description ? { description: described.description } : {}),
      ...(categorized?.category ? { category: categorized.category } : {}),
      ...(storeFlag === undefined ? {} : { isMobileApp: storeFlag }),
    });
  }

  return merged.sort(
    (a, b) => b.sources.length - a.sources.length || a.name.localeCompare(b.name, "en"),
  );
}
