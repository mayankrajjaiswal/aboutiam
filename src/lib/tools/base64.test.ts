import { describe, expect, it } from 'vitest'
import { base64Decode, base64Encode, base64UrlDecode, base64UrlEncode } from './base64'

describe('base64 / base64url helpers', () => {
  it('round-trips plain ASCII text', () => {
    expect(base64Decode(base64Encode('hello world'))).toBe('hello world')
    expect(base64UrlDecode(base64UrlEncode('hello world'))).toBe('hello world')
  })

  it('is UTF-8 safe for non-Latin1 characters', () => {
    const text = 'héllo 世界 🔐'
    expect(base64UrlDecode(base64UrlEncode(text))).toBe(text)
  })

  it('produces URL-safe output with no padding', () => {
    const encoded = base64UrlEncode('any carnal pleasure')
    expect(encoded).not.toMatch(/[+/=]/)
  })

  it('matches the known JWT header segment', () => {
    // {"alg":"HS256","typ":"JWT"}
    expect(base64UrlEncode('{"alg":"HS256","typ":"JWT"}')).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
  })
})
