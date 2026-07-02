// base58btc (Bitcoin alphabet) encode/decode — no native browser API exists
// for this, and it's the encoding multibase's "z" prefix uses for did:key.
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const ALPHABET_INDEX = new Map(Array.from(ALPHABET).map((char, i) => [char, i]))

export function base58btcEncode(bytes: Uint8Array): string {
  let value = 0n
  for (const byte of bytes) value = (value << 8n) + BigInt(byte)

  let digits = ''
  while (value > 0n) {
    digits = ALPHABET[Number(value % 58n)] + digits
    value /= 58n
  }

  let leadingZeros = 0
  for (const byte of bytes) {
    if (byte !== 0) break
    leadingZeros++
  }
  return '1'.repeat(leadingZeros) + digits
}

export function base58btcDecode(encoded: string): Uint8Array<ArrayBuffer> {
  let value = 0n
  for (const char of encoded) {
    const digit = ALPHABET_INDEX.get(char)
    if (digit === undefined) throw new Error(`"${char}" is not a valid base58btc character.`)
    value = value * 58n + BigInt(digit)
  }

  const bytes: number[] = []
  while (value > 0n) {
    bytes.unshift(Number(value % 256n))
    value /= 256n
  }

  let leadingOnes = 0
  for (const char of encoded) {
    if (char !== '1') break
    leadingOnes++
  }

  return new Uint8Array([...new Array(leadingOnes).fill(0), ...bytes])
}
