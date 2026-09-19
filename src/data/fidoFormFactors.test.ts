import { describe, expect, it } from 'vitest'
import { FIDO_FORM_FACTORS, getFormFactorsByCategory, getFormFactorById } from './fidoFormFactors'

describe('fidoFormFactors data integrity', () => {
  it('has at least 6 form factors with no duplicate ids', () => {
    expect(FIDO_FORM_FACTORS.length).toBeGreaterThanOrEqual(6)
    const ids = FIDO_FORM_FACTORS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every form factor has a non-empty analogy and expert paragraph', () => {
    for (const f of FIDO_FORM_FACTORS) {
      expect(f.analogy.length).toBeGreaterThan(20)
      expect(f.expert.length).toBeGreaterThan(30)
    }
  })

  it('every form factor has a valid aalCeiling and attestationSupport', () => {
    const validAal = new Set(['AAL2', 'AAL3'])
    const validAttestation = new Set(['none', 'basic', 'enterprise'])
    for (const f of FIDO_FORM_FACTORS) {
      expect(validAal.has(f.aalCeiling)).toBe(true)
      expect(validAttestation.has(f.attestationSupport)).toBe(true)
    }
  })

  it('every form factor has cryptoAgility and sustainability notes', () => {
    for (const f of FIDO_FORM_FACTORS) {
      expect(f.cryptoAgility.length).toBeGreaterThan(15)
      expect(f.sustainability.length).toBeGreaterThan(10)
    }
  })

  it('every form factor has at least one best-fit population and one failure mode', () => {
    for (const f of FIDO_FORM_FACTORS) {
      expect(f.bestFitPopulations.length).toBeGreaterThan(0)
      expect(f.failureModes.length).toBeGreaterThan(0)
    }
  })

  it('every form factor has a valid ISO verifiedDate and https sourceLink', () => {
    for (const f of FIDO_FORM_FACTORS) {
      expect(f.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(f.sourceLink.startsWith('https://')).toBe(true)
    }
  })

  it('covers a range of categories, not just one', () => {
    const categories = new Set(FIDO_FORM_FACTORS.map((f) => f.category))
    expect(categories.size).toBeGreaterThanOrEqual(4)
  })
})

describe('getFormFactorsByCategory / getFormFactorById', () => {
  it('filters by category correctly', () => {
    const platform = getFormFactorsByCategory('Platform')
    expect(platform.length).toBeGreaterThan(0)
    for (const f of platform) expect(f.category).toBe('Platform')
  })

  it('returns the matching form factor by id', () => {
    expect(getFormFactorById('usb-nfc-security-key')?.aalCeiling).toBe('AAL3')
  })
})
