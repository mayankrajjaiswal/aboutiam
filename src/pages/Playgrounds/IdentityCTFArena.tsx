import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Terminal, ArrowRight, ShieldCheck, Play, Award
} from 'lucide-react'

type ChallengeType = 'jwt_none' | 'saml_ssw' | 'ldap_inject'

export default function IdentityCTFArena() {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeType>('jwt_none')
  
  // CTF Score tracking
  const [solvedChallenges, setSolvedChallenges] = useState<ChallengeType[]>([])
  const [cveLogs, setCveLogs] = useState<string[]>([])

  // --- CHALLENGE 1: JWT SIGNATURE BYPASS (alg: none) ---
  const [jwtHeader, setJwtHeader] = useState('{"alg":"RS256","typ":"JWT"}')
  const [jwtPayload, setJwtPayload] = useState('{"sub":"123456","name":"Alice","role":"user"}')
  const [jwtResultFlag, setJwtResultFlag] = useState<string | null>(null)

  // --- CHALLENGE 2: SAML SIGNATURE WRAPPING (SSW) ---
  const samlAssertedUser: string = 'user@company.local'
  const [sswAttackToggled, setSswAttackToggled] = useState(false)
  const [samlResultFlag, setSamlResultFlag] = useState<string | null>(null)

  // --- CHALLENGE 3: LDAP FILTER INJECTION ---
  const [ldapInput, setLdapInput] = useState('alice')
  const [ldapResultFlag, setLdapResultFlag] = useState<string | null>(null)

  const addLog = (msg: string) => {
    setCveLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const score = useMemo(() => {
    return solvedChallenges.length * 100
  }, [solvedChallenges])

  // --- JWT CHALLENGE SUBMIT ---
  const submitJwtChallenge = () => {
    addLog('Submitting JWT token payload to secure API Gateway endpoint /v1/admin/dashboard...')
    
    try {
      const headerObj = JSON.parse(jwtHeader)
      const payloadObj = JSON.parse(jwtPayload)

      addLog(`Gateway parsed header: alg="${headerObj.alg}"`)
      addLog(`Gateway parsed payload: role="${payloadObj.role}"`)

      if (headerObj.alg === 'none' && payloadObj.role === 'admin') {
        addLog('✓ Exploit Successful! Header alg parameter is set to "none" and payload role is elevated to "admin".')
        addLog('🔓 Access Granted! Gateway decrypted bypass payload and exposed the hidden flag!')
        setJwtResultFlag('FLAG{JWT_ALG_NONE_BYPASS_SUCCESS}')
        if (!solvedChallenges.includes('jwt_none')) {
          setSolvedChallenges(prev => [...prev, 'jwt_none'])
        }
      } else {
        if (payloadObj.role !== 'admin') {
          addLog('❌ Access Denied: User role is "user". Only "admin" accounts can access the restricted dashboard.')
        } else if (headerObj.alg !== 'none') {
          addLog('❌ Signature Verification Failed! Gateway attempted RS256 validation. Stolen signature did not match modulus components.')
        }
      }
    } catch (e) {
      addLog(`❌ Gateway Crash! Malformed token JSON structure: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // --- SAML CHALLENGE SUBMIT ---
  const submitSamlChallenge = () => {
    addLog('Submitting SAML 2.0 Assertion packet to Service Provider (SP) Assertion Consumer Service...')
    
    addLog(`SP parsed incoming <saml:NameID>: "${samlAssertedUser}"`)
    
    if (sswAttackToggled) {
      addLog('🚨 Attacker injected nested wrapped assertion structures into the SOAP envelope!')
      addLog('SP signature validator successfully verified the signature on the nested template (user@company.local).')
      addLog('SP application logic, however, read user credentials from the outer wrapped assertion (admin@company.local)!')
      addLog('✓ Exploit Successful! Signature Verification bypassed due to context mapping isolation gaps.')
      setSamlResultFlag('FLAG{SAML_SSW_INJECTION_SUCCESS}')
      if (!solvedChallenges.includes('saml_ssw')) {
        setSolvedChallenges(prev => [...prev, 'saml_ssw'])
      }
    } else {
      if (samlAssertedUser === 'admin@company.local') {
        addLog('❌ Signature Verification Failed! Private key signature on "admin@company.local" is missing or malformed.')
      } else {
        addLog('✓ Token verified. Logged in as standard user "user@company.local". No administrative privileges available.')
      }
    }
  }

  // --- LDAP CHALLENGE SUBMIT ---
  const submitLdapChallenge = () => {
    const rawQuery = `(&(objectClass=user)(userName=${ldapInput}))`
    addLog(`Executing Active Directory LDAP Search query: ${rawQuery}`)

    // Check for injection payload
    // Exploit: input 'admin)(objectClass=*' resulting in '(&(objectClass=user)(userName=admin)(objectClass=*))'
    // or input '*)(objectClass=*' which dumps all users
    const hasInjection = ldapInput.includes('admin)(') || ldapInput.includes('*') || ldapInput.includes(')(')

    if (hasInjection) {
      addLog('🚨 LDAP Injection detected! Attack query successfully rewrote LDAP filters tree boundaries.')
      addLog('AD Directory returned multiple nested nodes, dumping schema administrator secrets...')
      addLog('✓ Exploit Successful! Dumped AD node: CN=Administrator,cn=Users,dc=aboutiam,dc=local')
      setLdapResultFlag('FLAG{LDAP_FILTER_INJECTION_PWNED}')
      if (!solvedChallenges.includes('ldap_inject')) {
        setSolvedChallenges(prev => [...prev, 'ldap_inject'])
      }
    } else {
      addLog(`Directory matched exactly 1 record for user: ${ldapInput}. Security bounds remain closed.`)
    }
  }

  const resetLogs = () => {
    setCveLogs([])
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity CTF Hacking Arena</h1>
            <p className="text-xs text-text-secondary">Gamified security workbench where you execute and bypass token authentication controls entirely client-side</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Challenge list and Scorecard */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Scorecard panel */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">CTF Player Score</span>
              <span className="text-2xl font-black text-accent-primary block font-mono">{score} / 300 PTS</span>
              <div className="w-40 h-2 bg-bg-nested rounded-full overflow-hidden border border-border-subtle/40 mt-1.5">
                <div className="h-full bg-status-success transition-all duration-500" style={{ width: `${(solvedChallenges.length / 3) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="w-12 h-12 rounded-xl bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
          </div>

          {/* Hacking levels card list */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-lg space-y-3">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block border-b border-border-subtle pb-1">
              Hacking Levels
            </span>

            <div className="space-y-2">
              {/* Level 1: JWT none */}
              <button
                onClick={() => setActiveChallenge('jwt_none')}
                className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition ${activeChallenge === 'jwt_none' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                <div>
                  <span className="font-bold block">1. JWT Signature Bypass</span>
                  <span className="text-[10px] text-text-muted">Exploit: alg: none & role elevation</span>
                </div>
                {solvedChallenges.includes('jwt_none') && <span className="text-status-success font-black text-sm">SOLVED</span>}
              </button>

              {/* Level 2: SAML SSW */}
              <button
                onClick={() => setActiveChallenge('saml_ssw')}
                className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition ${activeChallenge === 'saml_ssw' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                <div>
                  <span className="font-bold block">2. SAML Signature Wrapping</span>
                  <span className="text-[10px] text-text-muted">Exploit: SSW outer payload injections</span>
                </div>
                {solvedChallenges.includes('saml_ssw') && <span className="text-status-success font-black text-sm">SOLVED</span>}
              </button>

              {/* Level 3: LDAP Injection */}
              <button
                onClick={() => setActiveChallenge('ldap_inject')}
                className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition ${activeChallenge === 'ldap_inject' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                <div>
                  <span className="font-bold block">3. LDAP Filter Injection</span>
                  <span className="text-[10px] text-text-muted">Exploit: Parameter string traversal</span>
                </div>
                {solvedChallenges.includes('ldap_inject') && <span className="text-status-success font-black text-sm">SOLVED</span>}
              </button>
            </div>
          </div>

        </div>

        {/* Right column: Sandbox and Exploit Board */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between min-h-[380px]">
            <div>
              {/* --- CHALLENGE 1 SCREEN --- */}
              {activeChallenge === 'jwt_none' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-border-subtle pb-2">
                    <h2 className="text-base font-black text-text-primary">Level 1: The JWT Signature Bypass</h2>
                    <p className="text-xs text-text-muted mt-0.5">Objective: Bypass signature validations by changing the header algorithm to "none" and elevating your payload role to "admin".</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">JWT Header (JSON)</label>
                      <textarea
                        value={jwtHeader}
                        onChange={e => setJwtHeader(e.target.value)}
                        className="w-full bg-bg-base border border-border-subtle rounded p-2.5 text-[10px] font-mono text-text-primary focus:outline-none focus:border-accent-primary resize-none h-24 leading-normal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">JWT Payload (JSON)</label>
                      <textarea
                        value={jwtPayload}
                        onChange={e => setJwtPayload(e.target.value)}
                        className="w-full bg-bg-base border border-border-subtle rounded p-2.5 text-[10px] font-mono text-text-primary focus:outline-none focus:border-accent-primary resize-none h-24 leading-normal"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-bg-base p-3 rounded-lg border border-border-subtle">
                    <span className="text-[10px] font-mono text-text-muted">TOKEN STR: <code className="text-accent-secondary">eyJhbGciOi...[modified_hash]...</code></span>
                    <button
                      onClick={submitJwtChallenge}
                      className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current animate-pulse" /> Submit Token to Gateway
                    </button>
                  </div>

                  {jwtResultFlag && (
                    <div className="p-4 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-3 animate-fadeIn">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-status-success animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Challenge Solved!</span>
                        <span className="text-xs text-text-primary leading-normal">Your flag: <code className="bg-bg-nested px-1.5 py-0.5 rounded font-mono font-bold text-status-success select-all">{jwtResultFlag}</code>. Copy this value to complete verification!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- CHALLENGE 2 SCREEN --- */}
              {activeChallenge === 'saml_ssw' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-border-subtle pb-2">
                    <h2 className="text-base font-black text-text-primary">Level 2: SAML Signature Wrapping (SSW)</h2>
                    <p className="text-xs text-text-muted mt-0.5">Objective: Bypass SAML validation and force the SaaS app to log you in as "admin@company.local" by toggling a wrapped envelope attack structure.</p>
                  </div>

                  <div className="bg-bg-base border border-border-subtle rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-text-muted uppercase block">SAML 2.0 XML Schema Payload preview</span>
                    
                    <pre className="text-[10px] font-mono text-text-secondary max-h-32 overflow-y-auto bg-bg-card p-3 rounded border border-border-subtle/50 leading-relaxed">
                      {sswAttackToggled ? `<!-- Attacker Wrapped Assertion Structure -->\n<saml2p:Response>\n  <saml2:Assertion ID="ForgedAdminAssertion">\n    <saml2:Subject>\n      <saml2:NameID>admin@company.local</saml2:NameID>\n    </saml2:Subject>\n  </saml2:Assertion>\n  <!-- Original signed user assertion wrapper -->\n  <saml2:Assertion ID="SignedUserAssertion" ...>` : `<!-- Standard SAML Assertion payload -->\n<saml2p:Response>\n  <saml2:Assertion ID="SignedUserAssertion">\n    <saml2:Subject>\n      <saml2:NameID>user@company.local</saml2:NameID>\n    </saml2:Subject>\n  </saml2:Assertion>\n</saml2p:Response>`}
                    </pre>

                    <div className="flex items-center justify-between border-t border-border-subtle/40 pt-3">
                      <div>
                        <span className="block text-xs font-bold text-text-primary">Signature Wrapping Exploit</span>
                        <span className="text-[10px] text-text-muted">Duplicate assertions in envelopes to confuse parser context mappings</span>
                      </div>

                      <button
                        onClick={() => setSswAttackToggled(!sswAttackToggled)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition ${sswAttackToggled ? 'bg-status-danger text-white' : 'bg-bg-nested hover:bg-border-subtle text-text-secondary'}`}
                      >
                        {sswAttackToggled ? 'EXPLOIT ARMED' : 'ARM EXPLOIT'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={submitSamlChallenge}
                      className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Submit Assertion to SP
                    </button>
                  </div>

                  {samlResultFlag && (
                    <div className="p-4 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-3 animate-fadeIn">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-status-success animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Challenge Solved!</span>
                        <span className="text-xs text-text-primary leading-normal">Your flag: <code className="bg-bg-nested px-1.5 py-0.5 rounded font-mono font-bold text-status-success select-all">{samlResultFlag}</code>. Copy this value!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- CHALLENGE 3 SCREEN --- */}
              {activeChallenge === 'ldap_inject' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-border-subtle pb-2">
                    <h2 className="text-base font-black text-text-primary">Level 3: LDAP Filter Query Injection</h2>
                    <p className="text-xs text-text-muted mt-0.5">Objective: Bypass validation limits and dump the AD directory administrator secrets by injecting logical modifiers into user input fields.</p>
                  </div>

                  <div className="bg-bg-base border border-border-subtle rounded-xl p-4 space-y-3 font-mono text-[11px]">
                    <div>
                      <span className="text-text-muted block text-[10px] font-bold mb-1 uppercase">Directory Active Directory LDAP Query Template</span>
                      <code className="text-text-primary bg-bg-card border border-border-subtle/50 px-2 py-1.5 rounded block font-mono">
                        (&amp;(objectClass=user)(userName=<span className="text-accent-secondary">{ldapInput || 'INPUT_HERE'}</span>))
                      </code>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">User Search Input Parameter</label>
                      <input
                        type="text"
                        value={ldapInput}
                        onChange={e => setLdapInput(e.target.value)}
                        placeholder="e.g. alice"
                        className="w-full bg-bg-card border border-border-subtle/80 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={submitLdapChallenge}
                      className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Execute Active Query
                    </button>
                  </div>

                  {ldapResultFlag && (
                    <div className="p-4 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-3 animate-fadeIn">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-status-success animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Challenge Solved!</span>
                        <span className="text-xs text-text-primary leading-normal">Your flag: <code className="bg-bg-nested px-1.5 py-0.5 rounded font-mono font-bold text-status-success select-all">{ldapResultFlag}</code>. Copy this value!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Simulated AD CTF Log terminal */}
            <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-xs text-text-primary h-36 overflow-y-auto mt-4">
              <div className="flex justify-between items-center border-b border-border-subtle pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5" /> CTF Active Connection Trace Logs
                </div>
                {cveLogs.length > 0 && (
                  <button onClick={resetLogs} className="text-[9px] text-text-muted hover:text-text-primary">Clear Console</button>
                )}
              </div>
              {cveLogs.length === 0 ? (
                <span className="text-text-muted italic select-none">Console ready. Trigger an exploit submission to record connection traces.</span>
              ) : (
                cveLogs.map((log, idx) => (
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
