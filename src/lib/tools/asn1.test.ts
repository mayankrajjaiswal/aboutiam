import { describe, expect, it } from 'vitest'
import {
  decodeBitString,
  decodeDerTime,
  decodeInteger,
  decodeOid,
  parseAll,
  parseTlv,
  readChildren,
  UNIVERSAL_TAG,
} from './asn1'

// SEQUENCE { INTEGER 5, OCTET STRING "ab" }
const SEQUENCE_BYTES = new Uint8Array([0x30, 0x07, 0x02, 0x01, 0x05, 0x04, 0x02, 0x61, 0x62])

describe('asn1 DER TLV walker', () => {
  it('parses a top-level SEQUENCE header correctly', () => {
    const node = parseTlv(SEQUENCE_BYTES)
    expect(node.tagClass).toBe('universal')
    expect(node.constructed).toBe(true)
    expect(node.tagNumber).toBe(UNIVERSAL_TAG.SEQUENCE)
    expect(node.contentLength).toBe(7)
    expect(node.totalLength).toBe(9)
  })

  it('walks children of a constructed node', () => {
    const [sequence] = parseAll(SEQUENCE_BYTES)
    const children = readChildren(sequence, SEQUENCE_BYTES)
    expect(children).toHaveLength(2)
    expect(children[0].tagNumber).toBe(UNIVERSAL_TAG.INTEGER)
    expect(decodeInteger(children[0].content).asNumber).toBe(5)
    expect(children[1].tagNumber).toBe(UNIVERSAL_TAG.OCTET_STRING)
    expect(new TextDecoder().decode(children[1].content)).toBe('ab')
  })

  it('decodes long-form (multi-byte) lengths', () => {
    const content = new Uint8Array(200).fill(0x41)
    const bytes = new Uint8Array([0x04, 0x81, 0xc8, ...content])
    const node = parseTlv(bytes)
    expect(node.contentLength).toBe(200)
    expect(node.totalLength).toBe(203)
    expect(node.content).toHaveLength(200)
  })

  it('decodes an OBJECT IDENTIFIER (commonName, 2.5.4.3)', () => {
    expect(decodeOid(new Uint8Array([0x55, 0x04, 0x03]))).toBe('2.5.4.3')
  })

  it('decodes an OBJECT IDENTIFIER with a multi-byte arc (rsaEncryption)', () => {
    // 1.2.840.113549.1.1.1
    expect(decodeOid(new Uint8Array([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]))).toBe('1.2.840.113549.1.1.1')
  })

  it('decodes an INTEGER with DER leading-zero padding', () => {
    const { hex, asNumber } = decodeInteger(new Uint8Array([0x00, 0xff]))
    expect(hex).toBe('00ff')
    expect(asNumber).toBe(255)
  })

  it('decodes a BIT STRING (unused-bits byte + payload)', () => {
    const { unusedBits, bits } = decodeBitString(new Uint8Array([0x00, 0xa0]))
    expect(unusedBits).toBe(0)
    expect(Array.from(bits)).toEqual([0xa0])
  })

  it('decodes UTCTime and GeneralizedTime consistently', () => {
    const utc = decodeDerTime(new TextEncoder().encode('250101120000Z'), false)
    const generalized = decodeDerTime(new TextEncoder().encode('20250101120000Z'), true)
    expect(utc.toISOString()).toBe('2025-01-01T12:00:00.000Z')
    expect(generalized.toISOString()).toBe('2025-01-01T12:00:00.000Z')
  })

  it('applies the UTCTime 50/50 pivot year rule', () => {
    expect(decodeDerTime(new TextEncoder().encode('490101000000Z'), false).getUTCFullYear()).toBe(2049)
    expect(decodeDerTime(new TextEncoder().encode('500101000000Z'), false).getUTCFullYear()).toBe(1950)
  })

  it('rejects indefinite-length (BER) encoding', () => {
    expect(() => parseTlv(new Uint8Array([0x30, 0x80, 0x00, 0x00]))).toThrow(/Indefinite-length/)
  })

  it('rejects truncated input', () => {
    expect(() => parseTlv(new Uint8Array([0x30, 0x0a, 0x01]))).toThrow()
  })
})
