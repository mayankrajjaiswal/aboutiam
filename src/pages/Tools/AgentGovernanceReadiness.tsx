import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  READINESS_QUESTIONS,
  computeReadinessReport,
  buildReadinessReportText,
  type ReadinessAnswer,
} from '../../lib/tools/agentGovernanceReadiness'

const tool = getToolBySlug('agent-governance-readiness')!

const ANSWER_LABELS: Record<ReadinessAnswer, string> = {
  0: 'Not started',
  1: 'Ad hoc',
  2: 'Defined',
  3: 'Fully mature',
}

const BAND_COLOR: Record<string, string> = {
  Unmanaged: 'text-status-danger',
  Inventoried: 'text-status-warning',
  Governed: 'text-status-info',
  Adaptive: 'text-status-success',
}

function buildFileTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

export default function AgentGovernanceReadiness() {
  const [answers, setAnswers] = useState<Record<string, ReadinessAnswer>>({})
  const [showResults, setShowResults] = useState(false)

  const report = useMemo(() => computeReadinessReport(answers), [answers])
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === READINESS_QUESTIONS.length

  const handleAnswer = (questionId: string, value: ReadinessAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
  }

  const handleDownload = () => {
    const text = buildReadinessReportText(report)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agent-governance-readiness-${buildFileTimestamp()}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-3 rounded-xl bg-bg-nested border border-border-subtle flex items-center justify-between text-xs">
          <span className="font-bold text-text-secondary">{answeredCount} / {READINESS_QUESTIONS.length} answered</span>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {!showResults ? (
          <>
            <div className="space-y-2">
              {READINESS_QUESTIONS.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-text-primary flex-1">{q.question}</span>
                    <span className="text-[9px] font-black text-accent-primary uppercase bg-accent-glow px-1.5 py-0.5 rounded shrink-0">{q.dimension}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {([0, 1, 2, 3] as ReadinessAnswer[]).map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(q.id, value)}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                          answers[q.id] === value ? 'bg-accent-primary text-white border-accent-primary' : 'border-border-subtle bg-bg-nested text-text-secondary'
                        }`}
                      >
                        {ANSWER_LABELS[value]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowResults(true)}
              disabled={!allAnswered}
              className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {allAnswered ? 'View Results' : `Answer all ${READINESS_QUESTIONS.length} questions to see results`}
            </button>
          </>
        ) : (
          <>
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle text-center space-y-2">
              <div className="text-4xl font-black text-text-primary">{report.overallScorePercent}%</div>
              <div className={`text-sm font-black uppercase tracking-wider ${BAND_COLOR[report.band.label]}`}>{report.band.label}</div>
              <Link to={report.band.recommendedPage} className="text-xs font-bold text-accent-primary hover:underline inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Recommended next step
              </Link>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Per-Dimension Scores</h3>
              {report.dimensionScores.map((d) => (
                <div key={d.dimension} className="p-3 rounded-xl bg-bg-card border border-border-subtle">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-text-primary">{d.dimension}</span>
                    <span className="text-text-secondary">{d.scorePercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-bg-nested overflow-hidden">
                    <div className="h-full bg-accent-primary" style={{ width: `${d.scorePercent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {report.gaps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Prioritized Gaps</h3>
                {report.gaps.slice(0, 10).map((gap) => (
                  <div key={gap.questionId} className="p-3 rounded-xl bg-status-warning/5 border border-status-warning/20 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0" />
                      <span className="font-bold text-text-primary">{gap.question}</span>
                    </div>
                    <div className="text-[11px] text-text-secondary pl-5">Current: {ANSWER_LABELS[gap.answer]} — Mature target: {gap.matureAnswerHint}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-bg-nested border border-border-subtle text-xs font-black text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Full Report
            </button>
          </>
        )}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
