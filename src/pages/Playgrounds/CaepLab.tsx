import { useState } from 'react'
import { Activity, RotateCcw, ShieldAlert, ShieldCheck, ShieldQuestion, Radio, Server } from 'lucide-react'

type ReceiverState = 'active' | 'revoked' | 'reauth-required' | 'reduced-trust'

interface Receiver {
  id: string
  name: string
  state: ReceiverState
}

interface SignalType {
  id: string
  label: string
  eventType: string
  newState: ReceiverState
  severity: 'high' | 'medium'
  desc: string
}

const SIGNAL_TYPES: SignalType[] = [
  {
    id: 'session-revoked',
    label: 'Session Revoked',
    eventType: 'https://schemas.openid.net/secevent/caep/event-type/session-revoked',
    newState: 'revoked',
    severity: 'high',
    desc: 'IdP terminated the session (e.g. admin action or logout-everywhere).'
  },
  {
    id: 'credential-change',
    label: 'Credential Change',
    eventType: 'https://schemas.openid.net/secevent/risc/event-type/credential-change',
    newState: 'reauth-required',
    severity: 'medium',
    desc: 'Password or authenticator was changed — downstream sessions must re-prove identity.'
  },
  {
    id: 'device-compliance-change',
    label: 'Device Compliance Change',
    eventType: 'https://schemas.openid.net/secevent/caep/event-type/device-compliance-change',
    newState: 'revoked',
    severity: 'high',
    desc: 'MDM flagged the device as jailbroken or non-compliant — trust in this endpoint is gone.'
  },
  {
    id: 'token-claims-change',
    label: 'Token Claims Change',
    eventType: 'https://schemas.openid.net/secevent/caep/event-type/token-claims-change',
    newState: 'reduced-trust',
    severity: 'medium',
    desc: "The subject's group memberships or risk score changed — claims must be re-evaluated."
  }
]

const INITIAL_RECEIVERS: Receiver[] = [
  { id: 'payments-api', name: 'Payments API', state: 'active' },
  { id: 'internal-wiki', name: 'Internal Wiki', state: 'active' },
  { id: 'partner-portal', name: 'Partner SaaS Portal', state: 'active' }
]

const STATE_STYLES: Record<ReceiverState, { badge: string; label: string; icon: typeof ShieldCheck }> = {
  active: { badge: 'bg-status-success/10 border-status-success/30 text-status-success', label: 'Active Session', icon: ShieldCheck },
  revoked: { badge: 'bg-status-danger/10 border-status-danger/30 text-status-danger', label: 'Revoked', icon: ShieldAlert },
  'reauth-required': { badge: 'bg-amber-500/10 border-amber-500/30 text-amber-500', label: 'Re-Auth Required', icon: ShieldQuestion },
  'reduced-trust': { badge: 'bg-amber-500/10 border-amber-500/30 text-amber-500', label: 'Reduced Trust', icon: ShieldQuestion }
}

export default function CaepLab() {
  const [receivers, setReceivers] = useState<Receiver[]>(INITIAL_RECEIVERS)
  const [subscribed, setSubscribed] = useState(true)
  const [logs, setLogs] = useState<string[]>([
    '[SSF] Shared Signals Framework transmitter online. Awaiting signal injection...'
  ])

  const addLog = (msg: string) => setLogs(prev => [...prev, msg])

  const fireSignal = (signal: SignalType) => {
    // Only ever invoked from the signal-injector button's onClick, never during render.
    // eslint-disable-next-line react-hooks/purity
    const subId = `urn:example:session:${Math.random().toString(36).slice(2, 8)}`
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Math.floor(Date.now() / 1000)

    addLog(`[TRANSMITTER] Building signed SET (RFC 8417): { events: { "${signal.eventType}": {} }, sub_id: "${subId}", iat: ${timestamp} }`)

    if (!subscribed) {
      addLog(`⚠ Receivers are NOT subscribed to the signal stream. SET was generated but never delivered — stale access persists on every receiver!`)
      return
    }

    addLog(`[TRANSMITTER] Pushing signed SET to ${receivers.length} subscribed receiver(s)...`)
    setReceivers(prev => prev.map(r => ({ ...r, state: signal.newState })))
    addLog(`✔ All receivers consumed the SET and transitioned to "${STATE_STYLES[signal.newState].label}".`)
  }

  const toggleSubscription = () => {
    setSubscribed(prev => {
      const next = !prev
      addLog(`[SSF] Receiver subscription to the transmitter's signal stream ${next ? 'ENABLED' : 'DISABLED'}.`)
      return next
    })
  }

  const handleReset = () => {
    setReceivers(INITIAL_RECEIVERS)
    setSubscribed(true)
    setLogs(['[SSF] Shared Signals Framework transmitter online. Awaiting signal injection...'])
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Activity className="w-3.5 h-3.5" /> Continuous Access Evaluation Lab
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          CAEP & Shared Signals Framework (SSF) Lab
        </h2>
        <p className="text-text-secondary">
          Model the OpenID Shared Signals Framework's continuous access evaluation profile (CAEP): an IdP transmitter pushes signed Security Event Tokens (SETs, RFC 8417) to subscribed relying-party receivers, who react to session, credential, device, and claims changes in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Signal Injectors + Mitigation Toggle (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-accent-primary animate-pulse" /> Signal Injector Panel
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Fire a CAEP/RISC event from the transmitter. Each is pushed as a signed SET to every subscribed receiver:
            </p>

            <div className="space-y-2">
              {SIGNAL_TYPES.map(signal => (
                <button
                  type="button"
                  key={signal.id}
                  onClick={() => fireSignal(signal)}
                  className="w-full text-left py-2.5 px-3 rounded-lg border border-border-subtle hover:border-accent-primary bg-bg-nested hover:bg-bg-sidebar transition-all"
                  title={signal.eventType}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-primary font-bold">{signal.label}</span>
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${signal.severity === 'high' ? 'bg-status-danger/10 text-status-danger' : 'bg-amber-500/10 text-amber-500'}`}>
                      {signal.severity === 'high' ? 'High Severity' : 'Medium Severity'}
                    </span>
                  </div>
                  <span className="text-[9px] text-text-muted block mt-1 leading-normal">{signal.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mitigation toggle */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-accent-primary" /> Signal Stream Subscription
            </h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Receivers Subscribed to SSF Stream</span>
                <span className="text-[8px] text-text-muted block">Disable to see stale access persist after revocation</span>
              </div>
              <button
                type="button"
                onClick={toggleSubscription}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${subscribed ? 'bg-accent-primary' : 'bg-border-subtle'}`}
                aria-label="Toggle signal stream subscription"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${subscribed ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Transmitter + Receiver Cards (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Transmitter & Receiver Topology</h3>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-bg-card hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Transmitter card */}
          <div className="p-4 rounded-2xl bg-accent-glow border border-accent-primary/30 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/15 text-accent-primary flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-text-primary block">Identity Provider (SSF Transmitter)</span>
              <span className="text-[10px] text-text-secondary">
                Broadcasting to {subscribed ? receivers.length : 0} of {receivers.length} receiver(s)
              </span>
            </div>
          </div>

          {/* Vertical connector */}
          <div className="flex justify-center">
            <div className="h-6 border-l-2 border-dashed border-border-subtle"></div>
          </div>

          {/* Receiver cards */}
          <div className="space-y-3">
            {receivers.map(receiver => {
              const style = STATE_STYLES[receiver.state]
              const Icon = style.icon
              return (
                <div key={receiver.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${style.badge}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-text-primary block">{receiver.name}</span>
                      <span className="text-[9px] text-text-muted">Relying Party Receiver</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full">{style.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Terminal + Concept Takeaway (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2.5 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>SSF Signal Trace Console</span>
              <span>STATE: ACTIVE</span>
            </div>
            <div className="h-64 overflow-y-auto text-emerald-400 space-y-1.5 pr-1 select-text">
              {logs.map((log, idx) => (
                <div key={idx} className={
                  log.startsWith('⚠') ? 'text-red-500 font-bold' :
                  log.startsWith('✔') ? 'text-emerald-500 font-bold' :
                  log.startsWith('[TRANSMITTER]') ? 'text-purple-400' :
                  log.startsWith('[SSF]') ? 'text-blue-400' : ''
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5 font-sans">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-accent-secondary" /> CAEP Definition
            </h4>
            <p>
              <strong className="text-text-primary">CAEP</strong> is a profile of the OpenID <strong className="text-text-primary">Shared Signals Framework (SSF)</strong> letting an IdP continuously push identity-risk signals to relying parties, instead of relying parties polling or waiting for the next token refresh. A revoked session becomes worthless within seconds of the signal, not minutes.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
