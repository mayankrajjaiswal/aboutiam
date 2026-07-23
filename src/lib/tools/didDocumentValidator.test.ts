import { describe, expect, it } from 'vitest'
import { validateDidDocument } from './didDocumentValidator'

const VALID_DOC = {
  '@context': ['https://www.w3.org/ns/did/v1'],
  id: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  verificationMethod: [
    {
      id: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      type: 'Ed25519VerificationKey2020',
      controller: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    },
  ],
  authentication: ['did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'],
}

describe('didDocumentValidator.ts tests', () => {
  it('accepts a well-formed DID Document', () => {
    const result = validateDidDocument(VALID_DOC)
    expect(result.valid).toBe(true)
    expect(result.id).toBe(VALID_DOC.id)
    expect(result.verificationMethods).toHaveLength(1)
    expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0)
  })

  it('rejects a non-object input', () => {
    const result = validateDidDocument('not an object')
    expect(result.valid).toBe(false)
    expect(result.issues[0].severity).toBe('error')
  })

  it('flags a malformed id and a missing verificationMethod', () => {
    const result = validateDidDocument({ id: 'not-a-did' })
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('well-formed DID URI'))).toBe(true)
    expect(result.issues.some((i) => i.message.includes('verificationMethod'))).toBe(true)
  })

  it('flags an authentication reference that points at an undeclared verificationMethod id', () => {
    const doc = { ...VALID_DOC, authentication: ['did:key:z6Mk...#missing-key'] }
    const result = validateDidDocument(doc)
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('not declared in "verificationMethod"'))).toBe(true)
  })

  it('flags a verificationMethod missing public key material', () => {
    const doc = {
      ...VALID_DOC,
      verificationMethod: [{ id: VALID_DOC.verificationMethod[0].id, type: 'Ed25519VerificationKey2020', controller: VALID_DOC.id }],
    }
    const result = validateDidDocument(doc)
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('no recognized public key field'))).toBe(true)
  })

  it('warns (but does not error) when no authentication relationship is declared', () => {
    const { authentication, ...rest } = VALID_DOC
    void authentication
    const result = validateDidDocument(rest)
    expect(result.valid).toBe(true)
    expect(result.issues.some((i) => i.severity === 'warning' && i.message.includes('authentication'))).toBe(true)
  })
})
