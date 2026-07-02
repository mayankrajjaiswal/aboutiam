// Thin wrapper over crypto.subtle.digest. SHA-1 is included only for legacy
// checksum-compatibility use cases — Web Crypto has no MD5, and this plan
// deliberately doesn't hand-roll one (see FIXED_TODO.md §5.4).
export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

export async function digest(algorithm: HashAlgorithm, data: BufferSource): Promise<Uint8Array> {
  const buffer = await crypto.subtle.digest(algorithm, data)
  return new Uint8Array(buffer)
}

export async function digestText(algorithm: HashAlgorithm, text: string): Promise<Uint8Array> {
  return digest(algorithm, new TextEncoder().encode(text))
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}
