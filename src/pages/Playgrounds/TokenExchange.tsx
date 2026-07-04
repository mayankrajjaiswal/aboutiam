import { useState } from 'react'
import { Shield, Play, RotateCcw, Sliders, Lock, Laptop, Key, Cpu, AlertTriangle } from 'lucide-react'

export default function TokenExchange() {
  const [subjectToken, setSubjectToken] = useState('alice_id_token_from_idp_active')
  const [actorToken, setActorToken] = useState('gateway_service_client_credential_key')
  const [exchangeType, setExchangeType] = useState<'impersonation' | 'delegation'>('delegation')
  const [targetAudience, setTargetAudience] = useState('https://payment-api.corp.local')

  const [evaluating, setEvaluating] = useState(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])
  const [exchangedToken, setExchangedToken] = useState<string>('')

  // Compute exchanged token mock
  const generateExchangedToken = () => {
    const headerObj = { alg: "RS256", typ: "JWT" }
    const payloadObj = {
      sub: "alice@company.com",
      aud: targetAudience,
      iss: "https://sts.company.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
      act: exchangeType === 'delegation' ? { sub: "gateway-service" } : undefined,
      scp: exchangeType === 'delegation' ? ["payment:read"] : ["payment:read", "payment:write"]
    }
    return `${btoa(JSON.stringify(headerObj)).replace(/=/g, '')}.${btoa(JSON.stringify(payloadObj)).replace(/=/g, '')}.signature_sts_value`
  }

  const handleSimulate = () => {
    setEvaluating(true)
    setActiveStep(1)
    setExchangedToken('')
    setLogs([
      `[CLIENT] Initiating down-scoped call to API Gateway...`,
      `[CLIENT] Presenting Subject Token: '${subjectToken.substring(0, 16)}...'`
    ])

    // Step 1: Token Reception (1000ms)
    setTimeout(() => {
      setActiveStep(2)
      setLogs(prev => [
        ...prev,
        `[GATEWAY] Subject token signature and expiration verified locally.`,
        `[GATEWAY] Target downstream audience requires specialized access token.`,
        `[GATEWAY] Initiating RFC 8693 Token Exchange call to STS (Secure Token Service)...`
      ])

      // Step 2: STS Exchange Handshake (1000ms)
      setTimeout(() => {
        setActiveStep(3)
        
        setLogs(prev => [
          ...prev,
          `[STS] Requesting grant_type: token-exchange...`,
          `[STS] Validating delegation credentials for Actor (gateway-service)... Verified. ✔`,
          `[STS] Token exchange logic matches authorization rules. Issuing scoped token...`
        ])

        // Step 3: Token returned (1000ms)
        setTimeout(() => {
          setActiveStep(4)
          const generatedJwt = generateExchangedToken()
          setExchangedToken(generatedJwt)
          setLogs(prev => [
            ...prev,
            `[STS] Issuing Access Token formatted as signed JWT:`,
            `  - Subject: alice@company.com`,
            exchangeType === 'delegation' ? `  - Actor: gateway-service (Delegated mode)` : `  - Impersonator: gateway-service (Impersonation mode)`,
            `  - Scopes: ${exchangeType === 'delegation' ? 'payment:read' : 'payment:read, payment:write'}`,
            `[GATEWAY] Presents exchanged token to Target downstream App...`,
            `✔ SUCCESS: RFC 8693 Token Exchange complete! Access granted downstream. 🎉`
          ])
          setEvaluating(false)
        }, 1200)

      }, 1200)
    }, 1200)
  }

  const handleReset = () => {
    setSubjectToken('alice_id_token_from_idp_active')
    setActorToken('gateway_service_client_credential_key')
    setExchangeType('delegation')
    setTargetAudience('https://payment-api.corp.local')
    setActiveStep(0)
    setLogs([])
    setExchangedToken('')
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Key className="w-3.5 h-3.5" /> Token Exchange Lab
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          RFC 8693 Token Exchange Simulator
        </h2>
        <p className="text-text-secondary">
          Model secure token transitions (Impersonation and Delegation) across microservice environments. Exchange external user Identity tokens for scoped, downstream access tokens natively in your browser using standard Security Token Service (STS) logic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input parameters (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Exchange Parameters
            </h4>

            {/* Subject Token */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="subj-token-input">Subject Token (User ID/JWT)</label>
              <input
                id="subj-token-input"
                type="text"
                value={subjectToken}
                onChange={(e) => setSubjectToken(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
              />
            </div>

            {/* Exchange Type Selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Exchange Mode</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setExchangeType('delegation')}
                  className={`py-2 rounded-lg border transition-all ${
                    exchangeType === 'delegation' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                  title="App acts on behalf of the user, keeping an audit trail of the calling service (act claim)."
                >
                  Delegation
                </button>
                <button
                  onClick={() => setExchangeType('impersonation')}
                  className={`py-2 rounded-lg border transition-all ${
                    exchangeType === 'impersonation' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                  title="App fully assumes the user identity, hiding the calling services identity."
                >
                  Impersonation
                </button>
              </div>
            </div>

            {/* Actor Token */}
            {exchangeType === 'delegation' && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="actor-token-input">Actor Token (Service Client Key)</label>
                <input
                  id="actor-token-input"
                  type="text"
                  value={actorToken}
                  onChange={(e) => setActorToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
            )}

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="aud-input">Requested Token Audience</label>
              <input
                id="aud-input"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* MIDDLE COLUMN: Interactive Architecture Pipeline (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Exchange Architecture Handshake</h3>
            <div className="flex gap-2">
              <button
                disabled={evaluating}
                onClick={handleSimulate}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5" /> Start Exchange
              </button>
              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary rounded-lg transition-all"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Flow Diagram Timeline Nodes */}
          <div className="relative pl-6 border-l-2 border-border-subtle/80 space-y-5">
            {/* Step 1: Client App */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 1 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 1 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 1 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Laptop className="w-4 h-4 text-accent-primary" /> 1. Client Presents Subject Token
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Workstation initiates call to frontend API Gateway.</p>
            </div>

            {/* Step 2: API Gateway Inbound */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 2 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 2 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 2 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" /> 2. API Gateway STS Redirection
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Gateway intercepts token, determines downstream requirement, and calls STS.</p>
            </div>

            {/* Step 3: STS Server */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 3 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 3 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 3 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" /> 3. STS Token Validation & Exchange
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">STS processes subject/actor parameters and generates down-scoped target tokens.</p>
            </div>

            {/* Step 4: Downstream App */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 4 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 4 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 4 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" /> 4. Scoped Session Authorized
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Presents exchanged token to target microservice. Session established.</p>
            </div>
          </div>

          {/* AUDIT LOGGER TERMINAL */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>Token Exchange Handshake Terminal</span>
              <span>STATE: {evaluating ? 'HANDSHAKING' : 'IDLE'}</span>
            </div>
            <div className="h-28 overflow-y-auto text-emerald-400 space-y-1">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting token presentation to start RFC 8693 simulation...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.startsWith('✔') || log.includes('SUCCESS') ? 'text-emerald-500 font-bold' :
                    log.startsWith('[STS]') ? 'text-amber-500' :
                    log.startsWith('[GATEWAY]') ? 'text-purple-400' : ''
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Exchanged Token JWT Display (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between h-[360px]">
            <div className="border-b border-border-subtle pb-2.5 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-text-primary uppercase">Exchanged downstream Token</span>
              <span className="text-[9px] text-text-muted font-bold font-mono">RFC 8693 Output</span>
            </div>

            <textarea
              aria-label="Exchanged Token JWT Output"
              readOnly
              value={exchangedToken}
              placeholder="Exchanged token will display here..."
              className="flex-grow w-full font-mono text-[9px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none resize-none h-full text-text-secondary"
            />
          </div>

          {/* RFC Takeaway */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-accent-secondary" /> RFC 8693 Specification
            </h4>
            <p>
              In multi-tier service architectures, forwarding user credentials directly to backend services violates least-privilege principles. **OAuth 2.0 Token Exchange (RFC 8693)** defines a standard security broker flow where proxies present user tokens and obtain scoped, audience-specific access tokens.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
