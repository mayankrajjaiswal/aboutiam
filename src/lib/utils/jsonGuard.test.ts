import { describe, it, expect } from 'vitest'
import { isSignedCertificate } from './jsonGuard'

describe('Strict JSON Type Guards', () => {
  it('should identify a valid signed certificate payload', () => {
    const valid = {
      payload: {
        recipientName: 'AboutIAM Learner',
        completedModuleCount: 5,
        totalModuleCount: 36,
        completedLabCount: 2,
        issuedOn: '2026-08-29',
        certificateId: 'cert-123'
      },
      signature: 'valid-sig-hash',
      publicKeyJwk: { kty: 'EC', crv: 'P-256' }
    }

    expect(isSignedCertificate(valid)).toBe(true)
  })

  it('should reject malformed or partial objects cleanly', () => {
    expect(isSignedCertificate(null)).toBe(false)
    expect(isSignedCertificate('not-an-object')).toBe(false)
    expect(isSignedCertificate({ payload: {} })).toBe(false)
    expect(isSignedCertificate({
      payload: {
        recipientName: 'Learner'
      },
      signature: 'sig',
      publicKeyJwk: { kty: 'EC' }
    })).toBe(false)
  })

  it('should cover the branches for invalid signatures or invalid JWK formats', () => {
    // 1. Invalid signature (non-string)
    expect(isSignedCertificate({
      payload: {
        recipientName: 'Learner',
        completedModuleCount: 5,
        totalModuleCount: 36,
        completedLabCount: 2,
        issuedOn: '2026-08-29',
        certificateId: 'cert-123'
      },
      signature: 12345, // invalid
      publicKeyJwk: { kty: 'EC' }
    })).toBe(false)

    // 2. Invalid JWK (non-object)
    expect(isSignedCertificate({
      payload: {
        recipientName: 'Learner',
        completedModuleCount: 5,
        totalModuleCount: 36,
        completedLabCount: 2,
        issuedOn: '2026-08-29',
        certificateId: 'cert-123'
      },
      signature: 'valid-sig-hash',
      publicKeyJwk: 'not-an-object' // invalid
    })).toBe(false)
  })
})
