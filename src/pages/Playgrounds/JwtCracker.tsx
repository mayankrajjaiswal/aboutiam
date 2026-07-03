import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Key, ShieldCheck, ShieldAlert, ArrowRight, 
  Terminal, Play
} from 'lucide-react'

const DICTIONARY = [
  'password', '123456', 'admin', 'qwerty', '12345678', '111111', 'welcome', 
  'login', 'secret', 'oracle', 'database', 'root', 'superadmin', 'guest', 
  'cisco', 'fortinet', 'identity', 'aboutiam', 'azure', 'aws', 'okta', 
  'admin123', 'pass123', 'access', 'auth123', 'manager', 'employee', 'corporate'
]

const HEADER_B64 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' // {"alg":"HS256","typ":"JWT"}
const PAYLOAD_B64 = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwicm9sZSI6ImFkbWluIn0' // {"sub":"1234567890","name":"Alice","role":"admin"}
const TARGET_SECRET = 'admin123'
const TARGET_SIGNATURE = 'ds982hk_sig_payload_abc123' // Representing the target weak signature

export default function JwtCracker() {
  const [isCracking, setIsCracking] = useState(false)
  const [scanIndex, setScanIndex] = useState(-1)
  const [logs, setLogs] = useState<string[]>([])
  const [crackedSecret, setCrackedSecret] = useState<string | null>(null)

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const resetFlow = () => {
    setIsCracking(false)
    setScanIndex(-1)
    setLogs([])
    setCrackedSecret(null)
  }

  // Dictionary Cracking Loop Simulator
  useEffect(() => {
    if (!isCracking || scanIndex >= DICTIONARY.length || crackedSecret) return

    const timer = setTimeout(() => {
      const nextIndex = scanIndex + 1
      if (nextIndex >= DICTIONARY.length) {
        addLog('❌ Dictionary exhausted. Secret not found in active attack registry.')
        setIsCracking(false)
        return
      }

      setScanIndex(nextIndex)
      const currentCandidate = DICTIONARY[nextIndex]
      addLog(`Testing HMAC-SHA256 Secret candidate: "${currentCandidate}"`)

      if (currentCandidate === TARGET_SECRET) {
        addLog(`✓ Match found! Signature match confirmed for secret: "${currentCandidate}"`)
        setCrackedSecret(currentCandidate)
        setIsCracking(false)
      }
    }, 150) // Stagger attempts to make it visually traceable

    return () => clearTimeout(timer)
  }, [isCracking, scanIndex, crackedSecret])

  const startAttack = () => {
    resetFlow()
    setIsCracking(true)
    addLog('🚀 Initiating Dictionary Attack against HS256 JWT Signature...')
    addLog(`Target Token: ${HEADER_B64}.${PAYLOAD_B64}.${TARGET_SIGNATURE}`)
    addLog(`Loaded dictionary registry of ${DICTIONARY.length} common weak secrets...`)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">JWT Signature Secret Cracker</h1>
            <p className="text-xs text-text-secondary">Interactive cryptographic simulator demonstrating the danger of using weak shared secrets for HMAC signature keys</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Token & Dictionary previews */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Target Token Card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-3">
            <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider block border-b border-border-subtle/50 pb-1.5">
              Target Compromised Token
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              This HS256 JWT claims administrative privileges (`"role": "admin"`), but it was signed using a weak shared secret passphrase rather than an enterprise RSA keypair.
            </p>
            <div className="p-3 bg-bg-base rounded-lg border border-border-subtle/80 font-mono text-[10px] break-all leading-normal select-all">
              <span className="text-rose-500">{HEADER_B64}</span>.
              <span className="text-blue-500">{PAYLOAD_B64}</span>.
              <span className="text-teal-500">{TARGET_SIGNATURE}</span>
            </div>
          </div>

          {/* Dictionary preview */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-2 border-b border-border-subtle pb-1">
              Hacking Dictionary Wordlist
            </span>
            <p className="text-[10px] text-text-muted leading-relaxed mb-3">
              Standard dictionary attacks loop through common passwords, hashing local payloads on massive GPU rigs to discover key matches.
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto bg-bg-base border border-border-subtle/60 p-2.5 rounded-lg font-mono text-[10px]">
              {DICTIONARY.map((word, idx) => (
                <span 
                  key={word} 
                  className={`px-1.5 py-0.5 rounded border transition ${
                    idx === scanIndex ? 'bg-rose-950/20 border-rose-500/50 text-rose-400 font-bold animate-pulse' : 'bg-bg-card border-border-subtle text-text-secondary'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Attack terminal & Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
                <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-primary" /> Dictionary Attack Terminal
                </span>
                <button
                  onClick={startAttack}
                  disabled={isCracking}
                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 ${isCracking ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary shadow shadow-accent-primary/10'}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Launch Attack
                </button>
              </div>

              {/* Status Outcome Banner */}
              {crackedSecret && (
                <div className="p-4 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-3 animate-fadeIn mb-4">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-status-danger animate-bounce" />
                  <div>
                    <span className="font-extrabold text-sm block">Vulnerability Confirmed: Key Cracked!</span>
                    <span className="text-xs text-text-primary leading-normal">
                      Attack completed. Discovered Signature Secret: <code className="bg-bg-nested px-2 py-0.5 rounded font-mono font-bold text-status-danger select-all">"{crackedSecret}"</code>. Attacker can now forge valid administrative tokens at will!
                    </span>
                  </div>
                </div>
              )}

              {/* Console log outputs */}
              <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-xs text-text-primary h-52 overflow-y-auto leading-normal">
                {logs.length === 0 ? (
                  <span className="text-text-muted italic select-none">Console ready. Click "Launch Attack" above to begin offline dictionary checks.</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed text-text-secondary">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Educational advice footer */}
            <div className="border border-border-subtle bg-bg-base rounded-lg p-3 font-mono text-[11px] text-text-primary overflow-y-auto mt-4 leading-normal flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-status-success shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-text-primary block mb-0.5 uppercase tracking-wider text-[10px]">Architect Mitigation Verdict:</span>
                Never use basic password strings as HMAC secrets. For production gateways, always utilize strong, cryptographically secure keys (at least 256 bits of random entropy) or transition entirely to asymmetric public key algorithms (RS256/ES256) where private keys are never exposed in verification registries.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
