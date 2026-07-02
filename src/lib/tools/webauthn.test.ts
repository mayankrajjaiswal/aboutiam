import { describe, expect, it } from 'vitest'
import { base64UrlEncode, base64UrlEncodeBytes } from './base64'
import { decodeClientDataJson, parseAttestationObject, parseAuthenticatorData } from './webauthn'

// Small, obviously-correct CBOR encoding helpers used only to build test
// fixtures — intentionally independent of lib/tools/cbor.ts's decoder, so a
// bug in one wouldn't be masked by a matching bug in the other.
function cborTextString(s: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(s))
  return [0x60 | bytes.length, ...bytes]
}
function cborByteStringHeader(length: number): number[] {
  return length < 24 ? [0x40 | length] : [0x58, length]
}

describe('webauthn clientDataJSON', () => {
  it('decodes type/challenge/origin/crossOrigin', () => {
    const json = JSON.stringify({ type: 'webauthn.get', challenge: 'c2FtcGxlLWNoYWxsZW5nZQ', origin: 'https://aboutiam.local', crossOrigin: false })
    const decoded = decodeClientDataJson(base64UrlEncode(json))
    expect(decoded.type).toBe('webauthn.get')
    expect(decoded.challenge).toBe('c2FtcGxlLWNoYWxsZW5nZQ')
    expect(decoded.origin).toBe('https://aboutiam.local')
    expect(decoded.crossOrigin).toBe(false)
  })
})

describe('webauthn authenticatorData', () => {
  it('decodes rpIdHash, flags, and signCount without attested credential data', () => {
    const bytes = new Uint8Array(37)
    bytes.fill(0x11, 0, 32) // rpIdHash
    bytes[32] = 0x05 // UP + UV
    bytes[33] = 0; bytes[34] = 0; bytes[35] = 0; bytes[36] = 1 // signCount = 1

    const result = parseAuthenticatorData(bytes)
    expect(result.rpIdHashHex).toBe('11'.repeat(32))
    expect(result.flags).toEqual({
      userPresent: true,
      userVerified: true,
      backupEligible: false,
      backupState: false,
      attestedCredentialData: false,
      extensionDataIncluded: false,
    })
    expect(result.signCount).toBe(1)
    expect(result.attestedCredentialData).toBeNull()
  })

  it('decodes attested credential data (aaguid, credentialId, COSE public key)', () => {
    const coseKey = [
      0xa5, // map, 5 entries
      0x01, 0x02, // kty(1) = EC2(2)
      0x03, 0x26, // alg(3) = -7 (ES256)
      0x20, 0x01, // crv(-1) = 1 (P-256)
      0x21, ...cborByteStringHeader(2), 0xab, 0xcd, // x(-2)
      0x22, ...cborByteStringHeader(2), 0xef, 0x01, // y(-3)
    ]
    const bytes = new Uint8Array([
      ...new Array(32).fill(0x22), // rpIdHash
      0x41, // UP + AT
      0, 0, 0, 7, // signCount = 7
      ...new Array(16).fill(0xaa), // aaguid
      0x00, 0x04, // credentialIdLength = 4
      0x01, 0x02, 0x03, 0x04, // credentialId
      ...coseKey,
    ])

    const result = parseAuthenticatorData(bytes)
    expect(result.flags.attestedCredentialData).toBe(true)
    expect(result.signCount).toBe(7)
    expect(result.attestedCredentialData).toEqual({
      aaguidHex: 'aa'.repeat(16),
      credentialIdHex: '01020304',
      publicKeyCose: { kty: 'EC2', alg: -7, crv: 1, x: 'abcd', y: 'ef01' },
    })
  })

  it('throws a friendly error when shorter than the minimum 37 bytes', () => {
    expect(() => parseAuthenticatorData(new Uint8Array(10))).toThrow(/too short/)
  })
})

describe('webauthn attestationObject', () => {
  it('decodes fmt/attStmt/authData from a CBOR-encoded attestation object', () => {
    const authData = new Uint8Array(37)
    authData.fill(0x33, 0, 32)
    authData[32] = 0x01 // UP only

    const attestationObjectBytes = new Uint8Array([
      0xa3, // map, 3 entries
      ...cborTextString('fmt'), ...cborTextString('none'),
      ...cborTextString('attStmt'), 0xa0, // empty map
      ...cborTextString('authData'), ...cborByteStringHeader(authData.length), ...authData,
    ])

    const parsed = parseAttestationObject(base64UrlEncodeBytes(attestationObjectBytes))
    expect(parsed.fmt).toBe('none')
    expect(parsed.attStmt).toEqual({})
    expect(parsed.authData.rpIdHashHex).toBe('33'.repeat(32))
    expect(parsed.authData.flags.userPresent).toBe(true)
    expect(parsed.authData.flags.userVerified).toBe(false)
  })
})
