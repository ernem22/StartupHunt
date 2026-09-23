// GitHubAdapter — REST API (plan v3.1 FAZ 1)
// - search/issues → şikâyet sinyali (SaaS/startup keyword'leri)
// - search/repositories (created:>imleç) → launch sinyali
// Catch-up: her ikisi de imleç tarihinden itibaren sayfalar.
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash, loadAdapterState, saveAdapterState } from "../db.js";

interface SearchIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  user: { login: string } | null;
  html_url: string;
  repository_url: string; // api.github.com/repos/{owner}/{repo}
  labels: { name: string }[];
  comments: number;
  reactions?: { total_count: number };
}

interface SearchRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  created_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  html_url: string;
  owner: { login: string };
}

interface SearchResponse<T> {
  total_count: number;
  items: T[];
}

const API = "https://api.github.com";
const PAGE_DELAY_MS = 2200; // search secondary limit ~30 req/dk → nazik 1/2.2s
const MAX_PAGES = 10; // search 1000 sonuç tavanı → 10 sayfa x 100
const BACKFILL_SINCE = "2020-01-01";

/** Issue sinyal taraması — pain point niyetiyle (FAZ 1 tablosu). */
const ISSUE_QUERIES = [
  "missing feature in:title",
  "feature request",
  "is:issue is:open alternative to",
  "is:issue cannot export",
];

/** Yeni repo = launch sinyali. */
const REPO_TOPICS = ["saas", "startup", "no-code", "indie-hackers", "productivity"];

interface GhCursor {
  issueLastRun?: string;
  repoCreatedSince: string; // YYYY-MM-DD imleci
}

function token(): string | undefined {
  return process.env.GITHUB_TOKEN || undefined;
}

/** Dry-run'da DB yok — bellek içi state. */
function makeStateStore<T>(dryRun: boolean, initial: () => T) {
  let mem: T | null = null;
  return {
    async load(): Promise<T> {
      if (dryRun) return (mem ??= initial());
      return (await loadAdapterState<T>("github")) ?? initial();
    },
    async save(v: T): Promise<void> {
      if (dryRun) {
        mem = v;
        return;
      }
      await saveAdapterState("github", v, {});
    },
  };
}

async function ghFetch<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "StartupHunt/0.1",
  };
  const t = token();
  if (t) headers.authorization = `Bearer ${t}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, { headers });
      if (res.status === 403 || res.status === 429) {
        const ra = res.headers.get("retry-after");
        const reset = res.headers.get("x-ratelimit-reset");
        const waitSec = ra ? Number(ra) : reset ? Math.max(Number(reset) - Date.now() / 1000, 5) : 30;
        console.warn(`  [rate] ${Math.round(waitSec)}s bekleniyor`);
        await sleep(waitSec * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
      return (await res.json()) as T;
    } catch (e) {
      if (attempt === 2) {
        console.warn(`  [hata] ${path}: ${(e as Error).message}`);
        return null;
      }
      await sleep(3000 * (attempt + 1));
    }
  }
  return null;
}

function issueToNormalized(i: SearchIssue): NormalizedObservation | null {
  const repo = i.repository_url.replace("https://api.github.com/repos/", "");
  if (!i.title && !i.body) return null;
  return {
    source: "github",
    sourceId: `issue-${i.id}`,
    sourceUrl: i.html_url,
    title: i.title,
    text: i.body ?? i.title,
    author: i.user?.login ?? null,
    observedAt: new Date(i.created_at),
    language: null,
    metadata: {
      kind: "issue",
      repo,
      state: i.state,
      labels: i.labels.map((l) => l.name),
      comments: i.comments,
      reactions: i.reactions?.total_count ?? null,
    },
  };
}

function repoToNormalized(r: SearchRepo): NormalizedObservation | null {
  if (!r.description) return null; // açıklamasız repo sinyal taşımaz
  return {
    source: "github",
    sourceId: `repo-${r.id}`,
    sourceUrl: r.html_url,
    title: `${r.full_name}: ${r.description}`,
    text: r.description,
    author: r.owner.login,
    observedAt: new Date(r.created_at),
    language: null,
    metadata: {
      kind: "repo-launch",
      repo: r.full_name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics,
      pushed_at: r.pushed_at,
    },
  };
}

export class GitHubAdapter implements Adapter {
  name = "github";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    const store = makeStateStore<GhCursor>(opts.dryRun, () => ({ repoCreatedSince: BACKFILL_SINCE }));
    const cursor = await store.load();
    let processed = 0;

    // 1) Issue'lar — şikâyet/gap sinyali
    for (const q of ISSUE_QUERIES) {
      console.log(`▶ GH issues: "${q}"`);
      for (let page = 1; page <= MAX_PAGES; page++) {
        if (opts.limit !== undefined && processed >= opts.limit) {
          await store.save(cursor);
          console.log(`oturum limiti (${opts.limit}) doldu.`);
          return;
        }
        const params = new URLSearchParams({
          q,
          sort: "created",
          order: "asc",
          per_page: "100",
          page: String(page),
        });
        const res = await ghFetch<SearchResponse<SearchIssue>>(`/search/issues?${params}`);
        if (!res || res.items.length === 0) break;

        for (const it of res.items) {
          const norm = issueToNormalized(it);
          if (!norm) continue;
          if (!opts.dryRun) {
            await upsertRaw({ source: "github", sourceId: `issue-${it.id}`, rawData: it });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
          }
          processed++;
          cursor.issueLastRun = it.created_at;
          opts.onProgress?.({ processed, totalFetched: processed });
        }
        if (page * 100 >= res.total_count || res.items.length < 100) break;
        await sleep(PAGE_DELAY_MS);
      }
      console.log(`  "${q}" tamam.`);
    }

    // 2) Yeni repo'lar — launch sinyali (imleç: repoCreatedSince ilerler)
    for (const topic of REPO_TOPICS) {
      console.log(`▶ GH repo'lar: topic:${topic} created:>${cursor.repoCreatedSince}`);
      for (let page = 1; page <= MAX_PAGES; page++) {
        if (opts.limit !== undefined && processed >= opts.limit) {
          await store.save(cursor);
          console.log(`oturum limiti (${opts.limit}) doldu.`);
          return;
        }
        const params = new URLSearchParams({
          q: `topic:${topic} created:>${cursor.repoCreatedSince}`,
          sort: "created",
          order: "asc",
          per_page: "100",
          page: String(page),
        });
        const res = await ghFetch<SearchResponse<SearchRepo>>(`/search/repositories?${params}`);
        if (!res || res.items.length === 0) break;

        for (const r of res.items) {
          const norm = repoToNormalized(r);
          if (!norm) continue;
          if (!opts.dryRun) {
            await upsertRaw({ source: "github", sourceId: `repo-${r.id}`, rawData: r });
            try {
              await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
            } catch (err) {
              if (!(err as Error).message.includes("duplicate key")) throw err;
            }
          }
          processed++;
          cursor.repoCreatedSince = r.created_at.slice(0, 10); // imleç ilerler
          opts.onProgress?.({ processed, totalFetched: processed });
        }
        if (page * 100 >= res.total_count || res.items.length < 100) break;
        await sleep(PAGE_DELAY_MS);
      }
      console.log(`  topic:${topic} tamam.`);
    }

    await store.save(cursor);
    console.log(`✔ GitHub oturumu bitti. processed=${processed}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
