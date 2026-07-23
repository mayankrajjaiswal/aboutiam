import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Vault, ArrowRight, RotateCcw, Terminal, Timer, ShieldCheck, Video, KeyRound } from 'lucide-react'

type CredState = 'vaulted' | 'requested' | 'checked-out' | 'rotated'

export default function PamVaultingLab() {
  const [state, setState] = useState<CredState>('vaulted')
  const [recording, setRecording] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [approved, setApproved] = useState(false)
  const [logs, setLogs] = useState<string[]>(['[PAM Vault] Root credential "svc-prod-db-admin" is checked in and rotated. No human knows the live password.'])

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg])

  useEffect(() => {
    if (state !== 'checked-out' || secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          setState('rotated')
          addLog('[PAM Vault] JIT window expired. Session auto-terminated and the vaulted password was rotated — the checked-out value is now worthless.')
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state, secondsLeft])

  const requestElevation = () => {
    setState('requested')
    addLog('[Engineer] Requested time-boxed JIT elevation to "svc-prod-db-admin" for an incident (Ticket INC-4471), justification: "Prod DB connection pool exhausted."')
  }

  const approveElevation = () => {
    setApproved(true)
    setState('checked-out')
    setSecondsLeft(15)
    addLog(`[Approver] Manager approved the request for a 15-minute (simulated as 15s) window. Session recording: ${recording ? 'ON' : 'OFF'}.`)
    addLog('[PAM Vault] Credential checked out from the vault. Engineer never sees the raw password — the vault proxies the session directly.')
  }

  const checkInEarly = () => {
    setState('rotated')
    addLog('[Engineer] Manually checked the session back in early.')
    addLog('[PAM Vault] Credential rotated immediately on check-in — the used value can never be replayed.')
  }

  const reset = () => {
    setState('vaulted')
    setApproved(false)
    setSecondsLeft(0)
    setRecording(true)
    setLogs(['[PAM Vault] Root credential "svc-prod-db-admin" is checked in and rotated. No human knows the live password.'])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Vault className="w-3.5 h-3.5" /> Advanced PAM Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">PAM Vaulting &amp; Just-in-Time Elevation Lab</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Request, approve, and time-box a privileged credential checkout — then watch the vault auto-rotate the secret the instant the session ends.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" /> svc-prod-db-admin
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary font-semibold">Vault state</span>
              <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                state === 'vaulted' ? 'bg-status-success/10 text-status-success' :
                state === 'requested' ? 'bg-amber-500/10 text-amber-500' :
                state === 'checked-out' ? 'bg-status-danger/10 text-status-danger' : 'bg-status-success/10 text-status-success'
              }`}>{state.replace('-', ' ')}</span>
            </div>

            {state === 'checked-out' && (
              <div className="flex items-center gap-2 text-xs font-bold text-status-danger">
                <Timer className="w-4 h-4" /> Session expires in {secondsLeft}s
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
              <span className="text-[10px] font-black text-text-primary uppercase flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Session Recording</span>
              <button
                onClick={() => setRecording((v) => !v)}
                disabled={state !== 'vaulted'}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 disabled:opacity-40 ${recording ? 'bg-accent-primary' : 'bg-border-subtle'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${recording ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {state === 'vaulted' && (
            <button onClick={requestElevation} className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-black rounded-lg text-xs transition">
              Request JIT Elevation (Incident INC-4471)
            </button>
          )}
          {state === 'requested' && !approved && (
            <button onClick={approveElevation} className="w-full py-2.5 bg-status-success hover:opacity-90 text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Approve as Manager (15s window)
            </button>
          )}
          {state === 'checked-out' && (
            <button onClick={checkInEarly} className="w-full py-2.5 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle text-text-primary font-black rounded-lg text-xs transition">
              Check In Session Early
            </button>
          )}

          <button onClick={reset} className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Vault
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Vault Audit Trail
            </span>
            <div className="h-72 overflow-y-auto text-emerald-400 space-y-1.5 mt-3 pr-1 leading-relaxed">
              {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Privileged Access Management</strong> replaces standing, shared admin passwords with brokered, time-boxed checkouts: the human never learns the raw secret, every session can be recorded, and the vault rotates the credential on every check-in — so a leaked session transcript is useless after the fact.
          </div>
        </div>
      </div>
    </div>
  )
}
