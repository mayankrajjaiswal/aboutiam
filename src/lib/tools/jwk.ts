// JWK <-> PEM conversion and RFC 7638 thumbprints. Round-trips through
// crypto.subtle.importKey/exportKey rather than hand-parsing key material —
// the browser already knows how to re-encode RSA/EC keys correctly.
import { derToPem, pemToDer } from './pem'
import { base64UrlEncodeBytes } from './base64'
import { digestText } from './hash'

export type KeyKind = 'public' | 'private'

interface AlgAttempt {
  label: string
  importAlg: RsaHashedImportParams | EcKeyImportParams
}

const RSA_ATTEMPT: AlgAttempt = { label: 'RSA', importAlg: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } }
const EC_ATTEMPTS: AlgAttempt[] = [
  { label: 'EC P-256', importAlg: { name: 'ECDSA', namedCurve: 'P-256' } },
  { label: 'EC P-384', importAlg: { name: 'ECDSA', namedCurve: 'P-384' } },
  { label: 'EC P-521', importAlg: { name: 'ECDSA', namedCurve: 'P-521' } },
]

function usagesFor(kind: KeyKind): KeyUsage[] {
  return kind === 'private' ? ['sign'] : ['verify']
}

export async function jwkToPem(jwk: JsonWebKey): Promise<{ pem: string; kind: KeyKind; label: string }> {
  const kind: KeyKind = jwk.d ? 'private' : 'public'
  const attempts = jwk.kty === 'EC' ? EC_ATTEMPTS : [RSA_ATTEMPT]

  let lastError: unknown
  for (const attempt of attempts) {
    try {
      const key = await crypto.subtle.importKey('jwk', jwk, attempt.importAlg, true, usagesFor(kind))
      const format: 'pkcs8' | 'spki' = kind === 'private' ? 'pkcs8' : 'spki'
      const der = await crypto.subtle.exportKey(format, key)
      const label = kind === 'private' ? 'PRIVATE KEY' : 'PUBLIC KEY'
      return { pem: derToPem(new Uint8Array(der), label), kind, label: attempt.label }
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`Could not import this JWK as a recognized RSA or EC key (${String((lastError as Error)?.message ?? lastError)}).`)
}

export async function pemToJwk(pem: string): Promise<{ jwk: JsonWebKey; kind: KeyKind; label: string }> {
  const kind: KeyKind = /BEGIN (RSA |EC )?PRIVATE KEY/.test(pem) ? 'private' : 'public'
  const format = kind === 'private' ? 'pkcs8' : 'spki'
  const der = pemToDer(pem)
  const attempts = [RSA_ATTEMPT, ...EC_ATTEMPTS]

  let lastError: unknown
  for (const attempt of attempts) {
    try {
      const key = await crypto.subtle.importKey(format, der, attempt.importAlg, true, usagesFor(kind))
      const jwk = await crypto.subtle.exportKey('jwk', key)
      return { jwk, kind, label: attempt.label }
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`Could not parse this PEM as a recognized RSA or EC key (${String((lastError as Error)?.message ?? lastError)}).`)
}

// RFC 7638: canonicalize only the required members, in lexicographic key
// order, with no whitespace, then SHA-256 + base64url the UTF-8 bytes.
export async function computeJwkThumbprint(jwk: JsonWebKey): Promise<string> {
  let canonical: Record<string, string>
  if (jwk.kty === 'EC') {
    if (!jwk.crv || !jwk.x || !jwk.y) throw new Error('EC JWK is missing crv/x/y — cannot compute a thumbprint.')
    canonical = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }
  } else if (jwk.kty === 'RSA') {
    if (!jwk.e || !jwk.n) throw new Error('RSA JWK is missing e/n — cannot compute a thumbprint.')
    canonical = { e: jwk.e, kty: jwk.kty, n: jwk.n }
  } else {
    throw new Error(`Unsupported kty "${jwk.kty}" for thumbprint computation.`)
  }
  const json = JSON.stringify(canonical)
  return base64UrlEncodeBytes(await digestText('SHA-256', json))
}
