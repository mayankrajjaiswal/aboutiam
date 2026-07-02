import { describe, expect, it } from 'vitest'
import { base64UrlEncode, base64UrlEncodeBytes } from './base64'
import { digestText } from './hash'
import { parseSdJwt } from './sdJwt'

async function buildDisclosure(salt: string, key: string, value: unknown): Promise<{ raw: string; digest: string }> {
  const raw = base64UrlEncode(JSON.stringify([salt, key, value]))
  const digest = base64UrlEncodeBytes(await digestText('SHA-256', raw))
  return { raw, digest }
}

describe('sd-jwt parsing', () => {
  it('parses disclosures and verifies digest binding against the issuer JWT _sd array', async () => {
    const given = await buildDisclosure('saltAAA111', 'given_name', 'John')
    const family = await buildDisclosure('saltBBB222', 'family_name', 'Doe')
    const unbound = base64UrlEncode(JSON.stringify(['saltCCC333', 'nickname', 'Johnny']))

    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'sd+jwt' }))
    const payload = base64UrlEncode(JSON.stringify({
      iss: 'https://issuer.example.com',
      _sd_alg: 'sha-256',
      _sd: [given.digest, family.digest],
    }))
    const issuerJwt = `${header}.${payload}.deadbeef`
    const compact = `${issuerJwt}~${given.raw}~${family.raw}~${unbound}~`

    const result = await parseSdJwt(compact)
    expect(result.issuerJwt.payload?.iss).toBe('https://issuer.example.com')
    expect(result.sdAlg).toBe('sha-256')
    expect(result.keyBindingJwt).toBeNull()
    expect(result.disclosures).toHaveLength(3)

    const [d1, d2, d3] = result.disclosures
    expect(d1).toMatchObject({ key: 'given_name', value: 'John', isBound: true })
    expect(d2).toMatchObject({ key: 'family_name', value: 'Doe', isBound: true })
    expect(d3).toMatchObject({ key: 'nickname', value: 'Johnny', isBound: false })
  })

  it('follows nested _sd digests inside an already-disclosed object value', async () => {
    const inner = await buildDisclosure('saltInner', 'street', '123 Main St')
    const outer = await buildDisclosure('saltOuter', 'address', { _sd: [inner.digest] })

    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'sd+jwt' }))
    const payload = base64UrlEncode(JSON.stringify({ _sd: [outer.digest] }))
    const issuerJwt = `${header}.${payload}.sig`
    const compact = `${issuerJwt}~${outer.raw}~${inner.raw}~`

    const result = await parseSdJwt(compact)
    const [d1, d2] = result.disclosures
    expect(d1).toMatchObject({ key: 'address', isBound: true })
    expect(d2).toMatchObject({ key: 'street', value: '123 Main St', isBound: true })
  })

  it('parses an optional trailing key-binding JWT when present (no trailing tilde)', async () => {
    const given = await buildDisclosure('saltAAA111', 'given_name', 'John')
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'sd+jwt' }))
    const payload = base64UrlEncode(JSON.stringify({ _sd: [given.digest] }))
    const issuerJwt = `${header}.${payload}.sig`
    const kbHeader = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'kb+jwt' }))
    const kbPayload = base64UrlEncode(JSON.stringify({ aud: 'https://verifier.example.com', nonce: 'abc123' }))
    const kbJwt = `${kbHeader}.${kbPayload}.kbsig`

    const result = await parseSdJwt(`${issuerJwt}~${given.raw}~${kbJwt}`)
    expect(result.keyBindingJwt?.payload?.aud).toBe('https://verifier.example.com')
    expect(result.disclosures).toHaveLength(1)
  })

  it('defaults _sd_alg to sha-256 when absent from the payload', async () => {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'sd+jwt' }))
    const payload = base64UrlEncode(JSON.stringify({ _sd: [] }))
    const result = await parseSdJwt(`${header}.${payload}.sig~`)
    expect(result.sdAlg).toBe('sha-256')
  })

  it('throws a friendly error when the first segment is not a JWT', async () => {
    await expect(parseSdJwt('not-a-jwt~abc')).rejects.toThrow()
  })
})
