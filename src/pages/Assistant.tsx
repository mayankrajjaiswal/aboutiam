import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles, Check,
  MessageSquare, GitCompare, GraduationCap, HelpCircle, Lightbulb, Eye
} from 'lucide-react'
import KnowledgeChatPanel, { ResourceCard } from '../components/KnowledgeChatPanel'

// Import Knowledge Graph Data
import {
  COMPARISONS,
  LEARNING_TRACKS,
  INTERVIEW_QUESTIONS
} from '../data/aiKnowledgeGraph'

type TabType = 'chat' | 'compare' | 'learn' | 'interview'

const LEARN_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const LEARN_GOALS = ['Security Engineer', 'IAM Architect']

const INTERVIEW_DOMAINS = Array.from(new Set(INTERVIEW_QUESTIONS.map(q => q.domain)))

function buildAssistantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.aboutiam.com/assistant/',
        'name': 'AboutIAM AI Knowledge Assistant',
        'description': 'Context-aware IAM knowledge chat, protocol/product comparison engine, career learning planner, and interview prep.',
        'hasPart': COMPARISONS.map((c) => ({
          '@type': 'TechArticle',
          '@id': `https://www.aboutiam.com/assistant/#${c.id}`,
          'headline': c.title,
          'description': c.summary,
          'url': `https://www.aboutiam.com/assistant?tab=compare&compare=${c.id}`
        }))
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.aboutiam.com/assistant/#interview-prep',
        'mainEntity': INTERVIEW_QUESTIONS.map((q) => ({
          '@type': 'Question',
          'name': q.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': q.answer }
        }))
      }
    ]
  }
}

export default function Assistant() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  // --- COMPARE STATE ---
  const [activeComparisonId, setActiveComparisonId] = useState<string>('oauth_vs_oidc')

  // --- LEARN STATE ---
  const [learnLevel, setLearnLevel] = useState<string>('Beginner')
  const [learnGoal, setLearnGoal] = useState<string>('Security Engineer')

  // --- INTERVIEW PREP STATE ---
  const [interviewDomain, setInterviewDomain] = useState<string>('All')
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set())

  // Deep-link support: ?tab=compare&compare=<id> | ?tab=learn&level=<lvl>&goal=<goal> | ?tab=interview&q=<id>
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      setTimeout(() => {
        if (tab === 'compare') {
          const compareId = params.get('compare')
          if (compareId && COMPARISONS.some(c => c.id === compareId)) {
            setActiveComparisonId(compareId)
          }
          setActiveTab('compare')
        } else if (tab === 'learn') {
          const level = params.get('level')
          const goal = params.get('goal')
          if (level && LEARN_LEVELS.includes(level)) setLearnLevel(level)
          if (goal && LEARN_GOALS.includes(goal)) setLearnGoal(goal)
          setActiveTab('learn')
        } else if (tab === 'interview') {
          const qId = params.get('q')
          const match = INTERVIEW_QUESTIONS.find(q => q.id === qId)
          if (match) {
            setInterviewDomain(match.domain)
            setRevealedAnswers(new Set([match.id]))
          }
          setActiveTab('interview')
        }
      }, 0)
    }
  }, [])

  // --- HANDLERS ---
  const toggleAnswer = (id: string) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // --- RENDER HELPERS ---
  const activeComparison = useMemo(() => {
    return COMPARISONS.find(c => c.id === activeComparisonId) || COMPARISONS[0]
  }, [activeComparisonId])

  const activeTrack = useMemo(() => {
    return LEARNING_TRACKS.find(t => t.level === learnLevel && t.goal === learnGoal) || LEARNING_TRACKS[0]
  }, [learnLevel, learnGoal])

  const filteredInterviewQuestions = useMemo(() => {
    return interviewDomain === 'All'
      ? INTERVIEW_QUESTIONS
      : INTERVIEW_QUESTIONS.filter(q => q.domain === interviewDomain)
  }, [interviewDomain])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAssistantJsonLd()).replace(/</g, '\\u003c') }}
      />
      {/* Header & Tabs */}
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
              <Sparkles className="w-3.5 h-3.5" /> AI Knowledge Assistant 2.0
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Identity Engineering Platform
            </h1>
            <p className="text-sm text-text-secondary">
              Your intelligent navigator for learning, designing, and validating IAM architectures.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-border-subtle scrollbar-hide">
          {[
            { id: 'chat', label: 'Knowledge Chat', icon: MessageSquare },
            { id: 'compare', label: 'Comparison Engine', icon: GitCompare },
            { id: 'learn', label: 'Learning Planner', icon: GraduationCap },
            { id: 'interview', label: 'Interview Prep', icon: HelpCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-accent-primary text-accent-primary bg-accent-glow/50' 
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-sidebar'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow min-h-0 relative">
        
        {/* TAB 1: KNOWLEDGE CHAT */}
        {activeTab === 'chat' && <KnowledgeChatPanel showSidebar className="h-full" />}

        {/* TAB 2: COMPARISON ENGINE */}
        {activeTab === 'compare' && (
          <div className="h-full overflow-y-auto space-y-6">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col md:flex-row items-center gap-4">
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Select Identity Protocol Pairing to Compare</label>
                <select 
                  className="w-full p-3 rounded-xl bg-bg-sidebar border border-border-subtle text-sm font-bold text-text-primary outline-none focus:border-accent-primary"
                  value={activeComparisonId}
                  onChange={(e) => setActiveComparisonId(e.target.value)}
                >
                  {COMPARISONS.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeComparison ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                  <h3 className="text-lg font-bold text-text-primary mb-3">Architectural Summary</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{activeComparison.summary}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle pb-2">
                      {activeComparison.entityA}
                    </h3>
                    <ul className="space-y-3">
                      {activeComparison.useCasesA.map((uc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle pb-2">
                      {activeComparison.entityB}
                    </h3>
                    <ul className="space-y-3">
                      {activeComparison.useCasesB.map((uc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border-subtle shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sidebar border-b border-border-subtle">
                        <th className="p-4 text-xs font-bold text-text-muted uppercase">Feature</th>
                        <th className="p-4 text-xs font-bold text-text-primary">{activeComparison.entityA}</th>
                        <th className="p-4 text-xs font-bold text-text-primary">{activeComparison.entityB}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-bg-card">
                      {activeComparison.table.map((row, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-bg-sidebar/50 transition-colors">
                          <td className="p-4 text-sm font-semibold text-text-secondary">{row.feature}</td>
                          <td className="p-4 text-sm text-text-primary">{row.a}</td>
                          <td className="p-4 text-sm text-text-primary">{row.b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-text-muted bg-bg-card rounded-2xl border border-border-subtle border-dashed">
                Select a valid comparison pairing above to view the analysis.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEARNING PLANNER */}
        {activeTab === 'learn' && (
          <div className="h-full overflow-y-auto space-y-6">
             <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm items-center">
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Current Skill Level</label>
                <select
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-sm font-bold text-text-primary outline-none"
                  value={learnLevel}
                  onChange={(e) => setLearnLevel(e.target.value)}
                >
                  {LEARN_LEVELS.map(level => <option key={level}>{level}</option>)}
                </select>
              </div>
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Target Career Goal</label>
                <select
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-sm font-bold text-text-primary outline-none"
                  value={learnGoal}
                  onChange={(e) => setLearnGoal(e.target.value)}
                >
                  {LEARN_GOALS.map(goal => <option key={goal}>{goal}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
               <h2 className="text-xl font-bold text-text-primary">{activeTrack.title}</h2>
               <p className="text-sm text-text-secondary mt-1 mb-8">{activeTrack.description}</p>
               
               <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-subtle">
                 {activeTrack.steps.map((step, i) => (
                   <div key={i} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-bg-card bg-accent-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                       <span className="text-sm font-bold">{i + 1}</span>
                     </div>
                     <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-bg-sidebar border border-border-subtle shadow-sm group-hover:border-accent-primary/50 transition-colors ml-4 md:ml-0">
                       <h3 className="text-sm font-bold text-text-primary mb-1">{step.title}</h3>
                       <p className="text-xs text-text-secondary mb-4">{step.desc}</p>
                       <div className="space-y-2">
                         {step.resources.map((res, j) => <ResourceCard key={j} resource={res} />)}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERVIEW PREP */}
        {activeTab === 'interview' && (
          <div className="h-full overflow-y-auto space-y-6">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-text-muted uppercase mr-2">Filter by Domain</span>
              <button
                onClick={() => setInterviewDomain('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  interviewDomain === 'All'
                    ? 'bg-accent-primary border-accent-primary text-white'
                    : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-sidebar'
                }`}
              >
                All
              </button>
              {INTERVIEW_DOMAINS.map(domain => (
                <button
                  key={domain}
                  onClick={() => setInterviewDomain(domain)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    interviewDomain === domain
                      ? 'bg-accent-primary border-accent-primary text-white'
                      : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-sidebar'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredInterviewQuestions.map(q => {
                const isRevealed = revealedAnswers.has(q.id)
                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-accent-primary bg-accent-glow px-2 py-0.5 rounded-full">
                          {q.domain}
                        </span>
                        <p className="text-sm font-semibold text-text-primary flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" /> {q.question}
                        </p>
                      </div>
                    </div>

                    {!isRevealed && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary bg-bg-sidebar/50 border border-border-subtle rounded-xl p-3">
                        <Lightbulb className="w-3.5 h-3.5 text-status-warning shrink-0 mt-0.5" />
                        {q.hint}
                      </div>
                    )}

                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:text-accent-hover"
                    >
                      <Eye className="w-3.5 h-3.5" /> {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                    </button>

                    {isRevealed && (
                      <div className="mt-3 space-y-2 text-sm text-text-primary bg-bg-sidebar/50 border border-border-subtle rounded-xl p-4 leading-relaxed">
                        <p>{q.answer}</p>
                        {q.rfc && (
                          <p className="text-[11px] uppercase font-bold text-text-muted tracking-wider">Reference: {q.rfc}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredInterviewQuestions.length === 0 && (
                <div className="p-12 text-center text-text-muted bg-bg-card rounded-2xl border border-border-subtle border-dashed">
                  No interview questions found for this domain.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
