import { describe, it, expect } from 'vitest'
import { DAILY_PUZZLE_BANK } from './dailyPuzzleBank'

describe('DAILY_PUZZLE_BANK', () => {
  it('has unique puzzle ids', () => {
    const ids = DAILY_PUZZLE_BANK.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has no colon characters in any id (reserved as the share-code separator)', () => {
    for (const p of DAILY_PUZZLE_BANK) {
      expect(p.id).not.toContain(':')
    }
  })

  it('covers all 3 puzzle formats', () => {
    const formats = new Set(DAILY_PUZZLE_BANK.map((p) => p.format))
    expect(formats).toEqual(new Set(['jwt-vuln', 'saml-tamper', 'protocol-guess']))
  })

  it('every puzzle has a valid correctIndex within its choices array', () => {
    for (const p of DAILY_PUZZLE_BANK) {
      expect(p.correctIndex).toBeGreaterThanOrEqual(0)
      expect(p.correctIndex).toBeLessThan(p.choices.length)
    }
  })

  it('every puzzle has at least 2 choices and a non-empty explanation', () => {
    for (const p of DAILY_PUZZLE_BANK) {
      expect(p.choices.length).toBeGreaterThanOrEqual(2)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })

  it('every protocol-guess puzzle has at least 2 progressive clues', () => {
    for (const p of DAILY_PUZZLE_BANK.filter((x) => x.format === 'protocol-guess')) {
      expect(p.clues?.length ?? 0).toBeGreaterThanOrEqual(2)
    }
  })

  it('has at least 30 entries to sustain a non-trivial non-repeat cycle', () => {
    expect(DAILY_PUZZLE_BANK.length).toBeGreaterThanOrEqual(30)
  })
})
