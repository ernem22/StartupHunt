// Config — .env + varsayılanlar
import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v === undefined || v === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing env: ${name} (cp .env.example .env)`);
  }
  return v;
}

export const config = {
  databaseUrl: required("DATABASE_URL", "postgresql://startuphunt:startuphunt@localhost:5432/startuphunt"),
  arcticShiftBaseUrl: required("ARCTIC_SHIFT_URL", "https://arctic-shift.photon-reddit.com"),
  // toplama disiplini: Arctic Shift "birkaç istek/sn" istiyor; nazik kal
  arcticShift: {
    pageDelayMs: 1000,
    maxRetries: 3,
    retryBackoffMs: 5000,
  },
};

export const SUBREDDITS = [
  "SaaS",
  "startups",
  "Entrepreneur",
  "indiehackers",
  "webdev",
  "ExperiencedDevs",
  "nocode",
  "ProductManagement",
  "smallbusiness",
  "SideProject",
] as const;

/** Backfill tabanı — v3.2 karar: orta-yakın güncellik, son 18 ay.
 * Daha derin geçmiş yalnızca "olasılık destek sorgusu" ile geçici toplanır (bkz. plan.md PILOT). */
export const BACKFILL_SINCE = new Date(
  Date.now() - 18 * 30 * 24 * 60 * 60 * 1000,
);
