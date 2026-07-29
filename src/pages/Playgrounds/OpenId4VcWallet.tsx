import { useState, useMemo } from 'react'
import { Landmark, Wallet, Send, ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { OPENID4VC_SCENARIOS } from '../../data/openId4VcScenarios'
import { generateRsaKeyPair } from '../../lib/tools/jwt'
import { issueSdJwtCredential, buildPresentation, type IssuedCredential } from '../../lib/tools/sdJwtIssue'
import { parseSdJwt, type ParsedSdJwt } from '../../lib/tools/sdJwt'

const WIZARD_STEPS = ['Issuance (OID4VCI)', 'Wallet Storage', 'Presentation (OID4VP)'] as const

export default function OpenId4VcWallet() {
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
    moduleId: 'openid4vc_wallet_studio',
    initialScore: 100,
    maxHints: 3
  })

  const [wizardStep, setWizardStep] = useState(0)
  const [selectedScenarioId, setSelectedScenarioId] = useState(OPENID4VC_SCENARIOS[0].id)
  const scenario = OPENID4VC_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? OPENID4VC_SCENARIOS[0]

  const [credential, setCredential] = useState<IssuedCredential | null>(null)
  const [isIssuing, setIsIssuing] = useState(false)
  const [walletSelection, setWalletSelection] = useState<Set<string>>(new Set())

  const [presentation, setPresentation] = useState<{ raw: string; parsed: ParsedSdJwt } | null>(null)
  const [isPresenting, setIsPresenting] = useState(false)

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id)
    setCredential(null)
    setWalletSelection(new Set())
    setPresentation(null)
  }

  const handleIssue = async () => {
    setIsIssuing(true)
    log('info', `[OID4VCI] ${scenario.issuerName} begins issuance of a "${scenario.credentialType}" credential...`)
    const keyPair = await generateRsaKeyPair()
    const issued = await issueSdJwtCredential(
      scenario.issuedClaims,
      { iss: scenario.issuerName, vct: scenario.credentialType, iat: Math.floor(Date.now() / 1000) },
      keyPair.privateKey,
      'issuer-key-1'
    )
    setCredential(issued)
    setWalletSelection(new Set(Object.keys(scenario.issuedClaims)))
    setIsIssuing(false)
    log('success', `[OID4VCI] Credential issued with ${issued.disclosures.length} independently-salted disclosures: ${issued.disclosures.map((d) => d.claimName).join(', ')}.`)
    if (currentStep === 0) {
      completeStep(0, 'Checkpoint 1 verified: Issued an SD-JWT credential with independently disclosable claims.')
    }
  }

  const toggleClaim = (claimName: string) => {
    setWalletSelection((prev) => {
      const next = new Set(prev)
      if (next.has(claimName)) next.delete(claimName)
      else next.add(claimName)
      return next
    })
  }

  const handlePresent = async () => {
    if (!credential) return
    setIsPresenting(true)
    const disclosuresToReveal = credential.disclosures.filter((d) => walletSelection.has(d.claimName))
    const raw = buildPresentation(credential.issuerJwt, disclosuresToReveal)
    log('info', `[OID4VP] Wallet sends a presentation to "${scenario.verifierName}" revealing: ${disclosuresToReveal.map((d) => d.claimName).join(', ') || '(nothing)'}.`)

    const parsed = await parseSdJwt(raw)
    setPresentation({ raw, parsed })
    setIsPresenting(false)

    const revealedNames = new Set(parsed.disclosures.map((d) => d.key).filter((k): k is string => k !== null))
    const missing = scenario.requestedClaims.filter((c) => !revealedNames.has(c))
    const overDisclosed = [...revealedNames].filter((c) => !scenario.requestedClaims.includes(c))

    if (missing.length > 0) {
      log('error', `[OID4VP] Verifier log: MISSING requested claim(s): ${missing.join(', ')}. The verifier cannot complete its check.`)
    }
    if (overDisclosed.length > 0) {
      log('warning', `[OID4VP] Verifier log: received claim(s) it never asked for: ${overDisclosed.join(', ')}. This is an over-disclosure risk — the wallet leaked more than necessary.`)
    }
    if (missing.length === 0 && overDisclosed.length === 0) {
      log('success', `[OID4VP] Verifier log: received exactly the requested claim(s) — ${scenario.requestedClaims.join(', ')} — and nothing else. Minimal disclosure achieved.`)
    }

    if (currentStep === 1 && missing.length === 0) {
      completeStep(1, 'Checkpoint 2 verified: Verifier received every claim it requested.')
    }
    if (currentStep <= 2 && missing.length === 0 && overDisclosed.length === 0) {
      finishPlayground(`🎉 Perfect selective disclosure! "${scenario.verifierName}" received exactly the claims it requested — nothing more, nothing less.`)
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Issue the credential in Step 1 first — every claim you set there becomes an independently salted, independently disclosable piece of the SD-JWT.',
      `The verifier in this scenario only asked for: ${scenario.requestedClaims.join(', ')}. In the Wallet Storage step, uncheck every other claim before presenting.`,
      'Checking a claim the verifier never requested is a real-world over-disclosure risk — even though the wallet technically "could" reveal it, minimal disclosure means only sending what was actually asked for.'
    ]
    revealHint(hints[hintsRevealed])
  }

  const revealedNamesInPresentation = useMemo(
    () => new Set(presentation?.parsed.disclosures.map((d) => d.key).filter((k): k is string => k !== null) ?? []),
    [presentation]
  )

  return (
    <PlaygroundShell
      title="OpenID4VC Wallet Studio"
      description="Issue a real SD-JWT verifiable credential, store it in a mock wallet, and selectively disclose only the claims a verifier actually requested — the OID4VCI/OID4VP flow behind eIDAS 2.0 EUDI Wallets."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setWizardStep(0)
        setCredential(null)
        setWalletSelection(new Set())
        setPresentation(null)
        resetPlayground()
        log('info', 'Wallet studio reset.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Select Scenario</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OPENID4VC_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(s.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScenarioId === s.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow-sm' : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
                }`}
              >
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-[11px] font-normal opacity-85 mt-1">{s.issuerName} → {s.verifierName}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {WIZARD_STEPS.map((label, idx) => (
            <button
              key={label}
              onClick={() => setWizardStep(idx)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                wizardStep === idx ? 'bg-accent-primary text-white shadow-sm' : 'bg-bg-nested text-text-secondary hover:bg-bg-card'
              }`}
            >
              {idx + 1}. {label}
            </button>
          ))}
        </div>

        {wizardStep === 0 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Landmark className="w-4 h-4 text-accent-primary" /> Step 1 — Issuance</h3>
            <p className="text-xs text-text-secondary">"{scenario.issuerName}" issues a "{scenario.credentialType}" with {Object.keys(scenario.issuedClaims).length} claims, each independently salted and hashed as a separate SD-JWT disclosure.</p>
            <button
              onClick={handleIssue}
              disabled={isIssuing}
              className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              {isIssuing ? 'Issuing...' : credential ? 'Re-issue Credential' : 'Issue Credential'}
            </button>
            {credential && (
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Issuer-Signed SD-JWT (compact)</div>
                <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-40 overflow-y-auto break-all whitespace-pre-wrap">{buildPresentation(credential.issuerJwt, credential.disclosures)}</pre>
              </div>
            )}
          </div>
        )}

        {wizardStep === 1 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Wallet className="w-4 h-4 text-accent-primary" /> Step 2 — Wallet Storage</h3>
            {!credential ? (
              <p className="text-xs text-text-muted italic">Issue a credential in Step 1 first.</p>
            ) : (
              <div className="space-y-2">
                {credential.disclosures.map((d) => (
                  <label key={d.claimName} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs cursor-pointer">
                    <input type="checkbox" checked={walletSelection.has(d.claimName)} onChange={() => toggleClaim(d.claimName)} />
                    <span className="font-mono font-bold text-text-primary">{d.claimName}</span>
                    <span className="text-text-secondary">= {String(d.claimValue)}</span>
                    {scenario.requestedClaims.includes(d.claimName) && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-status-info/10 text-status-info">Requested</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {wizardStep === 2 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Send className="w-4 h-4 text-accent-primary" /> Step 3 — Presentation</h3>
            <div className="p-3 rounded-xl bg-bg-nested border border-dashed border-border-subtle text-xs text-text-secondary">
              <span className="font-bold text-text-primary">"{scenario.verifierName}"</span> requests: <span className="font-mono">{scenario.requestedClaims.join(', ')}</span>
              <p className="mt-1">{scenario.verifierPurpose}</p>
            </div>
            <button
              onClick={handlePresent}
              disabled={!credential || isPresenting}
              className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              {!credential ? 'Issue a credential first' : isPresenting ? 'Sending...' : 'Send Presentation to Verifier'}
            </button>

            {presentation && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">What the Verifier Can See</div>
                <div className="space-y-1.5">
                  {scenario.requestedClaims.map((claimName) => {
                    const received = revealedNamesInPresentation.has(claimName)
                    return (
                      <div key={claimName} className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${received ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
                        {received ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="font-mono font-bold">{claimName}</span>
                        <span>{received ? '— received' : '— missing!'}</span>
                      </div>
                    )
                  })}
                  {[...revealedNamesInPresentation].filter((c) => !scenario.requestedClaims.includes(c)).map((claimName) => (
                    <div key={claimName} className="p-2.5 rounded-lg border bg-status-warning/10 border-status-warning/30 text-status-warning text-xs flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">{claimName}</span>
                      <span>— over-disclosed (never requested!)</span>
                    </div>
                  ))}
                  {Object.keys(scenario.issuedClaims).filter((c) => !revealedNamesInPresentation.has(c) && !scenario.requestedClaims.includes(c)).length > 0 && (
                    <div className="p-2.5 rounded-lg border bg-bg-nested border-border-subtle text-text-muted text-xs flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Every other issued claim stays hidden from this verifier entirely.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
