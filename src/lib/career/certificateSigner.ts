// A pure client-side app cannot keep a signing private key secret — every byte of
// application code (including any embedded key) ships to, and is inspectable in,
// the browser. This means a certificate produced here can NOT honestly be called an
// "unforgeable" proof of completion. It only proves internal self-consistency: that
// the certificate's claimed contents match its own embedded signature — functioning
// as a tamper-evidence checksum, not a security guarantee. This limitation is
// disclosed in the UI on both the certificate and the verifier tool, not just here.
import { CERTIFICATE_PUBLIC_KEY_JWK, CERTIFICATE_PRIVATE_KEY_JWK } from './certificateKeys'
import { bytesToBase64, base64ToBytes } from '../tools/base64'

export interface CertificatePayload {
  recipientName: string
  completedModuleCount: number
  totalModuleCount: number
  completedLabCount: number
  issuedOn: string
  certificateId: string
}

export interface SignedCertificate {
  payload: CertificatePayload
  signature: string
  publicKeyJwk: JsonWebKey
}

/** Deterministic key ordering so the same payload always canonicalizes to the same bytes. */
function canonicalize(payload: CertificatePayload): string {
  return JSON.stringify({
    recipientName: payload.recipientName,
    completedModuleCount: payload.completedModuleCount,
    totalModuleCount: payload.totalModuleCount,
    completedLabCount: payload.completedLabCount,
    issuedOn: payload.issuedOn,
    certificateId: payload.certificateId,
  })
}

async function importPrivateKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    CERTIFICATE_PRIVATE_KEY_JWK,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )
}

async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify']
  )
}

export async function signCertificate(payload: CertificatePayload): Promise<SignedCertificate> {
  const privateKey = await importPrivateKey()
  const data = new TextEncoder().encode(canonicalize(payload))
  const signatureBytes = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, data)

  return {
    payload,
    signature: bytesToBase64(new Uint8Array(signatureBytes)),
    publicKeyJwk: CERTIFICATE_PUBLIC_KEY_JWK,
  }
}

/** Verifies a certificate's signature against its own claimed payload — see the module-level honesty caveat above. */
export async function verifyCertificate(signed: SignedCertificate): Promise<boolean> {
  try {
    const publicKey = await importPublicKey(signed.publicKeyJwk)
    const data = new TextEncoder().encode(canonicalize(signed.payload))
    const signatureBytes = base64ToBytes(signed.signature)
    return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, signatureBytes, data)
  } catch {
    return false
  }
}
