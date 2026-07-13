import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Network,
  ArrowRight,
  Play,
  Terminal,
  Layers,
  Building,
  ArrowRightLeft,
} from 'lucide-react'

type IdPType = 'okta' | 'azure_ad' | 'ping'
type SPType = 'aws' | 'salesforce' | 'saas_app'

interface FederationRule {
  sourceAttr: string
  targetHeader: string
}

export default function IdentityBrokerSandbox() {
  const [activeIdp, setActiveIdp] = useState<IdPType>('okta')
  const [activeSp, setActiveSp] = useState<SPType>('saas_app')
  
  // Interactive Handshake State
  const [brokerStep, setBrokerStep] = useState<number>(-1)
  const [logs, setLogs] = useState<string[]>([])
  const [handshakeActive, setHandshakeActive] = useState(false)
  
  // Custom Mapping Rules
  const [rules, setRules] = useState<FederationRule[]>([
    { sourceAttr: 'email', targetHeader: 'X-User-Email' },
    { sourceAttr: 'groups', targetHeader: 'X-User-Roles' },
    { sourceAttr: 'department', targetHeader: 'X-User-Department' }
  ])

  // Running Simulated Federated Handshake
  const runHandshake = () => {
    if (handshakeActive) return
    setHandshakeActive(true)
    setBrokerStep(0)
    setLogs([
      `[Client] Initiating connection to Service Provider: ${activeSp.toUpperCase()}...`,
      `[${activeSp.toUpperCase()}] Access Denied: Unauthenticated. Redirecting client to Identity Broker...`
    ])
  }

  // Handle step-by-step animations
  useEffect(() => {
    if (!handshakeActive || brokerStep < 0) return

    let timer: ReturnType<typeof setTimeout>

    if (brokerStep === 0) {
      // Broker intercepting
      timer = setTimeout(() => {
        setLogs(prev => [
          ...prev,
          `[Identity Broker] Intercepted authentication request.`,
          `[Identity Broker] Checking federation routing rules for partner domain...`,
          `[Identity Broker] Redirecting client front-channel connection to Identity Provider: ${activeIdp.toUpperCase()}...`
        ])
        setBrokerStep(1)
      }, 1500)
    } else if (brokerStep === 1) {
      // IdP authenticating
      timer = setTimeout(() => {
        setLogs(prev => [
          ...prev,
          `[${activeIdp.toUpperCase()}] User identity authenticated successfully (MFA verified).`,
          `[${activeIdp.toUpperCase()}] Generating signed SAML Assertion carrying source attributes...`,
          `[${activeIdp.toUpperCase()}] Dispatching SAMLResponse back to Identity Broker Assertion Consumer Service (ACS) endpoint...`
        ])
        setBrokerStep(2)
      }, 2000)
    } else if (brokerStep === 2) {
      // Broker token translation
      timer = setTimeout(() => {
        const parsedRules = rules.map(r => `  ├─ Map: ${r.sourceAttr} ──► ${r.targetHeader}`).join('\n')
        setLogs(prev => [
          ...prev,
          `[Identity Broker] SAML Assertion signature validated successfully.`,
          `[Identity Broker] Translating incoming claims (SAML Assertions ──► OIDC ID Token)...`,
          parsedRules,
          `[Identity Broker] Exchanging SAML assertion for scoped OIDC ID Token (RFC 8693 Token Exchange)...`,
          `[Identity Broker] Issuing signed OIDC JWT ID Token to Service Provider: ${activeSp.toUpperCase()}...`
        ])
        setBrokerStep(3)
      }, 2500)
    } else if (brokerStep === 3) {
      // SP verified
      timer = setTimeout(() => {
        setLogs(prev => [
          ...prev,
          `[${activeSp.toUpperCase()}] OIDC ID Token signature verified using Broker JWKS endpoint.`,
          `[${activeSp.toUpperCase()}] Enforcing injected headers: ${rules.map(r => r.targetHeader).join(', ')}.`,
          `[${activeSp.toUpperCase()}] 🟢 ACCESS GRANTED. Tenant-isolated workspace provisioned.`,
          `[Federation] Handshake lifecycle completed successfully.`
        ])
        setBrokerStep(4)
        setHandshakeActive(false)
      }, 2000)
    }

    return () => clearTimeout(timer)
  }, [handshakeActive, brokerStep, activeIdp, activeSp, rules])

  const handleReset = () => {
    setBrokerStep(-1)
    setLogs([])
    setHandshakeActive(false)
  }

  const updateRuleTarget = (index: number, val: string) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, targetHeader: val } : r))
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Broker & Federation Sandbox</h1>
            <p className="text-xs text-text-secondary">Explore multi-tenant single sign-on (SSO), federation routing, and real-time SAML-to-OIDC token translation topologies</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Handshake configuration selectors */}
        <div className="lg:col-span-4 space-y-6">
          {/* Topologies Config */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Federation Topology Config
            </span>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase">1. Partner Identity Provider (IdP)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['okta', 'azure_ad', 'ping'] as IdPType[]).map(idp => (
                    <button
                      key={idp}
                      disabled={handshakeActive}
                      onClick={() => setActiveIdp(idp)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition text-center ${activeIdp === idp ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-sidebar/30 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                    >
                      {idp === 'azure_ad' ? 'Entra ID' : idp === 'ping' ? 'PingFederate' : 'Okta'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase">2. Target Service Provider (SP)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['aws', 'salesforce', 'saas_app'] as SPType[]).map(sp => (
                    <button
                      key={sp}
                      disabled={handshakeActive}
                      onClick={() => setActiveSp(sp)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition text-center ${activeSp === sp ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-sidebar/30 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                    >
                      {sp === 'saas_app' ? 'SaaS Portal' : sp.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={handshakeActive}
                onClick={runHandshake}
                className="w-full mt-2 py-2.5 bg-accent-primary hover:bg-accent-hover text-white disabled:opacity-40 font-black rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Execute Federated Handshake
              </button>
            </div>
          </div>

          {/* Mapping rules config */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm h-[280px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent-secondary" /> Token Attribute Translation Rules
              </span>

              <div className="space-y-2.5 mt-3">
                {rules.map((r, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-xs justify-between bg-bg-sidebar p-2 rounded-lg border border-border-subtle/50 font-mono">
                    <span className="font-bold text-accent-secondary">{r.sourceAttr}</span>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      disabled={handshakeActive}
                      value={r.targetHeader}
                      onChange={(e) => updateRuleTarget(idx, e.target.value)}
                      className="p-1 rounded bg-bg-card border border-border-subtle text-text-primary text-[10px] font-bold focus:outline-none w-28 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Interactive Vector handshakes canvas & Console Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dynamic Vector canvas */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg min-h-[220px] flex flex-col justify-around relative overflow-hidden">
            <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle pb-1.5">
              Live Federation Handshake Flow Paths
            </span>

            {/* Visual Broker Nodes */}
            <div className="grid grid-cols-3 gap-6 items-center justify-around py-8 text-center font-bold text-xs relative z-10">
              
              {/* Node 1: IdP */}
              <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                brokerStep === 1 
                  ? 'bg-status-danger/10 border-status-danger text-status-danger scale-105 shadow-md' 
                  : 'bg-bg-sidebar border-border-subtle text-text-secondary'
              }`}>
                <span className="text-xl">🏢</span>
                <p className="uppercase tracking-wide text-[10px]">Identity Provider</p>
                <p className="text-xs font-black text-text-primary">{activeIdp === 'azure_ad' ? 'Entra ID' : activeIdp === 'ping' ? 'PingFederate' : 'Okta'}</p>
              </div>

              {/* Node 2: Intermediating Broker */}
              <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                brokerStep === 0 || brokerStep === 2
                  ? 'bg-accent-glow border-accent-primary text-accent-primary scale-105 shadow-md shadow-accent-primary/5' 
                  : 'bg-bg-sidebar border-border-subtle text-text-secondary'
              }`}>
                <span className="text-xl">🔄</span>
                <p className="uppercase tracking-wide text-[10px]">Identity Broker</p>
                <p className="text-xs font-black text-text-primary">AboutIAM Broker</p>
              </div>

              {/* Node 3: SP */}
              <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                brokerStep === 3 || brokerStep === 4
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 scale-105 shadow-md' 
                  : 'bg-bg-sidebar border-border-subtle text-text-secondary'
              }`}>
                <span className="text-xl">💳</span>
                <p className="uppercase tracking-wide text-[10px]">Service Provider</p>
                <p className="text-xs font-black text-text-primary">{activeSp === 'saas_app' ? 'SaaS Portal' : activeSp.toUpperCase()}</p>
              </div>

            </div>

            {/* Vector connectors overlay */}
            <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-20">
              <div className="w-1/3 h-0.5 border-t-2 border-dashed border-accent-primary" />
              <div className="w-1/3 h-0.5 border-t-2 border-dashed border-accent-primary" />
            </div>
          </div>

          {/* Active logs and trace Terminal */}
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[11px] space-y-3 shadow-inner">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-accent-secondary" /> OIDC/SAML Federation Broker Terminal</span>
              <div className="flex gap-2">
                <span>STATE: {handshakeActive ? 'BROKERING' : 'IDLE'}</span>
                {logs.length > 0 && (
                  <button onClick={handleReset} className="text-zinc-500 hover:text-zinc-300 transition">
                    [Clear]
                  </button>
                )}
              </div>
            </div>

            <div className="h-44 overflow-y-auto text-emerald-400 space-y-1 pr-1 leading-relaxed">
              {logs.length === 0 ? (
                <span className="text-zinc-600 italic select-none">Awaiting federated handshake execution…</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('ACCESS GRANTED') || log.includes('verified successfully') ? 'text-emerald-500 font-black animate-pulse' :
                    log.startsWith('  ├─') ? 'text-blue-400' : 
                    log.startsWith('[Identity Broker]') ? 'text-accent-primary font-bold' : ''
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
