import { useState } from 'react'
import { Server, Database, Globe, Network, ShieldCheck, FileKey2, Terminal } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function OidcFederationLab() {
  const { frames: packetFrames, capture, clearFrames } = usePacketCapture()
  const packetCaptureProps = { frames: packetFrames, onClear: clearFrames }
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    resetPlayground
  } = usePlayground({
    moduleId: 'oidc_federation_lab',
    initialScore: 100,
    maxHints: 3
  })

  const [activeTab, setActiveTab] = useState<'topology' | 'discovery'>('topology')
  const [discoveredKeys, setDiscoveredKeys] = useState<string[]>([])
  const [trustedIssuers, setTrustedIssuers] = useState<Record<string, boolean>>({
    'https://university-a.edu': true,
    'https://hospital-b.org': false
  })
  
  const [tokenVerified, setTokenVerified] = useState(false)

  const handleDiscover = (issuer: string) => {
    log('info', `[OIDC Discovery] Fetching .well-known/openid-configuration for ${issuer}`)
    capture({ direction: 'request', protocol: 'OIDC Discovery', summary: `GET ${issuer}/.well-known/openid-configuration`, raw: `GET /.well-known/openid-configuration HTTP/1.1\nHost: ${issuer.replace('https://', '')}` })
    
    setTimeout(() => {
      capture({ direction: 'response', protocol: 'OIDC Discovery', summary: `200 OK - Discovery Document`, raw: `HTTP/1.1 200 OK\n\n{\n  "issuer": "${issuer}",\n  "jwks_uri": "${issuer}/.well-known/jwks.json"\n}` })
      log('info', `[JWKS Fetch] Fetching keys from ${issuer}/.well-known/jwks.json`)
      capture({ direction: 'request', protocol: 'JWKS Fetch', summary: `GET ${issuer}/.well-known/jwks.json`, raw: `GET /.well-known/jwks.json HTTP/1.1\nHost: ${issuer.replace('https://', '')}` })
      
      setTimeout(() => {
        const kid = `key-${Math.random().toString(36).substring(2, 8)}`
        capture({ direction: 'response', protocol: 'JWKS Fetch', summary: `200 OK - JWKS`, raw: `HTTP/1.1 200 OK\n\n{\n  "keys": [{ "kty": "RSA", "kid": "${kid}" }]\n}` })
        setDiscoveredKeys(prev => [...prev, `${issuer} (${kid})`])
        log('success', `[OIDC Federation] Successfully discovered and cached public key ${kid} for issuer ${issuer}`)
        if (currentStep === 0) completeStep(1)
      }, 600)
    }, 600)
  }

  const handleVerifyToken = (issuer: string) => {
    log('info', `[API Gateway] Received JWT access token from ${issuer}`)
    
    const isTrusted = trustedIssuers[issuer]
    if (!isTrusted) {
      log('error', `[Authorization] Trust Chain Failed. ${issuer} is not an authorized federation partner.`)
      capture({ direction: 'error', protocol: 'OIDC Federation', summary: `401 Unauthorized - Untrusted Issuer`, raw: `HTTP/1.1 401 Unauthorized\n\nIssuer not mapped in trust registry.` })
      return
    }

    const hasKey = discoveredKeys.some(k => k.includes(issuer))
    if (!hasKey) {
      log('warning', `[Signature Verification] No cached JWKS found for ${issuer}. Re-triggering discovery...`)
      handleDiscover(issuer)
      return
    }

    log('success', `[Signature Verification] Token signature verified successfully using cached JWKS for ${issuer}`)
    setTokenVerified(true)
    capture({ direction: 'response', protocol: 'OIDC Federation', summary: `200 OK - Token Verified`, raw: `HTTP/1.1 200 OK\n\nJWT Signature Validated via Trust Chain` })
    
    if (currentStep === 1) completeStep(2)
  }

  const handleToggleTrust = (issuer: string) => {
    setTrustedIssuers(prev => ({
      ...prev,
      [issuer]: !prev[issuer]
    }))
    log('info', `[Trust Registry] Updated federation trust policy for ${issuer}. Trusted: ${!trustedIssuers[issuer]}`)
  }

  return (
    <PlaygroundShell
      title="OIDC Federation (Shared Trust Chains)"
      description="Simulate how multi-tenant federated networks (like educational eduGAIN or government digital ID grids) discover, trust, and verify public JWKS across independent issuers."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={() => {
        if (currentStep === 0) revealHint("You need to fetch the OpenID metadata and JWKS for an issuer first.")
        else if (currentStep === 1) revealHint("Ensure the issuer is toggled as 'Trusted' before verifying their token.")
      }}
      onReset={() => {
        resetPlayground()
        setDiscoveredKeys([])
        setTokenVerified(false)
        setTrustedIssuers({
          'https://university-a.edu': true,
          'https://hospital-b.org': false
        })
        clearFrames()
      }}
      sidebarContent={<TraceTerminal logs={logs} title="Federation Gateway Log" />}
      packetCapture={packetCaptureProps}
    >
      <div className="flex flex-col h-full bg-bg-base overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="flex border-b border-border-subtle bg-bg-sidebar overflow-x-auto">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'topology' ? 'border-accent-primary text-accent-primary bg-bg-nested' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Globe className="w-4 h-4" /> Multi-Tenant Federation Topology
          </button>
          <button
            onClick={() => setActiveTab('discovery')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'discovery' ? 'border-accent-primary text-accent-primary bg-bg-nested' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileKey2 className="w-4 h-4" /> JWKS Discovery & Trust Registry
          </button>
        </div>

        {/* Workspace Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-bg-base/50">
          {activeTab === 'topology' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                {['https://university-a.edu', 'https://hospital-b.org'].map(issuer => (
                  <div key={issuer} className="p-4 rounded-xl border border-border-subtle bg-bg-card shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Server className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{issuer.replace('https://', '')}</h4>
                        <span className="text-[10px] text-text-muted font-mono">Independent OIDC Issuer</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50">
                      <button
                        onClick={() => handleDiscover(issuer)}
                        className="px-3 py-1.5 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-nested text-text-secondary text-xs font-bold transition flex-1"
                      >
                        Run Discovery
                      </button>
                      <button
                        onClick={() => handleVerifyToken(issuer)}
                        className="px-3 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20 text-xs font-bold transition flex-1"
                      >
                        Verify Token
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Central Trust Gateway */}
              <div className="relative p-6 rounded-2xl border-2 border-dashed border-border-subtle bg-bg-sidebar text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bg-sidebar px-3 text-xs font-bold text-text-secondary tracking-wider uppercase">
                  Central Federation Hub
                </div>
                
                <div className="flex justify-center mb-4">
                  <Network className="w-12 h-12 text-accent-primary opacity-80" />
                </div>
                
                {tokenVerified ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" /> ACCESS GRANTED VIA TRUST CHAIN
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border-subtle text-text-secondary text-xs font-bold">
                    <Terminal className="w-4 h-4" /> Waiting for cross-tenant token...
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-4 sm:p-6 rounded-xl border border-border-subtle bg-bg-card shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-2">
                  <Database className="w-4 h-4 text-accent-primary" /> Active Trust Registry
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(trustedIssuers).map(([issuer, isTrusted]) => (
                    <div key={issuer} className="flex items-center justify-between p-3 rounded-lg bg-bg-sidebar border border-border-subtle">
                      <span className="text-xs font-mono text-text-secondary">{issuer}</span>
                      <button
                        onClick={() => handleToggleTrust(issuer)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition ${
                          isTrusted ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                        }`}
                      >
                        {isTrusted ? 'Trusted' : 'Untrusted'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-xl border border-border-subtle bg-bg-card shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-2">
                  <FileKey2 className="w-4 h-4 text-purple-400" /> Cached JWKS Public Keys
                </h3>
                
                {discoveredKeys.length === 0 ? (
                  <div className="text-xs text-text-muted italic">No keys discovered yet. Run OIDC Discovery.</div>
                ) : (
                  <div className="grid gap-2">
                    {discoveredKeys.map((key, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                        {key}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PlaygroundShell>
  )
}
