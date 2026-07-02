import { base64UrlDecode, base64UrlEncode, base64UrlEncodeBytes } from './base64'
import type { HashAlgorithm } from './hash'
import { hmacSign } from './hmac'
import { derToPem } from './pem'

export interface DecodedJwt {
  header: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  signature: string
  headerRaw: string
  payloadRaw: string
  isStructurallyValid: boolean
  headerError?: string
  payloadError?: string
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.')
  const [headerRaw = '', payloadRaw = '', signature = ''] = parts

  let header: Record<string, unknown> | null = null
  let headerError: string | undefined
  try {
    header = JSON.parse(base64UrlDecode(headerRaw))
  } catch {
    headerError = 'Could not parse header as JSON.'
  }

  let payload: Record<string, unknown> | null = null
  let payloadError: string | undefined
  try {
    payload = JSON.parse(base64UrlDecode(payloadRaw))
  } catch {
    payloadError = 'Could not parse payload as JSON.'
  }

  return {
    header,
    payload,
    signature,
    headerRaw,
    payloadRaw,
    isStructurallyValid: parts.length === 3 && headerRaw !== '' && payloadRaw !== '',
    headerError,
    payloadError,
  }
}

export type SupportedHmacAlg = 'HS256' | 'HS384' | 'HS512'

const HS_ALG_TO_HASH: Record<SupportedHmacAlg, HashAlgorithm> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

export async function signJwtHmac(alg: SupportedHmacAlg, header: object, payload: object, secret: string): Promise<string> {
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${headerB64}.${payloadB64}`
  const signatureBytes = await hmacSign(HS_ALG_TO_HASH[alg], secret, signingInput)
  return `${signingInput}.${base64UrlEncodeBytes(signatureBytes)}`
}

export async function verifyJwtHmac(token: string, secret: string): Promise<boolean> {
  const decoded = decodeJwt(token)
  const alg = decoded.header?.alg
  if (typeof alg !== 'string' || !(alg in HS_ALG_TO_HASH)) return false
  const signingInput = `${decoded.headerRaw}.${decoded.payloadRaw}`
  const expectedSignature = base64UrlEncodeBytes(
    await hmacSign(HS_ALG_TO_HASH[alg as SupportedHmacAlg], secret, signingInput)
  )
  return expectedSignature === decoded.signature
}

export async function generateRsaKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  ) as Promise<CryptoKeyPair>
}

export async function exportPublicKeyPem(publicKey: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey('spki', publicKey)
  return derToPem(new Uint8Array(spki), 'PUBLIC KEY')
}

export async function signJwtRsa(header: object, payload: object, privateKey: CryptoKey): Promise<string> {
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${headerB64}.${payloadB64}`
  const signatureBuffer = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(signingInput))
  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signatureBuffer))}`
}

export function isWeakAlg(alg: unknown): boolean {
  return alg === 'none' || alg === null || alg === undefined || alg === ''
}

export function formatClaimTimestamp(value: unknown, now: number = Date.now()): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const date = new Date(value * 1000)
  const diffMs = date.getTime() - now
  return `${date.toLocaleString()} (${formatRelative(Math.abs(diffMs) / 1000, diffMs < 0)})`
}

function formatRelative(diffAbsSec: number, isPast: boolean): string {
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    if (diffAbsSec >= secs) {
      const count = Math.floor(diffAbsSec / secs)
      const plural = count === 1 ? label : `${label}s`
      return isPast ? `${count} ${plural} ago` : `in ${count} ${plural}`
    }
  }
  return isPast ? 'moments ago' : 'in moments'
}
