import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function DigitalTwinBinding() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'digital_twin_lab',
    initialScore: 100
  })

  const [bound, setBound] = useState(false)

  const handleBind = () => {
    log('info', `📡 Querying physical turbine hardware interface...`)
    log('info', `🔍 Reading unique Physical Unclonable Function (PUF) silicon keys from onboard hardware...`)
    log('info', `🔐 Constructing X.509 Cloud certificate with embedded PUF hardware fingerprints.`)
    log('success', `✅ Cryptographic bind successful! Real-world turbine permanently mapped to its Digital Twin in the cloud.`)
    setBound(true)
    if (currentStep === 1) completeStep(1)
  }

  return (
    <PlaygroundShell
      title="Digital Twin Identity Binding Workbench"
      description="Cryptographically bond a Physical Unclonable Function (PUF) chip to an X.509 cloud certificate representing an IoT digital twin."
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
        <div className="p-8 bg-bg-nested border border-border-subtle rounded-2xl w-full text-center space-y-4">
          <p className="text-xs text-text-secondary">
            Establish a hardware-root-of-trust mapping between a physical IoT sensor/turbine and its cloud representation.
          </p>

          <button
            onClick={handleBind}
            disabled={bound}
            className="px-6 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md hover-cyber-glow"
          >
            {bound ? '⚙️ Digital Twin Bound Successfully!' : '⚙️ Bind PUF to Cloud Certificate'}
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
