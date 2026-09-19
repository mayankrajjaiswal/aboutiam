import { describe, expect, it } from 'vitest'
import { NEXT_GEN_THEMES, getThemeById } from './nextGenThemes'

describe('nextGenThemes data integrity', () => {
  it('has exactly 5 themes with no duplicate ids', () => {
    expect(NEXT_GEN_THEMES).toHaveLength(5)
    const ids = NEXT_GEN_THEMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every theme has a non-empty thesis, whyNow, analogy, and expert paragraph', () => {
    for (const theme of NEXT_GEN_THEMES) {
      expect(theme.thesis.length).toBeGreaterThan(20)
      expect(theme.whyNow.length).toBeGreaterThan(20)
      expect(theme.analogy.length).toBeGreaterThan(20)
      expect(theme.expert.length).toBeGreaterThan(20)
    }
  })

  it('every theme route starts with /next-gen/', () => {
    for (const theme of NEXT_GEN_THEMES) {
      expect(theme.route.startsWith('/next-gen/')).toBe(true)
    }
  })

  it('every theme has at least one related lab', () => {
    for (const theme of NEXT_GEN_THEMES) {
      expect(theme.relatedLabs.length).toBeGreaterThan(0)
    }
  })

  it('every theme has exactly 4 maturity bands, levels 1-4 in order', () => {
    for (const theme of NEXT_GEN_THEMES) {
      expect(theme.maturityBands).toHaveLength(4)
      expect(theme.maturityBands.map((b) => b.level)).toEqual([1, 2, 3, 4])
      for (const band of theme.maturityBands) {
        expect(band.label.length).toBeGreaterThan(0)
        expect(band.description.length).toBeGreaterThan(0)
        expect(band.nextStep.length).toBeGreaterThan(0)
      }
    }
  })

  it('every relatedLabs/relatedTools path looks like a valid route path', () => {
    for (const theme of NEXT_GEN_THEMES) {
      for (const path of [...theme.relatedLabs, ...theme.relatedTools]) {
        expect(path.startsWith('/playground/') || path.startsWith('/tools/')).toBe(true)
      }
    }
  })
})

describe('getThemeById', () => {
  it('returns the matching theme', () => {
    const theme = getThemeById('agentic-identity')
    expect(theme?.title).toBe('Agentic Identity & Governance')
  })

  it('returns undefined for an unknown id', () => {
    // @ts-expect-error intentionally invalid id for the runtime guard
    expect(getThemeById('not-a-theme')).toBeUndefined()
  })
})
