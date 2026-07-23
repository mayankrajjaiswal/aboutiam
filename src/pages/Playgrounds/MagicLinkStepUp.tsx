import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ShieldCheck, ArrowRight, RotateCcw, Terminal, KeyRound, Wallet } from 'lucide-react'

type Stage = 'idle' | 'sent' | 'authenticated' | 'stepup-required' | 'stepup-verified'

export default function MagicLinkStepUp() {
  const [email, setEmail] = useState('mayank@company.com')
  const [stage, setStage] = useState<Stage>('idle')
  const [otp, setOtp] = useState('')
  const [logs, setLogs] = useState<string[]>([
    '[Auth Server] Passwordless magic-link authenticator ready.',
  ])

  const addLog = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

  const sendMagicLink = () => {
    setStage('sent')
    addLog(`Magic link dispatched to ${email}. No password was ever transmitted or stored.`)
  }

  const clickMagicLink = () => {
    setStage('authenticated')
    addLog('User clicked the single-use, short-lived magic link. Session established at LOW assurance (possession of inbox only).')
  }

  const requestHighRiskAction = () => {
    setStage('stepup-required')
    addLog('User requested "Wire $10,000 to a new payee" — a high-risk action. Policy requires step-up to a phishing-resistant factor before authorizing.')
  }

  const verifyStepUp = () => {
    if (otp.length === 6) {
      setStage('stepup-verified')
      addLog(`WebAuthn/OTP step-up verified (code ${otp}). Session assurance elevated to HIGH. High-risk action authorized.`)
    } else {
      addLog('Step-up code rejected — expected a 6-digit OTP.')
    }
  }

  const reset = () => {
    setStage('idle')
    setOtp('')
    setLogs(['[Auth Server] Passwordless magic-link authenticator ready.'])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Mail className="w-3.5 h-3.5" /> Passwordless Beginner Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">Magic Link & Step-Up Authentication Lab</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Log in with nothing but an email inbox, then watch policy force a stronger factor before a high-risk action is allowed.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Step 1 — Passwordless Login</span>
            <label className="block text-xs font-bold text-text-secondary">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={stage !== 'idle'}
              className="w-full px-3 py-2 rounded-lg bg-bg-sidebar border border-border-subtle text-xs font-mono disabled:opacity-50"
            />
            {stage === 'idle' && (
              <button onClick={sendMagicLink} className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5">
                <Mail className="w-4 h-4" /> Send Magic Link
              </button>
            )}
            {stage === 'sent' && (
              <button onClick={clickMagicLink} className="w-full py-2.5 bg-accent-secondary hover:opacity-90 text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Open Inbox &amp; Click Link
              </button>
            )}
            {(stage === 'authenticated' || stage === 'stepup-required' || stage === 'stepup-verified') && (
              <div className="text-xs font-bold text-status-success flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Authenticated as {email} (LOW assurance)
              </div>
            )}
          </div>

          {stage === 'authenticated' && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Step 2 — Attempt a High-Risk Action</span>
              <p className="text-xs text-text-secondary">Try to wire $10,000 to a newly-added payee.</p>
              <button onClick={requestHighRiskAction} className="w-full py-2.5 bg-status-danger hover:opacity-90 text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5">
                <Wallet className="w-4 h-4" /> Wire $10,000 to New Payee
              </button>
            </div>
          )}

          {(stage === 'stepup-required' || stage === 'stepup-verified') && (
            <div className="p-5 rounded-xl bg-bg-card border border-status-danger/30 shadow-sm space-y-3">
              <span className="text-[10px] font-black text-status-danger uppercase tracking-wider block border-b border-border-subtle pb-1.5">Step-Up Required (HIGH assurance)</span>
              <p className="text-xs text-text-secondary">Enter the 6-digit code from your authenticator app to elevate this session.</p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={stage === 'stepup-verified'}
                placeholder="123456"
                className="w-full px-3 py-2 rounded-lg bg-bg-sidebar border border-border-subtle text-xs font-mono tracking-widest disabled:opacity-50"
              />
              {stage === 'stepup-required' ? (
                <button onClick={verifyStepUp} className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Verify Step-Up
                </button>
              ) : (
                <div className="text-xs font-bold text-status-success flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> $10,000 wire AUTHORIZED at HIGH assurance
                </div>
              )}
            </div>
          )}

          <button onClick={reset} className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Session
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Assurance-Level Trace
            </span>
            <div className="h-72 overflow-y-auto text-emerald-400 space-y-1.5 mt-3 pr-1 leading-relaxed">
              {logs.map((l, i) => (
                <div key={i} className={l.includes('AUTHORIZED') || l.includes('elevated') ? 'text-status-success font-bold' : l.includes('rejected') ? 'text-status-danger font-bold' : ''}>{l}</div>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm text-xs text-text-secondary leading-relaxed space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2">Why this matters</h4>
            <p>Passwordless doesn't mean single-factor forever. NIST 800-63B calls this pattern <strong className="text-text-primary">step-up authentication</strong>: a session can start at a low assurance level (possession of an inbox) and be forced to re-prove identity with a stronger factor before an operation with real financial or data-loss consequences is allowed.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
