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

export default function CommandCenter() {
  const depthMode = usePreferenceStore((s) => s.depthMode)
  const setDepthMode = usePreferenceStore((s) => s.setDepthMode)
  const isCompact = depthMode === 'expert'

  const [lastAssessment] = useState(() => getLastAssessment())
  const summary = lastAssessment ? buildBoardSummary(lastAssessment) : null

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
    window.print()
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

      <div className={`grid gap-6 ${isCompact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {QUESTION_CARDS.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm hover:border-accent-primary/40 transition-colors space-y-3 group"
          >
            <card.icon className="w-6 h-6 text-accent-primary" />
            <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
              {card.question}
            </h3>
            {!isCompact && <p className="text-sm text-text-secondary leading-relaxed">{card.answerHint}</p>}
          </Link>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
        <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
          <ShieldQuestion className="w-4 h-4 text-accent-primary" /> Generate Board Summary
        </h4>
        {summary ? (
          <>
            <p className="text-sm text-text-secondary leading-relaxed">
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
          </>
        ) : (
          <p className="text-sm text-text-secondary leading-relaxed">
            No assessment on file yet.{' '}
            <Link to="/assess" className="text-accent-primary hover:text-accent-hover font-semibold">
              Complete the IAM Maturity Assessment
            </Link>{' '}
            first — this summary reuses its score and pillar breakdown rather than collecting new data of its own.
          </p>
        )}
      </div>
    </div>
  )
}
