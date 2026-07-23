import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, KeyRound, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { validateDidDocument } from '../../lib/tools/didDocumentValidator'

const tool = getToolBySlug('did-document-validator')!

const SAMPLE_DOC = JSON.stringify(
  {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
    id: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    verificationMethod: [
      {
        id: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        type: 'Ed25519VerificationKey2020',
        controller: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      },
    ],
    authentication: ['did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'],
    assertionMethod: ['did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'],
  },
  null,
  2
)

export default function DidDocumentValidator() {
  const [text, setText] = useState(SAMPLE_DOC)

  const { result, parseError } = useMemo(() => {
    try {
      const json = JSON.parse(text)
      return { result: validateDidDocument(json), parseError: null as string | null }
    } catch (err) {
      return { result: null, parseError: err instanceof Error ? err.message : 'Invalid JSON.' }
    }
  }, [text])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6 min-w-0">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm min-w-0">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Paste a DID Document (JSON)</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="DID Document JSON input"
            className="w-full h-[28rem] p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4 min-w-0">
          {parseError && (
            <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary font-medium">Invalid JSON: {parseError}</p>
            </div>
          )}

          {result && (
            <>
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${result.valid ? 'bg-status-success/10 border-status-success/20' : 'bg-status-danger/10 border-status-danger/20'}`}>
                {result.valid ? <ShieldCheck className="w-5 h-5 text-status-success shrink-0" /> : <ShieldAlert className="w-5 h-5 text-status-danger shrink-0" />}
                <span className={`text-xs font-bold uppercase ${result.valid ? 'text-status-success' : 'text-status-danger'}`}>
                  {result.valid ? 'Structurally valid DID Document' : `${result.issues.filter((i) => i.severity === 'error').length} structural error(s) found`}
                </span>
              </div>

              {result.id && (
                <div className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-1">Resolved DID</span>
                  <p className="text-xs font-mono text-text-primary break-all">{result.id}</p>
                </div>
              )}

              {result.issues.length > 0 && (
                <div className="space-y-2">
                  {result.issues.map((issue, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${issue.severity === 'error' ? 'bg-status-danger/5 border-status-danger/20' : 'bg-status-warning/5 border-status-warning/20'}`}>
                      <TriangleAlert className={`w-4 h-4 shrink-0 mt-0.5 ${issue.severity === 'error' ? 'text-status-danger' : 'text-status-warning'}`} />
                      <p className="text-[11px] text-text-secondary leading-relaxed font-medium">{issue.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.verificationMethods.length > 0 && (
                <div className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Verification Methods</span>
                  {result.verificationMethods.map((vm, i) => (
                    <div key={i} className="text-[11px] font-mono text-text-secondary flex items-start gap-2 border-t border-border-subtle/50 pt-2 first:border-0 first:pt-0">
                      {vm.hasKeyMaterial ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-status-danger shrink-0 mt-0.5" />}
                      <div className="break-all">
                        <p className="text-text-primary">{vm.id}</p>
                        <p className="text-text-muted">{vm.type} — controller: {vm.controller}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
