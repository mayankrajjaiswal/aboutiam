import { useState } from 'react'
import { Server, Key, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { generateRsaKeyPair, exportPublicKeyJwk } from '../../lib/tools/jwt'

export default function DpopLab() {
  const { score, currentStep, isCompleted, logs, hintsRevealed, log, revealHint, completeStep, resetPlayground } = usePlayground({
    moduleId: 'dpop-sandbox',
    initialScore: 100,
    maxHints: 3
  })

  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null)
  const [jwk, setJwk] = useState<Record<string, unknown> | null>(null)
  const [activeStage, setActiveStage] = useState<'idle' | 'generating' | 'ready' | 'attacking' | 'validating'>('idle')
  const [attackSuccess, setAttackSuccess] = useState<boolean | null>(null)

  const handleGenerateKey = async () => {
    setActiveStage('generating')
    log('info', '[Browser] Generating RSA-2048 Keypair for DPoP...')
    try {
      const kp = await generateRsaKeyPair()
      const pubJwk = await exportPublicKeyJwk(kp.publicKey, 'dpop-key-1')
      setKeyPair(kp)
      setJwk(pubJwk as Record<string, unknown>)
      log('success', '[Browser] Keypair generated securely in WebCrypto extractable=false enclave.')
      setActiveStage('ready')
      if (currentStep === 0) completeStep(0)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      log('error', `[Browser] Key generation failed: ${msg}`)
      setActiveStage('idle')
    }
  }

  const simulateValidRequest = () => {
    log('info', '[Client] Signing DPoP Proof for POST /api/transfer...')
    setTimeout(() => {
      log('success', '[API Gateway] Validated DPoP Signature matching the bound access token. 200 OK.')
      if (currentStep === 1) completeStep(1)
    }, 1000)
  }

  const simulateReplayAttack = () => {
    setActiveStage('attacking')
    log('warning', '[Attacker] Intercepted Access Token. Attempting to replay token from a different device...')
    setTimeout(() => {
      log('error', '[API Gateway] 🚨 ACCESS DENIED: SENDER UNCONSTRAINED. The attacker cannot produce a valid DPoP proof without the private key!')
      setAttackSuccess(false)
      if (currentStep === 2) completeStep(2)
      setTimeout(() => setActiveStage('ready'), 2000)
    }, 1500)
  }

  const handleReset = () => {
    resetPlayground()
    setKeyPair(null)
    setJwk(null)
    setActiveStage('idle')
    setAttackSuccess(null)
  }

  return (
    <PlaygroundShell
      title="DPoP (Proof-of-Possession) Sandbox"
      description="Prevent session hijacking using Sender-Constrained Tokens (RFC 9449). Generate a local browser keypair, bind it to an access token, and watch the API Gateway instantly block stolen tokens that lack the private DPoP signature."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Generate an ECDSA keypair, then try the replay attack to see DPoP block it.')}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl shadow-sm hover-cyber-glow flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/20">
              <Key className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-text-primary">Browser DPoP Enclave</h3>
              <p className="text-xs text-text-secondary">WebCrypto Non-Extractable Private Key</p>
            </div>
            
            {!keyPair ? (
              <button
                onClick={handleGenerateKey}
                disabled={activeStage === 'generating'}
                className="px-6 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 hover-cyber-glow"
              >
                {activeStage === 'generating' ? 'Generating...' : 'Generate DPoP Keypair'}
              </button>
            ) : (
              <div className="w-full bg-slate-950 border border-border-subtle/50 rounded-lg p-3 text-[9px] font-mono text-emerald-400 break-all overflow-hidden">
                <span className="text-text-muted uppercase block mb-1">Public JWK (Bound to Token):</span>
                {JSON.stringify(jwk)}
              </div>
            )}
          </div>

          <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl shadow-sm hover-cyber-glow flex flex-col relative overflow-hidden">
            <h3 className="text-sm font-bold text-text-primary mb-4 border-b border-border-subtle pb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-accent-primary" /> DPoP API Gateway
            </h3>
            
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <button
                onClick={simulateValidRequest}
                disabled={!keyPair || activeStage === 'attacking'}
                className="w-full py-3 rounded-xl border border-accent-primary/30 bg-bg-sidebar hover:bg-accent-glow text-accent-primary text-xs font-bold transition-all flex justify-between items-center px-4 disabled:opacity-50"
              >
                <span>Send Valid DPoP Request</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                onClick={simulateReplayAttack}
                disabled={!keyPair || activeStage === 'attacking'}
                className={`w-full py-3 rounded-xl border border-status-danger/30 bg-bg-sidebar hover:bg-status-danger/10 text-status-danger text-xs font-bold transition-all flex justify-between items-center px-4 disabled:opacity-50 ${activeStage === 'attacking' ? 'animate-pulse' : ''}`}
              >
                <span>Simulate Token Replay Attack</span>
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
            
            {attackSuccess === false && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-status-danger text-white text-xs font-black uppercase tracking-wider text-center animate-bounce">
                🚨 ACCESS DENIED: SENDER UNCONSTRAINED
              </div>
            )}
          </div>
        </div>
      </div>
    </PlaygroundShell>
  )
}
