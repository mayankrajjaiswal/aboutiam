import { describe, it, expect } from 'vitest'
import {
  analyzePqcReadiness,
  detectPqcInputKind,
  computeHandshakeSizeDelta,
  CLASSICAL_ECDSA_SIGNATURE_BYTES,
  HYBRID_ML_DSA_87_SIGNATURE_BYTES,
} from './pqcReadiness'

const GENERATED_AT = '2026-07-29T00:00:00.000Z'

// Same disposable throwaway EC P-256 self-signed test fixture used by x509.test.ts.
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

const HYBRID_JWKS = JSON.stringify({
  keys: [
    { kty: 'ML-KEM', alg: 'ML-KEM-768', kid: 'pqc-kem-01' },
    { kty: 'ML-DSA', alg: 'ML-DSA-65', kid: 'pqc-sig-01' },
  ],
})

const CLASSICAL_JWKS = JSON.stringify({
  keys: [
    { kty: 'RSA', alg: 'RS256', kid: 'classical-rsa-01', n: 'x', e: 'AQAB' },
    { kty: 'EC', alg: 'ES256', crv: 'P-256', kid: 'classical-ec-01', x: 'x', y: 'y' },
  ],
})

describe('detectPqcInputKind', () => {
  it('detects an empty payload', () => {
    expect(detectPqcInputKind('   ')).toBe('empty')
  })

  it('detects a PEM certificate chain', () => {
    expect(detectPqcInputKind(EC_CERT_PEM)).toBe('pem')
  })

  it('detects a JWKS JSON document', () => {
    expect(detectPqcInputKind(CLASSICAL_JWKS)).toBe('jwks')
  })

  it('detects a TLS cipher-suite list', () => {
    expect(detectPqcInputKind('TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256\nTLS_AES_256_GCM_SHA384')).toBe('ciphersuite')
  })

  it('falls back to unrecognized for garbage input', () => {
    expect(detectPqcInputKind('not a real payload at all')).toBe('unrecognized')
  })
})

describe('analyzePqcReadiness', () => {
  it('flags the EC P-256 certificate as quantum-vulnerable on both signature and public key', async () => {
    const report = await analyzePqcReadiness(EC_CERT_PEM, GENERATED_AT)
    expect(report.inputKind).toBe('pem')
    expect(report.findings.length).toBeGreaterThan(0)
    expect(report.findings.every((f) => f.severity === 'Critical')).toBe(true)
    expect(report.summary.Critical).toBeGreaterThan(0)
  })

  it('flags every classical algorithm in a classical JWKS', async () => {
    const report = await analyzePqcReadiness(CLASSICAL_JWKS, GENERATED_AT)
    expect(report.inputKind).toBe('jwks')
    expect(report.findings).toHaveLength(2)
    expect(report.findings.map((f) => f.subject).sort()).toEqual(['classical-ec-01', 'classical-rsa-01'])
  })

  it('produces zero findings for a PQC-hybrid-only JWKS', async () => {
    const report = await analyzePqcReadiness(HYBRID_JWKS, GENERATED_AT)
    expect(report.findings).toHaveLength(0)
    expect(report.sizeDelta).toBeNull()
    expect(report.summary).toEqual({ Critical: 0, High: 0, Medium: 0, Info: 0 })
  })

  it('flags quantum-vulnerable TLS cipher suites and ignores PQC-hybrid ones', async () => {
    const report = await analyzePqcReadiness(
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256\nX25519MLKEM768',
      GENERATED_AT,
    )
    expect(report.inputKind).toBe('ciphersuite')
    expect(report.findings).toHaveLength(1)
    expect(report.findings[0].subject).toBe('TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256')
  })

  it('returns an empty report for empty input', async () => {
    const report = await analyzePqcReadiness('', GENERATED_AT)
    expect(report.inputKind).toBe('empty')
    expect(report.findings).toHaveLength(0)
  })
})

describe('computeHandshakeSizeDelta', () => {
  it('matches the doc-cited reference values by default', () => {
    const delta = computeHandshakeSizeDelta()
    expect(delta.classicalBytes).toBe(CLASSICAL_ECDSA_SIGNATURE_BYTES)
    expect(delta.hybridBytes).toBe(HYBRID_ML_DSA_87_SIGNATURE_BYTES)
    expect(delta.deltaBytes).toBe(HYBRID_ML_DSA_87_SIGNATURE_BYTES - CLASSICAL_ECDSA_SIGNATURE_BYTES)
    expect(delta.deltaMultiplier).toBeCloseTo(4600 / 96, 2)
  })

  it('computes correctly for custom reference values', () => {
    const delta = computeHandshakeSizeDelta(100, 400)
    expect(delta.deltaBytes).toBe(300)
    expect(delta.deltaMultiplier).toBe(4)
  })
})
