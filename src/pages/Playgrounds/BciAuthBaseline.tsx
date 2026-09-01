import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function BciAuthBaseline() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'bci_neural_lab',
    initialScore: 100
  })

  const handleScan = (signal: 'calm' | 'excited') => {
    log('info', `🧠 Mapping continuous Brain-Computer Interface (BCI) spatial telemetry...`)
    log('info', `📡 Capturing raw neural wave P300 polynomial spikes...`)

    if (signal === 'calm') {
      log('success', `✅ Neural signature matches baseline profile. Access maintained.`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('warning', `🚨 Neural cognitive anomaly detected! (Anomalous alpha/beta band ratio).`)
      log('error', `❌ Trust score decayed below critical threshold. Re-authentication challenged.`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="BCI Neural Auth Baseline Simulator"
      description="Map a Brain-Computer Interface (BCI) P300 brainwave hash against a baseline for continuous spatial computing authentication."
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
        <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Trigger Simulated Neural Brain States</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleScan('calm')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center"
          >
            🧠 Calibrated Baseline Brainwave
          </button>
          <button
            onClick={() => handleScan('excited')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center animate-pulse"
          >
            ⚡ Anxious / Stressed Brainwave
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
