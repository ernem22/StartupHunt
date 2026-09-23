// Ortak tipler — plan.md v3.1 FAZ 2/3/4

/** Kaynak ham verisi — raw_observations'a yazılır (değiştirilmeden). */
export interface RawObservation {
  source: string;
  sourceId: string;
  rawData: unknown;
}

/** Normalize edilmiş observation — plan FAZ 4 şeması. */
export interface NormalizedObservation {
  source: string;
  sourceId: string;
  sourceUrl: string;
  title: string | null;
  text: string;
  author: string | null;
  observedAt: Date | null;
  language: string | null;
  metadata: Record<string, unknown>;
}

/** Adapter kontratı: her kaynak bunu uygular. */
export interface Adapter {
  name: string;
  /**
   * Kaynaktan observation çeker. `since` verilirse o zamandan sonrası
   * (catch-up semantiği — plan v3.1 "cron değil resume").
   */
  collect(since: Date | null, opts: CollectOptions): Promise<void>;
}

export interface CollectOptions {
  /** Test: fetch yapar ama DB'ye yazmaz. */
  dryRun: boolean;
  /** Bu oturumda en fazla kaç observation işlenir (backfill disiplini). */
  limit?: number;
  onProgress?: (info: { processed: number; totalFetched: number }) => void;
}
