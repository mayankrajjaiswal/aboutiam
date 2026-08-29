import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  CalendarDays,
  Wallet,
  UserCheck,
  Compass,
  Download,
  LayoutGrid,
  AlignLeft,
  ShieldQuestion,
  Users,
  UserPlus,
  ArrowRight,
  Printer
} from 'lucide-react'
import JourneyBreadcrumb from '../components/JourneyBreadcrumb'
import { usePreferenceStore } from '../store/preferenceStore'
import { getLastAssessment } from '../lib/assess/assessHistory'
import { buildBoardSummary, buildBoardSummaryMarkdown } from '../lib/assess/boardSummary'

interface QuestionCard {
  question: string
  answerHint: string
  path: string
  icon: typeof Award
}

interface TeamMember {
  name: string
  score: number
  status: string
}

const QUESTION_CARDS: QuestionCard[] = [
  {
    question: "What's at risk?",
    answerHint: 'Run the IAM Maturity Assessment across 5 core pillars.',
    path: '/assess',
    icon: Award,
  },
  {
    question: "What's the deadline?",
    answerHint: 'Track upcoming compliance and standards deadlines.',
    path: '/standards?view=deadlines',
    icon: CalendarDays,
  },
  {
    question: 'What will it cost?',
    answerHint: 'Compare 3-year build-vs-buy total cost of ownership.',
    path: '/tools/iam-tco-calculator',
    icon: Wallet,
  },
  {
    question: 'Who owns it?',
    answerHint: 'Assign Responsible/Accountable/Consulted/Informed roles.',
    path: '/tools/raci-builder',
    icon: UserCheck,
  },
]

const DEFAULT_TEAM: TeamMember[] = [
  { name: 'Mayank (Architect)', score: 95, status: 'Completed' },
  { name: 'Rajat (Lead Dev)', score: 92, status: 'Completed' },
  { name: 'Lukas (SecOps)', score: 88, status: 'In Progress' }
]

export default function CommandCenter() {
  const depthMode = usePreferenceStore((s) => s.depthMode)
  const setDepthMode = usePreferenceStore((s) => s.setDepthMode)
  const isCompact = depthMode === 'expert'

  const [lastAssessment] = useState(() => getLastAssessment())
  const summary = lastAssessment ? buildBoardSummary(lastAssessment) : null

  // Team Dashboard States
  const [teamList, setTeamList] = useState<TeamMember[]>(DEFAULT_TEAM)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberScore, setNewMemberScore] = useState(80)

  const handleAddMember = () => {
    if (!newMemberName.trim()) return
    setTeamList([
      ...teamList,
      { name: newMemberName, score: newMemberScore, status: newMemberScore === 100 ? 'Completed' : 'In Progress' }
    ])
    setNewMemberName('')
    setNewMemberScore(80)
  }

  const teamAverage = teamList.length > 0
    ? Math.round(teamList.reduce((acc, m) => acc + m.score, 0) / teamList.length)
    : 0

  const downloadBoardSummary = () => {
    if (!summary) return
    const markdown = buildBoardSummaryMarkdown(summary)
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_board_summary.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Compass className="w-3.5 h-3.5" /> Executive Command Center
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Four Questions Every Board Asks
        </h1>
        <p className="text-text-secondary">
          A curated front door into the site's existing GRC and program-management tools, organized around the
          questions an executive actually asks — not a new assessment of its own.
        </p>
      </div>

      <JourneyBreadcrumb currentPath="/command-center" />

      <div className="flex items-center justify-end gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Density</span>
        <button
          type="button"
          onClick={() => setDepthMode('beginner')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            !isCompact
              ? 'bg-accent-glow border-accent-primary text-accent-primary'
              : 'border-border-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" /> Narrative
        </button>
        <button
          type="button"
          onClick={() => setDepthMode('expert')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            isCompact
              ? 'bg-accent-glow border-accent-primary text-accent-primary'
              : 'border-border-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Compact
        </button>
      </div>

      {/* Interactive Executive Journey Map Connector */}
      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-accent-primary" /> Active Executive Journey Roadmap
        </h4>
        <p className="text-xs text-text-secondary">
          Track your corporate IAM governance alignment. Complete each step sequentially to activate the sovereign GRC posture framework.
        </p>
        <div className="relative pt-4 pb-2">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border-subtle/50 -translate-y-1/2 rounded-full pointer-events-none"></div>
          {/* Active Glowing Progress Connector */}
          <div 
            style={{ width: lastAssessment ? '100%' : '25%' }}
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary -translate-y-1/2 rounded-full pointer-events-none transition-all duration-1000 shadow-lg shadow-accent-primary/20"
          ></div>

          {/* Stepper Timeline Points */}
          <div className="relative flex justify-between items-center z-10 select-none">
            {[
              { label: '1. Maturity Audit', path: '/assess', isDone: true, desc: 'Audit core posture' },
              { label: '2. Deadlines', path: '/standards?view=deadlines', isDone: !!lastAssessment, desc: 'Track regulation dates' },
              { label: '3. TCO Calculation', path: '/tools/iam-tco-calculator', isDone: !!lastAssessment, desc: 'Assess build vs buy' },
              { label: '4. RACI Matrix', path: '/tools/raci-builder', isDone: !!lastAssessment, desc: 'Assign program roles' },
            ].map((step, idx) => (
              <Link 
                key={step.path}
                to={step.path} 
                className="flex flex-col items-center text-center space-y-2 group focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                  step.isDone 
                    ? 'bg-accent-glow border-accent-primary text-accent-primary shadow shadow-accent-primary/10 scale-110 group-hover:scale-115' 
                    : 'bg-bg-sidebar border-border-subtle text-text-muted group-hover:text-text-primary'
                }`}>
                  {step.isDone ? '✓' : idx + 1}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider block transition-colors ${step.isDone ? 'text-text-primary' : 'text-text-muted'}`}>
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[9px] text-text-muted font-medium max-w-[120px] mx-auto leading-tight">
                    {step.desc}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${isCompact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {QUESTION_CARDS.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm hover-cyber-glow space-y-3 group"
          >
            <card.icon className="w-6 h-6 text-accent-primary" />
            <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
              {card.question}
            </h3>
            {!isCompact && <p className="text-sm text-text-secondary leading-relaxed">{card.answerHint}</p>}
          </Link>
        ))}
      </div>

      {/* Featured Resource callout (Phase 10 SEO Dominance) */}
      <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div className="space-y-1">
          <span className="text-[10px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold font-mono">
            FEATURED TEAM RESOURCE
          </span>
          <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
            <Printer className="w-4 h-4 text-accent-primary animate-pulse" /> Print &amp; Hang the Identity Security Controls Reference Guide
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Summarizes core OAuth 2.1 authorization flows, SAML envelope signatures, and JWT validation rules on a single high-contrast A4 sheet.
          </p>
        </div>
        <Link
          to="/tools/print-poster"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shrink-0"
        >
          Open Printable Poster Tool <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Board Summary */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
          <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
            <ShieldQuestion className="w-4 h-4 text-accent-primary" /> Generate Board Summary
          </h4>
          {summary ? (
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Reuses your most recent{' '}
                <Link to="/assess" className="text-accent-primary hover:text-accent-hover font-semibold">
                  Assessment
                </Link>{' '}
                ({summary.tier.label}, {summary.percentage}%) score and pillar breakdown, reformatted into a one-page
                narrative using dollar-exposure framing — including a fixed non-human-identity governance addendum,
                since it's a named 2026 gap worth surfacing regardless of your other pillar scores.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={downloadBoardSummary}
                  className="px-5 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Board Summary (PDF/Markdown)
                </button>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed pt-2 border-t border-border-subtle/30">
                Directional summary for internal discussion only — not a licensed actuarial or risk-quantification model.
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-secondary leading-relaxed">
              No assessment on file yet.{' '}
              <Link to="/assess" className="text-accent-primary hover:text-accent-hover font-semibold">
                Complete the IAM Maturity Assessment
              </Link>{' '}
              first — this summary reuses its score and pillar breakdown rather than collecting new data of its own.
            </p>
          )}
        </div>

        {/* Right: Local Corporate Team Training Board (Phase 10 LMS Upgrade) */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
          <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Users className="w-4 h-4 text-accent-primary" /> Team Training & Maturity Dashboard
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Manage your team's on-device identity security maturity. Aggregate employee scores locally with 100% data privacy.
          </p>

          <div className="space-y-4">
            {/* Team stats banner */}
            <div className="grid grid-cols-2 gap-3 font-sans text-xs">
              <div className="p-3 bg-bg-sidebar border border-border-subtle rounded-xl text-center">
                <span className="text-[10px] text-text-muted uppercase block font-bold">Team Count</span>
                <span className="text-xl font-black text-text-primary mt-1 block">{teamList.length} Staff</span>
              </div>
              <div className="p-3 bg-bg-sidebar border border-border-subtle rounded-xl text-center">
                <span className="text-[10px] text-text-muted uppercase block font-bold">Team Average</span>
                <span className="text-xl font-black text-accent-primary mt-1 block">{teamAverage}% Score</span>
              </div>
            </div>

            {/* Quick add staff */}
            <div className="flex gap-2 select-none">
              <input 
                type="text" 
                placeholder="Staff Name"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="flex-1 p-2 border border-border-subtle rounded-lg bg-bg-sidebar text-xs text-text-primary outline-none focus:border-accent-primary"
              />
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={newMemberScore}
                onChange={e => setNewMemberScore(Number(e.target.value))}
                className="w-16 p-2 border border-border-subtle rounded-lg bg-bg-sidebar text-xs text-text-primary outline-none focus:border-accent-primary font-bold text-center"
              />
              <button
                onClick={handleAddMember}
                className="p-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition"
                title="Add Team Member"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Team List Table */}
            <div className="max-h-[160px] overflow-y-auto border border-border-subtle rounded-xl divide-y divide-border-subtle font-sans text-xs">
              {teamList.map((m, idx) => (
                <div key={idx} className="p-2.5 flex justify-between items-center bg-bg-sidebar/20">
                  <span className="font-bold text-text-primary">{m.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-text-secondary">{m.score}%</span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      m.score >= 90 ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                    }`}>
                      {m.score >= 90 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
