// Minimal DER (ASN.1 Distinguished Encoding Rules) TLV walker — the shared
// primitive that lib/tools/x509.ts builds X.509/CSR field extraction on top
// of. Deliberately hand-rolled rather than pulling in an npm ASN.1 library,
// per FIXED_TODO.md §1's "minimal new dependencies" principle. Only DER
// (not general BER) is supported — X.509 and PKCS#10 always use DER, and
// DER forbids indefinite-length encoding, which this walker rejects.

import { bytesToHex } from './hash'

export type TagClass = 'universal' | 'application' | 'context' | 'private'
const CLASS_NAMES: TagClass[] = ['universal', 'application', 'context', 'private']

export interface Asn1Node {
  tagClass: TagClass
  constructed: boolean
  tagNumber: number
  headerLength: number
  contentStart: number
  contentLength: number
  totalLength: number
  content: Uint8Array
}

// Universal-class tag numbers relevant to X.509/PKCS#10.
export const UNIVERSAL_TAG = {
  BOOLEAN: 0x01,
  INTEGER: 0x02,
  BIT_STRING: 0x03,
  OCTET_STRING: 0x04,
  NULL: 0x05,
  OBJECT_IDENTIFIER: 0x06,
  UTF8_STRING: 0x0c,
  SEQUENCE: 0x10,
  SET: 0x11,
  PRINTABLE_STRING: 0x13,
  T61_STRING: 0x14,
  IA5_STRING: 0x16,
  UTC_TIME: 0x17,
  GENERALIZED_TIME: 0x18,
} as const

export function parseTlv(bytes: Uint8Array, offset = 0): Asn1Node {
  if (offset >= bytes.length) throw new Error('Unexpected end of DER data while reading a tag.')
  const tagByte = bytes[offset]
  const tagClass = CLASS_NAMES[(tagByte >> 6) & 0x03]
  const constructed = (tagByte & 0x20) !== 0
  let tagNumber = tagByte & 0x1f
  let pos = offset + 1

  if (tagNumber === 0x1f) {
    tagNumber = 0
    let more = true
    while (more) {
      if (pos >= bytes.length) throw new Error('Unexpected end of DER data while reading a multi-byte tag number.')
      const b = bytes[pos++]
      tagNumber = (tagNumber << 7) | (b & 0x7f)
      more = (b & 0x80) !== 0
    }
  }

  if (pos >= bytes.length) throw new Error('Unexpected end of DER data while reading a length.')
  const lengthByte = bytes[pos++]
  let contentLength: number
  if ((lengthByte & 0x80) === 0) {
    contentLength = lengthByte
  } else {
    const numLengthBytes = lengthByte & 0x7f
    if (numLengthBytes === 0) {
      throw new Error('Indefinite-length encoding found — this is BER, not DER. X.509 certificates and CSRs are always DER-encoded.')
    }
    if (pos + numLengthBytes > bytes.length) throw new Error('Unexpected end of DER data while reading a multi-byte length.')
    contentLength = 0
    for (let i = 0; i < numLengthBytes; i++) contentLength = contentLength * 256 + bytes[pos++]
  }

  const contentStart = pos
  const contentEnd = contentStart + contentLength
  if (contentEnd > bytes.length) {
    throw new Error('A DER element claims more bytes than are available — the input may be truncated or not valid DER.')
  }

  return {
    tagClass,
    constructed,
    tagNumber,
    headerLength: contentStart - offset,
    contentStart,
    contentLength,
    totalLength: contentEnd - offset,
    content: bytes.subarray(contentStart, contentEnd),
  }
}

export function readChildren(node: Asn1Node, bytes: Uint8Array): Asn1Node[] {
  const children: Asn1Node[] = []
  let pos = node.contentStart
  const end = node.contentStart + node.contentLength
  while (pos < end) {
    const child = parseTlv(bytes, pos)
    children.push(child)
    pos += child.totalLength
  }
  return children
}

export function parseAll(bytes: Uint8Array): Asn1Node[] {
  const nodes: Asn1Node[] = []
  let pos = 0
  while (pos < bytes.length) {
    const node = parseTlv(bytes, pos)
    nodes.push(node)
    pos += node.totalLength
  }
  return nodes
}

export function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  const first = bytes[0]
  const arcs = [Math.floor(first / 40), first % 40]
  let value = 0
  for (let i = 1; i < bytes.length; i++) {
    const b = bytes[i]
    value = value * 128 + (b & 0x7f)
    if ((b & 0x80) === 0) {
      arcs.push(value)
      value = 0
    }
  }
  return arcs.join('.')
}

export function decodeInteger(bytes: Uint8Array): { hex: string; asNumber: number | null } {
  const hex = bytesToHex(bytes)
  let asNumber: number | null = null
  if (bytes.length > 0 && bytes.length <= 6) {
    let n = 0
    for (const b of bytes) n = n * 256 + b
    asNumber = n
  }
  return { hex, asNumber }
}

export function decodeBitString(bytes: Uint8Array): { unusedBits: number; bits: Uint8Array } {
  return { unusedBits: bytes[0] ?? 0, bits: bytes.subarray(1) }
}

export function decodeDerString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

export function decodeDerTime(bytes: Uint8Array, generalized: boolean): Date {
  const s = decodeDerString(bytes)
  const match = generalized
    ? s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
    : s.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
  if (!match) throw new Error(`Could not parse ${generalized ? 'GeneralizedTime' : 'UTCTime'} value "${s}".`)
  const parts = match.slice(1).map(Number)
  if (generalized) {
    const [year, month, day, hour, minute, second] = parts
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  }
  const [yy, month, day, hour, minute, second] = parts
  const year = yy >= 50 ? 1900 + yy : 2000 + yy
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
}
