import { describe, it, expect } from 'vitest'
import { ACCESS_REQUEST_CATALOG } from './accessRequestCatalog'

describe('ACCESS_REQUEST_CATALOG', () => {
  it('has unique item ids', () => {
    const ids = ACCESS_REQUEST_CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every declared SoD-conflict pair references two real catalog entries', () => {
    const validIds = new Set(ACCESS_REQUEST_CATALOG.map((i) => i.id))
    for (const item of ACCESS_REQUEST_CATALOG) {
      for (const conflictId of item.sodConflicts ?? []) {
        expect(validIds.has(conflictId)).toBe(true)
      }
    }
  })

  it('every SoD conflict is declared symmetrically (bidirectional)', () => {
    for (const item of ACCESS_REQUEST_CATALOG) {
      for (const conflictId of item.sodConflicts ?? []) {
        const other = ACCESS_REQUEST_CATALOG.find((i) => i.id === conflictId)!
        expect(other.sodConflicts ?? []).toContain(item.id)
      }
    }
  })

  it('covers all three privilege levels', () => {
    const levels = new Set(ACCESS_REQUEST_CATALOG.map((i) => i.privilegeLevel))
    expect(levels).toEqual(new Set(['standard', 'elevated', 'privileged']))
  })

  it('has at least one declared SoD conflict pair', () => {
    const withConflicts = ACCESS_REQUEST_CATALOG.filter((i) => (i.sodConflicts?.length ?? 0) > 0)
    expect(withConflicts.length).toBeGreaterThan(0)
  })
})
