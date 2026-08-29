import { useState } from 'react'
import { BadgeCheck, ShieldAlert, Check, X, Server, RefreshCw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import FileDropInput from '../../components/Tools/FileDropInput'
import { getToolBySlug } from '../../data/toolsRegistry'
import { verifyCertificate, type SignedCertificate } from '../../lib/career/certificateSigner'
import { isSignedCertificate } from '../../lib/utils/jsonGuard'

const tool = getToolBySlug('certificate-verifier')!

type VerdictState = 'idle' | 'verifying' | 'valid' | 'invalid' | 'malformed'

export default function CertificateVerifier() {
  const [input, setInput] = useState('')
  const [verdict, setVerdict] = useState<VerdictState>('idle')
  const [parsedPayload, setParsedPayload] = useState<SignedCertificate['payload'] | null>(null)

  const handleVerify = async () => {
    setVerdict('verifying')
    
    // Simulate complex cryptographic handshake network time
    setTimeout(async () => {
      let signed: unknown
      try {
        signed = JSON.parse(input)
        if (!isSignedCertificate(signed)) {
          throw new Error('Malformed schema')
        }
      } catch {
        setVerdict('malformed')
        setParsedPayload(null)
        return
      }

      setParsedPayload(signed.payload)
      const isValid = await verifyCertificate(signed)
      setVerdict(isValid ? 'valid' : 'invalid')
    }, 1500)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow flex flex-col">
            <div className="space-y-4 flex-1">
              <label htmlFor="certificate-json" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                Paste Certificate JSON
              </label>
              <textarea
                id="certificate-json"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setVerdict('idle')
                }}
                className="w-full min-h-[220px] p-4 rounded-xl bg-slate-950 border border-border-subtle text-[11px] font-mono text-slate-300 focus:outline-none focus:border-accent-primary custom-scrollbar transition break-all"
                placeholder='{"payload": {...}, "signature": "...", "publicKeyJwk": {...}}'
                spellCheck={false}
              />
              <FileDropInput
                onFile={(_f, bytes) => {
                  setInput(new TextDecoder().decode(bytes))
                  setVerdict('idle')
                }}
                accept=".json"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={!input.trim() || verdict === 'verifying'}
              className="mt-6 w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 hover-cyber-glow"
            >
              {verdict === 'verifying' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              {verdict === 'verifying' ? 'Validating ECDSA Signature...' : 'Verify Certificate'}
            </button>
          </div>

          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none select-none"></div>
            
            <h3 className="text-sm font-bold text-text-primary mb-6 border-b border-border-subtle pb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-accent-primary" /> Attestation Results
            </h3>

            {verdict === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-50 select-none">
                <BadgeCheck className="w-12 h-12 text-text-muted" />
                <span className="font-bold text-text-muted">Awaiting Verification</span>
                <span className="text-[10px] text-text-muted">Submit a JSON payload to validate its ECDSA signature against the embedded JWK.</span>
              </div>
            )}

            {verdict === 'verifying' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full border-2 border-accent-primary/20 border-t-accent-primary animate-spin"></div>
                <div className="space-y-1">
                  <span className="font-bold text-accent-primary uppercase tracking-wider text-xs">Authenticating Signature</span>
                  <p className="text-[10px] text-text-muted">Extracting SPKI & regenerating buffer hashes...</p>
                </div>
              </div>
            )}

            {verdict !== 'idle' && verdict !== 'verifying' && (
              <div
                className={`flex-1 p-5 rounded-xl border flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-2 ${
                  verdict === 'valid'
                    ? 'bg-status-success/10 border-status-success/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                    : 'bg-status-danger/10 border-status-danger/30 shadow-[0_0_15px_rgba(248,113,113,0.1)]'
                }`}
              >
                <div className="flex items-center gap-2 w-full border-b border-border-subtle/20 pb-3">
                  {verdict === 'valid' ? (
                    <Check className="w-6 h-6 text-status-success shrink-0" />
                  ) : (
                    <X className="w-6 h-6 text-status-danger shrink-0" />
                  )}
                  <p className={`text-sm font-black uppercase tracking-wider ${verdict === 'valid' ? 'text-status-success' : 'text-status-danger'}`}>
                    {verdict === 'valid' && 'Certificate Valid'}
                    {verdict === 'invalid' && 'Signature Invalid'}
                    {verdict === 'malformed' && 'Malformed Input'}
                  </p>
                </div>

                <div className="space-y-3 w-full">
                  <p className={`text-xs font-medium ${verdict === 'valid' ? 'text-emerald-500/80' : 'text-status-danger/80'}`}>
                    {verdict === 'valid' && 'The ECDSA P-256 signature securely matches the JSON contents and the embedded public JWK.'}
                    {verdict === 'invalid' && 'The cryptographic signature does not match the JSON payload. This certificate may have been tampered with or corrupted.'}
                    {verdict === 'malformed' && 'This does not match the AboutIAM SignedCertificate schema.'}
                  </p>

                  {parsedPayload && verdict !== 'malformed' && (
                    <div className="p-3 bg-bg-card rounded-lg border border-border-subtle/50 text-xs text-text-secondary leading-relaxed space-y-1.5 font-mono shadow-inner">
                      <div><span className="font-bold text-text-primary uppercase tracking-wider text-[9px]">Recipient:</span> {parsedPayload.recipientName}</div>
                      <div><span className="font-bold text-text-primary uppercase tracking-wider text-[9px]">Date:</span> {parsedPayload.issuedOn}</div>
                      <div><span className="font-bold text-text-primary uppercase tracking-wider text-[9px]">Progress:</span> {parsedPayload.completedModuleCount}/{parsedPayload.totalModuleCount} modules, {parsedPayload.completedLabCount} labs</div>
                    </div>
                  )}

                  {verdict === 'valid' && (
                    <div className="pt-2 flex flex-col gap-3 select-none">
                      <div className="flex gap-2">
                        <a
                          href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent('AboutIAM Certified Identity Specialist')}&organizationName=${encodeURIComponent('AboutIAM')}&certUrl=${encodeURIComponent('https://www.aboutiam.com/tools/certificate-verifier')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-[11px] font-bold transition-all shadow-sm"
                        >
                          Add to LinkedIn Profile 🚀
                        </a>
                      </div>
                      
                      <div className="pt-3 border-t border-border-subtle/30">
                        <span className="text-[9px] font-bold text-text-muted uppercase block mb-1">Copy GitHub Profile README Badge</span>
                        <pre className="p-2.5 rounded-lg bg-slate-950/80 border border-border-subtle/50 text-[10px] font-mono text-teal-300 overflow-auto select-all cursor-copy">
                          {`[![AboutIAM Certified](https://img.shields.io/badge/AboutIAM-Certified_Specialist-blue?logo=auth0)](https://www.aboutiam.com/tools/certificate-verifier)`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2 hover-cyber-glow">
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
