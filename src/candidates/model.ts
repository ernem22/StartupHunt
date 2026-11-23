/** One numeric observation with the link that proves it. */
export interface DataPoint {
  source: string;
  metric: string;
  value: number;
  /** Observation date, YYYY-MM-DD (UTC). */
  date: string;
  url: string;
}

/** A product as one producer saw it, before merging with other sources. */
export interface RawCandidate {
  name: string;
  /** Canonical product key: `domain`, `apple:<id>`, `play:<package>`, `github:<owner/repo>`, `producthunt:<slug>`, `trustmrr:<slug>`. */
  key: string;
  url: string;
  source: string;
  dataPoints: DataPoint[];
}

/** A product merged across sources by its canonical key. */
export interface Candidate {
  key: string;
  name: string;
  url: string;
  sources: string[];
  dataPoints: DataPoint[];
}

export interface ProducerError {
  source: string;
  message: string;
}
