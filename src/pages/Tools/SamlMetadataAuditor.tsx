import { useState } from 'react'
import { FileCode, ShieldAlert, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import { TOOLS } from '../../data/toolsRegistry'

export default function SamlMetadataAuditor() {
  const tool = TOOLS.find((t) => t.slug === 'saml-metadata-auditor')!
  const [xmlInput, setXmlInput] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAudit = () => {
    setErrorMsg(null)
    setAnalysis(null)
    try {
      if (!xmlInput.includes('<EntityDescriptor')) {
        throw new Error('Invalid SAML Metadata. Missing <EntityDescriptor> root element.')
      }

      const risks: { level: 'critical' | 'high' | 'warning', msg: string }[] = []
      let entityId = 'Unknown'
      
      const entityIdMatch = xmlInput.match(/entityID="([^"]+)"/)
      if (entityIdMatch) entityId = entityIdMatch[1]

      const hasIdp = xmlInput.includes('<IDPSSODescriptor')
      const hasSp = xmlInput.includes('<SPSSODescriptor')
      
      if (!hasIdp && !hasSp) {
        throw new Error('Metadata must contain at least one IDPSSODescriptor or SPSSODescriptor.')
      }

      if (xmlInput.includes('http://www.w3.org/2000/09/xmldsig#rsa-sha1') || xmlInput.includes('sha1')) {
        risks.push({ level: 'critical', msg: 'Weak signature algorithm detected (SHA-1). Must use SHA-256 or higher.' })
      }

      if (!xmlInput.includes('<KeyDescriptor use="signing">') && !xmlInput.includes('<KeyDescriptor>')) {
        risks.push({ level: 'high', msg: 'No signing certificates (KeyDescriptor) found in metadata.' })
      }

      if (xmlInput.includes('Location="http://')) {
        risks.push({ level: 'critical', msg: 'Insecure plaintext HTTP bindings detected. All SSO bindings must use HTTPS.' })
      }

      if (!xmlInput.includes('WantAssertionsSigned="true"') && hasSp) {
        risks.push({ level: 'warning', msg: 'SPSSODescriptor does not explicitly require signed assertions (WantAssertionsSigned="true").' })
      }

      setAnalysis({
        entityId,
        type: hasIdp && hasSp ? 'IdP & SP' : hasIdp ? 'Identity Provider (IdP)' : 'Service Provider (SP)',
        risks,
        certCount: (xmlInput.match(/<ds:X509Certificate>/g) || []).length
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setErrorMsg(msg)
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow flex flex-col">
            <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent-primary" /> Paste SAML 2.0 Metadata XML
            </label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              className="w-full flex-1 min-h-[300px] bg-slate-950 border border-border-subtle rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-accent-primary custom-scrollbar transition break-all"
              placeholder='<EntityDescriptor entityID="https://idp.example.com">\n  ...\n</EntityDescriptor>'
              spellCheck={false}
            />
            <button
              onClick={handleAudit}
              disabled={!xmlInput.trim()}
              className="mt-4 w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 hover-cyber-glow"
            >
              <FileCheck className="w-4 h-4" /> Audit Metadata Schema
            </button>
          </div>

          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow flex flex-col">
            <h3 className="text-sm font-bold text-text-primary mb-4 border-b border-border-subtle pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Audit Results
            </h3>

            {errorMsg ? (
              <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-xs font-bold flex items-center gap-2 animate-pulse mb-4">
                <ShieldAlert className="w-5 h-5 shrink-0" /> {errorMsg}
              </div>
            ) : analysis ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-bg-sidebar border border-border-subtle">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Entity ID</span>
                    <span className="text-xs font-mono text-accent-primary font-bold break-all">{analysis.entityId}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-sidebar border border-border-subtle">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Entity Type</span>
                    <span className="text-xs font-bold text-text-primary">{analysis.type}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-sidebar border border-border-subtle col-span-2">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">X.509 Certificates</span>
                    <span className="text-xs font-bold text-text-primary">{analysis.certCount} certificate(s) embedded</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Security Risks</h4>
                  {analysis.risks.length === 0 ? (
                    <div className="p-4 bg-status-success/10 border border-status-success/20 rounded-xl text-status-success text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> No critical risks detected.
                    </div>
                  ) : (
                    analysis.risks.map((risk: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                        risk.level === 'critical' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' : 
                        risk.level === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                        'bg-status-warning/10 border-status-warning/30 text-status-warning'
                      }`}>
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-semibold">{risk.msg}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-50 select-none">
                <ShieldCheck className="w-12 h-12 text-text-muted" />
                <span className="font-bold text-text-muted">Awaiting XML Payload</span>
                <span className="text-[10px] text-text-muted">Paste SAML 2.0 metadata to analyze its security schema.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageShell>
  )
}
