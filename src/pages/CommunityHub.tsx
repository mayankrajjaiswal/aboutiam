import { useState } from 'react'
import { 
  Users, Award, Shield, ShieldAlert, CheckCircle2, RotateCcw, 
  Trophy, BookOpen, User, Star, Flame
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  desc: string
  requirement: string
  unlocked: boolean
  category: 'Academy' | 'Playgrounds' | 'Special'
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
  const [museumVisited] = useState(() => typeof window !== 'undefined' && localStorage.getItem('aboutiam-museum-visited') === 'true')
  const [builderConfigured] = useState(() => typeof window !== 'undefined' && localStorage.getItem('aboutiam-builder-configured') === 'true')
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

  // Calculations
  const completedCount = Object.values(completedModules).filter(Boolean).length
  
  // Track completions
  const graduatedTracksCount = [1, 2, 3, 4, 5, 6].filter(trackNum => {
    const trackModuleIds = [`m${trackNum}.1`, `m${trackNum}.2`, `m${trackNum}.3`, `m${trackNum}.4`, `m${trackNum}.5`, `m${trackNum}.6`]
    return trackModuleIds.every(id => completedModules[id] === true)
  }).length

  // Core Achievements definitions
  const achievements: Achievement[] = [
    {
      id: 'first-step',
      title: 'Academy Initiate',
      desc: 'Complete at least one learning module in the IAM Academy.',
      requirement: 'Complete 1 Academy Module',
      category: 'Academy',
      unlocked: completedCount >= 1
    },
    {
      id: 'scholar',
      title: 'Identity Scholar',
      desc: 'Graduate from at least one core learning track (all 6 modules completed).',
      requirement: 'Complete any 1 Academy Track',
      category: 'Academy',
      unlocked: graduatedTracksCount >= 1
    },
    {
      id: 'fido2-pioneer',
      title: 'FIDO2 Pioneer',
      desc: 'Complete the Passwordless, Passkeys, or WebAuthn module in the Academy.',
      requirement: 'Complete Module 2.4, 2.5 or 2.6',
      category: 'Academy',
      unlocked: !!(completedModules['m2.4'] || completedModules['m2.5'] || completedModules['m2.6'])
    },
    {
      id: 'zero-trust',
      title: 'Zero Trust Defender',
      desc: 'Complete the continuous trust scoring or Zero Trust evaluation Academy module.',
      requirement: 'Complete Module 3.5 or 3.6',
      category: 'Academy',
      unlocked: !!(completedModules['m3.5'] || completedModules['m3.6'])
    },
    {
      id: 'trust-architect',
      title: 'Identity Architect',
      desc: 'Configure or simulate a custom workspace topology inside the Enterprise Reference Builder.',
      requirement: 'Interact with the Reference Builder',
      category: 'Playgrounds',
      unlocked: builderConfigured
    },
    {
      id: 'security-warden',
      title: 'SecOps Inspector',
      desc: 'Audit real-world incident post-mortems and breaches inside the Vulnerability Lab.',
      requirement: 'Visit the Vulnerability Lab',
      category: 'Special',
      unlocked: museumVisited
    },
    {
      id: 'grandmaster',
      title: 'IAM Grandmaster',
      desc: 'Successfully complete all 36 expanding modules in the IAM Academy.',
      requirement: 'Complete all 36 Academy Modules',
      category: 'Academy',
      unlocked: completedCount === 36
    }
  ]

  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length

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
      localStorage.setItem('aboutiam-challenges-progress', JSON.stringify(updatedState))
    } else {
      setChallengeResult('failed')
      const updatedState = { ...challengeState, [activeChallenge.id]: 'failed' as const }
      setChallengeState(updatedState)
      localStorage.setItem('aboutiam-challenges-progress', JSON.stringify(updatedState))
    }
  }

  // Load different challenge
  const selectChallenge = (id: string) => {
    setSelectedChallengeId(id)
    setSelectedAnswerId(null)
    setChallengeResult(null)
  }

  // User rank calculation
  const getRankName = () => {
    if (completedCount === 0) return 'Novice'
    if (completedCount <= 6) return 'Apprentice specialist'
    if (completedCount <= 18) return 'Identity Associate'
    if (completedCount <= 30) return 'Security Engineer'
    if (completedCount <= 35) return 'IAM Architect'
    return 'IAM Grandmaster'
  }

  // Simulated Global Contributor Leaderboard
  const getMockLeaderboard = (): LeaderboardUser[] => {
    const baseUsers: Omit<LeaderboardUser, 'rank'>[] = [
      { name: 'Mayank (Lead Architect)', completedCount: 36, badgeTitle: 'IAM Grandmaster' },
      { name: 'Fernando Corbató', completedCount: 32, badgeTitle: 'IAM Architect' },
      { name: 'Alice (SecOps Chief)', completedCount: 24, badgeTitle: 'Security Engineer' },
      { name: 'Rajat (Contributor)', completedCount: 18, badgeTitle: 'Identity Associate' },
      { name: 'Allan Scherr', completedCount: 12, badgeTitle: 'Apprentice specialist' }
    ]

    // Inject current user dynamically based on completions
    const currentUser: Omit<LeaderboardUser, 'rank'> = {
      name: 'You (Local Student)',
      completedCount,
      badgeTitle: getRankName(),
      isCurrentUser: true
    }

    const merged = [...baseUsers, currentUser]
    // Sort descending by completion
    merged.sort((a, b) => b.completedCount - a.completedCount)

    return merged.map((user, idx) => ({
      rank: idx + 1,
      ...user
    }))
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Users className="w-3.5 h-3.5" /> Community Dashboard
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Community & Achievements
        </h2>
        <p className="text-text-secondary">
          Review your local progression stats, unlock cryptographic achievement badges, tackle monthly technical security scenarios, and see where you stand on our global community contributor scoreboard.
        </p>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* User Rank Card */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-glow border border-accent-primary/15 text-accent-primary flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <span className="block text-[10px] text-text-muted font-bold uppercase">Your Rank</span>
            <span className="block text-md font-black text-text-primary mt-0.5">{getRankName()}</span>
          </div>
        </div>

        {/* Modules Completed */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-text-muted font-bold uppercase">Academy Modules</span>
            <span className="block text-md font-black text-text-primary mt-0.5">{completedCount} / 36 Completed</span>
          </div>
        </div>

        {/* Achievements Unlocked */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-text-muted font-bold uppercase">Badges Earned</span>
            <span className="block text-md font-black text-text-primary mt-0.5">{unlockedAchievementsCount} / {achievements.length} Unlocked</span>
          </div>
        </div>

        {/* Monthly Challenges solved */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-text-muted font-bold uppercase">Challenges Solved</span>
            <span className="block text-md font-black text-text-primary mt-0.5">
              {Object.values(challengeState).filter(status => status === 'solved').length} Completed
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Achievements Grid & Contributor Board (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Unlocked Badges Grid */}
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-primary" /> Contributor Badges
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Unlock specialized cryptographic certificates by graduating tracks, designer suites, or auditing vulnerability centers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                    ach.unlocked
                      ? 'bg-accent-glow/5 border-accent-primary/20 shadow-sm'
                      : 'border-border-subtle/50 bg-bg-nested opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-accent-primary text-white border-accent-primary/20 shadow'
                      : 'bg-bg-card text-text-muted border-border-subtle'
                  }`}>
                    {ach.unlocked ? <Star className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-text-primary leading-tight block">
                        {ach.title}
                      </span>
                      {ach.unlocked ? (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 font-bold uppercase px-1.5 py-0.5 rounded shrink-0">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[8px] bg-bg-card text-text-muted font-bold uppercase px-1.5 py-0.5 rounded border border-border-subtle shrink-0">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-secondary leading-normal">
                      {ach.desc}
                    </p>
                    <span className="text-[9px] text-text-muted font-bold block pt-1 font-mono">
                      Target: {ach.requirement}
                    </span>
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
                Your rank updates dynamically. Complete Academy modules to claim your spot at the top of the global developer directory!
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
                  {getMockLeaderboard().map((user) => (
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
                        {user.completedCount} / 36 Modules
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

        {/* RIGHT COLUMN: Monthly Challenges Hub (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
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
                    localStorage.setItem('aboutiam-challenges-progress', JSON.stringify(updated))
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
  )
}
