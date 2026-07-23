import { describe, expect, it } from 'vitest'
import { splitPemBundle, analyzeBundle } from './certBundle'

// Same throwaway, locally-generated self-signed demo cert used by
// X509CertificateDecoder.tsx's default input — not a real production certificate.
const SAMPLE_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDyDCCArCgAwIBAgIUPWQibXmFk8pBDV4v43pzWysxouYwDQYJKoZIhvcNAQEL
BQAwQzELMAkGA1UEBhMCVVMxFjAUBgNVBAoMDUFib3V0SUFNIERlbW8xHDAaBgNV
BAMME2RlbW8uYWJvdXRpYW0ubG9jYWwwHhcNMjYwNzAyMTUzNDUwWhcNMjgxMDA0
MTUzNDUwWjBDMQswCQYDVQQGEwJVUzEWMBQGA1UECgwNQWJvdXRJQU0gRGVtbzEc
MBoGA1UEAwwTZGVtby5hYm91dGlhbS5sb2NhbDCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBAOc8N1R1EXqNLl9qcrPUV5Dc4nomKGQmk5TwD/181NxwXIqt
UZsBCDzzCooIl40Xblit7vPWjZzef9+ox9/aEOr1+ugQ5OtpJl9l+PYKdzWvuJG9
73ZWndEKAdU7dpFu7SAV5xuygKe0tcJTFqyt6QCX+ov7KIDEX58Bov40Hb86zzFx
MoEQgMLYCBK18Ztj/D4o9ZH37Pw9gYxPSyijw7E6IjJZmOcwd9GLWL55taXdPiRg
L5BSI89s3syUTkSsoBFktLMRavX1lOSlwMzXiaMeGIgR1/ob63LKKwCb4c+C60pi
tjraMMP2FxgeDvKzaoAq6WWk0H+VTRsLDr7fJiUCAwEAAaOBszCBsDAdBgNVHQ4E
FgQUrDn9bka3huih1Cp4h5vglx6VDtMwHwYDVR0jBBgwFoAUrDn9bka3huih1Cp4
h5vglx6VDtMwOwYDVR0RBDQwMoITZGVtby5hYm91dGlhbS5sb2NhbIIVKi5kZW1v
LmFib3V0aWFtLmxvY2FshwQKAAAFMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUEDDAK
BggrBgEFBQcDATAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQA+PhNa
mnIBK8mUGQekcCZcooHgFjkUPaAAk8KgVcjoyr5ta773nhF4wcafoE6VYaEihl6k
zzhE2bWdmSOvhlWx5wJCIY3Je2o7SBP5npcNyK1I1zhRf1UTITwGHLw2DD7ya7n2
RYkwvrA4RwLIiOcLbDcW+ZPmXkxIHI+qnyozFU5nniNlgBf4BWKL2+89DtI3lzFJ
pofVFitE7LODGiv5bDYBmfAB2N6Oy0XkSdkW5GMazZ71QizhGGnncVBJ6y7cpLS8
4BJPef0BynjzKbhHoFd1nQdO8MxFYXGxn+gpnRfvxb1QBp5PiXggoYXRyFlKXbOE
01KIsgfyDgfiFV8h
-----END CERTIFICATE-----`

describe('certBundle.ts tests', () => {
  it('splits a bundle of multiple PEM blocks into individual certificate strings', () => {
    const bundle = `${SAMPLE_CERT_PEM}\n${SAMPLE_CERT_PEM}\n`
    const blocks = splitPemBundle(bundle)
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toContain('-----BEGIN CERTIFICATE-----')
    expect(blocks[0]).toContain('-----END CERTIFICATE-----')
  })

  it('returns an empty array for text with no PEM certificate blocks', () => {
    expect(splitPemBundle('not a certificate at all')).toEqual([])
  })

  it('reports no chain issues for a self-signed cert whose issuer matches its own subject when repeated', async () => {
    const bundle = `${SAMPLE_CERT_PEM}\n${SAMPLE_CERT_PEM}\n`
    const analysis = await analyzeBundle(bundle)
    expect(analysis.entries).toHaveLength(2)
    expect(analysis.chainIssues).toHaveLength(0)
  })

  it('marks an unparsable block as an error entry and skips it for chain-order comparison', async () => {
    const garbageBlock = '-----BEGIN CERTIFICATE-----\nQUJDREVGRw==\n-----END CERTIFICATE-----'
    const analysis = await analyzeBundle(`${SAMPLE_CERT_PEM}\n${garbageBlock}\n`)
    expect(analysis.entries).toHaveLength(2)
    expect(analysis.entries[0].parsed.kind).toBe('certificate')
    expect(analysis.entries[1].parsed.kind).toBe('error')
    // An error entry can't be chain-compared, so it must not produce a false chainIssue.
    expect(analysis.chainIssues).toHaveLength(0)
  })
})
