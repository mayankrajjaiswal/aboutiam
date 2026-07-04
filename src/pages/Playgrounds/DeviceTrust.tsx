import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Play, RotateCcw, Sliders, Laptop, Lock, Globe, AlertTriangle } from 'lucide-react'

export default function DeviceTrust() {
  // Client device properties
  const [osVersion, setOsVersion] = useState<'Sequoia' | 'HighSierra'>('Sequoia')
  const [firewall, setFirewall] = useState<boolean>(true)
  const [encryption, setEncryption] = useState<boolean>(true)
  const [mtlsCert, setMtlsCert] = useState<'valid' | 'expired' | 'missing'>('valid')

  // Simulation State
  const [evaluating, setEvaluating] = useState(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])
  const [verdict, setVerdict] = useState<'trusted' | 'untrusted' | null>(null)
  const [remediations, setRemediations] = useState<string[]>([])

  const handleSimulate = () => {
    setEvaluating(true)
    setActiveStep(1)
    setVerdict(null)
    setRemediations([])
    setLogs([
      `[GATEWAY] Inbound TLS client-hello initiated...`,
      `[GATEWAY] Requesting client mTLS certificate...`
    ])

    // Step 1: Certificate Handshake (1000ms)
    setTimeout(() => {
      setActiveStep(2)
      
      if (mtlsCert === 'missing') {
        setLogs(prev => [
          ...prev,
          `🚨 mTLS HANDSHAKE FAILED: Client presented NO certificate.`,
          `[GATEWAY] Connection aborted! HTTP 400 Bad Request.`
        ])
        setVerdict('untrusted')
        setRemediations(['Install valid Enterprise Client Certificate via MDM profile.'])
        setEvaluating(false)
        return
      }

      if (mtlsCert === 'expired') {
        setLogs(prev => [
          ...prev,
          `🚨 mTLS HANDSHAKE FAILED: Client presented an EXPIRED certificate (Exp: 2025-06-15).`,
          `[GATEWAY] Connection aborted! HTTP 400 Bad Request.`
        ])
        setVerdict('untrusted')
        setRemediations(['Renew expired Client Certificate in your corporate settings page.'])
        setEvaluating(false)
        return
      }

      setLogs(prev => [
        ...prev,
        `✔ mTLS Handshake successful. Client certificate verified against Root CA.`,
        `[MDM] Querying device posture parameters for serial 'workstation_99a' ...`
      ])

      // Step 2: MDM Posture Check (1000ms)
      setTimeout(() => {
        setActiveStep(3)
        const failedChecks: string[] = []

        if (osVersion === 'HighSierra') {
          failedChecks.push('Upgrade Operating System to macOS Sequoia (Outdated OS represents kernel vulnerabilities).')
        }
        if (!firewall) {
          failedChecks.push('Enable device Firewall inside your macOS Security & Privacy settings.')
        }
        if (!encryption) {
          failedChecks.push('Turn ON FileVault Disk Encryption to protect local session credentials.')
        }

        setLogs(prev => [
          ...prev,
          `[MDM] OS: ${osVersion === 'Sequoia' ? 'macOS Sequoia (Compliant)' : 'macOS High Sierra (VULNERABLE)'}`,
          `[MDM] Firewall: ${firewall ? 'ENABLED (Compliant)' : 'DISABLED (VULNERABLE)'}`,
          `[MDM] Disk Encryption: ${encryption ? 'FileVault ON (Compliant)' : 'OFF (VULNERABLE)'}`
        ])

        // Step 3: Final Gate decision (1000ms)
        setTimeout(() => {
          setActiveStep(4)
          if (failedChecks.length > 0) {
            setLogs(prev => [
              ...prev,
              `🚨 POSTURE COMPLIANCE CHECK FAILED! ${failedChecks.length} compliance anomalies detected.`,
              `[GATEWAY] Access DENIED! Session blocked.`
            ])
            setVerdict('untrusted')
            setRemediations(failedChecks)
          } else {
            setLogs(prev => [
              ...prev,
              `✔ Posture compliance checks verified. Device serial 'workstation_99a' is fully compliant.`,
              `[GATEWAY] Connection trusted. Issuing scoped OIDC Access Token...`,
              `✔ SUCCESS: Device posture attestation successful! Session ESTABLISHED. 🎉`
            ])
            setVerdict('trusted')
          }
          setEvaluating(false)
        }, 1200)

      }, 1200)
    }, 1200)
  }

  const handleReset = () => {
    setOsVersion('Sequoia')
    setFirewall(true)
    setEncryption(true)
    setMtlsCert('valid')
    setActiveStep(0)
    setVerdict(null)
    setLogs([])
    setRemediations([])
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Laptop className="w-3.5 h-3.5" /> Posture Attestation
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Device Posture & MDM Attestation Lab
        </h2>
        <p className="text-text-secondary">
          Simulate modern endpoint trust handshakes. Toggle device compliance settings (disk encryption, firewall, OS version, and client mTLS certificates), initiate authentication to the corporate gateway, and analyze how MDM posture attestation blocks insecure connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Device Parameters Dashboard (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Workstation Properties
            </h4>

            {/* OS Version */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Operating System Version</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setOsVersion('Sequoia')}
                  className={`py-1.5 rounded-lg border transition-all ${
                    osVersion === 'Sequoia' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                >
                  macOS Sequoia
                </button>
                <button
                  onClick={() => setOsVersion('HighSierra')}
                  className={`py-1.5 rounded-lg border transition-all ${
                    osVersion === 'HighSierra' ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                >
                  macOS High Sierra ⚠️
                </button>
              </div>
            </div>

            {/* Firewall & Encryption */}
            <div className="grid grid-cols-2 gap-4 border-t border-border-subtle/50 pt-4">
              {/* Firewall */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Firewall</span>
                  <span className="text-[8px] text-text-muted block">{firewall ? 'ENABLED' : 'DISABLED'}</span>
                </div>
                <button
                  onClick={() => setFirewall(!firewall)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    firewall ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle Firewall"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    firewall ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Encryption */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">FileVault</span>
                  <span className="text-[8px] text-text-muted block">{encryption ? 'ENCRYPTED' : 'PLAINTEXT'}</span>
                </div>
                <button
                  onClick={() => setEncryption(!encryption)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    encryption ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle FileVault"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    encryption ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* mTLS client cert */}
            <div className="space-y-1 border-t border-border-subtle/50 pt-4">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Client mTLS Certificate</label>
              <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
                {([
                  { id: 'valid', label: 'Valid Cert' },
                  { id: 'expired', label: 'Expired Cert ⚠️' },
                  { id: 'missing', label: 'Missing Cert ⚠️' }
                ]).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setMtlsCert(c.id as any)}
                    className={`py-1.5 rounded-lg border transition-all ${
                      mtlsCert === c.id ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* MIDDLE COLUMN: Handshake Timeline (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">mTLS Attestation Pipeline</h3>
            <div className="flex gap-2">
              <button
                disabled={evaluating}
                onClick={handleSimulate}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow select-none"
              >
                <Play className="w-3.5 h-3.5" /> Authenticate Device
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
            {/* Step 1: mTLS cert */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 1 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 1 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 1 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-primary" /> 1. mTLS Client Certificate Exchange
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Client device presents public mTLS certificate during initial TLS tunnel hello.</p>
            </div>

            {/* Step 2: Posture Check */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 2 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 2 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 2 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" /> 2. Posture Indicators Audit
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Gateway parses connecting serial and queries the registered MDM server state.</p>
            </div>

            {/* Step 3: Final Gate */}
            <div className={`relative transition-all p-3.5 rounded-xl border ${
              activeStep === 3 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'border-transparent bg-bg-nested/40'
            }`}>
              <div className={`absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                activeStep >= 3 ? 'bg-accent-primary border-accent-primary text-white text-[8px]' : 'bg-bg-card border-border-subtle'
              }`}>
                {activeStep >= 3 ? '✔' : ''}
              </div>
              <h5 className="text-xs font-black text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" /> 3. Authorization Gate Evaluation
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">Evaluating if the endpoint compliance satisfies zero trust boundaries.</p>
            </div>
          </div>

          {/* AUDIT LOGGER TERMINAL */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>mTLS Attestation Trace Terminal</span>
              <span>STATE: {evaluating ? 'HANDSHAKING' : 'IDLE'}</span>
            </div>
            <div className="h-28 overflow-y-auto text-emerald-400 space-y-1">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting device authentication to start mTLS simulation...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.startsWith('✔') || log.includes('attestation successful') ? 'text-emerald-500 font-bold' :
                    log.startsWith('🚨') || log.includes('FAILED') ? 'text-red-500 font-bold' :
                    log.startsWith('[MDM]') ? 'text-amber-500' :
                    log.startsWith('[GATEWAY]') ? 'text-purple-400' : ''
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Verdict details (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Final decision verdict card */}
          {verdict && (
            <div className={`p-5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center text-center space-y-2.5 transition-all ${
              verdict === 'trusted' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-pulse-slow' 
                : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
            }`}>
              {verdict === 'trusted' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
              <div>
                <span className="block font-black uppercase text-[10px]">Device Verdict: {verdict.toUpperCase()}</span>
                <span className="block font-medium mt-0.5 text-text-secondary leading-normal">
                  {verdict === 'trusted' ? 'All criteria satisfied. mTLS channel securely authorized.' : 'Posture check rejected. Access blocked!'}
                </span>
              </div>
            </div>
          )}

          {/* Remediation guides card */}
          {remediations.length > 0 && (
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3.5">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-status-danger" /> Required Remediations
              </h4>
              <p className="text-[10px] text-text-secondary leading-normal font-semibold">
                Perform the following actions inside your client settings to achieve compliance:
              </p>

              <div className="space-y-2">
                {remediations.map((rem, i) => (
                  <div key={i} className="p-2.5 rounded bg-status-danger/5 border border-status-danger/10 text-[10px] text-text-secondary leading-relaxed font-mono">
                    • {rem}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educational Specifications */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-accent-secondary" /> Device Posture Definition
            </h4>
            <p>
              In pure Zero Trust environments, a user credential alone is insufficient for access. **Device Posture Attestation** continuously audits client endpoints via MDM agents to verify that firewalls are active, disk storage is encrypted, and corporate client-certificates are present before establishing secure mTLS redirects.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
