import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function OcularKineticTrust() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'ocular_kinetic_lab',
    initialScore: 100
  })

  const handleScan = (signal: 'stable' | 'jitter') => {
    log('info', `🧠 Reading microscopic involuntary ocular saccades (eye movements)...`)
    log('info', `📡 Measuring kinetic-tremor signatures of hand tracking controllers...`)

    if (signal === 'stable') {
      log('success', `✅ Ambient biometric parameters align with baseline. Trust Score remains 100%.`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('warning', `🚨 Kinetic micro-tremors deviate from baseline signature! (Potential headset takeoff/handoff detected).`)
      log('error', `❌ Continuous trust decayed below 50%. Prompting immediate FIDO2 credential challenge.`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="Kinetic-Tremor Continuous Trust Simulator"
      description="Model spatial computing continuous authentication by tracking microscopic hand tremors and involuntary eye saccades."
      score={score}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onReset={resetPlayground}
      sidebarContent={<TraceTerminal logs={logs} />}
      hintsRevealed={0}
      onRevealHint={() => {}}
    >
      <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-6">
        <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Simulate Headset Wearer States</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleScan('stable')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center"
          >
            🧠 Stable Baseline (Authorized Wearer)
          </button>
          <button
            onClick={() => handleScan('jitter')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center animate-pulse"
          >
            ⚡ Excessive Tremor / Unaligned Wearer
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
