import { parseCertificateOrCsr } from './x509'
import { signJwtHmac, decodeJwt } from './jwt'

export interface ShellCommandResult {
  output: string[]
  isError?: boolean
}

// Disposable, locally-generated self-signed EC P-256 test fixture — never a
// real production certificate — reused from x509.test.ts's fixture set.
const SAMPLE_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIC+jCCAqGgAwIBAgIUXV0qDl8IGumzlK3ObhuYEk9Da3swCgYIKoZIzj0EAwIw
gYYxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRYwFAYDVQQHDA1T
YW4gRnJhbmNpc2NvMRYwFAYDVQQKDA1BYm91dElBTSBUZXN0MRQwEgYDVQQLDAtF
bmdpbmVlcmluZzEcMBoGA1UEAwwTdGVzdC5hYm91dGlhbS5sb2NhbDAeFw0yNjA3
MDIxNTMyMTlaFw0zNjA2MjkxNTMyMTlaMIGGMQswCQYDVQQGEwJVUzETMBEGA1UE
CAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzEWMBQGA1UECgwN
QWJvdXRJQU0gVGVzdDEUMBIGA1UECwwLRW5naW5lZXJpbmcxHDAaBgNVBAMME3Rl
c3QuYWJvdXRpYW0ubG9jYWwwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ/aA4+
NZhBLVljcG/ngaGVPMM7A8ICGSwXF0p92KaSMp0Hzosl7oEJkJxb1aOReiUtan67
cmmVQGnR9X8W4Tc8o4HqMIHnMB0GA1UdDgQWBBTKuNv397B/6rrwda9DPb2pQR6w
1jAfBgNVHSMEGDAWgBTKuNv397B/6rrwda9DPb2pQR6w1jBiBgNVHREEWzBZghN0
ZXN0LmFib3V0aWFtLmxvY2FsghAqLmFib3V0aWFtLmxvY2FshwR/AAABhipzcGlm
ZmU6Ly9hYm91dGlhbS5sb2NhbC9ucy9kZWZhdWx0L3NhL3Rlc3QwDgYDVR0PAQH/
BAQDAgKEMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjASBgNVHRMBAf8E
CDAGAQH/AgEBMAoGCCqGSM49BAMCA0cAMEQCIHnVZq1Xe5sAofzWkxcM0r418vFs
oIbvrRNx0RH/MvNVAiBfoQrPFCq1kc8q3GCLrbpofqITIJMYKgw6HBaWr8YSGg==
-----END CERTIFICATE-----`

const MOCK_SHELL_HMAC_SECRET = 'mock-shell-demo-secret'

const HELP_LINES = [
  'Supported commands:',
  '  openssl x509 -in cert.pem -text -noout   Decode a sample certificate',
  '  curl -X POST https://mock-idp/token      Mint a mock OAuth access token',
  '  kinit user@REALM.EXAMPLE                 Request a mock Kerberos TGT',
  '  jwt-cli decode <token>                   Decode a JWT (header + payload)',
  '  clear                                    Clear the terminal',
  '  help                                     Show this message',
]

async function runOpenssl(args: string[]): Promise<ShellCommandResult> {
  if (args[0] === 'x509' && args.includes('-text') && args.includes('-noout')) {
    const parsed = await parseCertificateOrCsr(SAMPLE_CERT_PEM)
    if (parsed.kind !== 'certificate') {
      return { output: ['openssl: unable to load certificate'], isError: true }
    }
    return {
      output: [
        'Certificate:',
        '    Data:',
        `        Version: ${parsed.version} (0x${(parsed.version - 1).toString(16)})`,
        `        Serial Number: ${parsed.serialNumberHex}`,
        `        Signature Algorithm: ${parsed.signatureAlgorithm}`,
        `        Issuer: ${parsed.issuer.display}`,
        '        Validity',
        `            Not Before: ${parsed.notBefore.toUTCString()}`,
        `            Not After : ${parsed.notAfter.toUTCString()}`,
        `        Subject: ${parsed.subject.display}`,
        '        Subject Public Key Info:',
        `            Public Key Algorithm: ${parsed.publicKey.algorithm} (${parsed.publicKey.details})`,
      ],
    }
  }
  return { output: ['openssl: unsupported command', 'try: openssl x509 -in cert.pem -text -noout'], isError: true }
}

async function runCurl(args: string[]): Promise<ShellCommandResult> {
  const url = args.find((a) => a.startsWith('http'))
  if (args.includes('-X') && args.includes('POST') && url?.includes('/token')) {
    const token = await signJwtHmac(
      'HS256',
      { alg: 'HS256', typ: 'JWT' },
      { sub: 'mock-client', iss: 'mock-idp', scope: 'read:profile', exp: Math.floor(Date.now() / 1000) + 3600 },
      MOCK_SHELL_HMAC_SECRET,
    )
    return {
      output: JSON.stringify({ access_token: token, token_type: 'Bearer', expires_in: 3600 }, null, 2).split('\n'),
    }
  }
  return { output: ['curl: unsupported request', 'try: curl -X POST https://mock-idp/token'], isError: true }
}

function runKinit(args: string[]): ShellCommandResult {
  const principal = args[0]
  if (!principal || !principal.includes('@')) {
    return { output: ['kinit: krb5_parse_name: unable to parse principal', 'usage: kinit user@REALM.EXAMPLE'], isError: true }
  }
  const [, realm] = principal.split('@')
  const now = new Date()
  const expiry = new Date(now.getTime() + 10 * 60 * 60 * 1000)
  return {
    output: [
      `Password for ${principal}: ********`,
      'Authenticated to Kerberos v5',
      `New ticket is stored in cache KCM:0:1 for ${principal}`,
      'Valid starting     Expires            Service principal',
      `${now.toUTCString()}  ${expiry.toUTCString()}  krbtgt/${realm}@${realm}`,
    ],
  }
}

function runJwtCli(args: string[]): ShellCommandResult {
  if (args[0] === 'decode' && args[1]) {
    const decoded = decodeJwt(args[1])
    if (!decoded.isStructurallyValid) {
      return { output: ['jwt-cli: not a structurally valid JWT (expected header.payload.signature)'], isError: true }
    }
    return {
      output: [
        'Header:',
        JSON.stringify(decoded.header, null, 2),
        'Payload:',
        JSON.stringify(decoded.payload, null, 2),
      ],
    }
  }
  return { output: ['jwt-cli: unsupported command', 'try: jwt-cli decode <token>'], isError: true }
}

/** The one entry point — the ONLY thing that should ever call the per-command handlers above. */
export async function runShellCommand(rawInput: string): Promise<ShellCommandResult> {
  const trimmed = rawInput.trim()
  if (!trimmed) return { output: [] }

  const [command, ...args] = trimmed.split(/\s+/)

  switch (command) {
    case 'openssl':
      return runOpenssl(args)
    case 'curl':
      return runCurl(args)
    case 'kinit':
      return runKinit(args)
    case 'jwt-cli':
      return runJwtCli(args)
    case 'help':
      return { output: HELP_LINES }
    default:
      return { output: [`command not found: ${command}`, 'try: help'], isError: true }
  }
}
