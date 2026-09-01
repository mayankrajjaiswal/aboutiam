import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function MpcThresholdSandbox() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'mpc_threshold_lab',
    initialScore: 100
  })

  const [shardsCount, setShardsCount] = useState(2)

  const handleGenerateSign = () => {
    log('info', `📡 Initiating Multi-Party Computation (MPC) Threshold Signature scheme...`)
    log('info', `🧩 Generating Shamir's Polynomial Secret Shards (Total = 3, Threshold = 2)...`)
    log('info', `📱 Distributing Shards: Shard 1 -> Phone, Shard 2 -> Laptop, Shard 3 -> Smartwatch.`)

    if (shardsCount >= 2) {
      log('success', `✅ Active Shards presented: ${shardsCount} of 3. Threshold achieved!`)
      log('success', `🔒 Joint signature generated via Lagrange polynomial interpolation without key reconstruction!`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('warning', `⚠️ Active Shards presented: ${shardsCount} of 3. Threshold (t=2) failed.`)
      log('error', `❌ Sign operation rejected. Insufficient key shares presented.`)
    }
  }

  return (
    <PlaygroundShell
      title="MPC Threshold Signature Scheme Sandbox"
      description="Model Shamir's Secret Sharing to split, distribute, and combine cryptographic signature shards across separate user devices."
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
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Select Active Devices Present (Shards)</label>
          <div className="flex gap-4">
            {[1, 2, 3].map((val) => (
              <button
                key={val}
                onClick={() => { setShardsCount(val); log('info', `Set active presented shards to: ${val}`); }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex-grow ${shardsCount === val ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
              >
                {val} device{val > 1 ? 's' : ''} (t={val}/3)
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateSign}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
        >
          Generate Threshold Signature Jointly
        </button>
      </div>
    </PlaygroundShell>
  )
}
