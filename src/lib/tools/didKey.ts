// did:key method (W3C DID Core + the did:key method spec): an Ed25519
// public key, multicodec-prefixed, base58btc-encoded, and multibase-prefixed
// with "z" — no registry, wallet, or blockchain involved.
import { base58btcEncode } from './base58'

// Ed25519 public key multicodec code (0xed) as an unsigned LEB128 varint.
const ED25519_PUB_MULTICODEC_PREFIX = new Uint8Array([0xed, 0x01])

export async function isEd25519Supported(): Promise<boolean> {
  try {
    await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify'])
    return true
  } catch {
    return false
  }
}

export async function generateEd25519KeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']) as Promise<CryptoKeyPair>
}

export async function exportRawPublicKey(publicKey: CryptoKey): Promise<Uint8Array<ArrayBuffer>> {
  const raw = await crypto.subtle.exportKey('raw', publicKey)
  return new Uint8Array(raw)
}

export function encodeDidKey(rawPublicKey: Uint8Array): string {
  if (rawPublicKey.length !== 32) throw new Error('An Ed25519 public key must be exactly 32 bytes.')
  const prefixed = new Uint8Array(ED25519_PUB_MULTICODEC_PREFIX.length + rawPublicKey.length)
  prefixed.set(ED25519_PUB_MULTICODEC_PREFIX, 0)
  prefixed.set(rawPublicKey, ED25519_PUB_MULTICODEC_PREFIX.length)
  return `did:key:z${base58btcEncode(prefixed)}`
}

export interface DidDocument {
  '@context': string[]
  id: string
  verificationMethod: { id: string; type: string; controller: string; publicKeyMultibase: string }[]
  authentication: string[]
  assertionMethod: string[]
}

export function buildDidDocument(did: string): DidDocument {
  const multibaseKey = did.slice('did:key:'.length)
  const verificationMethodId = `${did}#${multibaseKey}`
  return {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
    id: did,
    verificationMethod: [{
      id: verificationMethodId,
      type: 'Ed25519VerificationKey2020',
      controller: did,
      publicKeyMultibase: multibaseKey,
    }],
    authentication: [verificationMethodId],
    assertionMethod: [verificationMethodId],
  }
}
