import { useState } from 'react'
import {
  BookOpen, CheckCircle2, ChevronDown, ChevronUp, HelpCircle,
  Info, AwardIcon, Sparkles, LayoutGrid, RotateCcw, Briefcase
} from 'lucide-react'
import { usePreferenceStore, type RoleTrackId } from '../store/preferenceStore'
import { ACADEMY_TRACKS, type Track } from '../data/academyTracks'
import { touchAcademyModule } from '../lib/home/lastTouched'

// Maps a Career Center role track to the single Academy track most relevant to it.
const ROLE_TRACK_RECOMMENDATIONS: Record<RoleTrackId, { trackId: string; roleLabel: string }> = {
  fresher: { trackId: 'track-1', roleLabel: 'Fresher / Entry-Level' },
  developer: { trackId: 'track-3', roleLabel: 'Developer' },
  security_engineer: { trackId: 'track-6', roleLabel: 'Security Engineer' },
  iam_engineer: { trackId: 'track-2', roleLabel: 'IAM Engineer' },
  architect: { trackId: 'track-5', roleLabel: 'Enterprise Architect' },
  principal: { trackId: 'track-5', roleLabel: 'Principal / Director' },
}

interface AcademyQuiz {
  q: string
  options: string[]
  correct: number
  explanation: string
}

const ACADEMY_QUIZZES: Record<string, AcademyQuiz> = {
  'track-1': {
    q: "Which component of an IAM architecture is responsible for verifying that an identity exists and matching presented credentials (e.g. passwords, biometrics)?",
    options: [
      "Authorization Server (STS)",
      "Authentication Provider (Identity Provider - IdP)",
      "Directory Repository (User Database / Active Directory)",
      "Policy Decision Point (PDP)"
    ],
    correct: 1,
    explanation: "The Authentication Provider (IdP) is responsible for verifying the authenticity of an identity (matching presented credentials like passwords or biometrics) and asserting that verified state to downstream applications."
  },
  'track-2': {
    q: "Why are FIDO2/WebAuthn hardware credentials structurally immune to phishing attacks compared to traditional passwords or SMS OTPs?",
    options: [
      "They utilize standard symmetric shared keys stored on the server.",
      "The private key is cryptographically bound to the origin domain and never leaves the hardware security enclave/TPM.",
      "They enforce longer password lengths dynamically in the background.",
      "They are backed by blockchain ledger verifications."
    ],
    correct: 1,
    explanation: "Under FIDO2/WebAuthn, the browser binds the asymmetric keypair to the specific origin domain. The private key remains locked inside the device TPM enclave and is never sent over the wire, neutralizing phishing and credential-theft."
  },
  'track-3': {
    q: "In an Attribute-Based Access Control (ABAC) engine, which component evaluates request contexts (user, device, network, resources) against policies to return a security decision?",
    options: [
      "Policy Enforcement Point (PEP)",
      "Policy Decision Point (PDP)",
      "Policy Administration Point (PAP)",
      "Policy Information Point (PIP)"
    ],
    correct: 1,
    explanation: "The Policy Decision Point (PDP) acts as the logic engine. It evaluates incoming contextual attributes supplied by the PIP against active authorization policies to return a verdict (permit vs. deny)."
  },
  'track-4': {
    q: "An organization wants to enforce Segregation of Duties (SoD) inside their finance system. Which control represents a valid SoD implementation?",
    options: [
      "Requiring all finance employees to use hardware Passkeys.",
      "Ensuring that the user who creates a vendor record cannot also approve payments to that same vendor.",
      "Automatically rotating administrative passwords every 24 hours.",
      "Recording administrative sessions inside a secure PAM vault."
    ],
    correct: 1,
    explanation: "Segregation of Duties (SoD) prevents fraud by dividing critical, multi-step actions across separate identities, ensuring no single user possesses complete control over a sensitive transaction lifecycle."
  },
  'track-5': {
    q: "What is the primary architectural purpose of implementing 'Progressive Profiling' inside a Customer Identity (CIAM) journey?",
    options: [
      "To force users to undergo MFA checks on every single login attempt.",
      "To gradually collect additional user profile attributes over multiple sessions as trust is established, reducing registration friction.",
      "To index user behaviors across social directories like Google or Apple.",
      "To cryptographically encrypt customer metadata inside browser localStorage."
    ],
    correct: 1,
    explanation: "Progressive Profiling reduces onboarding friction by only asking for mandatory information (e.g. email) during registration, and progressively requesting additional attributes in subsequent logins as they engage."
  },
  'track-6': {
    q: "Under the SPIFFE standard, what is an SVID (SPIFFE Verifiable Identity Document) used for?",
    options: [
      "To store encrypted enterprise master passwords on-premise.",
      "To authenticate software workloads securely across cloud boundaries using short-lived X.509 certificates or JWTs.",
      "To verify corporate domain compliance on employee workstations.",
      "To federate workforce SSO connections via SAML redirects."
    ],
    correct: 1,
    explanation: "An SVID is a cryptographically verifiable, short-lived identity document (formatted as an X.509 certificate or JWT) issued dynamically to running workloads, allowing software robots to attest identity securely without static secrets."
  }
}

export default function Learn() {
  const roleTrack = usePreferenceStore((s) => s.roleTrack)
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [expandedModule, setExpandedExpandedModule] = useState<string | null>(null)
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('aboutiam-academy-progress')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Track quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { selectedIdx: number; correct: boolean | null }>>({})

  const handleSelectQuizOption = (trackId: string, optionIdx: number, correctIdx: number) => {
    const isCorrect = optionIdx === correctIdx
    setQuizAnswers(prev => ({
      ...prev,
      [trackId]: { selectedIdx: optionIdx, correct: isCorrect }
    }))
  }

  const handleResetQuiz = (trackId: string) => {
    setQuizAnswers(prev => {
      const copy = { ...prev }
      delete copy[trackId]
      return copy
    })
  }

  const renderTrackQuiz = (trackId: string) => {
    const quiz = ACADEMY_QUIZZES[trackId]
    if (!quiz) return null

    const answer = quizAnswers[trackId]
    const isAnswered = !!answer

    return (
      <div className="p-5 bg-bg-card border border-border-subtle rounded-2xl shadow-sm space-y-4 mt-6">
        <div className="border-b border-border-subtle pb-3">
          <span className="text-[10px] text-accent-primary font-black uppercase tracking-wider">Track Verification Quiz</span>
          <h5 className="text-sm font-black text-text-primary mt-1.5 leading-snug">
            {quiz.q}
          </h5>
        </div>

        <div className="space-y-2">
          {quiz.options.map((opt, i) => {
            const isSelected = answer?.selectedIdx === i
            let btnStyle = 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
            
            if (isAnswered) {
              if (i === quiz.correct) {
                btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
              } else if (isSelected) {
                btnStyle = 'bg-status-danger/10 border-status-danger text-status-danger font-bold'
              } else {
                btnStyle = 'border-border-subtle bg-bg-nested opacity-50 text-text-secondary'
              }
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelectQuizOption(trackId, i, quiz.correct)}
                className={`w-full py-2.5 px-3 rounded-lg border text-left text-[11px] font-bold transition-all leading-normal ${btnStyle}`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
            answer.correct 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
          }`}>
            <strong className="block uppercase text-[9px] mb-0.5">
              {answer.correct ? 'Verification Successful! ✔' : 'Incorrect Choice! ❌'}
            </strong>
            <p className="text-text-secondary font-semibold leading-normal">
              {quiz.explanation}
            </p>
          </div>
        )}

        {isAnswered && (
          <button
            onClick={() => handleResetQuiz(trackId)}
            className="px-3 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle rounded text-[9px] font-black text-text-secondary uppercase transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Retry Quiz
          </button>
        )}
      </div>
    )
  }

  // Toggle module completion and persist
  const toggleModuleCompletion = (modId: string) => {
    const updated = { ...completedModules, [modId]: !completedModules[modId] }
    setCompletedModules(updated)
    try {
      localStorage.setItem('aboutiam-academy-progress', JSON.stringify(updated))
      if (updated[modId]) touchAcademyModule(modId)
    } catch {
      // localStorage unavailable (private browsing quota, etc.) — in-memory state still updated
    }
  }

  // Calculate track progress
  const getTrackProgress = (track: Track) => {
    const total = track.modules.length
    const completed = track.modules.filter(m => completedModules[m.id]).length
    const pct = Math.round((completed / total) * 100)
    return { completed, total, pct }
  }


  // Get total modules completed metrics
  const getGlobalStats = () => {
    const total = 36
    const completed = Object.values(completedModules).filter(Boolean).length
    const pct = Math.round((completed / total) * 100)
    return { completed, total, pct }
  }

  const globalStats = getGlobalStats()

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header with Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border-subtle">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <BookOpen className="w-3.5 h-3.5" /> AboutIAM Academy
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Central Academy Curriculum
          </h2>
          <p className="text-text-secondary">
            Master Identity structures across 6 progressive tracks and 36 curated learning modules. Explore conceptual analogies, study expert takeaways, and track your graduation progress.
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shrink-0 md:w-80 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
            <span className="text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-primary animate-pulse-slow" /> Overall Graduation
            </span>
            <span className="text-accent-primary">{globalStats.completed} / {globalStats.total} Done</span>
          </div>
          <div className="relative w-full h-2.5 bg-bg-sidebar rounded-full overflow-hidden border border-border-subtle/50">
            <div 
              style={{ width: `${globalStats.pct}%` }}
              className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-700"
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase">
            <span>Progress: {globalStats.pct}%</span>
            {globalStats.completed === 36 ? (
              <span className="text-status-success flex items-center gap-1"><AwardIcon className="w-3.5 h-3.5" /> Graduated!</span>
            ) : (
              <span>Not Graduated</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Track Banner (personalized via Header's career-track preference) */}
      {roleTrack && ROLE_TRACK_RECOMMENDATIONS[roleTrack] && (
        <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-accent-primary shrink-0" />
            <p className="text-xs font-semibold text-text-primary">
              Recommended for <strong>{ROLE_TRACK_RECOMMENDATIONS[roleTrack].roleLabel}</strong>: {ACADEMY_TRACKS.find((t) => t.id === ROLE_TRACK_RECOMMENDATIONS[roleTrack].trackId)?.title}
            </p>
          </div>
          <button
            onClick={() => setExpandedTrack(ROLE_TRACK_RECOMMENDATIONS[roleTrack].trackId)}
            className="text-xs font-black text-accent-primary hover:text-accent-hover uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Jump to Track →
          </button>
        </div>
      )}

      {/* Main Two Column Workspace */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side Track Selector Accordion (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Academy Tracks</span>

          {ACADEMY_TRACKS.map((track) => {
            const { completed, total, pct } = getTrackProgress(track)
            const isTrackExpanded = expandedTrack === track.id
            const isGraduated = completed === total

            return (
              <div 
                key={track.id} 
                className={`rounded-xl border transition-all ${
                  isTrackExpanded 
                    ? 'border-accent-primary bg-bg-card shadow-md' 
                    : 'border-border-subtle bg-bg-card/50 hover:bg-bg-card hover:border-accent-primary/20'
                }`}
              >
                {/* Track Card Header */}
                <button
                  onClick={() => setExpandedTrack(isTrackExpanded ? null : track.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isTrackExpanded 
                        ? 'bg-accent-primary text-white border-accent-primary' 
                        : 'bg-bg-sidebar text-text-secondary border-border-subtle'
                    }`}>
                      <track.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors flex items-center gap-2">
                        {track.title}
                        {isGraduated && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-success/10 border border-status-success/20 text-status-success font-extrabold uppercase flex items-center gap-0.5">
                            Graduated
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-xl">
                        {track.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Progress Dial */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[10px] font-bold text-text-muted">
                      <span>{completed}/{total} Completed</span>
                      <span className={isGraduated ? 'text-status-success' : 'text-text-secondary'}>{pct}%</span>
                    </div>
                    {isTrackExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Sub-Modules Accordion List */}
                {isTrackExpanded && (
                  <div className="border-t border-border-subtle/50 px-5 py-4 bg-bg-sidebar/30 divide-y divide-border-subtle/40">
                    {track.modules.map((mod) => {
                      const isModExpanded = expandedModule === mod.id
                      const isDone = !!completedModules[mod.id]

                      return (
                        <div key={mod.id} className="py-4 first:pt-0 last:pb-0">
                          {/* Sub-Module Row */}
                          <div className="flex items-center justify-between gap-4">
                            <button
                              onClick={() => setExpandedExpandedModule(isModExpanded ? null : mod.id)}
                              className="text-left font-bold text-text-primary text-sm hover:text-accent-primary transition-colors flex items-center gap-2"
                            >
                              <span className="text-text-muted text-xs font-mono">{mod.id.toUpperCase()}</span>
                              {mod.title}
                              {isModExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {/* Mark as completed Checklist control */}
                            <button
                              onClick={() => toggleModuleCompletion(mod.id)}
                              className={`px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                isDone
                                  ? 'bg-status-success/10 border-status-success/30 text-status-success shadow-inner'
                                  : 'border-border-subtle hover:bg-bg-nested text-text-secondary bg-bg-card'
                              }`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-status-success' : 'text-text-muted'}`} />
                              {isDone ? 'Completed' : 'Mark Completed'}
                            </button>
                          </div>

                          {/* Expanded Content Sub-Panel */}
                          {isModExpanded && (
                            <div className="mt-4 pl-8 grid md:grid-cols-2 gap-4 text-xs font-semibold text-text-secondary animate-fadeIn">
                              {/* Left Side: General Overview and Analogy (Beginner friendly) */}
                              <div className="p-4 bg-bg-card rounded-xl border border-border-subtle space-y-2">
                                <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1">
                                  <HelpCircle className="w-3.5 h-3.5" /> Beginner-friendly Analogy
                                </span>
                                <p className="text-text-secondary leading-relaxed font-medium">
                                  {mod.desc}
                                </p>
                                <div className="pt-2 border-t border-border-subtle/50 text-text-muted italic font-medium leading-normal">
                                  "{mod.analogy}"
                                </div>
                              </div>

                              {/* Right Side: Architecture Deep-Dive (Expert level) */}
                              <div className="p-4 bg-bg-card rounded-xl border border-border-subtle space-y-2">
                                <span className="text-[10px] font-bold text-accent-secondary uppercase tracking-wider flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5 text-accent-secondary" /> Expert Architectural Blueprint
                                </span>
                                <p className="text-[11px] text-text-primary leading-relaxed font-mono whitespace-pre-wrap break-all bg-bg-nested/40 p-3 rounded-lg border border-border-subtle/30">
                                  {mod.expertTakeaway}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* INTERACTIVE TRACK QUIZ BLOCK */}
                    {renderTrackQuiz(track.id)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Side Overview Sidebar (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm h-fit space-y-4">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <LayoutGrid className="w-4 h-4 text-accent-primary" /> Track Overview Map
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Browse any track directly. Your progression is saved locally so you can resume learning at your own pace.
            </p>
            <div className="space-y-2 text-xs font-semibold">
              {ACADEMY_TRACKS.map((track) => {
                const { completed, total } = getTrackProgress(track)
                const isGraduated = completed === total
                return (
                  <button
                    key={track.id}
                    onClick={() => setExpandedTrack(track.id)}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-colors ${
                      expandedTrack === track.id
                        ? 'border-accent-primary/30 bg-accent-glow/5 text-accent-primary'
                        : 'border-border-subtle bg-bg-sidebar/30 text-text-secondary'
                    }`}
                  >
                    <span>{track.title.substring(3)}</span>
                    <span className={`text-[10px] font-bold uppercase ${isGraduated ? 'text-status-success' : 'text-text-muted'}`}>
                      {completed}/{total}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
