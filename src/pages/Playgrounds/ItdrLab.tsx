import { useState } from 'react'
import { Shield, ShieldAlert, RotateCcw, Sliders, Eye } from 'lucide-react'

interface LogEntry {
  time: string
  ip: string
  geo: string
  user: string
  event: string
  severity: 'low' | 'medium' | 'high'
}

export default function ItdrLab() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '10:12:01', ip: '198.51.100.42', geo: 'San Francisco, CA', user: 'mayank@company.com', event: 'Successful console login via Okta', severity: 'low' },
    { time: '10:12:15', ip: '198.51.100.42', geo: 'San Francisco, CA', user: 'mayank@company.com', event: 'Token request for payment-service API', severity: 'low' }
  ])

  // Active mitigations
  const [ipBlocked, setIpBlocked] = useState(false)
  const [sessionRevoked, setSessionRevoked] = useState(false)
  const [numberMatching, setNumberMatching] = useState(false)
  const [recoveryStepUp, setRecoveryStepUp] = useState(false)
  const [dormantFreeze, setDormantFreeze] = useState(false)

  // Simulation Status
  const [activeAlert, setActiveAlert] = useState<string | null>(null)
  const [logsTerminal, setLogsTerminal] = useState<string[]>([
    `[SOC] ITDR log monitoring initialized...`,
    `[SOC] Analyzing inbound authentication signals... Status: Healthy.`
  ])

  // Trigger Attacks
  const triggerAttack = (type: 'impossible_travel' | 'push_fatigue' | 'brute_force' | 'sim_swap' | 'dormant_account') => {
    setActiveAlert(null)

    if (type === 'impossible_travel') {
      const newEntries: LogEntry[] = [
        { time: '10:14:01', ip: '198.51.100.42', geo: 'San Francisco, CA', user: 'alice@company.com', event: 'Successful console login via mTLS', severity: 'low' },
        { time: '10:15:05', ip: '203.0.113.88', geo: 'Sofia, Bulgaria', user: 'alice@company.com', event: 'Console login attempt', severity: 'high' }
      ]
      setLogs(prev => [...newEntries, ...prev])
      setLogsTerminal(prev => [
        ...prev,
        `🚨 ITDR ALERT: Impossible travel velocity triggered! User 'alice@company.com' attempted login from Sofia, Bulgaria 64 seconds after San Francisco, CA.`,
        ipBlocked 
          ? `[SHIELD] Bulgaria request IP '203.0.113.88' matched IP-BLOCK list. Request REJECTED! ✔`
          : `🚨 SECURITY BREACH: Access GRANTED to attacker! Session established from malicious proxy.`
      ])
      if (!ipBlocked) {
        setActiveAlert('IMPOSSIBLE_TRAVEL')
      }
    }

    if (type === 'push_fatigue') {
      const newEntries: LogEntry[] = Array.from({ length: 8 }).map((_, i) => ({
        time: `10:16:0${i}`,
        ip: '203.0.113.88',
        geo: 'Sofia, Bulgaria',
        user: 'admin@company.com',
        event: `MFA Push Notification Sent (Attempt ${i + 1}/10)`,
        severity: 'medium'
      }))
      setLogs(prev => [...newEntries, ...prev])
      setLogsTerminal(prev => [
        ...prev,
        `🚨 ITDR ALERT: Extreme MFA Push notifications loop triggered! 8 spam requests sent in 10s targeting 'admin@company.com'.`,
        numberMatching
          ? `[SHIELD] Number Matching MFA is active. Attacker cannot approve push! Push loop TIMED-OUT. ✔`
          : `🚨 SECURITY BREACH: Victim succumbed to push bombing and clicked APPROVE! Session HIJACKED.`
      ])
      if (!numberMatching) {
        setActiveAlert('PUSH_FATIGUE')
      }
    }

    if (type === 'brute_force') {
      const newEntries: LogEntry[] = Array.from({ length: 10 }).map((_, i) => ({
        time: `10:18:1${i}`,
        ip: '203.0.113.99',
        geo: 'Sofia, Bulgaria (Proxy)',
        user: 'bob@company.com',
        event: `Failed credential authorization (Error code: 0x99a)`,
        severity: 'high'
      }))
      setLogs(prev => [...newEntries, ...prev])
      setLogsTerminal(prev => [
        ...prev,
        `🚨 ITDR ALERT: Brute-Force credential attack in progress. 10 rapid failed logins from '203.0.113.99'.`,
        sessionRevoked
          ? `[SHIELD] Smart lockout triggered. Account 'bob@company.com' locked dynamically. ✔`
          : `🚨 SECURITY BREACH: Password guessed successfully! Bob's account compromised.`
      ])
      if (!sessionRevoked) {
        setActiveAlert('BRUTE_FORCE')
      }
    }

    if (type === 'sim_swap') {
      const newEntries: LogEntry[] = [
        { time: '10:20:02', ip: '198.51.100.204', geo: 'Unknown Carrier Route', user: 'jordan@company.com', event: 'SMS-based account recovery requested — phone number recently re-provisioned to a new SIM', severity: 'high' }
      ]
      setLogs(prev => [...newEntries, ...prev])
      setLogsTerminal(prev => [
        ...prev,
        `🚨 ITDR ALERT: SIM-swap / MFA recovery abuse detected! 'jordan@company.com' triggered an SMS recovery code request immediately after their number was re-provisioned to an unrecognized carrier route.`,
        recoveryStepUp
          ? `[SHIELD] Recovery-Flow Step-Up Verification is active. SMS-only recovery rejected pending email confirmation + cool-down. Reset BLOCKED. ✔`
          : `🚨 SECURITY BREACH: Password reset approved on SMS code alone! Attacker now controls the account recovery flow.`
      ])
      if (!recoveryStepUp) {
        setActiveAlert('SIM_SWAP')
      }
    }

    if (type === 'dormant_account') {
      const newEntries: LogEntry[] = [
        { time: '10:22:07', ip: '203.0.113.140', geo: 'Sofia, Bulgaria (Proxy)', user: 'contractor.smith@company.com', event: 'Dormant account (last login: 214 days ago) authenticated and requested access to the finance file share', severity: 'high' }
      ]
      setLogs(prev => [...newEntries, ...prev])
      setLogsTerminal(prev => [
        ...prev,
        `🚨 ITDR ALERT: Dormant account reactivation detected! 'contractor.smith@company.com' had no login for 214 days — offboarding likely missed revoking its entitlements — and just authenticated from an unrecognized proxy IP.`,
        dormantFreeze
          ? `[SHIELD] Dormant-Account Access Freeze is active. Accounts idle beyond the threshold are auto-disabled pending manager re-approval. Login BLOCKED. ✔`
          : `🚨 SECURITY BREACH: Stale entitlements from a missed offboarding let the attacker walk straight into the finance share!`
      ])
      if (!dormantFreeze) {
        setActiveAlert('DORMANT_REACTIVATION')
      }
    }
  }

  // Handle mitigation toggle changes
  const applyMitigation = (type: 'ip' | 'session' | 'mfa' | 'recovery' | 'dormant') => {
    if (type === 'ip') {
      setIpBlocked(!ipBlocked)
      setLogsTerminal(p => [...p, `[SOC] Geoblocking and IP lockout for Bulgarian proxy ranges ${!ipBlocked ? 'ENABLED' : 'DISABLED'}.`])
      if (!ipBlocked && activeAlert === 'IMPOSSIBLE_TRAVEL') {
        setActiveAlert(null)
        setLogsTerminal(p => [...p, `✔ Impossible travel attack neutralized via IP geoblock! session secured.`])
      }
    }
    if (type === 'session') {
      setSessionRevoked(!sessionRevoked)
      setLogsTerminal(p => [...p, `[SOC] Smart account lockout and token revocation threshold ${!sessionRevoked ? 'ENABLED' : 'DISABLED'}.`])
      if (!sessionRevoked && activeAlert === 'BRUTE_FORCE') {
        setActiveAlert(null)
        setLogsTerminal(p => [...p, `✔ Brute force neutralized. Compromised user bob session keys revoked globally.`])
      }
    }
    if (type === 'mfa') {
      setNumberMatching(!numberMatching)
      setLogsTerminal(p => [...p, `[SOC] Mandatory MFA Number Matching rules ${!numberMatching ? 'ENABLED' : 'DISABLED'}.`])
      if (!numberMatching && activeAlert === 'PUSH_FATIGUE') {
        setActiveAlert(null)
        setLogsTerminal(p => [...p, `✔ Push fatigue bypass neutralized. Number matching blocks push hijacking!`])
      }
    }
    if (type === 'recovery') {
      setRecoveryStepUp(!recoveryStepUp)
      setLogsTerminal(p => [...p, `[SOC] Recovery-Flow Step-Up Verification (email confirmation + cool-down on SMS-based resets) ${!recoveryStepUp ? 'ENABLED' : 'DISABLED'}.`])
      if (!recoveryStepUp && activeAlert === 'SIM_SWAP') {
        setActiveAlert(null)
        setLogsTerminal(p => [...p, `✔ SIM-swap recovery abuse neutralized. SMS-only resets can no longer bypass account recovery step-up.`])
      }
    }
    if (type === 'dormant') {
      setDormantFreeze(!dormantFreeze)
      setLogsTerminal(p => [...p, `[SOC] Dormant-Account Access Freeze (auto-disable after inactivity threshold) ${!dormantFreeze ? 'ENABLED' : 'DISABLED'}.`])
      if (!dormantFreeze && activeAlert === 'DORMANT_REACTIVATION') {
        setActiveAlert(null)
        setLogsTerminal(p => [...p, `✔ Dormant account reactivation neutralized. Idle accounts are frozen until a manager re-approves them.`])
      }
    }
  }

  const handleReset = () => {
    setLogs([
      { time: '10:12:01', ip: '198.51.100.42', geo: 'San Francisco, CA', user: 'mayank@company.com', event: 'Successful console login via Okta', severity: 'low' },
      { time: '10:12:15', ip: '198.51.100.42', geo: 'San Francisco, CA', user: 'mayank@company.com', event: 'Token request for payment-service API', severity: 'low' }
    ])
    setIpBlocked(false)
    setSessionRevoked(false)
    setNumberMatching(false)
    setRecoveryStepUp(false)
    setDormantFreeze(false)
    setActiveAlert(null)
    setLogsTerminal([
      `[SOC] ITDR log monitoring initialized...`,
      `[SOC] Analyzing inbound authentication signals... Status: Healthy.`
    ])
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Eye className="w-3.5 h-3.5" /> Security Operations Playground
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Identity Threat Detection & Response (ITDR) Lab
        </h2>
        <p className="text-text-secondary">
          Simulate logs monitoring, detect malicious authentication signals, and trigger real-time SecOps response plans. Inject attacks like Impossible Travel, MFA Push Fatigue, and Brute-force queries, and activate dynamic perimeter controls to secure corporate directory domains.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Attack Injectors (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-status-danger animate-pulse" /> Threat Injector Panel
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Click any button below to trigger a live identity-based security attack:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => triggerAttack('impossible_travel')}
                className="w-full py-2.5 px-3 rounded-lg border border-border-subtle hover:border-status-danger bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center justify-between text-xs text-text-primary font-bold"
              >
                <span>Impossible Travel Velocity</span>
                <span className="text-[8px] uppercase bg-status-danger/10 text-status-danger font-bold px-1.5 py-0.5 rounded">High Severity</span>
              </button>

              <button
                onClick={() => triggerAttack('push_fatigue')}
                className="w-full py-2.5 px-3 rounded-lg border border-border-subtle hover:border-status-danger bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center justify-between text-xs text-text-primary font-bold"
              >
                <span>MFA Push Fatigue / Bombing</span>
                <span className="text-[8px] uppercase bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.5 rounded">Medium Severity</span>
              </button>

              <button
                onClick={() => triggerAttack('brute_force')}
                className="w-full py-2.5 px-3 rounded-lg border border-border-subtle hover:border-status-danger bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center justify-between text-xs text-text-primary font-bold"
              >
                <span>Credential Brute-Force Spray</span>
                <span className="text-[8px] uppercase bg-status-danger/10 text-status-danger font-bold px-1.5 py-0.5 rounded">High Severity</span>
              </button>

              <button
                onClick={() => triggerAttack('sim_swap')}
                className="w-full py-2.5 px-3 rounded-lg border border-border-subtle hover:border-status-danger bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center justify-between text-xs text-text-primary font-bold"
              >
                <span>SIM-Swap / MFA Recovery Abuse</span>
                <span className="text-[8px] uppercase bg-status-danger/10 text-status-danger font-bold px-1.5 py-0.5 rounded">High Severity</span>
              </button>

              <button
                onClick={() => triggerAttack('dormant_account')}
                className="w-full py-2.5 px-3 rounded-lg border border-border-subtle hover:border-status-danger bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center justify-between text-xs text-text-primary font-bold"
              >
                <span>Dormant Account Reactivation</span>
                <span className="text-[8px] uppercase bg-status-danger/10 text-status-danger font-bold px-1.5 py-0.5 rounded">High Severity</span>
              </button>
            </div>
          </div>

          {/* Defensive Mitigations */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent-primary" /> Active SecOps Responses
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Activate security policy mitigations dynamically to block incoming breaches:
            </p>

            <div className="space-y-3 pt-1">
              {/* Geoblocking */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Geoblock Malicious IPs</span>
                  <span className="text-[8px] text-text-muted block">Lock out Sofia proxy IP ranges</span>
                </div>
                <button
                  onClick={() => applyMitigation('ip')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    ipBlocked ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle Geoblock"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    ipBlocked ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Number Matching */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Enforce Number Matching</span>
                  <span className="text-[8px] text-text-muted block">Defeat MFA push approval bombing</span>
                </div>
                <button
                  onClick={() => applyMitigation('mfa')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    numberMatching ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle Number Matching"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    numberMatching ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Session Lockout */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Smart Account Lockout</span>
                  <span className="text-[8px] text-text-muted block">Revoke session on credential spray</span>
                </div>
                <button
                  onClick={() => applyMitigation('session')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    sessionRevoked ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle Session Lockout"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    sessionRevoked ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Recovery-Flow Step-Up */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Recovery-Flow Step-Up</span>
                  <span className="text-[8px] text-text-muted block">Defeat SIM-swap MFA recovery abuse</span>
                </div>
                <button
                  onClick={() => applyMitigation('recovery')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    recoveryStepUp ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle Recovery-Flow Step-Up"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    recoveryStepUp ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Dormant Account Freeze */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Dormant Account Freeze</span>
                  <span className="text-[8px] text-text-muted block">Auto-disable stale idle accounts</span>
                </div>
                <button
                  onClick={() => applyMitigation('dormant')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    dormantFreeze ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle Dormant Account Freeze"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    dormantFreeze ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Active logs feed monitor (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-accent-primary animate-pulse" /> Live Authentication log stream
            </h3>
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-bg-card hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Active Log Feed rows */}
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-inner h-[380px] overflow-y-auto space-y-2.5">
            {logs.map((log, index) => (
              <div key={index} className={`p-3 rounded-lg border text-[10px] leading-relaxed transition-all ${
                log.severity === 'high' ? 'bg-status-danger/5 border-status-danger/20 text-text-secondary' :
                log.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20 text-text-secondary' : 'bg-bg-nested border-border-subtle/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-muted font-bold">{log.time}</span>
                    <span className="font-semibold text-text-primary truncate max-w-[120px]">{log.user}</span>
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded ${
                    log.severity === 'high' ? 'bg-status-danger/10 text-status-danger' :
                    log.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-bg-card text-text-muted border border-border-subtle'
                  }`}>
                    {log.severity}
                  </span>
                </div>
                <div className="font-mono text-[9px] text-text-muted mt-1">IP: {log.ip} ({log.geo})</div>
                <p className="text-[10px] text-text-secondary font-semibold mt-1 leading-normal">
                  {log.event}
                </p>
              </div>
            ))}
          </div>

          {/* ALERTS POPUP BAR */}
          {activeAlert && (
            <div className="p-4 rounded-2xl border border-status-danger/30 bg-status-danger/10 text-xs font-bold text-status-danger flex items-center gap-3 animate-bounce">
              <ShieldAlert className="w-8 h-8 shrink-0 animate-pulse" />
              <div>
                <span className="block font-black uppercase text-[10px]">Breach Alert: {activeAlert.replace(/_/g, ' ')}</span>
                <p className="text-[10px] text-text-secondary font-medium leading-normal mt-0.5">
                  Attacker compromised user domain. Enable response mitigations to terminate credentials dynamically!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ITDR Logging console (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2.5 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>ITDR Trace Console</span>
              <span>STATE: ACTIVE</span>
            </div>
            <div className="h-44 overflow-y-auto text-emerald-400 space-y-1.5 pr-1 select-text">
              {logsTerminal.map((log, idx) => (
                <div key={idx} className={
                  log.startsWith('🚨') || log.includes('BREACH') ? 'text-red-500 font-bold' :
                  log.startsWith('[SHIELD]') || log.startsWith('✔') ? 'text-emerald-500 font-bold' :
                  log.startsWith('[SOC]') ? 'text-blue-400' : ''
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* ITDR Concept Takeaway */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5 font-sans">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-secondary" /> ITDR Definition
            </h4>
            <p>
              <strong className="text-text-primary">Identity Detection and Response (ITDR)</strong> is a critical cybersecurity discipline focused on protecting identity infrastructure (such as Active Directory and IdPs) from credential abuse, privilege escalations, and session hijacking. Unlike endpoint detection (EDR), ITDR audits authentication behavior profiles directly.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
