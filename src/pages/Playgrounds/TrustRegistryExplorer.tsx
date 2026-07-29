import { useMemo, useState } from 'react'
import { ShieldCheck, ShieldX, Landmark, KeyRound, Ban } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { OPENID4VC_SCENARIOS } from '../../data/openId4VcScenarios'
import { TRUST_REGISTRIES, verifyIssuerAuthorization } from '../../data/trustRegistryScenarios'
import type { TrustRegistry, IssuerStatus } from '../../data/trustRegistryScenarios'

const STATUS_STYLES: Record<IssuerStatus, string> = {
  active: 'bg-status-success/10 text-status-success border-status-success/30',
  revoked: 'bg-status-danger/10 text-status-danger border-status-danger/30',
  suspended: 'bg-status-warning/10 text-status-warning border-status-warning/30',
}

export default function TrustRegistryExplorer() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'trust_registry_explorer', initialScore: 100, maxHints: 3 })

  const [registries, setRegistries] = useState<TrustRegistry[]>(TRUST_REGISTRIES)
  const [credentialId, setCredentialId] = useState(OPENID4VC_SCENARIOS[0].id)
  const [verifierRegistryId, setVerifierRegistryId] = useState(TRUST_REGISTRIES[0].id)

  const credential = OPENID4VC_SCENARIOS.find((s) => s.id === credentialId)!
  const outcome = useMemo(
    () => verifyIssuerAuthorization(credential.issuerName, verifierRegistryId, registries),
    [credential.issuerName, verifierRegistryId, registries],
  )

  const handleVerify = () => {
    log(outcome.authorized ? 'success' : 'error', `Verification against "${verifierRegistryId}": ${outcome.reason}`)
    adjustScore(outcome.authorized ? 5 : 3)
    if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: ran your first cross-registry verification.')
  }

  const handleRevokeIssuer = (registryId: string, issuerName: string) => {
    setRegistries((prev) =>
      prev.map((r) =>
        r.id === registryId
          ? { ...r, issuers: r.issuers.map((i) => (i.issuerName === issuerName ? { ...i, status: 'revoked' } : i)) }
          : r,
      ),
    )
    log('error', `Issuer "${issuerName}" revoked in ${registryId}. Previously-issued credentials from it will now fail authorization checks, even though their signatures are still mathematically valid.`)
    if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: revoked an issuer mid-session and watched verification flip.')
  }

  const handleRevealHint = () => {
    const hints = [
      'Pick a credential and a verifier\'s trust registry, then click "Verify" — authorization depends on whether that specific registry lists the issuer as active, not just on the signature.',
      'Try verifying the university diploma credential against the French registry — the issuer is authorized in Germany but the cross-border recognition gap means France doesn\'t automatically trust it.',
      'Revoke an issuer in a registry, then re-run the same verification — the credential\'s signature is still cryptographically valid, but authorization now fails.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = currentStep >= 1 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground('🎉 Explored issuer authorization and revocation across multiple trust registries.')
  }

  return (
    <PlaygroundShell
      title="Trust Registry & Issuer Governance Explorer"
      description="A verifier checks not just a credential's cryptographic validity, but whether the issuer is currently authorized in the registry it trusts — including cross-border recognition gaps and revocation scenarios."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setRegistries(TRUST_REGISTRIES)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="credential-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Presented Credential</label>
            <select
              id="credential-select"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
            >
              {OPENID4VC_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>{s.credentialType} (issuer: {s.issuerName})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="verifier-registry-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Verifier's Trusted Registry</label>
            <select
              id="verifier-registry-select"
              value={verifierRegistryId}
              onChange={(e) => setVerifierRegistryId(e.target.value)}
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
            >
              {registries.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" /> Verify
        </button>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Two Independent Checks</span>
          <div className="flex items-center gap-2 text-xs text-status-success font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" /> Signature cryptographically valid: YES (unchanged by registry status)
          </div>
          <div className={`flex items-center gap-2 text-xs font-semibold ${outcome.authorized ? 'text-status-success' : 'text-status-danger'}`}>
            {outcome.authorized ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <ShieldX className="w-4 h-4 shrink-0" />}
            Issuer authorized in trusted registry: {outcome.authorized ? 'YES' : 'NO'}
          </div>
          <p className="text-[11px] text-text-secondary pl-6">{outcome.reason}</p>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-accent-primary" /> Registry Browser
          </span>
          {registries.map((registry) => (
            <div key={registry.id} className="p-3 rounded-xl bg-bg-nested border border-border-subtle space-y-1.5">
              <span className="text-xs font-bold text-text-primary">{registry.name}</span>
              {registry.issuers.length === 0 ? (
                <p className="text-[10px] text-text-muted italic">No issuers registered directly.</p>
              ) : (
                registry.issuers.map((issuer) => (
                  <div key={issuer.issuerName} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-secondary">{issuer.issuerName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${STATUS_STYLES[issuer.status]}`}>{issuer.status}</span>
                      {issuer.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeIssuer(registry.id, issuer.issuerName)}
                          className="p-1 rounded bg-status-danger/10 border border-status-danger/30 text-status-danger"
                          aria-label={`Revoke ${issuer.issuerName} in ${registry.name}`}
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {canFinish ? 'Finalize This Session' : 'Verify a credential and revoke an issuer to finalize'}
        </button>
      </div>
    </PlaygroundShell>
  )
}
