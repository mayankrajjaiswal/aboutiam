import { describe, it, expect } from 'vitest'
import {
  SPATIAL_IDENTITY_RISKS,
  SPATIAL_IDENTITY_DEFENSES,
  SPATIAL_IDENTITY_MATRIX,
  getSpatialIdentityOutcome,
} from './spatialIdentityMatrix'

describe('spatialIdentityMatrix', () => {
  it('has one outcome per risk×defense combination, no duplicates', () => {
    expect(SPATIAL_IDENTITY_MATRIX.length).toBe(SPATIAL_IDENTITY_RISKS.length * SPATIAL_IDENTITY_DEFENSES.length)

    const keys = new Set(SPATIAL_IDENTITY_MATRIX.map((o) => `${o.risk}::${o.defense}`))
    expect(keys.size).toBe(SPATIAL_IDENTITY_MATRIX.length)
  })

  it('covers every risk×defense pair', () => {
    for (const risk of SPATIAL_IDENTITY_RISKS) {
      for (const defense of SPATIAL_IDENTITY_DEFENSES) {
        expect(getSpatialIdentityOutcome(risk.id, defense.id)).toBeDefined()
      }
    }
  })

  it('every risk has at least one stopping and one non-stopping defense', () => {
    for (const risk of SPATIAL_IDENTITY_RISKS) {
      const outcomes = SPATIAL_IDENTITY_MATRIX.filter((o) => o.risk === risk.id)
      expect(outcomes.some((o) => o.stopped)).toBe(true)
      expect(outcomes.some((o) => !o.stopped)).toBe(true)
    }
  })

  it('every explanation is non-empty', () => {
    for (const outcome of SPATIAL_IDENTITY_MATRIX) {
      expect(outcome.explanation.trim().length).toBeGreaterThan(0)
    }
  })

  it('"none" stops nothing and "challenge-response" stops everything', () => {
    const noneOutcomes = SPATIAL_IDENTITY_MATRIX.filter((o) => o.defense === 'none')
    expect(noneOutcomes.every((o) => !o.stopped)).toBe(true)

    const challengeOutcomes = SPATIAL_IDENTITY_MATRIX.filter((o) => o.defense === 'challenge-response')
    expect(challengeOutcomes.every((o) => o.stopped)).toBe(true)
  })

  it('wallet-attestation alone never stops a risk (proves a credential claim, not physical presence)', () => {
    const walletOutcomes = SPATIAL_IDENTITY_MATRIX.filter((o) => o.defense === 'wallet-attestation')
    expect(walletOutcomes.every((o) => !o.stopped)).toBe(true)
  })

  it('continuous-behavioral is defeated specifically by the motion-capture replay bot (the doc-cited contrast)', () => {
    const outcome = getSpatialIdentityOutcome('motion-capture-replay-bot', 'continuous-behavioral')
    expect(outcome?.stopped).toBe(false)

    const handoffOutcome = getSpatialIdentityOutcome('shared-headset-handoff', 'continuous-behavioral')
    expect(handoffOutcome?.stopped).toBe(true)
  })

  it('risk and defense ids are unique', () => {
    expect(new Set(SPATIAL_IDENTITY_RISKS.map((r) => r.id)).size).toBe(SPATIAL_IDENTITY_RISKS.length)
    expect(new Set(SPATIAL_IDENTITY_DEFENSES.map((d) => d.id)).size).toBe(SPATIAL_IDENTITY_DEFENSES.length)
  })
})
