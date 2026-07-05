import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Key, ShieldCheck, ArrowRight, RefreshCw, 
  Terminal, HelpCircle, Check, Copy, Server, Users
} from 'lucide-react'

type KerberosStep = 0 | 1 | 2 | 3
type ExploitMode = 'normal' | 'golden_ticket' | 'silver_ticket'

export default function KerberosLab() {
  const [step, setStep] = useState<KerberosStep>(0)
  const [exploit, setExploit] = useState<ExploitMode>('normal')
  const [logs, setLogs] = useState<string[]>([])
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Decoded payload blocks for visual inspection
  const [ticketPayload, setTicketPayload] = useState<Record<string, unknown> | null>(null)

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const resetFlow = () => {
    setStep(0)
    setLogs([])
    setTicketPayload(null)
  }

  const handleExploitChange = (mode: ExploitMode) => {
    setExploit(mode)
    resetFlow()
    addLog(`Switched simulator mode to: ${mode.toUpperCase()}`)
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 1500)
  }

  // --- STEP BY STEP TRIGGERS ---

  // STEP 1: AS-REQ & AS-REP (Get TGT)
  const runAsRequest = () => {
    if (exploit === 'golden_ticket') {
      addLog(`🎟️ [Golden Ticket Mode Active] Bypassing KDC Authentication Service completely!`)
      addLog(`Attacker uses stolen KRBTGT NT Hash key to forge a Domain Admin Ticket-Granting Ticket (TGT) locally.`)
      
      const forgedTgt = {
        TicketGrantingTicket: {
          ClientName: "administrator",
          Domain: "aboutiam.local",
          GroupMemberships: ["Domain Admins", "Enterprise Admins", "Schema Admins"],
          Lifespan: "10 Years (Custom Max)",
          EncryptedWith: "KRBTGT_Master_Key (Compromised Hash)"
        }
      }
      setTicketPayload(forgedTgt)
      addLog(`Generated Forged TGT locally in memory! Ready for TGS submission.`)
      setStep(1)
      return
    }

    if (exploit === 'silver_ticket') {
      addLog(`🎟️ [Silver Ticket Mode Active] Bypassing AS & TGS completely!`)
      addLog(`Attacker uses stolen Service account NT Hash key to forge a Service Ticket directly. Proceed to AP-REQ (Step 3).`)
      setStep(2)
      return
    }

    // Normal flow
    addLog(`Client requests Ticket-Granting Ticket (TGT) from KDC Authentication Service (AS-REQ).`)
    addLog(`AS verifies client identity using password-derived encryption key.`)
    addLog(`AS issues AS-REP: returns TGT (encrypted with KRBTGT secret key) and Session Key.`)
    
    const validTgt = {
      TicketGrantingTicket: {
        ClientName: "alice.security",
        Domain: "aboutiam.local",
        GroupMemberships: ["Domain Users"],
        Lifespan: "10 Hours (Standard RFC)",
        EncryptedWith: "KRBTGT_Master_Key (KDC Private Key)"
      }
    }
    setTicketPayload(validTgt)
    setStep(1)
  }

  // STEP 2: TGS-REQ & TGS-REP (Get Service Ticket)
  const runTgsRequest = () => {
    if (exploit === 'silver_ticket') {
      addLog(`⚠️ [Silver Ticket Mode Active] Attacker does not need KDC TGS! Proceeding directly to Service Ticket forge.`)
      const forgedServiceTicket = {
        ServiceTicket: {
          ClientName: "administrator",
          Service: "cifs/MSSQL01.aboutiam.local",
          GroupMemberships: ["Domain Admins", "Enterprise Admins"],
          EncryptedWith: "MSSQL01_Service_Hash (Compromised Service Key)"
        }
      }
      setTicketPayload(forgedServiceTicket)
      addLog(`Forged SQL Service Ticket locally in memory! Proceed to AP-REQ (Step 3).`)
      setStep(2)
      return
    }

    const isGolden = exploit === 'golden_ticket'
    addLog(`Client presents TGT to KDC Ticket-Granting Service (TGS-REQ), requesting access to Web01 server.`)
    addLog(isGolden ? `🚨 Attacker presents forged Golden TGT containing administrator rights!` : `Client presents valid TGT in session.`);
    addLog(`KDC decrypts TGT using KRBTGT key and verifies integrity.`)
    
    if (isGolden) {
      addLog(`KDC successfully reads the forged group claims (Domain Admins) and issues administrative Service Ticket!`)
    } else {
      addLog(`KDC issues TGS-REP: returns Service Ticket for Web01 (encrypted with Web01's service account key).`)
    }

    const serviceTicket = {
      ServiceTicket: {
        ClientName: isGolden ? "administrator" : "alice.security",
        Service: "http/Web01.aboutiam.local",
        GroupMemberships: isGolden ? ["Domain Admins"] : ["Domain Users"],
        EncryptedWith: "Web01_Service_Hash (Web01 Private Key)"
      }
    }
    setTicketPayload(serviceTicket)
    setStep(2)
  }

  // STEP 3: AP-REQ & AP-REP (Access Service)
  const runApRequest = () => {
    if (exploit === 'silver_ticket') {
      addLog(`Attacker presents forged Service Ticket directly to MSSQL01 service database server (AP-REQ).`)
      addLog(`MSSQL01 decrypts ticket using its own compromised NT hash key. Signature matches!`)
      addLog(`🔓 Access Granted! Attacker logs into SQL Database as Domain Administrator.`)
      setStep(3)
      return
    }

    const iscompromised = exploit === 'golden_ticket'
    addLog(`Client presents Service Ticket to Web01 application server (AP-REQ).`)
    addLog(`Web01 decrypts the ticket using its own Service Key. Integrity is verified.`)
    
    if (iscompromised) {
      addLog(`🔓 Access Granted! Attacker receives full Administrator shell access on Web01 server!`)
    } else {
      addLog(`✅ Access Granted! User 'alice.security' securely authenticated. Standard user dashboard loads.`)
    }
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Upper Navigation/Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Active Directory Kerberos Tickets Lab</h1>
            <p className="text-xs text-text-secondary">Interactive state-machine visualizer for Kerberos authentication steps & ticket exploitation</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Grid Content */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Scenario controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
            <h2 className="font-semibold text-sm text-text-primary uppercase tracking-wider mb-3">Simulation Mode</h2>
            <div className="space-y-2">
              <button 
                onClick={() => handleExploitChange('normal')}
                className={`w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1 transition ${exploit === 'normal' ? 'bg-status-success/15 border-status-success/35 text-status-success' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                <span className="font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${exploit === 'normal' ? 'bg-status-success animate-pulse' : 'bg-text-muted'}`}></span>
                  Standard Kerberos Flow (RFC 4120)
                </span>
                <span>Normal three-party ticket exchange: Client, AS/TGS (KDC), and Target Application Server.</span>
              </button>

              <button 
                onClick={() => handleExploitChange('golden_ticket')}
                className={`w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1 transition ${exploit === 'golden_ticket' ? 'bg-status-danger/10 border-status-danger/35 text-status-danger' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                <span className="font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${exploit === 'golden_ticket' ? 'bg-status-danger' : 'bg-text-muted'}`}></span>
                  Golden Ticket Exploit (KDC Bypass)
                </span>
                <span>Attacker uses compromised KRBTGT hash to forge a lifetime TGT directly, mimicking domain admins.</span>
              </button>

              <button 
                onClick={() => handleExploitChange('silver_ticket')}
                className={`w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1 transition ${exploit === 'silver_ticket' ? 'bg-status-danger/10 border-status-danger/35 text-status-danger' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                <span className="font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${exploit === 'silver_ticket' ? 'bg-status-danger' : 'bg-text-muted'}`}></span>
                  Silver Ticket Exploit (KDC & TGS Bypass)
                </span>
                <span>Attacker uses a stolen machine service hash key to forge service tickets directly, bypassing KDC servers.</span>
              </button>
            </div>
          </div>

          {/* Educational Analogy Block */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
            <h2 className="font-semibold text-sm text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-accent-primary" /> Amusement Park Analogy
            </h2>
            <div className="text-xs text-text-secondary leading-normal space-y-2">
              <p>
                <strong>Normal Kerberos:</strong> You go to an amusement park. (1) First, you present your ID at the front box office (AS) to buy a general admission wristband (TGT). (2) Next, you walk to the roller-coaster line and show your wristband to the booth attendant (TGS) to receive a ride ticket. (3) Finally, you present that ride ticket to the bouncer at the roller-coaster (Service) to get on the ride.
              </p>
              <p>
                <strong>Golden Ticket:</strong> You steal the park manager's custom wristband printer stamp (KRBTGT hash). You stamp your own general admission wristband (TGT) at home, granting yourself access to any ride.
              </p>
              <p>
                <strong>Silver Ticket:</strong> You steal the key to the roller-coaster bouncer's ticket punch (Service hash). You forge tickets directly for that roller-coaster, avoiding both the front gate and the ticket booth.
              </p>
            </div>
          </div>
        </div>

        {/* Right pane: Interactive network board */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2.5">
                <span className="text-sm font-bold text-text-primary">Interactive Security Realm Map</span>
                <button 
                  onClick={resetFlow}
                  className="text-xs bg-bg-nested text-text-secondary hover:text-text-primary border border-border-subtle px-2.5 py-1.5 rounded transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Flow
                </button>
              </div>

              {/* Visual Architecture Map */}
              <div className="grid grid-cols-3 gap-4 items-center justify-center p-6 relative border border-border-subtle bg-bg-base rounded-xl mb-6">
                
                {/* Entity 1: Client workstation */}
                <div className="text-center flex flex-col items-center">
                  <div className={`p-4 rounded-xl border transition ${step >= 0 ? 'bg-accent-glow border-accent-primary shadow' : 'bg-bg-nested border-border-subtle'}`}>
                    <Users className="w-7 h-7 text-accent-primary mx-auto" />
                  </div>
                  <span className="block text-xs font-bold text-text-primary mt-2">Workstation</span>
                  <span className="text-[9px] text-text-muted font-mono">alice.security</span>
                </div>

                {/* Flow lines & direction indicators */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-0.5 bg-border-subtle relative mb-3">
                    {step === 1 && (
                      <div className="w-2 h-2 bg-status-warning rounded-full absolute top-1/2 -translate-y-1/2 left-0 animate-ping"></div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-text-muted uppercase tracking-widest">
                    Kerberos Realm
                  </span>
                </div>

                {/* Entity 2: KDC (AS/TGS) */}
                <div className="text-center flex flex-col items-center">
                  <div className={`p-4 rounded-xl border transition ${
                    exploit === 'golden_ticket' ? 'bg-status-danger/10 border-status-danger/30' :
                    step >= 1 ? 'bg-status-success/10 border-status-success/40' : 'bg-bg-nested border-border-subtle'
                  }`}>
                    <Server className={`w-7 h-7 mx-auto ${exploit === 'golden_ticket' ? 'text-status-danger' : 'text-status-success'}`} />
                  </div>
                  <span className="block text-xs font-bold text-text-primary mt-2">
                    {exploit === 'golden_ticket' ? 'KDC (Bypassed!)' : 'KDC (AS/TGS)'}
                  </span>
                  <span className="text-[9px] text-text-muted font-mono">KRBTGT Keys</span>
                </div>

              </div>

              {/* Interactive buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={runAsRequest}
                  disabled={step !== 0}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border text-center transition ${step === 0 ? 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 1: Get TGT (AS-REQ)
                </button>

                <button 
                  onClick={runTgsRequest}
                  disabled={step !== 1}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border text-center transition ${step === 1 ? 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 2: Get Service Ticket (TGS-REQ)
                </button>

                <button 
                  onClick={runApRequest}
                  disabled={step !== 2}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border text-center transition ${step === 2 ? 'bg-status-success hover:bg-status-success/95 text-white border-status-success/45' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 3: Access Service (AP-REQ)
                </button>
              </div>

              {/* Ticket payload visualization / decrypted inspector block */}
              {ticketPayload && (
                <div className="mt-5 border border-border-subtle bg-bg-base p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2 font-mono">Decrypted Active Token Details</span>
                  <pre className="text-[10px] font-mono text-accent-secondary overflow-x-auto">
                    {JSON.stringify(ticketPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Simulated AD command logs */}
            <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-xs text-text-primary h-40 overflow-y-auto mt-4">
              <div className="flex items-center gap-1.5 border-b border-border-subtle pb-1.5 mb-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" /> Domain Controller Logs
              </div>
              {logs.length === 0 ? (
                <span className="text-text-muted italic select-none">Console ready. Trigger an AD ticketing step to start reading Kerberos network logs.</span>
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

      {/* Under block: Technical details & questions */}
      <div className="p-6 max-w-7xl mx-auto pt-0">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-lg">
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-1.5">
            <ShieldCheck className="text-status-success w-5 h-5" /> Kerberos Security, AD Mitigations & Code Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary leading-relaxed">
            <div>
              <h3 className="font-bold text-accent-primary mb-1.5 text-sm">Attack Mitigations</h3>
              <p className="mb-3">
                1. **Golden Ticket Mitigation:** The KRBTGT master key hash cannot be rotated automatically. To completely invalidate all previously forged Golden Tickets across the forest, you must manually rotate the KRBTGT password **twice** (allowing time for replication in between) to invalidate the older keys.
              </p>
              <p>
                2. **Silver Ticket Mitigation:** Service accounts must utilize strong, complex, randomly-generated passwords (Managed Service Accounts - gMSAs are highly recommended) to ensure that their keys cannot be brute-forced or kerberoasted by offline hash cracking rigs.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-status-success mb-1.5 text-sm">Security Best Practices (PowerShell Admin)</h3>
              <div className="space-y-3">
                <div className="bg-bg-nested p-3 rounded-lg border border-border-subtle font-mono text-[11px] relative">
                  <button 
                    onClick={() => handleCopy(`Reset-ComputerMachinePassword\n# Forces computer account keys rotation`, 'rem-3')}
                    className="absolute top-2 right-2 p-1 hover:bg-bg-card rounded text-text-muted hover:text-text-primary transition"
                  >
                    {copiedText === 'rem-3' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="block text-[10px] font-bold text-status-success uppercase mb-1">Rotate Machine Service Account Keys</span>
                  <code>Reset-ComputerMachinePassword</code>
                </div>

                <div className="bg-bg-nested p-3 rounded-lg border border-border-subtle font-mono text-[11px] relative">
                  <button 
                    onClick={() => handleCopy(`Set-ADUser -Identity krbtgt -PasswordExpired $true\n# Step 1 of KRBTGT rotation script`, 'rem-4')}
                    className="absolute top-2 right-2 p-1 hover:bg-bg-card rounded text-text-muted hover:text-text-primary transition"
                  >
                    {copiedText === 'rem-4' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="block text-[10px] font-bold text-status-danger uppercase mb-1">Trigger KRBTGT Password Expiry</span>
                  <code>Set-ADUser -Identity krbtgt -PasswordExpired $true</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
