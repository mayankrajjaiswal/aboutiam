// WebAuthn credential inspection: clientDataJSON (UTF-8 JSON), authenticatorData
// (fixed binary layout per WebAuthn L2 §6.1), and attestationObject (a CBOR
// map wrapping authData) — built on the generic decoder in lib/tools/cbor.ts.
import { base64UrlDecodeBytes } from './base64'
import { bytesToHex } from './hash'
import type { CborValue } from './cbor'
import { decodeCbor } from './cbor'

export interface ClientData {
  type?: string
  challenge?: string
  origin?: string
  crossOrigin?: boolean
  raw: Record<string, unknown>
}

export function decodeClientDataJson(base64url: string): ClientData {
  const bytes = base64UrlDecodeBytes(base64url.trim())
  const raw = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
  return {
    type: typeof raw.type === 'string' ? raw.type : undefined,
    challenge: typeof raw.challenge === 'string' ? raw.challenge : undefined,
    origin: typeof raw.origin === 'string' ? raw.origin : undefined,
    crossOrigin: typeof raw.crossOrigin === 'boolean' ? raw.crossOrigin : undefined,
    raw,
  }
}

export interface AuthenticatorDataFlags {
  userPresent: boolean
  userVerified: boolean
  backupEligible: boolean
  backupState: boolean
  attestedCredentialData: boolean
  extensionDataIncluded: boolean
}

export const FLAG_LABELS: Record<keyof AuthenticatorDataFlags, { short: string; description: string }> = {
  userPresent: { short: 'UP', description: 'User Present — the user touched/interacted with the authenticator.' },
  userVerified: { short: 'UV', description: 'User Verified — the user was verified (PIN, biometric, etc.), not just present.' },
  backupEligible: { short: 'BE', description: 'Backup Eligible — this credential is allowed to be backed up (e.g. synced passkeys).' },
  backupState: { short: 'BS', description: 'Backup State — this credential is currently backed up.' },
  attestedCredentialData: { short: 'AT', description: 'Attested Credential Data included — a new credential ID and public key follow.' },
  extensionDataIncluded: { short: 'ED', description: 'Extension Data included — client extension outputs follow.' },
}

export interface AttestedCredentialData {
  aaguidHex: string
  credentialIdHex: string
  publicKeyCose: Record<string, unknown>
}

export interface AuthenticatorData {
  rpIdHashHex: string
  flags: AuthenticatorDataFlags
  signCount: number
  attestedCredentialData: AttestedCredentialData | null
}

const COSE_KEY_LABELS: Record<number, string> = { 1: 'kty', 3: 'alg', [-1]: 'crv', [-2]: 'x', [-3]: 'y' }
const COSE_KTY_NAMES: Record<number, string> = { 1: 'OKP', 2: 'EC2', 3: 'RSA' }

function coseKeyToObject(map: Map<CborValue, CborValue>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [k, v] of map.entries()) {
    const label = typeof k === 'number' && k in COSE_KEY_LABELS ? COSE_KEY_LABELS[k] : String(k)
    if (v instanceof Uint8Array) obj[label] = bytesToHex(v)
    else if (label === 'kty' && typeof v === 'number') obj[label] = COSE_KTY_NAMES[v] ?? v
    else obj[label] = v
  }
  return obj
}

export function parseAuthenticatorData(bytes: Uint8Array): AuthenticatorData {
  if (bytes.length < 37) {
    throw new Error('authenticatorData is too short — expected at least 37 bytes (32-byte rpIdHash + 1-byte flags + 4-byte counter).')
  }
  const rpIdHash = bytes.subarray(0, 32)
  const flagsByte = bytes[32]
  const flags: AuthenticatorDataFlags = {
    userPresent: (flagsByte & 0x01) !== 0,
    userVerified: (flagsByte & 0x04) !== 0,
    backupEligible: (flagsByte & 0x08) !== 0,
    backupState: (flagsByte & 0x10) !== 0,
    attestedCredentialData: (flagsByte & 0x40) !== 0,
    extensionDataIncluded: (flagsByte & 0x80) !== 0,
  }
  const signCount = ((bytes[33] << 24) | (bytes[34] << 16) | (bytes[35] << 8) | bytes[36]) >>> 0

  let attestedCredentialData: AttestedCredentialData | null = null
  if (flags.attestedCredentialData) {
    let offset = 37
    if (bytes.length < offset + 18) throw new Error('Attested credential data flag (AT) is set, but authenticatorData is too short to contain it.')
    const aaguid = bytes.subarray(offset, offset + 16)
    offset += 16
    const credentialIdLength = (bytes[offset] << 8) | bytes[offset + 1]
    offset += 2
    if (bytes.length < offset + credentialIdLength) throw new Error('authenticatorData is truncated inside the credential ID.')
    const credentialId = bytes.subarray(offset, offset + credentialIdLength)
    offset += credentialIdLength
    const publicKeyCose = decodeCbor(bytes.subarray(offset))
    if (!(publicKeyCose instanceof Map)) throw new Error('The attested credential public key is not a valid COSE key map.')
    attestedCredentialData = {
      aaguidHex: bytesToHex(aaguid),
      credentialIdHex: bytesToHex(credentialId),
      publicKeyCose: coseKeyToObject(publicKeyCose),
    }
  }

  return { rpIdHashHex: bytesToHex(rpIdHash), flags, signCount, attestedCredentialData }
}

function cborMapToPlainObject(map: Map<CborValue, CborValue>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [k, v] of map.entries()) {
    const key = String(k)
    if (v instanceof Uint8Array) obj[key] = bytesToHex(v)
    else if (Array.isArray(v)) obj[key] = v.map((item) => (item instanceof Uint8Array ? bytesToHex(item) : item))
    else if (v instanceof Map) obj[key] = cborMapToPlainObject(v)
    else obj[key] = v
  }
  return obj
}

export interface ParsedAttestationObject {
  fmt: string
  attStmt: Record<string, unknown>
  authData: AuthenticatorData
}

export function parseAttestationObject(base64url: string): ParsedAttestationObject {
  const decoded = decodeCbor(base64UrlDecodeBytes(base64url.trim()))
  if (!(decoded instanceof Map)) {
    throw new Error('This does not look like a WebAuthn attestationObject — expected a top-level CBOR map with fmt/attStmt/authData.')
  }
  const fmt = decoded.get('fmt')
  const attStmtRaw = decoded.get('attStmt')
  const authDataRaw = decoded.get('authData')
  if (typeof fmt !== 'string' || !(authDataRaw instanceof Uint8Array)) {
    throw new Error('Missing required "fmt" or "authData" field in the attestation object.')
  }
  return {
    fmt,
    attStmt: attStmtRaw instanceof Map ? cborMapToPlainObject(attStmtRaw) : {},
    authData: parseAuthenticatorData(authDataRaw),
  }
}
