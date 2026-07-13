import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Server,
  Settings,
  Lock,
} from 'lucide-react'

export default function GpoSimulator() {
  // GPO Policy States
  const [minPasswordLength, setMinPasswordLength] = useState(12)
  const [lockoutThreshold, setLockoutThreshold] = useState(5)
  const [lockoutDuration, setLockoutDuration] = useState(15) // Minutes
  const [ticketLifetime, setTicketLifetime] = useState(10) // Hours

  // Simulation parameters
  const [passwordInput, setPasswordInput] = useState('MyPass123!')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [handshakeResult, setHandshakeResult] = useState<'success' | 'failed' | 'locked' | null>(null)
  const [generatedTicket, setGeneratedTicket] = useState<Record<string, unknown> | null>(null)

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const resetSimulator = () => {
    setFailedAttempts(0)
    setIsLocked(false)
    setLockoutTimeLeft(0)
    setLogs([])
    setHandshakeResult(null)
    setGeneratedTicket(null)
  }

  // Handle active lockout timer
  useEffect(() => {
    if (!isLocked) return

    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(timer)
          setIsLocked(false)
          setFailedAttempts(0)
          setHandshakeResult(null)
          addLog('🔓 GPO Lockout duration elapsed. Account unlocked automatically.')
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked])

  const attemptLogon = () => {
    if (isLocked) {
      addLog('❌ Logon Rejected: Account is locked. Please wait for GPO lockout duration or contact Domain Admin.')
      setHandshakeResult('locked')
      return
    }

    addLog(`Initiating workstation logon request for user "alice.local"...`)
    
    // Check password length
    if (passwordInput.length < minPasswordLength) {
      const nextFailed = failedAttempts + 1
      addLog(`❌ Security Event 4625: Failed logon attempt. Password length of ${passwordInput.length} violates the Minimum Password Length GPO of ${minPasswordLength} characters.`)
      setFailedAttempts(nextFailed)
      setGeneratedTicket(null)

      if (nextFailed >= lockoutThreshold) {
        setIsLocked(true)
        setLockoutTimeLeft(lockoutDuration)
        addLog(`🚨 Security Event 4740: User account "alice.local" locked out. Failed attempts reached threshold of ${lockoutThreshold}.`)
        setHandshakeResult('locked')
      } else {
        setHandshakeResult('failed')
      }
      return
    }

    // Success logon
    addLog(`✓ Security Event 4624: Account successfully logged on for user "alice.local".`)
    setFailedAttempts(0)
    setHandshakeResult('success')

    const expireDate = new Date()
    expireDate.setHours(expireDate.getHours() + ticketLifetime)

    const ticket = {
      KerberosTGT: {
        ClientName: "alice.local",
        DomainController: "DC01.aboutiam.local",
        LifeSpan: `${ticketLifetime} Hours (GPO Configured)`,
        Expires: expireDate.toLocaleTimeString(),
        EncryptionType: "AES-256-CTS-HMAC-SHA1-96"
      }
    }
    setGeneratedTicket(ticket)
    addLog(`✓ Ticket Granting Ticket (TGT) generated successfully using AES-256 cipher encryption. Expires: ${expireDate.toLocaleTimeString()}.`)
  }

  // CIS / NIST Baseline Audit Engine
  const auditResults = useMemo(() => {
    const findings: { rule: string; ok: boolean; desc: string }[] = []
    let score = 100

    // 1. Password Length
    if (minPasswordLength < 14) {
      score -= 25
      findings.push({
        rule: 'Minimum Password Length',
        ok: false,
        desc: `Weak length (${minPasswordLength}). CIS/NIST baseline mandates >= 14 characters for domain administrators.`
      })
    } else {
      findings.push({
        rule: 'Minimum Password Length',
        ok: true,
        desc: `Secure length (${minPasswordLength}). Meets CIS and NIST SP 800-63B guidelines.`
      })
    }

    // 2. Lockout Threshold
    if (lockoutThreshold === 0) {
      score -= 30
      findings.push({
        rule: 'Account Lockout Threshold',
        ok: false,
        desc: 'Disabled! High risk: vulnerable to infinite automated brute-force attempts.'
      })
    } else if (lockoutThreshold > 10) {
      score -= 15
      findings.push({
        rule: 'Account Lockout Threshold',
        ok: false,
        desc: `High threshold (${lockoutThreshold}). Baseline mandates locking out after 3–10 consecutive attempts.`
      })
    } else {
      findings.push({
        rule: 'Account Lockout Threshold',
        ok: true,
        desc: `Secure threshold (${lockoutThreshold} attempts). Properly mitigates automated password sprays.`
      })
    }

    // 3. Lockout Duration
    if (lockoutDuration < 15) {
      score -= 20
      findings.push({
        rule: 'Account Lockout Duration',
        ok: false,
        desc: `Too short (${lockoutDuration} mins). CIS baseline mandates >= 15 minutes to allow admin response.`
      })
    } else {
      findings.push({
        rule: 'Account Lockout Duration',
        ok: true,
        desc: `Secure duration (${lockoutDuration} mins). Complies with CIS Security controls.`
      })
    }

    // 4. Ticket Lifetime
    if (ticketLifetime > 10) {
      score -= 15
      findings.push({
        rule: 'Kerberos TGT Max Lifetime',
        ok: false,
        desc: `Excessive lifetime (${ticketLifetime} hrs). Increases exposure window for Golden Ticket exploits.`
      })
    } else {
      findings.push({
        rule: 'Kerberos TGT Max Lifetime',
        ok: true,
        desc: `Secure lifetime (${ticketLifetime} hrs). Properly caps compromise window durations.`
      })
    }

    // Grade calculation
    let grade = 'A'
    if (score < 50) grade = 'F'
    else if (score < 70) grade = 'D'
    else if (score < 85) grade = 'C'
    else if (score < 95) grade = 'B'

    return { score, grade, findings }
  }, [minPasswordLength, lockoutThreshold, lockoutDuration, ticketLifetime])

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Server className="w-4 h-4" /> Active Directory Admin
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            Active Directory GPO Baseline Auditor
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Configure standard Active Directory Group Policy Objects (GPO) and audit security baselines dynamically against CIS Benchmarks and NIST SP 800-53 requirements.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: GPO Editor & Authentication Board (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> GPO Policy Configuration
            </span>

            <div className="space-y-4 text-xs font-bold">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-text-muted uppercase">
                  <span>Minimum Password Length</span>
                  <span className="text-text-primary">{minPasswordLength} Characters</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="20"
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                  className="w-full accent-accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-text-muted uppercase">
                  <span>Lockout Threshold</span>
                  <span className="text-text-primary">{lockoutThreshold === 0 ? 'Disabled' : `${lockoutThreshold} Attempts`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={lockoutThreshold}
                  onChange={(e) => setLockoutThreshold(Number(e.target.value))}
                  className="w-full accent-accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-text-muted uppercase">
                  <span>Lockout Duration</span>
                  <span className="text-text-primary">{lockoutDuration} Minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(Number(e.target.value))}
                  className="w-full accent-accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-text-muted uppercase">
                  <span>Kerberos TGT Max Lifetime</span>
                  <span className="text-text-primary">{ticketLifetime} Hours</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={ticketLifetime}
                  onChange={(e) => setTicketLifetime(Number(e.target.value))}
                  className="w-full accent-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Test Logon Authentication Board */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle pb-1.5">
              🔑 Logon Authentication Test
            </span>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label htmlFor="pass-test-box" className="block text-[10px] font-bold text-text-muted uppercase">Alice's Password</label>
                <input
                  id="pass-test-box"
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isLocked}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={attemptLogon}
                  className="flex-grow py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-black shadow transition"
                >
                  Attempt Kerberos Logon
                </button>
                <button
                  type="button"
                  onClick={resetSimulator}
                  className="px-4 py-2.5 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle rounded-lg text-xs font-bold text-text-secondary transition"
                >
                  ResetDC
                </button>
              </div>

              {/* Logon Result Alert */}
              {handshakeResult && (
                <div className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                  handshakeResult === 'success' ? 'bg-status-success/10 border-status-success/30 text-status-success' :
                  handshakeResult === 'locked' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger animate-pulse' :
                  'bg-status-warning/10 border-status-warning/30 text-status-warning'
                }`}>
                  {handshakeResult === 'success' ? <ShieldCheck className="w-4.5 h-4.5" /> : <ShieldAlert className="w-4.5 h-4.5" />}
                  {handshakeResult === 'success' ? 'LOGON APPROVED: Kerberos ticket granted.' :
                   handshakeResult === 'locked' ? `ACCOUNT LOCKED OUT: Wait ${lockoutTimeLeft}s.` :
                   `LOGON FAILED: Violates active GPO policies.`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CIS Baseline Audit Results & Logs (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Audit Grade Card */}
          <div className="p-6 bg-bg-card border border-border-subtle rounded-xl shadow-lg space-y-5">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <span className="text-[10px] font-black text-text-muted uppercase block">
                CIS & NIST GPO Security Audit Scorecard
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-muted uppercase">Grade:</span>
                <span className={`text-2xl font-black ${
                  auditResults.grade === 'A' ? 'text-status-success' :
                  auditResults.grade === 'B' ? 'text-accent-secondary' :
                  auditResults.grade === 'C' ? 'text-status-warning' : 'text-status-danger'
                }`}>{auditResults.grade}</span>
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {auditResults.findings.map((f, idx) => (
                <div key={idx} className="p-3 bg-bg-base border border-border-subtle rounded-xl flex items-start gap-3 text-xs leading-normal">
                  {f.ok ? (
                    <ShieldCheck className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className={`font-black uppercase text-[9px] tracking-wider block ${f.ok ? 'text-status-success' : 'text-status-danger'}`}>
                      {f.rule} (Audit: {f.ok ? 'PASS' : 'WARNING'})
                    </span>
                    <p className="text-text-secondary mt-0.5 font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Viewer & Active Logs */}
          {generatedTicket && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-2 animate-fadeIn">
              <span className="text-xs font-black text-text-primary flex items-center gap-2"><Lock className="w-4 h-4 text-accent-secondary" /> Issued Kerberos TGT (Ticket-Granting-Ticket)</span>
              <pre className="text-[9px] font-mono text-text-secondary bg-bg-nested p-3 rounded border border-border-subtle/50 whitespace-pre-wrap max-h-32 overflow-auto">
                {JSON.stringify(generatedTicket, null, 2)}
              </pre>
            </div>
          )}

          {/* Active Logs Terminal */}
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Domain Controller Event logs
            </span>

            <div className="h-28 overflow-y-auto text-emerald-400 space-y-1 mt-3 pr-1 leading-relaxed">
              {logs.length === 0 ? (
                <span className="text-zinc-600 italic select-none">Awaiting logon attempts…</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('Security Event 4624') || log.includes('unlocked') ? 'text-status-success font-black' :
                    log.includes('Security Event 4625') ? 'text-status-warning' :
                    log.includes('Security Event 4740') ? 'text-status-danger font-black animate-pulse' : ''
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
  )
}
