import { describe, it, expect } from 'vitest'
import { AUTH_RISKY_LIBRARIES } from './authRiskyLibraries'
import { CVE_DATABASE } from './researchData'

describe('AUTH_RISKY_LIBRARIES', () => {
  it('has at least one entry', () => {
    expect(AUTH_RISKY_LIBRARIES.length).toBeGreaterThan(0)
  })

  it('has unique package names', () => {
    const names = AUTH_RISKY_LIBRARIES.map((l) => l.packageName)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every knownCveIds entry resolves to a real CVE_DATABASE entry', () => {
    const cveIds = new Set(CVE_DATABASE.map((c) => c.id))
    for (const library of AUTH_RISKY_LIBRARIES) {
      for (const cveId of library.knownCveIds) {
        expect(cveIds.has(cveId)).toBe(true)
      }
    }
  })

  it('every library has at least one known CVE and a non-empty patched version', () => {
    for (const library of AUTH_RISKY_LIBRARIES) {
      expect(library.knownCveIds.length).toBeGreaterThan(0)
      expect(library.patchedVersion.length).toBeGreaterThan(0)
    }
  })

  it('every library has a valid severity', () => {
    for (const library of AUTH_RISKY_LIBRARIES) {
      expect(['Critical', 'High', 'Medium']).toContain(library.severity)
    }
  })

  it('every library has non-empty notes', () => {
    for (const library of AUTH_RISKY_LIBRARIES) {
      expect(library.notes.length).toBeGreaterThan(0)
    }
  })

  it('covers more than one ecosystem', () => {
    const ecosystems = new Set(AUTH_RISKY_LIBRARIES.map((l) => l.ecosystem))
    expect(ecosystems.size).toBeGreaterThan(1)
  })
})
