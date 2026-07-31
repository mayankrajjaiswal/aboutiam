import { describe, it, expect } from 'vitest'
import { computeRiskScore, computeRiskTier, scoreRiskEntry, STARTER_RISK_REGISTER, buildRiskRegisterMarkdown } from './riskRegisterScoring'

describe('computeRiskTier boundaries', () => {
  it('maps every impact x likelihood combination to a consistent tier', () => {
    const expectations: [number, string][] = [
      [1, 'Low'], [4, 'Low'],
      [5, 'Medium'], [9, 'Medium'],
      [10, 'High'], [14, 'High'],
      [15, 'Critical'], [25, 'Critical'],
    ]
    for (const [score, tier] of expectations) {
      expect(computeRiskTier(score)).toBe(tier)
    }
  })

  it('is monotonic — a higher score never produces a lower tier', () => {
    const tierRank: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 }
    let prevRank = -1
    for (let score = 1; score <= 25; score++) {
      const rank = tierRank[computeRiskTier(score)]
      expect(rank).toBeGreaterThanOrEqual(prevRank)
      prevRank = rank
    }
  })
})

describe('scoreRiskEntry', () => {
  it('computes score as impact * likelihood', () => {
    expect(computeRiskScore(3, 4)).toBe(12)
    expect(scoreRiskEntry({ impact: 3, likelihood: 4 })).toEqual({ score: 12, tier: 'High' })
  })
})

describe('STARTER_RISK_REGISTER', () => {
  it('every starter risk has a non-empty mitigation and owner', () => {
    for (const entry of STARTER_RISK_REGISTER) {
      expect(entry.mitigation.length).toBeGreaterThan(0)
      expect(entry.owner.length).toBeGreaterThan(0)
    }
  })

  it('has unique ids', () => {
    const ids = STARTER_RISK_REGISTER.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('buildRiskRegisterMarkdown', () => {
  it('renders one table row per entry', () => {
    const md = buildRiskRegisterMarkdown(STARTER_RISK_REGISTER)
    for (const entry of STARTER_RISK_REGISTER) {
      expect(md).toContain(entry.risk)
    }
  })
})
