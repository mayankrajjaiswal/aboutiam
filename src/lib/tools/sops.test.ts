import { describe, it, expect } from 'vitest'
import { encryptSops, decryptSops } from './sops'

describe('Mozilla SOPS Simulator Crypto Engine', () => {
  const testJson = JSON.stringify({
    host: 'db.example.com',
    port: 5432,
    username: 'admin',
    password: 'supersecretpassword123',
    secret_token: 'tok-abc-123',
    public_config: true,
  }, null, 2)

  const testYaml = `
# Global database configuration
host: db.example.com
port: 5432
username: admin
password: "supersecretpassword123" # Must be encrypted
secret_token: 'tok-abc-123'        # Must be encrypted
public_config: true
  `.trim()

  it('should selectively encrypt only matching JSON keys and keep others readable', async () => {
    const encrypted = await encryptSops(testJson, {
      encryptedRegex: '^(password|secret_token)$',
      keyProvider: 'aws_kms',
      providerId: 'arn:aws:kms:us-east-1:123456789012:key/sops-key',
    })

    const parsed = JSON.parse(encrypted)
    expect(parsed.host).toBe('db.example.com')
    expect(parsed.port).toBe(5432)
    expect(parsed.username).toBe('admin')
    expect(parsed.public_config).toBe(true)

    expect(parsed.password.startsWith('ENC[AES256_GCM')).toBe(true)
    expect(parsed.secret_token.startsWith('ENC[AES256_GCM')).toBe(true)
    expect(parsed.sops).toBeDefined()
    expect(parsed.sops.kms.length).toBe(1)
    expect(parsed.sops.kms[0].arn).toBe('arn:aws:kms:us-east-1:123456789012:key/sops-key')
  })

  it('should decrypt an encrypted JSON back to its original state (with correct types)', async () => {
    const password = 'custom-key'
    const encrypted = await encryptSops(testJson, {
      encryptedRegex: '^(password|secret_token)$',
      keyProvider: 'age',
      providerId: 'age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p',
      password,
    })

    const decrypted = await decryptSops(encrypted, password)
    const decryptedObj = JSON.parse(decrypted)

    expect(decryptedObj.password).toBe('supersecretpassword123')
    expect(decryptedObj.secret_token).toBe('tok-abc-123')
    expect(decryptedObj.host).toBe('db.example.com')
    expect(decryptedObj.port).toBe(5432)
    expect(decryptedObj.public_config).toBe(true)
    expect(decryptedObj.sops).toBeUndefined() // Stripped on decrypt
  })

  it('should selectively encrypt and decrypt YAML structures line-by-line while maintaining comments', async () => {
    const encrypted = await encryptSops(testYaml, {
      encryptedRegex: '^(password|secret_token)$',
      keyProvider: 'hc_vault',
      providerId: 'secret/data/sops',
    })

    expect(encrypted).toContain('# Global database configuration')
    expect(encrypted).toContain('host: db.example.com')
    expect(encrypted).toContain('password: ENC[AES256_GCM')
    expect(encrypted).toContain('# Must be encrypted')

    const decrypted = await decryptSops(encrypted)
    expect(decrypted).toContain('# Global database configuration')
    expect(decrypted).toContain('host: db.example.com')
    expect(decrypted).toContain('password: supersecretpassword123')
    expect(decrypted).not.toContain('sops:') // sops block stripped
  })

  it('should throw decryption error on incorrect password', async () => {
    const encrypted = await encryptSops(testJson, {
      encryptedRegex: 'password',
      keyProvider: 'aws_kms',
      providerId: 'arn:aws:kms:us-east-1:123456789012:key/sops-key',
      password: 'correct-secret',
    })

    await expect(decryptSops(encrypted, 'wrong-secret')).rejects.toThrow()
  })
})
