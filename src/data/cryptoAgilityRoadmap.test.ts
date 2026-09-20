import { describe, expect, it } from 'vitest'
import { CRYPTO_MIGRATION_WORKSTREAMS, getWorkstreamById, getWorkstreamsByDomain } from './cryptoAgilityRoadmap'

describe('cryptoAgilityRoadmap data integrity', () => {
  it('has at least 10 workstreams with no duplicate ids', () => {
    expect(CRYPTO_MIGRATION_WORKSTREAMS.length).toBeGreaterThanOrEqual(10)
    const ids = CRYPTO_MIGRATION_WORKSTREAMS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every dependsOn id resolves to a real workstream (no dangling dependency)', () => {
    const validIds = new Set(CRYPTO_MIGRATION_WORKSTREAMS.map((w) => w.id))
    for (const w of CRYPTO_MIGRATION_WORKSTREAMS) {
      for (const dep of w.dependsOn) {
        expect(validIds.has(dep)).toBe(true)
      }
    }
  })

  it('dependsOn forms a DAG with no cycles', () => {
    const byId = new Map(CRYPTO_MIGRATION_WORKSTREAMS.map((w) => [w.id, w]))
    const visiting = new Set<string>()
    const visited = new Set<string>()

    function visit(id: string) {
      if (visited.has(id)) return
      if (visiting.has(id)) throw new Error(`Cycle detected at ${id}`)
      visiting.add(id)
      const workstream = byId.get(id)
      for (const dep of workstream?.dependsOn ?? []) {
        visit(dep)
      }
      visiting.delete(id)
      visited.add(id)
    }

    expect(() => {
      for (const w of CRYPTO_MIGRATION_WORKSTREAMS) visit(w.id)
    }).not.toThrow()
  })

  it('a workstream never depends on itself', () => {
    for (const w of CRYPTO_MIGRATION_WORKSTREAMS) {
      expect(w.dependsOn.includes(w.id)).toBe(false)
    }
  })

  it('every workstream has current/target algorithms, migration steps, and a verification approach', () => {
    for (const w of CRYPTO_MIGRATION_WORKSTREAMS) {
      expect(w.currentAlgorithms.length).toBeGreaterThan(0)
      expect(w.targetAlgorithms.length).toBeGreaterThan(0)
      expect(w.migrationSteps.length).toBeGreaterThan(0)
      expect(w.verificationApproach.length).toBeGreaterThan(20)
    }
  })

  it('has a valid difficulty and hndlExposure on every entry', () => {
    const validDifficulty = new Set(['low', 'medium', 'high'])
    const validHndl = new Set(['none', 'low', 'medium', 'high'])
    for (const w of CRYPTO_MIGRATION_WORKSTREAMS) {
      expect(validDifficulty.has(w.difficulty)).toBe(true)
      expect(validHndl.has(w.hndlExposure)).toBe(true)
    }
  })

  it('the root CA hierarchy and HSM firmware workstreams have no dependencies (they are true roots)', () => {
    expect(getWorkstreamById('root-ca-hierarchy')?.dependsOn).toEqual([])
    expect(getWorkstreamById('hsm-firmware')?.dependsOn).toEqual([])
  })

  it('spans multiple crypto domains', () => {
    const domains = new Set(CRYPTO_MIGRATION_WORKSTREAMS.map((w) => w.domain))
    expect(domains.size).toBeGreaterThanOrEqual(5)
  })
})

describe('getWorkstreamsByDomain', () => {
  it('filters correctly', () => {
    const pki = getWorkstreamsByDomain('PKI & CA')
    expect(pki.length).toBeGreaterThan(0)
    for (const w of pki) expect(w.domain).toBe('PKI & CA')
  })
})
