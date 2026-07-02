import { describe, expect, it } from 'vitest'
import { hashPassword, comparePassword, genSalt } from './bcrypt'

describe('bcrypt.ts tests', () => {
  it('correctly hashes and verifies a password', async () => {
    const password = 'my-super-secret-password-123!'
    const hash = await hashPassword(password, 8)
    
    // Check format: should start with $2a$ or $2b$ and have cost factor 08
    expect(hash.startsWith('$2a$08$') || hash.startsWith('$2b$08$')).toBe(true)
    
    // Correct password matches
    const isMatch = await comparePassword(password, hash)
    expect(isMatch).toBe(true)
    
    // Incorrect password fails
    const isWrongMatch = await comparePassword('wrong-password', hash)
    expect(isWrongMatch).toBe(false)
  })

  it('verifies a password against a known valid test vector', async () => {
    // Known bcrypt vector:
    // Password: "password"
    // Hash: $2b$04$AiHKjjW1FoLclcOxYg.g4eh154CKdKs/s0OWkQO2rKqqwDfbFVnca
    const password = 'password'
    const hash = '$2b$04$AiHKjjW1FoLclcOxYg.g4eh154CKdKs/s0OWkQO2rKqqwDfbFVnca'
    
    const isMatch = await comparePassword(password, hash)
    expect(isMatch).toBe(true)

    const isWrongMatch = await comparePassword('wrongpassword', hash)
    expect(isWrongMatch).toBe(false)
  })

  it('generates distinct salts and distinct hashes for the same password', async () => {
    const password = 'test-password'
    const salt1 = await genSalt(6)
    const salt2 = await genSalt(6)
    expect(salt1).not.toBe(salt2)

    const hash1 = await hashPassword(password, salt1)
    const hash2 = await hashPassword(password, salt2)
    expect(hash1).not.toBe(hash2)

    expect(await comparePassword(password, hash1)).toBe(true)
    expect(await comparePassword(password, hash2)).toBe(true)
  })
})
