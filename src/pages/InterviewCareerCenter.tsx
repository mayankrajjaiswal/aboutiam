import { useState, useEffect, useRef } from 'react'
import {
  Briefcase,
  GraduationCap,
  Award,
  Compass,
  CheckCircle,
  HelpCircle,
  Clock,
  Play,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Code,
  ShieldAlert,
  Terminal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClipboardCopy } from '../components/Tools/useClipboardCopy'
import { CAREER_TRACKS } from '../data/interviewData'

export default function InterviewCareerCenter() {
  const [activeTrackId, setActiveTrackId] = useState('fresher')
  const [activeSection, setActiveSection] = useState<'mcq' | 'scenario' | 'design' | 'coding' | 'mock' | 'resume'>('mcq')

  const track = CAREER_TRACKS.find((t) => t.id === activeTrackId)!

  const { copy, copiedId } = useClipboardCopy()

  // --- 1. MCQ STATE ---
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({})
  const [mcqSubmitted, setMcqSubmitted] = useState<Record<string, boolean>>({})

  const handleMcqSelect = (qId: string, optIndex: number) => {
    if (mcqSubmitted[qId]) return
    setMcqAnswers((prev) => ({ ...prev, [qId]: optIndex }))
  }

  const handleMcqSubmit = (qId: string) => {
    setMcqSubmitted((prev) => ({ ...prev, [qId]: true }))
  }

  const handleMcqReset = () => {
    setMcqAnswers({})
    setMcqSubmitted({})
  }

  // --- 2. SCENARIO STATE ---
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, string>>({})
  const [scenarioRevealed, setScenarioRevealed] = useState<Record<string, boolean>>({})
  const [scenarioCheckpoints, setScenarioCheckpoints] = useState<Record<string, Record<number, boolean>>>({})

  const handleCheckboxToggle = (sId: string, index: number) => {
    setScenarioCheckpoints((prev) => {
      const current = prev[sId] || {}
      return {
        ...prev,
        [sId]: {
          ...current,
          [index]: !current[index],
        },
      }
    })
  }

  // --- 3. DESIGN STATE ---
  const [designInput, setDesignInput] = useState('')

  // Derived Design Score calculation during render (no useEffect, fully typesafe)
  let designScore = 0
  if (track.designSimulations && track.designSimulations.length > 0) {
    const currentSim = track.designSimulations[0]
    let scoredItems = 0
    currentSim.criteriaChecklist.forEach((item) => {
      const matches = item.matchedKeywords.some((kw) =>
        designInput.toLowerCase().includes(kw.toLowerCase())
      )
      if (matches) scoredItems++
    })
    designScore = Math.round((scoredItems / currentSim.criteriaChecklist.length) * 100)
  }

  const handleDesignReset = () => {
    setDesignInput('')
  }

  // --- 4. CODING STATE ---
  const [codingInput, setCodingInput] = useState(CAREER_TRACKS[0].codingExercises[0].starterCode)
  const [codingStatus, setCodingStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [codingHintVisible, setCodingHintVisible] = useState(false)

  const handleRunCode = () => {
    if (track.codingExercises && track.codingExercises.length > 0) {
      const exercise = track.codingExercises[0]
      const regex = new RegExp(exercise.solutionRegex, 'i')

      // Clean the input of excess formatting to perform a resilient evaluation
      const cleanInput = codingInput.replace(/\s+/g, ' ')
      if (regex.test(cleanInput)) {
        setCodingStatus('success')
        setCodingHintVisible(false)
      } else {
        setCodingStatus('failed')
      }
    }
  }

  // --- 5. MOCK INTERVIEW STATE ---
  const [mockActive, setMockActive] = useState(false)
  const [mockQuestionIndex, setMockQuestionIndex] = useState(0)
  const [mockTimer, setMockTimer] = useState(0)
  const [mockUserAnswers, setMockUserAnswers] = useState<Record<string, string>>({})
  const [mockSubmitted, setMockSubmitted] = useState<Record<string, boolean>>({})

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeMockQuestion = track.mockInterviews[mockQuestionIndex]

  const handleStartMock = () => {
    setMockActive(true)
    setMockTimer(activeMockQuestion.suggestedDurationSeconds)
  }

  const handleMockSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setMockSubmitted((prev) => ({ ...prev, [activeMockQuestion.id]: true }))
  }

  const handleNextMock = () => {
    if (mockQuestionIndex < track.mockInterviews.length - 1) {
      const nextIndex = mockQuestionIndex + 1
      setMockQuestionIndex(nextIndex)
      setMockTimer(track.mockInterviews[nextIndex].suggestedDurationSeconds)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setMockTimer((t) => t - 1)
      }, 1000)
    } else {
      // Completed mock
      setMockActive(false)
    }
  }

  const handleResetMock = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setMockActive(false)
    setMockQuestionIndex(0)
    setMockTimer(0)
    setMockUserAnswers({})
    setMockSubmitted({})
  }

  // Timer loop (defined below handler variables so calling them on timeout is safe)
  useEffect(() => {
    if (mockActive && mockTimer > 0) {
      timerRef.current = setInterval(() => {
        setMockTimer((t) => t - 1)
      }, 1000)
    } else if (mockTimer === 0 && mockActive) {
      // Auto-submit on timeout wrapped in a zero-delay timeout to satisfy React compiler bounds
      setTimeout(() => handleMockSubmit(), 0)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockActive, mockTimer])

  // Reset states when changing role track
  const handleTrackChange = (trackId: string) => {
    setActiveTrackId(trackId)
    setActiveSection('mcq')
    handleMcqReset()
    setScenarioAnswers({})
    setScenarioRevealed({})
    setScenarioCheckpoints({})
    handleDesignReset()
    handleResetMock()

    // Initialize coding starter code for the new track directly in click handler
    const nextTrack = CAREER_TRACKS.find((t) => t.id === trackId)!
    if (nextTrack.codingExercises && nextTrack.codingExercises.length > 0) {
      setCodingInput(nextTrack.codingExercises[0].starterCode)
      setCodingStatus('idle')
      setCodingHintVisible(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase flex items-center gap-2">
            💼 Interview & Career Center
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Acquire role-based enterprise IAM mastery, practice mock interviews, audit architectural diagrams, and prepare for high-impact security hires.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-bg-card rounded-lg border border-border-subtle flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-accent-primary" />
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase">6 Prep Tracks</p>
              <p className="text-xs font-bold text-text-primary">Fresher to Principal</p>
            </div>
          </div>
          <div className="p-3 bg-bg-card rounded-lg border border-border-subtle flex items-center gap-2.5">
            <Award className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase">Interactive</p>
              <p className="text-xs font-bold text-text-primary">Scored Simulations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Roles Rail, Right Section Tabs */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* LEFT ROLE TRACK SELECTOR */}
        <div className="space-y-2.5 lg:col-span-1">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block px-2">Select Career Target</span>
          <div className="space-y-1.5">
            {CAREER_TRACKS.map((t) => {
              const active = t.id === activeTrackId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTrackChange(t.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-center gap-3 group relative ${
                    active
                      ? 'bg-accent-glow border-accent-primary/80 text-accent-primary'
                      : 'bg-bg-card border-border-subtle hover:border-text-muted text-text-secondary'
                  }`}
                >
                  <Briefcase className={`w-4 h-4 shrink-0 ${active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                  <div className="space-y-0.5 truncate">
                    <p className="text-xs font-black truncate">{t.title}</p>
                    <p className="text-[10px] text-text-muted truncate">{t.experienceLevel}</p>
                  </div>
                  {active && (
                    <motion.div
                      layoutId="active-track-indicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-primary"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Stats Panel */}
          <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle space-y-2 text-xs">
            <p className="font-bold text-text-primary uppercase text-[10px] tracking-wider">Track Metrics</p>
            <div className="flex justify-between">
              <span className="text-text-muted">Target Exp:</span>
              <span className="font-bold text-text-secondary">{track.experienceLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Salary Range:</span>
              <span className="font-bold text-status-success">{track.salaryRange}</span>
            </div>
          </div>
        </div>

        {/* RIGHT INTERACTIVE INTERVIEW PLATFORM */}
        <div className="lg:col-span-3 space-y-6">
          {/* TRACK SUB-HEADER */}
          <div className="p-5 bg-bg-card border border-border-subtle rounded-xl space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-wider">{track.experienceLevel}</span>
              <span className="text-xs text-text-muted font-bold">Estimated Comp: {track.salaryRange}</span>
            </div>
            <h2 className="text-lg font-black text-text-primary">{track.title} Dashboard</h2>
            <p className="text-xs text-text-secondary">{track.description}</p>
          </div>

          {/* SECTION TABS */}
          <div className="flex overflow-x-auto border-b border-border-subtle gap-1 scrollbar-none">
            {[
              { id: 'mcq', label: 'MCQs Mastery', icon: HelpCircle },
              { id: 'scenario', label: 'Incident Scenarios', icon: ShieldAlert },
              { id: 'design', label: 'Design Simulations', icon: Compass },
              { id: 'coding', label: 'Config Exercises', icon: Code },
              { id: 'mock', label: 'Mock Simulators', icon: Clock },
              { id: 'resume', label: 'Resume & Portfolio', icon: BookOpen },
            ].map((s) => {
              const active = activeSection === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id as 'mcq' | 'scenario' | 'design' | 'coding' | 'mock' | 'resume')}
                  className={`px-4 py-3 font-bold text-xs border-b-2 flex items-center gap-2 shrink-0 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-accent-primary text-accent-primary font-black'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* ACTIVE SECTION VIEWER */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTrackId}-${activeSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* --- 1. MCQS MASTERSECTION --- */}
                {activeSection === 'mcq' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Multiple-Choice Knowledge Verification</h3>
                      <button
                        type="button"
                        onClick={handleMcqReset}
                        className="text-[10px] font-bold text-text-muted hover:text-text-primary flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Section
                      </button>
                    </div>

                    <div className="space-y-4">
                      {track.mcqs.map((q) => {
                        const answer = mcqAnswers[q.id]
                        const submitted = mcqSubmitted[q.id]
                        return (
                          <div key={q.id} className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
                            <p className="text-sm font-bold text-text-primary">{q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, oIdx) => {
                                const selected = answer === oIdx
                                const isCorrect = q.answerIndex === oIdx
                                let optClass = 'bg-bg-sidebar hover:bg-bg-nested border-border-subtle text-text-secondary'

                                if (submitted) {
                                  if (isCorrect) {
                                    optClass = 'bg-status-success/10 border-status-success/30 text-status-success'
                                  } else if (selected) {
                                    optClass = 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                                  }
                                } else if (selected) {
                                  optClass = 'bg-accent-glow border-accent-primary text-accent-primary'
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleMcqSelect(q.id, oIdx)}
                                    disabled={submitted}
                                    className={`w-full p-3 rounded-lg text-left text-xs font-semibold border flex items-center gap-2.5 transition-all ${optClass}`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                      selected ? 'border-accent-primary bg-accent-primary' : 'border-border-subtle'
                                    }`}>
                                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span>{opt}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {!submitted ? (
                              <button
                                type="button"
                                onClick={() => handleMcqSubmit(q.id)}
                                disabled={answer === undefined}
                                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white disabled:opacity-50 disabled:hover:bg-accent-primary rounded-lg text-xs font-black shadow-sm transition-all"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <div className="p-4 rounded-lg bg-bg-sidebar border border-border-subtle/50 space-y-2">
                                <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                  {answer === q.answerIndex ? (
                                    <span className="text-status-success flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Correct Answer</span>
                                  ) : (
                                    <span className="text-status-danger flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Incorrect Answer</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-text-secondary leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* --- 2. INCIDENT SCENARIOS --- */}
                {activeSection === 'scenario' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Real-World Enterprise Incident Walkthroughs</h3>
                    {track.scenarios.map((s) => {
                      const ans = scenarioAnswers[s.id] || ''
                      const revealed = scenarioRevealed[s.id] || false
                      const checkedObj = scenarioCheckpoints[s.id] || {}
                      const checkedCount = Object.values(checkedObj).filter(Boolean).length

                      return (
                        <div key={s.id} className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-text-primary">{s.title}</h4>
                            <p className="text-xs text-text-secondary leading-relaxed bg-bg-sidebar p-3.5 rounded-lg border border-border-subtle/50">{s.incident}</p>
                          </div>

                          {!revealed ? (
                            <div className="space-y-3">
                              <label htmlFor={`scenario-ans-${s.id}`} className="block text-[10px] font-black text-text-muted uppercase">Your Proposed Mitigation Solution</label>
                              <textarea
                                id={`scenario-ans-${s.id}`}
                                value={ans}
                                onChange={(e) => setScenarioAnswers((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                placeholder="Type your structured solution and incident review here…"
                                className="w-full h-32 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary border border-border-subtle focus:outline-none focus:border-accent-primary resize-none font-sans"
                              />
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] text-text-muted italic">Hint: {s.hint}</p>
                                <button
                                  type="button"
                                  onClick={() => setScenarioRevealed((prev) => ({ ...prev, [s.id]: true }))}
                                  className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-xs font-black shadow"
                                >
                                  Submit & Reveal Grading Checkpoints
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 border-t border-border-subtle/30 pt-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <span className="text-[10px] font-black text-text-muted uppercase block">Grading Checklist (Self-Score)</span>
                                  <div className="space-y-1.5">
                                    {s.checkpoints.map((cp, idx) => {
                                      const checked = checkedObj[idx] || false
                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => handleCheckboxToggle(s.id, idx)}
                                          className={`w-full p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                                            checked
                                              ? 'bg-status-success/5 border-status-success/30 text-status-success'
                                              : 'bg-bg-sidebar border-border-subtle hover:border-text-muted text-text-secondary'
                                          }`}
                                        >
                                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                            checked ? 'border-status-success bg-status-success' : 'border-border-subtle'
                                          }`}>
                                            {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                          </div>
                                          <span>{cp}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                  <p className="text-[10px] text-text-muted italic">Score: {checkedCount} / {s.checkpoints.length} metrics checked.</p>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[10px] font-black text-text-muted uppercase block">Expert Model Answer</span>
                                  <div className="p-3.5 rounded-lg bg-bg-sidebar border border-border-subtle/50 text-[11px] text-text-secondary leading-relaxed max-h-60 overflow-y-auto select-text">
                                    {s.modelAnswer}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setScenarioRevealed((prev) => ({ ...prev, [s.id]: false }))
                                  setScenarioCheckpoints((prev) => ({ ...prev, [s.id]: {} }))
                                }}
                                className="px-3.5 py-1.5 bg-bg-sidebar border border-border-subtle hover:text-text-primary text-text-muted rounded text-[11px] font-bold"
                              >
                                Edit Answer
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* --- 3. ARCHITECTURE DESIGN SIMULATION --- */}
                {activeSection === 'design' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">System Design & Keyword Analysis Engine</h3>
                    {track.designSimulations?.map((d) => (
                      <div key={d.id} className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-text-primary">{d.title}</h4>
                          <p className="text-xs text-text-secondary leading-relaxed">{d.prompt}</p>
                        </div>

                        <div className="p-3 bg-accent-glow/5 border border-accent-primary/20 rounded-lg text-xs leading-relaxed text-accent-primary italic">
                          💡 <strong>Analogy:</strong> {d.diagramAnalogy}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-3">
                            <label htmlFor="design-description" className="block text-[10px] font-black text-text-muted uppercase">Describe Your System Architecture</label>
                            <textarea
                              id="design-description"
                              value={designInput}
                              onChange={(e) => setDesignInput(e.target.value)}
                              placeholder="Write your structural components, connections, and secure directories. Use correct technical terminology (e.g. cookies, BFF proxy, PDP, secure same-site)..."
                              className="w-full h-48 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary border border-border-subtle focus:outline-none focus:border-accent-primary resize-none font-sans"
                            />
                            <button
                              type="button"
                              onClick={handleDesignReset}
                              className="text-[10px] font-bold text-text-muted hover:text-text-primary"
                            >
                              Reset Architecture
                            </button>
                          </div>

                          <div className="space-y-3 bg-bg-sidebar border border-border-subtle/50 rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-border-subtle/30 pb-2">
                                <span className="text-[10px] font-black text-text-muted uppercase">Dynamic Audit Index</span>
                                <span className={`text-xs font-black ${designScore === 100 ? 'text-status-success' : 'text-accent-primary'}`}>
                                  {designScore}% Score
                                </span>
                              </div>

                              <div className="space-y-2">
                                {d.criteriaChecklist.map((item, idx) => {
                                  const matches = item.matchedKeywords.some((kw) =>
                                    designInput.toLowerCase().includes(kw.toLowerCase())
                                  )
                                  return (
                                    <div key={idx} className="flex gap-2.5 text-[11px] leading-normal items-start">
                                      {matches ? (
                                        <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border border-border-subtle shrink-0 mt-0.5" />
                                      )}
                                      <div>
                                        <p className={`font-bold ${matches ? 'text-text-primary' : 'text-text-muted'}`}>{item.label}</p>
                                        <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{item.details}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {designScore === 100 && (
                              <div className="p-3 bg-status-success/10 border border-status-success/20 text-status-success text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5">
                                <CheckCircle className="w-4 h-4" /> Enterprise-grade compliance metrics met!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- 4. CONFIG/CODING EXERCISES --- */}
                {activeSection === 'coding' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Identity Code & Rule-Writing Terminals</h3>
                    {track.codingExercises?.map((e) => (
                      <div key={e.id} className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-text-primary">{e.title}</h4>
                          <p className="text-xs text-text-secondary leading-relaxed bg-bg-sidebar p-3.5 rounded-lg border border-border-subtle/50">{e.instruction}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Code Editor */}
                          <div className="space-y-2">
                            <label htmlFor="code-editor" className="text-[10px] font-black text-text-muted uppercase flex items-center gap-1">
                              <Terminal className="w-3.5 h-3.5" /> Live Configuration Terminal
                            </label>
                            <textarea
                              id="code-editor"
                              value={codingInput}
                              onChange={(e) => {
                                setCodingInput(e.target.value)
                                setCodingStatus('idle')
                              }}
                              className="w-full h-48 p-4 rounded-lg bg-[#070a13] text-status-success font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent-primary border border-border-subtle resize-none select-text"
                              spellCheck={false}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setCodingHintVisible((v) => !v)}
                                className="px-3.5 py-1.5 bg-bg-sidebar border border-border-subtle text-[11px] font-bold text-text-muted hover:text-text-primary rounded-lg"
                              >
                                {codingHintVisible ? 'Hide Hint' : 'Show Hint'}
                              </button>
                              <button
                                type="button"
                                onClick={handleRunCode}
                                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-xs font-black shadow flex items-center gap-1.5"
                              >
                                <Play className="w-3 h-3 fill-current" /> Run Parser Validation
                              </button>
                            </div>
                          </div>

                          {/* Evaluation Terminal */}
                          <div className="p-5 bg-bg-sidebar rounded-lg border border-border-subtle flex flex-col justify-between min-h-48">
                            <div className="space-y-3">
                              <span className="text-[10px] font-black text-text-muted uppercase block">Compilation Logs</span>

                              {codingStatus === 'idle' && (
                                <p className="font-mono text-xs text-text-muted italic">Awaiting config compilation logs…</p>
                              )}

                              {codingStatus === 'success' && (
                                <div className="space-y-3">
                                  <div className="p-3 bg-status-success/10 border border-status-success/20 text-status-success rounded-lg font-mono text-xs font-black">
                                    🟢 SUCCESS: CONFIG COMPILED & AUDIT PASS
                                  </div>
                                  <p className="text-xs text-text-secondary leading-relaxed">
                                    Your schema met all required conditions. It matches standard RFC verification patterns!
                                  </p>
                                </div>
                              )}

                              {codingStatus === 'failed' && (
                                <div className="space-y-3">
                                  <div className="p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger rounded-lg font-mono text-xs font-black">
                                    🔴 COMPILATION ERROR: SOLUTION NOT VALIDATED
                                  </div>
                                  <p className="text-xs text-text-secondary leading-relaxed">
                                    The parser did not detect all mandatory parameters. Check your brackets, quotations, or variables.
                                  </p>
                                </div>
                              )}

                              {codingHintVisible && (
                                <p className="p-3 bg-accent-glow/10 border border-accent-primary/20 text-accent-primary text-[11px] rounded-lg leading-relaxed">
                                  💡 <strong>Hint:</strong> {e.hint}
                                </p>
                              )}
                            </div>

                            {codingStatus === 'success' && (
                              <div className="space-y-2 mt-4 pt-3 border-t border-border-subtle/30">
                                <span className="text-[10px] font-black text-text-muted uppercase block">Reference Solution</span>
                                <pre className="p-3 rounded bg-bg-nested text-[10px] text-text-primary font-mono max-h-28 overflow-y-auto whitespace-pre break-all select-all">
                                  {e.sampleSolution}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- 5. TIMED MOCK SIMULATORS --- */}
                {activeSection === 'mock' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Timed Mock Interview Simulator</h3>

                    {!mockActive ? (
                      <div className="p-6 rounded-xl bg-bg-card border border-border-subtle text-center space-y-4 shadow-sm flex flex-col items-center py-10">
                        <Clock className="w-12 h-12 text-accent-primary animate-pulse" />
                        <div className="max-w-md space-y-2">
                          <h4 className="text-sm font-black text-text-primary uppercase tracking-wide">Ready to simulate a live interview?</h4>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            This session is timed. You will have exactly <strong>{activeMockQuestion.suggestedDurationSeconds} seconds</strong> to analyze and type out your structured technical response to the simulated interviewer.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartMock}
                          className="px-5 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5"
                        >
                          <Play className="w-4 h-4 fill-current" /> Begin Interactive Simulation
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
                        {/* Status bar */}
                        <div className="flex justify-between items-center border-b border-border-subtle/35 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-status-danger animate-ping" />
                            <span className="text-xs font-bold text-text-primary">Simulating: {activeMockQuestion.interviewerPersona}</span>
                          </div>
                          <div className={`px-3 py-1 rounded text-xs font-black flex items-center gap-1.5 ${mockTimer < 20 ? 'bg-status-danger/10 text-status-danger' : 'bg-bg-sidebar text-text-primary border border-border-subtle'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {Math.floor(mockTimer / 60)}:{(mockTimer % 60).toString().padStart(2, '0')} remaining
                          </div>
                        </div>

                        {/* Interviewer Box */}
                        <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/50 flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-lg">🤖</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-accent-primary uppercase tracking-wider">{activeMockQuestion.interviewerPersona}</p>
                            <p className="text-xs font-bold text-text-primary leading-relaxed select-text">"{activeMockQuestion.question}"</p>
                          </div>
                        </div>

                        {/* User Answer Area */}
                        {!mockSubmitted[activeMockQuestion.id] ? (
                          <div className="space-y-3">
                            <label htmlFor="mock-response" className="block text-[10px] font-black text-text-muted uppercase">Your Spoken/Typed Transcript Response</label>
                            <textarea
                              id="mock-response"
                              value={mockUserAnswers[activeMockQuestion.id] || ''}
                              onChange={(e) => setMockUserAnswers((prev) => ({ ...prev, [activeMockQuestion.id]: e.target.value }))}
                              placeholder="Type your strategic verbal answer here as you would speak it to the director…"
                              className="w-full h-32 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary border border-border-subtle focus:outline-none focus:border-accent-primary resize-none font-sans"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] text-text-muted italic">Hint: {activeMockQuestion.hint}</p>
                              <button
                                type="button"
                                onClick={handleMockSubmit}
                                className="px-4 py-2 bg-status-danger hover:bg-status-danger/90 text-white rounded-lg text-xs font-black shadow"
                              >
                                Submit & Finish Question
                              </button>
                            </div>
                          </div>
                        ) : (
                          // GRADING AND EVALUATION FEEDBACK
                          <div className="space-y-4 border-t border-border-subtle/30 pt-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/20 space-y-2">
                                <span className="text-[10px] font-black text-status-success uppercase flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Recommended Milestones to hit</span>
                                <ul className="space-y-1.5 text-xs text-text-secondary list-disc pl-4">
                                  {activeMockQuestion.modelPoints.map((pt, idx) => (
                                    <li key={idx}>{pt}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/50 space-y-2">
                                <span className="text-[10px] font-black text-text-muted uppercase block">Answer Review</span>
                                <div className="text-[11px] text-text-secondary leading-relaxed max-h-40 overflow-y-auto select-text italic p-2 rounded bg-bg-nested">
                                  "{mockUserAnswers[activeMockQuestion.id] || '[No Answer Provided - Timer Timeout]'}"
                                </div>
                                <p className="text-[10px] text-text-muted mt-2">Compare your inputs against the suggested milestones to grade your delivery.</p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <button
                                type="button"
                                onClick={handleResetMock}
                                className="px-3.5 py-1.5 bg-bg-sidebar border border-border-subtle text-[11px] font-bold text-text-muted hover:text-text-primary rounded-lg"
                              >
                                Stop Simulator
                              </button>

                              {mockQuestionIndex < track.mockInterviews.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={handleNextMock}
                                  className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-xs font-black shadow"
                                >
                                  Proceed to Next Question
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleResetMock}
                                  className="px-4 py-2 bg-status-success hover:bg-status-success/90 text-white rounded-lg text-xs font-black shadow"
                                >
                                  Finish Simulation Session
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 6. RESUME AND PORTFOLIO REVIEW --- */}
                {activeSection === 'resume' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left: Bullet Points */}
                      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
                        <span className="text-[10px] font-black text-text-muted uppercase block">Copy-Pasteable High-Impact Bullet Points</span>
                        <div className="space-y-3">
                          {track.resumeGuidance.copyableBullets.map((bullet, idx) => (
                            <div key={idx} className="p-3.5 rounded-lg bg-bg-sidebar border border-border-subtle/50 space-y-2 relative group hover:border-accent-primary/40 transition-all">
                              <p className="text-xs text-text-secondary leading-normal select-text pr-8">"{bullet}"</p>
                              <button
                                type="button"
                                onClick={() => copy(bullet, `b-${idx}`)}
                                className="absolute right-2.5 top-2.5 p-1.5 rounded bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Copy bullet point"
                              >
                                {copiedId === `b-${idx}` ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Portfolio and Guidelines */}
                      <div className="space-y-6">
                        {/* Guidelines */}
                        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
                          <span className="text-[10px] font-black text-text-muted uppercase block">Strategic Resume Guidelines</span>
                          <ul className="space-y-2 text-xs text-text-secondary list-disc pl-4 leading-normal">
                            {track.resumeGuidance.guidelines.map((gl, idx) => (
                              <li key={idx}>{gl}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Portfolio Review */}
                        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
                          <span className="text-[10px] font-black text-text-muted uppercase block">Identity Portfolio Checklist</span>
                          <div className="space-y-2">
                            {track.resumeGuidance.portfolioChecklist.map((item, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start text-xs text-text-secondary leading-normal">
                                <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
