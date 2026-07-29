import { describe, it, expect } from 'vitest'
import {
  GARTNER_LEVELS,
  mapScoreToGartnerLevel,
  estimatePeerPercentile,
  PEER_BENCHMARKS,
} from './maturityBenchmark'

describe('GARTNER_LEVELS', () => {
  it('has 5 levels numbered 1 through 5', () => {
    expect(GARTNER_LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4, 5])
  })

  it('every level has a non-empty name and summary', () => {
    for (const level of GARTNER_LEVELS) {
      expect(level.name.length).toBeGreaterThan(0)
      expect(level.summary.length).toBeGreaterThan(0)
    }
  })
})

describe('mapScoreToGartnerLevel', () => {
  it('maps every integer score from 0 to 100 to exactly one level with no gaps or overlaps', () => {
    for (let score = 0; score <= 100; score++) {
      const matches = GARTNER_LEVELS.filter((l) => score >= l.minPercentage && score <= l.maxPercentage)
      expect(matches.length).toBe(1)
    }
  })

  it('resolves boundary scores predictably', () => {
    expect(mapScoreToGartnerLevel(0).level).toBe(1)
    expect(mapScoreToGartnerLevel(20).level).toBe(1)
    expect(mapScoreToGartnerLevel(21).level).toBe(2)
    expect(mapScoreToGartnerLevel(40).level).toBe(2)
    expect(mapScoreToGartnerLevel(41).level).toBe(3)
    expect(mapScoreToGartnerLevel(60).level).toBe(3)
    expect(mapScoreToGartnerLevel(61).level).toBe(4)
    expect(mapScoreToGartnerLevel(80).level).toBe(4)
    expect(mapScoreToGartnerLevel(81).level).toBe(5)
    expect(mapScoreToGartnerLevel(100).level).toBe(5)
  })

  it('clamps out-of-range inputs instead of throwing', () => {
    expect(mapScoreToGartnerLevel(-10).level).toBe(1)
    expect(mapScoreToGartnerLevel(150).level).toBe(5)
  })

  it('rounds fractional percentages before mapping', () => {
    expect(mapScoreToGartnerLevel(20.4).level).toBe(1)
    expect(mapScoreToGartnerLevel(20.6).level).toBe(2)
  })
})

describe('estimatePeerPercentile', () => {
  it('returns the exact anchor percentile at each benchmark score', () => {
    for (const point of PEER_BENCHMARKS) {
      expect(estimatePeerPercentile(point.score)).toBe(point.percentile)
    }
  })

  it('is monotonically non-decreasing as score increases', () => {
    let prev = estimatePeerPercentile(0)
    for (let score = 1; score <= 100; score++) {
      const current = estimatePeerPercentile(score)
      expect(current).toBeGreaterThanOrEqual(prev)
      prev = current
    }
  })

  it('returns 0 at a score of 0 and 100 at a score of 100', () => {
    expect(estimatePeerPercentile(0)).toBe(0)
    expect(estimatePeerPercentile(100)).toBe(100)
  })

  it('clamps out-of-range inputs instead of throwing', () => {
    expect(estimatePeerPercentile(-20)).toBe(0)
    expect(estimatePeerPercentile(200)).toBe(100)
  })
})
