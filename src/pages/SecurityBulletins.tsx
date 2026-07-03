import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldAlert, ShieldCheck, ArrowRight, Terminal, 
  Settings, AlertTriangle, List, Check
} from 'lucide-react'

type IncidentType = 'okta_support' | 'golden_saml' | 'mfa_fatigue'

interface BulletinDetails {
  title: string
  date: string
  severity: 'Critical' | 'High' | 'Medium'
  vector: string
  description: string
  playbookSteps: string[]
  remediationSnippet: string
  snippetLanguage: string
}

const BULLETIN_DATA: Record<IncidentType, BulletinDetails> = {
  okta_support: {
    title: 'Okta Support Portal HAR File Hijack',
    date: 'October 2023',
    severity: 'Critical',
    vector: 'Session Token Theft via HTTP Archive (HAR) Files',
    description: 'Attackers compromised Okta\'s third-party customer support portal using stolen credentials. They downloaded custom HAR files uploaded by customer administrators, extracted active session cookies (tokens) from the raw network logs, and hijacked global administrator sessions, bypassing MFA restrictions completely.',
    playbookSteps: [
      'Sanitize and scrub all HTTP Archive (HAR) files before uploading them to external support teams.',
      'Enforce strict administrative session IP binding constraints to block reused tokens from anomalous locations.',
      'Transition administrative single-sign-on (SSO) portals to mandate phishing-resistant WebAuthn Passkeys.',
      'Enforce short admin-session timeouts and audit all support bypass configuration changes.'
    ],
    remediationSnippet: `// Node.js Express Session IP Binding check\napp.use((req, res, next) => {\n  if (req.session.userId) {\n    if (req.session.ipAddress !== req.ip) {\n      req.session.destroy(); // Terminate session immediately on IP swap\n      return res.status(401).send("Unauthorized: IP Mismatch");\n    }\n  }\n  next();\n});`,
    snippetLanguage: 'JavaScript'
  },
  golden_saml: {
    title: 'SolarWinds Golden SAML (APT29 Nobelium)',
    date: 'December 2020',
    severity: 'Critical',
    vector: 'Token-Signing Private Key Certificate Compromise',
    description: 'State-sponsored attackers compromised on-premise Active Directory Federation Services (ADFS) servers and extracted the private token-signing certificate key. Using this key, the attackers forged standard SAML assertions locally in memory, granting themselves any administrative group claim and completely bypassing on-premise ADFS and MFA gateways to access cloud systems.',
    playbookSteps: [
      'Store and back all ADFS token-signing private keys securely inside a physical Hardware Security Module (HSM).',
      'Manually rotate ADFS token-signing certificates immediately and verify replication forest-wide.',
      'Enforce strict host-level filesystem security audits on on-premise Domain Controllers.',
      'Migrate workforce single-sign-on (SSO) channels from on-premise federations to cloud-native Entra ID.'
    ],
    remediationSnippet: `# PowerShell: Enable ADFS Token Signing Key HSM protection\nSet-AdfsCertificate -CertificateType Token-Signing -Thumbprint "THUMBPRINT_HEX" -Pin "HSM_PIN_HERE"`,
    snippetLanguage: 'PowerShell'
  },
  mfa_fatigue: {
    title: 'MFA Fatigue Push-Bombing Handovers',
    date: '2022 - 2023',
    severity: 'High',
    vector: 'MFA Push Notification Exhaustion Hacking',
    description: 'Attackers harvested valid username/password credentials. They repeatedly triggered Microsoft Authenticator or Okta Verify push approvals (hundreds of notifications) during late-night hours until the distracted, fatigued employee clicked "Approve" simply to stop the notifications.',
    playbookSteps: [
      'Disable standard basic "Approve/Deny" push notification setups globally.',
      'Enable Context-Aware Number Matching, forcing the user to type digits shown on the login screen.',
      'Enable location-aware push notification displays, showing the login request IP and location map on the device.',
      'Enforce alert thresholds to block or lock accounts when more than 5 MFA notifications trigger in 1 minute.'
    ],
    remediationSnippet: `{\n  "MfaFatigueLockout": {\n    "MaxPushRequestsPerMinute": 5,\n    "LockoutDurationMinutes": 15,\n    "TriggerAction": "LOCK_ACCOUNT"\n  }\n}`,
    snippetLanguage: 'JSON Config'
  }
}

export default function SecurityBulletins() {
  const [activeIncident, setActiveIncident] = useState<IncidentType>('okta_support')
  const bulletin = BULLETIN_DATA[activeIncident]

  // Crisis Response Simulator States
  const [crisisStep, setCrisisStep] = useState<number>(0)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [simulatorLogs, setSimulatorLogs] = useState<string[]>([])
  const [containmentScore, setContainmentScore] = useState<string | null>(null)

  const addLog = (msg: string) => {
    setSimulatorLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const handleIncidentChange = (id: IncidentType) => {
    setActiveIncident(id)
    resetSimulator()
  }

  const resetSimulator = () => {
    setCrisisStep(0)
    setSimulatorLogs([])
    setContainmentScore(null)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText('rem-code')
    setTimeout(() => setCopiedText(null), 1500)
  }

  // --- INCIDENT RESPONSE FLOW STEPS ---
  const runResponseStep1 = () => {
    addLog(`🚨 WARNING: Suspicious login alert on administrative accounts detected!`)
    if (activeIncident === 'okta_support') {
      addLog(`SIEM Log: User "admin@company.com" logged in from anomalous IP: 203.0.113.88. No MFA challenge prompted during session init!`)
    } else if (activeIncident === 'golden_saml') {
      addLog(`SIEM Log: Multiple administrative logins authenticated to cloud portal without matching ADFS request logs!`)
    } else {
      addLog(`SIEM Log: Administrative user triggered 15 push notifications in 2 minutes before successful approval.`)
    }
    setCrisisStep(1)
  }

  const runResponseStep2 = () => {
    addLog(`🔍 Analyzing logs to determine active security breach vector...`)
    if (activeIncident === 'okta_support') {
      addLog(`Incident Detail: Cookie extraction trace confirmed. Attacker repurposed global admin session cookie. Stolen cookie is bound to an active support ticket HAR attachment!`)
    } else if (activeIncident === 'golden_saml') {
      addLog(`Incident Detail: SAML assertion signatures verified, but ADFS server logs do not show token generation. Certificate key is likely compromised locally!`)
    } else {
      addLog(`Incident Detail: User confirmed they approved the push request after receiving consecutive notification popups simply to stop the device buzzings.`)
    }
    setCrisisStep(2)
  }

  const triggerContainmentAction = (strategy: 'low' | 'high') => {
    addLog(`🔧 Initiating containment strategy...`)
    
    if (activeIncident === 'okta_support') {
      if (strategy === 'high') {
        addLog('Action: Instantly terminating all global administrative session cookies, and enabling strict Administrative IP binding checks.')
        setContainmentScore('A+ (EXCELLENT)')
        addLog('✓ Containment Successful! Attacker\'s stolen session cookie was immediately revoked and rendered useless on subsequent hops.')
      } else {
        addLog('Action: Informing support team to close the ticket and delete the HAR attachment.')
        setContainmentScore('F- (CRITICAL LEAKAGE)')
        addLog('❌ Containment Failed! Attacker still holds active cookie session bounds on administrative resources.')
      }
    } else if (activeIncident === 'golden_saml') {
      if (strategy === 'high') {
        addLog('Action: Manually rotating ADFS token-signing private keys twice, flushing active caches, and moving certificates to physical HSM hardware.')
        setContainmentScore('A+ (EXCELLENT)')
        addLog('✓ Containment Successful! Forged SAML certificates are invalidated forest-wide, blocking attacker authentication.')
      } else {
        addLog('Action: Resetting the target administrator\'s Active Directory password.')
        setContainmentScore('F- (CRITICAL LEAKAGE)')
        addLog('❌ Containment Failed! Attackers still hold the ADFS private signing key, letting them forge valid administrative SAML assertions at will.')
      }
    } else {
      if (strategy === 'high') {
        addLog('Action: Enforcing Context-Aware Number Matching, location-aware notifications, and lockouts after 5 consecutive push failures.')
        setContainmentScore('A+ (EXCELLENT)')
        addLog('✓ Containment Successful! Attackers can no longer trigger basic push fatigue. Phishing-proof bounds successfully armed.')
      } else {
        addLog('Action: Sending corporate security awareness training emails to employees.')
        setContainmentScore('F- (CRITICAL LEAKAGE)')
        addLog('❌ Containment Failed! Simple push exhaustion hacks are still structurally possible.')
      }
    }
    setCrisisStep(3)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-status-danger w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Security Bulletin Board</h1>
            <p className="text-xs text-text-secondary">Incident Response console tracking major real-world identity breaches, attack vectors, and hardened playbooks</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Incident selector tabs & Playbooks */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selector card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Threat Advisory
            </span>

            <div className="flex flex-col gap-2">
              {(Object.keys(BULLETIN_DATA) as IncidentType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleIncidentChange(key)}
                  className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition ${activeIncident === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                >
                  <div>
                    <span className="font-bold block">{key === 'okta_support' ? 'Okta HAR Cookie Theft' : key === 'golden_saml' ? 'SolarWinds Golden SAML' : 'MFA Fatigue Exhaustion'}</span>
                    <span className="text-[9px] text-text-muted">{BULLETIN_DATA[key].date}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeIncident === key ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Hardened incident playbook checklist */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
              <List className="w-4 h-4 text-accent-primary" /> Incident Response Playbook
            </span>

            <div className="space-y-3">
              {bulletin.playbookSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal text-text-secondary">
                  <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Incident Details and Interactive IR Crisis Simulator */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Incident Info Header */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <ShieldAlert className="w-24 h-24 text-status-danger" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/25 px-2.5 py-0.5 rounded-full">
                  Vector: {bulletin.vector}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-status-danger/10 text-status-danger border border-status-danger/20">
                  Severity: {bulletin.severity}
                </span>
              </div>

              <h2 className="text-lg font-black text-text-primary uppercase tracking-wide">{bulletin.title}</h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-2.5">{bulletin.description}</p>
            </div>
          </div>

          {/* Interactive Incident Response Simulator */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg min-h-[350px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
                <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-primary" /> Incident Response Crisis Simulator
                </span>
                <button
                  onClick={resetSimulator}
                  className="text-[10px] bg-bg-nested text-text-secondary hover:text-text-primary border border-border-subtle px-2 py-1 rounded transition"
                >
                  Reset Incident
                </button>
              </div>

              {/* Step Triggers */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={runResponseStep1}
                  disabled={crisisStep !== 0}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${crisisStep === 0 ? 'bg-status-danger hover:bg-status-danger/95 text-white border-status-danger/40 animate-pulse' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 1: Detect Threat
                </button>

                <button
                  onClick={runResponseStep2}
                  disabled={crisisStep !== 1}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${crisisStep === 1 ? 'bg-status-warning hover:bg-status-warning/95 text-white border-status-warning/40 animate-pulse' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 2: Analyze Vector
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => triggerContainmentAction('low')}
                    disabled={crisisStep !== 2}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition text-center ${crisisStep === 2 ? 'bg-status-danger/10 border-status-danger/35 text-status-danger hover:bg-status-danger/20' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                    title="Enforce basic remediation action"
                  >
                    Remediate (Low)
                  </button>
                  <button
                    onClick={() => triggerContainmentAction('high')}
                    disabled={crisisStep !== 2}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition text-center ${crisisStep === 2 ? 'bg-status-success/15 border-status-success/40 text-status-success hover:bg-status-success/30' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                    title="Enforce strong, standard-compliant remediation action"
                  >
                    Remediate (High)
                  </button>
                </div>
              </div>

              {/* Containment Score status banner */}
              {containmentScore && (
                <div className="mt-5">
                  {containmentScore.includes('EXCELLENT') ? (
                    <div className="p-4 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-3 animate-fadeIn">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-status-success animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Incident Contained Successfully!</span>
                        <span className="text-xs text-text-primary leading-normal">
                          Remediation Action Score: <strong className="font-bold text-status-success">{containmentScore}</strong>. Cryptographic isolation barriers established forest-wide.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-3 animate-fadeIn">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-status-danger animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Remediation Action Incomplete!</span>
                        <span className="text-xs text-text-primary leading-normal">
                          Remediation Action Score: <strong className="font-bold text-status-danger">{containmentScore}</strong>. Attacker retains active identity sessions. Critical data leakage active.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trace logs terminal */}
            <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-xs text-text-primary h-36 overflow-y-auto mt-4 leading-normal">
              <div className="flex items-center gap-1.5 border-b border-border-subtle/50 pb-1.5 mb-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" /> Incident Response Console Outputs
              </div>
              {simulatorLogs.length === 0 ? (
                <span className="text-text-muted italic select-none">Console ready. Trigger an incident response step to begin active containment audits.</span>
              ) : (
                simulatorLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed text-text-secondary">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Code Reference block */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-accent-primary" /> Hardened Code Reference ({bulletin.snippetLanguage})
              </span>
              <button
                onClick={() => handleCopy(bulletin.remediationSnippet)}
                className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 bg-bg-nested border border-border-subtle px-2 py-1 rounded transition"
              >
                {copiedText === 'rem-code' ? <Check className="w-3 h-3 text-status-success" /> : 'Copy Code'}
              </button>
            </div>
            <pre className="text-xs font-mono bg-bg-base border border-border-subtle p-4 rounded-xl text-text-primary overflow-x-auto select-all leading-relaxed shadow-inner max-h-40">
              {bulletin.remediationSnippet}
            </pre>
          </div>

        </div>

      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
