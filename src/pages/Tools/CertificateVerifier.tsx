import { useState } from 'react'
import { BadgeCheck, ShieldAlert, Check, X, Upload } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { verifyCertificate, type SignedCertificate } from '../../lib/career/certificateSigner'

const tool = getToolBySlug('certificate-verifier')!

type VerdictState = 'idle' | 'valid' | 'invalid' | 'malformed'

export default function CertificateVerifier() {
  const [input, setInput] = useState('')
  const [verdict, setVerdict] = useState<VerdictState>('idle')
  const [parsedPayload, setParsedPayload] = useState<SignedCertificate['payload'] | null>(null)

  const handleVerify = async () => {
    let signed: SignedCertificate
    try {
      signed = JSON.parse(input)
      if (!signed || typeof signed !== 'object' || !signed.payload || !signed.signature || !signed.publicKeyJwk) {
        throw new Error('Missing required fields')
      }
    } catch {
      setVerdict('malformed')
      setParsedPayload(null)
      return
    }

    setParsedPayload(signed.payload)
    const isValid = await verifyCertificate(signed)
    setVerdict(isValid ? 'valid' : 'invalid')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setInput(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="certificate-json" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Paste Certificate JSON
          </label>
          <textarea
            id="certificate-json"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setVerdict('idle')
            }}
            rows={10}
            placeholder='{"payload": {...}, "signature": "...", "publicKeyJwk": {...}}'
            className="w-full p-3 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <BadgeCheck className="w-4 h-4" /> Verify Certificate
          </button>
          <label className="px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {verdict !== 'idle' && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              verdict === 'valid'
                ? 'bg-status-success/10 border-status-success/30'
                : 'bg-status-danger/10 border-status-danger/30'
            }`}
          >
            {verdict === 'valid' ? (
              <Check className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className={`text-sm font-bold ${verdict === 'valid' ? 'text-status-success' : 'text-status-danger'}`}>
                {verdict === 'valid' && 'Signature valid — the contents match what was signed.'}
                {verdict === 'invalid' && 'Signature invalid — the contents do not match the signature.'}
                {verdict === 'malformed' && 'Malformed input — this is not a recognizable AboutIAM certificate.'}
              </p>
              {parsedPayload && verdict !== 'malformed' && (
                <p className="text-xs text-text-secondary leading-relaxed">
                  Claimed: {parsedPayload.recipientName} completed {parsedPayload.completedModuleCount} of{' '}
                  {parsedPayload.totalModuleCount} modules and {parsedPayload.completedLabCount} labs, issued{' '}
                  {parsedPayload.issuedOn}.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-accent-primary" /> What This Does and Doesn't Prove
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            This confirms the certificate's contents haven't been altered since AboutIAM generated it in your
            browser — it is not a substitute for third-party-issued professional certification and should not be
            represented as one. Because AboutIAM is a purely client-side application, the signing key ships inside
            the app's own code like everything else it serves — so this cannot prove the certificate is
            "unforgeable," only that it is internally self-consistent (its claimed contents match its own embedded
            signature), the same way a checksum proves a file wasn't corrupted without proving who created it.
          </p>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
