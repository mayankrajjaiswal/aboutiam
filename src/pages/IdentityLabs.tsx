import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Award, ShieldAlert, CheckSquare, ArrowLeft, Play, Terminal, HelpCircle, 
  Check, Lock, Unlock, Sparkles, Star, RefreshCw, ShieldCheck
} from 'lucide-react'

// Labs Configuration Types
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
type Category = 'OAuth / OIDC' | 'JWT / Cryptography' | 'SAML / SSO' | 'SCIM / Provisioning'

interface Lab {
  id: string
  title: string
  difficulty: Difficulty
  category: Category
  scenario: string
  background: string
  architecture: string[]
  objectives: { id: string; text: string; solved: boolean }[]
  brokenConfig: Record<string, unknown>
  solutionConfig: Record<string, unknown> // Expected values
  hints: string[]
}

interface LabStats {
  score: number
  labsCompleted: number
  accuracy: number
  stars: number
  hintsUsed: number
}

export default function IdentityLabs() {
  // Global User Stats (Persisted locally)
  const [stats, setStats] = useState<LabStats>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('aboutiam_labs_stats')
        return saved ? JSON.parse(saved) : { score: 0, labsCompleted: 0, accuracy: 100, stars: 0, hintsUsed: 0 }
      } catch (e) {
        console.error(e)
      }
    }
    return { score: 0, labsCompleted: 0, accuracy: 100, stars: 0, hintsUsed: 0 }
  })

  const saveStats = (newStats: typeof stats) => {
    setStats(newStats)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboutiam_labs_stats', JSON.stringify(newStats))
    }
  }

  // List of completed lab IDs (Persisted)
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('aboutiam_labs_completed')
        return saved ? JSON.parse(saved) : []
      } catch (e) {
        console.error(e)
      }
    }
    return []
  })

  const markLabCompleted = (id: string, starsEarned: number, scoreAwarded: number) => {
    if (!completedLabIds.includes(id)) {
      const updated = [...completedLabIds, id]
      setCompletedLabIds(updated)
      if (typeof window !== 'undefined') {
        localStorage.setItem('aboutiam_labs_completed', JSON.stringify(updated))
      }
      
      const newScore = stats.score + scoreAwarded
      const newStars = stats.stars + starsEarned
      const newComps = updated.length
      const hintsPenalty = stats.hintsUsed * 5
      const computedAccuracy = Math.max(50, 100 - hintsPenalty)
      
      saveStats({
        score: newScore,
        labsCompleted: newComps,
        accuracy: computedAccuracy,
        stars: newStars,
        hintsUsed: stats.hintsUsed
      })
    }
  }

  // Filter States
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All')

  // Active Lab Workspace State
  const [activeLabId, setActiveLabId] = useState<string | null>(null)
  const [patchedConfig, setPatchedConfig] = useState<Record<string, unknown>>({})
  const [terminalFeed, setTerminalFeed] = useState<string[]>([])
  const [isAttacking, setIsSimulating] = useState<boolean>(false)
  const [showHintIndex, setShowHintIndex] = useState<number>(-1)
  const [attackCompleted, setAttackCompleted] = useState<boolean>(false)
  const [attackSuccess, setAttackSuccess] = useState<boolean>(false)

  // Standard Labs List Data
  const LABS: Lab[] = [
    {
      id: 'lab-oauth',
      title: 'OAuth 2.0 Auth Code Vulnerability Remediation',
      difficulty: 'Beginner',
      category: 'OAuth / OIDC',
      scenario: 'An insecurely configured client portal allows authorization code interception, wildcard redirect injection, and login session hijack CSRF.',
      background: 'If PKCE is omitted, state verification is disabled, and wildcard redirect URLs are allowed, attackers can steal authentication tokens and take over corporate user accounts.',
      architecture: [
        'Client Frontend Portal -> PEP API Gateway -> OIDC Identity Authority',
        'Trust Boundary: Public browser context to secure OIDC endpoints'
      ],
      brokenConfig: {
        pkce_enforced: false,
        allow_wildcard_redirects: true,
        require_state_parameter: false,
        allowed_scopes_admin: true
      },
      solutionConfig: {
        pkce_enforced: true,
        allow_wildcard_redirects: false,
        require_state_parameter: true,
        allowed_scopes_admin: false
      },
      objectives: [
        { id: 'o1', text: 'Enforce PKCE (RFC 7636) to prevent code interception.', solved: false },
        { id: 'o2', text: 'Disable wildcard redirects to block Callback URI Hijacking.', solved: false },
        { id: 'o3', text: 'Require State validation parameter to block Login CSRF.', solved: false },
        { id: 'o4', text: 'Restrict scopes to standard profile only (disable wildcard superuser claims).', solved: false }
      ],
      hints: [
        'Enable PKCE slider first: this cryptographically binds your authorization codes using S256 code verifiers.',
        'Wildcards are extremely dangerous in redirect whitelists because attackers can exploit open endpoints on subdomain targets. Toggle wildcard redirects to false.',
        'The state parameter prevents Cross-Site Request Forgery (CSRF). Set State to true.'
      ]
    },
    {
      id: 'lab-jwt',
      title: 'JWT Security Signature Bypass Defense',
      difficulty: 'Intermediate',
      category: 'JWT / Cryptography',
      scenario: 'The JWT verification middleware accepts unsigned tokens, allows the dangerous "none" algorithm, and uses a weak shared HMAC secret.',
      background: 'Weak shared secrets enable dictionary bruteforce attacks to extract keys. Accepting the none algorithm allows attackers to forge any administrative payload directly.',
      architecture: [
        'Client JWT Generator -> API Gateway Header verification -> Backend Database Access',
        'Trust Boundary: Edge ingress point verifying claims'
      ],
      brokenConfig: {
        allow_none_algorithm: true,
        verify_signature: false,
        strong_secret_enforced: false,
        verify_expiration: false
      },
      solutionConfig: {
        allow_none_algorithm: false,
        verify_signature: true,
        strong_secret_enforced: true,
        verify_expiration: true
      },
      objectives: [
        { id: 'j1', text: 'Disable "none" algorithm support to prevent unsigned token ingestion.', solved: false },
        { id: 'j2', text: 'Enforce "verify_signature" checks for all tokens.', solved: false },
        { id: 'j3', text: 'Upgrade to a secure high-entropy HMAC secret key.', solved: false },
        { id: 'j4', text: 'Enable token expiration validation to block replay exploits.', solved: false }
      ],
      hints: [
        'Never allow alg: none in production environments. Turn "Allow None Algorithm" OFF.',
        'Enforcing signature verification ensures the integrity of the JWT payload cannot be tampered with.',
        'Weak shared secrets can be cracked in seconds. Enforce a strong cryptographically random secret key.'
      ]
    },
    {
      id: 'lab-saml',
      title: 'SAML Assertion Wrapping & XXE Defense',
      difficulty: 'Advanced',
      category: 'SAML / SSO',
      scenario: 'The SAML Service Provider only checks Response level signatures, allows unsigned assertions, and has XML external entity (XXE) parsers active.',
      background: 'SAML Signature Wrapping (SSW) allows malicious actors to inject custom assertions because only the wrapper Response is signed. Active XXE parsers enable attackers to read local system configuration files.',
      architecture: [
        'Corporate Identity Provider -> SAML assertion consumer -> Service Provider',
        'Trust Boundary: Federated Single Sign-On (SSO) boundaries'
      ],
      brokenConfig: {
        validate_response_only: true,
        validate_assertion_signature: false,
        allow_unsigned_assertions: true,
        xml_xxe_enabled: true
      },
      solutionConfig: {
        validate_response_only: false,
        validate_assertion_signature: true,
        allow_unsigned_assertions: false,
        xml_xxe_enabled: false
      },
      objectives: [
        { id: 's1', text: 'Disable "validate_response_only" to enforce nested element checks.', solved: false },
        { id: 's2', text: 'Require Assertion Signature Validation checks.', solved: false },
        { id: 's3', text: 'Reject unsigned assertions from federated partners.', solved: false },
        { id: 's4', text: 'Disable XML External Entity (XXE) expansion inside your parser.', solved: false }
      ],
      hints: [
        'Response signatures are insufficient; both the Response and the nested Assertion should be cryptographically validated.',
        'XML entity expansion can expose raw files on your servers. Toggle XML XXE parser to FALSE to secure the system.'
      ]
    },
    {
      id: 'lab-scim',
      title: 'SCIM 2.0 Directory Security Hardening',
      difficulty: 'Expert',
      category: 'SCIM / Provisioning',
      scenario: 'The SCIM provisioning server exposes raw user password hashes in GET endpoints, allows bulk delete commands, and runs with no API token checks.',
      background: 'SCIM schemas must treat user credentials as write-only fields. Provisioning interfaces must enforce authenticated Bearer tokens with read/write scoping to prevent unauthorized bulk actions.',
      architecture: [
        'HR Management Directory -> SCIM Bearer Client -> Enterprise SCIM Directory Target',
        'Trust Boundary: Enterprise automated provisioning boundary'
      ],
      brokenConfig: {
        expose_passwords_in_get: true,
        allow_bulk_delete_limitless: true,
        token_authorization_required: false,
        enforce_read_write_scopes: false
      },
      solutionConfig: {
        expose_passwords_in_get: false,
        allow_bulk_delete_limitless: false,
        token_authorization_required: true,
        enforce_read_write_scopes: true
      },
      objectives: [
        { id: 'sc1', text: 'Make user password attributes write-only, blocking GET disclosure.', solved: false },
        { id: 'sc2', text: 'Disable limitless bulk user deletions.', solved: false },
        { id: 'sc3', text: 'Enforce Bearer token authorization checks for SCIM requests.', solved: false },
        { id: 'sc4', text: 'Enforce specific Read/Write token scopes.', solved: false }
      ],
      hints: [
        'Raw passwords or hashes must never be serialized or returned inside SCIM GET responses. Toggle "Expose Passwords in GET" to off.',
        'Limitless bulk delete endpoints enable rogue admins or compromised keys to destroy directories. Disable bulk delete.',
        'Enforce Bearer token checks so only authorized systems (like your primary IdP) can synchronize users.'
      ]
    }
  ]

  // Get currently active Lab
  const activeLab = LABS.find(l => l.id === activeLabId)

  // Initialize patched config when a lab is selected
  const enterLab = (id: string) => {
    const target = LABS.find(l => l.id === id)
    if (target) {
      setActiveLabId(id)
      setPatchedConfig({ ...target.brokenConfig })
      setTerminalFeed([])
      setShowHintIndex(-1)
      setAttackCompleted(false)
      setAttackSuccess(false)
    }
  }

  // Filtered Labs
  const filteredLabs = LABS.filter(lab => {
    const diffMatch = selectedDifficulty === 'All' || lab.difficulty === selectedDifficulty
    const catMatch = selectedCategory === 'All' || lab.category === selectedCategory
    return diffMatch && catMatch
  })

  // Trigger automated penetration test simulation against the patched config
  const runPenTest = async () => {
    if (!activeLab) return
    setIsSimulating(true)
    setTerminalFeed([])
    setAttackCompleted(false)
    setAttackSuccess(false)

    const feed: string[] = []
    const addLog = (msg: string) => {
      feed.push(msg)
      setTerminalFeed([...feed])
    }

    // Step 1: Initializing scanner
    addLog(`🛡️ INITIALIZING IAM SECURITY SECURITY AUDIT: ${activeLab.title.toUpperCase()}`)
    await new Promise(r => setTimeout(r, 500))
    addLog(`🔍 Scanning target API endpoints and trust boundaries...`)
    await new Promise(r => setTimeout(r, 500))

    let solvedAll = true

    // Lab Specific Attack Simulation Logic
    if (activeLab.id === 'lab-oauth') {
      addLog(`⚡ ATTACK MODULE 1: Testing Authorization Code Interception (PKCE validation)...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.pkce_enforced) {
        addLog(`💥 FAILURE: Auth Code Interception attack succeeded! Code Verifier was not validated. PKCE check bypassed.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Cryptographic S256 PKCE verifier verified. Code Interception attack successfully blocked.`)
      }

      addLog(`⚡ ATTACK MODULE 2: Testing Callback URI Redirection Hijack (Wildcard validation)...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.allow_wildcard_redirects) {
        addLog(`💥 FAILURE: Redirect Hijack succeeded! Whitelist contains wildcards, allowing redirection to arbitrary third-party targets.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Whitelist enforced with strict match. Callback hijack blocked.`)
      }

      addLog(`⚡ ATTACK MODULE 3: Testing Login CSRF Swap (State verification)...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.require_state_parameter) {
        addLog(`💥 FAILURE: Login Session CSRF hijack succeeded! State check omitted, allowing malicious user-session swaps.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Strong State parameter verified. Login CSRF block verified.`)
      }

      addLog(`⚡ ATTACK MODULE 4: Testing Scope Escalation exploits...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.allowed_scopes_admin) {
        addLog(`💥 FAILURE: Scope escalation succeeded! Wildcard scopes allow unauthorized corporate admin privileges.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Scope restricted to standard profile only. Privilege escalation prevented.`)
      }

    } else if (activeLab.id === 'lab-jwt') {
      addLog(`⚡ ATTACK MODULE 1: Testing 'none' algorithm bypass validation...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.allow_none_algorithm) {
        addLog(`💥 FAILURE: Signature validation bypassed! Server successfully accepted un-signed JWT containing 'alg: none'.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Server rejected 'alg: none' request. None-bypass prevented.`)
      }

      addLog(`⚡ ATTACK MODULE 2: Testing direct signature verification checks...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.verify_signature) {
        addLog(`💥 FAILURE: Cryptographic signature checks skipped! Arbitrary claim edits (e.g. sub: admin) were ingested without trust.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Cryptographic signature checks enforced correctly.`)
      }

      addLog(`⚡ ATTACK MODULE 3: Testing Shared Secret brute-force attack...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.strong_secret_enforced) {
        addLog(`💥 FAILURE: Dictionary attack cracked the weak secret 'secret123' in 0.02 seconds! Signature forged successfully.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: High-entropy key verified. Cryptographic signature cannot be brute-forced.`)
      }

      addLog(`⚡ ATTACK MODULE 4: Testing token expiration validation replay...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.verify_expiration) {
        addLog(`💥 FAILURE: Token Replay successful! Expired token accepted because 'exp' validation parameter was bypassed.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Token expiration validation enforced correctly. Replay blocked.`)
      }

    } else if (activeLab.id === 'lab-saml') {
      addLog(`⚡ ATTACK MODULE 1: Testing SAML Signature Wrapping (SSW) assertion swap...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.validate_response_only) {
        addLog(`💥 FAILURE: SAML Signature Wrapping (SSW) succeeded! Only Response element checked, allowing unsigned manipulated Assertions.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Elements matching verified. Signature wrapping thwarted.`)
      }

      addLog(`⚡ ATTACK MODULE 2: Checking Assertion Signature verification...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.validate_assertion_signature) {
        addLog(`💥 FAILURE: Unsigned assertions accepted! Signature validation skipped on target assertion node.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Enforced assertion signature check correctly.`)
      }

      addLog(`⚡ ATTACK MODULE 3: Testing Unsigned assertion injection...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.allow_unsigned_assertions) {
        addLog(`💥 FAILURE: SAML federation compromised! Arbitrary unsigned XML nodes ingested successfully.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Unsigned SAML assertions rejected.`)
      }

      addLog(`⚡ ATTACK MODULE 4: Launching XML External Entity (XXE) injection...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.xml_xxe_enabled) {
        addLog(`💥 FAILURE: XXE successful! Server-side file disclosure achieved. Read /etc/passwd contents securely.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: XML external entity expansion disabled. XXE blocked.`)
      }

    } else if (activeLab.id === 'lab-scim') {
      addLog(`⚡ ATTACK MODULE 1: Scanning SCIM GET responses for sensitive parameters...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.expose_passwords_in_get) {
        addLog(`💥 FAILURE: Password leakage detected! Plain text user password hashes returned inside GET response payload.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Password attributes omitted from serializations. Write-only compliance enforced.`)
      }

      addLog(`⚡ ATTACK MODULE 2: Testing destructive bulk delete request...`)
      await new Promise(r => setTimeout(r, 800))
      if (patchedConfig.allow_bulk_delete_limitless) {
        addLog(`💥 FAILURE: SCIM database wiped! Limitless bulk delete requests allowed without rate-limiting or approval gates.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Bulk deletion actions rejected. Segment safety verified.`)
      }

      addLog(`⚡ ATTACK MODULE 3: Testing Bearer Token OAuth checks...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.token_authorization_required) {
        addLog(`💥 FAILURE: Access granted with zero credentials! Directory exposed publicly.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Authenticated OAuth Bearer token check verified.`)
      }

      addLog(`⚡ ATTACK MODULE 4: Verifying Read/Write OAuth scopes...`)
      await new Promise(r => setTimeout(r, 800))
      if (!patchedConfig.enforce_read_write_scopes) {
        addLog(`💥 FAILURE: Privilege escalation successful! Read-only token allowed to perform SCIM POST/PUT operations.`)
        solvedAll = false
      } else {
        addLog(`✓ SUCCESS: Strict Read/Write scopes mapped and verified.`)
      }
    }

    addLog(`----------------------------------------------------------------------`)
    await new Promise(r => setTimeout(r, 500))

    if (solvedAll) {
      addLog(`🎉 AUDIT COMPLETION SUCCESS: ALL ATTACKS MITIGATED!`)
      addLog(`✓ The configuration is now safe, resilient, and fully compliant with security standards.`)
      setAttackSuccess(true)
      
      // Calculate Stars Earned (Based on Hints Used)
      let stars = 3
      if (showHintIndex >= 1) stars = 2
      if (showHintIndex >= 2) stars = 1
      
      const scoreAwarded = activeLab.difficulty === 'Beginner' ? 100 : activeLab.difficulty === 'Intermediate' ? 200 : activeLab.difficulty === 'Advanced' ? 300 : 400
      markLabCompleted(activeLab.id, stars, scoreAwarded)
    } else {
      addLog(`❌ AUDIT COMPLETION FAILURE: SYSTEM VULNERABILITY REMAINS.`)
      addLog(`Review the failed exploit logs above and adjust the configuration patches accordingly before re-auditing.`)
      setAttackSuccess(false)
    }

    setIsSimulating(false)
    setAttackCompleted(true)
  }

  // Toggle local configuration slider
  const handleConfigToggle = (key: string) => {
    setPatchedConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setAttackCompleted(false)
  }

  // Reset the active lab to its broken state
  const resetLab = () => {
    if (activeLab) {
      setPatchedConfig({ ...activeLab.brokenConfig })
      setTerminalFeed([])
      setShowHintIndex(-1)
      setAttackCompleted(false)
      setAttackSuccess(false)
    }
  }

  // Use hint
  const useHint = () => {
    if (activeLab && showHintIndex < activeLab.hints.length - 1) {
      setShowHintIndex(prev => prev + 1)
      setStats(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1
      }))
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      
      {/* HEADER BAR */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award className="text-accent-primary w-7 h-7 animate-pulse shrink-0" />
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              Interactive Identity Labs <span className="text-[10px] bg-accent-glow text-accent-primary px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">Vulnerability Sandbox</span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Solve real-world IAM vulnerabilities in our browser-native simulation academy. Complete objectives, secure configurations, and block hacks!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeLabId && (
            <button
              onClick={() => setActiveLabId(null)}
              className="text-xs bg-bg-nested hover:bg-border-subtle px-3.5 py-2 rounded-lg text-text-secondary flex items-center gap-1.5 transition font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy Dashboard
            </button>
          )}
          <Link to="/" className="text-xs bg-bg-nested hover:bg-border-subtle px-3 py-2 rounded-lg text-text-secondary flex items-center gap-1.5 transition font-bold">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </div>

      {/* DASHBOARD MODE VIEW */}
      {!activeLabId ? (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* STATS OVERVIEW HEADER CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Academy Score', val: `${stats.score} XP`, sub: 'Solved challenges', icon: Award },
              { label: 'Labs Completed', val: `${stats.labsCompleted} / ${LABS.length}`, sub: 'Mastery roadmap', icon: CheckSquare },
              { label: 'Security Accuracy', val: `${stats.accuracy}%`, sub: 'Post-audit verification', icon: ShieldCheck },
              { label: 'Stars Earned', val: `${stats.stars} ⭐`, sub: 'Zero-hint performance', icon: Star },
              { label: 'Hints Utilized', val: `${stats.hintsUsed} uses`, sub: 'Accuracy deductions', icon: HelpCircle }
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{stat.label}</span>
                    <Icon className="w-4 h-4 text-accent-primary opacity-80" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-lg font-black text-text-primary block">{stat.val}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">{stat.sub}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ACADEMY INDEX AND FILTERS */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/50 pb-4">
              <div>
                <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">Identity Security Lab Inventory</h2>
                <p className="text-xs text-text-secondary mt-0.5">Filter based on complexity and focus domain to start practicing IAM pen-testing remediation.</p>
              </div>

              {/* FILTERS PANEL */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-bg-nested/60 border border-border-subtle/60 p-1 rounded-lg">
                  <span className="text-[10px] text-text-muted font-bold px-1.5 uppercase">Difficulty:</span>
                  {['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff as Difficulty | 'All')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${selectedDifficulty === diff ? 'bg-bg-card text-text-primary shadow-sm border border-border-subtle/40' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-bg-nested/60 border border-border-subtle/60 p-1 rounded-lg">
                  <span className="text-[10px] text-text-muted font-bold px-1.5 uppercase">Domain:</span>
                  {['All', 'OAuth / OIDC', 'JWT / Cryptography', 'SAML / SSO', 'SCIM / Provisioning'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as Category | 'All')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${selectedCategory === cat ? 'bg-bg-card text-text-primary shadow-sm border border-border-subtle/40' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                      {cat.split(' / ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LABS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLabs.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-text-muted border border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center gap-2 select-none">
                  <ShieldAlert className="w-8 h-8 text-text-muted animate-pulse" />
                  <span>No security labs matched your active filters. Try resetting your criteria!</span>
                </div>
              ) : (
                filteredLabs.map((lab) => {
                  const isCompleted = completedLabIds.includes(lab.id)
                  return (
                    <div 
                      key={lab.id} 
                      className={`border rounded-xl p-5 flex flex-col justify-between transition ${isCompleted ? 'border-status-success/35 bg-status-success/5 shadow-inner' : 'border-border-subtle bg-bg-card hover:border-accent-primary hover:shadow'}`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-bg-nested border border-border-subtle px-2 py-0.5 rounded font-mono font-bold text-text-secondary uppercase">
                            {lab.category}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${lab.difficulty === 'Beginner' ? 'bg-status-success/15 text-status-success' : lab.difficulty === 'Intermediate' ? 'bg-accent-primary/15 text-accent-primary' : lab.difficulty === 'Advanced' ? 'bg-accent-secondary/15 text-accent-secondary' : 'bg-status-danger/15 text-status-danger'}`}>
                            {lab.difficulty}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                            {lab.title}
                            {isCompleted && <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />}
                          </h3>
                          <p className="text-xs text-text-secondary mt-1 leading-snug">{lab.scenario}</p>
                        </div>
                      </div>

                      <div className="border-t border-border-subtle/50 pt-3 mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-text-muted font-mono">
                          {isCompleted ? '⭐ Complete (3/3 Stars)' : 'Status: Unsolved'}
                        </span>
                        <button
                          onClick={() => enterLab(lab.id)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${isCompleted ? 'bg-bg-nested text-text-secondary border-border-subtle hover:bg-border-subtle' : 'bg-accent-primary text-white border-accent-primary hover:bg-accent-hover shadow'}`}
                        >
                          {isCompleted ? 'Re-enter Lab' : 'Start Secure Lab'} <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>

        </div>
      ) : (
        
        /* ================= LAB WORKSPACE MODE ================= */
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: SCENARIO, terminals AND OBJECTIVES */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Lab details & Scenario */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[9px] bg-bg-nested border border-border-subtle px-2 py-0.5 rounded font-mono font-bold text-text-secondary uppercase">
                  {activeLab?.category}
                </span>
                <h2 className="text-base font-black text-text-primary mt-1.5">{activeLab?.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${activeLab?.difficulty === 'Beginner' ? 'text-status-success' : activeLab?.difficulty === 'Intermediate' ? 'text-accent-primary' : activeLab?.difficulty === 'Advanced' ? 'text-accent-secondary' : 'text-status-danger'}`}>
                    Difficulty: {activeLab?.difficulty}
                  </span>
                  <span className="text-text-muted text-[10px] font-mono">• Target Reward: {activeLab?.difficulty === 'Beginner' ? '100' : activeLab?.difficulty === 'Intermediate' ? '200' : activeLab?.difficulty === 'Advanced' ? '300' : '400'} XP</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border-subtle/50 pt-3">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Lab Vulnerability Statement</span>
                <p className="text-xs text-text-secondary leading-snug">{activeLab?.background}</p>
              </div>

              {/* Related guides */}
              <div className="bg-bg-nested/60 border border-border-subtle p-3 rounded-xl flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-accent-primary shrink-0 mt-0.5 animate-pulse-slow" />
                <div className="text-[11px] leading-relaxed text-text-secondary">
                  <strong>Standard Remediation:</strong> Toggle the vulnerability configuration controls on the right panel to implement modern secure safeguards, then execute the Pen-Test scan to verify mitigation.
                </div>
              </div>
            </div>

            {/* Target Objectives checks */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2">Harden Objectives (Patch Compliance)</span>
              
              <div className="space-y-2">
                {activeLab?.objectives.map((obj, idx) => {
                  // Check if objective criteria matched based on patched config compared to target solution config
                  const brokenKey = Object.keys(activeLab.brokenConfig)[idx]
                  const currentSetting = patchedConfig[brokenKey]
                  const solvedSetting = activeLab.solutionConfig[brokenKey]
                  const isSolved = currentSetting === solvedSetting

                  return (
                    <div key={obj.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-bg-nested/30 border border-border-subtle/40 text-[11px] leading-snug text-text-secondary">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isSolved ? 'bg-status-success text-white' : 'bg-status-danger/10 text-status-danger border border-status-danger/30'}`}>
                        {isSolved ? <Check className="w-3 h-3 stroke-[3]" /> : <Lock className="w-3 h-3" />}
                      </div>
                      <span className={isSolved ? 'line-through text-text-muted' : 'font-bold'}>{obj.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* HINTS DESK */}
            {activeLab && (
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Lab Hints Assistance</span>
                  {showHintIndex < activeLab.hints.length - 1 && (
                    <button
                      onClick={useHint}
                      className="text-[9px] bg-accent-glow text-accent-primary hover:bg-accent-primary hover:text-white px-2.5 py-1 rounded font-bold uppercase transition cursor-pointer"
                    >
                      Reveal Hint (+5 Hints penalty)
                    </button>
                  )}
                </div>

                {showHintIndex === -1 ? (
                  <p className="text-[11px] text-text-muted italic select-none">No hints requested. Solving labs with zero hints preserves maximum Accuracy.</p>
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: showHintIndex + 1 }).map((_, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-bg-nested/70 border border-border-subtle/50 text-[11px] text-text-secondary leading-snug">
                        <strong>Hint {idx + 1}:</strong> {activeLab.hints[idx]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT PANEL: CONFIGURATION SWITCHBOARD & TERMINAL FEED */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* BROKEN CONFIGURATION BOARD */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                <div>
                  <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Patch Configuration Control Switchboard</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Toggle configuration parameters to mitigate exposed system backdoors.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetLab}
                    className="p-1.5 bg-bg-nested hover:bg-border-subtle border border-border-subtle rounded-lg text-text-secondary cursor-pointer transition"
                    title="Reset configuration to broken state"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* INTERACTIVE TOGGLES AND SETTINGS */}
              <div className="space-y-4">
                {activeLab && Object.keys(activeLab.brokenConfig).map((key) => {
                  const currentValue = patchedConfig[key]
                  const isStandardDefault = currentValue === activeLab.brokenConfig[key]
                  
                  // Friendly label mapping
                  const label = key.replace(/_/g, ' ').toUpperCase()
                  let desc = 'System parameter constraint boundary.'
                  if (key === 'pkce_enforced') desc = 'Enforce PKCE Auth Code Interception verification (RFC 7636).'
                  else if (key === 'allow_wildcard_redirects') desc = 'Allow wildcard asterisks in redirect URI callbacks (insecure).'
                  else if (key === 'require_state_parameter') desc = 'Mandate state verification parameter on authorization callbacks.'
                  else if (key === 'allowed_scopes_admin') desc = 'Expose high-privilege corporate superuser admin scopes directly.'
                  else if (key === 'allow_none_algorithm') desc = 'Support unsigned cryptographic none algorithms in verification.'
                  else if (key === 'verify_signature') desc = 'Verify JWT signatures against private/public cryptography keys.'
                  else if (key === 'strong_secret_enforced') desc = 'Enforce cryptographically secure high-entropy secret hashes.'
                  else if (key === 'verify_expiration') desc = 'Enforce token expiration checks on incoming edge assertions.'
                  else if (key === 'validate_response_only') desc = 'Skip assertion-level signature check, validating Response wrapper only.'
                  else if (key === 'validate_assertion_signature') desc = 'Enforce signature check on specific Assertion nodes.'
                  else if (key === 'allow_unsigned_assertions') desc = 'Ingest unsigned assertions from federated SAML partners.'
                  else if (key === 'xml_xxe_enabled') desc = 'Enable XML parser entity expansion capabilities (XXE vulnerability).'
                  else if (key === 'expose_passwords_in_get') desc = 'Expose raw user password fields inside SCIM user payloads.'
                  else if (key === 'allow_bulk_delete_limitless') desc = 'Accept un-gated bulk directory resource wipes.'
                  else if (key === 'token_authorization_required') desc = 'Validate bearer tokens on inbound synchronization endpoints.'
                  else if (key === 'enforce_read_write_scopes') desc = 'Verify specific Read or Write claims on Bearer authorization tokens.'

                  return (
                    <div 
                      key={key} 
                      className={`p-4 rounded-xl border transition flex items-start gap-4 ${isStandardDefault ? 'bg-status-danger/5 border-status-danger/15' : 'bg-status-success/5 border-status-success/15'}`}
                    >
                      <div className={`p-2 rounded-lg ${isStandardDefault ? 'bg-status-danger/10 text-status-danger' : 'bg-status-success/10 text-status-success'}`}>
                        {isStandardDefault ? <Unlock className="w-5 h-5 shrink-0" /> : <Lock className="w-5 h-5 shrink-0" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-text-primary tracking-tight font-mono">{label}</span>
                          <button
                            type="button"
                            onClick={() => handleConfigToggle(key)}
                            className={`w-10 h-5 rounded-full transition-colors relative flex items-center shrink-0 cursor-pointer ${currentValue ? 'bg-accent-primary' : 'bg-border-subtle'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute ${currentValue ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        <span className="text-[10px] text-text-secondary leading-normal block mt-1">{desc}</span>
                        <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-bold font-mono">
                          <span className="text-text-muted">Current Value:</span>
                          <span className={currentValue ? 'text-accent-primary font-black uppercase' : 'text-text-muted uppercase'}>
                            {currentValue ? 'Enabled / True' : 'Disabled / False'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA TRIGGER AUDIT */}
              <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="text-[10px] text-text-muted font-mono block">Status: patched configuration ready.</span>
                <button
                  onClick={runPenTest}
                  disabled={isAttacking}
                  className={`text-xs px-5 py-3 rounded-xl border transition font-bold flex items-center justify-center gap-2 cursor-pointer ${isAttacking ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary shadow-lg shadow-accent-primary/25 animate-pulse-slow'}`}
                >
                  <Terminal className="w-4 h-4" /> {isAttacking ? 'Executing Pen-Test Audit...' : 'Execute Automated Pen-Test Audit'}
                </button>
              </div>

            </div>

            {/* AUTOMATED AUDIT VULNERABILITY TERMINAL FEED */}
            <div className="border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex items-center justify-between bg-[#0b0f19] px-4 py-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Terminal className="w-3.5 h-3.5 text-accent-primary animate-pulse" /> security_audit_scanner.sh
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">Status: Connected</div>
                </div>

                {/* Live Console stream */}
                <div className="p-4 overflow-y-auto max-h-[300px] text-[11px] font-mono text-slate-300 space-y-2 text-left custom-scrollbar leading-relaxed select-text">
                  {terminalFeed.length === 0 ? (
                    <div className="text-slate-500 italic select-none">Terminal console stream idle. Adjust config patches above and click "Execute Automated Pen-Test Audit" to watch simulated exploit attempts.</div>
                  ) : (
                    terminalFeed.map((log, idx) => {
                      let color = 'text-slate-300'
                      if (log.startsWith('✓')) color = 'text-status-success font-black'
                      else if (log.startsWith('💥') || log.startsWith('❌')) color = 'text-status-danger font-black'
                      else if (log.startsWith('🛡️') || log.startsWith('🎉')) color = 'text-accent-secondary font-black border-y border-slate-900 py-1 block mt-1'
                      else if (log.startsWith('⚡')) color = 'text-accent-primary font-black block mt-2'

                      return (
                        <div key={idx} className={color}>
                          {log}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Scoring alert panel overlay */}
              {attackCompleted && attackSuccess && (
                <div className="bg-status-success/15 border-t border-status-success/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-scaleUp">
                  <div>
                    <h4 className="text-xs font-bold text-status-success flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-status-success fill-current animate-pulse" /> Lab Solved Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-snug mt-1">
                      Target vulnerabilities mitigated. Stars awarded: **{showHintIndex === -1 ? '3/3' : showHintIndex === 0 ? '2/3' : '1/3'} Stars**! You have received **{activeLab?.difficulty === 'Beginner' ? '100' : activeLab?.difficulty === 'Intermediate' ? '200' : activeLab?.difficulty === 'Advanced' ? '300' : '400'} XP**!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveLabId(null)}
                    className="px-4 py-2 bg-status-success hover:bg-status-success/80 text-slate-950 font-bold font-mono text-[10px] rounded-lg cursor-pointer transition uppercase"
                  >
                    Load Next Challenge
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  )
}
