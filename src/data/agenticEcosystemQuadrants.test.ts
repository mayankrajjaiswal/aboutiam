import { describe, expect, it } from 'vitest'
import { AGENTIC_QUADRANTS, getQuadrantById } from './agenticEcosystemQuadrants'

describe('agenticEcosystemQuadrants data integrity', () => {
  it('has exactly the 4 canonical quadrants with no duplicate ids', () => {
    expect(AGENTIC_QUADRANTS).toHaveLength(4)
    const ids = AGENTIC_QUADRANTS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.sort()).toEqual(['consumers', 'enterprise', 'partners', 'workforce'])
  })

  it('every quadrant has a non-empty whoActs, exampleAsk, and governanceNotes', () => {
    for (const q of AGENTIC_QUADRANTS) {
      expect(q.whoActs.length).toBeGreaterThan(20)
      expect(q.exampleAsk.length).toBeGreaterThan(20)
      expect(q.governanceNotes.length).toBeGreaterThan(20)
    }
  })

  it('every quadrant has at least 2 identity problems and 2 threats', () => {
    for (const q of AGENTIC_QUADRANTS) {
      expect(q.identityProblems.length).toBeGreaterThanOrEqual(2)
      expect(q.threatProfile.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every quadrant has at least 1 applicable standard and 1 related lab', () => {
    for (const q of AGENTIC_QUADRANTS) {
      expect(q.applicableStandards.length).toBeGreaterThan(0)
      expect(q.relatedLabs.length).toBeGreaterThan(0)
    }
  })

  it('every relatedLabs path looks like a playground route', () => {
    for (const q of AGENTIC_QUADRANTS) {
      for (const path of q.relatedLabs) {
        expect(path.startsWith('/playground/')).toBe(true)
      }
    }
  })
})

describe('getQuadrantById', () => {
  it('returns the matching quadrant', () => {
    expect(getQuadrantById('enterprise')?.title).toBe('Enterprise')
  })
})
