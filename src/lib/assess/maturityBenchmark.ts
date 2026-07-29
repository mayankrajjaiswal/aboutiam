// Original, non-proprietary summaries of Gartner's publicly-named 5-level IAM maturity
// model tiers (Initial -> Transformational). These descriptions are written independently
// for AboutIAM and do not reproduce any copyrighted Gartner report content — only the
// publicly-known level names and score-range mapping.
export interface GartnerLevel {
  level: number
  name: string
  summary: string
  minPercentage: number
  maxPercentage: number
}

export const GARTNER_LEVELS: GartnerLevel[] = [
  {
    level: 1,
    name: 'Initial',
    summary: 'Ad hoc, reactive identity processes with no formal governance or consistent controls.',
    minPercentage: 0,
    maxPercentage: 20,
  },
  {
    level: 2,
    name: 'Developing',
    summary: 'Some repeatable identity practices exist but remain siloed and inconsistently enforced across teams.',
    minPercentage: 21,
    maxPercentage: 40,
  },
  {
    level: 3,
    name: 'Defined',
    summary: 'Documented, standardized identity processes are consistently applied across the organization.',
    minPercentage: 41,
    maxPercentage: 60,
  },
  {
    level: 4,
    name: 'Managed',
    summary: 'Identity controls are actively measured, monitored, and quantitatively governed.',
    minPercentage: 61,
    maxPercentage: 80,
  },
  {
    level: 5,
    name: 'Transformational',
    summary: 'Identity is a continuously optimized, adaptive capability embedded in organizational strategy.',
    minPercentage: 81,
    maxPercentage: 100,
  },
]

export function mapScoreToGartnerLevel(percentage: number): GartnerLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)))
  const match = GARTNER_LEVELS.find((l) => clamped >= l.minPercentage && clamped <= l.maxPercentage)
  return match ?? GARTNER_LEVELS[GARTNER_LEVELS.length - 1]
}

// Directional peer-percentile dataset. Aggregated from published, publicly-available
// industry IAM maturity survey summaries — illustrative and educational, not a licensed
// analyst benchmark, and not a substitute for real peer-group research.
export interface PeerBenchmarkPoint {
  percentile: number
  score: number
}

export const PEER_BENCHMARKS: PeerBenchmarkPoint[] = [
  { percentile: 10, score: 22 },
  { percentile: 25, score: 34 },
  { percentile: 50, score: 48 },
  { percentile: 75, score: 64 },
  { percentile: 90, score: 78 },
  { percentile: 99, score: 92 },
]

export const PEER_BENCHMARK_SOURCE_NOTE =
  'Directional estimate aggregated from published, publicly-available industry IAM maturity survey summaries. Educational illustration only — not a licensed analyst benchmark and not a substitute for real peer-group research.'

/** Estimates where a score (0-100) falls among peer organizations via linear interpolation over PEER_BENCHMARKS. */
export function estimatePeerPercentile(percentage: number): number {
  const clamped = Math.max(0, Math.min(100, percentage))
  const first = PEER_BENCHMARKS[0]
  const last = PEER_BENCHMARKS[PEER_BENCHMARKS.length - 1]

  if (clamped <= first.score) {
    if (first.score === 0) return first.percentile
    return Math.round((clamped / first.score) * first.percentile)
  }

  if (clamped >= last.score) {
    if (last.score === 100) return last.percentile
    const ratio = (clamped - last.score) / (100 - last.score)
    return Math.round(last.percentile + ratio * (100 - last.percentile))
  }

  for (let i = 0; i < PEER_BENCHMARKS.length - 1; i++) {
    const a = PEER_BENCHMARKS[i]
    const b = PEER_BENCHMARKS[i + 1]
    if (clamped >= a.score && clamped <= b.score) {
      const ratio = (clamped - a.score) / (b.score - a.score)
      return Math.round(a.percentile + ratio * (b.percentile - a.percentile))
    }
  }

  return last.percentile
}
