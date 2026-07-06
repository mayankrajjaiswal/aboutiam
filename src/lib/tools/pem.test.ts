import { describe, expect, it } from 'vitest'
import { derToPem, pemToDer } from './pem'

describe('PEM Utility (derToPem & pemToDer)', () => {
  it('correctly wraps DER bytes into a formatted PEM block with label headers', () => {
    // 64-bytes of arbitrary data to test wrapping limits exactly
    const rawBytes = new Uint8Array(65)
    for (let i = 0; i < rawBytes.length; i++) rawBytes[i] = i % 256

    const label = 'CERTIFICATE'
    const pem = derToPem(rawBytes, label)

    expect(pem).toContain('-----BEGIN CERTIFICATE-----')
    expect(pem).toContain('-----END CERTIFICATE-----')
    
    // Check line wrapping: lines inside should be max 64 chars long
    const lines = pem.split('\n')
    // Header/Footer lines are of course not part of chunk wrapping, but content lines are
    const contentLines = lines.slice(1, -1)
    
    // First content line should be exactly 64 characters
    expect(contentLines[0]).toHaveLength(64)
    // Second line should have the remaining characters (which base64 padding adds up)
    expect(contentLines[1].length).toBeLessThanOrEqual(64)
  })

  it('correctly extracts DER binary arrays from a PEM string, ignoring comments and whitespace', () => {
    const rawPem = `
      -----BEGIN TEST PRIVATE KEY-----
      AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4v
      MDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZH
      -----END TEST PRIVATE KEY-----
    `

    const der = pemToDer(rawPem)
    expect(der).toBeInstanceOf(Uint8Array)
    expect(der.length).toBe(72) // original bytes length should match
    
    // First few bytes should match: [0, 1, 2, 3, 4]
    expect(der[0]).toBe(0)
    expect(der[1]).toBe(1)
    expect(der[2]).toBe(2)
    expect(der[3]).toBe(3)
  })

  it('round-trips arbitrary byte data flawlessly', () => {
    const originalBytes = new Uint8Array([5, 12, 53, 99, 120, 222, 255, 0, 14])
    const label = 'PUBLIC KEY'

    const pem = derToPem(originalBytes, label)
    const decodedBytes = pemToDer(pem)

    expect(decodedBytes).toEqual(originalBytes)
  })
})
