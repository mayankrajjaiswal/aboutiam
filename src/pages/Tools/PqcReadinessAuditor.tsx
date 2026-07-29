import { useEffect, useState } from 'react'
import { AlertTriangle, AtomIcon, Download, FileWarning, Info, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { analyzePqcReadiness, buildPqcReportJson } from '../../lib/tools/pqcReadiness'
import type { PqcReadinessReport } from '../../lib/tools/pqcReadiness'
import type { MigrationPriority } from '../../data/pqcAlgorithmRisk'

const tool = getToolBySlug('pqc-readiness-auditor')!

const SEVERITY_ORDER: MigrationPriority[] = ['Critical', 'High', 'Medium', 'Info']

const SEVERITY_STYLES: Record<MigrationPriority, { badge: string; icon: typeof ShieldAlert }> = {
  Critical: { badge: 'bg-status-danger/10 text-status-danger border-status-danger/25', icon: ShieldAlert },
  High: { badge: 'bg-status-warning/10 text-status-warning border-status-warning/25', icon: AlertTriangle },
  Medium: { badge: 'bg-status-info/10 text-status-info border-status-info/25', icon: AlertTriangle },
  Info: { badge: 'bg-bg-nested text-text-muted border-border-subtle', icon: Info },
}

// Disposable, locally-generated self-signed EC P-256 test fixture — never a real
// production certificate — chosen because ECDSA is quantum-vulnerable, so the
// default view demonstrates real findings.
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

const SAMPLE_JWKS = `{
  "keys": [
    { "kty": "RSA", "alg": "RS256", "kid": "legacy-rsa-signing-key", "n": "u1W95F6...[truncated]...Kz3PzQ", "e": "AQAB" },
    { "kty": "EC", "alg": "ES256", "crv": "P-256", "kid": "legacy-ec-signing-key", "x": "f83OJ3D2xF1Bg8vub9t61dvO-yP517U4G-C5rQ2y78s", "y": "x_9o6K5_N14W8T9g8f1Bf7aO0D1G2H3I4J5K6L7M8N" },
    { "kty": "ML-DSA", "alg": "ML-DSA-65", "kid": "pqc-hybrid-signing-key" }
  ]
}`

const SAMPLE_CIPHERSUITES = `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
TLS_AES_256_GCM_SHA384
X25519MLKEM768`

function buildFileTimestamp(iso: string): string {
  return iso.replace(/[:.]/g, '-')
}

export default function PqcReadinessAuditor() {
  const [input, setInput] = useState(SAMPLE_CERT_PEM)
  const [report, setReport] = useState<PqcReadinessReport | null>(null)

  useEffect(() => {
    let cancelled = false
    analyzePqcReadiness(input, new Date().toISOString()).then((result) => {
      if (!cancelled) setReport(result)
    })
    return () => { cancelled = true }
  }, [input])

  const handleDownload = () => {
    if (!report) return
    const json = buildPqcReportJson(report)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pqc-readiness-${buildFileTimestamp(report.generatedAt)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const hasFindings = (report?.findings.length ?? 0) > 0

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
              Paste a PEM certificate chain, a JWKS JSON blob, or a TLS cipher-suite list
            </span>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setInput(SAMPLE_CERT_PEM)}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Load Cert Sample
              </button>
              <button
                type="button"
                onClick={() => setInput(SAMPLE_JWKS)}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Load JWKS Sample
              </button>
              <button
                type="button"
                onClick={() => setInput(SAMPLE_CIPHERSUITES)}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Load Cipher-Suite Sample
              </button>
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  title="Clear"
                  className="p-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <textarea
            aria-label="Certificate, JWKS, or cipher-suite input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a PEM cert chain, JWKS JSON, or newline-separated TLS cipher suites..."
            className="w-full h-64 font-mono text-[11px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none focus:border-accent-primary resize-none wrap-break-word"
          />
        </div>

        {input.trim() === '' ? (
          <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-sm text-text-muted font-semibold">
            Paste an input above (or load a sample) to run the crypto-agility audit.
          </div>
        ) : report?.inputKind === 'unrecognized' ? (
          <div className="p-6 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/25 flex items-start gap-3">
            <FileWarning className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">
              Could not recognize this input as a PEM certificate chain, a JWKS JSON document, or a TLS cipher-suite list.
            </span>
          </div>
        ) : report ? (
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <span className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <AtomIcon className="w-4 h-4 text-accent-primary" /> Crypto-Agility Report ({report.inputKind.toUpperCase()})
              </span>
              <div className="flex items-center gap-2">
                {SEVERITY_ORDER.map((severity) => (
                  <span key={severity} className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${SEVERITY_STYLES[severity].badge}`}>
                    {severity}: {report.summary[severity]}
                  </span>
                ))}
              </div>
            </div>

            {!hasFindings ? (
              <div className="p-6 rounded-xl bg-status-success/5 border border-status-success/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                <span className="text-xs font-semibold text-text-secondary">
                  No quantum-vulnerable algorithms detected — this input is already PQC-hybrid or PQC-only.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {report.findings.map((finding) => {
                  const { badge, icon: SeverityIcon } = SEVERITY_STYLES[finding.severity]
                  return (
                    <div key={finding.id} className={`p-3.5 rounded-xl border ${badge} space-y-2`}>
                      <div className="flex items-start gap-3">
                        <SeverityIcon className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-text-primary font-mono">{finding.subject}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-nested text-text-secondary">
                              {finding.algorithm}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed mt-1 wrap-break-word">{finding.message}</p>
                          <p className="text-[11px] text-text-primary font-semibold mt-1">→ {finding.recommendedHybrid}</p>
                          <p className="text-[10px] text-text-muted mt-1 italic">Citation: {finding.citation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {report.sizeDelta && (
              <div className="p-4 rounded-xl bg-bg-nested/60 border border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-text-muted block">Classical Signature</span>
                  <span className="text-sm font-mono font-black text-text-primary">{report.sizeDelta.classicalBytes} B</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-text-muted block">Hybrid ML-DSA-87 Signature</span>
                  <span className="text-sm font-mono font-black text-text-primary">{(report.sizeDelta.hybridBytes / 1000).toFixed(1)} KB</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-text-muted block">Handshake Size Growth</span>
                  <span className="text-sm font-mono font-black text-status-warning">{report.sizeDelta.deltaMultiplier.toFixed(0)}x larger</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Crypto-Agility Report (JSON)
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
