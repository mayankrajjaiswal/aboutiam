import { describe, expect, it } from 'vitest'
import { base64UrlEncode } from './base64'
import { decodeJwt, exportPublicKeyJwk, generateRsaKeyPair, isWeakAlg, signJwtHmac, signJwtRsa, verifyJwtHmac, verifyJwtRsa } from './jwt'

// The canonical jwt.io example token/secret.
const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
const SAMPLE_SECRET = 'your-256-bit-secret'

describe('decodeJwt', () => {
  it('decodes the header and payload of a well-formed token', () => {
    const decoded = decodeJwt(SAMPLE_TOKEN)
    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(decoded.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 })
    expect(decoded.isStructurallyValid).toBe(true)
  })

  it('flags a structurally malformed token', () => {
    const decoded = decodeJwt('not-a-jwt')
    expect(decoded.isStructurallyValid).toBe(false)
  })

  it('reports a header parse error for invalid base64url JSON', () => {
    const decoded = decodeJwt('%%%.eyJhIjoxfQ.sig')
    expect(decoded.headerError).toBeDefined()
  })
})

describe('HMAC signing and verification', () => {
  it('verifies the canonical jwt.io sample against its known secret', async () => {
    expect(await verifyJwtHmac(SAMPLE_TOKEN, SAMPLE_SECRET)).toBe(true)
  })

  it('rejects the sample token against the wrong secret', async () => {
    expect(await verifyJwtHmac(SAMPLE_TOKEN, 'wrong-secret')).toBe(false)
  })

  it('round-trips a freshly signed token', async () => {
    const token = await signJwtHmac('HS256', { alg: 'HS256', typ: 'JWT' }, { sub: 'abc123' }, 'my-secret')
    expect(await verifyJwtHmac(token, 'my-secret')).toBe(true)
    expect(await verifyJwtHmac(token, 'not-my-secret')).toBe(false)
  })

  it('detects tampering with the payload', async () => {
    const token = await signJwtHmac('HS256', { alg: 'HS256', typ: 'JWT' }, { role: 'user' }, 'my-secret')
    const [header, , signature] = token.split('.')
    const tamperedPayload = base64UrlEncode(JSON.stringify({ role: 'admin' }))
    const tampered = `${header}.${tamperedPayload}.${signature}`
    expect(await verifyJwtHmac(tampered, 'my-secret')).toBe(false)
  })
})

describe('RSA signing and verification', () => {
  it('round-trips a freshly signed RS256 token against its own public key', async () => {
    const keyPair = await generateRsaKeyPair()
    const token = await signJwtRsa({ alg: 'RS256', typ: 'JWT' }, { sub: 'abc123' }, keyPair.privateKey)
    expect(await verifyJwtRsa(token, keyPair.publicKey)).toBe(true)
  })

  it('rejects a token signed by a different keypair', async () => {
    const keyPairA = await generateRsaKeyPair()
    const keyPairB = await generateRsaKeyPair()
    const token = await signJwtRsa({ alg: 'RS256', typ: 'JWT' }, { sub: 'abc123' }, keyPairA.privateKey)
    expect(await verifyJwtRsa(token, keyPairB.publicKey)).toBe(false)
  })

  it('detects tampering with the payload of an RS256 token', async () => {
    const keyPair = await generateRsaKeyPair()
    const token = await signJwtRsa({ alg: 'RS256', typ: 'JWT' }, { role: 'user' }, keyPair.privateKey)
    const [header, , signature] = token.split('.')
    const tamperedPayload = base64UrlEncode(JSON.stringify({ role: 'admin' }))
    const tampered = `${header}.${tamperedPayload}.${signature}`
    expect(await verifyJwtRsa(tampered, keyPair.publicKey)).toBe(false)
  })

  it('rejects a non-RS256 token', async () => {
    const keyPair = await generateRsaKeyPair()
    const token = await signJwtHmac('HS256', { alg: 'HS256', typ: 'JWT' }, { sub: 'abc123' }, 'secret')
    expect(await verifyJwtRsa(token, keyPair.publicKey)).toBe(false)
  })

  it('exports a public key as a JWKS-ready JWK tagged with kid/use/alg', async () => {
    const keyPair = await generateRsaKeyPair()
    const jwk = await exportPublicKeyJwk(keyPair.publicKey, 'my-key-id')
    expect(jwk.kty).toBe('RSA')
    expect(jwk.use).toBe('sig')
    expect(jwk.alg).toBe('RS256')
    expect(jwk.kid).toBe('my-key-id')
    expect(jwk.n).toBeDefined()
    expect(jwk.e).toBeDefined()
  })
})

describe('isWeakAlg', () => {
  it('flags "none" and empty algorithms as weak', () => {
    expect(isWeakAlg('none')).toBe(true)
    expect(isWeakAlg(undefined)).toBe(true)
    expect(isWeakAlg('')).toBe(true)
  })

  it('does not flag a real algorithm', () => {
    expect(isWeakAlg('HS256')).toBe(false)
  })
})
