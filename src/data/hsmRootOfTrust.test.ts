import { describe, expect, it } from 'vitest'
import { HSM_ROOT_OF_TRUST_CONCEPTS, getConceptsByCategory, getConceptById } from './hsmRootOfTrust'

describe('hsmRootOfTrust data integrity', () => {
  it('has at least 6 concepts with no duplicate ids', () => {
    expect(HSM_ROOT_OF_TRUST_CONCEPTS.length).toBeGreaterThanOrEqual(6)
    const ids = HSM_ROOT_OF_TRUST_CONCEPTS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every concept has a non-empty analogy and expert paragraph', () => {
    for (const c of HSM_ROOT_OF_TRUST_CONCEPTS) {
      expect(c.analogy.length).toBeGreaterThan(20)
      expect(c.expert.length).toBeGreaterThan(30)
    }
  })

  it('every concept has at least one dependent theme and standard ref', () => {
    for (const c of HSM_ROOT_OF_TRUST_CONCEPTS) {
      expect(c.dependentThemes.length).toBeGreaterThan(0)
      expect(c.standardRefs.length).toBeGreaterThan(0)
    }
  })

  it('every concept has a valid ISO verifiedDate and https sourceLink', () => {
    for (const c of HSM_ROOT_OF_TRUST_CONCEPTS) {
      expect(c.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(c.sourceLink.startsWith('https://')).toBe(true)
    }
  })

  it('the crypto-agility theme depends on every concept (it is the substrate theme)', () => {
    for (const c of HSM_ROOT_OF_TRUST_CONCEPTS) {
      expect(c.dependentThemes).toContain('crypto-agility')
    }
  })
})

describe('getConceptsByCategory / getConceptById', () => {
  it('filters by category', () => {
    const ops = getConceptsByCategory('Operations')
    expect(ops.length).toBeGreaterThan(0)
    for (const c of ops) expect(c.category).toBe('Operations')
  })

  it('returns the matching concept', () => {
    expect(getConceptById('non-extractability')?.category).toBe('Key Custody')
  })
})
