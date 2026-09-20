import { describe, expect, it } from 'vitest'
import { WALLET_PROGRAMMES, getProgrammesByRegion, getProgrammeById } from './walletProgrammes'

describe('walletProgrammes data integrity', () => {
  it('has at least 12 programmes with no duplicate ids', () => {
    expect(WALLET_PROGRAMMES.length).toBeGreaterThanOrEqual(12)
    const ids = WALLET_PROGRAMMES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every entry has a valid ISO verifiedDate, https sourceLink, and confidence value', () => {
    const validConfidence = new Set(['confirmed', 'partial'])
    for (const p of WALLET_PROGRAMMES) {
      expect(p.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(p.sourceLink.startsWith('https://')).toBe(true)
      expect(validConfidence.has(p.confidence)).toBe(true)
    }
  })

  it('spans multiple regions', () => {
    const regions = new Set(WALLET_PROGRAMMES.map((p) => p.region))
    expect(regions.size).toBeGreaterThanOrEqual(3)
  })

  it('every entry has at least one credential type and standard', () => {
    for (const p of WALLET_PROGRAMMES) {
      expect(p.credentialTypes.length).toBeGreaterThan(0)
      expect(p.standardsProfile.length).toBeGreaterThan(0)
    }
  })

  it('every entry has non-empty relying-party notes', () => {
    for (const p of WALLET_PROGRAMMES) {
      expect(p.relyingPartyNotes.length).toBeGreaterThan(20)
    }
  })

  it('has a valid status and trustModel on every entry', () => {
    const validStatus = new Set(['live', 'pilot', 'announced', 'paused'])
    const validTrust = new Set(['government', 'bank-backed', 'private-federation', 'mixed'])
    for (const p of WALLET_PROGRAMMES) {
      expect(validStatus.has(p.status)).toBe(true)
      expect(validTrust.has(p.trustModel)).toBe(true)
    }
  })

  it('includes the EUDI Wallet as the flagship regulatory-driven entry', () => {
    const eudi = getProgrammeById('eudi-wallet-eu')
    expect(eudi).toBeDefined()
    expect(eudi?.confidence).toBe('confirmed')
  })
})

describe('getProgrammesByRegion', () => {
  it('filters correctly', () => {
    const eu = getProgrammesByRegion('EU')
    expect(eu.length).toBeGreaterThan(0)
    for (const p of eu) expect(p.region).toBe('EU')
  })
})
