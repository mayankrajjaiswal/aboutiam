import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Network, ArrowRight, ShieldCheck, ShieldAlert, 
  Terminal, Server, Settings, Lock
} from 'lucide-react'

export default function GpoSimulator() {
  // GPO Policy States
  const [minPasswordLength, setMinPasswordLength] = useState(12)
  const [lockoutThreshold, setLockoutThreshold] = useState(5)
  const [lockoutDuration, setLockoutDuration] = useState(30)
  const [ticketLifetime, setTicketLifetime] = useState(10)

  // Simulation parameters
  const [passwordInput, setPasswordInput] = useState('MyPass123!')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [handshakeResult, setHandshakeResult] = useState<'success' | 'failed' | 'locked' | null>(null)
  const [generatedTicket, setGeneratedTicket] = useState<any | null>(null)

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
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
    if (!isLocked || lockoutTimeLeft <= 0) {
      if (isLocked && lockoutTimeLeft === 0) {
        setIsLocked(false)
        setFailedAttempts(0)
        setHandshakeResult(null)
        addLog('🔓 GPO Lockout duration elapsed. Account unlocked automatically.')
      }
      return
    }

    const timer = setInterval(() => {
      setLockoutTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isLocked, lockoutTimeLeft])

  const attemptLogon = () => {
    if (isLocked) {
      addLog('❌ Logon Rejected: Account is locked. Please wait for GPO lockout duration or contact Domain Admin.')
      setHandshakeResult('locked')
      return
    }

    addLog(`Initiating workstation logon request for user "alice.local"...`)
    
    // Check password length policy
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
    addLog(`🎟️ Ticket-Granting Ticket (TGT) generated securely. Lifetime bound to: ${ticketLifetime} hours.`)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Active Directory GPO Security Simulator</h1>
            <p className="text-xs text-text-secondary">Configure group policies, simulate logon events, and observe real-time account lockouts and Kerberos ticket lifespans</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: GPO Policy Editor */}
        <div className="lg:col-span-5 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 border-b border-border-subtle pb-1 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-accent-primary" /> DC Group Policy Editor (GPO)
          </span>

          <p className="text-xs text-text-secondary leading-relaxed">
            Configure default domain policy variables. These active policies are pushed to all domain workstations and domain controllers in the forest.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            {/* Password length */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <span className="text-text-primary">Minimum Password Length</span>
                <span className="text-accent-primary">{minPasswordLength} chars</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="20" 
                value={minPasswordLength} 
                onChange={e => { setMinPasswordLength(Number(e.target.value)); resetSimulator() }}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Lockout threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <span className="text-text-primary">Account Lockout Threshold</span>
                <span className="text-accent-primary">{lockoutThreshold} attempts</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={lockoutThreshold} 
                onChange={e => { setLockoutThreshold(Number(e.target.value)); resetSimulator() }}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Lockout duration */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <span className="text-text-primary">Lockout Duration</span>
                <span className="text-accent-primary">{lockoutDuration} seconds</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="120" 
                value={lockoutDuration} 
                onChange={e => { setLockoutDuration(Number(e.target.value)); resetSimulator() }}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Kerberos ticket lifetime */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <span className="text-text-primary">Max Kerberos Ticket Lifetime</span>
                <span className="text-accent-primary">{ticketLifetime} hours</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="24" 
                value={ticketLifetime} 
                onChange={e => { setTicketLifetime(Number(e.target.value)); resetSimulator() }}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right pane: Workstation & logs */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2.5">
                <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-accent-primary" /> Workstation Logon Client (alice.local)
                </span>
                <button 
                  onClick={resetSimulator}
                  className="text-xs bg-bg-nested text-text-secondary hover:text-text-primary border border-border-subtle px-2.5 py-1.5 rounded transition"
                >
                  Reset Client Status
                </button>
              </div>

              {/* Status Outcome Banner */}
              <div className="mb-4">
                {isLocked && (
                  <div className="p-3.5 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-2.5 animate-fadeIn">
                    <ShieldAlert className="w-5 h-5 text-status-danger shrink-0 mt-0.5 animate-bounce" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold block">ACCOUNT TEMPORARILY LOCKED OUT!</span>
                      Security lockout engaged. Remaining cooldown time: <strong className="font-bold text-status-danger">{lockoutTimeLeft} seconds</strong>.
                    </div>
                  </div>
                )}

                {handshakeResult === 'success' && (
                  <div className="p-3.5 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-2.5 animate-fadeIn">
                    <ShieldCheck className="w-5 h-5 text-status-success shrink-0 mt-0.5 animate-bounce" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold block">LOGON SUCCESSFUL!</span>
                      Workstation unlocked. Secure Kerberos ticket session issued.
                    </div>
                  </div>
                )}

                {handshakeResult === 'failed' && (
                  <div className="p-3.5 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-2.5 animate-fadeIn">
                    <ShieldAlert className="w-5 h-5 text-status-danger shrink-0 mt-0.5 animate-bounce" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold block">LOGON FAILED!</span>
                      Incorrect password. Failed logon attempts: <strong className="font-bold text-status-danger">{failedAttempts} / {lockoutThreshold}</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* Password simulation login form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 border border-border-subtle bg-bg-base rounded-xl mb-4 text-xs font-mono">
                <div className="md:col-span-3 space-y-1.5">
                  <span className="text-text-muted block text-[10px] font-bold uppercase">Enter Password for alice.local</span>
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    disabled={isLocked}
                    className="w-full bg-bg-card border border-border-subtle/80 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-bold font-mono"
                  />
                </div>

                <button
                  onClick={attemptLogon}
                  disabled={isLocked}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border text-center transition flex items-center justify-center gap-1.5 ${isLocked ? 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary'}`}
                >
                  <Lock className="w-3.5 h-3.5" /> Logon
                </button>
              </div>

              {/* Ticket payload visualization */}
              {generatedTicket && (
                <div className="mt-4 border border-border-subtle bg-bg-base p-4 rounded-xl animate-fadeIn">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2 font-mono">Active Ticket-Granting Ticket (TGT)</span>
                  <pre className="text-[10px] font-mono text-accent-secondary overflow-x-auto leading-normal">
                    {JSON.stringify(generatedTicket, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Simulated DC command logs */}
            <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-xs text-text-primary h-36 overflow-y-auto mt-4 leading-normal">
              <div className="flex items-center gap-1.5 border-b border-border-subtle pb-1.5 mb-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" /> Domain Controller Security Audit Logs
              </div>
              {logs.length === 0 ? (
                <span className="text-text-muted italic select-none">Console ready. Perform logon events on the left to start recording Security Event log codes.</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed text-text-secondary">
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
