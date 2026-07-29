import { useState, useMemo } from 'react'
import { ClipboardList, AlertTriangle, TrendingUp, Wallet } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { MODERNIZATION_BACKLOG_ITEMS, MAX_POSSIBLE_RISK_REDUCTION } from '../../data/modernizationBacklogItems'
import { scoreRoadmap, BUDGET_PER_QUARTER, type RoadmapAssignment } from '../../lib/games/modernizationScoring'

const QUARTER_LABELS = ['Unscheduled', 'Q1', 'Q2', 'Q3', 'Q4']

export default function ModernizationBacklogGame() {
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'modernization_backlog_game',
    initialScore: 100,
    maxHints: 3
  })

  const [assignment, setAssignment] = useState<RoadmapAssignment>({})

  const byId = useMemo(() => new Map(MODERNIZATION_BACKLOG_ITEMS.map((i) => [i.id, i])), [])

  const result = useMemo(() => scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, assignment), [assignment])

  const quarterCosts = useMemo(() => {
    const costs = [0, 0, 0, 0, 0]
    for (const item of MODERNIZATION_BACKLOG_ITEMS) {
      const quarter = assignment[item.id]
      if (quarter) costs[quarter] += item.cost
    }
    return costs
  }, [assignment])

  const scheduledCount = Object.values(assignment).filter((q) => q != null).length

  const handleAssign = (itemId: string, quarter: number | null) => {
    const item = byId.get(itemId)!
    const next = { ...assignment, [itemId]: quarter }
    setAssignment(next)

    if (quarter !== null) {
      log('info', `Scheduled "${item.title}" for Q${quarter}.`)
    } else {
      log('info', `Removed "${item.title}" from the roadmap.`)
    }

    const nextScheduledCount = Object.values(next).filter((q) => q != null).length
    if (currentStep === 0 && nextScheduledCount >= 10) {
      completeStep(0, 'Checkpoint 1 verified: Scheduled at least 10 backlog items onto the roadmap.')
    }

    const nextResult = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, next)
    if (nextResult.dependencyViolations > 0) {
      log('warning', `🚨 Dependency violation detected: an item was scheduled before something it depends on. Review the "Requires" column.`)
    }
    if (nextResult.budgetViolations > 0) {
      log('warning', `💸 A quarter exceeds the $${BUDGET_PER_QUARTER} budget cap — move an item to a lighter quarter.`)
    }

    if (currentStep === 1 && nextScheduledCount >= 10 && nextResult.dependencyViolations === 0) {
      completeStep(1, 'Checkpoint 2 verified: Every scheduled item respects its dependency ordering so far.')
    }

    const allScheduled = MODERNIZATION_BACKLOG_ITEMS.every((i) => next[i.id] != null)
    if (currentStep <= 2 && allScheduled && nextResult.dependencyViolations === 0 && nextResult.budgetViolations === 0) {
      finishPlayground(
        `🎉 Roadmap complete! You reduced ${nextResult.totalRiskReduced}/${MAX_POSSIBLE_RISK_REDUCTION} points of tech-debt risk for $${nextResult.totalCostSpent}, with zero dependency violations and zero over-budget quarters — a fully valid 12-month modernization roadmap.`
      )
    }
  }

  const handleRevealHint = () => {
    const hints = [
      `Items with a "Requires" tag must be scheduled in a strictly later quarter than their dependency — sequencing them together or before triggers a dependency violation.`,
      `Each quarter has a $${BUDGET_PER_QUARTER} budget cap. Spread expensive items (like "SAML-only SSO with no modern OIDC path", cost 10) across different quarters rather than stacking them all in Q1.`,
      `Try to schedule all 20 items — an unscheduled item leaves its tech-debt risk completely unreduced. The goal is a full, valid 12-month sequencing, not just cherry-picking the easy wins.`
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="IAM Modernization Backlog Game"
      description="Sequence 20 realistic legacy-IAM tech-debt items into a 12-month roadmap under a fixed quarterly budget — respect dependency ordering, stay within budget, and maximize risk reduction per dollar."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setAssignment({})
        resetPlayground()
        log('info', 'Roadmap cleared. All backlog items unscheduled.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className={`p-3 rounded-xl border text-xs ${quarterCosts[q] > BUDGET_PER_QUARTER ? 'bg-status-danger/10 border-status-danger/40' : 'bg-bg-nested border-border-subtle'}`}>
              <div className="font-bold text-text-primary">Q{q} Budget</div>
              <div className={`font-mono font-extrabold ${quarterCosts[q] > BUDGET_PER_QUARTER ? 'text-status-danger' : 'text-text-secondary'}`}>
                ${quarterCosts[q]} / ${BUDGET_PER_QUARTER}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-xs">
            <thead className="bg-bg-nested">
              <tr>
                <th className="p-2.5 text-left font-bold text-text-secondary">Tech-Debt Item</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Risk</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Cost</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Requires</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Quarter</th>
              </tr>
            </thead>
            <tbody>
              {MODERNIZATION_BACKLOG_ITEMS.map((item) => {
                const myQuarter = assignment[item.id]
                const violatesDep = myQuarter != null && (item.dependsOn ?? []).some((depId) => {
                  const depQuarter = assignment[depId]
                  return depQuarter == null || depQuarter >= myQuarter
                })
                return (
                  <tr key={item.id} className={`border-t border-border-subtle/50 ${violatesDep ? 'bg-status-danger/5' : ''}`}>
                    <td className="p-2.5 font-semibold text-text-primary">{item.title}</td>
                    <td className="p-2.5">{item.riskScore}</td>
                    <td className="p-2.5">${item.cost}</td>
                    <td className="p-2.5">
                      {item.dependsOn?.length ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${violatesDep ? 'bg-status-danger/15 text-status-danger' : 'bg-bg-nested text-text-muted'}`}>
                          {byId.get(item.dependsOn[0])?.title.split(' ').slice(0, 3).join(' ')}...
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <select
                        value={assignment[item.id] ?? 0}
                        onChange={(e) => handleAssign(item.id, Number(e.target.value) === 0 ? null : Number(e.target.value))}
                        className="text-xs p-1.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
                      >
                        {QUARTER_LABELS.map((label, idx) => (
                          <option key={label} value={idx}>{label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-accent-primary" />
            Live Roadmap Scorecard
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
              <div className="text-text-muted flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Risk Reduced</div>
              <div className="font-extrabold text-text-primary">{result.totalRiskReduced} / {MAX_POSSIBLE_RISK_REDUCTION}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
              <div className="text-text-muted flex items-center gap-1"><Wallet className="w-3 h-3" /> Total Spend</div>
              <div className="font-extrabold text-text-primary">${result.totalCostSpent}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
              <div className="text-text-muted">Risk / Dollar</div>
              <div className="font-extrabold text-text-primary">{result.riskReductionPerDollar.toFixed(2)}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
              <div className="text-text-muted flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Violations</div>
              <div className={`font-extrabold ${result.dependencyViolations + result.budgetViolations > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                {result.dependencyViolations + result.budgetViolations}
              </div>
            </div>
          </div>
          <div className="text-xs text-text-secondary">
            <span className="font-bold text-text-primary">Scheduled:</span> {scheduledCount} / {MODERNIZATION_BACKLOG_ITEMS.length} items
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Why This Simulator Matters</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            The `/assess` GRC Maturity Wizard scores where your organization currently stands. This game is the next step: turning a list of known gaps into an actual sequenced roadmap under real budget and dependency constraints — the exact planning exercise a security architect does after every maturity assessment.
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
