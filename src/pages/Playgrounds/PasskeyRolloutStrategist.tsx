import { useState } from 'react'
import { TrendingUp, ShieldAlert, LifeBuoy, Award, Play } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import {
  simulateYear,
  computeOutcomeScore,
  TOTAL_BUDGET_POINTS,
  INDUSTRY_BENCHMARKS,
  ALLOCATION_CATEGORIES,
  type RolloutAllocation,
  type QuarterOutcome
} from '../../data/passkeyRolloutModel'

const INITIAL_ALLOCATION: RolloutAllocation = {
  platformSdk: 25,
  helpDeskTraining: 25,
  legacyFallbackSunset: 25,
  recoveryInvestment: 25
}

export default function PasskeyRolloutStrategist() {
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
    moduleId: 'passkey_rollout_strategist',
    initialScore: 100,
    maxHints: 3
  })

  const [allocation, setAllocation] = useState<RolloutAllocation>(INITIAL_ALLOCATION)
  const [outcomes, setOutcomes] = useState<QuarterOutcome[] | null>(null)
  const [hasRunOnce, setHasRunOnce] = useState(false)

  const totalAllocated = Object.values(allocation).reduce((sum, v) => sum + v, 0)
  const isValidAllocation = totalAllocated === TOTAL_BUDGET_POINTS

  const updateAllocation = (key: keyof RolloutAllocation, value: number) => {
    setAllocation((prev) => ({ ...prev, [key]: value }))
  }

  const runSimulation = () => {
    const yearOutcomes = simulateYear(allocation)
    setOutcomes(yearOutcomes)
    const finalQuarter = yearOutcomes[yearOutcomes.length - 1]
    const outcomeScore = computeOutcomeScore(finalQuarter)

    log('info', `Year simulated: Q4 adoption ${finalQuarter.adoptionPercent.toFixed(1)}%, phishing rate ${finalQuarter.phishingIncidentRate.toFixed(1)}/1000, ${finalQuarter.helpDeskTicketVolume.toFixed(0)} help-desk tickets. Outcome score: ${outcomeScore.toFixed(1)}.`)

    if (!hasRunOnce) {
      setHasRunOnce(true)
      completeStep(0, 'Checkpoint 1 verified: Ran your first annual passkey rollout simulation.')
    }

    if (finalQuarter.supportEscalation) {
      log('warning', '🚨 Support escalation triggered: zero investment in account recovery means every lost-device case becomes an emergency help-desk ticket.')
    } else if (currentStep <= 1) {
      completeStep(1, 'Checkpoint 2 verified: Funded a recovery flow and avoided a support escalation.')
    }

    if (
      currentStep <= 2 &&
      finalQuarter.adoptionPercent >= 20 &&
      finalQuarter.phishingIncidentRate < 15 &&
      !finalQuarter.supportEscalation
    ) {
      finishPlayground(
        `🎉 Rollout complete! You hit ${finalQuarter.adoptionPercent.toFixed(1)}% passkey adoption with a phishing-incident rate of ${finalQuarter.phishingIncidentRate.toFixed(1)}/1000 and no support escalation — a genuinely balanced, sustainable rollout.`
      )
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Every category has diminishing returns — dumping your entire budget into one category (like Platform SDK alone) wastes points beyond a certain saturation point. Spread investment across all four.',
      `Account Recovery Flow investment can never be 0 — a rollout with zero recovery investment always triggers a support escalation penalty, no matter how well everything else is funded.`,
      `The real 2026 benchmark ceiling is ${INDUSTRY_BENCHMARKS.passkeySuccessRateCeiling}% passkey success — and ${INDUSTRY_BENCHMARKS.legacyFallbackPhishableRate}% of legacy fallback logins are still phishable, so Legacy Fallback Sunset investment matters just as much as raw adoption growth.`
    ]
    revealHint(hints[hintsRevealed])
  }

  const finalOutcome = outcomes ? outcomes[outcomes.length - 1] : null
  const finalScore = finalOutcome ? computeOutcomeScore(finalOutcome) : null

  return (
    <PlaygroundShell
      title="Passkey Fleet Rollout Strategist"
      description="Play CISO: allocate a fixed rollout budget across platform SDKs, help-desk training, legacy-fallback sunset, and account recovery — then see a year of quarterly adoption, phishing-incident, and help-desk outcomes scored against real 2026 industry benchmarks."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setAllocation(INITIAL_ALLOCATION)
        setOutcomes(null)
        setHasRunOnce(false)
        resetPlayground()
        log('info', 'Rollout plan reset to a balanced starting allocation.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Annual Budget Allocation</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isValidAllocation ? 'bg-status-success/15 text-status-success' : 'bg-status-warning/15 text-status-warning'}`}>
              {totalAllocated} / {TOTAL_BUDGET_POINTS} points allocated
            </span>
          </div>

          {ALLOCATION_CATEGORIES.map((cat) => (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor={`alloc-${cat.key}`} className="font-bold text-text-secondary">{cat.label}</label>
                <span className="font-mono font-bold text-text-primary">{allocation[cat.key]}</span>
              </div>
              <input
                id={`alloc-${cat.key}`}
                type="range"
                min={0}
                max={100}
                value={allocation[cat.key]}
                onChange={(e) => updateAllocation(cat.key, Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-text-muted">{cat.desc}</p>
            </div>
          ))}

          <button
            onClick={runSimulation}
            disabled={!isValidAllocation}
            className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Play className="w-4 h-4" />
            {isValidAllocation ? 'Run Annual Simulation' : `Allocate exactly ${TOTAL_BUDGET_POINTS} points to run`}
          </button>
        </div>

        {outcomes && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border-subtle">
              <table className="w-full text-xs">
                <thead className="bg-bg-nested">
                  <tr>
                    <th className="p-2.5 text-left font-bold text-text-secondary">Quarter</th>
                    <th className="p-2.5 text-left font-bold text-text-secondary">Adoption %</th>
                    <th className="p-2.5 text-left font-bold text-text-secondary">Phishing Rate</th>
                    <th className="p-2.5 text-left font-bold text-text-secondary">Help-Desk Tickets</th>
                    <th className="p-2.5 text-left font-bold text-text-secondary">Escalation?</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.map((outcome) => (
                    <tr key={outcome.quarter} className="border-t border-border-subtle/50">
                      <td className="p-2.5 font-bold">Q{outcome.quarter}</td>
                      <td className="p-2.5">{outcome.adoptionPercent.toFixed(1)}%</td>
                      <td className="p-2.5">{outcome.phishingIncidentRate.toFixed(1)}/1000</td>
                      <td className="p-2.5">{outcome.helpDeskTicketVolume.toFixed(0)}</td>
                      <td className="p-2.5">
                        {outcome.supportEscalation ? (
                          <span className="text-status-danger font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Yes</span>
                        ) : (
                          <span className="text-status-success font-bold">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {finalOutcome && finalScore !== null && (
              <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-3">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent-primary" />
                  End-of-Year Report Card
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
                    <div className="text-text-muted">Outcome Score</div>
                    <div className="font-extrabold text-text-primary">{finalScore.toFixed(1)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
                    <div className="text-text-muted">Adoption vs. Ceiling</div>
                    <div className="font-extrabold text-text-primary">{finalOutcome.adoptionPercent.toFixed(1)}% / {INDUSTRY_BENCHMARKS.passkeySuccessRateCeiling}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-bg-card border border-border-subtle">
                    <div className="text-text-muted">Support Escalation</div>
                    <div className={`font-extrabold ${finalOutcome.supportEscalation ? 'text-status-danger' : 'text-status-success'}`}>{finalOutcome.supportEscalation ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {finalOutcome.supportEscalation
                    ? 'Zero investment in account recovery is the single most common real-world rollout mistake — it turns every lost device into a help-desk emergency. Reallocate at least a few points there next round.'
                    : finalOutcome.adoptionPercent < 20
                      ? 'Your adoption growth is lagging — Platform SDK and Help-Desk Training investment are what actually move the adoption needle quarter over quarter.'
                      : 'Solid, balanced rollout — you avoided the two classic failure modes (all-in-one-category tunnel vision and a zero-recovery-budget support crisis).'}
                </p>
                <p className="text-[10px] text-text-muted italic">Benchmarks: {INDUSTRY_BENCHMARKS.citation}</p>
              </div>
            )}
          </div>
        )}

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-accent-primary" />
            <LifeBuoy className="w-4 h-4 text-accent-secondary" />
            Why This Simulator Matters
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Rolling out passkeys across a real enterprise isn't a protocol problem, it's a change-management and budget-allocation problem. Organizations that dump their entire budget into SDK integration and skip account-recovery planning consistently get blindsided by a wave of "I lost my phone" help-desk tickets the moment adoption actually takes off — and organizations that don't sunset legacy phishable fallbacks in parallel never see their phishing-incident rate actually drop, no matter how many users have a passkey enrolled.
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
