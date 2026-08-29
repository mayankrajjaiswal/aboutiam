import { describe, it, expect } from 'vitest'
import { AUTHENTICATOR_DEVICES, validatePasskeyRegistration } from './passkeyPolicyScenarios'

describe('Passkey Policy Validation Engine', () => {
  const yubikey = AUTHENTICATOR_DEVICES.find(d => d.id === 'yubikey_5_fips')!
  const rogueKey = AUTHENTICATOR_DEVICES.find(d => d.id === 'rogue_virtual_key')!

  it('should allow any device when policies are fully permissive', () => {
    const policy = {
      requireResidentKey: false,
      userVerification: 'preferred' as const,
      restrictAaguid: false,
      requireHardwareAttestation: false
    }

    const result = validatePasskeyRegistration(rogueKey, policy)
    expect(result.allowed).toBe(true)
    expect(result.scoreDeduction).toBe(0)
  })

  it('should reject non-hardware keys when requireHardwareAttestation is active', () => {
    const policy = {
      requireResidentKey: false,
      userVerification: 'preferred' as const,
      restrictAaguid: false,
      requireHardwareAttestation: true
    }

    const result = validatePasskeyRegistration(rogueKey, policy)
    expect(result.allowed).toBe(false)
    expect(result.scoreDeduction).toBeGreaterThan(0)

    const yubiResult = validatePasskeyRegistration(yubikey, policy)
    expect(yubiResult.allowed).toBe(true)
  })

  it('should cover resident key success and exact AAGUID restrictions success branches', () => {
    const policy = {
      requireResidentKey: true,
      userVerification: 'required' as const,
      restrictAaguid: true,
      requireHardwareAttestation: true
    }

    const result = validatePasskeyRegistration(yubikey, policy)
    expect(result.allowed).toBe(true)
    expect(result.scoreDeduction).toBe(0)
    expect(result.logs.some(l => l.includes('Resident Key requirement satisfied'))).toBe(true)
    expect(result.logs.some(l => l.includes('matches the corporate allowed FIPS'))).toBe(true)
  })
})
