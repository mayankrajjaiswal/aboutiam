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

  it('rejects a second FIPS-validated hardware key when the AAGUID allow-list only contains the first vendor', () => {
    const feitianFips = AUTHENTICATOR_DEVICES.find(d => d.id === 'feitian_epass_fips')!
    const policy = {
      requireResidentKey: false,
      userVerification: 'preferred' as const,
      restrictAaguid: true,
      requireHardwareAttestation: true
    }

    const result = validatePasskeyRegistration(feitianFips, policy)
    expect(result.allowed).toBe(false)
    expect(result.logs.some(l => l.includes('NOT in the allowed enterprise hardware inventory'))).toBe(true)
  })

  it('rejects a genuinely hardware-backed, correctly-attested key that is simply not on the corporate AAGUID allow-list', () => {
    const nonFipsYubikey = AUTHENTICATOR_DEVICES.find(d => d.id === 'yubikey_5_non_fips')!
    const attestationOnlyPolicy = {
      requireResidentKey: false,
      userVerification: 'preferred' as const,
      restrictAaguid: false,
      requireHardwareAttestation: true
    }

    // Passes hardware-attestation-only policy: it is genuinely hardware-backed with valid attestation.
    const attestationResult = validatePasskeyRegistration(nonFipsYubikey, attestationOnlyPolicy)
    expect(attestationResult.allowed).toBe(true)

    // But still fails once the enterprise AAGUID allow-list is enforced -- hardware-backed alone is not enough.
    const allowListPolicy = { ...attestationOnlyPolicy, restrictAaguid: true }
    const allowListResult = validatePasskeyRegistration(nonFipsYubikey, allowListPolicy)
    expect(allowListResult.allowed).toBe(false)
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
