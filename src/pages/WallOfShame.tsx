import { useState, useEffect } from 'react'
import { 
  ShieldAlert, Smartphone, Globe, Sparkles
} from 'lucide-react'

type MuseumTab = 'evolution' | 'breaches' | 'resources'

export default function WallOfShame() {
  const [activeTab, setActiveTab] = useState<MuseumTab>('evolution')
  const [activeEra, setActiveEra] = useState(0)
  const [activeLab, setActiveLab] = useState<'goldensaml' | 'pushfatigue' | 'wildcard' | 'oktahar' | 'silversaml' | 'lastpass'>('goldensaml')

  // Set visited flag on mount
  useEffect(() => {
    localStorage.setItem('aboutiam-museum-visited', 'true')
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as MuseumTab | null
      const lab = params.get('lab') as 'goldensaml' | 'pushfatigue' | 'wildcard' | 'oktahar' | 'silversaml' | 'lastpass' | null
      if (tab === 'evolution' || tab === 'breaches' || tab === 'resources') {
        setTimeout(() => {
          setActiveTab(tab)
        }, 0)
      }
      if (lab && ['goldensaml', 'pushfatigue', 'wildcard', 'oktahar', 'silversaml', 'lastpass'].includes(lab)) {
        setTimeout(() => {
          setActiveLab(lab)
          setActiveTab('breaches')
        }, 0)
      }
    }
  }, [])

  // Golden SAML Lab State
  const [samlStep, setSamlStep] = useState(0)
  const [signingKeyStolen, setSigningKeyStolen] = useState(false)
  const [forgedToken, setForgedToken] = useState('')

  // Push Fatigue Lab State
  const [pushCount, setPushCount] = useState(0)
  const [numberMatchingEnforced, setNumberMatchingEnforced] = useState(false)
  const [userCode] = useState('42')
  const [typedCode, setTypedCode] = useState('')
  const [bombingActive, setBombingActive] = useState(false)

  // Wildcard Redirect Lab State
  const [redirectPattern, setRedirectPattern] = useState('https://*.attacker-domain.com')
  const [leakedCode, setLeakedCode] = useState<string | null>(null)

  // Okta HAR Theft Lab State
  const [harStolenCookie, setHarStolenCookie] = useState('')
  const [harMitigationActive, setHarMitigationActive] = useState(false)

  // Silver SAML Lab State
  const [silverSamlStep, setSilverSamlStep] = useState(0)
  const [silverStolenAppKey, setSilverStolenAppKey] = useState(false)

  // LastPass Vault Lab State
  const [lastpassIterations, setLastPassIterations] = useState(5000)

  // --- TAB 1: EVOLUTION OF IAM DATA ---
  const eras = [
    {
      title: '1. The Mainframe Era (1960s-1980s)',
      boundary: 'Physical Borders & terminal Passwords',
      desc: 'Users authenticated via simple, flat username/password strings on physical dummy terminals wired directly to massive, isolated corporate mainframes.',
      fact: 'Fun Identity Fact: In 1961, MIT\'s Compatible Time-Sharing System (CTSS) introduced the first computer password to limit mainframe terminal time. However, researcher Fernando Corbató\'s team bypassed it immediately by printing out the master password file to share game terminals!',
      tech: 'Symmetric local hash files, physical badges'
    },
    {
      title: '2. The Directory Network Era (1990s)',
      boundary: 'Network Border & Corporate Firewalls',
      desc: 'The rise of client-server networks. Organizations centralized users inside hierarchical LDAP directory servers and Microsoft Active Directory domains, validating logins via Kerberos ticket exchanges.',
      fact: 'Fun Identity Fact: Microsoft Active Directory (released in 1999) was named "Active" to contrast with static phone directories. It was built to let network elements update themselves dynamically, which laid the groundwork for modern automated CRUD loops.',
      tech: 'LDAP trees, AD Domain Controllers, Kerberos ticketing'
    },
    {
      title: '3. The Web & Federation Era (2000s)',
      boundary: 'SAML XML Federated Trust Borders',
      desc: 'As corporate applications moved to the web, XML-based SAML 2.0 and WS-Federation standards were introduced to allow users to log in once (SSO) and securely federate identity across separate company borders.',
      fact: 'Fun Identity Fact: The Kerberos protocol (from 1989) is named after Cerberus, the multi-headed dog in Greek mythology that guards the underworld. In the protocol, the three "heads" correspond to the Client, Server, and Key Distribution Center (KDC)—all three must trust each other for access to be granted.',
      tech: 'SAML 2.0 assertions, XML Digital Signatures (DSIG), WS-Fed'
    },
    {
      title: '4. The Cloud & Mobile Era (2010s)',
      boundary: 'SaaS APIs & Hybrid Identity Providers (IDaaS)',
      desc: 'The explosion of smartphones and SaaS (AWS, Microsoft 365) demanded lightweight, REST-friendly identity layers. OAuth 2.0 and OpenID Connect (OIDC) replaced heavy XML with compact JSON Web Tokens (JWT).',
      fact: 'Fun Identity Fact: The "JSON Web Token" (JWT) was originally proposed as an alternative to SAML because developers were tired of writing complex, heavy XML parsers. It was structured specifically to fit easily into URL query strings and HTTP Authorization headers without breaking.',
      tech: 'OAuth 2.1, OIDC, JWT payloads, JWKS public keys'
    },
    {
      title: '5. Zero Trust Security Era (2020s-Present)',
      boundary: 'Identity is the Perimeter ("Never Trust, Always Verify")',
      desc: 'Traditional network firewalls are dead. Modern security models evaluate risk continuously in real-time, monitoring device posture, network locations, and phishing-resistant biometric Passkeys.',
      fact: 'Fun Identity Fact: Passkeys (FIDO2/WebAuthn) completely eliminate the "credential" on the server. Because they rely on asymmetric key pairs, there is no shared secret stored in the cloud. Even if an attacker completely compromises the website\'s database, they find zero passwords to steal!',
      tech: 'NIST SP 800-207, CAEP SSF events, FIDO2 WebAuthn Passkeys'
    }
  ]

  // Handle push fatigue bombing simulation
  useEffect(() => {
    if (!bombingActive) return

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      setPushCount(prev => {
        const next = prev + 1
        if (next >= 10) {
          clearInterval(interval)
          setBombingActive(false)
        }
        return next
      })
    }, 800)
    return () => clearInterval(interval)
  }, [bombingActive])

  const triggerPushBombing = () => {
    setPushCount(0)
    setBombingActive(true)
  }

  // Handle OAuth wildcard redirect exploit simulation
  const runRedirectExploit = () => {
    if (redirectPattern.includes('*')) {
      setLeakedCode('auth_code_hijacked_99a1')
    } else {
      setLeakedCode(null)
    }
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-danger uppercase tracking-wider bg-status-danger/10 px-2.5 py-1 rounded-full border border-status-danger/20">
          <ShieldAlert className="w-3.5 h-3.5 text-status-danger" /> Identity Museum
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-none">
          Historical Evolution & Breach Museum
        </h2>
        <p className="text-text-secondary">
          Explore the chronological evolution of IAM over 50 years. Visit the interactive breach museum to deconstruct Golden SAML hacks, push-bombing fatigue, and wildcard redirects.
        </p>
      </div>

      {/* Museum Sub-Navigation Tabs */}
      <div className="flex gap-2 bg-bg-card p-1.5 rounded-xl border border-border-subtle w-fit shadow-sm relative z-10">
        {[
          { id: 'evolution', label: '🏛️ The IAM Evolution Timeline' },
          { id: 'breaches', label: '💣 Interactive Breach Labs' },
          { id: 'resources', label: '🌐 Global Resource Index' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as MuseumTab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.id 
                ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/10' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: THE HISTORICAL TIMELINE --- */}
      {activeTab === 'evolution' && (
        <div className="grid lg:grid-cols-4 gap-8 pt-2 animate-fadeIn relative z-10">
          {/* Timeline slider steps */}
          <div className="lg:col-span-1 space-y-3 border-l-2 border-border-subtle ml-3 pl-4">
            {eras.map((era, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 transition-all ${
                  activeEra === idx ? 'bg-accent-primary border-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-bg-base border-border-subtle'
                }`}></div>
                <button
                  onClick={() => setActiveEra(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeEra === idx
                      ? 'bg-accent-glow border-accent-primary/30 shadow-sm'
                      : 'bg-bg-card border-border-subtle hover:border-accent-primary/20'
                  }`}
                >
                  <span className="block font-black text-sm text-text-primary">{era.title.substring(3)}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Active Era Description Pane */}
          <div className="lg:col-span-3">
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-1.5 border-b border-border-subtle pb-6 relative z-10">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">IAM History Corridor</span>
                <h3 className="text-3xl font-black text-text-primary">{eras[activeEra].title}</h3>
                <p className="text-sm text-accent-primary font-bold uppercase tracking-wider">Perimeter: {eras[activeEra].boundary}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 relative z-10 text-xs sm:text-sm">
                {/* Core description */}
                <div className="p-6 bg-bg-sidebar/50 rounded-xl border border-border-subtle space-y-4">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Era Overview</span>
                  <p className="text-text-secondary leading-relaxed font-semibold">
                    {eras[activeEra].desc}
                  </p>
                  <div className="pt-2 border-t border-border-subtle/50 text-[10px] font-bold text-text-muted uppercase font-mono">
                    Core tech: {eras[activeEra].tech}
                  </div>
                </div>

                {/* Fun fact card */}
                <div className="p-6 bg-accent-glow/5 border border-accent-primary/20 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-primary" /> Fun Identity Trivia
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold italic">
                    {eras[activeEra].fact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: INTERACTIVE BREACH LABS --- */}
      {activeTab === 'breaches' && (
        <div className="grid lg:grid-cols-4 gap-8 pt-2 animate-fadeIn relative z-10">
          {/* Sub-menu of Labs */}
          <div className="lg:col-span-1 space-y-2">
            {([
              { id: 'goldensaml', label: '🇷🇺 SolarWinds: Golden SAML', sub: 'Russian Nobelium attack (2020)' },
              { id: 'pushfatigue', label: '📱 MFA Push Fatigue Bombing', sub: 'Uber/Cisco password overrides (2022)' },
              { id: 'wildcard', label: '🔗 OAuth Wildcard Redirects', sub: 'Front-channel URL interceptions' },
              { id: 'oktahar', label: '🚫 Okta 2023: Support HAR Theft', sub: 'Session cookie hijacking via logs (2023)' },
              { id: 'silversaml', label: '🥈 Entra ID: Silver SAML', sub: 'Target App Signing Key Theft (2024)' },
              { id: 'lastpass', label: '🔑 LastPass: Offline Vault Cracking', sub: 'Weak PBKDF2 Iterations (2022)' }
            ] as { id: 'goldensaml' | 'pushfatigue' | 'wildcard' | 'oktahar' | 'silversaml' | 'lastpass'; label: string; sub: string }[]).map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setActiveLab(l.id)
                  setSamlStep(0)
                  setSigningKeyStolen(false)
                  setForgedToken('')
                  setHarStolenCookie('')
                  setHarMitigationActive(false)
                  setSilverSamlStep(0)
                  setSilverStolenAppKey(false)
                  setLastPassIterations(5000)
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeLab === l.id
                    ? 'border-status-danger bg-status-danger/5 text-status-danger shadow-sm'
                    : 'border-border-subtle bg-bg-card hover:border-status-danger/20'
                }`}
              >
                <span className={`block font-black text-sm ${activeLab === l.id ? 'text-status-danger' : 'text-text-primary'}`}>{l.label}</span>
                <span className="block text-[10px] text-text-muted font-bold uppercase mt-1">{l.sub}</span>
              </button>
            ))}
          </div>

          {/* Active Lab Board */}
          <div className="lg:col-span-3">
            {/* LAB 1: GOLDEN SAML */}
            {activeLab === 'goldensaml' && (
              <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                <div className="space-y-1.5 border-b border-border-subtle pb-6">
                  <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">SUPPLY CHAIN VULNERABILITY LAB</span>
                  <h3 className="text-2xl font-black text-text-primary">SolarWinds "Golden SAML" Attack</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    The SolarWinds Orion backdoor (SUNBURST) granted attackers administrative access on-premises. From there, they extracted the AD FS token-signing certificate to forge SAML assertions offline, bypassing MFA completely and taking over Microsoft 365 cloud networks.
                  </p>
                </div>

                {/* Golden SAML Handshake steps */}
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Attack Stepper Simulator</span>
                    <div className="space-y-2 text-xs">
                      {/* Step 1 */}
                      <button 
                        onClick={() => { setSamlStep(0); setSigningKeyStolen(true) }}
                        className={`w-full text-left p-3.5 rounded-lg border font-semibold transition-all ${
                          samlStep >= 0 ? 'border-status-danger bg-status-danger/5 text-status-danger' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        1. Extract Private Token-Signing Key from AD FS
                      </button>
                      
                      {/* Step 2 */}
                      <button 
                        disabled={!signingKeyStolen}
                        onClick={() => { setSamlStep(1); setForgedToken('eyJhbGciOiJSUzI1NiIsImtpZCI6InNvbGFyd2luZHMifQ.eyJzdWIiOiJhZG1pbiIsIm1mYSI6ImJ5cGFzc2VkIn0.forged_signature_bits...') }}
                        className={`w-full text-left p-3.5 rounded-lg border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          samlStep >= 1 ? 'border-status-danger bg-status-danger/5 text-status-danger font-bold' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        2. Forge Signed Assertions Offline (Bypass AuthN)
                      </button>

                      {/* Step 3 */}
                      <button 
                        disabled={!forgedToken}
                        onClick={() => setSamlStep(2)}
                        className={`w-full text-left p-3.5 rounded-lg border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          samlStep >= 2 ? 'border-status-danger bg-status-danger/5 text-status-danger font-bold' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        3. Present Token to Cloud (M365/AWS) $\rightarrow$ Cloud Hijack
                      </button>
                    </div>
                  </div>

                  {/* Visual Output terminal */}
                  <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-4 font-mono text-xs min-h-[180px] flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/30 pb-1.5">Off-Line Attacker Shell</span>
                    {samlStep === 0 && (
                      <div className="space-y-2">
                        <p className="text-status-danger">➜ AD FS private signing certificate found!</p>
                        <p className="text-text-secondary">Key: [cert_private_key_stolen_nobelium.pem]</p>
                        <p className="text-text-muted italic text-[10px]">Attacker now holds the master signature keys to your entire cloud universe.</p>
                      </div>
                    )}
                    {samlStep === 1 && (
                      <div className="space-y-2">
                        <p className="text-status-danger">➜ Signed SAML XML generated offline!</p>
                        <p className="text-text-secondary truncate">Assertion: {forgedToken}</p>
                        <p className="text-text-muted italic text-[10px]">No login event occurred on AD FS. No logs generated. MFA bypassed.</p>
                      </div>
                    )}
                    {samlStep === 2 && (
                      <div className="space-y-2 text-center py-4">
                        <p className="text-status-danger font-black uppercase text-base tracking-widest animate-bounce">🚨 CLOUD HIJACKED!</p>
                        <p className="text-xs text-text-primary font-bold">Attacker authenticated as global admin inside victim's Office 365 tenant.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LAB 2: PUSH BOMBING */}
            {activeLab === 'pushfatigue' && (
              <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                <div className="space-y-1.5 border-b border-border-subtle pb-6">
                  <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">HUMAN RISK SIMULATOR</span>
                  <h3 className="text-2xl font-black text-text-primary">MFA Push Fatigue (Prompt Bombing)</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    Spamming an employee's smartphone with push approval notifications until they click "Approve" due to frustration is a major attack vector (weaponized in Uber and Cisco hacks). Enforcing "Number Matching" completely mitigates this human failure loop.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center justify-around">
                  {/* Smartphone emulator */}
                  <div className="flex flex-col items-center justify-center">
                    <div className={`w-52 h-[280px] rounded-3xl border-4 border-text-primary bg-bg-sidebar relative p-4 flex flex-col justify-between shadow-2xl transition-all ${
                      bombingActive && 'animate-shake'
                    }`}>
                      <div className="w-16 h-3 bg-text-primary rounded-full mx-auto"></div> {/* Notch */}
                      
                      <div className="flex-grow flex flex-col items-center justify-center text-center mt-4">
                        <Smartphone className={`w-12 h-12 text-accent-primary ${bombingActive && 'animate-bounce'}`} />
                        {bombingActive ? (
                          <div className="p-3 bg-accent-glow border border-accent-primary/20 rounded-xl mt-3 space-y-2 animate-fadeIn relative z-10">
                            <span className="text-[10px] font-black uppercase block text-accent-primary animate-pulse">Push Spam Active</span>
                            
                            {numberMatchingEnforced ? (
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-text-secondary uppercase">Enter code shown on screen:</label>
                                <input 
                                  type="text" 
                                  value={typedCode}
                                  onChange={(e) => setTypedCode(e.target.value)}
                                  className="w-12 p-1 rounded bg-bg-card border border-border-subtle font-mono text-center text-xs font-bold text-text-primary focus:outline-none focus:border-accent-primary" 
                                  maxLength={2} 
                                />
                                {typedCode === userCode ? (
                                  <button onClick={() => { setBombingActive(false); setPushCount(0); setTypedCode('') }} className="w-full py-1 bg-status-success text-white text-[8px] font-bold rounded">Submit</button>
                                ) : (
                                  <p className="text-[8px] text-text-muted">Type '{userCode}'</p>
                                )}
                              </div>
                            ) : (
                              <div className="flex gap-1.5 justify-center">
                                <button onClick={() => { setBombingActive(false); setPushCount(0) }} className="px-2.5 py-1 rounded bg-status-danger text-white text-[8px] font-black uppercase shadow">Approve</button>
                                <button onClick={() => setPushCount(prev => prev + 1)} className="px-2.5 py-1 rounded border border-border-subtle bg-bg-card text-text-secondary text-[8px] font-bold">Decline</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] font-bold text-text-muted mt-2">Phone is Silent</p>
                        )}
                      </div>

                      {/* Home bar */}
                      <div className="w-20 h-1 bg-text-primary/20 rounded-full mx-auto mt-2"></div>
                    </div>
                  </div>

                  {/* Controls & Metrics */}
                  <div className="space-y-5 text-xs font-semibold text-text-secondary">
                    <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-3">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Security Shield</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="num-matching" 
                          checked={numberMatchingEnforced} 
                          onChange={(e) => {
                            setNumberMatchingEnforced(e.target.checked)
                            setBombingActive(false)
                            setPushCount(0)
                          }}
                          className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary" 
                        />
                        <label htmlFor="num-matching" className="text-xs font-bold text-text-primary">Enforce "Number Matching" MFA</label>
                      </div>
                    </div>

                    <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-3">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Simulator Parameters</span>
                      <div className="flex justify-between items-center text-xs">
                        <span>Spam notification count:</span>
                        <span className="font-bold font-mono text-status-danger text-base">{pushCount} / 10</span>
                      </div>
                      <button
                        onClick={triggerPushBombing}
                        disabled={bombingActive}
                        className="w-full py-2 bg-status-danger hover:bg-status-danger/90 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-status-danger/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Fire Push Attack Spam
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAB 3: WILDCARD REDIRECTS */}
            {activeLab === 'wildcard' && (
              <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                <div className="space-y-1.5 border-b border-border-subtle pb-6">
                  <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">FRONT-CHANNEL HIJACKING LAB</span>
                  <h3 className="text-2xl font-black text-text-primary">OAuth Wildcard Redirect Hijacks</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    If an Authorization Server is misconfigured to allow wildcard redirects (e.g. `https://*.attacker-domain.com`), an attacker can register a rogue subdomain to intercept front-channel URL redirects and steal the Single Sign-On authorization codes.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Redirect Configuration</span>
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1.5">
                        <label className="block font-bold text-text-secondary uppercase">Allowed Redirect URL pattern</label>
                        <select 
                          value={redirectPattern} 
                          onChange={(e) => {
                            setRedirectPattern(e.target.value)
                            setLeakedCode(null)
                          }}
                          className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-[10px]"
                        >
                          <option value="https://*.attacker-domain.com">Insecure Wildcard (*.attacker-domain.com)</option>
                          <option value="https://aboutiam.com/callback">Secure Exact Match (aboutiam.com/callback)</option>
                        </select>
                      </div>
                      <button
                        onClick={runRedirectExploit}
                        className="w-full py-2 bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        Trigger Redirect Handshake
                      </button>
                    </div>
                  </div>

                  {/* Terminal output */}
                  <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle font-mono text-xs min-h-[160px] flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/30 pb-1.5">Rogue Subdomain Server Terminal</span>
                    {leakedCode ? (
                      <div className="space-y-2 animate-fadeIn">
                        <p className="text-status-danger font-bold">➜ EXPLOIT SUCCESS: Code Intercepted!</p>
                        <p className="text-text-primary p-2 bg-bg-nested rounded border border-border-subtle text-[10px] truncate">
                          URI: https://subdomain.attacker-domain.com/cb?code={leakedCode}
                        </p>
                        <p className="text-text-muted italic text-[9px]">Attacker can now exchange this code for your access token.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-text-muted py-4 text-center font-sans">
                        <p>No Interceptions.</p>
                        <p className="text-[10px]">Secure redirects enforce strict, character-by-character matches.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LAB 4: OKTA HAR SUPPORT THEFT */}
            {activeLab === 'oktahar' && (
              <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                <div className="space-y-1.5 border-b border-border-subtle pb-6">
                  <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">SUPPORT LOG INTEGRITY VULNERABILITY</span>
                  <h3 className="text-2xl font-black text-text-primary">Okta Support Portal HAR Cookie Theft</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    In 2023, threat actors compromised Okta\'s customer support database. They extracted uploaded HTTP Archive (HAR) troubleshooting logs containing valid administrative session cookies (such as `sid=okta_admin_99c1`). The attackers then loaded these cookies into their own browsers to hijack enterprise portals without triggering MFA!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Simulator Controls</span>
                    
                    <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-3 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="har-mitigation" 
                          checked={harMitigationActive} 
                          onChange={(e) => {
                            setHarMitigationActive(e.target.checked)
                            setHarStolenCookie('')
                          }}
                          className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary" 
                        />
                        <label htmlFor="har-mitigation" className="text-xs font-bold text-text-primary">Sanitize & Redact Headers before Uploading</label>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (harMitigationActive) {
                          setHarStolenCookie('REDACTED (Access Token Removed)')
                        } else {
                          setHarStolenCookie('sid=okta_admin_99c1_auth_token_stolen')
                        }
                      }}
                      className="w-full py-2 bg-status-danger hover:bg-status-danger/90 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Analyze & Extract Session Cookie from HAR file
                    </button>
                  </div>

                  {/* Terminal Output */}
                  <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle font-mono text-xs min-h-[160px] flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/30 pb-1.5">Attacker Cookie Parser Terminal</span>
                    {harStolenCookie ? (
                      <div className="space-y-2 animate-fadeIn">
                        {harMitigationActive ? (
                          <>
                            <p className="text-status-success font-bold">➜ HAR SANITIZED SUCCESSFULLY</p>
                            <p className="text-text-muted text-[10px]">No session tokens or active cookies were detected inside the HTTP headers. Upload is completely secure.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-status-danger font-bold">➜ EXPLOIT SUCCESS: Session Hijacked!</p>
                            <p className="text-text-primary p-2 bg-bg-nested rounded border border-border-subtle text-[10px] break-all select-all">
                              Cookie extracted: {harStolenCookie}
                            </p>
                            <p className="text-text-muted italic text-[9px]">The attacker successfully bypassed MFA by injecting this valid session token directly into their browser cookies.</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-text-muted py-4 text-center font-sans">
                        <p>Awaiting HAR upload simulation…</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side-by-side Remediation Code */}
                <div className="border-t border-border-subtle/30 pt-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Vulnerable vs. Secure Code Deconstruction</span>
                  <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed">
                    <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-text-secondary rounded-lg">
                      <p className="font-bold text-status-danger mb-1.5">// Vulnerable: Writing Raw Headers to Logs</p>
                      <pre className="text-[10px] bg-bg-nested p-2 rounded overflow-x-auto select-all">
{`// Logs full HTTP headers to HAR file
const harLog = {
  request: {
    url: req.url,
    headers: req.headers // UNSAFE: Includes Cookie & Auth!
  }
};`}
                      </pre>
                    </div>
                    <div className="p-4 bg-status-success/5 border border-status-success/10 text-text-secondary rounded-lg">
                      <p className="font-bold text-status-success mb-1.5">// Secure Remediation: Header Sanitization</p>
                      <pre className="text-[10px] bg-bg-nested p-2 rounded overflow-x-auto select-all">
{`// Sanitizes headers before logging
const sanitizeHeaders = (headers) => {
  const sensitive = ['authorization', 'cookie', 'set-cookie'];
  return headers.map(h => 
    sensitive.includes(h.name.toLowerCase()) 
      ? { name: h.name, value: "[REDACTED]" } 
      : h
  );
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAB 5: SILVER SAML 2024 */}
            {activeLab === 'silversaml' && (
              <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                <div className="space-y-1.5 border-b border-border-subtle pb-6">
                  <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">ENTERPRISE FEDERATION VULNERABILITY</span>
                  <h3 className="text-2xl font-black text-text-primary">Entra ID "Silver SAML" Attack</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    In 2024, researchers disclosed "Silver SAML". Unlike Golden SAML which requires stealing the IdP\'s master token-signing key, Silver SAML exploits custom self-signed application signing keys. If an attacker gains access to the specific signing key of an enterprise application integration, they can forge SAML assertions strictly for that app, completely bypassing Entra ID’s central domain controller and MFA!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Attack Stepper Simulator</span>
                    <div className="space-y-2 text-xs">
                      <button 
                        onClick={() => { setSilverSamlStep(0); setSilverStolenAppKey(true) }}
                        className={`w-full text-left p-3 rounded-lg border font-semibold transition-all ${
                          silverSamlStep >= 0 ? 'border-status-danger bg-status-danger/5 text-status-danger font-bold' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        1. Extract Targeted SaaS App Key from local backup
                      </button>
                      <button 
                        disabled={!silverStolenAppKey}
                        onClick={() => setSilverSamlStep(1)}
                        className={`w-full text-left p-3 rounded-lg border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          silverSamlStep >= 1 ? 'border-status-danger bg-status-danger/5 text-status-danger font-bold' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        2. Forge Signed SAML Assertion strictly for that SaaS app
                      </button>
                      <button 
                        disabled={silverSamlStep < 1}
                        onClick={() => setSilverSamlStep(2)}
                        className={`w-full text-left p-3 rounded-lg border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          silverSamlStep >= 2 ? 'border-status-danger bg-status-danger/5 text-status-danger font-bold' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        3. Present forged token to target app Gateway $\rightarrow$ Local App Takeover
                      </button>
                    </div>
                  </div>

                  {/* Terminal Output */}
                  <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle font-mono text-xs min-h-[160px] flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/30 pb-1.5">Offline Attacker Toolkit</span>
                    {silverSamlStep === 0 && (
                      <div className="space-y-2 animate-fadeIn">
                        <p className="text-status-danger">➜ TARGET APP SIGNING KEY RETRIEVED</p>
                        <p className="text-text-secondary">Key: [target_app_saml_signing_key.pfx]</p>
                        <p className="text-text-muted text-[10px] italic">You can now sign SAML Responses locally. Bypasses central Entra ID audits.</p>
                      </div>
                    )}
                    {silverSamlStep === 1 && (
                      <div className="space-y-2 animate-fadeIn">
                        <p className="text-status-danger">➜ FORGED SAML ASSERTION READY</p>
                        <p className="text-text-muted text-[10px] break-all select-all">{"<saml:Assertion ID=\"_stolen_app_assertion_99\" ...>"}</p>
                      </div>
                    )}
                    {silverSamlStep === 2 && (
                      <div className="space-y-2 text-center py-4 animate-fadeIn">
                        <p className="text-status-danger font-black uppercase text-sm tracking-widest animate-bounce">🚨 APP CO-OPTED!</p>
                        <p className="text-xs text-text-primary font-bold">Successfully logged in as administrator on the targeted SaaS tool (e.g. Salesforce or AWS Portal) offline.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Secure Code Deconstruction */}
                <div className="border-t border-border-subtle/30 pt-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Vulnerable vs. Secure Code Deconstruction</span>
                  <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed">
                    <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-text-secondary rounded-lg">
                      <p className="font-bold text-status-danger mb-1.5">// Vulnerable: Self-Signed Key with weak verification</p>
                      <pre className="text-[10px] bg-bg-nested p-2 rounded overflow-x-auto select-all">
{`// Accepts any self-signed assertion
const verifySAML = (xml) => {
  const cert = getCertFromXML(xml);
  return crypto.verify(xml, cert); // UNSAFE!
};`}
                      </pre>
                    </div>
                    <div className="p-4 bg-status-success/5 border border-status-success/10 text-text-secondary rounded-lg">
                      <p className="font-bold text-status-success mb-1.5">// Secure Remediation: Metadata Pinning</p>
                      <pre className="text-[10px] bg-bg-nested p-2 rounded overflow-x-auto select-all">
{`// Enforces strictly pinned IdP certificate
const verifySAML = (xml) => {
  const trustedCert = getPinnedCertFromMetadata();
  return crypto.verify(xml, trustedCert); // SECURE!
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAB 6: LASTPASS OFFLINE VAULT CRACKING */}
            {activeLab === 'lastpass' && (
              <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                <div className="space-y-1.5 border-b border-border-subtle pb-6">
                  <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">PASSWORD CRYPTOGRAPHY VULNERABILITY</span>
                  <h3 className="text-2xl font-black text-text-primary">LastPass Vault Extraction & PBKDF2 Iterations</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    In 2022, threat actors compromised LastPass backup vaults. While vaults were encrypted, older corporate accounts utilized outdated, low PBKDF2 iteration counts (such as 5,000 or less). This allowed attackers to run highly optimized offline brute-force attacks on hijacked GPUs, cracking master passwords in seconds. Setting iterations to the OWASP-recommended 600,000+ renders offline dictionary attacks impractically slow.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center justify-around">
                  {/* Slider Control */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Simulator Parameters</span>
                    
                    <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-3">
                      <label htmlFor="iteration-slider" className="block text-xs font-bold text-text-primary flex justify-between">
                        <span>PBKDF2 Iteration Count:</span>
                        <span className="font-mono text-accent-primary font-black">{lastpassIterations.toLocaleString()}</span>
                      </label>
                      <input 
                        type="range" 
                        id="iteration-slider"
                        min="1000" 
                        max="600000" 
                        step="5000" 
                        value={lastpassIterations} 
                        onChange={(e) => setLastPassIterations(Number(e.target.value))}
                        className="w-full accent-accent-primary bg-bg-nested rounded-lg appearance-none h-1.5 cursor-pointer" 
                      />
                    </div>

                    <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-1.5 text-xs font-semibold leading-relaxed">
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Estimated Offline Cracking Time</p>
                      <p className="text-lg font-black text-status-danger animate-pulse">
                        {lastpassIterations <= 5000 ? '⏱️ Under 5 Seconds (Instantly Cracked)' : 
                         lastpassIterations <= 100000 ? '⏱️ Under 12 Hours' : 
                         lastpassIterations <= 300000 ? '⏱️ Under 4 Months' : '⏱️ 450+ Years (Impractically Slow)'}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1 leading-normal">Cracking speed calculated assuming attacker uses a standard GPU hash-cracker dictionary rig.</p>
                    </div>
                  </div>

                  {/* Secure Code Deconstruction */}
                  <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3 font-mono text-xs">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/30 pb-1.5">Symmetric Key Stretching (TS)</span>
                    <p className="text-[10px] text-text-secondary leading-relaxed">
                      To prevent offline dictionary attacks, the key-derivation routine must stretch passwords using massive iteration loops:
                    </p>
                    <pre className="text-[9px] bg-bg-nested p-2.5 rounded border border-border-subtle/50 text-text-primary select-all leading-normal">
{`// Secure PBKDF2 stretching via Web Crypto
const deriveKey = async (pass, salt) => {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pass),
    'PBKDF2', false, ['deriveBits']
  );
  return crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt,
    iterations: 600000 // OWASP Standard!
  }, base, 256);
};`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: GLOBAL RESOURCE INDEX --- */}
      {activeTab === 'resources' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 animate-fadeIn relative z-10">
          {[
            {
              name: 'Identity Defined Security Alliance (IDSA)',
              desc: 'The leading vendor-neutral association providing free identity-centric blueprints, Zero Trust frameworks, and best practices.',
              link: 'https://www.idsalliance.org/'
            },
            {
              name: 'Kantara Initiative',
              desc: 'Global digital trust communities defining digital ID frameworks, standard specifications, and privacy profiles.',
              link: 'https://kantarainitiative.org/'
            },
            {
              name: 'OAuth.net (by Aaron Parecki)',
              desc: 'The definitive open-source bible for modern API, single-page app, and mobile OAuth 2.0/2.1 standards.',
              link: 'https://oauth.net/'
            },
            {
              name: 'Cerbos Tech Blog',
              desc: 'Hardcore technical tutorials regarding microservice permissions, ReBAC graphs, and decoupled policy engines.',
              link: 'https://cerbos.dev/blog'
            },
            {
              name: 'Curity Identity & API Blog',
              desc: 'In-depth developer guides covering JSON Web Token signing, JWKS caching, and Token Exchange APIs.',
              link: 'https://curity.io/resources'
            },
            {
              name: 'Okta Developer & Auth0 Blog',
              desc: 'Highly visual, layman-friendly articles introducing JWT specs, federated SSO, and Passkeys.',
              link: 'https://developer.okta.com/blog/'
            }
          ].map((res, i) => (
            <div key={i} className="p-6 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-accent-primary bg-accent-glow px-2.5 py-1 rounded border border-accent-primary/10 w-fit block">Resource Authority</span>
                <h4 className="text-base font-bold text-text-primary">{res.name}</h4>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">{res.desc}</p>
              </div>
              <div className="pt-6 border-t border-border-subtle/50 mt-6">
                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bg-sidebar hover:bg-bg-nested text-text-primary text-xs font-bold transition-all border border-border-subtle"
                >
                  Visit Portal <Globe className="w-3.5 h-3.5 text-text-secondary" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
