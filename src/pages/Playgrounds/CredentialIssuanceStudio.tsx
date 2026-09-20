import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileSignature, Send, ShieldCheck, XCircle, RefreshCw, ShieldAlert } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { OPENID4VC_SCENARIOS } from '../../data/openId4VcScenarios'

type ValidityWindow = 'short' | 'medium' | 'long'
const VALIDITY_LABELS: Record<ValidityWindow, string> = {
  short: '24 hours (frequent reissuance)',
  medium: '90 days',
  long: '5 years (long-lived)',
}

type LifecycleStage = 'define' | 'issued' | 'verified' | 'revoked'

export default function CredentialIssuanceStudio() {
  const [scenarioId, setScenarioId] = useState(OPENID4VC_SCENARIOS[0].id)
  const scenario = useMemo(() => OPENID4VC_SCENARIOS.find((s) => s.id === scenarioId)!, [scenarioId])

  const [validityWindow, setValidityWindow] = useState<ValidityWindow>('medium')
  const [holderBindingEnabled, setHolderBindingEnabled] = useState(true)
  const [statusListEnabled, setStatusListEnabled] = useState(true)
  const [stage, setStage] = useState<LifecycleStage>('define')

  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    adjustScore,
    completeStep,
    finishPlayground,
    resetPlayground,
  } = usePlayground({
    moduleId: 'credential_issuance_studio',
    initialScore: 100,
    maxHints: 3,
  })

  const handleSelectScenario = (id: string) => {
    setScenarioId(id)
    setStage('define')
    log('info', `Selected credential type: ${OPENID4VC_SCENARIOS.find((s) => s.id === id)?.credentialType}`)
  }

  const handleIssue = () => {
    setStage('issued')
    log('info', `${scenario.issuerName} issues "${scenario.credentialType}" via OpenID4VCI.`)
    log('info', `Signing key: root-of-trust-anchored issuer key (see the Crypto Agility Center for hardware root-of-trust context).`)
    log('info', `Validity window: ${VALIDITY_LABELS[validityWindow]}. Holder binding: ${holderBindingEnabled ? 'enabled' : 'disabled'}. Status list: ${statusListEnabled ? 'enabled' : 'disabled'}.`)
    completeStep(0, 'Credential issued to the holder\'s wallet.')

    if (!holderBindingEnabled) {
      adjustScore(-15, 'Issuing without holder binding lets anyone who obtains the credential present it — not just the intended holder.')
      log('warning', 'No holder-binding proof was required at issuance — this credential can be presented by anyone who has a copy of it.')
    }
    if (!statusListEnabled && validityWindow === 'long') {
      adjustScore(-15, 'A long-validity credential with no revocation mechanism cannot be invalidated if it needs to be — a serious operational gap.')
      log('warning', 'Long validity window with no status list: if this credential needs to be revoked early, there is no way to do it.')
    }
  }

  const handleVerify = () => {
    setStage('verified')
    log('success', `${scenario.verifierName} verifies the presentation via OpenID4VP: issuer trust confirmed${holderBindingEnabled ? ', holder binding confirmed' : ' (no holder-binding check available)'}, requested claims: ${scenario.requestedClaims.join(', ')}.`)
    completeStep(1, 'Verifier successfully validated the presented credential.')
  }

  const handleRevoke = () => {
    if (!statusListEnabled) {
      log('error', 'Revocation requested, but no status list was configured at issuance — this credential cannot be revoked. It remains valid until it expires naturally.')
      adjustScore(-10, 'Revocation was needed but impossible because no status-list mechanism was set up.')
      return
    }
    setStage('revoked')
    log('warning', `${scenario.issuerName} updates the status list, marking this credential revoked.`)
    log('info', 'Propagation: any verifier checking the status list from this point forward will see the revoked status. Verifiers with a cached, unrefreshed status list may not see it immediately — this is the real-world propagation lag.')
    completeStep(2, 'Credential successfully revoked via status list.')
    finishPlayground('Full credential lifecycle exercised: issued with holder binding, verified, and successfully revoked via status list.')
  }

  return (
    <PlaygroundShell
      title="Credential Issuance Studio"
      description="Play the issuer role: define a credential type, configure issuance (holder binding, validity window, revocation), issue to a simulated holder wallet, verify from the verifier side, then revoke and observe the propagation trade-off between revocation checkability and verifier-side correlation."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('A long validity window without a status list means you cannot revoke early. A status list gives revocation, but every verifier check against it is a potential correlation point for the issuer to observe — that is the real trade-off.')}
      onReset={() => {
        setValidityWindow('medium')
        setHolderBindingEnabled(true)
        setStatusListEnabled(true)
        setStage('define')
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* CREDENTIAL TYPE SELECTOR */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Define Credential Type</label>
          <select
            aria-label="Select a credential type to issue"
            value={scenarioId}
            onChange={(e) => handleSelectScenario(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary"
          >
            {OPENID4VC_SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.credentialType}</option>)}
          </select>
          <div className="text-[11px] text-text-secondary">
            <span className="font-black text-text-primary">Issuer: </span>{scenario.issuerName}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.keys(scenario.issuedClaims).map((claim) => (
              <span key={claim} className="text-[9px] bg-bg-card border border-border-subtle text-text-secondary font-mono px-1.5 py-0.5 rounded">{claim}</span>
            ))}
          </div>
        </div>

        {/* ISSUANCE CONFIGURATION */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
          <h2 className="text-xs font-black text-text-primary flex items-center gap-1.5"><FileSignature className="w-3.5 h-3.5 text-accent-primary" /> Configure Issuance</h2>
          <div className="space-y-1">
            <label htmlFor="validity-window" className="text-[10px] font-bold text-text-muted uppercase block">Validity Window</label>
            <select
              id="validity-window"
              value={validityWindow}
              onChange={(e) => setValidityWindow(e.target.value as ValidityWindow)}
              className="w-full px-2 py-1.5 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-primary"
            >
              {(Object.keys(VALIDITY_LABELS) as ValidityWindow[]).map((v) => <option key={v} value={v}>{VALIDITY_LABELS[v]}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input type="checkbox" checked={holderBindingEnabled} onChange={(e) => setHolderBindingEnabled(e.target.checked)} />
            Require holder-binding proof at issuance
          </label>
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input type="checkbox" checked={statusListEnabled} onChange={(e) => setStatusListEnabled(e.target.checked)} />
            Enable status-list revocation
          </label>
        </div>

        {/* LIFECYCLE ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleIssue}
            disabled={stage !== 'define'}
            className="py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Issue to Wallet
          </button>
          <button
            onClick={handleVerify}
            disabled={stage !== 'issued'}
            className="py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Presentation
          </button>
          <button
            onClick={handleRevoke}
            disabled={stage !== 'verified'}
            className="py-2.5 rounded-xl bg-status-danger text-white text-xs font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" /> Revoke Credential
          </button>
        </div>

        {stage === 'revoked' && (
          <div className="p-3 rounded-xl bg-status-warning/5 border border-status-warning/30 text-xs text-text-secondary flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            Credential revoked. Trade-off reminder: a shorter validity window (with reissuance) avoids this propagation-lag problem entirely, at the cost of more frequent reissuance traffic.
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <ShieldAlert className="w-4 h-4 text-accent-primary shrink-0" />
          <Link to="/next-gen/crypto-agility?tab=root-of-trust" className="text-xs font-bold text-accent-primary hover:underline">
            See why the issuer's signing key needs hardware root-of-trust protection →
          </Link>
        </div>
      </div>
    </PlaygroundShell>
  )
}
