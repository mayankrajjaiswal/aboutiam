import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Award, ArrowRight, Settings, List, Terminal, ChevronRight, ExternalLink
} from 'lucide-react'
import { CERTIFICATIONS, CERTIFICATION_CATEGORIES, type CertDifficulty } from '../data/certificationsData'

interface Flashcard {
  cert: string
  q: string
  a: string
}

const FLASHCARDS: Flashcard[] = [
  { cert: 'sc300', q: 'What is considered a "Phishing-Resistant" MFA method in Microsoft Entra ID?', a: 'FIDO2 Security Keys (hardware enclaves), Windows Hello for Business, and Microsoft Authenticator Passwordless. Traditional push and SMS OTP are NOT phishing-resistant.' },
  { cert: 'sc300', q: 'What occurs during a Privileged Identity Management (PIM) Role Activation request?', a: 'The user swaps their "Eligible" role status for an "Active" state. This triggers JIT elevation, enforcing duration bounds (e.g. 2 hours), manager approvals, and ticket MFA audits.' },
  { cert: 'okta_admin', q: 'What is the role of Okta Universal Directory (UD) attribute mapping expressions?', a: 'It maps directory properties (AD/LDAP) to standardized Okta attributes using Okta Expression Language. Allows on-the-fly string concatenations, defaults, or conditional transformations (e.g. email lowercasing).' },
  { cert: 'okta_admin', q: 'What is the functional purpose of Okta Access Gateway (OAG)?', a: 'A reverse proxy that connects on-premise, header-based legacy applications with Okta\'s cloud OIDC/SAML directory. It injects authenticated user headers locally after verifying cloud credentials.' },
  { cert: 'cyberark_defender', q: 'What is the primary difference between CPM and PSM in CyberArk?', a: 'CPM (Central Policy Manager) is responsible for automatic password rotation and synchronization on target machines. PSM (Privileged Session Manager) acts as a secure jump-server proxy, isolating connections and injecting credentials directly into SSH/RDP streams.' }
]

const DIFFICULTIES: CertDifficulty[] = ['Beginner', 'Intermediate', 'Advanced']

function buildCertificationsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/certifications/',
    'name': 'AboutIAM Enterprise Certification Hub',
    'description': 'Beginner-to-advanced identity, cloud, PAM, IGA, privacy, and GRC certification study guides with mock exams.',
    'hasPart': CERTIFICATIONS.map((c) => ({
      '@type': 'TechArticle',
      '@id': `https://www.aboutiam.com/certifications/#${c.id}`,
      'headline': c.title,
      'about': c.category,
      'description': `${c.vendor} certification — ${c.category}.`,
      'url': `https://www.aboutiam.com/certifications?cert=${c.id}`
    }))
  }
}

export default function CertificationHub() {
  const [activeCert, setActiveCert] = useState(CERTIFICATIONS[0].id)
  const [difficultyFilter, setDifficultyFilter] = useState<CertDifficulty | 'All'>('All')
  const cert = useMemo(() => CERTIFICATIONS.find(c => c.id === activeCert) ?? CERTIFICATIONS[0], [activeCert])

  // Active quiz state
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // Active flashcard state
  const [flashIndex, setFlashIndex] = useState(0)
  const [flashFlipped, setFlashFlipped] = useState(false)

  const handleCertChange = (id: string) => {
    setActiveCert(id)
    setQuizIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setQuizFinished(false)
    setFlashIndex(0)
    setFlashFlipped(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('cert')
      if (id && CERTIFICATIONS.some(c => c.id === id)) {
        setTimeout(() => {
          handleCertChange(id)
        }, 0)
      }
    }
  }, [])

  const handleOptionClick = (index: number) => {
    if (showExplanation || !cert.quiz) return
    setSelectedOption(index)
    if (index === cert.quiz[quizIndex].correct) {
      setScore(prev => prev + 1)
    }
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    if (!cert.quiz) return
    setSelectedOption(null)
    setShowExplanation(false)
    if (quizIndex < cert.quiz.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      setQuizFinished(true)
    }
  }

  const restartQuiz = () => {
    setQuizIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setQuizFinished(false)
  }

  const visibleCategories = useMemo(() => {
    return CERTIFICATION_CATEGORIES
      .map(category => ({
        category,
        certs: CERTIFICATIONS.filter(c => c.category === category && (difficultyFilter === 'All' || c.difficulty === difficultyFilter))
      }))
      .filter(group => group.certs.length > 0)
  }, [difficultyFilter])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCertificationsJsonLd()).replace(/</g, '\\u003c') }}
      />
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Certification Hub</h1>
            <p className="text-xs text-text-secondary">Study roadmaps, domains, and practice tests across {CERTIFICATIONS.length}+ identity credentials — beginner to advanced</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Hub
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column: Cert selectors */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Filter by Difficulty
            </span>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {(['All', ...DIFFICULTIES] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${difficultyFilter === d ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md max-h-[520px] overflow-y-auto">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Certification
            </span>

            <div className="flex flex-col gap-3">
              {visibleCategories.map(group => (
                <div key={group.category}>
                  <span className="text-[9px] text-text-muted font-black uppercase tracking-wider block mb-1.5">{group.category}</span>
                  <div className="flex flex-col gap-1.5">
                    {group.certs.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleCertChange(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-between gap-2 ${activeCert === c.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                      >
                        <span className="leading-tight">{c.title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeCert === c.id ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick exam stats */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md space-y-3 text-xs leading-normal text-text-secondary">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block border-b border-border-subtle pb-1">
              Exam Details
            </span>
            <div>
              <span className="block text-text-muted text-[10px] uppercase font-bold">Difficulty</span>
              <span className={`font-semibold ${cert.difficulty === 'Advanced' ? 'text-status-danger' : 'text-accent-secondary'}`}>{cert.difficulty}</span>
            </div>
            <div>
              <span className="block text-text-muted text-[10px] uppercase font-bold">Standard Cost</span>
              <span className="font-semibold text-text-primary">{cert.cost}</span>
            </div>
            {cert.examCode && (
              <div>
                <span className="block text-text-muted text-[10px] uppercase font-bold">Exam Code</span>
                <span className="font-semibold text-text-primary">{cert.examCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Blueprint domains and Practice Quiz */}
        <div className="lg:col-span-9 space-y-6">

          {/* Cert Title Hero */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <Award className="w-24 h-24 text-accent-primary" />
            </div>

            <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-2.5 py-1 rounded-full">
              {cert.vendor} certification
            </span>
            <h2 className="text-xl font-black text-text-primary mt-2.5">{cert.title}</h2>
            <a href={cert.officialLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-primary hover:underline">
              Official Exam Guide <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Domains vs Study Path grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Blueprint Domains */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                <List className="w-4 h-4 text-blue-400" /> Blueprint Focus Domains
              </span>

              <div className="space-y-3 text-xs leading-normal">
                {cert.domains.map((dom) => (
                  <div key={dom.name} className="flex justify-between items-start gap-4 p-2.5 bg-bg-nested/30 border border-border-subtle rounded-lg">
                    <span className="text-text-secondary">{dom.name}</span>
                    <span className="text-[10px] font-bold bg-accent-glow border border-accent-primary/20 px-1.5 py-0.5 rounded text-accent-primary shrink-0">
                      {dom.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Path */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-teal-400" /> Recommended Study Path
                </span>

                <div className="space-y-2.5 text-xs text-text-secondary leading-normal">
                  {cert.studyPath.map((path, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{path}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended AboutIAM Labs */}
              <div className="mt-5 pt-3 border-t border-border-subtle">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mb-1.5">Recommended practice in AboutIAM</span>
                <div className="flex flex-wrap gap-1.5">
                  {cert.recommendedLabs.map((lab) => (
                    <Link
                      key={lab.name}
                      to={lab.path}
                      className="text-[10px] bg-bg-nested hover:bg-border-subtle border border-border-subtle text-accent-primary font-bold px-2 py-1 rounded"
                    >
                      {lab.name} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Filter and render dynamic study flashcards */}
          {useMemo(() => {
            const filteredFlashcards = FLASHCARDS.filter(f => f.cert === activeCert)
            if (filteredFlashcards.length === 0) return null
            return (
              <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-4">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent-primary animate-pulse" /> Active Exam Study Flashcards
                </span>

                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Flashcard Box (Flip-able) */}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setFlashFlipped(!flashFlipped)}
                      className="w-full text-left focus:outline-none"
                    >
                      <div className="relative min-h-[160px] w-full rounded-xl border border-border-subtle p-5 shadow-inner transition-all flex flex-col justify-between cursor-pointer overflow-hidden bg-bg-sidebar select-none hover:border-accent-primary/40 group">
                        <div className="absolute top-2 right-2.5 text-[8px] font-black text-text-muted uppercase tracking-wider">
                          {flashFlipped ? '📖 REVEALED ANSWER' : '❓ STUDY FLASHCARD QUESTION'}
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-accent-secondary uppercase tracking-wider">
                            CARD {flashIndex + 1} OF {filteredFlashcards.length}
                          </span>
                          <p className={`font-semibold tracking-tight transition-colors leading-relaxed ${
                            flashFlipped ? 'text-xs text-text-secondary select-text' : 'text-sm text-text-primary font-bold group-hover:text-accent-primary'
                          }`}>
                            {flashFlipped ? filteredFlashcards[flashIndex].a : filteredFlashcards[flashIndex].q}
                          </p>
                        </div>

                        <div className="text-[10px] text-accent-primary font-black uppercase text-center mt-3 pt-2 border-t border-border-subtle/30 leading-none">
                          {flashFlipped ? '↺ Click to view Question' : '💡 Click to Flip and Reveal Answer'}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Navigation controls */}
                  <div className="p-4 bg-bg-sidebar border border-border-subtle/50 rounded-xl space-y-3">
                    <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle/30 pb-1.5">Study Navigation</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={flashIndex === 0}
                        onClick={() => {
                          setFlashIndex(idx => idx - 1)
                          setFlashFlipped(false)
                        }}
                        className="flex-1 py-1.5 bg-bg-card hover:bg-bg-nested border border-border-subtle rounded text-[10px] font-bold text-text-secondary disabled:opacity-40"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        disabled={flashIndex >= filteredFlashcards.length - 1}
                        onClick={() => {
                          setFlashIndex(idx => idx + 1)
                          setFlashFlipped(false)
                        }}
                        className="flex-1 py-1.5 bg-bg-card hover:bg-bg-nested border border-border-subtle rounded text-[10px] font-bold text-text-secondary disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFlashIndex(0)
                        setFlashFlipped(false)
                      }}
                      className="w-full py-1 bg-bg-card hover:bg-bg-nested border border-border-subtle rounded text-[9px] font-black text-text-muted uppercase"
                    >
                      Reset Deck
                    </button>
                  </div>
                </div>
              </div>
            )
          }, [activeCert, flashIndex, flashFlipped])}

          {/* Interactive Quiz Panel (only for certs with a hand-authored quiz) or Study Blueprint fallback */}
          {cert.quiz ? (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-accent-primary" /> Active Mock Practice Quiz
              </span>

              {!quizFinished ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] font-mono text-text-muted border-b border-border-subtle/50 pb-1.5">
                    <span>QUESTION {quizIndex + 1} OF {cert.quiz.length}</span>
                    <span>CURRENT SCORE: {score}</span>
                  </div>

                  <p className="text-sm font-bold text-text-primary leading-relaxed">
                    {cert.quiz[quizIndex].q}
                  </p>

                  <div className="space-y-2.5">
                    {cert.quiz[quizIndex].options.map((opt, optIdx) => {
                      const isCorrect = optIdx === cert.quiz![quizIndex].correct
                      const isSelected = optIdx === selectedOption

                      let btnStyle = 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested/60'
                      if (showExplanation) {
                        if (isCorrect) {
                          btnStyle = 'bg-status-success/15 border-status-success text-status-success'
                        } else if (isSelected) {
                          btnStyle = 'bg-status-danger/10 border-status-danger text-status-danger'
                        } else {
                          btnStyle = 'bg-bg-nested/20 border-border-subtle/60 text-text-muted cursor-not-allowed'
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionClick(optIdx)}
                          disabled={showExplanation}
                          className={`w-full text-left p-3.5 rounded-lg border text-xs leading-normal transition flex justify-between items-center font-semibold ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showExplanation && isCorrect && <span className="text-status-success font-black text-sm shrink-0 ml-3">✓ Correct</span>}
                          {showExplanation && isSelected && !isCorrect && <span className="text-status-danger font-black text-sm shrink-0 ml-3">✗ Incorrect</span>}
                        </button>
                      )
                    })}
                  </div>

                  {showExplanation && (
                    <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/25 text-xs text-text-secondary leading-relaxed animate-fadeIn">
                      <span className="font-extrabold text-accent-primary block mb-1 text-[10px] uppercase tracking-wider">Concept Explanation</span>
                      {cert.quiz[quizIndex].explanation}

                      <button
                        onClick={nextQuestion}
                        className="mt-4 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition ml-auto"
                      >
                        {quizIndex < cert.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-4 animate-fadeIn">
                  <Award className="w-12 h-12 text-status-success mx-auto animate-bounce" />
                  <h3 className="text-lg font-black text-text-primary uppercase tracking-wider">Quiz Completed!</h3>

                  <div className="max-w-xs mx-auto p-4 bg-bg-nested/40 border border-border-subtle rounded-xl text-center space-y-1">
                    <span className="text-text-muted text-[10px] uppercase font-bold">Your Score</span>
                    <span className="text-2xl font-black text-accent-primary block">{score} / {cert.quiz.length}</span>
                    <span className="text-[11px] text-text-secondary leading-normal block pt-1.5 font-semibold">
                      {score === cert.quiz.length ? '👑 Perfect Score! You are ready for the exam!' : '👍 Good effort! Review the study path on the left.'}
                    </span>
                  </div>

                  <button
                    onClick={restartQuiz}
                    className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition mx-auto"
                  >
                    Restart Quiz
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md text-center space-y-3">
              <Terminal className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
                A mock practice quiz for this certification isn't available yet. Use the blueprint domains and study path above, then head to the official exam guide to continue preparing.
              </p>
              <a
                href={cert.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Official Exam Guide <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
