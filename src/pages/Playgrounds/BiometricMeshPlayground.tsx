import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function BiometricMeshPlayground() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'biometric_mesh_lab',
    initialScore: 100
  })

  const [blinkCount, setBlinkCount] = useState(0)

  const handleAction = (type: 'blink' | 'flash') => {
    if (type === 'blink') {
      log('info', `👁️ Human visitor executed physical blink action...`)
      setBlinkCount((prev) => prev + 1)
      log('success', `👁️ Liveness check: frame-to-frame pixel change indicates genuine muscle reflex.`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('info', `📸 Initiating hardware-bound color flash-challenge reflection check...`)
      log('success', `🧩 Optical sensor validated correct colored light absorption on pupil reflections.`)
      log('success', `✅ Genuine physical user presence verified. Presentation replay attack thwarted.`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="Computer-Vision Biometric Mesh Lab"
      description="A visual canvas simulator tracking head angles, blink rates, and flash-challenge responses to differentiate a live human from a deepfake replay attack."
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
        <div className="w-full max-w-sm bg-bg-nested border border-border-subtle p-6 rounded-2xl text-center space-y-4">
          <div className="text-xs text-text-secondary flex justify-between">
            <span>Blink Counter:</span>
            <span className="font-mono font-bold text-accent-secondary">{blinkCount} blinks</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAction('blink')}
              className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition"
            >
              👁️ Simulate Blink Reflex
            </button>
            <button
              onClick={() => handleAction('flash')}
              className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition animate-pulse"
            >
              🌈 Trigger Flash-Challenge
            </button>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  )
}
