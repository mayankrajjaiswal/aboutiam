import type { HashAlgorithm } from './hash'
import { bytesToHex } from './hash'

export async function hmacSign(algorithm: HashAlgorithm, key: string, message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return new Uint8Array(signature)
}

export async function hmacSignHex(algorithm: HashAlgorithm, key: string, message: string): Promise<string> {
  return bytesToHex(await hmacSign(algorithm, key, message))
}

// Comparisons here are for UI feedback on user-supplied values, not for
// gating real authentication decisions, so a simple XOR-accumulate compare
// (rather than a hardened constant-time primitive) is sufficient.
export function timingSafeEqualHex(a: string, b: string): boolean {
  const normA = a.trim().toLowerCase()
  const normB = b.trim().toLowerCase()
  if (normA.length !== normB.length) return false
  let diff = 0
  for (let i = 0; i < normA.length; i++) {
    diff |= normA.charCodeAt(i) ^ normB.charCodeAt(i)
  }
  return diff === 0
}
