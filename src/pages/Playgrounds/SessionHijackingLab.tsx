import { useState } from 'react'
import { 
  Shield, ShieldAlert, ShieldCheck, RotateCcw, 
  Terminal, User, Activity, Copy, Check, Info
} from 'lucide-react'

interface DefenseConfig {
  ipBinding: boolean
  dpopEnforced: boolean
  caepEnabled: boolean
}

export default function SessionHijackingLab() {
  // Victims Session state
  const victimIp = '198.51.100.42'
  const victimGeo = 'San Francisco, CA'
  const victimCookieValue = 'idp_session_alice_jwt_token_active_finance_admin'
  const [copied, setCopied] = useState(false)

  // Attacker state
  const attackerIp = '203.0.113.88'
  const attackerGeo = 'Sofia, Bulgaria'
  const [attackerCookie, setAttackerCookie] = useState('')
  const targetEndpoint = '/api/wire-transfer'
  const [exploitStatus, setExploitStatus] = useState<'idle' | 'exploit_sent' | 'exploit_blocked' | 'exploit_granted'>('idle')

  // Defenses Config
  const [defenses, setDefenses] = useState<DefenseConfig>({
    ipBinding: false,
    dpopEnforced: false,
    caepEnabled: false
  })

  // Diagnostic Logs
  const [logs, setLogs] = useState<string[]>([
    `[SERVER] Session DB initialized. Session '${victimCookieValue.substring(0, 15)}...' registered.`,
    `[SERVER] Awaiting incoming client requests...`
  ])

  // Copy cookie simulation
  const handleCopyCookie = () => {
    navigator.clipboard.writeText(victimCookieValue)
    setCopied(true)
    setLogs(prev => [
      ...prev,
      `[CLIENT] Session Cookie extracted from Victim's Browser Memory via simulated infostealer malware.`
    ])
    setTimeout(() => setCopied(false), 2000)
  }

  // Quick Action: Inject cookie
  const handleInjectCookie = () => {
    setAttackerCookie(victimCookieValue)
    setLogs(prev => [
      ...prev,
      `[ATTACKER] Stolen session cookie injected into Attacker's active HTTP headers.`
    ])
  }

  // Reset Lab
  const handleReset = () => {
    setAttackerCookie('')
    setExploitStatus('idle')
    setDefenses({
      ipBinding: false,
      dpopEnforced: false,
      caepEnabled: false
    })
    setLogs([
      `[SERVER] Session DB initialized. Session '${victimCookieValue.substring(0, 15)}...' registered.`,
      `[SERVER] Awaiting incoming client requests...`
    ])
  }

  // Execute Replay Exploit
  const handleExecuteExploit = () => {
    if (!attackerCookie) {
      setLogs(prev => [...prev, `🚨 ERROR: Cannot execute exploit. No session cookie injected into Attacker Browser!`])
      return
    }

    setExploitStatus('idle')
    setLogs(prev => [
      ...prev,
      `[HTTP] Inbound POST ${targetEndpoint} from IP: ${attackerIp} (${attackerGeo})...`,
      `[HTTP] Header: Cookie [idp_session=${attackerCookie.substring(0, 12)}...]`
    ])

    setTimeout(() => {
      // Evaluate Defenses
      if (defenses.caepEnabled) {
        setExploitStatus('exploit_blocked')
        setLogs(prev => [
          ...prev,
          `[CAEP] Querying continuous signal provider...`,
          `[CAEP] SECURITY EVENT RECEIVED: Victim device marked COMPROMISED.`,
          `[CAEP] Revoking session token globally: '${victimCookieValue.substring(0, 15)}...'`,
          `🚨 ATTACK BLOCKED: Session dynamically terminated via Continuous Access Evaluation! HTTP 401 Unauthorized.`
        ])
        return
      }

      if (defenses.dpopEnforced) {
        setExploitStatus('exploit_blocked')
        setLogs(prev => [
          ...prev,
          `[GATEWAY] Checking DPoP (Demonstrating Proof-of-Possession) token proof...`,
          `[GATEWAY] Request lacks valid asymmetric cryptographic signature signed by Client Private Key.`,
          `🚨 ATTACK BLOCKED: Replay failed. Attacker does not possess Victim's browser-bound private key! HTTP 400 Bad Request.`
        ])
        return
      }

      if (defenses.ipBinding) {
        setExploitStatus('exploit_blocked')
        setLogs(prev => [
          ...prev,
          `[GATEWAY] Matching incoming request IP: ${attackerIp} against session IP: ${victimIp}...`,
          `[GATEWAY] IP MISMATCH DETECTED! Anomalous geolocation change: San Francisco, CA -> Sofia, Bulgaria.`,
          `🚨 ATTACK BLOCKED: Cookie binding check failed. Request blocked! HTTP 403 Forbidden.`
        ])
        return
      }

      // If no defenses are active: ACCESS GRANTED!
      setExploitStatus('exploit_granted')
      setLogs(prev => [
        ...prev,
        `[SERVER] Token verified. Session matched active database entry.`,
        `[SERVER] Identity verified: Alice Smith (Finance Admin)`,
        `💸 EXPLOIT SUCCESSFUL: Request authorized! Action GET/POST ${targetEndpoint} executed. Transferring $250,000 to hacker vault!`
      ])
    }, 1500)
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Activity className="w-3.5 h-3.5" /> Threat Simulator
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Session Hijacking & Token Theft Lab
        </h2>
        <p className="text-text-secondary">
          Understand how attackers bypass credentials and Multi-Factor Authentication (MFA) entirely by stealing active session cookies. Execute a cookie replay exploit, observe how easily session hijackings succeed, and toggle enterprise defenses (DPoP, IP-binding, and CAEP) to secure the perimeter.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Dual Browser Simulation & Attacker Dashboard (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Victim Browser vs. Attacker Browser emulators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Victim Browser Emulator */}
            <div className="rounded-2xl border border-border-subtle bg-bg-card shadow-sm overflow-hidden flex flex-col justify-between min-h-[340px]">
              {/* Browser Window Header */}
              <div className="px-4 py-3 bg-bg-sidebar border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted select-none">Employee Browser (Victim)</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-wider">
                  MFA Authenticated
                </span>
              </div>

              {/* Victim Browser Body */}
              <div className="p-5 flex-grow space-y-4">
                <div className="p-3.5 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-text-primary leading-tight">Alice Smith</span>
                      <span className="block text-[10px] text-text-muted mt-0.5">Finance Director • admin_scope</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div>
                      <span className="block text-text-muted font-bold uppercase text-[8px]">Request IP</span>
                      <span className="block text-text-secondary font-mono font-semibold">{victimIp}</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-bold uppercase text-[8px]">Location</span>
                      <span className="block text-text-secondary font-semibold">{victimGeo}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold block uppercase">Session Cookie (`idp_session`)</label>
                  <div className="p-2.5 rounded-lg bg-bg-nested border border-border-subtle font-mono text-[10px] text-text-secondary break-all select-all flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{victimCookieValue}</span>
                    <button
                      onClick={handleCopyCookie}
                      className="p-1 hover:bg-bg-sidebar rounded text-text-muted hover:text-text-primary shrink-0 transition-all flex items-center gap-1"
                      title="Simulate Infostealer / HAR Extraction"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border-subtle bg-bg-nested/40 flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Awaiting Employee action...</span>
                <button
                  onClick={handleCopyCookie}
                  className="px-3 py-1.5 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger hover:text-status-danger-hover border border-status-danger/20 text-xs font-black uppercase rounded-lg transition-all"
                >
                  Steal Cookie (HAR / malware)
                </button>
              </div>
            </div>

            {/* Attacker Browser Emulator */}
            <div className="rounded-2xl border border-border-subtle bg-bg-card shadow-sm overflow-hidden flex flex-col justify-between min-h-[340px]">
              {/* Browser Window Header */}
              <div className="px-4 py-3 bg-bg-sidebar border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted select-none">Hacker Browser (Attacker)</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  attackerCookie ? 'bg-amber-500/10 text-amber-500' : 'bg-status-danger/10 text-status-danger'
                }`}>
                  {attackerCookie ? 'Cookie Injected' : 'Unauthenticated'}
                </span>
              </div>

              {/* Attacker Browser Body */}
              <div className="p-5 flex-grow space-y-4">
                <div className="p-3.5 rounded-xl bg-status-danger/5 border border-status-danger/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-status-danger/10 text-status-danger flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-text-primary leading-tight">Anonymous Attacker</span>
                      <span className="block text-[10px] text-text-muted mt-0.5">Infostealer operator / Session Replay</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div>
                      <span className="block text-text-muted font-bold uppercase text-[8px]">Request IP</span>
                      <span className="block text-text-secondary font-mono font-semibold">{attackerIp}</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-bold uppercase text-[8px]">Location</span>
                      <span className="block text-text-secondary font-semibold">{attackerGeo}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold block uppercase" htmlFor="hacker-cookie-input">Active Cookie Injector (`idp_session`)</label>
                  <div className="flex gap-2">
                    <input 
                      id="hacker-cookie-input"
                      type="text" 
                      value={attackerCookie} 
                      onChange={(e) => setAttackerCookie(e.target.value)}
                      placeholder="Paste stolen session cookie..."
                      className="flex-grow px-3 py-1.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      onClick={handleInjectCookie}
                      className="px-2.5 py-1 rounded bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary hover:text-text-primary text-[10px] font-black uppercase transition-all shrink-0"
                    >
                      Auto-Inject
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border-subtle bg-bg-nested/40 flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Awaiting exploit submission...</span>
                <button
                  disabled={!attackerCookie}
                  onClick={handleExecuteExploit}
                  className="px-4 py-1.5 bg-status-danger hover:bg-status-danger-hover disabled:opacity-40 text-white text-xs font-black uppercase rounded-lg transition-all"
                >
                  Replay Exploitative Request
                </button>
              </div>
            </div>

          </div>

          {/* Visual Exploit Response Status Alert */}
          {exploitStatus !== 'idle' && (
            <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all ${
              exploitStatus === 'exploit_granted'
                ? 'bg-status-danger/10 border-status-danger/30 text-status-danger animate-pulse-slow'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}>
              {exploitStatus === 'exploit_granted' ? (
                <>
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-black uppercase text-[10px]">Session Hijacked successfully!</span>
                    <span className="block font-medium mt-0.5 text-text-secondary leading-normal">
                      The server accepted the bearer cookie without verification. Attacker fully bypassed credentials, MFA, and IP matching checkpoints!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-black uppercase text-[10px]">Exploit Blocked! Security Gateway Protected.</span>
                    <span className="block font-medium mt-0.5 text-text-secondary leading-normal">
                      The active enterprise security shields intercepted the request, analyzed the context anomaly, and rejected the session replay.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* DIAGNOSTIC LOGGER TERMINAL (IdP Server output) */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-accent-primary animate-pulse" /> Security Gateway Audit Log
              </span>
              <button
                onClick={handleReset}
                className="text-[9px] font-mono text-zinc-600 hover:text-text-primary flex items-center gap-1 transition-all"
                title="Reset log console"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Console
              </button>
            </div>

            <div className="font-mono text-[10px] text-emerald-400 space-y-1.5 max-h-[160px] overflow-y-auto h-[120px] leading-relaxed select-text">
              {logs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${
                  log.startsWith('✔') || log.includes('SUCCESSFUL') ? 'text-emerald-500 font-black' :
                  log.startsWith('🚨') || log.startsWith('ATTACK BLOCKED') || log.startsWith('ERROR') ? 'text-red-500 font-bold' :
                  log.startsWith('[HTTP]') ? 'text-blue-400' :
                  log.startsWith('[CAEP]') ? 'text-purple-400 font-semibold' :
                  log.startsWith('[GATEWAY]') ? 'text-amber-400 font-semibold' : ''
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Enterprise Defenses & Spec Sheets (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Defense Controls */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent-primary" /> Enterprise Shields
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Activate security gates to secure the session boundary and block replay exploits:
            </p>

            <div className="space-y-3.5 pt-2">
              
              {/* Option 1: IP Binding / Geo-Velocity */}
              <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
                <div className="space-y-0.5 max-w-[200px]">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Request IP Binding</span>
                  <span className="text-[9px] text-text-muted block leading-normal">Match requesting IP against session record IP address</span>
                </div>
                <button
                  onClick={() => {
                    setDefenses(prev => ({ ...prev, ipBinding: !prev.ipBinding }))
                    setLogs(p => [...p, `[SHIELD] IP-binding matching ${!defenses.ipBinding ? 'ENABLED' : 'DISABLED'}.`])
                  }}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                    defenses.ipBinding ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle IP Binding"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    defenses.ipBinding ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Option 2: DPoP client signatures */}
              <div className="flex items-center justify-between border-b border-border-subtle/40 pb-3">
                <div className="space-y-0.5 max-w-[200px]">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">Enforce DPoP / Token Bind</span>
                  <span className="text-[9px] text-text-muted block leading-normal">Require client proof-of-possession signature signed by browser key</span>
                </div>
                <button
                  onClick={() => {
                    setDefenses(prev => ({ ...prev, dpopEnforced: !prev.dpopEnforced }))
                    setLogs(p => [...p, `[SHIELD] DPoP cryptographic proof of possession ${!defenses.dpopEnforced ? 'ENABLED' : 'DISABLED'}.`])
                  }}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                    defenses.dpopEnforced ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle DPoP"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    defenses.dpopEnforced ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Option 3: Continuous Access Evaluation CAEP */}
              <div className="flex items-center justify-between pb-1">
                <div className="space-y-0.5 max-w-[200px]">
                  <span className="text-[10px] font-black text-text-primary block leading-tight uppercase">CAEP Dynamic Revocation</span>
                  <span className="text-[9px] text-text-muted block leading-normal">Instantly terminate sessions globally on telemetry threat events</span>
                </div>
                <button
                  onClick={() => {
                    setDefenses(prev => ({ ...prev, caepEnabled: !prev.caepEnabled }))
                    setLogs(p => [...p, `[SHIELD] Continuous Access Evaluation Protocol (CAEP) webhook telemetry ${!defenses.caepEnabled ? 'ENABLED' : 'DISABLED'}.`])
                  }}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                    defenses.caepEnabled ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle CAEP"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    defenses.caepEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          {/* Educational specification sheet */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-accent-secondary" /> Architectural Specs
            </h4>
            
            <div className="space-y-3.5 text-[11px] text-text-secondary leading-relaxed">
              <div className="space-y-1">
                <strong className="text-text-primary uppercase text-[9px] block font-mono">The Threat Boundary:</strong>
                <p>
                  Because credentials and MFA (OTP, FIDO2) are only verified during the <em>initial login handshake</em>, the resulting session cookie remains a "bearer token." If an infostealer scrapes this cookie or it is leaked via a HAR file, an attacker can replay it to gain immediate access from any device in the world, completely bypassing MFA.
                </p>
              </div>

              <div className="space-y-1">
                <strong className="text-text-primary uppercase text-[9px] block font-mono">DPoP (RFC 9449):</strong>
                <p>
                  Demonstrating Proof-of-Possession binds the session token to an asymmetric key pair generated in the client browser. For every API request, the browser signs a dynamic claim containing the HTTP method and URI. Replaying the stolen cookie fails because the attacker lacks the browser's private signing key.
                </p>
              </div>

              <div className="space-y-1">
                <strong className="text-text-primary uppercase text-[9px] block font-mono">CAEP (Shared Signals / RFC 9396):</strong>
                <p>
                  Continuous Access Evaluation replaces the static, multi-hour session lifespan. If an antivirus sweeps infostealer malware on a workstation, a security event token (SET) is immediately broad-casted via webhook, causing the IdP to revoke the session across all SaaS apps globally within milliseconds.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
