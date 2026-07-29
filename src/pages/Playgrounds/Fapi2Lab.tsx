import { useState } from 'react'
import { Send, ShieldCheck, Radio, FileSignature, ToggleLeft, ToggleRight, Play } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { FAPI2_SCENARIOS, type Fapi2ControlKey } from '../../data/fapi2Scenarios'

const STEP_ICONS = [Send, Radio, FileSignature]

export default function Fapi2Lab() {
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'fapi2_lab',
    initialScore: 100,
    maxHints: 3
  })

  const [controls, setControls] = useState<Record<Fapi2ControlKey, boolean>>({
    par: false,
    senderConstrainedToken: false,
    signedResponse: false
  })
  const [lastResult, setLastResult] = useState<Record<Fapi2ControlKey, 'blocked' | 'succeeded' | null>>({
    par: null,
    senderConstrainedToken: null,
    signedResponse: null
  })

  const toggleControl = (key: Fapi2ControlKey) => {
    setControls((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const simulateAttack = (stepIndex: number) => {
    const scenario = FAPI2_SCENARIOS[stepIndex]
    const enabled = controls[scenario.controlKey]

    log('info', `[Attack Attempt] ${scenario.title}: ${scenario.attackDescription}`)

    if (enabled) {
      log('success', scenario.attackBlockedLog)
      setLastResult((prev) => ({ ...prev, [scenario.controlKey]: 'blocked' }))
      if (currentStep === stepIndex) {
        completeStep(stepIndex, `Checkpoint ${stepIndex + 1} verified: "${scenario.controlName}" successfully blocked the attack.`)
      }
      if (stepIndex === FAPI2_SCENARIOS.length - 1 && currentStep >= FAPI2_SCENARIOS.length - 1) {
        finishPlayground('🎉 All three FAPI 2.0 controls verified! PAR, sender-constrained tokens, and signed responses each independently closed a real financial-grade API attack vector.')
      }
    } else {
      log('warning', scenario.attackSuccessLog)
      setLastResult((prev) => ({ ...prev, [scenario.controlKey]: 'succeeded' }))
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Toggle "Use PAR" on before simulating the attack — pushing parameters server-to-server removes them from the tamperable browser URL entirely.',
      'Toggle "Sender-Constrained Tokens" on — binding the token to the legitimate client\'s key means a stolen token is useless without that key.',
      'Toggle "Signed Responses (JARM)" on — a cryptographic signature over the response lets the client detect any tampering, not just rely on TLS in transit.'
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="FAPI 2.0 / Open Banking Security Profile Playground"
      description="Simulate the three controls FAPI 2.0 adds on top of plain OAuth 2.0 for financial-grade APIs — Pushed Authorization Requests, sender-constrained tokens, and signed authorization responses — and watch each one independently block a real attack."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setControls({ par: false, senderConstrainedToken: false, signedResponse: false })
        setLastResult({ par: null, senderConstrainedToken: null, signedResponse: null })
        resetPlayground()
        log('info', 'FAPI 2.0 lab reset. All controls disabled.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {FAPI2_SCENARIOS.map((scenario, idx) => {
          const StepIcon = STEP_ICONS[idx]
          const enabled = controls[scenario.controlKey]
          const result = lastResult[scenario.controlKey]
          return (
            <div key={scenario.id} className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <StepIcon className="w-4 h-4 text-accent-primary" /> Step {idx + 1} — {scenario.title}
                </h3>
                <button
                  onClick={() => toggleControl(scenario.controlKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    enabled ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-bg-nested border-border-subtle text-text-secondary'
                  }`}
                >
                  {enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {scenario.controlName}: {enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-xs text-text-secondary">{scenario.attackDescription}</p>
              <button
                onClick={() => simulateAttack(idx)}
                className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Simulate Attack
              </button>
              {result && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  result === 'blocked' ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                }`}>
                  {result === 'blocked' ? scenario.attackBlockedLog : scenario.attackSuccessLog}
                </div>
              )}
            </div>
          )
        })}

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent-primary" />
            Why Plain OAuth 2.0 Isn't Enough for Banking APIs
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Standard OAuth 2.0 was designed for consumer-scale apps where a compromised session mostly costs a password reset. Financial-grade APIs (Open Banking, Open Finance) move real money and real account data, so FAPI 2.0 layers three additional, independently-verifiable controls on top: parameters never touch a tamperable browser URL (PAR), tokens are cryptographically bound to the client that requested them (mTLS/DPoP) so theft alone isn't enough, and the authorization response itself carries a signature a network attacker can't forge (JARM/JAR).
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
