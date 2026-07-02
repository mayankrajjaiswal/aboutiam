import { describe, expect, it } from 'vitest'
import { computeJwkThumbprint, jwkToPem, pemToJwk } from './jwk'

describe('JWK <-> PEM conversion', () => {
  it('round-trips an RSA keypair: JWK -> PEM -> JWK', async () => {
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify']
    )
    const publicJwk = await crypto.subtle.exportKey('jwk', publicKey)
    const privateJwk = await crypto.subtle.exportKey('jwk', privateKey)

    const { pem: publicPem, kind: publicKind } = await jwkToPem(publicJwk)
    expect(publicKind).toBe('public')
    expect(publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----/)

    const { pem: privatePem, kind: privateKind } = await jwkToPem(privateJwk)
    expect(privateKind).toBe('private')
    expect(privatePem).toMatch(/^-----BEGIN PRIVATE KEY-----/)

    const { jwk: roundTrippedPublic } = await pemToJwk(publicPem)
    expect(roundTrippedPublic.n).toBe(publicJwk.n)
    expect(roundTrippedPublic.e).toBe(publicJwk.e)

    const { jwk: roundTrippedPrivate, kind } = await pemToJwk(privatePem)
    expect(kind).toBe('private')
    expect(roundTrippedPrivate.n).toBe(privateJwk.n)
  })

  it('round-trips an EC P-256 keypair: JWK -> PEM -> JWK', async () => {
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    )
    const publicJwk = await crypto.subtle.exportKey('jwk', publicKey)
    const privateJwk = await crypto.subtle.exportKey('jwk', privateKey)

    const { pem: publicPem } = await jwkToPem(publicJwk)
    expect(publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----/)
    const { jwk: roundTrippedPublic } = await pemToJwk(publicPem)
    expect(roundTrippedPublic.x).toBe(publicJwk.x)
    expect(roundTrippedPublic.y).toBe(publicJwk.y)
    expect(roundTrippedPublic.crv).toBe('P-256')

    const { pem: privatePem } = await jwkToPem(privateJwk)
    const { jwk: roundTrippedPrivate } = await pemToJwk(privatePem)
    expect(roundTrippedPrivate.d).toBe(privateJwk.d)
  })

  it('computes the RFC 7638 thumbprint matching the spec appendix A.1 example', async () => {
    // RFC 7638 Appendix A.1 test vector.
    const jwk = {
      kty: 'RSA',
      n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw',
      e: 'AQAB',
    }
    expect(await computeJwkThumbprint(jwk)).toBe('NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs')
  })

  it('throws a friendly error for garbage input', async () => {
    await expect(pemToJwk('-----BEGIN PUBLIC KEY-----\nbm90IGEga2V5\n-----END PUBLIC KEY-----')).rejects.toThrow()
  })
})
