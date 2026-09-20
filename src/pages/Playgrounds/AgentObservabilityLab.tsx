import { useState, useMemo } from 'react'
import { Play, Eye, Siren, RefreshCw } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { AGENT_DRIFT_SCENARIOS, type ActionDriftLevel } from '../../data/agentDriftScenarios'

type InterventionRung = 'log' | 'warn' | 'approve' | 'throttle' | 'block' | 'revoke'

const RUNG_ORDER: InterventionRung[] = ['log', 'warn', 'approve', 'throttle', 'block', 'revoke']
const RUNG_LABELS: Record<InterventionRung, string> = {
  log: 'Log',
  warn: 'Warn',
  approve: 'Require Approval',
  throttle: 'Throttle',
  block: 'Block',
  revoke: 'Revoke Session',
}
/** Drift-score threshold at which each rung fires. */
const RUNG_THRESHOLDS: Record<InterventionRung, number> = {
  log: 0,
  warn: 15,
  approve: 30,
  throttle: 45,
  block: 60,
  revoke: 80,
}

const DRIFT_COLOR: Record<ActionDriftLevel, string> = {
  'in-scope': 'text-status-success',
  'minor-drift': 'text-status-info',
  'major-drift': 'text-status-warning',
  critical: 'text-status-danger',
}

export default function AgentObservabilityLab() {
  const [scenarioId, setScenarioId] = useState(AGENT_DRIFT_SCENARIOS[0].id)
  const scenario = useMemo(() => AGENT_DRIFT_SCENARIOS.find((s) => s.id === scenarioId)!, [scenarioId])
  const [interventionRung, setInterventionRung] = useState<InterventionRung>('approve')
  const [hasReplayed, setHasReplayed] = useState(false)
  const [revealedActionCount, setRevealedActionCount] = useState(0)

  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    adjustScore,
    completeStep,
    finishPlayground,
    resetPlayground,
  } = usePlayground({
    moduleId: 'agent_observability_lab',
    initialScore: 100,
    maxHints: 3,
  })

  const cumulativeDrift = useMemo(() => {
    return scenario.actions.reduce<Array<(typeof scenario.actions)[number] & { cumulativeDrift: number }>>((acc, a) => {
      const runningTotal = (acc.length > 0 ? acc[acc.length - 1].cumulativeDrift : 0) + a.driftPoints
      acc.push({ ...a, cumulativeDrift: runningTotal })
      return acc
    }, [])
  }, [scenario])

  const interventionThreshold = RUNG_THRESHOLDS[interventionRung]
  const triggerAction = cumulativeDrift.find((a) => a.cumulativeDrift >= interventionThreshold)
  const interveneAt = triggerAction?.timeOffsetSeconds ?? null
  const damagePrevented = interveneAt !== null && interveneAt <= scenario.damageOccursAt

  const handleSelectScenario = (id: string) => {
    setScenarioId(id)
    setHasReplayed(false)
    setRevealedActionCount(0)
    log('info', `Loaded scenario: ${AGENT_DRIFT_SCENARIOS.find((s) => s.id === id)?.title}`)
  }

  const handleReplay = () => {
    setHasReplayed(true)
    setRevealedActionCount(cumulativeDrift.length)
    log('info', `Replaying with intervention set to "${RUNG_LABELS[interventionRung]}" (threshold: drift score ${interventionThreshold})...`)

    for (const action of cumulativeDrift) {
      log(action.driftLevel === 'critical' ? 'error' : action.driftLevel === 'in-scope' ? 'success' : 'warning', `[t+${action.timeOffsetSeconds}s] ${action.action} (drift: ${action.cumulativeDrift})`)
      if (interveneAt !== null && action.timeOffsetSeconds === interveneAt) {
        log('success', `INTERVENTION FIRES: "${RUNG_LABELS[interventionRung]}" at t+${action.timeOffsetSeconds}s.`)
        if (interventionRung === 'revoke') {
          log('warning', `Revocation propagation lag: ${scenario.revocationPropagationLagSeconds}s before the agent's session is actually stopped.`)
        }
      }
    }

    if (interveneAt === null) {
      log('error', 'Intervention threshold never reached — the agent completed the entire chain unchecked.')
      adjustScore(-20, 'No intervention fired before the damage occurred.')
    } else if (damagePrevented && interveneAt < cumulativeDrift[0].timeOffsetSeconds + 5) {
      adjustScore(-5, 'Intervened extremely early — likely to have blocked a legitimate task unnecessarily too.')
      log('warning', 'This threshold is very aggressive — it would also block many legitimate agent runs.')
      completeStep(0, 'Damage prevented, but the threshold is too aggressive for real use.')
    } else if (damagePrevented) {
      adjustScore(10, 'Intervention fired before the damaging action — well-tuned threshold.')
      completeStep(0, 'Damage prevented at a reasonable threshold.')
      finishPlayground(`Intervention at "${RUNG_LABELS[interventionRung]}" stopped the chain before damage occurred, without an overly aggressive threshold.`)
    } else {
      adjustScore(-10, 'Intervention fired too late — damage already occurred by then.')
      log('error', 'The intervention fired, but only after the damaging action had already completed.')
    }
  }

  return (
    <PlaygroundShell
      title="Agent Behavior Observability Lab"
      description="Watch an agent's actual actions stream in against its declared task, tune where on the intervention ladder you step in, and see whether you stopped the damage in time — or acted so early you'd have blocked a legitimate run too."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Look at when the drift score crosses into "major-drift" or "critical" territory — that is usually the right place to intervene, not the very first sign of any drift at all.')}
      onReset={() => {
        setInterventionRung('approve')
        setHasReplayed(false)
        setRevealedActionCount(0)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* SCENARIO SELECTOR */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Select Scenario</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AGENT_DRIFT_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectScenario(s.id)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  scenarioId === s.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'border-border-subtle bg-bg-card text-text-secondary'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-secondary pt-1">
            <span className="font-black text-text-primary">Declared task: </span>{scenario.declaredTask}
          </p>
        </div>

        {/* INTERVENTION THRESHOLD SELECTOR */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Siren className="w-4 h-4 text-accent-primary" /> Intervention Rung
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {RUNG_ORDER.map((rung) => (
              <button
                key={rung}
                onClick={() => setInterventionRung(rung)}
                className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  interventionRung === rung ? 'bg-accent-primary text-white border-accent-primary' : 'border-border-subtle bg-bg-nested text-text-secondary'
                }`}
              >
                {RUNG_LABELS[rung]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-secondary">Fires when cumulative drift score reaches {interventionThreshold}.</p>
        </div>

        <button
          onClick={handleReplay}
          className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> Replay Action Timeline
        </button>

        {/* TIMELINE */}
        {hasReplayed && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-black text-text-primary flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-accent-primary" /> Observed Action Timeline</h2>
            {cumulativeDrift.slice(0, revealedActionCount).map((action, i) => {
              const isTrigger = interveneAt !== null && action.timeOffsetSeconds === interveneAt
              const isDamage = action.timeOffsetSeconds === scenario.damageOccursAt
              return (
                <div key={i} className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${isTrigger ? 'bg-accent-glow border-accent-primary' : 'bg-bg-card border-border-subtle'}`}>
                  <span className="text-[10px] font-mono text-text-muted shrink-0 w-12">t+{action.timeOffsetSeconds}s</span>
                  <span className={`flex-1 ${DRIFT_COLOR[action.driftLevel]}`}>{action.action}</span>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">drift: {action.cumulativeDrift}</span>
                  {isTrigger && <RefreshCw className="w-3.5 h-3.5 text-accent-primary shrink-0" />}
                  {isDamage && <span className="text-[9px] font-black text-status-danger uppercase shrink-0">Damage point</span>}
                </div>
              )
            })}
            <div className={`p-3 rounded-xl border text-xs ${damagePrevented ? 'bg-status-success/5 border-status-success/30 text-status-success' : 'bg-status-danger/5 border-status-danger/30 text-status-danger'}`}>
              {interveneAt === null
                ? 'No intervention fired — the threshold was never reached.'
                : damagePrevented
                  ? `Intervention fired at t+${interveneAt}s, before the damage point (t+${scenario.damageOccursAt}s).`
                  : `Intervention fired at t+${interveneAt}s, but damage already occurred at t+${scenario.damageOccursAt}s.`}
            </div>
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
