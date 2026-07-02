import { useMemo, useState } from 'react'
import { AlertOctagon, CheckCircle2, Copy, Check, Terminal } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { decodeJwt, formatClaimTimestamp, isWeakAlg, verifyJwtHmac } from '../../lib/tools/jwt'

const tool = getToolBySlug('jwt-decoder')!
// Signed with the demo secret "your-256-bit-secret" so the Verify action
// below has something real to check against out of the box.
const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MzE3MDMwMjJ9.5l-50DAbvxQLfFgc9rri57sUu0qKk3ydbIYuKd49VFU'

const CLAIM_TIME_KEYS = ['exp', 'iat', 'nbf']

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE_TOKEN)
  const [secret, setSecret] = useState('')
  const [verifyResult, setVerifyResult] = useState<'idle' | 'valid' | 'invalid' | 'checking'>('idle')
  const { copy, copiedId } = useClipboardCopy()

  const decoded = useMemo(() => decodeJwt(token), [token])
  const alg = decoded.header?.alg

  const handleVerify = async () => {
    if (!secret) return
    setVerifyResult('checking')
    const ok = await verifyJwtHmac(token, secret)
    setVerifyResult(ok ? 'valid' : 'invalid')
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Paste a JWT</span>
            {!decoded.isStructurallyValid && (
              <span className="text-[10px] text-status-danger font-bold">Not a valid 3-segment token</span>
            )}
          </div>
          <textarea
            value={token}
            onChange={(e) => { setToken(e.target.value); setVerifyResult('idle') }}
            aria-label="JWT to decode"
            placeholder="Paste a header.payload.signature token"
            className="w-full h-48 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />

          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Optional: verify HMAC signature</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setVerifyResult('idle') }}
                placeholder="Shared secret (for HS256/384/512 only)"
                className="flex-1 p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={!secret}
                className="px-4 py-2 rounded-lg bg-accent-primary text-white text-xs font-bold disabled:opacity-40 shrink-0"
              >
                Verify
              </button>
            </div>
            {verifyResult === 'valid' && (
              <p className="text-[11px] text-status-success font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Signature is valid for this secret.</p>
            )}
            {verifyResult === 'invalid' && (
              <p className="text-[11px] text-status-danger font-bold flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5" /> Signature does not match this secret (or algorithm isn't HS256/384/512).</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isWeakAlg(alg) && (
            <div className="p-4 rounded-xl border bg-status-danger/5 border-status-danger/30 text-status-danger flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <p className="text-xs font-semibold">
                <span className="font-extrabold uppercase">Warning:</span> this token's algorithm is <span className="font-mono">"{String(alg)}"</span>. Servers that accept "none" skip signature verification entirely — any claim can be forged.
              </p>
            </div>
          )}

          <DecodedPanel
            title="Header"
            colorClass="text-status-danger"
            value={decoded.header}
            error={decoded.headerError}
            onCopy={() => copy(decoded.headerRaw, 'header')}
            copied={copiedId === 'header'}
          />
          <DecodedPanel
            title="Payload"
            colorClass="text-accent-primary"
            value={decoded.payload}
            error={decoded.payloadError}
            onCopy={() => copy(decoded.payloadRaw, 'payload')}
            copied={copiedId === 'payload'}
            claimHints={decoded.payload ?? undefined}
          />

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-accent-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Signature (raw)
              </span>
              <button type="button" onClick={() => copy(decoded.signature, 'signature')} aria-label="Copy signature" className="text-text-muted hover:text-text-primary">
                {copiedId === 'signature' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-24 overflow-y-auto">
              {decoded.signature || '(none)'}
            </p>
          </div>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function DecodedPanel({
  title,
  colorClass,
  value,
  error,
  onCopy,
  copied,
  claimHints,
}: {
  title: string
  colorClass: string
  value: Record<string, unknown> | null
  error?: string
  onCopy: () => void
  copied: boolean
  claimHints?: Record<string, unknown>
}) {
  return (
    <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{title}</span>
        <button type="button" onClick={onCopy} aria-label={`Copy ${title}`} className="text-text-muted hover:text-text-primary">
          {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-status-danger font-semibold">{error}</p>
      ) : (
        <pre className="text-[11px] font-mono text-text-primary break-all whitespace-pre-wrap bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-48 overflow-y-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
      {claimHints && (
        <div className="space-y-1 pt-1">
          {CLAIM_TIME_KEYS.filter((key) => key in claimHints).map((key) => (
            <p key={key} className="text-[10px] text-text-muted font-semibold">
              <span className="font-mono text-text-secondary">{key}:</span> {formatClaimTimestamp(claimHints[key])}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
