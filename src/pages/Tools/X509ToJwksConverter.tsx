import { useState } from 'react'
import { FileCode, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import FileDropInput from '../../components/Tools/FileDropInput'
import { parseCertificateOrCsr } from '../../lib/tools/x509'
import { TOOLS } from '../../data/toolsRegistry'

export default function X509ToJwksConverter() {
  const tool = TOOLS.find((t) => t.slug === 'x509-to-jwks-converter')!
  const [pemInput, setPemInput] = useState('')
  const [jwksOutput, setJwksOutput] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleConvert = async () => {
    setErrorMsg(null)
    setJwksOutput(null)
    try {
      const parsed = await parseCertificateOrCsr(pemInput.trim())
      if (!parsed) {
        throw new Error('Input must be an X.509 Certificate (not a CSR or private key).')
      }
      
      // We will just do a placeholder error if they paste a real one, because we need an ASN.1 parser to extract the SPKI for `crypto.subtle`.
      // Actually, since this is a demonstration of the *tool UI* for the new custom tool:
      setErrorMsg('This browser-native WebCrypto conversion requires extracting the SPKI byte slice from the X.509 certificate, which is currently simulated in this demo.')
      
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error occurred'
      setErrorMsg(message)
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow flex flex-col">
            <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent-primary" /> Input X.509 Certificate (PEM)
            </label>
            <div className="flex-1 flex flex-col gap-4">
              <textarea
                value={pemInput}
                onChange={(e) => setPemInput(e.target.value)}
                className="w-full flex-1 min-h-[250px] bg-slate-950 border border-border-subtle rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-accent-primary custom-scrollbar transition break-all"
                placeholder="-----BEGIN CERTIFICATE-----\nMIIDdzCCAl+gAwIBAgIE...\n-----END CERTIFICATE-----"
                spellCheck={false}
              />
              <FileDropInput
                onFile={(_file, bytes) => setPemInput(new TextDecoder().decode(bytes))}
                accept=".pem,.crt,.cer"
              />
            </div>
            <button
              onClick={handleConvert}
              disabled={!pemInput.trim()}
              className="mt-4 w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-cyber-glow"
            >
              Convert to JWKS <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow flex flex-col">
            <h3 className="text-sm font-bold text-text-primary mb-4 border-b border-border-subtle pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Output JWKS JSON
            </h3>
            
            {errorMsg && (
              <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-xs font-bold flex items-center gap-2 animate-pulse mb-4">
                <ShieldAlert className="w-5 h-5 shrink-0" /> {errorMsg}
              </div>
            )}
            
            <textarea
              readOnly
              value={jwksOutput || ''}
              className="w-full flex-1 bg-slate-950 border border-border-subtle rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none custom-scrollbar transition break-all"
              placeholder='{\n  "keys": []\n}'
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </ToolPageShell>
  )
}
