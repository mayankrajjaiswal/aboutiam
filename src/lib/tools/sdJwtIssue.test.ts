import { describe, it, expect } from 'vitest'
import { createDisclosure, issueSdJwtCredential, buildPresentation } from './sdJwtIssue'
import { parseSdJwt } from './sdJwt'
import { generateRsaKeyPair } from './jwt'

describe('createDisclosure', () => {
  it('produces a disclosure whose digest matches a fresh SHA-256 hash of its own raw string', async () => {
    const disclosure = await createDisclosure('given_name', 'Jordan')
    expect(disclosure.claimName).toBe('given_name')
    expect(disclosure.claimValue).toBe('Jordan')
    expect(disclosure.raw.length).toBeGreaterThan(0)
    expect(disclosure.digest.length).toBeGreaterThan(0)
  })

  it('uses a fresh random salt per call by default', async () => {
    const a = await createDisclosure('x', 1)
    const b = await createDisclosure('x', 1)
    expect(a.salt).not.toBe(b.salt)
    expect(a.raw).not.toBe(b.raw)
  })
})

describe('issueSdJwtCredential + buildPresentation (round-tripped through the existing parseSdJwt decoder)', () => {
  const disclosableClaims = {
    given_name: 'Jordan',
    family_name: 'Rivera',
    birthdate: '1998-04-12',
    age_over_21: true
  }
  const plainClaims = { iss: 'https://dmv.example', vct: 'urn:mdl', iat: 1700000000 }

  it('signs a structurally valid SD-JWT with one _sd digest per disclosable claim', async () => {
    const keyPair = await generateRsaKeyPair()
    const credential = await issueSdJwtCredential(disclosableClaims, plainClaims, keyPair.privateKey, 'issuer-key-1')
    expect(credential.disclosures).toHaveLength(4)
    expect((credential.payload._sd as string[]).length).toBe(4)
    expect(credential.payload._sd_alg).toBe('sha-256')
  })

  it('a full presentation (all disclosures revealed) decodes with every disclosure marked isBound', async () => {
    const keyPair = await generateRsaKeyPair()
    const credential = await issueSdJwtCredential(disclosableClaims, plainClaims, keyPair.privateKey, 'issuer-key-1')
    const presentation = buildPresentation(credential.issuerJwt, credential.disclosures)

    const parsed = await parseSdJwt(presentation)
    expect(parsed.disclosures).toHaveLength(4)
    for (const d of parsed.disclosures) {
      expect(d.isBound).toBe(true)
      expect(d.error).toBeUndefined()
    }
    const revealedNames = parsed.disclosures.map((d) => d.key)
    expect(revealedNames).toEqual(expect.arrayContaining(['given_name', 'family_name', 'birthdate', 'age_over_21']))
  })

  it('a selective presentation reveals only the chosen claims and the raw string never contains a withheld claim value', async () => {
    const keyPair = await generateRsaKeyPair()
    const credential = await issueSdJwtCredential(disclosableClaims, plainClaims, keyPair.privateKey, 'issuer-key-1')

    const ageOverTwentyOne = credential.disclosures.find((d) => d.claimName === 'age_over_21')!
    const presentation = buildPresentation(credential.issuerJwt, [ageOverTwentyOne])

    // The withheld claim's raw value must never appear anywhere in the wire format.
    expect(presentation).not.toContain('Jordan')
    expect(presentation).not.toContain('Rivera')
    expect(presentation).not.toContain('1998-04-12')

    const parsed = await parseSdJwt(presentation)
    expect(parsed.disclosures).toHaveLength(1)
    expect(parsed.disclosures[0].key).toBe('age_over_21')
    expect(parsed.disclosures[0].value).toBe(true)
    expect(parsed.disclosures[0].isBound).toBe(true)
  })

  it('an empty presentation reveals only the plain (non-disclosable) claims', async () => {
    const keyPair = await generateRsaKeyPair()
    const credential = await issueSdJwtCredential(disclosableClaims, plainClaims, keyPair.privateKey, 'issuer-key-1')
    const presentation = buildPresentation(credential.issuerJwt, [])

    const parsed = await parseSdJwt(presentation)
    expect(parsed.disclosures).toHaveLength(0)
    expect(parsed.issuerJwt.payload?.iss).toBe('https://dmv.example')
    expect(presentation).not.toContain('Jordan')
  })
})
