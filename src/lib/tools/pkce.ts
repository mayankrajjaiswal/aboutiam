import { base64UrlEncodeBytes } from './base64'

const VERIFIER_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

export function generateCodeVerifier(length = 64): string {
  if (length < 43 || length > 128) {
    throw new RangeError('PKCE code_verifier length must be between 43 and 128 characters (RFC 7636).')
  }
  const randomBytes = crypto.getRandomValues(new Uint8Array(length))
  let verifier = ''
  for (const byte of randomBytes) {
    verifier += VERIFIER_CHARSET[byte % VERIFIER_CHARSET.length]
  }
  return verifier
}

export async function deriveCodeChallengeS256(codeVerifier: string): Promise<string> {
  const digestBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  return base64UrlEncodeBytes(new Uint8Array(digestBuffer))
}

export interface AuthorizationUrlParams {
  authorizationEndpoint: string
  clientId: string
  redirectUri: string
  scope?: string
  state?: string
  codeChallenge: string
}

export function buildAuthorizationUrl(params: AuthorizationUrlParams): string {
  const url = new URL(params.authorizationEndpoint)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  if (params.scope) url.searchParams.set('scope', params.scope)
  if (params.state) url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}
