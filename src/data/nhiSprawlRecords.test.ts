import { describe, it, expect } from 'vitest'
import { NHI_RECORDS, SHOWN_RECORD_COUNT, TOTAL_NHI_COUNT } from './nhiSprawlRecords'

describe('NHI Sprawl Records', () => {
  it('generates exactly SHOWN_RECORD_COUNT records', () => {
    expect(NHI_RECORDS.length).toBe(SHOWN_RECORD_COUNT)
  })

  it('simulates a larger total fleet than what is actually rendered', () => {
    expect(TOTAL_NHI_COUNT).toBeGreaterThan(SHOWN_RECORD_COUNT)
  })

  it('has unique ids', () => {
    const ids = NHI_RECORDS.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every correctAction is one of the three valid triage actions', () => {
    for (const record of NHI_RECORDS) {
      expect(['rotate', 'revoke', 'keep']).toContain(record.correctAction)
    }
  })

  it('has at least 5 orphaned records with no owner, all correctly requiring revoke', () => {
    const orphaned = NHI_RECORDS.filter((r) => r.isOrphaned)
    expect(orphaned.length).toBeGreaterThanOrEqual(5)
    for (const record of orphaned) {
      expect(record.owner).toBeNull()
      expect(record.correctAction).toBe('revoke')
    }
  })

  it('has at least 5 stale unrotated-but-active records correctly requiring rotate', () => {
    const staleActive = NHI_RECORDS.filter((r) => r.correctAction === 'rotate')
    expect(staleActive.length).toBeGreaterThanOrEqual(5)
    for (const record of staleActive) {
      expect(record.ageDays).toBeGreaterThan(365)
      expect(record.lastUsedDaysAgo).toBeLessThan(30)
    }
  })

  it('has at least 5 over-privileged, long-unused records correctly requiring revoke', () => {
    const overPrivileged = NHI_RECORDS.filter(
      (r) => !r.isOrphaned && (r.privilege === 'admin' || r.privilege === 'high') && r.lastUsedDaysAgo > 180 && !r.hasDependents
    )
    expect(overPrivileged.length).toBeGreaterThanOrEqual(5)
    for (const record of overPrivileged) {
      expect(record.correctAction).toBe('revoke')
    }
  })

  it('has at least one record whose correct action is to keep it', () => {
    expect(NHI_RECORDS.some((r) => r.correctAction === 'keep')).toBe(true)
  })

  it('every record has a non-empty rationale explaining the correct action', () => {
    for (const record of NHI_RECORDS) {
      expect(record.rationale.length).toBeGreaterThan(0)
    }
  })

  it('never marks an orphaned record as having a non-null owner', () => {
    for (const record of NHI_RECORDS) {
      if (record.isOrphaned) {
        expect(record.owner).toBeNull()
      } else {
        expect(record.owner).not.toBeNull()
      }
    }
  })
})
