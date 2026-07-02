import { describe, expect, it } from 'vitest'
import { hmacSignHex, timingSafeEqualHex } from './hmac'

describe('hmac.ts against RFC 4231 test case 1', () => {
  const key = String.fromCharCode(0x0b).repeat(20)
  const data = 'Hi There'

  it('computes HMAC-SHA-256', async () => {
    expect(await hmacSignHex('SHA-256', key, data)).toBe(
      'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7'
    )
  })

  it('computes HMAC-SHA-512', async () => {
    expect(await hmacSignHex('SHA-512', key, data)).toBe(
      '87aa7cdea5ef619d4ff0b4241a1d6cb02379f4e2ce4ec2787ad0b30545e17cdedaa833b7d6b8a702038b274eaea3f4e4be9d914eeb61f1702e696c203a126854'
    )
  })
})

describe('timingSafeEqualHex', () => {
  it('matches case-insensitively', () => {
    expect(timingSafeEqualHex('AbCd1234', 'abcd1234')).toBe(true)
  })

  it('rejects a mismatched value', () => {
    expect(timingSafeEqualHex('abcd1234', 'abcd1235')).toBe(false)
  })

  it('rejects differing lengths', () => {
    expect(timingSafeEqualHex('abcd', 'abcd12')).toBe(false)
  })
})
