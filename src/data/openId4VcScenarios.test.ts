import { describe, it, expect } from 'vitest'
import { OPENID4VC_SCENARIOS } from './openId4VcScenarios'

describe('OPENID4VC_SCENARIOS', () => {
  it('has at least 3 scenarios', () => {
    expect(OPENID4VC_SCENARIOS.length).toBeGreaterThanOrEqual(3)
  })

  it('has unique ids', () => {
    const ids = OPENID4VC_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every requested claim is a subset of the issued claims', () => {
    for (const scenario of OPENID4VC_SCENARIOS) {
      const issuedKeys = new Set(Object.keys(scenario.issuedClaims))
      for (const requested of scenario.requestedClaims) {
        expect(issuedKeys.has(requested)).toBe(true)
      }
    }
  })

  it('every scenario requests at least one claim, and fewer than the full issued set (so selective disclosure is meaningful)', () => {
    for (const scenario of OPENID4VC_SCENARIOS) {
      const issuedCount = Object.keys(scenario.issuedClaims).length
      expect(scenario.requestedClaims.length).toBeGreaterThan(0)
      expect(scenario.requestedClaims.length).toBeLessThan(issuedCount)
    }
  })

  it('every scenario has non-empty issuer/verifier metadata', () => {
    for (const scenario of OPENID4VC_SCENARIOS) {
      expect(scenario.issuerName.length).toBeGreaterThan(0)
      expect(scenario.verifierName.length).toBeGreaterThan(0)
      expect(scenario.verifierPurpose.length).toBeGreaterThan(0)
      expect(scenario.credentialType.length).toBeGreaterThan(0)
    }
  })
})
