import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function MdlProximity() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'mdl_proximity_lab',
    initialScore: 100
  })

  const [connected, setConnected] = useState(false)

  const handleTap = () => {
    log('info', `📱 mDL holder initiating proximity tap...`)
    log('info', `📡 Advertising local BLE parameters and setting up Wi-Fi Aware channel...`)
    log('info', `🔐 Performing ECDH key agreement over Secp256r1 curves.`)
    log('success', `✅ Secure pairing established. Generating cryptographically signed CBOR payload.`)
    log('success', `🔒 Authenticated! TSA Verifier received age-attestation without full PII exposure.`)
    setConnected(true)
    if (currentStep === 1) completeStep(1)
  }

  return (
    <PlaygroundShell
      title="ISO 18013-5 mDL Proximity Authentication Lab"
      description="Establish an offline secure BLE session using ECDH to pass a cryptographically signed CBOR payload without internet access."
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
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-accent-primary flex items-center justify-center bg-accent-primary/5 animate-pulse">
          <button
            onClick={handleTap}
            disabled={connected}
            className="w-40 h-40 rounded-full bg-accent-primary hover:bg-accent-hover text-white font-black text-sm uppercase transition-all shadow-xl hover-cyber-glow"
          >
            {connected ? '📱 Tapped!' : '📱 Tap mDL Phone'}
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
