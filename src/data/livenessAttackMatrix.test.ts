import { describe, it, expect } from 'vitest'
import { LIVENESS_ATTACKS, LIVENESS_DEFENSES, LIVENESS_ATTACK_MATRIX, getLivenessOutcome } from './livenessAttackMatrix'

describe('LIVENESS_ATTACK_MATRIX', () => {
  it('has exactly one outcome per attack x defense combination', () => {
    expect(LIVENESS_ATTACK_MATRIX).toHaveLength(LIVENESS_ATTACKS.length * LIVENESS_DEFENSES.length)
    const seen = new Set<string>()
    for (const outcome of LIVENESS_ATTACK_MATRIX) {
      const key = `${outcome.attack}::${outcome.defense}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('every attack has at least one defense that stops it and at least one that does not', () => {
    for (const attack of LIVENESS_ATTACKS) {
      const outcomes = LIVENESS_ATTACK_MATRIX.filter((o) => o.attack === attack.id)
      expect(outcomes.some((o) => o.stopped)).toBe(true)
      expect(outcomes.some((o) => !o.stopped)).toBe(true)
    }
  })

  it('every outcome has a non-empty explanation', () => {
    for (const outcome of LIVENESS_ATTACK_MATRIX) {
      expect(outcome.explanation.trim().length).toBeGreaterThan(0)
    }
  })

  it('full PAD scoring defeats every attack (it is the state-of-the-art defense)', () => {
    const fullPadOutcomes = LIVENESS_ATTACK_MATRIX.filter((o) => o.defense === 'full-pad')
    expect(fullPadOutcomes.every((o) => o.stopped)).toBe(true)
  })

  it('a single static photo check defeats no attack (it has no liveness signal at all)', () => {
    const staticPhotoOutcomes = LIVENESS_ATTACK_MATRIX.filter((o) => o.defense === 'static-photo')
    expect(staticPhotoOutcomes.every((o) => !o.stopped)).toBe(true)
  })
})

describe('getLivenessOutcome', () => {
  it('returns the matching outcome for a known pair', () => {
    const outcome = getLivenessOutcome('replay', 'flash-challenge')
    expect(outcome?.stopped).toBe(true)
  })

  it('the flash-challenge defense stops replay but not camera-feed injection (the doc-cited example)', () => {
    expect(getLivenessOutcome('replay', 'flash-challenge')?.stopped).toBe(true)
    expect(getLivenessOutcome('camera-injection', 'flash-challenge')?.stopped).toBe(false)
  })
})
