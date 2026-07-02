import { describe, expect, it } from 'vitest'
import { generateUlid, generateUuidV4, generateUuidV7 } from './uuid'

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('generateUuidV4', () => {
  it('produces a valid v4 UUID with version and variant nibbles set', () => {
    const uuid = generateUuidV4()
    expect(uuid).toMatch(UUID_SHAPE)
    expect(uuid[14]).toBe('4')
    expect(['8', '9', 'a', 'b']).toContain(uuid[19])
  })
})

describe('generateUuidV7', () => {
  it('produces a valid v7 UUID with version and variant nibbles set', () => {
    const uuid = generateUuidV7()
    expect(uuid).toMatch(UUID_SHAPE)
    expect(uuid[14]).toBe('7')
    expect(['8', '9', 'a', 'b']).toContain(uuid[19])
  })

  it('sorts lexicographically by generation time', () => {
    const earlier = generateUuidV7(1_700_000_000_000)
    const later = generateUuidV7(1_700_000_000_001)
    expect(earlier < later).toBe(true)
  })
})

describe('generateUlid', () => {
  it('produces a 26-character Crockford base32 identifier', () => {
    const ulid = generateUlid()
    expect(ulid).toHaveLength(26)
    expect(ulid).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('sorts lexicographically by generation time', () => {
    const earlier = generateUlid(1_700_000_000_000)
    const later = generateUlid(1_700_000_000_001)
    expect(earlier < later).toBe(true)
  })

  it('encodes timestamp zero as all-zero prefix', () => {
    expect(generateUlid(0).slice(0, 10)).toBe('0000000000')
  })
})
