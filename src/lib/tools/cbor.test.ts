import { describe, expect, it } from 'vitest'
import { decodeCbor } from './cbor'

describe('cbor decoder', () => {
  it('decodes unsigned integers (inline, 1-byte, and 2-byte forms)', () => {
    expect(decodeCbor(new Uint8Array([0x00]))).toBe(0)
    expect(decodeCbor(new Uint8Array([0x18, 0x2a]))).toBe(42)
    expect(decodeCbor(new Uint8Array([0x19, 0x01, 0xf4]))).toBe(500)
  })

  it('decodes a negative integer (COSE alg ES256 = -7)', () => {
    expect(decodeCbor(new Uint8Array([0x26]))).toBe(-7)
  })

  it('decodes a byte string', () => {
    expect(decodeCbor(new Uint8Array([0x42, 0x01, 0x02]))).toEqual(new Uint8Array([0x01, 0x02]))
  })

  it('decodes a text string', () => {
    expect(decodeCbor(new Uint8Array([0x63, 0x61, 0x62, 0x63]))).toBe('abc')
  })

  it('decodes an array', () => {
    expect(decodeCbor(new Uint8Array([0x83, 0x01, 0x02, 0x03]))).toEqual([1, 2, 3])
  })

  it('decodes a map', () => {
    expect(decodeCbor(new Uint8Array([0xa1, 0x61, 0x61, 0x01]))).toEqual(new Map([['a', 1]]))
  })

  it('decodes the simple values true/false/null', () => {
    expect(decodeCbor(new Uint8Array([0xf5]))).toBe(true)
    expect(decodeCbor(new Uint8Array([0xf4]))).toBe(false)
    expect(decodeCbor(new Uint8Array([0xf6]))).toBe(null)
  })

  it('unwraps a tagged value', () => {
    expect(decodeCbor(new Uint8Array([0xc1, 0x00]))).toBe(0)
  })

  it('rejects indefinite-length encoding', () => {
    expect(() => decodeCbor(new Uint8Array([0x5f]))).toThrow(/Indefinite-length/)
  })
})
