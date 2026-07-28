import { describe, it, expect } from 'vitest'
import { simulateYear, computeOutcomeScore, type RolloutAllocation } from './passkeyRolloutModel'

const BALANCED: RolloutAllocation = {
  platformSdk: 25,
  helpDeskTraining: 25,
  legacyFallbackSunset: 25,
  recoveryInvestment: 25
}

const ALL_IN_SDK: RolloutAllocation = {
  platformSdk: 100,
  helpDeskTraining: 0,
  legacyFallbackSunset: 0,
  recoveryInvestment: 0
}

const ALL_IN_RECOVERY: RolloutAllocation = {
  platformSdk: 0,
  helpDeskTraining: 0,
  legacyFallbackSunset: 0,
  recoveryInvestment: 100
}

describe('passkeyRolloutModel', () => {
  it('a balanced allocation outperforms an all-in-one-category allocation', () => {
    const balancedFinal = simulateYear(BALANCED).at(-1)!
    const allInFinal = simulateYear(ALL_IN_SDK).at(-1)!

    expect(computeOutcomeScore(balancedFinal)).toBeGreaterThan(computeOutcomeScore(allInFinal))
  })

  it('a balanced allocation outperforms dumping the entire budget into recovery alone', () => {
    const balancedFinal = simulateYear(BALANCED).at(-1)!
    const allInFinal = simulateYear(ALL_IN_RECOVERY).at(-1)!

    expect(computeOutcomeScore(balancedFinal)).toBeGreaterThan(computeOutcomeScore(allInFinal))
  })

  it('a zero-recovery-investment allocation always trips the support escalation penalty, regardless of the rest of the allocation', () => {
    const zeroRecoveryVariants: RolloutAllocation[] = [
      { platformSdk: 100, helpDeskTraining: 0, legacyFallbackSunset: 0, recoveryInvestment: 0 },
      { platformSdk: 40, helpDeskTraining: 30, legacyFallbackSunset: 30, recoveryInvestment: 0 },
      { platformSdk: 0, helpDeskTraining: 0, legacyFallbackSunset: 100, recoveryInvestment: 0 }
    ]

    for (const allocation of zeroRecoveryVariants) {
      const outcomes = simulateYear(allocation)
      for (const outcome of outcomes) {
        expect(outcome.supportEscalation).toBe(true)
      }
    }
  })

  it('never trips the support escalation penalty when recovery investment is non-zero', () => {
    const nonZeroRecovery: RolloutAllocation = { platformSdk: 90, helpDeskTraining: 5, legacyFallbackSunset: 5, recoveryInvestment: 1 }
    const outcomes = simulateYear(nonZeroRecovery)
    for (const outcome of outcomes) {
      expect(outcome.supportEscalation).toBe(false)
    }
  })

  it('adoption never exceeds the industry benchmark ceiling', () => {
    const outcomes = simulateYear({ platformSdk: 100, helpDeskTraining: 100, legacyFallbackSunset: 100, recoveryInvestment: 100 })
    for (const outcome of outcomes) {
      expect(outcome.adoptionPercent).toBeLessThanOrEqual(93)
    }
  })

  it('adoption is monotonically non-decreasing across quarters for a fixed allocation', () => {
    const outcomes = simulateYear(BALANCED)
    for (let i = 1; i < outcomes.length; i++) {
      expect(outcomes[i].adoptionPercent).toBeGreaterThanOrEqual(outcomes[i - 1].adoptionPercent)
    }
  })

  it('a zero-investment-everywhere allocation produces zero adoption growth', () => {
    const outcomes = simulateYear({ platformSdk: 0, helpDeskTraining: 0, legacyFallbackSunset: 0, recoveryInvestment: 0 })
    for (const outcome of outcomes) {
      expect(outcome.adoptionPercent).toBe(0)
    }
  })

  it('produces exactly 4 quarterly outcomes for a year', () => {
    expect(simulateYear(BALANCED).length).toBe(4)
  })
})
