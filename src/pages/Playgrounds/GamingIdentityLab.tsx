import { useState } from 'react'
import { Gamepad2, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { GAMING_IDENTITY_SCENARIOS, evaluateGamingScenario, type GamingScenarioId } from '../../data/gamingIdentityScenarios'

export default function GamingIdentityLab() {
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
    resetPlayground,
  } = usePlayground({ moduleId: 'gaming_identity_lab', initialScore: 100, maxHints: 3 })

  const [activeScenarioId, setActiveScenarioId] = useState<GamingScenarioId>('account_linking')
  const [enabledSignals, setEnabledSignals] = useState<Record<GamingScenarioId, Set<string>>>({
    account_linking: new Set(),
    smurf_detection: new Set(),
    wagering_kyc: new Set(),
  })
  const [triggeredScenarios, setTriggeredScenarios] = useState<Set<GamingScenarioId>>(new Set())

  const activeScenario = GAMING_IDENTITY_SCENARIOS.find((s) => s.id === activeScenarioId)!
  const activeSignals = enabledSignals[activeScenarioId]
  const outcome = evaluateGamingScenario(activeScenarioId, Array.from(activeSignals))

  const toggleSignal = (signalId: string) => {
    const next = new Set(activeSignals)
    if (next.has(signalId)) {
      next.delete(signalId)
    } else {
      next.add(signalId)
    }
    setEnabledSignals((prev) => ({ ...prev, [activeScenarioId]: next }))

    const nextOutcome = evaluateGamingScenario(activeScenarioId, Array.from(next))
    log(
      nextOutcome.triggered ? 'success' : 'info',
      `[${activeScenario.title}] ${nextOutcome.headline}`
    )

    if (nextOutcome.triggered && !triggeredScenarios.has(activeScenarioId)) {
      const nextTriggered = new Set(triggeredScenarios)
      nextTriggered.add(activeScenarioId)
      setTriggeredScenarios(nextTriggered)

      const stepIndex = GAMING_IDENTITY_SCENARIOS.findIndex((s) => s.id === activeScenarioId)
      completeStep(stepIndex, `Checkpoint ${stepIndex + 1} verified: reproduced "${nextOutcome.headline}" in ${activeScenario.title}.`)

      if (nextTriggered.size === GAMING_IDENTITY_SCENARIOS.length) {
        finishPlayground('🎮 You reproduced all 3 gaming-identity scenarios: ban propagation, evasion detection, and continuous wagering KYC.')
      }
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Start with Account Linking: link all 3 platforms, then issue the ban — watch it propagate to every linked account at once.',
      'For Smurf Detection, enable both the device fingerprint and behavioral pattern signals together — either alone isn\'t enough to cross the confidence threshold.',
      'For Wagering KYC, enable just one risk signal (e.g. a new device) — continuous KYC re-triggers on any single signal, not just a large withdrawal.',
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="Gaming & Esports Identity Lab"
      description="Model three identity challenges unique to gaming and esports: cross-platform account linking with ban propagation, smurf/ban-evasion detection via device and behavioral signals, and continuous (not one-time) KYC for real-money wagering platforms."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={GAMING_IDENTITY_SCENARIOS.length}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setEnabledSignals({ account_linking: new Set(), smurf_detection: new Set(), wagering_kyc: new Set() })
        setTriggeredScenarios(new Set())
        resetPlayground()
        log('info', 'Gaming identity lab reset. All signals cleared.')
      }}
      sidebarContent={<TraceTerminal logs={logs} title="Trust & Safety Log" />}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {GAMING_IDENTITY_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenarioId(scenario.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeScenarioId === scenario.id
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {triggeredScenarios.has(scenario.id) && <ShieldCheck className="w-3.5 h-3.5" />}
              {scenario.title}
            </button>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-accent-primary" /> {activeScenario.title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">{activeScenario.narrative}</p>
        </div>

        <div className="space-y-2">
          {activeScenario.signals.map((signal) => {
            const isEnabled = activeSignals.has(signal.id)
            return (
              <label
                key={signal.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-sidebar/40 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleSignal(signal.id)}
                  className="w-4 h-4 mt-0.5 accent-accent-primary shrink-0"
                />
                <span className="space-y-0.5">
                  <span className="block text-sm font-bold text-text-primary">{signal.label}</span>
                  <span className="block text-xs text-text-secondary leading-relaxed">{signal.description}</span>
                </span>
              </label>
            )
          })}
        </div>

        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            outcome.triggered
              ? 'bg-status-success/10 border-status-success/30'
              : 'bg-bg-sidebar/40 border-border-subtle'
          }`}
        >
          {outcome.triggered ? (
            <ShieldCheck className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
          ) : (
            <ArrowRight className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className={`text-sm font-bold ${outcome.triggered ? 'text-status-success' : 'text-text-primary'}`}>
              {outcome.headline}
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">{outcome.detail}</p>
            {typeof outcome.confidence === 'number' && (
              <div className="h-1.5 rounded-full bg-bg-nested overflow-hidden mt-2 w-48">
                <div
                  className={`h-full rounded-full ${outcome.triggered ? 'bg-status-success' : 'bg-status-warning'}`}
                  style={{ width: `${outcome.confidence}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-accent-primary" /> Why Gaming Identity Is a Distinct Discipline
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Enterprise IAM assumes one account maps to one person, once. Gaming/esports identity has to solve the
            opposite problem at scale: the same person deliberately operating many linked and unlinked accounts,
            an adversary economically motivated to evade a single ban, and — for wagering platforms — a legal
            requirement to keep re-verifying identity continuously rather than trusting a one-time signup check.
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
