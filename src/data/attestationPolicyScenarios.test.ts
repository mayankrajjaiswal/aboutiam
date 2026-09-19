import { describe, expect, it } from 'vitest'
import { REGISTRATION_ATTEMPTS, getAttemptById } from './attestationPolicyScenarios'

describe('attestationPolicyScenarios data integrity', () => {
  it('has at least 8 attempts with no duplicate ids', () => {
    expect(REGISTRATION_ATTEMPTS.length).toBeGreaterThanOrEqual(8)
    const ids = REGISTRATION_ATTEMPTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has a mix of shouldAccept true and false', () => {
    expect(REGISTRATION_ATTEMPTS.some((a) => a.shouldAccept)).toBe(true)
    expect(REGISTRATION_ATTEMPTS.some((a) => !a.shouldAccept)).toBe(true)
  })

  it('every attempt has a valid-looking AAGUID (UUID shape) and non-empty vendorModel/explanation', () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    for (const a of REGISTRATION_ATTEMPTS) {
      expect(a.aaguid).toMatch(uuidPattern)
      expect(a.vendorModel.length).toBeGreaterThan(5)
      expect(a.explanation.length).toBeGreaterThan(20)
    }
  })

  it('has a valid attestationConveyance and certificationLevel on every entry', () => {
    const validConveyance = new Set(['none', 'indirect', 'direct', 'enterprise'])
    const validCert = new Set(['L1', 'L1plus', 'L2', 'L3', 'uncertified'])
    for (const a of REGISTRATION_ATTEMPTS) {
      expect(validConveyance.has(a.attestationConveyance)).toBe(true)
      expect(validCert.has(a.certificationLevel)).toBe(true)
    }
  })
})

describe('getAttemptById', () => {
  it('returns the matching attempt', () => {
    expect(getAttemptById('attempt-01')?.shouldAccept).toBe(true)
  })
})
