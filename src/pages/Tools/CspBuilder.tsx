import { useState, useMemo } from 'react'
import { ShieldCheck, Copy, Check, Info } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import { TOOLS } from '../../data/toolsRegistry'

const IDP_PROVIDERS = [
  { id: 'auth0', name: 'Auth0', domains: ['*.auth0.com'] },
  { id: 'okta', name: 'Okta', domains: ['*.okta.com'] },
  { id: 'google', name: 'Google Workspace', domains: ['accounts.google.com'] },
  { id: 'entra', name: 'Microsoft Entra ID', domains: ['login.microsoftonline.com'] },
  { id: 'github', name: 'GitHub', domains: ['github.com'] },
]

export default function CspBuilder() {
  const tool = TOOLS.find((t) => t.slug === 'csp-builder')!
  const [selectedIdps, setSelectedIdps] = useState<string[]>([])
  const [useNonce, setUseNonce] = useState(true)
  const [copied, setCopied] = useState(false)

  const toggleIdp = (id: string) => {
    setSelectedIdps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const generatedCsp = useMemo(() => {
    const idpDomains = selectedIdps.flatMap(id => IDP_PROVIDERS.find(p => p.id === id)?.domains || [])
    const domainString = idpDomains.length > 0 ? ' ' + idpDomains.join(' ') : ''

    const scriptSrc = useNonce 
      ? `'self' 'nonce-RANDOM_VALUE' 'strict-dynamic'` 
      : `'self' 'unsafe-inline'`

    return [
      `default-src 'self'`,
      `script-src ${scriptSrc}`,
      `style-src 'self' 'unsafe-inline'`,
      `connect-src 'self'${domainString}`,
      `frame-src 'self'${domainString}`,
      `frame-ancestors 'none'`, // prevent clickjacking locally
      `form-action 'self'${domainString}`, // allow SSO POST bindings
      `base-uri 'self'`,
      `object-src 'none'`
    ].join('; ')
  }, [selectedIdps, useNonce])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCsp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* Builder Controls */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">1. Select Identity Providers</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Modern SSO requires explicitly allowing your IdP domains in <code>connect-src</code>, <code>frame-src</code>, and <code>form-action</code> to support OAuth flows and silent iframe renewals.
            </p>
            <div className="space-y-2">
              {IDP_PROVIDERS.map((idp) => (
                <label key={idp.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-bg-sidebar transition cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedIdps.includes(idp.id)}
                    onChange={() => toggleIdp(idp.id)}
                    className="w-4 h-4 text-accent-primary bg-bg-nested border-border-subtle rounded focus:ring-accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-primary">{idp.name}</span>
                    <span className="text-[10px] text-text-muted font-mono">{idp.domains.join(', ')}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">2. Script Security Level</h3>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-bg-sidebar transition cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useNonce}
                onChange={(e) => setUseNonce(e.target.checked)}
                className="w-4 h-4 text-accent-primary bg-bg-nested border-border-subtle rounded focus:ring-accent-primary"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary">Enable Level 3 CSP (Nonces)</span>
                <span className="text-xs text-text-secondary leading-relaxed mt-1">
                  Enforces <code>'strict-dynamic'</code> and requires your server to generate a random nonce for every request. If unchecked, falls back to <code>'unsafe-inline'</code>.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm hover-cyber-glow sticky top-24 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Generated CSP Header
              </h3>
              <button
                onClick={copyToClipboard}
                className="text-[10px] bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary px-3 py-1.5 rounded border border-accent-primary/30 transition cursor-pointer flex items-center gap-1 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-loose break-all select-all">
              {generatedCsp.split('; ').map((dir, i) => (
                <div key={i}>
                  <span className="text-accent-primary font-bold">{dir.split(' ')[0]}</span>
                  <span className="text-slate-400">{' ' + dir.split(' ').slice(1).join(' ')}</span>;
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-status-info/10 border border-status-info/20 rounded-lg flex items-start gap-2 text-xs text-status-info">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Apply this string as the <code>Content-Security-Policy</code> HTTP response header in your web server (e.g. Nginx, Next.js, or Vercel config).</p>
            </div>
          </div>
        </div>

      </div>
    </ToolPageShell>
  )
}
