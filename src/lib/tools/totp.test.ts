import { describe, expect, it } from 'vitest'
import { base32Decode, base32Encode, generateTotp, verifyTotp } from './totp'

function asciiSecretToBase32(ascii: string): string {
  return base32Encode(new TextEncoder().encode(ascii))
}

// RFC 6238 Appendix B published test vectors (8-digit codes, T0=0, step=30s).
describe('TOTP against RFC 6238 Appendix B test vectors', () => {
  const seedSha1 = asciiSecretToBase32('12345678901234567890')
  const seedSha256 = asciiSecretToBase32('12345678901234567890123456789012')
  const seedSha512 = asciiSecretToBase32('1234567890123456789012345678901234567890123456789012345678901234')

  it('matches T=59s / SHA1', async () => {
    expect(await generateTotp(seedSha1, { digits: 8, algorithm: 'SHA-1' }, 59_000)).toBe('94287082')
  })

  it('matches T=59s / SHA256', async () => {
    expect(await generateTotp(seedSha256, { digits: 8, algorithm: 'SHA-256' }, 59_000)).toBe('46119246')
  })

  it('matches T=59s / SHA512', async () => {
    expect(await generateTotp(seedSha512, { digits: 8, algorithm: 'SHA-512' }, 59_000)).toBe('90693936')
  })

  it('matches T=1111111109s / SHA1', async () => {
    expect(await generateTotp(seedSha1, { digits: 8, algorithm: 'SHA-1' }, 1111111109_000)).toBe('07081804')
  })

  it('matches T=1234567890s / SHA1', async () => {
    expect(await generateTotp(seedSha1, { digits: 8, algorithm: 'SHA-1' }, 1234567890_000)).toBe('89005924')
  })
})

describe('base32Encode / base32Decode', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 250, 251, 252, 253, 254, 255])
    expect(Array.from(base32Decode(base32Encode(bytes)))).toEqual(Array.from(bytes))
  })
})

describe('verifyTotp', () => {
  const secret = asciiSecretToBase32('12345678901234567890')

  it('accepts a code from a nearby time step within the window', async () => {
    const code = await generateTotp(secret, { digits: 6 }, 1_000_000)
    expect(await verifyTotp(secret, code, { digits: 6 }, 1, 1_000_000 + 29_000)).toBe(true)
  })

  it('rejects a code far outside the verification window', async () => {
    const code = await generateTotp(secret, { digits: 6 }, 1_000_000)
    expect(await verifyTotp(secret, code, { digits: 6 }, 1, 1_000_000 + 300_000)).toBe(false)
  })
})
