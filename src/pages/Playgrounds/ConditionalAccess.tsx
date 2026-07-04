import { useState } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Play, RotateCcw, Sliders, Lock, Laptop, Globe, AlertTriangle, Key } from 'lucide-react'

interface Policy {
  id: string
  name: string
  desc: string
  condition: string
  action: 'ALLOW' | 'DENY' | 'PROMPT_MFA'
  enabled: boolean
}

export default function ConditionalAccess() {
  // Context inputs
  const [group, setGroup] = useState<'Finance' | 'HR' | 'Engineering' | 'Guest'>('Finance')
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('Low')
  const [device, setDevice] = useState<'Managed' | 'BYOD' | 'Infected'>('Managed')
  const [network, setNetwork] = useState<'Intranet' | 'Public'>('Intranet')
  const [country, setCountry] = useState<'US' | 'Bulgaria' | 'Proxy'>('US')

  // Policies list
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 'p1',
      name: 'Enforce Device Compliance',
      desc: 'Block non-compliant, compromised, or infected endpoints immediately.',
      condition: 'Device == Infected OR Risk == High',
      action: 'DENY',
      enabled: true
    },
    {
      id: 'p2',
      name: 'MFA for Finance Off-Network',
      desc: 'Prompt step-up multi-factor check when accessing sensitive ledgers from untrusted locations.',
      condition: 'Group == Finance AND Network == Public',
      action: 'PROMPT_MFA',
      enabled: true
    },
    {
      id: 'p3',
      name: 'Block Proxy Geolocations',
      desc: 'Reject anonymous proxies, unmapped geolocations, or blacklisted IP addresses.',
      condition: 'Country == Proxy',
      action: 'DENY',
      enabled: true
    }
  ])

  // Simulation state
  const [activeStep, setActiveStep] = useState<number>(0)
  const [evaluating, setEvaluating] = useState(false)
  const [verdict, setVerdict] = useState<'ALLOW' | 'DENY' | 'PROMPT_MFA' | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  // Run the Conditional Access evaluation pipeline
  const runEvaluation = () => {
    setEvaluating(true)
    setActiveStep(1)
    setVerdict(null)
    setLogs([
      `[GATEWAY] Inbound logon evaluation initiated...`,
      `[CONTEXT] Subject: alice@company.com | Group: ${group}`,
      `[CONTEXT] Device: ${device} | Network: ${network} | Risk: ${risk} | Location: ${country}`
    ])

    // Step 1: Device check (1000ms)
    setTimeout(() => {
      setActiveStep(2)
      const p1 = policies.find(p => p.id === 'p1')!
      if (p1.enabled && (device === 'Infected' || risk === 'High')) {
        setLogs(prev => [
          ...prev,
          `[EVAL] Policy '${p1.name}' TRIGGERED.`,
          `[BLOCK] non-compliant device state ('${device}') or risk level ('${risk}') detected.`,
          `[GATEWAY] Access DENIED! 🛑`
        ])
        setVerdict('DENY')
        setEvaluating(false)
        return
      }
      setLogs(prev => [...prev, `✔ Device posture and risk posture verified... Compliant.`])

      // Step 2: Location/Proxy check (1000ms)
      setTimeout(() => {
        setActiveStep(3)
        const p3 = policies.find(p => p.id === 'p3')!
        if (p3.enabled && country === 'Proxy') {
          setLogs(prev => [
            ...prev,
            `[EVAL] Policy '${p3.name}' TRIGGERED.`,
            `[BLOCK] Anonymous proxy network range detected.`,
            `[GATEWAY] Access DENIED! 🛑`
          ])
          setVerdict('DENY')
          setEvaluating(false)
          return
        }
        setLogs(prev => [...prev, `✔ Geolocation and IP range checked... Verified (${country}).`])

        // Step 3: Context-based rules (Finance/MFA check)
        setTimeout(() => {
          setActiveStep(4)
          const p2 = policies.find(p => p.id === 'p2')!
          if (p2.enabled && group === 'Finance' && network === 'Public') {
            setLogs(prev => [
              ...prev,
              `[EVAL] Policy '${p2.name}' TRIGGERED.`,
              `[WARN] Finance asset requested from external IP. Step-up auth required.`,
              `[GATEWAY] Promoted to MFA STEP-UP CHALLENGE! 🔑`
            ])
            setVerdict('PROMPT_MFA')
            setEvaluating(false)
            return
          }

          // Default Fallthrough: ALLOW
          setActiveStep(5)
          setLogs(prev => [
            ...prev,
            `[EVAL] All security policies satisfied successfully.`,
            `[GATEWAY] Trust verified. Session token authorized. ACCESS GRANTED! 🎉`
          ])
          setVerdict('ALLOW')
          setEvaluating(false)

        }, 1200)
      }, 1200)
    }, 1200)
  }

  const handleReset = () => {
    setGroup('Finance')
    setRisk('Low')
    setDevice('Managed')
    setNetwork('Intranet')
    setCountry('US')
    setActiveStep(0)
    setVerdict(null)
    setLogs([])
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Shield className="w-3.5 h-3.5" /> Policy Playground
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Conditional Access Policy Simulator
        </h2>
        <p className="text-text-secondary">
          Model and evaluate the dynamic logic rules of modern enterprise Zero Trust architectures. Configure active context-aware policies, toggle incoming request variables (user, device compliance, network, location, and risk), and trace the pipeline evaluation flow live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Request Context Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Incoming Request Context
            </h4>

            {/* Group */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">User Department Group</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                {['Finance', 'HR', 'Engineering', 'Guest'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroup(g as any)}
                    className={`py-1.5 rounded-lg border transition-all ${
                      group === g ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Compliance */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Device Posture State</label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                {([
                  { id: 'Managed', label: 'Corporate' },
                  { id: 'BYOD', label: 'Personal' },
                  { id: 'Infected', label: 'Infected ⚠️' }
                ]).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d.id as any)}
                    className={`py-1.5 rounded-lg border transition-all ${
                      device === d.id ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Network Untrusted vs Trusted */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Network Security Boundary</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setNetwork('Intranet')}
                  className={`py-1.5 rounded-lg border transition-all ${
                    network === 'Intranet' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                >
                  Intranet (Trusted)
                </button>
                <button
                  onClick={() => setNetwork('Public')}
                  className={`py-1.5 rounded-lg border transition-all ${
                    network === 'Public' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                >
                  Public IP (Untrusted)
                </button>
              </div>
            </div>

            {/* Geolocation */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Geolocation Location</label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                {([
                  { id: 'US', label: 'United States' },
                  { id: 'Bulgaria', label: 'Bulgaria' },
                  { id: 'Proxy', label: 'Proxy IP ⚠️' }
                ]).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCountry(c.id as any)}
                    className={`py-1.5 rounded-lg border transition-all ${
                      country === c.id ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Risk */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Calculated Session Risk</label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                {['Low', 'Medium', 'High'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r as any)}
                    className={`py-1.5 rounded-lg border transition-all ${
                      risk === r ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* MIDDLE COLUMN: Evaluation Pipeline Trace (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Evaluation Flow Pipeline</h3>
            <div className="flex gap-2">
              <button
                disabled={evaluating}
                onClick={runEvaluation}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5" /> Evaluate Policy
              </button>
              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary rounded-lg transition-all"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Handshake Timeline Nodes */}
          <div className="relative pl-6 border-l-2 border-border-subtle/80 space-y-5">
            {/* Step 1: Request Ingest */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 1 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 1 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 1 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Laptop className="w-4 h-4 text-accent-primary" /> 1. Inbound Request Ingested
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Intercepting client authorization handshake headers.</p>
            </div>

            {/* Step 2: Device & Risk Verification */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 2 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 2 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 2 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" /> 2. Posture & Risk Evaluation
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Auditing local antivirus logs, compliance indicators, and risk score buffers.</p>
            </div>

            {/* Step 3: Location / Network Boundary */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 3 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 3 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 3 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" /> 3. Geolocation & Network Check
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Verifying incoming request IP matches registered Geolocation bounds.</p>
            </div>

            {/* Step 4: Policy Engine Evaluation */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 4 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 4 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 4 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" /> 4. Context Rule matching
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Running current context variables against configured security policy statements.</p>
            </div>
          </div>

          {/* FINAL SECURITY VERDICT OVERLAY */}
          {verdict && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3.5 transition-all ${
              verdict === 'ALLOW' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
              verdict === 'PROMPT_MFA' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' :
              'bg-status-danger/10 border-status-danger/30 text-status-danger'
            }`}>
              {verdict === 'ALLOW' && <ShieldCheck className="w-8 h-8 shrink-0 animate-pulse-slow" />}
              {verdict === 'PROMPT_MFA' && <Key className="w-8 h-8 shrink-0 animate-bounce" />}
              {verdict === 'DENY' && <ShieldAlert className="w-8 h-8 shrink-0 animate-pulse-slow" />}

              <div>
                <span className="block font-black uppercase text-[10px]">
                  Verdict: {verdict.replace(/_/g, ' ')}
                </span>
                <p className="text-[10px] text-text-secondary leading-normal font-semibold mt-0.5">
                  {verdict === 'ALLOW' && 'Logon successful. Gateway generated secure OIDC session token.'}
                  {verdict === 'PROMPT_MFA' && 'Off-Network Finance access detected. Prototyping step-up FaceID verification challenge.'}
                  {verdict === 'DENY' && 'Logon blocked. Security boundary matched high-risk anomalies or infected postures.'}
                </p>
              </div>
            </div>
          )}

          {/* DIAGNOSTIC TERMINAL LOGS */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>Audit Log Trace Terminal</span>
              <span>STATE: {evaluating ? 'EVALUATING' : 'AWAITING'}</span>
            </div>
            <div className="h-28 overflow-y-auto text-emerald-400 space-y-1">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting logon trigger to evaluate policy rules...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.startsWith('[BLOCK]') || log.includes('Access DENIED') ? 'text-red-500 font-bold' :
                    log.startsWith('✔') || log.includes('ACCESS GRANTED') ? 'text-emerald-500 font-bold' :
                    log.startsWith('[WARN]') || log.includes('MFA STEP-UP') ? 'text-purple-400' : ''
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Enterprise Policies configuration (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-accent-primary" /> Active Rule Policies
            </h4>
            <p className="text-[10px] text-text-secondary leading-normal">
              Toggle policy configurations on/off to see how the access decision evaluates:
            </p>

            <div className="space-y-4 pt-2">
              {policies.map(p => (
                <div key={p.id} className="space-y-1.5 bg-bg-nested p-3 rounded-lg border border-border-subtle/50 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-primary leading-tight">{p.name}</span>
                    <button
                      onClick={() => togglePolicy(p.id)}
                      className={`w-7 h-4 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                        p.enabled ? 'bg-accent-primary' : 'bg-border-subtle'
                      }`}
                      aria-label={`Toggle ${p.name}`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        p.enabled ? 'translate-x-3' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[9px] text-text-muted leading-relaxed">
                    {p.desc}
                  </p>
                  <span className="text-[8px] text-text-muted font-bold block font-mono">
                    RULE: {p.condition} ➔ <span className={
                      p.action === 'ALLOW' ? 'text-emerald-500' : p.action === 'PROMPT_MFA' ? 'text-purple-500' : 'text-red-500'
                    }>{p.action}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Trust Specs card */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-accent-secondary" /> Architectural Takeaway
            </h4>
            <p>
              Under <strong className="text-text-primary">NIST SP 800-207 Zero Trust Architecture</strong>, all requests are implicitly untrusted. Decision nodes act as a PDP (Policy Decision Point) checking static, attribute-based context parameters before delegating session grants to PEP (Policy Enforcement Point) gateways.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
