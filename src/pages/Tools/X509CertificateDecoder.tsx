import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertTriangle, Calendar, Check, ChevronDown, Copy, FileWarning,
  Fingerprint, Globe2, KeyRound, ShieldAlert, ShieldCheck, TriangleAlert, UserSquare2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import FileDropInput from '../../components/Tools/FileDropInput'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { parseCertificateOrCsr } from '../../lib/tools/x509'
import type { ParsedCertOrCsr } from '../../lib/tools/x509'

const tool = getToolBySlug('x509-certificate-decoder')!

// A throwaway, locally-generated self-signed demo cert (825-day validity,
// CA:FALSE) — not a real production certificate — so the tool has a working
// default without shipping anything resembling a live credential.
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

export default function X509CertificateDecoder() {
  const [text, setText] = useState(SAMPLE_CERT_PEM)
  const [fileBytes, setFileBytes] = useState<Uint8Array<ArrayBuffer> | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [source, setSource] = useState<'text' | 'file'>('text')
  const [result, setResult] = useState<ParsedCertOrCsr | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    const input = source === 'file' && fileBytes ? fileBytes : text
    parseCertificateOrCsr(input).then((parsed) => {
      if (!cancelled) setResult(parsed)
    })
    return () => { cancelled = true }
  }, [text, fileBytes, source])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6 min-w-0">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm min-w-0">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Paste PEM (Certificate or CSR)</span>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSource('text') }}
            aria-label="Certificate or CSR PEM input"
            className="w-full h-56 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />
          <div className="pt-1">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Or Upload a File</span>
            <div className="mt-2">
              <FileDropInput
                accept=".pem,.crt,.cer,.csr,.der"
                hint="Accepts .pem/.crt/.cer/.csr (PEM text or raw DER) — processed entirely in your browser."
                onFile={(file, bytes) => {
                  setFileName(file.name)
                  setFileBytes(new Uint8Array(bytes))
                  setSource('file')
                }}
              />
              {fileName && source === 'file' && <p className="text-[11px] font-semibold text-text-secondary mt-2">{fileName}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          {result?.kind === 'error' && (
            <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
              <FileWarning className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary font-medium">{result.message}</p>
            </div>
          )}

          {result?.kind === 'csr' && (
            <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/20 flex items-start gap-3">
              <AlertTriangle className="w-4.5 h-4.5 text-status-warning shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                This is a PKCS#10 <strong>Certificate Signing Request</strong> — an unsigned request, not a trusted certificate. No CA has vouched for anything shown below.
              </p>
            </div>
          )}

          {(result?.kind === 'certificate' || result?.kind === 'csr') && (
            <>
              <Section title="Subject & Issuer" icon={UserSquare2} defaultOpen>
                <FieldRow label="Subject" value={result.subject.display} mono />
                {result.kind === 'certificate' && <FieldRow label="Issuer" value={result.issuer.display} mono />}
              </Section>

              {result.kind === 'certificate' && (
                <Section title="Validity" icon={Calendar} defaultOpen>
                  <FieldRow label="Version" value={`v${result.version}`} />
                  <FieldRow label="Serial Number" value={result.serialNumberHex} mono />
                  <FieldRow label="Signature Algorithm" value={result.signatureAlgorithm} />
                  <FieldRow label="Not Before" value={result.notBefore.toUTCString()} />
                  <FieldRow label="Not After" value={result.notAfter.toUTCString()} />
                  <div className="flex items-center gap-2 pt-1">
                    {result.isExpired ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-danger bg-status-danger/10 px-2.5 py-1 rounded-full">
                        <TriangleAlert className="w-3.5 h-3.5" /> EXPIRED {Math.abs(result.daysRemaining)} days ago
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-success bg-status-success/10 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> Expires in {result.daysRemaining} days
                      </span>
                    )}
                  </div>
                </Section>
              )}

              <Section title="Public Key" icon={KeyRound} defaultOpen>
                <FieldRow label="Algorithm" value={`${result.publicKey.algorithm} (${result.publicKey.details})`} />
              </Section>

              <Section title={`Subject Alternative Names (${result.subjectAltNames.length})`} icon={Globe2}>
                {result.subjectAltNames.length === 0 ? (
                  <p className="text-xs text-text-muted">No SANs present.</p>
                ) : (
                  <div className="space-y-1.5">
                    {result.subjectAltNames.map((san, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="uppercase font-bold text-text-muted w-12 shrink-0">{san.type}</span>
                        <span className="font-mono text-text-primary break-all">{san.value}</span>
                        {san.isSpiffe && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-primary bg-accent-glow px-2 py-0.5 rounded-full shrink-0">
                            SPIFFE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {result.kind === 'certificate' && (
                <Section title="Key Usage & Constraints" icon={ShieldAlert}>
                  <FieldRow label="Key Usage" value={result.keyUsage.length > 0 ? result.keyUsage.join(', ') : '—'} />
                  <FieldRow label="Extended Key Usage" value={result.extKeyUsage.length > 0 ? result.extKeyUsage.join(', ') : '—'} />
                  <FieldRow label="Is CA?" value={result.isCa ? 'Yes' : 'No'} />
                  {result.pathLenConstraint !== null && <FieldRow label="Path Length Constraint" value={String(result.pathLenConstraint)} />}
                </Section>
              )}

              {result.kind === 'certificate' && (
                <Section title="Fingerprints" icon={Fingerprint}>
                  <FingerprintRow label="SHA-1" value={result.fingerprintSha1} copy={copy} copiedId={copiedId} id="sha1" />
                  <FingerprintRow label="SHA-256" value={result.fingerprintSha256} copy={copy} copiedId={copiedId} id="sha256" />
                </Section>
              )}
            </>
          )}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function Section({ title, icon: Icon, children, defaultOpen }: { title: string; icon: LucideIcon; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent-primary" /> {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-border-subtle/50 space-y-2">{children}</div>}
    </div>
  )
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 text-xs">
      <span className="font-bold text-text-muted uppercase tracking-wider shrink-0 sm:w-40">{label}</span>
      <span className={`text-text-primary break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function FingerprintRow({ label, value, copy, copiedId, id }: { label: string; value: string; copy: (text: string, id: string) => void; copiedId: string | null; id: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
        <button type="button" onClick={() => copy(value, id)} aria-label={`Copy ${label} fingerprint`} className="text-text-muted hover:text-text-primary">
          {copiedId === id ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-2.5 rounded border border-border-subtle/50">{value}</p>
    </div>
  )
}
