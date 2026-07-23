import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Server,
  ArrowRight,
  Terminal,
} from 'lucide-react'

type ReceiverState = 'active' | 'revoked'

interface SaaSClient {
  id: string
  name: string
  logo: string
  state: ReceiverState
}

export default function CaepLab() {
  const [clients, setClients] = useState<SaaSClient[]>([
    { id: 'slack', name: 'Slack Workplace', logo: '💬', state: 'active' },
    { id: 'salesforce', name: 'Salesforce CRM', logo: '☁️', state: 'active' },
    { id: 'aws', name: 'AWS Cloud Console', logo: '💻', state: 'active' }
  ])

  const [logs, setLogs] = useState<string[]>([
    '[Transmitter] Shared Signals Framework (SSF) transmitter initialized.',
    '[Transmitter] Awaiting session revocation trigger event...'
  ])
  const [activeSet, setActiveSet] = useState<Record<string, unknown> | null>(null)
  const [streamingActive, setStreamingActive] = useState(false)

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  // Trigger continuous CAEP session revocation
  const triggerRevocation = () => {
    if (streamingActive) return
    setStreamingActive(true)
    
    const sessionId = `urn:aboutiam:session:${Math.random().toString(36).substring(2, 9)}`
    const iat = Math.floor(Date.now() / 1000)

    // Build signed Security Event Token (SET - RFC 8417)
    const setPayload = {
      iss: "https://idp.aboutiam.com",
      iat: iat,
      jti: "event-id-99c81a2d",
      aud: "https://saas-federation.aboutiam.com/caep",
      events: {
        "https://schemas.openid.net/secevent/caep/event-type/session-revoked": {
          subject: {
            subject_type: "oauth_token",
            token_type: "refresh_token",
            token_identifier_uri: sessionId
          },
          initiator: "admin",
          reason_user: "Administrative session revocation forced"
        }
      }
    }
    setActiveSet(setPayload)

    addLog(`[Admin Console] Administrative logout-everywhere triggered.`)
    addLog(`[Transmitter] Signed SET compiled conforming to RFC 8417 (iat: ${iat}).`)
    addLog(`[Transmitter] Dispatching asynchronous signals to CAEP-compliant endpoints...`)

    // Simulate asynchronous event streams reaching each client
    clients.forEach((c, idx) => {
      setTimeout(() => {
        setClients(prev => prev.map(item => item.id === c.id ? { ...item, state: 'revoked' } : item))
        addLog(`[${c.name}] 🔒 Received CAEP event. Terminating active sessions and locking dashboard workspace.`)
        
        if (idx === clients.length - 1) {
          setStreamingActive(false)
          addLog('[Transmitter] Asynchronous SET broadcast streams finished successfully.')
        }
      }, (idx + 1) * 1200)
    })
  }

  const resetSimulator = () => {
    setClients([
      { id: 'slack', name: 'Slack Workplace', logo: '💬', state: 'active' },
      { id: 'salesforce', name: 'Salesforce CRM', logo: '☁️', state: 'active' },
      { id: 'aws', name: 'AWS Cloud Console', logo: '💻', state: 'active' }
    ])
    setLogs([
      '[Transmitter] Shared Signals Framework (SSF) transmitter initialized.',
      '[Transmitter] Awaiting session revocation trigger event...'
    ])
    setActiveSet(null)
    setStreamingActive(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Shared Signals Framework
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            CAEP Continuous Session Revocation Streamer
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Simulate real-time, asynchronous session revocation across independent SaaS applications using OpenID CAEP (Continuous Access Evaluation Profile) security event tokens.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Identity Provider Admin console (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Server className="w-4 h-4" /> Identity Provider Console
            </span>

            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Force an administrative revocation at the Central Identity Provider (IdP) to instantly broadcast session-terminated events to downstream clients.
            </p>

            <div className="space-y-3.5 text-xs">
              <button
                type="button"
                disabled={streamingActive || clients.every(c => c.state === 'revoked')}
                onClick={triggerRevocation}
                className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white disabled:opacity-40 font-black rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> Force Revoke All Sessions
              </button>
              <button
                type="button"
                onClick={resetSimulator}
                className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Federation Mesh
              </button>
            </div>
          </div>

          {/* SET json payload */}
          {activeSet && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-2 animate-fadeIn">
              <span className="text-xs font-black text-text-primary flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-secondary" /> Broadcast SET Claims (RFC 8417)</span>
              <pre className="text-[9px] font-mono text-text-secondary bg-bg-nested p-3 rounded border border-border-subtle/50 whitespace-pre-wrap max-h-48 overflow-auto">
                {JSON.stringify(activeSet, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SaaS clients & Logs (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SaaS Workspace Status Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {clients.map((c) => {
              const active = c.state === 'active'
              return (
                <div key={c.id} className={`p-5 bg-bg-card border rounded-xl shadow transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                  active ? 'border-border-subtle' : 'border-status-danger/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">{c.logo}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      active ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger animate-pulse'
                    }`}>{active ? 'Active' : 'Revoked'}</span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <span className="font-bold text-text-primary text-xs block">{c.name}</span>
                    {active ? (
                      <span className="text-[10px] text-text-muted leading-relaxed block font-semibold">User session authorized. Active workspace.</span>
                    ) : (
                      <span className="text-[10px] text-status-danger leading-relaxed block font-bold">🔒 Session Revoked via CAEP.</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Event log terminal */}
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Continuous Access Event Stream logs
            </span>

            <div className="h-40 overflow-y-auto text-emerald-400 space-y-1 mt-3 pr-1 leading-relaxed">
              {logs.map((log, idx) => (
                <div key={idx} className={
                  log.includes('🔒') || log.includes('Terminating') ? 'text-status-danger font-bold animate-pulse' :
                  log.includes('✔') || log.includes('initialized') ? 'text-status-success font-black' :
                  log.startsWith('  ├─') ? 'text-blue-400' : ''
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
