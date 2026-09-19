import { useState, useMemo } from 'react'
import { ShieldCheck, XCircle, CheckCircle2, Sliders } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import {
  REGISTRATION_ATTEMPTS,
  type RegistrationAttempt,
  type AttestationConveyance,
  type CertificationLevel,
} from '../../data/attestationPolicyScenarios'

const CERT_RANK: Record<CertificationLevel, number> = {
  uncertified: 0,
  L1: 1,
  L1plus: 2,
  L2: 3,
  L3: 4,
}

const CONVEYANCE_OPTIONS: AttestationConveyance[] = ['none', 'indirect', 'direct', 'enterprise']
const CERT_OPTIONS: CertificationLevel[] = ['uncertified', 'L1', 'L1plus', 'L2', 'L3']

interface Policy {
  minCertLevel: CertificationLevel
  requireResidentKey: boolean
  requireUserVerification: boolean
  minConveyance: AttestationConveyance
}

const CONVEYANCE_RANK: Record<AttestationConveyance, number> = { none: 0, indirect: 1, direct: 2, enterprise: 3 }

function evaluateAttempt(attempt: RegistrationAttempt, policy: Policy): { accepted: boolean; violatedClause: string | null } {
  if (CERT_RANK[attempt.certificationLevel] < CERT_RANK[policy.minCertLevel]) {
    return { accepted: false, violatedClause: `Certification level "${attempt.certificationLevel}" is below the required minimum "${policy.minCertLevel}".` }
  }
  if (policy.requireResidentKey && !attempt.residentKey) {
    return { accepted: false, violatedClause: 'Policy requires a resident (discoverable) key, but this authenticator did not provide one.' }
  }
  if (policy.requireUserVerification && !attempt.userVerified) {
    return { accepted: false, violatedClause: 'Policy requires user verification, but this attempt did not verify the user.' }
  }
  if (CONVEYANCE_RANK[attempt.attestationConveyance] < CONVEYANCE_RANK[policy.minConveyance]) {
    return { accepted: false, violatedClause: `Attestation conveyance "${attempt.attestationConveyance}" does not meet the required minimum "${policy.minConveyance}".` }
  }
  return { accepted: true, violatedClause: null }
}

export default function AttestationPolicyLab() {
  const [policy, setPolicy] = useState<Policy>({
    minCertLevel: 'L2',
    requireResidentKey: false,
    requireUserVerification: true,
    minConveyance: 'direct',
  })
  const [hasRun, setHasRun] = useState(false)

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
    moduleId: 'attestation_policy_lab',
    initialScore: 100,
    maxHints: 3,
  })

  const results = useMemo(
    () => REGISTRATION_ATTEMPTS.map((attempt) => ({ attempt, ...evaluateAttempt(attempt, policy) })),
    [policy],
  )

  const accuracy = useMemo(() => {
    const correct = results.filter((r) => r.accepted === r.attempt.shouldAccept).length
    return Math.round((correct / results.length) * 100)
  }, [results])

  const handleRunEvaluation = () => {
    setHasRun(true)
    log('info', `Evaluating ${REGISTRATION_ATTEMPTS.length} registration attempts against the authored policy...`)
    let correct = 0
    for (const r of results) {
      const matches = r.accepted === r.attempt.shouldAccept
      if (matches) correct++
      log(
        matches ? 'success' : 'warning',
        `${r.attempt.vendorModel}: policy ${r.accepted ? 'ACCEPTS' : 'REJECTS'} — ${matches ? 'correct' : 'mismatch vs. real-world expectation'}.`,
      )
    }
    if (correct === results.length) {
      adjustScore(0, 'Policy correctly classified every registration attempt.')
      completeStep(0, 'Perfect policy: every attempt classified correctly.')
      finishPlayground('Your policy correctly balances certification level, attestation conveyance, resident-key, and user-verification requirements.')
    } else {
      const wrong = results.length - correct
      adjustScore(-5 * wrong, `${wrong} attempt(s) misclassified — refine the policy and re-run.`)
      log('warning', `${wrong} attempt(s) were misclassified. A policy too strict blocks legitimate enrollment; too loose admits weak devices.`)
    }
  }

  return (
    <PlaygroundShell
      title="AAGUID & Attestation Policy Lab"
      description="Author an enterprise authenticator policy — minimum certification level, attestation conveyance, resident-key and user-verification requirements — then run it against 8 simulated registration attempts to see whether it correctly accepts strong devices and rejects weak or stale ones."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('A policy that is too strict will reject legitimate but lower-assurance devices; too loose will admit uncertified or stale-certification devices. Balance minCertLevel against your actual assurance need.')}
      onReset={() => {
        setPolicy({ minCertLevel: 'L2', requireResidentKey: false, requireUserVerification: true, minConveyance: 'direct' })
        setHasRun(false)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* POLICY AUTHORING */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-accent-primary" /> Author Your Policy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="min-cert-level" className="text-[10px] font-bold text-text-muted uppercase block">Minimum Certification Level</label>
              <select
                id="min-cert-level"
                value={policy.minCertLevel}
                onChange={(e) => setPolicy((p) => ({ ...p, minCertLevel: e.target.value as CertificationLevel }))}
                className="w-full px-2 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary"
              >
                {CERT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="min-conveyance" className="text-[10px] font-bold text-text-muted uppercase block">Minimum Attestation Conveyance</label>
              <select
                id="min-conveyance"
                value={policy.minConveyance}
                onChange={(e) => setPolicy((p) => ({ ...p, minConveyance: e.target.value as AttestationConveyance }))}
                className="w-full px-2 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary"
              >
                {CONVEYANCE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={policy.requireResidentKey}
                onChange={(e) => setPolicy((p) => ({ ...p, requireResidentKey: e.target.checked }))}
              />
              Require resident (discoverable) key
            </label>
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={policy.requireUserVerification}
                onChange={(e) => setPolicy((p) => ({ ...p, requireUserVerification: e.target.checked }))}
              />
              Require user verification
            </label>
          </div>
        </div>

        <button
          onClick={handleRunEvaluation}
          className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors"
        >
          Run Policy Against Registration Attempts
        </button>

        {hasRun && (
          <>
            <div className="p-3 rounded-xl bg-accent-glow border border-accent-primary/20 text-xs font-bold text-text-primary text-center">
              Policy Accuracy: {accuracy}%
            </div>
            <div className="space-y-1.5">
              {results.map((r) => {
                const matches = r.accepted === r.attempt.shouldAccept
                return (
                  <div key={r.attempt.id} className={`p-3 rounded-lg border text-xs space-y-1 ${matches ? 'bg-bg-card border-border-subtle' : 'bg-status-danger/5 border-status-danger/20'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text-primary flex-1">{r.attempt.vendorModel}</span>
                      {r.accepted ? <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" /> : <XCircle className="w-4 h-4 text-status-danger shrink-0" />}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      Policy verdict: <strong className={r.accepted ? 'text-status-success' : 'text-status-danger'}>{r.accepted ? 'Accept' : 'Reject'}</strong>
                      {' · '}Real-world expectation: <strong>{r.attempt.shouldAccept ? 'Accept' : 'Reject'}</strong>
                    </div>
                    {r.violatedClause && <div className="text-[10px] text-status-warning">{r.violatedClause}</div>}
                    <div className="text-[10px] text-text-muted">{r.attempt.explanation}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 pt-1">
          <ShieldCheck className="w-4 h-4 text-accent-primary shrink-0" />
          <Link to="/tools/webauthn-decoder" className="text-xs font-bold text-accent-primary hover:underline">
            Decode a sample WebAuthn attestation object →
          </Link>
        </div>
      </div>
    </PlaygroundShell>
  )
}
