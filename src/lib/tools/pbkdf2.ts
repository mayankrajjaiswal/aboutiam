// PBKDF2 (RFC 8018) key derivation over Web Crypto's crypto.subtle.deriveBits.
// Encodes a self-describing string ("pbkdf2$<hash>$<iterations>$<saltHex>$<hashHex>")
// so a derived hash can be verified later without separately storing its parameters —
// the same convention bcrypt/argon2 encoded hashes use.
export type Pbkdf2HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512'

const DEFAULT_ITERATIONS = 600_000
const DEFAULT_KEY_LENGTH_BITS = 256

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const clean = hex.trim()
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16)
  return out
}

export function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

async function deriveBits(password: string, saltHex: string, iterations: number, hash: Pbkdf2HashAlgorithm, keyLengthBits: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations, hash },
    keyMaterial,
    keyLengthBits
  )
  return new Uint8Array(derived)
}

export interface Pbkdf2DeriveResult {
  encoded: string
  hashHex: string
  saltHex: string
  iterations: number
  hash: Pbkdf2HashAlgorithm
}

export async function derivePbkdf2(
  password: string,
  options: { saltHex?: string; iterations?: number; hash?: Pbkdf2HashAlgorithm; keyLengthBits?: number } = {}
): Promise<Pbkdf2DeriveResult> {
  const iterations = options.iterations ?? DEFAULT_ITERATIONS
  const hash = options.hash ?? 'SHA-256'
  const keyLengthBits = options.keyLengthBits ?? DEFAULT_KEY_LENGTH_BITS
  const saltHex = options.saltHex ?? generateSaltHex()

  const bits = await deriveBits(password, saltHex, iterations, hash, keyLengthBits)
  const hashHex = bytesToHex(bits)
  const encoded = `pbkdf2$${hash}$${iterations}$${saltHex}$${hashHex}`

  return { encoded, hashHex, saltHex, iterations, hash }
}

export async function verifyPbkdf2(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.trim().split('$')
  if (parts.length !== 5 || parts[0] !== 'pbkdf2') {
    throw new Error('Invalid PBKDF2 hash format — expected "pbkdf2$<hash>$<iterations>$<saltHex>$<hashHex>".')
  }
  const [, hashName, iterationsStr, saltHex, expectedHashHex] = parts
  if (!['SHA-256', 'SHA-384', 'SHA-512'].includes(hashName)) {
    throw new Error(`Unsupported hash algorithm "${hashName}" in PBKDF2 encoded string.`)
  }
  const iterations = parseInt(iterationsStr, 10)
  if (!Number.isFinite(iterations) || iterations <= 0) {
    throw new Error('Invalid iteration count in PBKDF2 encoded string.')
  }
  const keyLengthBits = (expectedHashHex.length / 2) * 8
  const bits = await deriveBits(password, saltHex, iterations, hashName as Pbkdf2HashAlgorithm, keyLengthBits)
  const actualHashHex = bytesToHex(bits)
  return actualHashHex === expectedHashHex
}
