import { describe, it, expect } from 'vitest'
import {
  padPkcs7,
  unpadPkcs7,
  hexToBytes,
  encryptVault,
  decryptVault,
} from './ansibleVault'

describe('Ansible Vault Encryption & Decryption', () => {
  it('should correctly pad and unpad data using PKCS#7', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5])
    const padded = padPkcs7(data, 16)
    expect(padded.length).toBe(16)
    expect(padded[5]).toBe(11) // 16 - 5 = 11 padding bytes
    expect(padded[15]).toBe(11)

    const unpadded = unpadPkcs7(padded)
    expect(unpadded).toEqual(data)
  })

  it('should throw on invalid PKCS#7 padding characters or lengths', () => {
    // Zero length
    expect(() => unpadPkcs7(new Uint8Array([]))).toThrow()

    // Invalid padding character
    const badPadding = new Uint8Array([1, 2, 3, 4, 5, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12])
    expect(() => unpadPkcs7(badPadding)).toThrow()

    // Invalid padding length (e.g. 0 or > 16)
    const badLength = new Uint8Array([1, 2, 3, 4, 17])
    expect(() => unpadPkcs7(badLength)).toThrow()
  })

  it('should convert hex strings to Uint8Array', () => {
    const hex = '41424344'
    const bytes = hexToBytes(hex)
    expect(bytes).toEqual(new Uint8Array([65, 66, 67, 68])) // 'ABCD'
  })

  it('should roundtrip encrypt and decrypt a text string successfully (Vault 1.1)', async () => {
    const plaintext = 'Secret database password: password123!'
    const password = 'my-vault-password'

    const encrypted = await encryptVault(plaintext, password)
    expect(encrypted.startsWith('$ANSIBLE_VAULT;1.1;AES256')).toBe(true)

    const decryptedBytes = await decryptVault(encrypted, password)
    const decryptedText = new TextDecoder().decode(decryptedBytes)

    expect(decryptedText).toBe(plaintext)
  })

  it('should roundtrip encrypt and decrypt with a custom Vault ID successfully (Vault 1.2)', async () => {
    const plaintext = 'S3cr3t API k3y'
    const password = 'prod-password'
    const vaultId = 'production_env'

    const encrypted = await encryptVault(plaintext, password, vaultId)
    expect(encrypted.startsWith('$ANSIBLE_VAULT;1.2;AES256;production_env')).toBe(true)

    const decryptedBytes = await decryptVault(encrypted, password)
    const decryptedText = new TextDecoder().decode(decryptedBytes)

    expect(decryptedText).toBe(plaintext)
  })

  it('should fail decryption if the password is incorrect (HMAC verification fail)', async () => {
    const plaintext = 'Top Secret'
    const password = 'right-password'
    const wrongPassword = 'wrong-password'

    const encrypted = await encryptVault(plaintext, password)

    await expect(decryptVault(encrypted, wrongPassword)).rejects.toThrow()
  })

  it('should fail decryption if the payload is tampered with', async () => {
    const plaintext = 'Authentic data'
    const password = 'secure-password'

    const encrypted = await encryptVault(plaintext, password)

    // Tamper with a byte in the payload block (avoiding the header)
    const lines = encrypted.split('\n')
    const lastLine = lines[lines.length - 1]
    const tamperedLastLine = lastLine.substring(0, 10) + '00' + lastLine.substring(12)
    lines[lines.length - 1] = tamperedLastLine
    const tamperedEncrypted = lines.join('\n')

    await expect(decryptVault(tamperedEncrypted, password)).rejects.toThrow()
  })
})
