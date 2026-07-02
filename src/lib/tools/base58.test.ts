import { describe, expect, it } from 'vitest'
import { base58btcDecode, base58btcEncode } from './base58'

describe('base58btc', () => {
  it('round-trips arbitrary byte sequences', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 250, 251, 252, 0, 0, 42])
    expect(Array.from(base58btcDecode(base58btcEncode(bytes)))).toEqual(Array.from(bytes))
  })

  it('preserves leading zero bytes as leading "1" characters', () => {
    expect(base58btcEncode(new Uint8Array([0, 0, 0]))).toBe('111')
    expect(Array.from(base58btcDecode('111'))).toEqual([0, 0, 0])
  })

  // Cross-checked against an independently written (non-BigInt, array long
  // division) base58btc encoder — see the multicodec-prefixed vectors below.
  it('matches an independently computed multicodec-prefixed did:key encoding', () => {
    const prefix = new Uint8Array([0xed, 0x01])
    const pubkeyAllOnes = new Uint8Array(32).fill(1)
    const encoded1 = base58btcEncode(new Uint8Array([...prefix, ...pubkeyAllOnes]))
    expect(encoded1).toBe('z6MkeXBLjYiSvqnhFb6D7sHm8yKm4jV45wwBFRaatf1cfZ76'.slice(1))

    const pubkeyPattern = new Uint8Array(32).map((_, i) => (i * 7 + 3) % 256)
    const encoded2 = base58btcEncode(new Uint8Array([...prefix, ...pubkeyPattern]))
    expect(encoded2).toBe('z6Mkef8AunHq44LfTfpb3S9GFtgESqsk8VkFKwpbB4Z3PvK5'.slice(1))
  })

  it('throws on a character outside the base58btc alphabet', () => {
    expect(() => base58btcDecode('0OIl')).toThrow()
  })
})
