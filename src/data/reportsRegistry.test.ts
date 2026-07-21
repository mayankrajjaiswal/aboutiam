import { describe, it, expect } from 'vitest'
import { IAM_REPORTS, getReportsByPublisher, getVendorLeaderboard, canonicalLeaderName, LEADER_VENDOR_LINKS } from './reportsRegistry'

describe('IAM Reports Registry (reportsRegistry.ts)', () => {
  it('should assert all reports have completely unique slugs', () => {
    const slugs = IAM_REPORTS.map((r) => r.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('should verify slugs contain only lowercase characters, numbers, and hyphens', () => {
    IAM_REPORTS.forEach((r) => {
      expect(r.slug).toMatch(/^[a-z0-9-]+$/)
    })
  })

  it('should assert every report is assigned a valid publisher', () => {
    const validPublishers = new Set(['Gartner', 'Forrester', 'KuppingerCole', 'Thales'])
    IAM_REPORTS.forEach((r) => {
      expect(validPublishers.has(r.publisher)).toBe(true)
    })
  })

  it('should assert every report is assigned a valid report type', () => {
    const validTypes = new Set(['Magic Quadrant', 'Wave', 'Leadership Compass', 'Industry Research'])
    IAM_REPORTS.forEach((r) => {
      expect(validTypes.has(r.reportType)).toBe(true)
    })
  })

  it('should assert confidence is either confirmed or partial', () => {
    IAM_REPORTS.forEach((r) => {
      expect(['confirmed', 'partial']).toContain(r.confidence)
    })
  })

  it('should link to a well-formed https source for every report', () => {
    IAM_REPORTS.forEach((r) => {
      expect(() => new URL(r.link)).not.toThrow()
      expect(new URL(r.link).protocol).toBe('https:')
    })
  })

  it('should record a well-formed ISO verifiedDate and a non-trivial verifiedVia note for every report', () => {
    IAM_REPORTS.forEach((r) => {
      expect(r.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(r.verifiedVia.length).toBeGreaterThan(20)
    })
  })

  it('should require every report to carry either named leaders or key stats (never neither)', () => {
    IAM_REPORTS.forEach((r) => {
      const hasLeaders = !!r.leaders && r.leaders.length > 0
      const hasStats = !!r.keyStats && r.keyStats.length > 0
      expect(hasLeaders || hasStats).toBe(true)
    })
  })

  it('should enforce metadata lengths optimized for SEO and UI cards', () => {
    IAM_REPORTS.forEach((r) => {
      expect(r.title.length).toBeGreaterThan(5)
      expect(r.title.length).toBeLessThan(120)
      expect(r.summary.length).toBeGreaterThan(30)
      expect(r.summary.length).toBeLessThan(500)
    })
  })
})

describe('getReportsByPublisher', () => {
  it('should include every report exactly once across all publisher groups', () => {
    const grouped = getReportsByPublisher()
    const flattened = grouped.flatMap((g) => g.reports)
    expect(flattened.length).toBe(IAM_REPORTS.length)
    expect(new Set(flattened.map((r) => r.slug)).size).toBe(IAM_REPORTS.length)
  })

  it('should never emit an empty publisher group', () => {
    getReportsByPublisher().forEach((group) => {
      expect(group.reports.length).toBeGreaterThan(0)
    })
  })
})

describe('canonicalLeaderName', () => {
  it('should fold the pre-acquisition CyberArk label into the current Idira brand', () => {
    expect(canonicalLeaderName('CyberArk')).toBe('Idira (formerly CyberArk)')
  })

  it('should strip the category-suffixed OneLogin label down to the bare vendor name', () => {
    expect(canonicalLeaderName('OneLogin (Overall, Product & Market Leader)')).toBe('OneLogin')
  })

  it('should pass through vendor names that need no canonicalization', () => {
    expect(canonicalLeaderName('Ping Identity')).toBe('Ping Identity')
  })
})

describe('getVendorLeaderboard', () => {
  const leaderboard = getVendorLeaderboard()

  it('should only include vendors named a Leader in two or more independent reports', () => {
    leaderboard.forEach((entry) => {
      expect(entry.count).toBeGreaterThanOrEqual(2)
      expect(entry.reports.length).toBe(entry.count)
    })
  })

  it('should sort strictly by descending report count', () => {
    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i - 1].count).toBeGreaterThanOrEqual(leaderboard[i].count)
    }
  })

  it('should de-duplicate CyberArk/Idira into a single leaderboard row', () => {
    const idiraRows = leaderboard.filter((e) => e.vendor === 'Idira (formerly CyberArk)')
    expect(idiraRows.length).toBe(1)
    expect(idiraRows[0].count).toBeGreaterThanOrEqual(2)
  })

  it('should never list a bare "CyberArk" or category-suffixed "OneLogin" row', () => {
    const rawLabels = leaderboard.map((e) => e.vendor)
    expect(rawLabels).not.toContain('CyberArk')
    expect(rawLabels).not.toContain('OneLogin (Overall, Product & Market Leader)')
  })
})

describe('LEADER_VENDOR_LINKS', () => {
  it('should only map vendor keys that actually appear as a canonical leader name somewhere in the registry', () => {
    const allCanonicalLeaders = new Set(
      IAM_REPORTS.flatMap((r) => r.leaders ?? []).map(canonicalLeaderName)
    )
    Object.keys(LEADER_VENDOR_LINKS).forEach((name) => {
      expect(allCanonicalLeaders.has(name)).toBe(true)
    })
  })
})
