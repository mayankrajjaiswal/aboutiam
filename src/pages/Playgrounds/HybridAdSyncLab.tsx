import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cloud, ArrowRight, RotateCcw, Terminal, Server, Play } from 'lucide-react'

type Mode = 'phs' | 'pta' | 'federation'

const MODE_INFO: Record<Mode, { title: string; desc: string }> = {
  phs: { title: 'Password Hash Sync (PHS)', desc: 'A hash of the on-prem password hash is synced to the cloud. The cloud IdP validates logins itself — no on-prem dependency at sign-in time.' },
  pta: { title: 'Pass-Through Authentication (PTA)', desc: 'The cloud IdP forwards the credential to a lightweight on-prem agent, which validates it directly against Active Directory in real time.' },
  federation: { title: 'Federation (AD FS)', desc: 'The cloud IdP redirects the user to an on-prem AD FS server, which authenticates locally and returns a signed SAML/WS-Fed token — the cloud never sees the password at all.' },
}

export default function HybridAdSyncLab() {
  const [mode, setMode] = useState<Mode>('phs')
  const [onPremDown, setOnPremDown] = useState(false)
  const [logs, setLogs] = useState<string[]>(['[Hybrid Identity] Ready. Select a connectivity model and simulate a login.'])

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg])

  const simulateLogin = () => {
    addLog(`--- Simulating on-prem user login via ${MODE_INFO[mode].title} ---`)

    if (mode === 'phs') {
      addLog('[Cloud IdP] Received credentials. Validating against synced password hash directly in the cloud.')
      addLog('[Cloud IdP] Hash matched. Login SUCCESS — no dependency on on-prem infrastructure at sign-in time.')
      return
    }

    if (mode === 'pta') {
      addLog('[Cloud IdP] Forwarding credential validation request to on-prem PTA agent...')
      if (onPremDown) {
        addLog('[PTA Agent] ⚠ On-prem network unreachable — agent cannot validate. Login FAILED (unless a backup PHS/staging auth method is configured).')
      } else {
        addLog('[PTA Agent] Validated credential directly against on-prem Active Directory.')
        addLog('[Cloud IdP] Received validation success from agent. Login SUCCESS.')
      }
      return
    }

    if (mode === 'federation') {
      addLog('[Cloud IdP] Redirecting user to on-prem AD FS for authentication (no password ever reaches the cloud).')
      if (onPremDown) {
        addLog('[AD FS] ⚠ On-prem AD FS server unreachable — federation broken. Login FAILED for every federated user until AD FS is restored.')
      } else {
        addLog('[AD FS] Authenticated locally against Active Directory, issued a signed SAML assertion.')
        addLog('[Cloud IdP] Verified AD FS signature. Login SUCCESS.')
      }
    }
  }

  const reset = () => {
    setMode('phs')
    setOnPremDown(false)
    setLogs(['[Hybrid Identity] Ready. Select a connectivity model and simulate a login.'])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Cloud className="w-3.5 h-3.5" /> Advanced Hybrid Identity Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">Hybrid Identity Sync Lab</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Compare Password Hash Sync, Pass-Through Authentication, and Federation (AD FS) — three ways to connect on-prem Active Directory to a cloud IdP — and see how each handles an on-prem outage.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Connectivity Model</span>
            {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
              <label key={m} className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer ${mode === m ? 'border-accent-primary/60 bg-accent-glow/40' : 'border-border-subtle'}`}>
                <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">{MODE_INFO[m].title}</span>
                  <span className="text-[10px] text-text-muted">{MODE_INFO[m].desc}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-text-primary uppercase flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> On-Prem Network Outage</span>
              <span className="text-[8px] text-text-muted block">Simulate the on-prem site losing internet connectivity</span>
            </div>
            <button onClick={() => setOnPremDown((v) => !v)} className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${onPremDown ? 'bg-status-danger' : 'bg-border-subtle'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${onPremDown ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <button onClick={simulateLogin} className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5">
            <Play className="w-4 h-4" /> Simulate On-Prem User Login
          </button>
          <button onClick={reset} className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Authentication Trace
            </span>
            <div className="h-72 overflow-y-auto text-emerald-400 space-y-1.5 mt-3 pr-1 leading-relaxed">
              {logs.map((l, i) => (
                <div key={i} className={l.includes('⚠') || l.includes('FAILED') ? 'text-status-danger font-bold' : l.includes('SUCCESS') ? 'text-status-success font-bold' : ''}>{l}</div>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm text-xs text-text-secondary leading-relaxed">
            The key trade-off: <strong className="text-text-primary">PHS</strong> keeps working even if on-prem is fully down (cloud validates independently), while <strong className="text-text-primary">PTA</strong> and <strong className="text-text-primary">Federation</strong> both depend on live on-prem infrastructure at every single sign-in — toggle the outage switch above to see the blast radius of each design choice.
          </div>
        </div>
      </div>
    </div>
  )
}
