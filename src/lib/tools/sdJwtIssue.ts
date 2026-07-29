// SD-JWT (Selective Disclosure JWT) issuance — the inverse of sdJwt.ts's
// `parseSdJwt` decoder. Builds `_sd` digests and encodes disclosures using
// the exact same base64url + digest conventions the decoder expects, so a
// credential issued here round-trips through parseSdJwt without changes.
import { base64UrlEncode, base64UrlEncodeBytes } from './base64'
import { digestText } from './hash'
import { signJwtRsa } from './jwt'

export interface IssuedDisclosure {
  claimName: string
  claimValue: unknown
  salt: string
  raw: string
  digest: string
}

function generateSalt(): string {
  return base64UrlEncodeBytes(crypto.getRandomValues(new Uint8Array(16)))
}

/** Builds a single SD-JWT disclosure — base64url([salt, claimName, claimValue]) — and its SHA-256 digest. */
export async function createDisclosure(claimName: string, claimValue: unknown, salt: string = generateSalt()): Promise<IssuedDisclosure> {
  const raw = base64UrlEncode(JSON.stringify([salt, claimName, claimValue]))
  const digest = base64UrlEncodeBytes(await digestText('SHA-256', raw))
  return { claimName, claimValue, salt, raw, digest }
}

export interface IssuedCredential {
  issuerJwt: string
  disclosures: IssuedDisclosure[]
  payload: Record<string, unknown>
}

/**
 * Issues a full SD-JWT credential: every entry in `disclosableClaims` becomes
 * an independent disclosure; `plainClaims` (iss, iat, exp, vct, etc.) are
 * signed directly into the payload, visible to anyone holding the JWT.
 */
export async function issueSdJwtCredential(
  disclosableClaims: Record<string, unknown>,
  plainClaims: Record<string, unknown>,
  privateKey: CryptoKey,
  kid: string
): Promise<IssuedCredential> {
  const disclosures = await Promise.all(
    Object.entries(disclosableClaims).map(([claimName, claimValue]) => createDisclosure(claimName, claimValue))
  )
  const payload: Record<string, unknown> = {
    ...plainClaims,
    _sd: disclosures.map((d) => d.digest),
    _sd_alg: 'sha-256'
  }
  const issuerJwt = await signJwtRsa({ alg: 'RS256', typ: 'vc+sd-jwt', kid }, payload, privateKey)
  return { issuerJwt, disclosures, payload }
}

/**
 * Builds an OID4VP presentation: the issuer JWT plus only the chosen
 * disclosures, tilde-joined. Always ends with at least one `~` (per SD-JWT's
 * minimum compact form of "<jwt>~") even with zero disclosures revealed.
 */
export function buildPresentation(issuerJwt: string, disclosuresToReveal: IssuedDisclosure[]): string {
  return [issuerJwt, ...disclosuresToReveal.map((d) => d.raw), ''].join('~')
}
