import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, ArrowRight, RotateCcw, Terminal, CheckCircle2 } from 'lucide-react'

interface Scope {
  id: string
  label: string
  desc: string
  required?: boolean
}

const SCOPES: Scope[] = [
  { id: 'profile', label: 'Basic profile (name, avatar)', desc: 'Always required for the app to function.', required: true },
  { id: 'email', label: 'Email address', desc: 'Used for receipts and account recovery.', required: true },
  { id: 'contacts', label: 'Your contact list', desc: 'Used to suggest friends who already use the app.' },
  { id: 'location', label: 'Precise location', desc: 'Used for store-locator and delivery estimates.' },
]

const PROGRESSIVE_FIELDS = ['Date of birth', 'Marketing preferences', 'Shipping address']

export default function CiamConsentSandbox() {
  const [stage, setStage] = useState<'idle' | 'consent' | 'granted'>('idle')
  const [grants, setGrants] = useState<Record<string, boolean>>({ profile: true, email: true, contacts: false, location: false })
  const [session, setSession] = useState(0)
  const [collectedFields, setCollectedFields] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>(['[CIAM] Consumer Identity gateway ready.'])

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg])

  const startSocialLogin = () => {
    setStage('consent')
    addLog('[Social IdP] User clicked "Continue with Google". Redirecting to consent screen with requested scopes.')
  }

  const toggleGrant = (id: string) => {
    const scope = SCOPES.find((s) => s.id === id)
    if (scope?.required) return
    setGrants((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const confirmConsent = () => {
    const granted = SCOPES.filter((s) => grants[s.id]).map((s) => s.label)
    const denied = SCOPES.filter((s) => !grants[s.id]).map((s) => s.label)
    setStage('granted')
    addLog(`[OAuth Authorization] User granted: ${granted.join(', ')}.`)
    if (denied.length) addLog(`[OAuth Authorization] User denied: ${denied.join(', ')} — app must degrade gracefully without them.`)
  }

  const nextSession = () => {
    const nextField = PROGRESSIVE_FIELDS[session]
    if (!nextField) return
    setCollectedFields((prev) => [...prev, nextField])
    setSession((prev) => prev + 1)
    addLog(`[Progressive Profiling] Session ${session + 2}: instead of a long signup form, the app asked one extra low-friction question — "${nextField}" — and captured it.`)
  }

  const reset = () => {
    setStage('idle')
    setGrants({ profile: true, email: true, contacts: false, location: false })
    setSession(0)
    setCollectedFields([])
    setLogs(['[CIAM] Consumer Identity gateway ready.'])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <UserPlus className="w-3.5 h-3.5" /> CIAM Beginner/Intermediate Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">CIAM Consent &amp; Progressive Profiling Sandbox</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Grant or deny individual OAuth scopes on a social-login consent screen, then watch a customer-identity app collect one more profile field per return visit instead of a long signup form.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          {stage === 'idle' && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Step 1 — Social Sign-Up</span>
              <button onClick={startSocialLogin} className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-black rounded-lg text-xs transition">
                Continue with Google
              </button>
            </div>
          )}

          {stage === 'consent' && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Step 2 — Consent Screen</span>
              <p className="text-xs text-text-secondary">MyShopApp.com wants to access:</p>
              <div className="space-y-3">
                {SCOPES.map((s) => (
                  <label key={s.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${s.required ? 'border-border-subtle/50 opacity-70' : 'border-border-subtle hover:border-accent-primary/40 cursor-pointer'}`}>
                    <input type="checkbox" checked={!!grants[s.id]} disabled={s.required} onChange={() => toggleGrant(s.id)} className="mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-text-primary block">{s.label} {s.required && <span className="text-[9px] text-text-muted font-normal">(required)</span>}</span>
                      <span className="text-[10px] text-text-muted">{s.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={confirmConsent} className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-black rounded-lg text-xs transition">
                Allow Selected Scopes
              </button>
            </div>
          )}

          {stage === 'granted' && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <span className="text-[10px] font-black text-status-success uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Account created — Step 3: Progressive Profiling
              </span>
              <p className="text-xs text-text-secondary">Each subsequent login, ask for one more optional field instead of a 15-field signup form:</p>
              <div className="space-y-1.5">
                {collectedFields.map((f) => (
                  <div key={f} className="text-xs text-status-success font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {f} collected</div>
                ))}
              </div>
              {session < PROGRESSIVE_FIELDS.length ? (
                <button onClick={nextSession} className="w-full py-2.5 bg-accent-secondary hover:opacity-90 text-white font-black rounded-lg text-xs transition">
                  Simulate Return Visit #{session + 2}
                </button>
              ) : (
                <p className="text-xs font-bold text-status-success">Full profile progressively assembled across {PROGRESSIVE_FIELDS.length + 1} sessions with zero signup-form friction.</p>
              )}
            </div>
          )}

          <button onClick={reset} className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> CIAM Event Trace
            </span>
            <div className="h-72 overflow-y-auto text-emerald-400 space-y-1.5 mt-3 pr-1 leading-relaxed">
              {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">CIAM</strong> (Customer Identity & Access Management) differs from workforce IAM by optimizing for conversion and privacy consent rather than governance: scope-level consent lets a user opt out of a permission without blocking sign-up entirely, and progressive profiling trades a single long form for many small, low-friction asks over time.
          </div>
        </div>
      </div>
    </div>
  )
}
