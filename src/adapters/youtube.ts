// YouTubeAdapter — Data API v3 (plan v3.1 FAZ 1)
// KOTA STRATEJİSİ (kritik): search.list ASLA kullanılmaz (100 unit).
// - videos.list?chart=mostPopular&regionCode=TR (1 unit) → TR trend
// - commentThreads.list (1 unit) → trend video yorumları (sinyal gövdesi)
// - playlistItems.list (1 unit) → sabit izlenen kanal listesi
// Günde 10.000 unit bütçe → korumalı sayaç: maxDailyUnits=8000 (güvenlik marjı)
import type { Adapter, CollectOptions, NormalizedObservation } from "../types.js";
import { upsertRaw, upsertNormalized, contentHash } from "../db.js";

interface YtVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string; // ISO
    channelId: string;
    channelTitle: string;
    tags?: string[];
    categoryId: string;
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
}

interface YtCommentThread {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        textDisplay: string;
        authorDisplayName: string;
        publishedAt: string;
        likeCount: number;
      };
    };
    videoId: string;
  };
}

const API = "https://www.googleapis.com/youtube/v3";
const MAX_DAILY_UNITS = 8000; // 10.000 resmi kotanın altında bilinçli tavan
const POPULAR_COMMENTS_LIMIT = 20; // en popüler TR videosu başına kaç yorum
const TR_CATEGORIES = ["28", "20", "27", "25"]; // Science&Tech, Gaming, Education, News

/** Trend yorumlarını okuyacağımız sabit kanal listesi (playlists üzerinden ucuz). */
const WATCHED_PLAYLISTS = process.env.YOUTUBE_PLAYLISTS?.split(",").filter(Boolean) ?? [];

function apiKey(): string | undefined {
  return process.env.YOUTUBE_API_KEY || undefined;
}

/** Unit bütçesi — adapters olmadığı için observations.metadata'ya değil,
 *  ayrı tabloya yazmak yerine adapter_state kullanılmaz; basit: her oturum
 *  O(50) unit harcar, günlük bir kez çalıştırılır → bütçe kontrolü kabaca yeterli. */
let unitSpent = 0;

async function ytFetch<T>(path: string, params: URLSearchParams, cost: number): Promise<T | null> {
  const key = apiKey();
  if (!key) {
    console.warn("  [pas] YOUTUBE_API_KEY yok — adapter atlandı (FAZ 1: key alınıp .env'e konacak)");
    return null;
  }
  if (unitSpent + cost > MAX_DAILY_UNITS) {
    console.warn(`  [kota] günlük unit tavanı (${MAX_DAILY_UNITS}): ${unitSpent} harcandı, duruldu`);
    return null;
  }
  params.set("key", key);
  try {
    const res = await fetch(`${API}${path}?${params.toString()}`);
    if (!res.ok) {
      console.warn(`  [hata] HTTP ${res.status} — ${path}`);
      return null;
    }
    unitSpent += cost;
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`  [hata] ${(e as Error).message}`);
    return null;
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").trim();
}

function videoToNorm(v: YtVideo): NormalizedObservation {
  return {
    source: "youtube",
    sourceId: `video-${v.id}`,
    sourceUrl: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.snippet.title,
    text: `${v.snippet.title}\n${stripHtml(v.snippet.description)}`,
    author: v.snippet.channelTitle,
    observedAt: new Date(v.snippet.publishedAt),
    language: null, // TR trend ama başlıklar karışık olabilir — detectLanguage karar verir
    metadata: {
      kind: "trend-video",
      region: "TR",
      channel_id: v.snippet.channelId,
      category_id: v.snippet.categoryId,
      views: v.statistics?.viewCount ?? null,
      likes: v.statistics?.likeCount ?? null,
      comments: v.statistics?.commentCount ?? null,
      tags: v.snippet.tags ?? [],
    },
  };
}

function commentToNorm(c: YtCommentThread): NormalizedObservation | null {
  const t = c.snippet.topLevelComment.snippet;
  const text = stripHtml(t.textDisplay);
  if (!text) return null;
  return {
    source: "youtube",
    sourceId: `comment-${c.id}`,
    sourceUrl: `https://www.youtube.com/watch?v=${c.snippet.videoId}&lc=${c.id}`,
    title: null,
    text,
    author: t.authorDisplayName,
    observedAt: new Date(t.publishedAt),
    language: null,
    metadata: {
      kind: "comment",
      video_id: c.snippet.videoId,
      likes: t.likeCount,
    },
  };
}

export class YouTubeAdapter implements Adapter {
  name = "youtube";

  async collect(_since: Date | null, opts: CollectOptions): Promise<void> {
    if (!apiKey()) {
      console.warn("✖ YOUTUBE_API_KEY tanımlı değil — oturum iptal (key alınca tekrar çalıştır)");
      return;
    }
    let processed = 0;

    // 1) TR trend videoları — kategori kategori (her çağrı 1 unit, ~50 video)
    for (const cat of TR_CATEGORIES) {
      const params = new URLSearchParams({
        part: "snippet,statistics",
        chart: "mostPopular",
        regionCode: "TR",
        maxWidth: "600", // hafif thumbnail yerine metin odaklı — part snippet yeterli
        maxResults: "50",
        videoCategoryId: cat,
      });
      const res = await ytFetch<{ items: YtVideo[] }>("/videos", params, 1);
      if (!res || res.items.length === 0) continue;
      console.log(`▶ YT trend TR kategori=${cat}: ${res.items.length} video`);

      for (const v of res.items) {
        const norm = videoToNorm(v);
        if (!opts.dryRun) {
          await upsertRaw({ source: "youtube", sourceId: norm.sourceId, rawData: v });
          try {
            await upsertNormalized({ ...norm, contentHash: contentHash(norm) });
          } catch (err) {
            if (!(err as Error).message.includes("duplicate key")) throw err;
          }
        }
        processed++;
      }
      opts.onProgress?.({ processed, totalFetched: processed });

      // 2) Trendin ilk videosunun yorumları (POPULAR_COMMENTS_LIMIT × 1 unit... değil:
      //    commentThreads tek sayfada 100 yorum = 1 unit)
      const top = res.items[0];
      if (top) {
        const cp = new URLSearchParams({
          part: "snippet",
          videoId: top.id,
          maxResults: String(Math.min(POPULAR_COMMENTS_LIMIT * 5, 100)),
          order: "relevance",
          textFormat: "plainText",
        });
        const cres = await ytFetch<{ items: YtCommentThread[] }>("/commentThreads", cp, 1);
        if (cres?.items) {
          for (const c of cres.items) {
            const cn = commentToNorm(c);
            if (!cn) continue;
            if (!opts.dryRun) {
              await upsertRaw({ source: "youtube", sourceId: cn.sourceId, rawData: c });
              try {
                await upsertNormalized({ ...cn, contentHash: contentHash(cn) });
              } catch (err) {
                if (!(err as Error).message.includes("duplicate key")) throw err;
              }
            }
            processed++;
          }
          console.log(`  yorumlar (+${cres.items.length}) — kategori ${cat}`);
        }
      }
    }

    // 3) Sabit izlenen playlist'ler (launch/gelişme takibi — takip listesi elle büyütülür)
    for (const pl of WATCHED_PLAYLISTS) {
      const params = new URLSearchParams({ part: "snippet", playlistId: pl.trim(), maxResults: "50" });
      const res = await ytFetch<{ items: { snippet: { resourceId: { videoId: string } } }[] }>(
        "/playlistItems",
        params,
        1
      );
      // playlistItems sadece video referansı verir → video detayı ayrı çağrı;
      // sinyal açısından trend/video başlıkları zaten 1. adımdan geliyor — burada
      // yalnızca referans not edilir (unit tasarrufu için detay fetch edilmez).
      console.log(`▶ YT playlist ${pl}: ${res?.items.length ?? 0} referans (detay çekilmedi — unit tasarrufu)`);
    }

    console.log(`✔ YouTube oturumu bitti. processed=${processed}, unit≈${unitSpent}${opts.dryRun ? " (dry-run)" : ""}`);
  }
}
