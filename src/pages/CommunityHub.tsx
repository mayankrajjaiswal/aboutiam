import { useState, useMemo } from 'react'
import {
  Users, Award, Shield, ShieldAlert, CheckCircle2, RotateCcw,
  Trophy, User, Star, Flame, Check, Lock,
  Printer, Globe, Cpu, Database, ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTrackGraduationBadges, getPlaygroundMilestoneBadges } from '../lib/achievements/achievementRules'
import { useBookmarksStore } from '../store/bookmarksStore'
import BookmarkButton from '../components/BookmarkButton'

interface Achievement {
  id: string
  title: string
  desc: string
  requirement: string
  unlocked: boolean
  category: 'Protocols' | 'Enterprise' | 'Core' | 'Milestone'
}

interface LeaderboardUser {
  rank: number
  name: string
  completedCount: number
  badgeTitle: string
  isCurrentUser?: boolean
}

interface MonthlyChallenge {
  id: string
  title: string
  scenario: string
  options: { label: string; correct: boolean; feedback: string }[]
  status: 'active' | 'solved' | 'failed'
}

export default function CommunityHub() {
  const bookmarks = useBookmarksStore((s) => s.bookmarks)

  // Load Academy Completed Modules Progress
  const [completedModules] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const savedAcademy = localStorage.getItem('aboutiam-academy-progress')
      return savedAcademy ? JSON.parse(savedAcademy) : {}
    } catch (e) {
      console.error(e)
      return {}
    }
  })

  // Load Solved Labs Progress
  const [completedLabs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('aboutiam_labs_completed')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error(e)
      return []
    }
  })

  // Check if Scenario Builder has been run
  const [scenarioRun] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('aboutiam_labs_stats') !== null || localStorage.getItem('aboutiam_scenario_configured') === 'true'
  })

  // Visited Museum and Reference states
  const [museumVisited] = useState<boolean>(() => typeof window !== 'undefined' && localStorage.getItem('aboutiam-museum-visited') === 'true')
  const [builderConfigured] = useState<boolean>(() => typeof window !== 'undefined' && localStorage.getItem('aboutiam-builder-configured') === 'true')

  // Tactical Quiz state
  const [challengeState, setChallengeState] = useState<Record<string, 'active' | 'solved' | 'failed'>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const savedChallenges = localStorage.getItem('aboutiam-challenges-progress')
      return savedChallenges ? JSON.parse(savedChallenges) : {}
    } catch (e) {
      console.error(e)
      return {}
    }
  })

  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>('challenge-1')
  const [selectedAnswerIdx, setSelectedAnswerId] = useState<number | null>(null)
  const [challengeResult, setChallengeResult] = useState<string | null>(null)

  // Certificate Modal state
  const [showCertModal, setShowCertModal] = useState<boolean>(false)
  const [certName, setCertName] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('aboutiam_cert_name') || ''
  })

  // Save cert name
  const saveCertName = (name: string) => {
    setCertName(name)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboutiam_cert_name', name)
    }
  }

  // calculations
  const academyCompletedCount = Object.values(completedModules).filter(Boolean).length
  const labsCompletedCount = completedLabs.length

  // UNIFIED PROFESSIONAL PROGRESS LEVEL & XP ENGINE
  const unifiedXP = useMemo(() => {
    let xp = 0
    // 50 XP per completed Academy module (36 modules = 1800 XP)
    xp += academyCompletedCount * 50
    
    // Solved Labs: 200 XP each (4 labs = 800 XP)
    xp += labsCompletedCount * 200

    // Scenario Builder Runs: 100 XP
    if (scenarioRun) xp += 100

    // Visited Breaches Museum / Reference Builder: 50 XP
    if (museumVisited) xp += 50
    if (builderConfigured) xp += 50

    return xp
  }, [academyCompletedCount, labsCompletedCount, scenarioRun, museumVisited, builderConfigured])

  // Level & Titles thresholds
  const progressLevel = useMemo(() => {
    if (unifiedXP < 100) return { title: 'Student', min: 0, max: 100, badge: 'Student' }
    if (unifiedXP < 400) return { title: 'Explorer', min: 100, max: 400, badge: 'Explorer' }
    if (unifiedXP < 800) return { title: 'IAM Beginner', min: 400, max: 800, badge: 'IAM Beginner' }
    if (unifiedXP < 1300) return { title: 'IAM Practitioner', min: 800, max: 1300, badge: 'IAM Practitioner' }
    if (unifiedXP < 1900) return { title: 'IAM Engineer', min: 1300, max: 1900, badge: 'IAM Engineer' }
    if (unifiedXP < 2600) return { title: 'Senior IAM Engineer', min: 1900, max: 2600, badge: 'Senior Engineer' }
    if (unifiedXP < 3400) return { title: 'Identity Architect', min: 2600, max: 3400, badge: 'Identity Architect' }
    if (unifiedXP < 4300) return { title: 'Principal Architect', min: 3400, max: 4300, badge: 'Principal Architect' }
    return { title: 'Identity Expert', min: 4300, max: 5000, badge: 'Identity Expert' }
  }, [unifiedXP])

  // Core Achievements definitions
  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'badge-oauth',
      title: 'OAuth Master',
      desc: 'Remediate missing PKCE, wildcard redirects, and weak scopes inside the OAuth Code Vulnerability Lab.',
      requirement: 'Complete OAuth Code Vulnerability Lab',
      category: 'Protocols',
      unlocked: completedLabs.includes('lab-oauth')
    },
    {
      id: 'badge-jwt',
      title: 'JWT Expert',
      desc: 'Block None algorithm bypasses and crack-force weak HMAC secret validations in the JWT Signature Lab.',
      requirement: 'Complete JWT Security Signature Lab',
      category: 'Protocols',
      unlocked: completedLabs.includes('lab-jwt')
    },
    {
      id: 'badge-saml',
      title: 'SAML Expert',
      desc: 'Harden a SAML Service Provider against SAML Signature Wrapping (SSW) and XML entity (XXE) attacks.',
      requirement: 'Complete SAML Assertion Wrapping Lab',
      category: 'Protocols',
      unlocked: completedLabs.includes('lab-saml')
    },
    {
      id: 'badge-scim',
      title: 'SCIM Professional',
      desc: 'Secure a SCIM 2.0 user provisioning engine, blocking GET password leaks and limitless deletions.',
      requirement: 'Complete SCIM 2.0 Directory Hardening Lab',
      category: 'Protocols',
      unlocked: completedLabs.includes('lab-scim')
    },
    {
      id: 'badge-ldap',
      title: 'LDAP Explorer',
      desc: 'Successfully navigate and search directory objects inside the AD LDAP Tree Simulator.',
      requirement: 'Interact with LDAP Simulator or LDAP module',
      category: 'Enterprise',
      unlocked: !!(completedModules['m4.1'] || completedModules['m4.2'] || completedModules['m4.3'])
    },
    {
      id: 'badge-passwordless',
      title: 'Passkey Professional',
      desc: 'Deconstruct WebAuthn TPM biometric byte-offsets and complete Passkey Internals playground tests.',
      requirement: 'Complete Passkeys or WebAuthn module',
      category: 'Enterprise',
      unlocked: !!(completedModules['m2.4'] || completedModules['m2.5'] || completedModules['m2.6'])
    },
    {
      id: 'badge-pki',
      title: 'PKI Specialist',
      desc: 'Verify a hierarchical chain of trust and execute mTLS handshakes in the PKI validator.',
      requirement: 'Complete certificate chain module or validator',
      category: 'Enterprise',
      unlocked: !!(completedModules['m1.5'] || completedModules['m1.6'])
    },
    {
      id: 'badge-zt',
      title: 'Zero Trust Champion',
      desc: 'Map out a complete NIST SP 800-207 Zero Trust posture scorecard inside the ZTA Planner.',
      requirement: 'Complete ZTA planner or continuous trust module',
      category: 'Enterprise',
      unlocked: !!(completedModules['m3.5'] || completedModules['m3.6'])
    },
    {
      id: 'badge-architect',
      title: 'Architecture Master',
      desc: 'Describe a custom corporate blueprint and receive an architectural reference design inside the Scenario Builder.',
      requirement: 'Complete 1 Scenario Builder Blueprint',
      category: 'Core',
      unlocked: scenarioRun
    },
    {
      id: 'badge-defender',
      title: 'Identity Defender',
      desc: 'Simulate brute-force geovelocity or push bombing mitigation attacks in the SecOps Log ITDR Lab.',
      requirement: 'Visit the incident bulletins board or ITDR Lab',
      category: 'Core',
      unlocked: museumVisited || builderConfigured
    },
    // Cross-module milestone badges: aggregate Academy track completion and total Playground
    // completions already tracked via `aboutiam-academy-progress` / `aboutiam_labs_completed`.
    ...getTrackGraduationBadges(completedModules),
    ...getPlaygroundMilestoneBadges(labsCompletedCount)
  ], [completedLabs, completedModules, scenarioRun, museumVisited, builderConfigured, labsCompletedCount])

  // Monthly Security Challenges list
  const challenges: MonthlyChallenge[] = [
    {
      id: 'challenge-1',
      title: 'The HAR Session Leak',
      scenario: 'An employee uploaded a .har network trace log containing active OAuth 2.0 Access Tokens to a support ticket. An attacker hijacked it and is attempting a replay exploit. Which defensive gate immediately mitigates this without a credential re-verify?',
      options: [
        { label: 'Re-trigger a standard OAuth client redirect', correct: false, feedback: 'Incorrect. Redirection is client-side and does not invalidate the already active stolen access token.' },
        { label: 'Enable DPoP (Demonstrating Proof-of-Possession) token binding', correct: true, feedback: 'Correct! DPoP requires client browser cryptographic signatures for every request. Replays fail because the attacker lacks the browser private key.' },
        { label: 'Increase Access Token expiration lifetime', correct: false, feedback: 'Incorrect. Increasing token lifespan actually expands the attacker window of opportunity.' }
      ],
      status: challengeState['challenge-1'] || 'active'
    },
    {
      id: 'challenge-2',
      title: 'SAML wrapped assertion spoofing',
      scenario: 'An attacker intercepted a SAMLResponse and injected an unsigned <saml:AttributeStatement> setting Role=Administrator below a signed node. How do you prevent this SAML Signature Wrapping (SSW) exploit?',
      options: [
        { label: 'Verify only the top-level <saml:Response> envelope signature', correct: false, feedback: 'Incorrect. Attackers can bypass this by shifting unsigned assertions inside other elements.' },
        { label: 'Surgically validate signatures at both the Response envelope AND the specific <saml:Assertion> node level', correct: true, feedback: 'Correct! Rigidly verifying signatures at both scopes ensures nested assertions cannot be tampered with.' },
        { label: 'Switch the SSO integration back to legacy WS-Federation', correct: false, feedback: 'Incorrect. Legacy protocols are equally or more susceptible if implementation schemas are weak.' }
      ],
      status: challengeState['challenge-2'] || 'active'
    }
  ]

  const activeChallenge = challenges.find(c => c.id === selectedChallengeId)

  // Submit Challenge answer
  const handleAnswerSubmit = (optionIdx: number) => {
    if (!activeChallenge || activeChallenge.status !== 'active') return
    
    setSelectedAnswerId(optionIdx)
    const selectedOption = activeChallenge.options[optionIdx]

    if (selectedOption.correct) {
      setChallengeResult('correct')
      const updatedState = { ...challengeState, [activeChallenge.id]: 'solved' as const }
      setChallengeState(updatedState)
      if (typeof window !== 'undefined') {
        localStorage.setItem('aboutiam-challenges-progress', JSON.stringify(updatedState))
      }
    } else {
      setChallengeResult('failed')
      const updatedState = { ...challengeState, [activeChallenge.id]: 'failed' as const }
      setChallengeState(updatedState)
      if (typeof window !== 'undefined') {
        localStorage.setItem('aboutiam-challenges-progress', JSON.stringify(updatedState))
      }
    }
  }

  // Load different challenge
  const selectChallenge = (id: string) => {
    setSelectedChallengeId(id)
    setSelectedAnswerId(null)
    setChallengeResult(null)
  }

  // Simulated Global Contributor Leaderboard
  const leaderboardUsers = useMemo((): LeaderboardUser[] => {
    const baseUsers: Omit<LeaderboardUser, 'rank'>[] = [
      { name: 'Mayank (Lead Architect)', completedCount: 36, badgeTitle: 'Identity Expert' },
      { name: 'Fernando Corbató', completedCount: 32, badgeTitle: 'Principal Architect' },
      { name: 'Alice (SecOps Chief)', completedCount: 24, badgeTitle: 'Senior Engineer' },
      { name: 'Bob (SAML Specialist)', completedCount: 18, badgeTitle: 'IAM Engineer' }
    ]

    // Insert current user based on their completions
    const currentName = certName ? `${certName} (You)` : 'You (Anonymous Architect)'
    baseUsers.push({
      name: currentName,
      completedCount: academyCompletedCount + labsCompletedCount,
      badgeTitle: progressLevel.badge,
      isCurrentUser: true
    })

    // Sort by count descending
    baseUsers.sort((a, b) => b.completedCount - a.completedCount)

    return baseUsers.map((u, idx) => ({
      ...u,
      rank: idx + 1
    }))
  }, [certName, academyCompletedCount, labsCompletedCount, progressLevel])

  // Progression Percent for sub level bar
  const progressPercent = useMemo(() => {
    const min = progressLevel.min
    const max = progressLevel.max
    const range = max - min
    if (range <= 0) return 100
    const progressInLevel = unifiedXP - min
    return Math.min(100, Math.max(0, (progressInLevel / range) * 100))
  }, [unifiedXP, progressLevel])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      
      {/* HEADER HERO */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-accent-primary w-7 h-7 animate-pulse shrink-0" />
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              Learning Progress & Achievements <span className="text-[10px] bg-accent-glow text-accent-primary px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">Profile</span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Track your continuous progression from Student to Identity Expert. Earn XP from lectures, secure sandbox labs, and generate credentials.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unifiedXP >= 1000 ? (
            <button
              onClick={() => setShowCertModal(true)}
              className="px-4 py-2 text-xs bg-status-success text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition shadow shadow-status-success/20 animate-pulse-slow uppercase"
            >
              <Award className="w-4 h-4 text-slate-950" /> Generate Certificate
            </button>
          ) : (
            <div className="text-xs bg-bg-nested px-3 py-2 rounded-lg text-text-muted font-bold font-mono">
              🔒 Certificate unlocked at 1000 XP (Current: {unifiedXP} XP)
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* PROGRESSION ENGINE HEADER CARDS */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Rank Badge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-border-subtle/50 pb-6 lg:pb-0 lg:pr-6">
            <div className="w-20 h-20 rounded-full bg-accent-glow border-2 border-accent-primary flex items-center justify-center relative shadow shadow-accent-primary/25">
              <Trophy className="w-10 h-10 text-accent-primary animate-pulse-slow" />
              <div className="absolute -bottom-1 bg-accent-secondary text-white font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow">
                Level {Math.max(1, Math.floor(unifiedXP / 500))}
              </div>
            </div>
            <h2 className="text-lg font-black text-text-primary mt-4 uppercase tracking-tight">{progressLevel.title}</h2>
            <p className="text-xs text-text-secondary mt-0.5 font-mono">Rank Tier Directory</p>
          </div>

          {/* Unified XP Progress Bar */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted font-bold uppercase font-mono">Continuous Progression Engine</span>
                <div className="text-xl font-black text-text-primary flex items-baseline gap-1 mt-0.5">
                  {unifiedXP} <span className="text-xs font-mono font-bold text-text-muted">/ {progressLevel.max} XP</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-accent-secondary font-bold font-mono uppercase">Next Tier</span>
                <span className="text-xs font-black text-text-primary block uppercase">{progressLevel.title === 'Identity Expert' ? 'Max Rank achieved' : progressLevel.title}</span>
              </div>
            </div>

            {/* Target bar */}
            <div className="w-full h-3 bg-bg-nested rounded-full overflow-hidden border border-border-subtle/40 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500 shadow"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold text-text-secondary">
              <div className="bg-bg-nested/40 p-1.5 rounded border border-border-subtle/30">
                <span>📚 Lectures: <strong className="text-text-primary">{academyCompletedCount * 50} XP</strong></span>
              </div>
              <div className="bg-bg-nested/40 p-1.5 rounded border border-border-subtle/30">
                <span>🛡️ Hacking Labs: <strong className="text-text-primary">{labsCompletedCount * 200} XP</strong></span>
              </div>
              <div className="bg-bg-nested/40 p-1.5 rounded border border-border-subtle/30">
                <span>🚀 Footprints: <strong className="text-text-primary">{scenarioRun ? '100' : '0'} XP</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: COMPETENCY SKILLS MATRIX & BADGES */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* COMPETENCY MATRIX */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Dynamic Competency Skills Matrix</h3>
                <p className="text-xs text-text-secondary mt-0.5">Your specialization scores are calculated dynamically from completed curriculum topics and secure lab remeditations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { name: 'SSO & Protocols (OIDC/SAML)', val: Math.min(100, (completedLabs.includes('lab-oauth') ? 40 : 0) + (completedLabs.includes('lab-saml') ? 40 : 0) + (academyCompletedCount * 2)), icon: Globe, color: 'from-blue-500 to-cyan-500' },
                  { name: 'Cryptographic Security (JWT/PKI)', val: Math.min(100, (completedLabs.includes('lab-jwt') ? 50 : 0) + (academyCompletedCount * 2)), icon: Cpu, color: 'from-teal-500 to-emerald-500' },
                  { name: 'Provisioning & Directory (SCIM/LDAP)', val: Math.min(100, (completedLabs.includes('lab-scim') ? 50 : 0) + (academyCompletedCount * 2)), icon: Database, color: 'from-amber-500 to-orange-500' },
                  { name: 'Zero Trust & Continuous Trust', val: Math.min(100, (scenarioRun ? 40 : 0) + (academyCompletedCount * 2)), icon: Shield, color: 'from-purple-500 to-indigo-500' }
                ].map((skill, idx) => {
                  const Icon = skill.icon
                  return (
                    <div key={idx} className="border border-border-subtle/60 rounded-xl p-4 bg-bg-nested/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                          <Icon className="w-4 h-4 text-text-muted" /> {skill.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-accent-primary">{skill.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-bg-nested rounded-full overflow-hidden border border-border-subtle/30">
                        <div 
                          className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-500`}
                          style={{ width: `${skill.val}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* BADGES & ACHIEVEMENTS SEALS LIST */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-current animate-pulse-slow" /> Security Badges & Achievements
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Solve lab sandbox targets and complete curriculum courses to break seals and unlock your corporate achievements.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {achievements.map((ach) => (
                  <div 
                    key={ach.id}
                    className={`p-4 rounded-xl border flex gap-3.5 transition items-start ${ach.unlocked ? 'border-accent-primary bg-accent-glow/5 shadow-sm' : 'border-border-subtle bg-bg-nested/20'}`}
                  >
                    <div className={`p-2.5 rounded-xl border shrink-0 ${ach.unlocked ? 'bg-accent-primary border-accent-primary text-white shadow shadow-accent-primary/20' : 'bg-bg-nested border-border-subtle text-text-muted'}`}>
                      {ach.unlocked ? <Check className="w-5 h-5 stroke-[3]" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black truncate block ${ach.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>{ach.title}</span>
                        {ach.unlocked && <span className="text-[8px] bg-accent-secondary/15 text-accent-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono shrink-0">Unlocked</span>}
                      </div>
                      <span className="text-[11px] text-text-secondary leading-snug block mt-1">{ach.desc}</span>
                      <span className="text-[9px] text-text-muted font-bold block mt-2 font-mono">Req: {ach.requirement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Global Scoreboard */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Community Contributor Scoreboard
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Your rank updates dynamically based on your completed items. Complete Academy modules and secure hacking labs to claim your spot at the top of the global directory!
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle/60 overflow-hidden bg-bg-nested">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-bg-sidebar border-b border-border-subtle font-black uppercase text-[9px] text-text-muted">
                    <tr>
                      <th className="px-4 py-2.5 text-center w-12">Rank</th>
                      <th className="px-4 py-2.5">Contributor Profile</th>
                      <th className="px-4 py-2.5">Modules Completed</th>
                      <th className="px-4 py-2.5">Specialization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40 bg-bg-card">
                    {leaderboardUsers.map((user) => (
                      <tr 
                        key={user.rank}
                        className={user.isCurrentUser ? 'bg-accent-glow/5 border-y border-accent-primary/20 font-bold' : ''}
                      >
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${
                            user.rank === 1 ? 'bg-amber-500 text-white shadow' :
                            user.rank === 2 ? 'bg-zinc-400 text-white shadow' :
                            user.rank === 3 ? 'bg-amber-700 text-white shadow' : 'bg-bg-nested text-text-secondary border border-border-subtle'
                          }`}>
                            {user.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className={`w-3.5 h-3.5 ${user.isCurrentUser ? 'text-accent-primary' : 'text-text-muted'}`} />
                            <span className={user.isCurrentUser ? 'text-accent-primary' : 'text-text-primary'}>
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-text-secondary">
                          {user.completedCount} / 40 Items
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            user.isCurrentUser ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-muted'
                          }`}>
                            {user.badgeTitle}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: MONTHLY CHALLENGES HUB */}
          <div className="lg:col-span-4 space-y-6">

            {/* Bookmarked Items */}
            {bookmarks.length > 0 && (
              <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-accent-primary" /> Bookmarked ({bookmarks.length})
                </h4>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {bookmarks.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border-subtle bg-bg-nested/30 hover:border-accent-primary/30 transition-colors"
                    >
                      <Link to={b.link} className="text-[11px] font-semibold text-text-primary hover:text-accent-primary truncate min-w-0">
                        {b.title}
                      </Link>
                      <BookmarkButton item={b} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge Selector */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-accent-primary animate-pulse" /> Monthly Tactical Exercises
              </h4>
              <p className="text-[11px] text-text-secondary leading-normal">
                Select an active tactical incident scenario to audit your security instincts:
              </p>

              <div className="space-y-2">
                {challenges.map(chal => (
                  <button
                    key={chal.id}
                    onClick={() => selectChallenge(chal.id)}
                    className={`w-full py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      selectedChallengeId === chal.id
                        ? 'bg-accent-glow/5 border-accent-primary text-accent-primary font-bold'
                        : 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
                    }`}
                  >
                    <span className="text-[10px] truncate max-w-[150px]">{chal.title}</span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      chal.status === 'solved' ? 'bg-emerald-500/10 text-emerald-500' :
                      chal.status === 'failed' ? 'bg-status-danger/10 text-status-danger' : 'bg-bg-card text-text-muted border border-border-subtle'
                    }`}>
                      {chal.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Challenge deep dive */}
            {activeChallenge && (
              <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                <div className="border-b border-border-subtle pb-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase">Tactical Scenario Check</span>
                  <h4 className="text-sm font-black text-text-primary mt-1">
                    {activeChallenge.title}
                  </h4>
                </div>

                <div className="p-3 rounded-lg bg-bg-nested border border-border-subtle text-[11px] text-text-secondary leading-relaxed font-medium">
                  {activeChallenge.scenario}
                </div>

                {/* Answers Option selection list */}
                <div className="space-y-2 pt-2">
                  {activeChallenge.options.map((opt, i) => {
                    const isSelected = selectedAnswerIdx === i
                    const isSolved = activeChallenge.status !== 'active'
                    
                    let optStyle = 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
                    if (isSelected || (isSolved && opt.correct)) {
                      optStyle = opt.correct 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                        : 'bg-status-danger/10 border-status-danger text-status-danger'
                    }

                    return (
                      <button
                        key={i}
                        disabled={isSolved}
                        onClick={() => handleAnswerSubmit(i)}
                        className={`w-full py-2.5 px-3 rounded-xl border text-left text-[10px] font-bold transition-all leading-normal ${optStyle}`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                {/* Real-time result feedback */}
                {challengeResult && (
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all ${
                    challengeResult === 'correct'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
                  }`}>
                    <strong className="block uppercase text-[9px] mb-0.5">
                      {challengeResult === 'correct' ? 'Correct Answer! ✔' : 'Tactical Error! ❌'}
                    </strong>
                    <p className="text-text-secondary leading-normal font-semibold">
                      {activeChallenge.options[selectedAnswerIdx ?? 0].feedback}
                    </p>
                  </div>
                )}

                {activeChallenge.status === 'solved' && !challengeResult && (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-500 font-bold leading-normal flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    This tactical incident scenario has been successfully secured! ✔
                  </div>
                )}

                {activeChallenge.status === 'failed' && !challengeResult && (
                  <div className="p-3 rounded-xl border border-status-danger/20 bg-status-danger/5 text-[11px] text-status-danger font-bold leading-normal flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Incident verification failed. Run reset to try again.
                  </div>
                )}

                {activeChallenge.status !== 'active' && (
                  <button
                    onClick={() => {
                      const updated = { ...challengeState }
                      delete updated[activeChallenge.id]
                      setChallengeState(updated)
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('aboutiam-challenges-progress', JSON.stringify(updated))
                      }
                      setSelectedAnswerId(null)
                      setChallengeResult(null)
                    }}
                    className="w-full py-2 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Exercise
                  </button>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= PRINTABLE GRADUATION CERTIFICATE MODAL ================= */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-subtle rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-scaleUp print-modal">
            
            {/* Modal actions panel (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4 print-hide">
              <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <Award className="w-4 h-4 text-status-success animate-pulse" /> Verify and Print Professional Certificate
              </span>
              <button 
                onClick={() => setShowCertModal(false)}
                className="text-text-muted hover:text-text-primary text-xs font-bold cursor-pointer bg-bg-nested px-2.5 py-1 rounded"
              >
                Close
              </button>
            </div>

            {/* Input Name field (Hidden on Print) */}
            <div className="space-y-2 mb-5 print-hide">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Recipient Full Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Alice Architect"
                  value={certName}
                  onChange={(e) => saveCertName(e.target.value)}
                  className="flex-1 bg-bg-nested border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary font-bold focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
                <button
                  onClick={() => window.print()}
                  disabled={!certName}
                  className={`text-xs px-4 py-2 font-bold rounded-lg border cursor-pointer flex items-center gap-1.5 transition ${!certName ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-status-success text-slate-950 border-status-success shadow shadow-status-success/20'}`}
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
              </div>
            </div>

            {/* ================= PHYSICAL CERTIFICATE CARD CORE ================= */}
            <div className="border-[8px] border-double border-amber-600 bg-[#faf8f5] text-[#1c1917] p-8 rounded-xl relative shadow-inner flex flex-col justify-between items-center text-center min-h-[420px] print:m-0 print:border-amber-600">
              
              {/* Background watermark */}
              <div className="absolute inset-0 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none rounded-lg" />
              
              <div className="space-y-4 relative z-10 w-full">
                <div className="text-[11px] text-amber-700 font-bold uppercase tracking-widest font-mono">Certificate of Competency</div>
                <h2 className="text-2xl font-black font-serif italic text-stone-900 border-b border-amber-600/30 pb-4 max-w-md mx-auto">Identity & Access Engineering</h2>
                
                <p className="text-[11px] text-stone-600 italic font-serif mt-5">This official browser-native credential is proudly presented to</p>
                <div className="text-xl font-black tracking-tight text-stone-900 font-sans border-b-2 border-stone-800/80 inline-block px-12 py-1 min-w-[240px] uppercase">
                  {certName || 'ALICE ARCHITECT'}
                </div>
                
                <p className="text-[11px] text-stone-600 leading-relaxed max-w-md mx-auto font-serif">
                  For successfully demonstrating expert proficiency in core Identity & Access Management disciplines, and mitigating critical vulnerabilities across standard OAuth 2.0 Auth Codes, cryptographic JWT signings, SAML 2.0 wrapped assertions, and SCIM 2.0 API structures.
                </p>
              </div>

              {/* Certificate Signers and Seals Footer */}
              <div className="w-full flex items-end justify-between mt-8 border-t border-amber-600/30 pt-6 relative z-10 font-mono text-[9px] text-stone-600 leading-tight">
                <div className="text-left space-y-1">
                  <span>Authorized Authority</span>
                  <div className="font-serif italic text-[11px] text-stone-800 font-bold">AboutIAM Academy Board</div>
                  <span>Credential Status: <strong className="text-emerald-700 uppercase">Verified</strong></span>
                </div>

                {/* Phishing proof seal */}
                <div className="w-14 h-14 rounded-full border-4 border-double border-amber-600 bg-amber-500/10 flex items-center justify-center relative shadow">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>

                <div className="text-right space-y-1">
                  <span>Cryptographic Hashed Seal</span>
                  <div className="font-mono text-stone-800 font-bold">SHA256_FIDO2_SECURE</div>
                  <span>Issued Date: <strong>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Embedded Certificate Print Styling Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-modal, .print-modal * {
            visibility: visible;
          }
          .print-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>

    </div>
  )
}
