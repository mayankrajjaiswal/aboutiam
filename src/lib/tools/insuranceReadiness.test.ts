import { describe, it, expect } from 'vitest'
import {
  computeInsuranceReadiness,
  INSURANCE_CONTROLS,
  INSURANCE_DENIAL_CASE_STUDIES,
  MAX_INSURANCE_READINESS_SCORE,
  PREMIUM_IMPACT_BANDS,
} from './insuranceReadiness'

const ALL_FALSE = Object.fromEntries(INSURANCE_CONTROLS.map((c) => [c.id, false]))
const ALL_TRUE = Object.fromEntries(INSURANCE_CONTROLS.map((c) => [c.id, true]))

describe('computeInsuranceReadiness', () => {
  it('scores 0 when no controls are in place', () => {
    const result = computeInsuranceReadiness(ALL_FALSE)
    expect(result.score).toBe(0)
    expect(result.percent).toBe(0)
    expect(result.gaps).toHaveLength(INSURANCE_CONTROLS.length)
  })

  it('scores the max when every control is in place, with zero gaps', () => {
    const result = computeInsuranceReadiness(ALL_TRUE)
    expect(result.score).toBe(MAX_INSURANCE_READINESS_SCORE)
    expect(result.percent).toBe(100)
    expect(result.gaps).toHaveLength(0)
  })

  it('is monotonic: enabling any single missing control never decreases the score', () => {
    for (const control of INSURANCE_CONTROLS) {
      const before = computeInsuranceReadiness(ALL_FALSE)
      const after = computeInsuranceReadiness({ ...ALL_FALSE, [control.id]: true })
      expect(after.score).toBeGreaterThanOrEqual(before.score)
      expect(after.score).toBe(before.score + control.points)
    }
  })

  it('is monotonic across every control pairwise: adding a control on top of another never decreases the score', () => {
    for (const a of INSURANCE_CONTROLS) {
      for (const b of INSURANCE_CONTROLS) {
        if (a.id === b.id) continue
        const withA = computeInsuranceReadiness({ ...ALL_FALSE, [a.id]: true })
        const withBoth = computeInsuranceReadiness({ ...ALL_FALSE, [a.id]: true, [b.id]: true })
        expect(withBoth.score).toBeGreaterThanOrEqual(withA.score)
      }
    }
  })

  it('never produces NaN or a score outside [0, maxScore]', () => {
    const result = computeInsuranceReadiness({})
    expect(Number.isNaN(result.score)).toBe(false)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(result.maxScore)
  })

  it('always resolves to exactly one premium impact band', () => {
    const result = computeInsuranceReadiness(ALL_FALSE)
    expect(PREMIUM_IMPACT_BANDS).toContain(result.premiumImpact)
  })

  it('a perfect score resolves to the most favorable band', () => {
    const result = computeInsuranceReadiness(ALL_TRUE)
    expect(result.premiumImpact).toBe(PREMIUM_IMPACT_BANDS[0])
  })
})

describe('INSURANCE_DENIAL_CASE_STUDIES', () => {
  it('includes at least 2 case studies', () => {
    expect(INSURANCE_DENIAL_CASE_STUDIES.length).toBeGreaterThanOrEqual(2)
  })

  it('every case study has a real, well-formed https source link and a verification date', () => {
    for (const study of INSURANCE_DENIAL_CASE_STUDIES) {
      expect(study.sourceUrl).toMatch(/^https:\/\//)
      expect(study.caseName.length).toBeGreaterThan(0)
      expect(study.citation.length).toBeGreaterThan(0)
      expect(study.summary.length).toBeGreaterThan(0)
      expect(study.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('has no duplicate case study ids', () => {
    const ids = INSURANCE_DENIAL_CASE_STUDIES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
