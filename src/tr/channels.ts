import type { TrChannel, TrEvidence } from "./logic.js";

const USER_AGENT = "StartupHunt-TR-Check/1.0 (+https://github.com/ernem22/StartupHunt)";
const ITUNES_INTERVAL_MS = 3000;

let lastItunesRequest = 0;

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchItunes(term: string): Promise<TrEvidence[]> {
  const elapsed = Date.now() - lastItunesRequest;
  if (lastItunesRequest && elapsed < ITUNES_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, ITUNES_INTERVAL_MS - elapsed));
  }
  lastItunesRequest = Date.now();
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=tr&entity=software&limit=10`;
  const json = JSON.parse(await fetchText(url)) as {
    results?: {
      trackName?: string;
      sellerName?: string;
      userRatingCount?: number;
      trackId?: number;
      trackViewUrl?: string;
    }[];
  };
  return (json.results ?? [])
    .filter((item) => item.trackName && item.trackId)
    .map((item) => ({
      channel: "apple_tr" as const,
      name: item.trackName!,
      id: String(item.trackId),
      ...(item.sellerName ? { seller: item.sellerName } : {}),
      ...(typeof item.userRatingCount === "number" ? { ratingCount: item.userRatingCount } : {}),
      url: item.trackViewUrl ?? `https://apps.apple.com/tr/app/id${item.trackId}`,
    }));
}

function decode(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parsePlayHtml(html: string): TrEvidence[] {
  const items: TrEvidence[] = [];
  const blocks = html.split('role="listitem"').slice(1);
  for (const block of blocks) {
    const idMatch = /\/store\/apps\/details\?id=([A-Za-z0-9._]+)/.exec(block);
    const nameMatch = /class="DdYX5"[^>]*>([^<]+)<\/span>/.exec(block);
    if (!idMatch || !nameMatch) continue;
    const id = idMatch[1]!;
    items.push({
      channel: "play_tr",
      name: decode(nameMatch[1]!),
      id,
      url: `https://play.google.com/store/apps/details?id=${id}&hl=tr&gl=TR`,
    });
    if (items.length >= 20) break;
  }
  return items;
}

async function fetchPlay(term: string): Promise<TrEvidence[]> {
  const url = `https://play.google.com/store/search?q=${encodeURIComponent(term)}&c=apps&hl=tr&gl=TR`;
  return parsePlayHtml(await fetchText(url));
}

export type ChannelResult = {
  evidence: TrEvidence[];
  errors: string[];
};

export async function collectChannel(
  channel: TrChannel,
  queries: string[],
): Promise<ChannelResult> {
  const evidence: TrEvidence[] = [];
  const errors: string[] = [];
  for (const query of queries) {
    try {
      evidence.push(
        ...(channel === "apple_tr" ? await fetchItunes(query) : await fetchPlay(query)),
      );
    } catch (error) {
      errors.push(`${query}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  return { evidence, errors };
}
