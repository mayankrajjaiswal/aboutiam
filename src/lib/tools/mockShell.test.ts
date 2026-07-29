import { describe, it, expect } from 'vitest'
import { runShellCommand } from './mockShell'
import { signJwtHmac } from './jwt'

describe('runShellCommand', () => {
  it('returns empty output for a blank command', async () => {
    const result = await runShellCommand('   ')
    expect(result.output).toHaveLength(0)
    expect(result.isError).toBeFalsy()
  })

  it('returns a helpful "command not found" message for an unsupported command rather than crashing', async () => {
    const result = await runShellCommand('rm -rf /')
    expect(result.isError).toBe(true)
    expect(result.output.join(' ')).toMatch(/command not found/i)
    expect(result.output.join(' ')).toMatch(/try: help/i)
  })

  it('help lists every supported command', async () => {
    const result = await runShellCommand('help')
    const joined = result.output.join(' ')
    expect(joined).toContain('openssl')
    expect(joined).toContain('curl')
    expect(joined).toContain('kinit')
    expect(joined).toContain('jwt-cli')
  })

  describe('openssl', () => {
    it('decodes the sample certificate for the supported flag set', async () => {
      const result = await runShellCommand('openssl x509 -in cert.pem -text -noout')
      expect(result.isError).toBeFalsy()
      expect(result.output.join(' ')).toContain('Certificate:')
      expect(result.output.join(' ')).toContain('Signature Algorithm')
    })

    it('returns a helpful message for an unsupported flag set', async () => {
      const result = await runShellCommand('openssl genrsa -out key.pem 2048')
      expect(result.isError).toBe(true)
      expect(result.output.join(' ')).toMatch(/unsupported command/i)
    })
  })

  describe('curl', () => {
    it('mints a mock OAuth token for the supported request shape', async () => {
      const result = await runShellCommand('curl -X POST https://mock-idp/token')
      expect(result.isError).toBeFalsy()
      const json = JSON.parse(result.output.join('\n'))
      expect(json.token_type).toBe('Bearer')
      expect(typeof json.access_token).toBe('string')
    })

    it('returns a helpful message for an unsupported request', async () => {
      const result = await runShellCommand('curl https://example.com')
      expect(result.isError).toBe(true)
    })
  })

  describe('kinit', () => {
    it('produces a mock TGT acquisition message for a valid principal', async () => {
      const result = await runShellCommand('kinit admin@EXAMPLE.COM')
      expect(result.isError).toBeFalsy()
      expect(result.output.join(' ')).toContain('krbtgt/EXAMPLE.COM@EXAMPLE.COM')
    })

    it('returns a helpful error for a malformed principal', async () => {
      const result = await runShellCommand('kinit admin')
      expect(result.isError).toBe(true)
      expect(result.output.join(' ')).toMatch(/unable to parse principal/i)
    })
  })

  describe('jwt-cli', () => {
    it('decodes a well-formed JWT into header and payload', async () => {
      const token = await signJwtHmac('HS256', { alg: 'HS256', typ: 'JWT' }, { sub: 'test-user' }, 'secret')
      const result = await runShellCommand(`jwt-cli decode ${token}`)
      expect(result.isError).toBeFalsy()
      expect(result.output.join(' ')).toContain('"sub": "test-user"')
    })

    it('returns a helpful error for a malformed token', async () => {
      const result = await runShellCommand('jwt-cli decode not-a-jwt')
      expect(result.isError).toBe(true)
    })
  })
})
