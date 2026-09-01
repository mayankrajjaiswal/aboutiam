import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function QkdSimulator() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'qkd_lab',
    initialScore: 100
  })

  const [eavesdropping, setEavesdropping] = useState(false)

  const handleHandshake = () => {
    log('info', `📡 Initiating Quantum Key Distribution (QKD) polarized photon sequence...`)
    if (eavesdropping) {
      log('warning', `👁️ Eavesdropper attempting interception on the optical fiber path!`)
      log('warning', `🚨 Heisenberg's Uncertainty Principle: Photon states collapsed on observation!`)
      log('error', `❌ Quantum link compromised. Handshake dropped automatically to prevent key leakage.`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('success', `✅ Photons arrived intact at the receiver module.`)
      log('success', `🔑 Shared cryptographic key established securely via quantum entanglement.`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="Quantum Key Distribution (QKD) Simulator"
      description="Observe the quantum state of photons collapsing during a transmission interception, compared to traditional lattice-based PQC."
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
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-bg-nested border border-border-subtle rounded-xl">
            <div className="space-y-1 pr-4">
              <h3 className="text-xs font-bold text-text-primary">Simulate Quantum Eavesdropper Interception</h3>
              <p className="text-[10px] text-text-secondary">Toggle to simulate an adversary snooping the physical quantum channel.</p>
            </div>
            <input
              type="checkbox"
              checked={eavesdropping}
              onChange={() => setEavesdropping(!eavesdropping)}
              className="w-4 h-4 text-accent-primary"
            />
          </div>

          <button
            onClick={handleHandshake}
            className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
          >
            Start QKD Handshake
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
