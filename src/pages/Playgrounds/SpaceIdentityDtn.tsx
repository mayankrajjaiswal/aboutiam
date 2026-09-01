import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function SpaceIdentityDtn() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'space_identity_lab',
    initialScore: 100
  })

  const [latency, setLatency] = useState(15)

  const handleTransmit = () => {
    log('info', `🚀 Preparing Delay-Tolerant Networking (DTN) Bundle Protocol Security (BPSec) packet...`)
    log('info', `🔑 Signing bundle payload using regional ephemeral asymmetric keys.`)
    log('warning', `📡 Transmitting bundle with simulated ${latency}-minute light-speed orbital delay...`)
    
    setTimeout(() => {
      log('success', `🛰️ Packet received by Lunar Relay Gateway.`)
      log('success', `🔒 Authenticated asynchronously without active Earth-IdP real-time connectivity!`)
      if (currentStep === 1) completeStep(1)
    }, 1000)
  }

  return (
    <PlaygroundShell
      title="Space Identity & DTN Simulator"
      description="Construct a Delay-Tolerant Networking (DTN) space identity packet and simulate store-and-forward authentication across planetary lag."
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Adjust Simulated Light-Speed Lag (Minutes)</label>
          <input
            type="range"
            min={1}
            max={60}
            value={latency}
            onChange={(e) => setLatency(parseInt(e.target.value))}
            className="w-full h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>1 Minute (Low Earth Orbit)</span>
            <span className="font-bold text-accent-primary">{latency} Minutes</span>
            <span>60 Minutes (Deep Space Mars)</span>
          </div>
        </div>

        <button
          onClick={handleTransmit}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
        >
          Transmit Space Bundle
        </button>
      </div>
    </PlaygroundShell>
  )
}
