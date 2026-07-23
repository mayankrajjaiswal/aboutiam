import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowRight, RotateCcw, Terminal, Play, Lock } from 'lucide-react'

const LEAKED_CREDS = [
  'alice@company.com : Summer2023!',
  'bob@company.com : Password1',
  'carol@company.com : Welcome123',
  'dave@company.com : Qwerty2024',
  'erin@company.com : LetMeIn99',
]

function Toggle({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">{label}</span>
        <span className="text-[8px] text-text-muted block">{sub}</span>
      </div>
      <button onClick={onChange} className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${value ? 'bg-accent-primary' : 'bg-border-subtle'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function CredentialStuffingLab() {
  const [rateLimiting, setRateLimiting] = useState(false)
  const [captcha, setCaptcha] = useState(false)
  const [breachDetection, setBreachDetection] = useState(false)
  const [smartLockout, setSmartLockout] = useState(false)
  const [running, setRunning] = useState(false)
  const [compromised, setCompromised] = useState<string[]>([])
  const [blocked, setBlocked] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>([
    '[Login Endpoint] Idle. Waiting for attack simulation.',
  ])

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg])

  const runAttack = () => {
    if (running) return
    setRunning(true)
    setCompromised([])
    setBlocked([])
    addLog(`[Attacker] Replaying ${LEAKED_CREDS.length} credential pairs from a public breach dump against /login...`)

    LEAKED_CREDS.forEach((pair, idx) => {
      setTimeout(() => {
        const [user] = pair.split(' : ')

        if (captcha && idx >= 1) {
          setBlocked((prev) => [...prev, user])
          addLog(`[WAF] Attempt ${idx + 1} for ${user} blocked — automated CAPTCHA challenge failed (no headless solver).`)
          return
        }
        if (rateLimiting && idx >= 2) {
          setBlocked((prev) => [...prev, user])
          addLog(`[Rate Limiter] Attempt ${idx + 1} for ${user} throttled — too many login attempts per IP/minute.`)
          return
        }
        if (breachDetection) {
          setBlocked((prev) => [...prev, user])
          addLog(`[Breach Password Check] Password for ${user} matched a known-breached-password list (HIBP-style). Login rejected, forced reset triggered.`)
          return
        }
        if (smartLockout && idx >= 3) {
          setBlocked((prev) => [...prev, user])
          addLog(`[Smart Lockout] Account ${user} locked after suspicious velocity from a single source IP.`)
          return
        }

        setCompromised((prev) => [...prev, user])
        addLog(`🚨 [Login Endpoint] Attempt ${idx + 1} for ${user} SUCCEEDED — account takeover achieved with zero friction.`)

        if (idx === LEAKED_CREDS.length - 1) setRunning(false)
      }, (idx + 1) * 700)
    })
    setTimeout(() => setRunning(false), (LEAKED_CREDS.length + 1) * 700)
  }

  const reset = () => {
    setRateLimiting(false)
    setCaptcha(false)
    setBreachDetection(false)
    setSmartLockout(false)
    setCompromised([])
    setBlocked([])
    setLogs(['[Login Endpoint] Idle. Waiting for attack simulation.'])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Lock className="w-3.5 h-3.5" /> Beginner Defense Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">Credential Stuffing &amp; Password Spray Defense Lab</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Replay leaked credential pairs against a mock login endpoint, then toggle real-world defenses to watch the takeover rate drop to zero.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Active Defenses</span>
            <div className="space-y-3.5">
              <Toggle label="Rate Limiting" sub="Throttle attempts per IP/minute" value={rateLimiting} onChange={() => setRateLimiting((v) => !v)} />
              <Toggle label="CAPTCHA Challenge" sub="Block headless/automated replay" value={captcha} onChange={() => setCaptcha((v) => !v)} />
              <Toggle label="Breached-Password Detection" sub="Reject known-compromised passwords" value={breachDetection} onChange={() => setBreachDetection((v) => !v)} />
              <Toggle label="Smart Account Lockout" sub="Lock accounts on velocity anomalies" value={smartLockout} onChange={() => setSmartLockout((v) => !v)} />
            </div>
          </div>

          <button
            onClick={runAttack}
            disabled={running}
            className="w-full py-2.5 bg-status-danger hover:opacity-90 disabled:opacity-40 text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4" /> Launch Credential Stuffing Attack
          </button>
          <button onClick={reset} className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm grid grid-cols-2 gap-3 text-center">
            <div>
              <span className="text-2xl font-black text-status-danger block">{compromised.length}</span>
              <span className="text-[9px] uppercase text-text-muted font-bold">Accounts Taken Over</span>
            </div>
            <div>
              <span className="text-2xl font-black text-status-success block">{blocked.length}</span>
              <span className="text-[9px] uppercase text-text-muted font-bold">Attempts Blocked</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Login Endpoint Trace
            </span>
            <div className="h-72 overflow-y-auto text-emerald-400 space-y-1.5 mt-3 pr-1 leading-relaxed">
              {logs.map((l, i) => (
                <div key={i} className={l.includes('🚨') ? 'text-status-danger font-bold animate-pulse' : l.includes('rejected') || l.includes('blocked') || l.includes('locked') || l.includes('throttled') ? 'text-status-success font-bold' : ''}>{l}</div>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
            <p>Credential stuffing works because users reuse passwords across sites — attackers don't need to guess, they just replay a breach dump. Each defense above targets a different weakness: rate limiting and CAPTCHA slow down automation, breach-password detection stops reused-but-known-bad passwords outright, and smart lockout catches abnormal login velocity regardless of which password was tried.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
