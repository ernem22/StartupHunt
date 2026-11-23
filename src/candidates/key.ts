import { NON_PRODUCT_DOMAINS } from "../radar/hackernews.js";

// Extra hosts that never identify a product (media, image hosts, store search pages).
const EXTRA_NON_PRODUCT = ["redd.it", "imgur.com", "trustmrr.com", "google.com"] as const;

const GITHUB_RESERVED = new Set(["features", "topics", "orgs", "sponsors", "marketplace", "apps"]);

function isNonProductHost(host: string): boolean {
  return [...NON_PRODUCT_DOMAINS, ...EXTRA_NON_PRODUCT].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

/**
 * Canonical product key for a link, so the same product found on different sources merges.
 * Returns null for links that do not identify a product (articles, media, search pages).
 */
export function canonicalKey(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!host) return null;

  if (host === "apps.apple.com" || host === "itunes.apple.com") {
    const id = /\/id(\d+)/.exec(parsed.pathname)?.[1];
    return id ? `apple:${id}` : null;
  }
  if (host === "play.google.com") {
    const id = parsed.searchParams.get("id");
    return id && /^[\w.]+$/.test(id) ? `play:${id}` : null;
  }
  if (host === "github.com") {
    const match = /^\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/|$)/.exec(parsed.pathname);
    if (!match || GITHUB_RESERVED.has(match[1]!.toLowerCase())) return null;
    return `github:${match[1]}/${match[2]}`.toLowerCase();
  }
  if (host === "producthunt.com") {
    const slug = /^\/products\/([\w-]+)/.exec(parsed.pathname)?.[1];
    return slug ? `producthunt:${slug}` : null;
  }
  if (isNonProductHost(host)) return null;
  return host;
}
