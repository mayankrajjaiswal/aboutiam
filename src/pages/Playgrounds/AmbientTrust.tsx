import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, UserCheck, TrendingDown, Fingerprint, Lock } from 'lucide-react'

export default function AmbientTrust() {
  const [trustScore, setTrustScore] = useState(100)
  const [isSimulating, setIsSimulating] = useState(false)
  const [anomaly, setAnomaly] = useState<string | null>(null)
  const [stepUpActive, setStepUpActive] = useState(false)

  // Simulation effect
  useEffect(() => {
    let interval: any
    if (isSimulating && trustScore > 0 && !stepUpActive) {
      interval = setInterval(() => {
        setTrustScore(prev => {
          let decay = 1
          if (anomaly) decay = 15 // Rapid decay on anomaly
          const newScore = Math.max(0, prev - decay)
          if (newScore < 50) {
            setStepUpActive(true)
            setIsSimulating(false)
          }
          return newScore
        })
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isSimulating, anomaly, stepUpActive, trustScore])

  const triggerAnomaly = (type: string) => {
    setAnomaly(type)
    setIsSimulating(true)
  }

  const resolveStepUp = () => {
    setTrustScore(100)
    setAnomaly(null)
    setStepUpActive(false)
    setIsSimulating(true)
  }

  const reset = () => {
    setTrustScore(100)
    setAnomaly(null)
    setStepUpActive(false)
    setIsSimulating(false)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Activity className="w-3.5 h-3.5" /> Post-2030 Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Continuous Ambient Trust Decayer
        </h2>
        <p className="text-text-secondary">
          Future systems will not rely on a single login event. They will continuously monitor ambient telemetry (typing dynamics, gait analysis). If behavior drifts, trust decays, triggering a seamless step-up authentication.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Telemetry Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <TrendingDown className="w-4 h-4 text-accent-primary" /> Inject Telemetry Anomaly
            </h4>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => triggerAnomaly('Keystroke Dynamics')}
                disabled={stepUpActive}
                className="w-full p-3 rounded-xl border border-border-subtle hover:bg-bg-sidebar text-left transition-colors disabled:opacity-50"
              >
                <span className="block text-xs font-bold text-text-primary">Shift Keystroke Dynamics</span>
                <span className="block text-[10px] text-text-muted mt-0.5">Typing cadence suddenly drops by 400ms per key.</span>
              </button>
              
              <button
                onClick={() => triggerAnomaly('Network Geo-Velocity')}
                disabled={stepUpActive}
                className="w-full p-3 rounded-xl border border-border-subtle hover:bg-bg-sidebar text-left transition-colors disabled:opacity-50"
              >
                <span className="block text-xs font-bold text-text-primary">Trigger IP Geo-Velocity Drift</span>
                <span className="block text-[10px] text-text-muted mt-0.5">IP routing changes from internal VPN to public cellular.</span>
              </button>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  disabled={stepUpActive}
                  className={`flex-grow py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    isSimulating ? 'bg-status-warning text-white' : 'bg-accent-primary hover:bg-accent-hover text-white'
                  } disabled:opacity-50`}
                >
                  {isSimulating ? 'Pause Monitoring' : 'Start Ambient Monitoring'}
                </button>
                <button onClick={reset} className="px-4 py-2.5 border border-border-subtle rounded-lg text-xs font-bold hover:bg-bg-sidebar transition-colors">Reset</button>
              </div>
            </div>
          </div>
        </div>

        {/* The Gauge and Step-Up UI */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center text-center space-y-6 min-h-[360px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Gauge */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0 z-10">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" className="stroke-border-subtle" strokeWidth="12" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="88" 
                  fill="none" 
                  className={`transition-all duration-500 ${
                    trustScore >= 80 ? 'stroke-status-success' :
                    trustScore >= 50 ? 'stroke-status-warning' : 'stroke-status-danger'
                  }`}
                  strokeWidth="12" 
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - trustScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="space-y-0.5 relative z-10 text-center">
                <span className={`text-4xl font-black ${
                    trustScore >= 80 ? 'text-status-success' :
                    trustScore >= 50 ? 'text-status-warning' : 'text-status-danger'
                }`}>{trustScore}%</span>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Session Trust</p>
              </div>
            </div>

            {/* Status indicators */}
            <div className="space-y-2 h-16 z-10">
              {anomaly && !stepUpActive && (
                <div className="inline-flex items-center gap-2 text-status-danger font-bold text-xs bg-status-danger/10 px-3 py-1.5 rounded-full border border-status-danger/20 animate-pulse">
                  <ShieldAlert className="w-4 h-4" /> Anomaly Detected: {anomaly}
                </div>
              )}
              {stepUpActive && (
                <div className="space-y-4 w-full max-w-sm mx-auto p-5 rounded-2xl bg-bg-sidebar border border-status-danger/30 shadow-2xl animate-scaleUp">
                  <div className="flex items-center justify-center gap-2 text-status-danger font-black text-sm uppercase tracking-wider">
                    <Lock className="w-5 h-5" /> Session Locked
                  </div>
                  <p className="text-[10px] font-semibold text-text-secondary leading-relaxed">
                    Trust score dropped below 50% threshold. Immediate biometric re-verification required to resume session.
                  </p>
                  <button onClick={resolveStepUp} className="w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 flex items-center justify-center gap-2">
                    <Fingerprint className="w-4 h-4" /> Verify Biometric Step-Up
                  </button>
                </div>
              )}
              {!anomaly && !stepUpActive && (
                <div className="inline-flex items-center gap-2 text-status-success font-bold text-xs">
                  <UserCheck className="w-4 h-4" /> User behavior normal. Monitoring ambient data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
