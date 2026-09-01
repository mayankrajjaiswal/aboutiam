import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function ZkCrossChainAuth() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'zk_cross_chain_lab',
    initialScore: 100
  })

  const [walletConnected, setWalletConnected] = useState(false)

  const handleProve = () => {
    log('info', `📡 Querying decentralized smart contract state...`)
    log('info', `🔐 Local WebAssembly proving key compiling zk-SNARK cryptographic circuit parameters...`)
    log('success', `🧩 Zero-Knowledge Proof successfully generated! Claim: [Owns specific token == True, WalletAddress == REDACTED_ANONYMOUS].`)
    log('success', `✅ Web2 API Gateway verified zk-proof, granting full enterprise resource access.`)
    setWalletConnected(true)
    if (currentStep === 1) completeStep(1)
  }

  return (
    <PlaygroundShell
      title="ZK Cross-Chain Auth Simulator"
      description="Generate a browser-native zk-SNARK cryptographic proof of Web3 wallet holdings to authorize access to corporate Web2 APIs anonymously."
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
            Generate and verify an anonymous zero-knowledge proof of public wallet holdings to authenticate to secure private APIs.
          </p>

          <button
            onClick={handleProve}
            disabled={walletConnected}
            className="px-6 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md hover-cyber-glow"
          >
            {walletConnected ? '🔒 Wallet Verified Anonymously!' : '🔑 Generate & Verify zk-SNARK Proof'}
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
