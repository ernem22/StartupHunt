// Polite defaults for every candidate source: identifiable UA, timeout, one retry on 429/5xx.
const USER_AGENT = "StartupHunt/0.1 (personal trend radar; low-volume)";

export const DELAY_MS = 1500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchResponse(
  url: string,
  accept: string,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const attempt = () =>
    fetch(url, {
      headers: { "User-Agent": USER_AGENT, accept, ...extraHeaders },
      signal: AbortSignal.timeout(30000),
    });
  let response: Response;
  try {
    response = await attempt();
  } catch {
    // Timeouts and resets happen on these services; one retry after a pause.
    await sleep(5000);
    response = await attempt();
  }
  if (response.status === 429 || response.status >= 500) {
    await sleep(5000);
    response = await attempt();
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${new URL(url).pathname}`);
  return response;
}

export async function fetchJson(url: string): Promise<unknown> {
  return (await fetchResponse(url, "application/json")).json();
}

export async function fetchText(url: string): Promise<string> {
  return (await fetchResponse(url, "application/atom+xml, application/xml, text/xml")).text();
}

/** A finite number or undefined; upstream nulls and strings never become data points. */
export function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** YYYY-MM-DD (UTC) for a timestamp in ms or an ISO/RFC date string. */
export function isoDay(value: number | string): string {
  const time = typeof value === "number" ? value : Date.parse(value);
  if (Number.isNaN(time)) throw new Error(`Invalid date: ${value}`);
  return new Date(time).toISOString().slice(0, 10);
}
