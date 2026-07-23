import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import FileDropInput from '../../components/Tools/FileDropInput'
import { getToolBySlug } from '../../data/toolsRegistry'
import { analyzeBundle } from '../../lib/tools/certBundle'
import type { BundleAnalysis } from '../../lib/tools/certBundle'

const tool = getToolBySlug('cert-bundle-splitter')!

// A throwaway, locally-generated self-signed demo cert (same one used by the
// X.509 Certificate Decoder) repeated twice so the default view shows a
// correctly-chained two-entry bundle without shipping a real credential.
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

const SAMPLE_BUNDLE = `${SAMPLE_CERT_PEM}\n${SAMPLE_CERT_PEM}\n`

export default function CertBundleSplitter() {
  const [text, setText] = useState(SAMPLE_BUNDLE)
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null)

  useEffect(() => {
    let cancelled = false
    analyzeBundle(text).then((result) => { if (!cancelled) setAnalysis(result) })
    return () => { cancelled = true }
  }, [text])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6 min-w-0">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm min-w-0">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Paste PEM Bundle (fullchain.pem)</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="PEM certificate bundle input"
            className="w-full h-96 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />
          <div className="pt-1">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Or Upload a File</span>
            <div className="mt-2">
              <FileDropInput
                accept=".pem,.crt,.cer"
                hint="Accepts a .pem/.crt/.cer bundle containing one or more certificates — processed entirely in your browser."
                onFile={async (_file, bytes) => setText(new TextDecoder().decode(bytes))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          {analysis && analysis.entries.length === 0 && (
            <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary font-medium">No <span className="font-mono">-----BEGIN CERTIFICATE-----</span> blocks found in the pasted text.</p>
            </div>
          )}

          {analysis && analysis.entries.length > 0 && (
            <>
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                analysis.chainIssues.length === 0 ? 'bg-status-success/10 border-status-success/20' : 'bg-status-danger/10 border-status-danger/20'
              }`}>
                {analysis.chainIssues.length === 0 ? (
                  <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                ) : (
                  <TriangleAlert className="w-5 h-5 text-status-danger shrink-0" />
                )}
                <span className={`text-xs font-bold uppercase ${analysis.chainIssues.length === 0 ? 'text-status-success' : 'text-status-danger'}`}>
                  {analysis.entries.length} certificate{analysis.entries.length === 1 ? '' : 's'} found — {analysis.chainIssues.length === 0 ? 'chain order looks correct' : `${analysis.chainIssues.length} ordering issue${analysis.chainIssues.length === 1 ? '' : 's'} found`}
                </span>
              </div>

              {analysis.chainIssues.map((issue, i) => (
                <div key={i} className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">{issue.message}</p>
                </div>
              ))}

              {analysis.entries.map((entry, i) => (
                <div key={i} className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-2">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                    {entry.parsed.kind === 'error' ? <AlertTriangle className="w-4 h-4 text-status-danger" /> : <CheckCircle2 className="w-4 h-4 text-status-success" />}
                    Certificate {i + 1} {i === 0 ? '(Leaf)' : i === analysis.entries.length - 1 ? '(Root/Top of bundle)' : '(Intermediate)'}
                  </span>
                  {entry.parsed.kind === 'error' ? (
                    <p className="text-[11px] text-status-danger font-medium">{entry.parsed.message}</p>
                  ) : (
                    <div className="text-[11px] text-text-secondary space-y-1 font-mono">
                      <p><span className="text-text-muted">Subject:</span> {entry.parsed.subject.display}</p>
                      <p><span className="text-text-muted">Issuer:</span> {entry.parsed.issuer.display}</p>
                      <p className={entry.parsed.isExpired ? 'text-status-danger font-bold' : ''}>
                        <span className="text-text-muted font-sans">Expires:</span> {entry.parsed.notAfter.toUTCString()} {entry.parsed.isExpired && '— EXPIRED'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
