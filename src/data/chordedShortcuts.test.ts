import { describe, it, expect } from 'vitest'
import { CHORDED_SHORTCUTS } from './chordedShortcuts'
import { ROUTE_META } from '../routeMeta'

const knownPaths = new Set(ROUTE_META.map((r) => r.path))

describe('CHORDED_SHORTCUTS', () => {
  it('every chord is a two-key "g <letter>" sequence', () => {
    for (const s of CHORDED_SHORTCUTS) {
      expect(s.chord).toMatch(/^g [a-z]$/)
    }
  })

  it('has no duplicate chords', () => {
    const chords = CHORDED_SHORTCUTS.map((s) => s.chord)
    expect(new Set(chords).size).toBe(chords.length)
  })

  it("every shortcut's path resolves to a real, currently-registered route", () => {
    for (const s of CHORDED_SHORTCUTS) {
      expect(knownPaths.has(s.path)).toBe(true)
    }
  })
})
