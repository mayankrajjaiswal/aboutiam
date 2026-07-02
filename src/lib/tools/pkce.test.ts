import { describe, expect, it } from 'vitest'
import { buildAuthorizationUrl, deriveCodeChallengeS256, generateCodeVerifier } from './pkce'

describe('deriveCodeChallengeS256 against the RFC 7636 Appendix B example', () => {
  it('matches the published verifier/challenge pair', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    expect(await deriveCodeChallengeS256(verifier)).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
  })
})

describe('generateCodeVerifier', () => {
  it('generates a verifier within the RFC 7636 length bounds using the allowed charset', () => {
    const verifier = generateCodeVerifier(64)
    expect(verifier).toHaveLength(64)
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/)
  })

  it('rejects lengths outside 43-128', () => {
    expect(() => generateCodeVerifier(10)).toThrow()
    expect(() => generateCodeVerifier(200)).toThrow()
  })
})

describe('buildAuthorizationUrl', () => {
  it('assembles a URL with S256 method and all required params', () => {
    const url = buildAuthorizationUrl({
      authorizationEndpoint: 'https://idp.example.com/authorize',
      clientId: 'client-123',
      redirectUri: 'https://app.example.com/callback',
      scope: 'openid profile',
      state: 'xyz',
      codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    })
    const parsed = new URL(url)
    expect(parsed.searchParams.get('response_type')).toBe('code')
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256')
    expect(parsed.searchParams.get('code_challenge')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
    expect(parsed.searchParams.get('client_id')).toBe('client-123')
  })
})
