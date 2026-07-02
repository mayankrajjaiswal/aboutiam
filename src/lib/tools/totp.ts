// RFC 6238 (TOTP) built on RFC 4226 (HOTP). Base32 has no native browser API,
// so encode/decode are hand-rolled here (RFC 4648 §6).
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

export function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const output: number[] = []
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(output)
}

export function generateRandomBase32Secret(byteLength = 20): string {
  return base32Encode(crypto.getRandomValues(new Uint8Array(byteLength)))
}

export type TotpAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'

export interface TotpOptions {
  digits?: number
  period?: number
  algorithm?: TotpAlgorithm
}

function counterToBytes(counter: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(8)
  let c = counter
  for (let i = 7; i >= 0; i--) {
    bytes[i] = c & 0xff
    c = Math.floor(c / 256)
  }
  return bytes
}

async function hmacDigest(algorithm: TotpAlgorithm, keyBytes: Uint8Array<ArrayBuffer>, messageBytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: algorithm }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes)
  return new Uint8Array(signature)
}

export async function generateTotp(secretBase32: string, options: TotpOptions = {}, timestampMs: number = Date.now()): Promise<string> {
  const { digits = 6, period = 30, algorithm = 'SHA-1' } = options
  const counter = Math.floor(timestampMs / 1000 / period)
  const keyBytes = base32Decode(secretBase32)
  const hmac = await hmacDigest(algorithm, keyBytes, counterToBytes(counter))
  const offset = hmac[hmac.length - 1] & 0x0f
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (binCode % 10 ** digits).toString().padStart(digits, '0')
}

export async function verifyTotp(
  secretBase32: string,
  code: string,
  options: TotpOptions = {},
  windowSteps = 1,
  timestampMs: number = Date.now()
): Promise<boolean> {
  const { period = 30 } = options
  const trimmed = code.trim()
  for (let step = -windowSteps; step <= windowSteps; step++) {
    const candidate = await generateTotp(secretBase32, options, timestampMs + step * period * 1000)
    if (candidate === trimmed) return true
  }
  return false
}

export function buildOtpAuthUri(secretBase32: string, accountLabel: string, issuer: string, options: TotpOptions = {}): string {
  const { digits = 6, period = 30, algorithm = 'SHA-1' } = options
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: algorithm.replace('-', ''),
    digits: String(digits),
    period: String(period),
  })
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountLabel)}?${params.toString()}`
}

export function secondsRemainingInStep(period = 30, timestampMs: number = Date.now()): number {
  return period - (Math.floor(timestampMs / 1000) % period)
}
