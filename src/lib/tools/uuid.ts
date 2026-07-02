// RFC 9562 (UUID) + the ULID spec. UUIDv7 and ULID both prefix a millisecond
// timestamp before random bits, so later-generated identifiers always sort
// after earlier ones.
const HEX = '0123456789abcdef'
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function generateUuidV4(): string {
  return crypto.randomUUID()
}

function bytesToUuidString(bytes: Uint8Array): string {
  const hex = Array.from(bytes).map((b) => HEX[b >> 4] + HEX[b & 0x0f]).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function timestampToBytes48(timeMs: number): Uint8Array {
  const bytes = new Uint8Array(6)
  let remaining = Math.floor(timeMs)
  for (let i = 5; i >= 0; i--) {
    bytes[i] = remaining % 256
    remaining = Math.floor(remaining / 256)
  }
  return bytes
}

export function generateUuidV7(timestampMs: number = Date.now()): string {
  const bytes = new Uint8Array(16)
  bytes.set(timestampToBytes48(timestampMs), 0)

  const random = crypto.getRandomValues(new Uint8Array(10))
  bytes[6] = 0x70 | (random[0] & 0x0f) // version 7
  bytes[7] = random[1]
  bytes[8] = 0x80 | (random[2] & 0x3f) // variant 10
  bytes.set(random.slice(3), 9)

  return bytesToUuidString(bytes)
}

function encodeTimeBase32(timeMs: number, length: number): string {
  let remaining = Math.floor(timeMs)
  let output = ''
  for (let i = 0; i < length; i++) {
    output = CROCKFORD_ALPHABET[remaining % 32] + output
    remaining = Math.floor(remaining / 32)
  }
  return output
}

function encodeRandomBase32(length: number): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(randomBytes).map((byte) => CROCKFORD_ALPHABET[byte % 32]).join('')
}

export function generateUlid(timestampMs: number = Date.now()): string {
  return encodeTimeBase32(timestampMs, 10) + encodeRandomBase32(16)
}
