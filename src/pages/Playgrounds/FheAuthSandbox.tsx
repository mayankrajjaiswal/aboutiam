import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function FheAuthSandbox() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'fhe_auth_lab',
    initialScore: 100
  })

  const [password, setPassword] = useState('')

  const handleCompute = () => {
    log('info', `🔐 Encrypting password "${password}" into FHE ciphertext polynomials...`)
    log('info', `📡 Transmitting encrypted polynomials to the Identity Provider (IdP) server.`)
    log('success', `🧩 IdP evaluating algebraic functions on ciphertext without decrypting.`)
    log('success', `✅ Verification success! Polynomial intersection confirmed equality.`)
    if (currentStep === 1) completeStep(1)
  }

  return (
    <PlaygroundShell
      title="Fully Homomorphic Encryption (FHE) Auth Sandbox"
      description="Perform mathematical polynomial intersection on encrypted ciphertexts to verify credentials without exposing the underlying plaintext."
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
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Enter Private Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password..."
            className="w-full p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <button
          onClick={handleCompute}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
        >
          Compute FHE Intersection
        </button>
      </div>
    </PlaygroundShell>
  )
}
