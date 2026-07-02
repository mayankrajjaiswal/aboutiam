import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Copy, FileWarning, XCircle } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { parseSdJwt } from '../../lib/tools/sdJwt'
import type { ParsedSdJwt } from '../../lib/tools/sdJwt'

const tool = getToolBySlug('sd-jwt-decoder')!

// A self-issued demo SD-JWT (dummy signature, non-real issuer) — three
// disclosures (given_name, family_name, email), all correctly digest-bound.
const SAMPLE_SD_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6InNkK2p3dCJ9.eyJpc3MiOiJodHRwczovL2lzc3Vlci5hYm91dGlhbS5sb2NhbCIsImlhdCI6MTc1MTQ2MjQwMCwiX3NkX2FsZyI6InNoYS0yNTYiLCJzdWIiOiJ1c2VyXzQyIiwiX3NkIjpbIjhWSGl6N3FUWGF2eHZwaVRZRENTcl9zaGtVTzZxUmNWWGpraEVudDFvczQiLCI0ZzloYW9Bb18wblBKSFUzWk80UDlNWFJ3UnRQcnVYcHA2bEt3Mjlfa0pJIiwidUFoVzAyWi1RUm9vT0VJM1dacF8yVVVSZGd5MVpVeHRlQzBtVnhOTFNIYyJdfQ.c2lnbmF0dXJlLXBsYWNlaG9sZGVy~WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwiZ2l2ZW5fbmFtZSIsIkpvaG4iXQ~WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwiZmFtaWx5X25hbWUiLCJEb2UiXQ~WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwiZW1haWwiLCJqb2huZG9lQGV4YW1wbGUuY29tIl0~'

export default function SdJwtDecoder() {
  const [input, setInput] = useState(SAMPLE_SD_JWT)
  const [result, setResult] = useState<ParsedSdJwt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    parseSdJwt(input)
      .then((parsed) => {
        if (!cancelled) {
          setResult(parsed)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult(null)
          setError(err instanceof Error ? err.message : 'Could not parse this SD-JWT.')
        }
      })
    return () => { cancelled = true }
  }, [input])

  return (
    <ToolPageShell tool={tool}>
      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">SD-JWT (compact serialization)</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="SD-JWT compact serialization input"
          placeholder="<issuer-signed-jwt>~<disclosure>~<disclosure>~...~"
          className="w-full h-32 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
          <FileWarning className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary font-medium">{error}</p>
        </div>
      )}

      {result && !error && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <JsonCard label="Issuer JWT — Header" value={result.issuerJwt.header} onCopy={copy} copiedId={copiedId} id="header" />
            <JsonCard label="Issuer JWT — Payload" value={result.issuerJwt.payload} onCopy={copy} copiedId={copiedId} id="payload" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Disclosures ({result.disclosures.length}) — {result.sdAlg} digest binding
            </span>
            {result.disclosures.length === 0 ? (
              <p className="text-xs text-text-muted">No disclosures found.</p>
            ) : (
              <div className="space-y-2">
                {result.disclosures.map((d, i) => (
                  <div key={i} className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-text-primary font-mono break-all">{d.key ?? '(array element)'}</span>
                      {d.error ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-danger shrink-0"><XCircle className="w-3.5 h-3.5" /> Malformed</span>
                      ) : d.isBound ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-success shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /> Binding verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-danger shrink-0"><XCircle className="w-3.5 h-3.5" /> Not referenced in _sd</span>
                      )}
                    </div>
                    {!d.error && (
                      <p className="text-xs font-mono text-text-secondary break-all bg-bg-sidebar p-2.5 rounded border border-border-subtle/50">
                        {typeof d.value === 'string' ? d.value : JSON.stringify(d.value)}
                      </p>
                    )}
                    {d.error && <p className="text-xs text-status-danger">{d.error}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.keyBindingJwt && (
            <div className="grid sm:grid-cols-2 gap-4">
              <JsonCard label="Key Binding JWT — Header" value={result.keyBindingJwt.header} onCopy={copy} copiedId={copiedId} id="kbheader" />
              <JsonCard label="Key Binding JWT — Payload" value={result.keyBindingJwt.payload} onCopy={copy} copiedId={copiedId} id="kbpayload" />
            </div>
          )}
        </>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function JsonCard({
  label,
  value,
  onCopy,
  copiedId,
  id,
}: {
  label: string
  value: unknown
  onCopy: (text: string, id: string) => void
  copiedId: string | null
  id: string
}) {
  const json = JSON.stringify(value, null, 2)
  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <button type="button" onClick={() => onCopy(json, id)} aria-label={`Copy ${label}`} className="text-text-muted hover:text-text-primary">
          {copiedId === id ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-48 overflow-auto whitespace-pre-wrap">
        {json}
      </pre>
    </div>
  )
}
