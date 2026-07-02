import { describe, expect, it } from 'vitest'
import { parseCertificateOrCsr } from './x509'
import type { ParsedCertificate, ParsedCsr } from './x509'

// Disposable, throwaway self-signed test fixtures generated locally with
// openssl for this test only — never a real production certificate.
// EC P-256, self-signed, SAN (DNS/wildcard/IP/spiffe URI), critical keyUsage,
// EKU, and basicConstraints CA:TRUE,pathlen:1.
const EC_CERT_PEM = `-----BEGIN CERTIFICATE-----
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

// RSA 2048, subject O/CN only, extensionRequest SAN with two DNS names.
const RSA_CSR_PEM = `-----BEGIN CERTIFICATE REQUEST-----
MIICwjCCAaoCAQAwNTEWMBQGA1UECgwNQWJvdXRJQU0gVGVzdDEbMBkGA1UEAwwS
Y3NyLmFib3V0aWFtLmxvY2FsMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEA4UB16Zf5qxMqTD7XLFzF0tqR+RK3PL4GAyHU05u4AObVPVkr6jfQWd4tnzRK
ZaI+xX3/lVMCVMminCTV20uvb58qFCGCukdL0a7ThVbcuN8nf3gbTteFGSb/LKds
DovePzBevyXknVBpl5BXEsCfwFPzk7/xFgjAkmUfzlsI4r+jmzhxiDAh6WBgxYKq
KdQNGMVBSsOYMoF3AvAmeTqtNm36fu1AmkhsmR+d9xHv9Dk3CDMmzpbrl3xVJPBi
/QqelzlOdJkACDxA7vhHj/J2j9gINrTv6fJmuSmjSnsnOUGF+rnGiDWHfn5a+m2F
1UxLeUmdygHAej+Q1GZZWx87WwIDAQABoEgwRgYJKoZIhvcNAQkOMTkwNzA1BgNV
HREELjAsghJjc3IuYWJvdXRpYW0ubG9jYWyCFnd3dy5jc3IuYWJvdXRpYW0ubG9j
YWwwDQYJKoZIhvcNAQELBQADggEBAMk1bUOqRSh4HIR7siKEwBhWgHwjVyKigxSX
z1cBBbX/Wf8oFj4CMMsm3+VuxBdrkSYqcgw8hYhRwiMoxyGLyPhiax70fsIcEZo5
vbqLpRhHjGaEdEj0iDucgIbE7sFKoywuyiNXy7ZQN/drVoxMn2nRxbY+9h+cnRCJ
TsacA0TqEkrLUTcmAdnqSoxU6ibS9N7DL0DR1YwQ3sbimp0+bBeYVWTJl0cH0a81
GKA2BCNunHeJ6zghZNBcVWCsyh7JDwFBYkUICwMQP6lsbhFW5YvsDSAm/iSFa8Zj
pi2vGdVthwLhu6Y//GiZ3h4BQDqSy0cn0ZtY9ZnWXsiWoS2nH20=
-----END CERTIFICATE REQUEST-----`

describe('x509 certificate parsing', () => {
  it('parses subject/issuer, validity, SANs, key usage, and extensions from a self-signed EC cert', async () => {
    const result = await parseCertificateOrCsr(EC_CERT_PEM)
    expect(result.kind).toBe('certificate')
    const cert = result as ParsedCertificate

    expect(cert.version).toBe(3)
    expect(cert.subject.display).toBe('C=US, ST=California, L=San Francisco, O=AboutIAM Test, OU=Engineering, CN=test.aboutiam.local')
    expect(cert.issuer.display).toBe(cert.subject.display) // self-signed
    expect(cert.signatureAlgorithm).toBe('ECDSA-SHA256')
    expect(cert.publicKey).toEqual({ algorithm: 'EC', details: 'P-256' })

    expect(cert.notBefore.toISOString()).toBe('2026-07-02T15:32:19.000Z')
    expect(cert.notAfter.toISOString()).toBe('2036-06-29T15:32:19.000Z')
    expect(cert.isExpired).toBe(false)

    expect(cert.subjectAltNames).toEqual([
      { type: 'dns', value: 'test.aboutiam.local' },
      { type: 'dns', value: '*.aboutiam.local' },
      { type: 'ip', value: '127.0.0.1' },
      { type: 'uri', value: 'spiffe://aboutiam.local/ns/default/sa/test', isSpiffe: true },
    ])

    expect(cert.keyUsage).toEqual(['digitalSignature', 'keyCertSign'])
    expect(cert.extKeyUsage).toEqual(['serverAuth', 'clientAuth'])
    expect(cert.isCa).toBe(true)
    expect(cert.pathLenConstraint).toBe(1)

    expect(cert.fingerprintSha1.toUpperCase()).toBe('DAA5276E42B9D407A1EFD727FE4FD88C7333A5F0')
    expect(cert.fingerprintSha256.toUpperCase()).toBe('F10BAAA09A602896A8FD91A2377317CEA8106DBD2AE0E52EFBAAEF1D7D922B64')
  })

  it('parses subject, public key, and requested SANs from a PKCS#10 CSR, labeled as unsigned', async () => {
    const result = await parseCertificateOrCsr(RSA_CSR_PEM)
    expect(result.kind).toBe('csr')
    const csr = result as ParsedCsr

    expect(csr.subject.display).toBe('O=AboutIAM Test, CN=csr.aboutiam.local')
    expect(csr.publicKey).toEqual({ algorithm: 'RSA', details: '2048-bit' })
    expect(csr.subjectAltNames).toEqual([
      { type: 'dns', value: 'csr.aboutiam.local' },
      { type: 'dns', value: 'www.csr.aboutiam.local' },
    ])
  })

  it('returns a friendly error for garbage input', async () => {
    const result = await parseCertificateOrCsr('not a certificate at all')
    expect(result.kind).toBe('error')
  })

  it('returns a friendly error for well-formed PEM that is not a cert or CSR', async () => {
    const result = await parseCertificateOrCsr('-----BEGIN CERTIFICATE-----\nYWJj\n-----END CERTIFICATE-----')
    expect(result.kind).toBe('error')
  })
})
