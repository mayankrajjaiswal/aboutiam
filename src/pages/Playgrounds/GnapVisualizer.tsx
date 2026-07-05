import { useState } from 'react'
import { Radio, Play, RotateCcw, Sliders, Send, UserCheck, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react'

export default function GnapVisualizer() {
  const [requestedScope, setRequestedScope] = useState('payments:read payments:write')
  const [interactionMode, setInteractionMode] = useState<'redirect' | 'user_code'>('redirect')

  const [evaluating, setEvaluating] = useState(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])
  const [issuedToken, setIssuedToken] = useState<string>('')

  const generateKeyBoundToken = () => {
    const headerObj = { alg: 'RS256', typ: 'gnap+jwt' }
    const payloadObj = {
      access: requestedScope.split(' ').filter(Boolean),
      iss: 'https://as.example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      cnf: { jkt: 'NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs' }
    }
    return `${btoa(JSON.stringify(headerObj)).replace(/=/g, '')}.${btoa(JSON.stringify(payloadObj)).replace(/=/g, '')}.signature_as_value`
  }

  const handleSimulate = () => {
    setEvaluating(true)
    setActiveStep(1)
    setIssuedToken('')
    setLogs([
      `[CLIENT] Generating a fresh client instance key pair (no pre-registered client_id)...`,
      `[CLIENT] POST /gsa/... Grant Request { access: [${requestedScope.split(' ').filter(Boolean).map(s => `"${s}"`).join(', ')}], key: <client proof> }`
    ])

    setTimeout(() => {
      setActiveStep(2)
      setLogs(prev => [
        ...prev,
        `[AS] Client instance key proof verified. Grant request requires end-user interaction.`,
        interactionMode === 'redirect'
          ? `[AS] Responding with interact.redirect URL and a continuation access token + URI...`
          : `[AS] Responding with interact.user_code short code and a continuation access token + URI...`
      ])

      setTimeout(() => {
        setActiveStep(3)
        setLogs(prev => [
          ...prev,
          interactionMode === 'redirect'
            ? `[USER] Browser redirected to AS interaction endpoint. User reviews and authorizes the requested access...`
            : `[USER] User navigates to the AS interaction endpoint and enters the short user_code to authorize the request...`,
          `[AS] End-user authorization recorded.`
        ])

        setTimeout(() => {
          setActiveStep(4)
          setLogs(prev => [
            ...prev,
            `[CLIENT] Calling the continuation endpoint with the continuation access token (polling or redirect-return)...`,
            `[AS] Continuation request bound to the original client instance key. Verified.`
          ])

          setTimeout(() => {
            setActiveStep(5)
            const token = generateKeyBoundToken()
            setIssuedToken(token)
            setLogs(prev => [
              ...prev,
              `[AS] Issuing final access token, key-bound to the client instance key (proof-of-possession via "cnf.jkt")...`,
              `✔ SUCCESS: GNAP grant negotiation complete! Client must now prove possession of its key on every API call. 🎉`
            ])
            setEvaluating(false)
          }, 1100)
        }, 1100)
      }, 1100)
    }, 1100)
  }

  const handleReset = () => {
    setRequestedScope('payments:read payments:write')
    setInteractionMode('redirect')
    setActiveStep(0)
    setLogs([])
    setIssuedToken('')
  }

  const steps = [
    { icon: Send, color: 'text-accent-primary', title: '1. Client Sends Grant Request', desc: 'Includes a client instance key proof — no pre-registered client_id required.' },
    { icon: RefreshCw, color: 'text-purple-500', title: '2. AS Responds with Interaction + Continuation', desc: 'Returns an interaction URL/user-code plus a continuation access token and URI.' },
    { icon: UserCheck, color: 'text-amber-500', title: '3. End-User Authorizes', desc: 'The resource owner reviews and approves the request at the AS interaction endpoint.' },
    { icon: RefreshCw, color: 'text-blue-500', title: '4. Client Calls Continuation Endpoint', desc: 'Polls or returns via redirect, presenting the continuation token to resume the grant.' },
    { icon: KeyRound, color: 'text-emerald-500', title: '5. AS Issues Final Access Token', desc: 'Typically key-bound (proof-of-possession) — GNAP allows bearer tokens too, but PoP is the common case.' }
  ]

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Radio className="w-3.5 h-3.5" /> Grant Negotiation Lab
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          GNAP (RFC 9635) Grant Negotiation Visualizer
        </h2>
        <p className="text-text-secondary">
          Step through the Grant Negotiation and Authorization Protocol's dynamic client instance flow: a grant request, an interaction hand-off to the end-user, a continuation call, and a typically key-bound final access token.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Grant Request Parameters (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Grant Request Parameters
            </h4>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="scope-input">Requested Access (space-separated)</label>
              <input
                id="scope-input"
                type="text"
                value={requestedScope}
                onChange={(e) => setRequestedScope(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Interaction Start Mode</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInteractionMode('redirect')}
                  className={`py-2 rounded-lg border transition-all ${
                    interactionMode === 'redirect' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                  title="Redirect the user's browser to the AS interaction endpoint."
                >
                  interact.redirect
                </button>
                <button
                  type="button"
                  onClick={() => setInteractionMode('user_code')}
                  className={`py-2 rounded-lg border transition-all ${
                    interactionMode === 'user_code' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                  title="Show the user a short code to enter on a separate device."
                >
                  interact.user_code
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-accent-secondary" /> GNAP vs OAuth 2.0
            </h4>
            <p>
              GNAP is <strong className="text-text-primary">not</strong> defined by "no client registration" — OAuth 2.0 already supports Dynamic Client Registration (RFC 7591). The real distinguishing features are the explicit <strong className="text-text-primary">continuation/polling mechanic</strong> that lets a grant be resumed after interaction, and the fact that GNAP access tokens are <strong className="text-text-primary">typically key-bound</strong> (proof-of-possession) rather than plain bearer tokens — though GNAP permits both.
            </p>
          </div>
        </div>

        {/* MIDDLE COLUMN: Timeline (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Grant Negotiation Timeline</h3>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={evaluating}
                onClick={handleSimulate}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5" /> Start Negotiation
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary rounded-lg transition-all"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-border-subtle/80 space-y-5">
            {steps.map((step, idx) => {
              const stepNum = idx + 1
              const Icon = step.icon
              return (
                <div key={stepNum} className={`relative transition-all p-3.5 rounded-xl border ${
                  activeStep === stepNum ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
                }`}>
                  <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    activeStep >= stepNum ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
                  }`}>
                    {activeStep >= stepNum ? '✔' : ''}
                  </div>
                  <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${step.color}`} /> {step.title}
                  </h5>
                  <p className="text-[10px] text-text-secondary mt-1">{step.desc}</p>
                </div>
              )
            })}
          </div>

          {/* NARRATION TERMINAL */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>GNAP Grant Negotiation Terminal</span>
              <span>STATE: {evaluating ? 'NEGOTIATING' : 'IDLE'}</span>
            </div>
            <div className="h-32 overflow-y-auto text-emerald-400 space-y-1">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting grant request to start RFC 9635 negotiation...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.startsWith('✔') ? 'text-emerald-500 font-bold' :
                    log.startsWith('[AS]') ? 'text-amber-500' :
                    log.startsWith('[USER]') ? 'text-blue-400' :
                    log.startsWith('[CLIENT]') ? 'text-purple-400' : ''
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Issued Token (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between h-[300px]">
            <div className="border-b border-border-subtle pb-2.5 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-text-primary uppercase">Key-Bound Access Token</span>
              <span className="text-[9px] text-text-muted font-bold font-mono">RFC 9635 Output</span>
            </div>

            <textarea
              aria-label="Issued Key-Bound Token Output"
              readOnly
              value={issuedToken}
              placeholder="Issued token will display here..."
              className="flex-grow w-full font-mono text-[9px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none resize-none h-full text-text-secondary"
            />
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-accent-secondary" /> Why Key-Binding Matters
            </h4>
            <p>
              The <code className="text-[10px] bg-bg-nested px-1 rounded">cnf.jkt</code> claim binds this token to the client's public key thumbprint. A stolen token is useless without the matching private key to sign each request — unlike a plain bearer token, which works for anyone who holds it.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
