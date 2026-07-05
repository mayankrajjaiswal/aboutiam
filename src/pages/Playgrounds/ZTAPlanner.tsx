import { useState } from 'react'
import { 
  Network, Cpu, Info
} from 'lucide-react'

export default function ZTAPlanner() {
  const [device, setDevice] = useState<'Secure' | 'Compromised'>('Secure')
  const [network, setNetwork] = useState<'Office' | 'Starbucks'>('Office')
  const [auth, setAuth] = useState<'Password' | 'MFA'>('MFA')

  // Calculate score natively
  const getZeroTrustScore = () => {
    let score = 0
    if (device === 'Secure') score += 40
    if (network === 'Office') score += 30
    if (auth === 'MFA') score += 30
    return score
  }

  const score = getZeroTrustScore()

  const getPolicyVerdict = () => {
    if (score === 100) return { label: 'ACCESS GRANTED', color: 'text-status-success border-status-success bg-status-success/5 shadow-status-success/10', desc: 'Maximum security met. The transaction is approved without restrictions.' }
    if (score >= 60) return { label: 'STEP-UP MFA DEMANDED', color: 'text-status-warning border-status-warning bg-status-warning/5 shadow-status-warning/10 animate-pulse', desc: 'Suspicious context offset (e.g. coffee shop network). Prompting secondary biometric check.' }
    return { label: 'ACCESS DENIED & LOCKED', color: 'text-status-danger border-status-danger bg-status-danger/5 shadow-status-danger/10 animate-shake', desc: 'Critical risk compromise detected (Infected device or password-only check). Transaction is strictly blocked.' }
  }

  const verdict = getPolicyVerdict()

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Network className="w-3.5 h-3.5" /> GRC Planner
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Zero Trust Architecture Planner
        </h2>
        <p className="text-text-secondary">
          Model dynamic trust algorithm evaluations based on NIST SP 800-207. Adjust device, network, and MFA sliders, and observe Policy Decision Point (PDP) verdicts in real-time.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sliders Console */}
        <div className="lg:col-span-1 p-6 rounded-xl bg-bg-card border border-border-subtle space-y-5 h-fit shadow-sm">
          <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Cpu className="w-4 h-4 text-accent-primary" /> Risk-Context Sliders
          </h4>

          <div className="space-y-4 text-xs font-semibold text-text-secondary">
            {/* Device compliance */}
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider">Device Posture</label>
              <select 
                value={device} 
                onChange={(e) => setDevice(e.target.value as 'Secure' | 'Compromised')}
                className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
              >
                <option value="Secure">Compliant & Patched (+40% Trust)</option>
                <option value="Compromised">Compromised / No Firewall (0% Trust)</option>
              </select>
            </div>

            {/* Network origin */}
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider">Network Origin</label>
              <select 
                value={network} 
                onChange={(e) => setNetwork(e.target.value as 'Office' | 'Starbucks')}
                className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
              >
                <option value="Office">Corporate Intranet (+30% Trust)</option>
                <option value="Starbucks">Public Starbucks Wi-Fi (0% Trust)</option>
              </select>
            </div>

            {/* Authentication strength */}
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider">Authentication Factors</label>
              <select 
                value={auth} 
                onChange={(e) => setAuth(e.target.value as 'MFA' | 'Password')}
                className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
              >
                <option value="MFA">Phishing-Resistant MFA (+30% Trust)</option>
                <option value="Password">Standard Password Only (0% Trust)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Score & Verdict output panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center justify-center text-center min-h-[220px] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Policy Decision Point (PDP) Score</span>
                <span className="text-5xl font-black text-text-primary">{score}% Trust</span>
              </div>

              <div className={`text-2xl font-black uppercase tracking-widest px-6 py-3 rounded-lg border ${verdict.color}`}>
                {verdict.label}
              </div>

              <p className="text-xs text-text-secondary font-semibold max-w-md mx-auto leading-relaxed pt-1 font-sans">
                {verdict.desc}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg-sidebar/50 border border-border-subtle flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
            <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5 font-sans">
              <span className="font-bold text-text-primary text-[10px] uppercase">ZTA NIST Concept</span>
              <p>
                Under NIST SP 800-207 guidelines, access is never authorized statically. The PEP (Policy Enforcement Point) intercepts traffic and checks the PDP, which dynamically aggregates risk inputs (context, posture, MFA strength) to issue micro-approvals for individual transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
