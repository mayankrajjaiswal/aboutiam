// Minimal CBOR (RFC 8949) decoder — only the subset WebAuthn actually emits:
// unsigned/negative integers, byte strings, text strings, arrays, maps, tags
// (unwrapped and skipped), and the true/false/null simple values. Definite-
// length only — browsers never emit indefinite-length CBOR for WebAuthn, so
// that form is rejected with a friendly error rather than supported.
export type CborValue = number | boolean | null | Uint8Array | string | CborValue[] | Map<CborValue, CborValue>

interface Cursor {
  bytes: Uint8Array
  offset: number
}

function readByte(c: Cursor): number {
  if (c.offset >= c.bytes.length) throw new Error('Unexpected end of CBOR data.')
  return c.bytes[c.offset++]
}

function readSlice(c: Cursor, length: number): Uint8Array {
  if (c.offset + length > c.bytes.length) throw new Error('Unexpected end of CBOR data.')
  const slice = c.bytes.subarray(c.offset, c.offset + length)
  c.offset += length
  return slice
}

function readLength(c: Cursor, additionalInfo: number): number {
  if (additionalInfo < 24) return additionalInfo
  if (additionalInfo === 24) return readByte(c)
  if (additionalInfo === 25) {
    const b = readSlice(c, 2)
    return (b[0] << 8) | b[1]
  }
  if (additionalInfo === 26) {
    const b = readSlice(c, 4)
    return ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0
  }
  if (additionalInfo === 27) {
    const b = readSlice(c, 8)
    let value = 0
    for (const byte of b) value = value * 256 + byte
    return value
  }
  throw new Error('Indefinite-length CBOR items are not supported (this decoder expects the definite-length encoding browsers emit for WebAuthn).')
}

function decodeValue(c: Cursor): CborValue {
  const initial = readByte(c)
  const majorType = initial >> 5
  const additionalInfo = initial & 0x1f

  switch (majorType) {
    case 0:
      return readLength(c, additionalInfo)
    case 1:
      return -1 - readLength(c, additionalInfo)
    case 2:
      return readSlice(c, readLength(c, additionalInfo))
    case 3:
      return new TextDecoder().decode(readSlice(c, readLength(c, additionalInfo)))
    case 4: {
      const length = readLength(c, additionalInfo)
      const arr: CborValue[] = []
      for (let i = 0; i < length; i++) arr.push(decodeValue(c))
      return arr
    }
    case 5: {
      const length = readLength(c, additionalInfo)
      const map = new Map<CborValue, CborValue>()
      for (let i = 0; i < length; i++) {
        const key = decodeValue(c)
        map.set(key, decodeValue(c))
      }
      return map
    }
    case 6:
      readLength(c, additionalInfo) // tag number — unwrap and return the tagged value as-is
      return decodeValue(c)
    case 7:
      if (additionalInfo === 20) return false
      if (additionalInfo === 21) return true
      if (additionalInfo === 22) return null
      throw new Error(`Unsupported CBOR simple value or float (additional info ${additionalInfo}).`)
    default:
      throw new Error(`Unsupported CBOR major type ${majorType}.`)
  }
}

export function decodeCbor(bytes: Uint8Array): CborValue {
  return decodeValue({ bytes, offset: 0 })
}
