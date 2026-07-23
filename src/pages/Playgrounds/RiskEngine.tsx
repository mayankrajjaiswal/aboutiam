import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gauge, ArrowRight, RotateCcw, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle/60">
      <span className="text-xs font-semibold text-text-primary pr-2">{label}</span>
      <button onClick={onChange} className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${value ? 'bg-status-danger' : 'bg-border-subtle'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function RiskEngine() {
  const [impossibleTravel, setImpossibleTravel] = useState(false)
  const [unknownDevice, setUnknownDevice] = useState(false)
  const [behaviorAnomaly, setBehaviorAnomaly] = useState(false)
  const [torExitNode, setTorExitNode] = useState(false)
  const [outsideHours, setOutsideHours] = useState(false)

  const signals = useMemo(
    () => [
      { active: impossibleTravel, label: 'Impossible travel velocity', weight: 40 },
      { active: unknownDevice, label: 'Unrecognized / unmanaged device', weight: 20 },
      { active: behaviorAnomaly, label: 'Behavioral anomaly (typing cadence, click patterns)', weight: 15 },
      { active: torExitNode, label: 'Connection from Tor/anonymizing proxy', weight: 20 },
      { active: outsideHours, label: 'Login outside normal working hours', weight: 5 },
    ],
    [impossibleTravel, unknownDevice, behaviorAnomaly, torExitNode, outsideHours]
  )

  const score = signals.reduce((sum, s) => sum + (s.active ? s.weight : 0), 0)

  const decision = score >= 60 ? 'block' : score >= 25 ? 'stepup' : 'allow'

  const reset = () => {
    setImpossibleTravel(false)
    setUnknownDevice(false)
    setBehaviorAnomaly(false)
    setTorExitNode(false)
    setOutsideHours(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Gauge className="w-3.5 h-3.5" /> Intermediate / Advanced Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">Adaptive Risk-Based Authentication Engine</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Toggle individual risk signals to see how a UEBA-style composite score drives a real-time allow / step-up / block decision — distinct from static, rule-based Conditional Access.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5">Risk Signals</span>
            <Toggle label="Impossible travel velocity (+40)" value={impossibleTravel} onChange={() => setImpossibleTravel((v) => !v)} />
            <Toggle label="Unrecognized / unmanaged device (+20)" value={unknownDevice} onChange={() => setUnknownDevice((v) => !v)} />
            <Toggle label="Behavioral anomaly (+15)" value={behaviorAnomaly} onChange={() => setBehaviorAnomaly((v) => !v)} />
            <Toggle label="Tor / anonymizing proxy (+20)" value={torExitNode} onChange={() => setTorExitNode((v) => !v)} />
            <Toggle label="Login outside working hours (+5)" value={outsideHours} onChange={() => setOutsideHours((v) => !v)} />
          </div>
          <button onClick={reset} className="w-full py-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Signals
          </button>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Composite Risk Score</span>
              <span className="text-3xl font-black text-text-primary">{score}<span className="text-sm text-text-muted"> / 100</span></span>
            </div>
            <div className="h-3 rounded-full bg-bg-sidebar overflow-hidden">
              <div
                className={`h-full transition-all ${score >= 60 ? 'bg-status-danger' : score >= 25 ? 'bg-amber-500' : 'bg-status-success'}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className={`p-4 rounded-lg border flex items-center gap-3 ${
              decision === 'block' ? 'bg-status-danger/10 border-status-danger/30' :
              decision === 'stepup' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-status-success/10 border-status-success/30'
            }`}>
              {decision === 'block' && <ShieldX className="w-6 h-6 text-status-danger" />}
              {decision === 'stepup' && <ShieldAlert className="w-6 h-6 text-amber-500" />}
              {decision === 'allow' && <ShieldCheck className="w-6 h-6 text-status-success" />}
              <div>
                <span className={`text-sm font-black uppercase block ${decision === 'block' ? 'text-status-danger' : decision === 'stepup' ? 'text-amber-500' : 'text-status-success'}`}>
                  {decision === 'block' ? 'Access Blocked' : decision === 'stepup' ? 'Step-Up MFA Required' : 'Access Allowed'}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {decision === 'block' && 'Score ≥ 60 — session terminated, admin alerted.'}
                  {decision === 'stepup' && 'Score 25-59 — additional phishing-resistant factor required before continuing.'}
                  {decision === 'allow' && 'Score < 25 — silent, frictionless authentication.'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm text-xs text-text-secondary leading-relaxed">
            Unlike static Conditional Access rules (e.g. "block all logins from country X"), a risk engine blends many weighted signals into one continuous score and re-evaluates it per request — the same signal combination can be low-risk for one user's normal pattern and high-risk for another's.
          </div>
        </div>
      </div>
    </div>
  )
}
