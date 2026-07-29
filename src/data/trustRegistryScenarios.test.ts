import { describe, it, expect } from 'vitest'
import { TRUST_REGISTRIES, verifyIssuerAuthorization } from './trustRegistryScenarios'

describe('TRUST_REGISTRIES', () => {
  it('has at least 3 registries with unique ids', () => {
    expect(TRUST_REGISTRIES.length).toBeGreaterThanOrEqual(3)
    const ids = TRUST_REGISTRIES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every recognizes reference points to a real registry id', () => {
    const ids = new Set(TRUST_REGISTRIES.map((r) => r.id))
    for (const registry of TRUST_REGISTRIES) {
      for (const recognizedId of registry.recognizes) {
        expect(ids.has(recognizedId)).toBe(true)
      }
    }
  })
})

describe('verifyIssuerAuthorization', () => {
  it('authorizes an issuer directly listed as active in the verifier\'s own registry', () => {
    const outcome = verifyIssuerAuthorization('State University Registrar', 'de-registry', TRUST_REGISTRIES)
    expect(outcome.authorized).toBe(true)
  })

  it('demonstrates the cross-border recognition gap: a DE-authorized issuer is NOT authorized against the FR registry', () => {
    const outcome = verifyIssuerAuthorization('State University Registrar', 'fr-registry', TRUST_REGISTRIES)
    expect(outcome.authorized).toBe(false)
  })

  it('authorizes via one level of cross-recognition when the verifier registry recognizes the issuing registry', () => {
    const outcome = verifyIssuerAuthorization('State University Registrar', 'eudi-recognized-registry', TRUST_REGISTRIES)
    expect(outcome.authorized).toBe(true)
    expect(outcome.reason).toContain('recognizes')
  })

  it('fails verification for a completely unknown issuer', () => {
    const outcome = verifyIssuerAuthorization('Totally Fake Issuer', 'de-registry', TRUST_REGISTRIES)
    expect(outcome.authorized).toBe(false)
  })

  it('a revoked issuer fails verification even though it is listed', () => {
    const revokedRegistries = TRUST_REGISTRIES.map((r) =>
      r.id === 'de-registry'
        ? { ...r, issuers: r.issuers.map((i) => (i.issuerName === 'State University Registrar' ? { ...i, status: 'revoked' as const } : i)) }
        : r,
    )
    const outcome = verifyIssuerAuthorization('State University Registrar', 'de-registry', revokedRegistries)
    expect(outcome.authorized).toBe(false)
    expect(outcome.reason).toContain('revoked')
  })

  it('returns a clear failure for an unknown verifier registry id', () => {
    const outcome = verifyIssuerAuthorization('State University Registrar', 'does-not-exist', TRUST_REGISTRIES)
    expect(outcome.authorized).toBe(false)
  })
})
