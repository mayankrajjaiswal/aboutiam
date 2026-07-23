import { describe, expect, it } from 'vitest'
import { CHEAT_SHEETS, SHEET_CATEGORIES, type SheetDifficulty } from './cheatSheetsData'

describe('cheatSheetsData', () => {
  it('gives every cheat sheet a unique id', () => {
    const ids = CHEAT_SHEETS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses category values declared in SHEET_CATEGORIES', () => {
    CHEAT_SHEETS.forEach((s) => {
      expect(SHEET_CATEGORIES as readonly string[], `unexpected category "${s.category}" on sheet "${s.id}"`).toContain(s.category)
    })
  })

  it('covers all three difficulty tiers', () => {
    const difficulties = new Set(CHEAT_SHEETS.map((s) => s.difficulty))
    const expected: SheetDifficulty[] = ['Beginner', 'Intermediate', 'Advanced']
    expected.forEach((d) => {
      expect(difficulties.has(d), `expected at least one cheat sheet with difficulty "${d}"`).toBe(true)
    })
  })

  it('has at least one cheat sheet in every declared category', () => {
    const categories = new Set(CHEAT_SHEETS.map((s) => s.category))
    SHEET_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat), `expected at least one cheat sheet in category "${cat}"`).toBe(true)
    })
  })

  it('gives every cheat sheet a non-empty checks array (guards the percent-complete NaN bug)', () => {
    CHEAT_SHEETS.forEach((s) => {
      expect(s.checks.length, `sheet "${s.id}" has no checks`).toBeGreaterThan(0)
    })
  })

  it('gives every check a unique id within its sheet', () => {
    CHEAT_SHEETS.forEach((s) => {
      const checkIds = s.checks.map((c) => c.id)
      expect(new Set(checkIds).size, `duplicate check id within sheet "${s.id}"`).toBe(checkIds.length)
    })
  })
})
