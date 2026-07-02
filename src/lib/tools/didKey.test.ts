import { describe, expect, it } from 'vitest'
import { buildDidDocument, encodeDidKey, exportRawPublicKey, generateEd25519KeyPair, isEd25519Supported } from './didKey'

describe('did:key encoding', () => {
  it('encodes a known 32-byte Ed25519 public key into a did:key identifier', () => {
    // Cross-checked against an independently written base58btc encoder — see base58.test.ts.
    const pubkey = new Uint8Array(32).fill(1)
    expect(encodeDidKey(pubkey)).toBe('did:key:z6MkeXBLjYiSvqnhFb6D7sHm8yKm4jV45wwBFRaatf1cfZ76')
  })

  it('rejects a public key that is not exactly 32 bytes', () => {
    expect(() => encodeDidKey(new Uint8Array(31))).toThrow()
  })

  it('builds a DID document with a matching verification method and authentication reference', () => {
    const did = 'did:key:z6MkeXBLjYiSvqnhFb6D7sHm8yKm4jV45wwBFRaatf1cfZ76'
    const doc = buildDidDocument(did)
    expect(doc.id).toBe(did)
    expect(doc.verificationMethod[0].publicKeyMultibase).toBe('z6MkeXBLjYiSvqnhFb6D7sHm8yKm4jV45wwBFRaatf1cfZ76')
    expect(doc.verificationMethod[0].controller).toBe(did)
    expect(doc.authentication).toEqual([doc.verificationMethod[0].id])
    expect(doc.assertionMethod).toEqual([doc.verificationMethod[0].id])
  })

  it('generates a real Ed25519 keypair and derives a valid did:key end-to-end, when the runtime supports it', async () => {
    const supported = await isEd25519Supported()
    if (!supported) return // environment-dependent (older Node/browser) — covered by the pure-logic tests above regardless
    const { publicKey } = await generateEd25519KeyPair()
    const raw = await exportRawPublicKey(publicKey)
    expect(raw).toHaveLength(32)
    expect(encodeDidKey(raw)).toMatch(/^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]+$/)
  })
})
