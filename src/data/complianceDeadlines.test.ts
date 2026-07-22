import { describe, expect, it } from 'vitest'
import { COMPLIANCE_DEADLINES, getUpcomingDeadlines, getPastDeadlines, getJurisdictions } from './complianceDeadlines'

describe('complianceDeadlines data integrity', () => {
  it('has no duplicate ids', () => {
    const ids = COMPLIANCE_DEADLINES.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every entry has a valid ISO date, jurisdiction, and official link', () => {
    for (const d of COMPLIANCE_DEADLINES) {
      expect(d.deadlineDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.jurisdiction.length).toBeGreaterThan(0)
      expect(d.officialLink.startsWith('https://')).toBe(true)
    }
  })
})

describe('getUpcomingDeadlines / getPastDeadlines', () => {
  it('partitions every deadline into exactly one of upcoming or past', () => {
    const upcoming = getUpcomingDeadlines()
    const past = getPastDeadlines()
    expect(upcoming.length + past.length).toBe(COMPLIANCE_DEADLINES.length)
  })

  it('sorts upcoming deadlines chronologically ascending (soonest first)', () => {
    const upcoming = getUpcomingDeadlines()
    for (let i = 1; i < upcoming.length; i++) {
      expect(upcoming[i].deadlineDate >= upcoming[i - 1].deadlineDate).toBe(true)
    }
  })

  it('sorts past deadlines chronologically descending (most recent first)', () => {
    const past = getPastDeadlines()
    for (let i = 1; i < past.length; i++) {
      expect(past[i].deadlineDate <= past[i - 1].deadlineDate).toBe(true)
    }
  })
})

describe('getJurisdictions', () => {
  it('returns a de-duplicated, sorted list of jurisdictions', () => {
    const jurisdictions = getJurisdictions()
    expect(new Set(jurisdictions).size).toBe(jurisdictions.length)
    const sorted = [...jurisdictions].sort()
    expect(jurisdictions).toEqual(sorted)
  })
})
