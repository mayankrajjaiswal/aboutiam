import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function V2xPki() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'v2x_pki_lab',
    initialScore: 100
  })

  const handleScenario = (scenario: 'trusted' | 'attacker') => {
    if (scenario === 'trusted') {
      log('info', `🚗 Autonomous Vehicle #1 preparing speed/braking adjustment broadcast...`)
      log('info', `🔐 Retrieving ephemeral, pseudonymous short-lived certificate (IEEE 1609.2).`)
      log('success', `✅ Handshake validated in 4.2ms! Adjacent vehicles successfully verified leaf signature.`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('warning', `🚨 Intercepting abnormal brake signal broadcast from untrusted entity!`)
      log('info', `🔍 Verification failed: Root CA trace indicated certificate revocation list (CRL) hit.`)
      log('error', `❌ Packet dropped at network interface layer. Collision avoidance maintained.`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="V2X PKI Expressway Simulator"
      description="Simulate autonomous vehicles validating sub-10ms ephemeral pseudonymous certificates and rejecting invalid leaf-node brake signals."
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
            onClick={() => handleScenario('trusted')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center"
          >
            🚗 Verify Compliant Vehicle Signal
          </button>
          <button
            onClick={() => handleScenario('attacker')}
            className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center animate-pulse"
          >
            ⚠️ Intercept Untrusted Intruder Signal
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
