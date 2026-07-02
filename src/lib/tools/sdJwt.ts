// SD-JWT (Selective Disclosure JWT) compact-serialization parsing:
// <issuer-signed-jwt>~<disclosure>~<disclosure>~...~[<kb-jwt>]. Reuses the
// existing lib/tools/jwt.ts decoder for both JWT segments rather than
// re-implementing JWT parsing.
import { base64UrlDecode, base64UrlEncodeBytes } from './base64'
import { digestText } from './hash'
import { decodeJwt } from './jwt'
import type { DecodedJwt } from './jwt'

export interface Disclosure {
  raw: string
  salt: string
  key: string | null
  value: unknown
  digest: string
  isBound: boolean
  error?: string
}

export interface ParsedSdJwt {
  issuerJwt: DecodedJwt
  disclosures: Disclosure[]
  keyBindingJwt: DecodedJwt | null
  sdAlg: string
}

interface DecodedDisclosureShape {
  salt: string
  key: string | null
  value: unknown
}

// A disclosure is base64url([salt, key, value]) for an object property, or
// base64url([salt, value]) for an array element (SD-JWT §5.2.2/5.2.3).
function decodeDisclosureShape(raw: string): DecodedDisclosureShape | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(base64UrlDecode(raw))
  } catch {
    return null
  }
  if (!Array.isArray(parsed)) return null
  if (parsed.length === 3) return { salt: String(parsed[0]), key: String(parsed[1]), value: parsed[2] }
  if (parsed.length === 2) return { salt: String(parsed[0]), key: null, value: parsed[1] }
  return null
}

// Walks a decoded JWT payload (or a disclosed value, which may itself carry
// further nested _sd digests per SD-JWT's recursive disclosure rules) and
// collects every digest referenced anywhere in an `_sd` array.
function collectSdDigests(node: unknown, into: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectSdDigests(item, into)
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === '_sd' && Array.isArray(value)) {
        for (const digest of value) if (typeof digest === 'string') into.add(digest)
      } else {
        collectSdDigests(value, into)
      }
    }
  }
}

export async function parseSdJwt(compact: string): Promise<ParsedSdJwt> {
  const segments = compact.trim().split('~')
  if (segments.length < 2) {
    throw new Error('Not a valid SD-JWT — expected "<jwt>~<disclosure>~...~[<kb-jwt>]" (tilde-delimited).')
  }

  const issuerJwt = decodeJwt(segments[0])
  if (!issuerJwt.isStructurallyValid) throw new Error('The first segment is not a structurally valid JWT.')

  const rest = segments.slice(1).filter((s) => s.length > 0)
  const shapes = rest.map(decodeDisclosureShape)

  // Distinguish trailing disclosures from an optional key-binding JWT by
  // shape rather than trailing-tilde presence alone — real-world pasted
  // values aren't always perfectly spec-formatted.
  let keyBindingJwt: DecodedJwt | null = null
  let disclosureRaws = rest
  let disclosureShapes = shapes
  if (rest.length > 0 && shapes[shapes.length - 1] === null) {
    keyBindingJwt = decodeJwt(rest[rest.length - 1])
    disclosureRaws = rest.slice(0, -1)
    disclosureShapes = shapes.slice(0, -1)
  }

  const sdAlg = typeof issuerJwt.payload?._sd_alg === 'string' ? (issuerJwt.payload._sd_alg as string) : 'sha-256'

  const allSdDigests = new Set<string>()
  collectSdDigests(issuerJwt.payload, allSdDigests)
  for (const shape of disclosureShapes) if (shape) collectSdDigests(shape.value, allSdDigests)

  const disclosures: Disclosure[] = []
  for (let i = 0; i < disclosureRaws.length; i++) {
    const raw = disclosureRaws[i]
    const shape = disclosureShapes[i]
    if (!shape) {
      disclosures.push({ raw, salt: '', key: null, value: null, digest: '', isBound: false, error: 'Could not decode this disclosure.' })
      continue
    }
    const digest = base64UrlEncodeBytes(await digestText('SHA-256', raw))
    disclosures.push({ raw, salt: shape.salt, key: shape.key, value: shape.value, digest, isBound: allSdDigests.has(digest) })
  }

  return { issuerJwt, disclosures, keyBindingJwt, sdAlg }
}
