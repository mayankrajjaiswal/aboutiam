import { parseCertificateOrCsr } from './x509'
import { splitPemBundle } from './certBundle'
import { findPqcAlgorithmRisk, type MigrationPriority } from '../../data/pqcAlgorithmRisk'

export type PqcInputKind = 'pem' | 'jwks' | 'ciphersuite' | 'empty' | 'unrecognized'

export interface PqcFinding {
  id: string
  severity: MigrationPriority
  subject: string
  algorithm: string
  message: string
  recommendedHybrid: string
  citation: string
}

export interface SizeDeltaEstimate {
  classicalBytes: number
  hybridBytes: number
  deltaBytes: number
  deltaMultiplier: number
}

export interface PqcReadinessReport {
  inputKind: PqcInputKind
  findings: PqcFinding[]
  summary: Record<MigrationPriority, number>
  sizeDelta: SizeDeltaEstimate | null
  generatedAt: string
}

// Reference values cited in NEXT_FEATURES.md A1: a hybrid ML-DSA-87 signature is
// roughly 4.6KB versus a classical ECDSA P-256 signature at roughly 96 bytes.
export const CLASSICAL_ECDSA_SIGNATURE_BYTES = 96
export const HYBRID_ML_DSA_87_SIGNATURE_BYTES = 4600

export function computeHandshakeSizeDelta(
  classicalBytes = CLASSICAL_ECDSA_SIGNATURE_BYTES,
  hybridBytes = HYBRID_ML_DSA_87_SIGNATURE_BYTES,
): SizeDeltaEstimate {
  return {
    classicalBytes,
    hybridBytes,
    deltaBytes: hybridBytes - classicalBytes,
    deltaMultiplier: classicalBytes > 0 ? hybridBytes / classicalBytes : 0,
  }
}

function emptySummary(): Record<MigrationPriority, number> {
  return { Critical: 0, High: 0, Medium: 0, Info: 0 }
}

export function detectPqcInputKind(raw: string): PqcInputKind {
  const trimmed = raw.trim()
  if (!trimmed) return 'empty'
  if (trimmed.includes('-----BEGIN CERTIFICATE-----') || trimmed.includes('-----BEGIN CERTIFICATE REQUEST-----')) return 'pem'
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.keys)) return 'jwks'
    } catch {
      return 'unrecognized'
    }
    return 'unrecognized'
  }
  if (/^(TLS_|TLS-)/im.test(trimmed) || trimmed.toUpperCase().includes('TLS_')) return 'ciphersuite'
  return 'unrecognized'
}

function findingId(...parts: string[]): string {
  return parts.join('::')
}

async function analyzeCertificateChain(raw: string): Promise<PqcFinding[]> {
  const blocks = splitPemBundle(raw)
  const findings: PqcFinding[] = []

  for (let i = 0; i < blocks.length; i++) {
    const parsed = await parseCertificateOrCsr(blocks[i])
    if (parsed.kind === 'error') continue
    const subject = parsed.kind === 'certificate' ? (parsed.subject.display || `Certificate #${i + 1}`) : `CSR #${i + 1}`

    if (parsed.kind === 'certificate') {
      const sigRisk = findPqcAlgorithmRisk(parsed.signatureAlgorithm)
      if (sigRisk?.quantumVulnerable) {
        findings.push({
          id: findingId('sig', String(i), sigRisk.algorithm),
          severity: sigRisk.migrationPriority,
          subject,
          algorithm: parsed.signatureAlgorithm,
          message: `Signature algorithm "${parsed.signatureAlgorithm}" is quantum-vulnerable: ${sigRisk.vulnerabilityReason}`,
          recommendedHybrid: sigRisk.recommendedHybrid,
          citation: sigRisk.citation,
        })
      }
    }

    const keyLabel = `${parsed.publicKey.algorithm} ${parsed.publicKey.details}`.trim()
    const keyRisk = findPqcAlgorithmRisk(parsed.publicKey.algorithm)
    if (keyRisk?.quantumVulnerable) {
      const isWeakRsa = parsed.publicKey.algorithm === 'RSA' && parseInt(parsed.publicKey.details, 10) < 2048
      findings.push({
        id: findingId('key', String(i), keyRisk.algorithm),
        severity: isWeakRsa ? 'Critical' : keyRisk.migrationPriority,
        subject,
        algorithm: keyLabel,
        message: isWeakRsa
          ? `Public key "${keyLabel}" is both classically weak (below the 2048-bit floor) and quantum-vulnerable: ${keyRisk.vulnerabilityReason}`
          : `Public key algorithm "${keyLabel}" is quantum-vulnerable: ${keyRisk.vulnerabilityReason}`,
        recommendedHybrid: keyRisk.recommendedHybrid,
        citation: keyRisk.citation,
      })
    }
  }

  return findings
}

function analyzeJwks(raw: string): PqcFinding[] {
  const findings: PqcFinding[] = []
  let parsed: { keys?: Array<Record<string, unknown>> }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return findings
  }
  const keys = Array.isArray(parsed.keys) ? parsed.keys : []

  keys.forEach((key, index) => {
    const kid = typeof key.kid === 'string' ? key.kid : `Key #${index + 1}`
    const alg = typeof key.alg === 'string' ? key.alg : undefined
    const kty = typeof key.kty === 'string' ? key.kty : undefined
    const label = alg ?? kty ?? ''
    const risk = findPqcAlgorithmRisk(label)
    if (risk?.quantumVulnerable) {
      findings.push({
        id: findingId('jwk', String(index), risk.algorithm),
        severity: risk.migrationPriority,
        subject: kid,
        algorithm: label || 'unknown',
        message: `JWK "${kid}" uses quantum-vulnerable algorithm "${label || 'unknown'}": ${risk.vulnerabilityReason}`,
        recommendedHybrid: risk.recommendedHybrid,
        citation: risk.citation,
      })
    }
  })

  return findings
}

function analyzeCipherSuites(raw: string): PqcFinding[] {
  const findings: PqcFinding[] = []
  const suites = raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)

  suites.forEach((suite, index) => {
    const risk = findPqcAlgorithmRisk(suite)
    if (risk?.quantumVulnerable) {
      findings.push({
        id: findingId('suite', String(index), risk.algorithm),
        severity: risk.migrationPriority,
        subject: suite,
        algorithm: risk.algorithm,
        message: `Cipher suite "${suite}" relies on quantum-vulnerable "${risk.algorithm}": ${risk.vulnerabilityReason}`,
        recommendedHybrid: risk.recommendedHybrid,
        citation: risk.citation,
      })
    }
  })

  return findings
}

export async function analyzePqcReadiness(raw: string, generatedAt: string): Promise<PqcReadinessReport> {
  const inputKind = detectPqcInputKind(raw)
  let findings: PqcFinding[] = []

  if (inputKind === 'pem') findings = await analyzeCertificateChain(raw)
  else if (inputKind === 'jwks') findings = analyzeJwks(raw)
  else if (inputKind === 'ciphersuite') findings = analyzeCipherSuites(raw)

  const summary = emptySummary()
  for (const finding of findings) summary[finding.severity]++

  const hasVulnerableAsymmetric = findings.some((f) => f.algorithm.toLowerCase().includes('rsa') || f.algorithm.toLowerCase().includes('ec') || f.algorithm.toLowerCase().includes('dsa'))

  return {
    inputKind,
    findings,
    summary,
    sizeDelta: hasVulnerableAsymmetric ? computeHandshakeSizeDelta() : null,
    generatedAt,
  }
}

export function buildPqcReportJson(report: PqcReadinessReport): string {
  return JSON.stringify(report, null, 2)
}
