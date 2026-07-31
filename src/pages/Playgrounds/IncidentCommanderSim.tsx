import { useState } from 'react'
import { AlertTriangle, ShieldCheck, ShieldAlert, RotateCcw } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { INCIDENT_COMMANDER_SCENARIOS, type IncidentOutcomeId } from '../../data/incidentCommanderScenarios'

const OUTCOME_TONE: Record<IncidentOutcomeId, { icon: typeof ShieldCheck; className: string }> = {
  'contained-fast': { icon: ShieldCheck, className: 'bg-status-success/10 border-status-success/30 text-status-success' },
  'contained-slow': { icon: ShieldAlert, className: 'bg-status-warning/10 border-status-warning/30 text-status-warning' },
  'breach-escalated': { icon: AlertTriangle, className: 'bg-status-danger/10 border-status-danger/30 text-status-danger' },
  'compliance-failure': { icon: AlertTriangle, className: 'bg-status-danger/10 border-status-danger/30 text-status-danger' },
}

export default function IncidentCommanderSim() {
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
  } = usePlayground({ moduleId: 'incident_commander_sim', initialScore: 100, maxHints: 3 })

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [outcomeId, setOutcomeId] = useState<IncidentOutcomeId | null>(null)

  const scenario = INCIDENT_COMMANDER_SCENARIOS[scenarioIndex]
  const activeNode = currentNodeId ? scenario.nodes.find((n) => n.id === currentNodeId) : null

  const handleRevealHint = () => {
    revealHint('Every choice teaches something even when it is wrong — read the next prompt carefully, it explains what happened.')
  }

  const handleSelectScenario = (idx: number) => {
    setScenarioIndex(idx)
    setCurrentNodeId(null)
    setOutcomeId(null)
    resetPlayground()
  }

  const handleBegin = () => {
    setCurrentNodeId(scenario.startNodeId)
    log('info', `Incident briefing: ${scenario.briefing}`)
  }

  const handleDecision = (label: string, next: string) => {
    log('info', `Decision: "${label}"`)
    completeStep(currentStep, `Decision logged.`)

    if (next.startsWith('outcome:')) {
      const resolvedOutcome = next.slice('outcome:'.length) as IncidentOutcomeId
      setOutcomeId(resolvedOutcome)
      const outcomeDef = scenario.outcomes[resolvedOutcome]
      const isGood = resolvedOutcome === 'contained-fast'
      adjustScore(isGood ? 0 : -20, `Outcome reached: ${outcomeDef.title}`)
      log(isGood ? 'success' : 'warning', outcomeDef.postMortem)
      finishPlayground(`Incident resolved: ${outcomeDef.title}`)
      return
    }

    setCurrentNodeId(next)
  }

  const handleReset = () => {
    setCurrentNodeId(null)
    setOutcomeId(null)
    resetPlayground()
    log('info', 'Incident closed. Ready for the next call.')
  }

  return (
    <PlaygroundShell
      title="Incident Commander"
      description="Play incident commander during a live identity breach. Make timed branching decisions built from real AboutIAM Security Bulletins incidents — every path terminates in a scored outcome with a real-world post-mortem."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {INCIDENT_COMMANDER_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(idx)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                idx === scenarioIndex
                  ? 'bg-accent-glow border-accent-primary/40 text-accent-primary'
                  : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {!currentNodeId && !outcomeId && (
          <div className="p-6 rounded-2xl border border-border-subtle bg-bg-nested space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">{scenario.briefing}</p>
            <button
              onClick={handleBegin}
              className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
            >
              Begin Incident Response
            </button>
          </div>
        )}

        {activeNode && !outcomeId && (
          <div className="p-6 rounded-2xl border border-border-subtle bg-bg-nested space-y-4">
            <p className="text-sm text-text-primary font-semibold leading-relaxed">{activeNode.prompt}</p>
            <div className="space-y-2">
              {activeNode.decisions.map((decision) => (
                <button
                  key={decision.label}
                  onClick={() => handleDecision(decision.label, decision.next)}
                  className="w-full text-left p-3 rounded-xl border border-border-subtle bg-bg-card hover:border-accent-primary/40 hover:bg-accent-glow text-xs font-bold text-text-secondary hover:text-accent-primary transition-all"
                >
                  {decision.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {outcomeId && (
          <div className={`p-6 rounded-2xl border space-y-3 ${OUTCOME_TONE[outcomeId].className}`}>
            <div className="flex items-center gap-2 font-black text-sm">
              {(() => {
                const Icon = OUTCOME_TONE[outcomeId].icon
                return <Icon className="w-5 h-5" />
              })()}
              {scenario.outcomes[outcomeId].title}
            </div>
            <p className="text-xs leading-relaxed">{scenario.outcomes[outcomeId].postMortem}</p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Run Another Incident
            </button>
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
