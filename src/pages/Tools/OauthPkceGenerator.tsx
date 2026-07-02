import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { buildAuthorizationUrl, deriveCodeChallengeS256, generateCodeVerifier } from '../../lib/tools/pkce'

const tool = getToolBySlug('oauth-pkce-generator')!

export default function OauthPkceGenerator() {
  const [nonce, setNonce] = useState(0)
  // `nonce` forces a fresh verifier on "New" clicks — there's no other dependency to react to.
  const verifier = useMemo(() => { void nonce; return generateCodeVerifier(64) }, [nonce])
  const [challenge, setChallenge] = useState('')
  const [authorizationEndpoint, setAuthorizationEndpoint] = useState('https://idp.example.com/authorize')
  const [clientId, setClientId] = useState('demo-client-id')
  const [redirectUri, setRedirectUri] = useState('https://app.example.com/callback')
  const [scope, setScope] = useState('openid profile')
  const { copy, copiedId } = useClipboardCopy()

  const regenerate = () => setNonce((n) => n + 1)

  useEffect(() => {
    let cancelled = false
    deriveCodeChallengeS256(verifier).then((c) => { if (!cancelled) setChallenge(c) })
    return () => { cancelled = true }
  }, [verifier])

  let authorizationUrl = ''
  try {
    authorizationUrl = buildAuthorizationUrl({ authorizationEndpoint, clientId, redirectUri, scope, codeChallenge: challenge })
  } catch {
    authorizationUrl = ''
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FieldCard label="code_verifier" value={verifier} onCopy={() => copy(verifier, 'verifier')} copied={copiedId === 'verifier'}>
            <button type="button" onClick={regenerate} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-[11px] font-bold shrink-0">
              <RefreshCw className="w-3 h-3" /> New
            </button>
          </FieldCard>
          <FieldCard label="code_challenge (S256)" value={challenge} onCopy={() => copy(challenge, 'challenge')} copied={copiedId === 'challenge'} />
        </div>

        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Build a Sample Authorization URL</span>
          <LabeledInput label="Authorization Endpoint" value={authorizationEndpoint} onChange={setAuthorizationEndpoint} />
          <LabeledInput label="Client ID" value={clientId} onChange={setClientId} />
          <LabeledInput label="Redirect URI" value={redirectUri} onChange={setRedirectUri} />
          <LabeledInput label="Scope" value={scope} onChange={setScope} />
        </div>
      </div>

      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Authorization URL</span>
          <button type="button" onClick={() => copy(authorizationUrl, 'url')} aria-label="Copy authorization URL" className="text-text-muted hover:text-text-primary">
            {copiedId === 'url' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-32 overflow-y-auto">
          {authorizationUrl || 'Enter a valid authorization endpoint URL above.'}
        </p>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function FieldCard({ label, value, onCopy, copied, children }: { label: string; value: string; onCopy: () => void; copied: boolean; children?: ReactNode }) {
  return (
    <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          {children}
          <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="text-text-muted hover:text-text-primary">
            {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50">{value || '…'}</p>
    </div>
  )
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
      />
    </div>
  )
}
