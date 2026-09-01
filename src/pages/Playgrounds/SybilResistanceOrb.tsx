import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function SybilResistanceOrb() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'sybil_orb_lab',
    initialScore: 100
  })

  const [hasScanned, setHasScanned] = useState(false)

  const handleScan = () => {
    log('info', `👁️ Aligning ocular biometric iris-code camera mesh...`)
    log('info', `🔍 Extracting abstract mathematical Gabor filter vectors from iris pattern...`)
    log('success', `🧩 Iris-Code generated: [Hash = 4058d...8ae02] (irreversible, zero raw biological imagery retained).`)
    log('success', `✅ Uniqueness check: Checked against global Merkle Tree state. User verified as Unique Human.`)
    setHasScanned(true)
    if (currentStep === 1) completeStep(1)
  }

  return (
    <PlaygroundShell
      title="Sybil-Resistant Iris Hash Lab"
      description="Explore how biometric Gabor filter vectors generate secure, irreversible, Sybil-resistant Iris-Codes for Proof-of-Personhood."
      score={score}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onReset={resetPlayground}
      sidebarContent={<TraceTerminal logs={logs} />}
      hintsRevealed={0}
      onRevealHint={() => {}}
    >
      <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-6 flex flex-col items-center">
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-accent-secondary flex items-center justify-center bg-accent-secondary/5 animate-pulse">
          <button
            onClick={handleScan}
            disabled={hasScanned}
            className="w-40 h-40 rounded-full bg-accent-secondary hover:bg-accent-secondary/80 text-white font-black text-sm uppercase transition-all shadow-xl hover-cyber-glow"
          >
            {hasScanned ? '👁️ Scanned!' : '👁️ Scan Iris (Orb)'}
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
