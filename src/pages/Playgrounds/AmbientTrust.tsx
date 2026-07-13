import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Fingerprint,
  Lock,
  ArrowRight,
  Terminal,
} from 'lucide-react'

interface KeyTiming {
  key: string
  downTime: number
  upTime: number
  dwell: number
  flight: number
}

export default function AmbientTrust() {
  const [activeMode, setActiveMode] = useState<'enroll' | 'verify'>('enroll')
  const [enrollText, setEnrollText] = useState('')
  const [verifyText, setVerifyText] = useState('')

  // Enrollment Template Metrics
  const [enrolledTemplate, setEnrolledTemplate] = useState<{
    avgDwell: number
    avgFlight: number
    pattern: KeyTiming[]
  } | null>(null)

  // Live Typing Telemetry
  const [keyTimings, setKeyTimings] = useState<KeyTiming[]>([])
  const [trustScore, setTrustScore] = useState(100)
  const [stepUpActive, setStepUpActive] = useState(false)
  const [evaluationLog, setEvaluationLog] = useState<string[]>([])

  // Raw Event Timing Tracker Refs
  const lastKeyUpRef = useRef<number | null>(null)
  const activeKeysRef = useRef<Record<string, number>>({})

  const targetPassword = 'aboutiam_security_2026'

  // Dynamic monitoring decay loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (activeMode === 'verify' && enrolledTemplate && trustScore > 0 && !stepUpActive) {
      interval = setInterval(() => {
        // Ambient decay of trust if no typing activity or if anomaly exists
        setTrustScore((prev) => {
          const newScore = Math.max(0, prev - 1)
          if (newScore < 50) {
            setStepUpActive(true)
          }
          return newScore
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeMode, enrolledTemplate, trustScore, stepUpActive])

  // Key Event Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    const now = performance.now()

    // Capture key down timestamp
    if (activeKeysRef.current[key] !== undefined) return // Ignore auto-repeat key holds
    activeKeysRef.current[key] = now
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, mode: 'enroll' | 'verify') => {
    const key = e.key
    const now = performance.now()
    const downTime = activeKeysRef.current[key]

    if (downTime === undefined) return
    delete activeKeysRef.current[key]

    const dwell = Math.round(now - downTime)
    let flight = 0

    if (lastKeyUpRef.current !== null) {
      flight = Math.round(downTime - lastKeyUpRef.current)
    }
    lastKeyUpRef.current = now

    const timing: KeyTiming = {
      key,
      downTime,
      upTime: now,
      dwell,
      flight: Math.max(0, flight),
    }

    setKeyTimings((prev) => [...prev, timing])

    if (mode === 'enroll') {
      const currentInput = enrollText + key
      if (currentInput === targetPassword) {
        // Calculate and save enrollment biometric template
        const allTimings = [...keyTimings, timing]
        const avgDwell = Math.round(allTimings.reduce((acc, t) => acc + t.dwell, 0) / allTimings.length)
        const avgFlight = Math.round(allTimings.reduce((acc, t) => acc + t.flight, 0) / (allTimings.length - 1 || 1))

        setEnrolledTemplate({ avgDwell, avgFlight, pattern: allTimings })
        setEvaluationLog([
          `[HSM] Biometric keyboard profile compiled.`,
          `  ├─ Avg Dwell Time: ${avgDwell}ms`,
          `  ├─ Avg Flight Interval: ${avgFlight}ms`,
          `[Federation] Enrollment Complete! Proceed to Verification Mode.`
        ])
      }
    } else {
      // Verification/Authentication Evaluation
      if (enrolledTemplate) {
        const currentTimings = [...keyTimings, timing]
        const avgDwell = Math.round(currentTimings.reduce((acc, t) => acc + t.dwell, 0) / currentTimings.length)
        const avgFlight = Math.round(currentTimings.reduce((acc, t) => acc + t.flight, 0) / (currentTimings.length - 1 || 1))

        // Compare current cadence against the enrolled template
        const dwellDelta = Math.abs(avgDwell - enrolledTemplate.avgDwell)
        const flightDelta = Math.abs(avgFlight - enrolledTemplate.avgFlight)

        // Trust score penalty calculations based on typing deviation
        let penalty = 0
        if (dwellDelta > 40) penalty += 20
        if (flightDelta > 80) penalty += 25

        setTrustScore((prev) => {
          const nextScore = Math.max(0, prev - penalty)
          if (nextScore < 50) {
            setStepUpActive(true)
          }
          return nextScore
        })

        setEvaluationLog((prev) => [
          ...prev,
          `[Audit] Cadence Checked: Dwell Δ = ${dwellDelta}ms, Flight Δ = ${flightDelta}ms. Penalty applied: ${penalty}%.`
        ])
      }
    }
  }

  const handleMfaVerify = () => {
    setTrustScore(100)
    setStepUpActive(false)
    setVerifyText('')
    setKeyTimings([])
    lastKeyUpRef.current = null
    activeKeysRef.current = {}
    setEvaluationLog([`[Mfa] Phishing-Resistant FIDO2 Step-Up verified. Trust Score restored to 100%.`])
  }

  const handleReset = () => {
    setEnrollText('')
    setVerifyText('')
    setEnrolledTemplate(null)
    setKeyTimings([])
    setTrustScore(100)
    setStepUpActive(false)
    setEvaluationLog([])
    lastKeyUpRef.current = null
    activeKeysRef.current = {}
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Activity className="w-3.5 h-3.5" /> Ambient Telemetry Engine
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            Biometric Keystroke Dynamics Simulator
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Test continuous post-authentication security. Enroll your typing cadence to watch how behavioral drift, stutters, or password shares trigger automated MFA step-up.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE INTERACTIVE WORKSPACE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 bg-bg-card border border-border-subtle rounded-xl space-y-4 shadow-sm">
            {/* Mode selector */}
            <div className="flex bg-bg-sidebar rounded-lg p-0.5 border border-border-subtle">
              <button
                type="button"
                disabled={stepUpActive}
                onClick={() => {
                  setActiveMode('enroll')
                  handleReset()
                }}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeMode === 'enroll' ? 'bg-bg-card text-text-primary shadow' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Fingerprint className="w-4 h-4" /> 1. Biometric Enrollment
              </button>
              <button
                type="button"
                disabled={!enrolledTemplate || stepUpActive}
                onClick={() => {
                  setActiveMode('verify')
                  setVerifyText('')
                  setKeyTimings([])
                  lastKeyUpRef.current = null
                }}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeMode === 'verify' ? 'bg-bg-card text-text-primary shadow' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Lock className="w-4 h-4" /> 2. Verification / Attack
              </button>
            </div>

            {/* Input card based on active mode */}
            {activeMode === 'enroll' ? (
              <div className="space-y-3.5">
                <span className="text-[10px] font-black text-text-muted uppercase block">Cadence Enrollment Node</span>
                <p className="text-xs text-text-secondary leading-normal">
                  Type the exact master keyphrase below at your normal, relaxed pace to establish your biometric template.
                </p>
                <div className="bg-bg-sidebar p-2 rounded-lg border border-border-subtle text-center text-xs font-mono font-bold text-accent-primary select-none select-all select-all">
                  {targetPassword}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="enroll-input" className="block text-[10px] font-bold text-text-muted uppercase">Type Enrollment Password</label>
                  <input
                    id="enroll-input"
                    type="text"
                    value={enrollText}
                    onChange={(e) => setEnrollText(e.target.value.toLowerCase())}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e) => handleKeyUp(e, 'enroll')}
                    disabled={!!enrolledTemplate}
                    placeholder="Click and start typing here…"
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>

                {enrolledTemplate && (
                  <div className="p-3 bg-status-success/10 border border-status-success/20 text-status-success rounded-lg flex items-center gap-2 text-xs font-bold animate-fadeIn">
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                    <span>Cadence Profile Enrolled! Click on tab 2.</span>
                  </div>
                )}
              </div>
            ) : (
              // VERIFY / ATTACK MODE
              <div className="space-y-3.5">
                <span className="text-[10px] font-black text-text-muted uppercase block">Cadence Verification & Drift Testing</span>
                <p className="text-xs text-text-secondary leading-normal">
                  Now type the same keyphrase again. Try typing it **extremely slowly, stutters, or fast** to watch the trust decayer react!
                </p>
                <div className="bg-bg-sidebar p-2 rounded-lg border border-border-subtle text-center text-xs font-mono font-bold text-accent-primary select-none select-all select-all">
                  {targetPassword}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="verify-input" className="block text-[10px] font-bold text-text-muted uppercase">Verify Cadence Match</label>
                  <input
                    id="verify-input"
                    type="text"
                    value={verifyText}
                    onChange={(e) => setVerifyText(e.target.value.toLowerCase())}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e) => handleKeyUp(e, 'verify')}
                    disabled={stepUpActive}
                    placeholder="Type to verify rhythm match…"
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-1.5 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-[10px] font-black text-text-muted uppercase tracking-wider transition"
            >
              Reset Terminal
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: GAUGE BOARD, TELEMETRY LOGGER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* The Gauge and Step-Up UI */}
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center text-center space-y-4 min-h-[340px] justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Gauge */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0 z-10">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="72" fill="none" className="stroke-border-subtle" strokeWidth="8" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="72" 
                    fill="none" 
                    className={`transition-all duration-500 ${
                      trustScore < 50 ? 'stroke-status-danger' : trustScore < 80 ? 'stroke-status-warning' : 'stroke-accent-primary'
                    }`} 
                    strokeWidth="8" 
                    strokeDasharray={452} 
                    strokeDashoffset={452 - (452 * trustScore) / 100} 
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-text-primary">{trustScore}%</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Trust Score</span>
                </div>
              </div>

              {/* Step-Up Challenge Block */}
              {stepUpActive ? (
                <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/20 text-xs space-y-2.5 z-10 animate-bounce">
                  <div className="flex items-center gap-1.5 text-status-danger font-bold justify-center">
                    <ShieldAlert className="w-4.5 h-4.5" />
                    <span>Rhythm Drift Detected: Session Suspended!</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Keyboard biometric cadence does not match the enrolled owner template. Enforce phishing-resistant hardware MFA step-up immediately.
                  </p>
                  <button
                    type="button"
                    onClick={handleMfaVerify}
                    className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-black shadow"
                  >
                    FIDO2 Hardware Verification
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-text-secondary z-10 font-bold">
                  {trustScore >= 80 ? (
                    <span className="text-status-success flex items-center gap-1"><UserCheck className="w-4 h-4" /> Continuous Ambient Authenticated</span>
                  ) : (
                    <span className="text-status-warning flex items-center gap-1"><Activity className="w-4 h-4 animate-ping" /> Analyzing Telemetry Cadence...</span>
                  )}
                </div>
              )}
            </div>

            {/* Telemetry Logger Terminal */}
            <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px] min-h-[340px] flex flex-col justify-between">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Keystroke Millisecond Telemetry logs
              </span>

              <div className="h-48 overflow-y-auto text-emerald-400 space-y-1 mt-3 pr-1 leading-relaxed">
                {evaluationLog.length === 0 ? (
                  <span className="text-zinc-600 italic select-none">Awaiting keyboard activity…</span>
                ) : (
                  evaluationLog.map((log, idx) => (
                    <div key={idx} className={
                      log.includes('Penalty applied') ? 'text-status-warning' :
                      log.includes('Mfa') ? 'text-emerald-400 font-black' :
                      log.startsWith('  ├─') ? 'text-blue-400' : ''
                    }>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
