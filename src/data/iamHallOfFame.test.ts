import { describe, it, expect } from 'vitest'
import { IAM_HALL_OF_FAME } from './iamHallOfFame'
import { STANDARDS } from './standardsData'

describe('IAM_HALL_OF_FAME', () => {
  it("every profile's standard reference resolves to a real STANDARDS entry id", () => {
    for (const profile of IAM_HALL_OF_FAME) {
      expect(STANDARDS.some((s) => s.id === profile.standard)).toBe(true)
    }
  })

  it('every profile has at least one sourceLinks citation', () => {
    for (const profile of IAM_HALL_OF_FAME) {
      expect(profile.sourceLinks.length).toBeGreaterThan(0)
      for (const link of profile.sourceLinks) {
        expect(link).toMatch(/^https?:\/\//)
      }
    }
  })

  it('has unique, non-empty ids and names', () => {
    const ids = new Set<string>()
    for (const profile of IAM_HALL_OF_FAME) {
      expect(profile.name.length).toBeGreaterThan(0)
      expect(profile.bio.length).toBeGreaterThan(0)
      expect(ids.has(profile.id)).toBe(false)
      ids.add(profile.id)
    }
  })
})
