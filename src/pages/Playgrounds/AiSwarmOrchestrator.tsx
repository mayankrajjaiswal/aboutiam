import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function AiSwarmOrchestrator() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'ai_swarm_lab',
    initialScore: 100
  })

  const handleAction = (action: 'spawn' | 'revoke') => {
    if (action === 'spawn') {
      log('info', `🐝 Parent Agent initiating swarm deployment...`)
      log('info', `🔑 Generating cryptographically constrained, short-lived tokens (RFC 8693 Token Exchange) for 10 child agents.`)
      log('success', `✅ Child Swarm active. Executing micro-tasks across multi-cloud clusters.`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('warning', `🚨 Intercepting abnormal behavior in Child Agent #4!`)
      log('info', `🛡️ Parent orchestrator initiating targeted revocation of Child Agent #4's delegational lease...`)
      log('success', `✅ Child Agent #4 cryptographically neutralized. Rest of the swarm remains active and healthy.`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="Ephemeral AI Swarm Identity Orchestrator"
      description="Deploy an AI swarm and visualize constrained, short-lived tokens (RFC 8693) generated and revoked autonomously by a parent AI."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleAction('spawn')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center"
          >
            🚀 Spawn Constrained Swarm (Parent)
          </button>
          <button
            onClick={() => handleAction('revoke')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center"
          >
            🛡️ Target and Revoke Rogue Agent #4
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
