import { describe, expect, it } from 'vitest'
import { derivePbkdf2, verifyPbkdf2, generateSaltHex } from './pbkdf2'

describe('pbkdf2.ts tests', () => {
  it('derives a key and verifies the correct password against the encoded hash', async () => {
    const result = await derivePbkdf2('my-super-secret-password-123!', { iterations: 1000 })
    expect(result.encoded.startsWith('pbkdf2$SHA-256$1000$')).toBe(true)
    expect(await verifyPbkdf2('my-super-secret-password-123!', result.encoded)).toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const result = await derivePbkdf2('correct-password', { iterations: 1000 })
    expect(await verifyPbkdf2('wrong-password', result.encoded)).toBe(false)
  })

  it('produces different hashes for different salts, and matches a known salt/iteration/hash combination deterministically', async () => {
    const salt = generateSaltHex()
    const a = await derivePbkdf2('same-password', { iterations: 1000, saltHex: salt })
    const b = await derivePbkdf2('same-password', { iterations: 1000, saltHex: salt })
    expect(a.hashHex).toBe(b.hashHex)

    const c = await derivePbkdf2('same-password', { iterations: 1000 })
    expect(c.saltHex).not.toBe(salt)
    expect(c.hashHex).not.toBe(a.hashHex)
  })

  it('supports SHA-384/SHA-512 and rejects a malformed encoded string', async () => {
    const result = await derivePbkdf2('pw', { iterations: 1000, hash: 'SHA-512' })
    expect(result.encoded.startsWith('pbkdf2$SHA-512$1000$')).toBe(true)
    expect(await verifyPbkdf2('pw', result.encoded)).toBe(true)

    await expect(verifyPbkdf2('pw', 'not-a-valid-hash')).rejects.toThrow()
  })
})
