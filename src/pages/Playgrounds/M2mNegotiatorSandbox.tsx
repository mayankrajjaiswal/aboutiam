import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function M2mNegotiatorSandbox() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'm2m_negotiator_lab',
    initialScore: 100
  })

  const [bidStatus, setBidStatus] = useState<'idle' | 'success'>('idle')

  const handleNegotiate = () => {
    log('info', `📡 Client Agent generating authorization request proposal contract...`)
    log('info', `📡 Client Agent requesting scope: [Scope = "read:financial-ledgers"].`)
    log('warning', `⚡ Resource Server Agent counter-proposing: [Required = "proof-of-local-compliance-audit"].`)
    
    setTimeout(() => {
      log('success', `👥 Client Agent signed and presented local compliance proof.`)
      log('success', `✅ Contract agreement achieved! Ephemeral, micro-scoped JWT issued locally with a 300ms lifetime.`)
      setBidStatus('success')
      if (currentStep === 1) completeStep(1)
    }, 1000)
  }

  return (
    <PlaygroundShell
      title="M2M AI Protocol Negotiator"
      description="Visualize autonomous AI agents executing smart-contract bids to negotiate custom-scoped OAuth 2.1 access rules dynamically."
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
            Execute a machine-to-machine protocol negotiation. Watch automated AI clients dynamically bargain and adjust OAuth token parameters.
          </p>

          <button
            onClick={handleNegotiate}
            disabled={bidStatus === 'success'}
            className="px-6 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md hover-cyber-glow"
          >
            {bidStatus === 'success' ? '🤝 Smart Contract Negotiated!' : '🤝 Start M2M Negotiation'}
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
