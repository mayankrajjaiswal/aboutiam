import { useState } from 'react'
import { Radio, Terminal, GraduationCap, ShieldCheck, ShieldX, CheckCircle2, XCircle } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import {
  RADIUS_CORRECT_SHARED_SECRET, RADIUS_SAMPLE_ATTRIBUTES, TACACS_COMMAND_RULES, EDUGAIN_INSTITUTIONS,
} from '../../data/legacyFederationData'
import { evaluateRadiusAccess, checkTacacsCommand, buildWayfAssertion } from '../../lib/tools/legacyFederation'

type FederationTab = 'radius' | 'tacacs' | 'wayf'

export default function LegacyFederationLab() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'legacy_federation_lab', initialScore: 100, maxHints: 3 })

  const [tab, setTab] = useState<FederationTab>('radius')
  const [sharedSecretGuess, setSharedSecretGuess] = useState('')
  const [radiusResult, setRadiusResult] = useState<ReturnType<typeof evaluateRadiusAccess> | null>(null)
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('')
  const [wayfResult, setWayfResult] = useState<ReturnType<typeof buildWayfAssertion>>(null)

  const handleRadiusSubmit = () => {
    const result = evaluateRadiusAccess(sharedSecretGuess)
    setRadiusResult(result)
    log(result.code === 'Access-Accept' ? 'success' : 'error', `RADIUS ${result.code}: ${result.reason}`)
    if (result.code === 'Access-Accept') {
      adjustScore(10)
      if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: completed a RADIUS Access-Request exchange.')
    } else {
      adjustScore(-3)
    }
  }

  const handleTacacsCommand = (command: string) => {
    const rule = checkTacacsCommand(command, TACACS_COMMAND_RULES)
    log('info', `TACACS+ Authentication phase: admin session already authenticated.`)
    log(rule?.allowed ? 'success' : 'error', `TACACS+ Authorization phase: "${command}" — ${rule?.allowed ? 'PERMITTED' : 'DENIED'} (${rule?.description ?? 'no rule defined'}).`)
    log('info', `TACACS+ Accounting phase: command attempt logged for "${command}".`)
    adjustScore(rule?.allowed ? 5 : 2)
    if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: observed TACACS+\'s separated authentication/authorization/accounting phases.')
  }

  const handleWayfSelect = (institutionId: string) => {
    setSelectedInstitutionId(institutionId)
    const result = buildWayfAssertion(institutionId, EDUGAIN_INSTITUTIONS)
    setWayfResult(result)
    if (result) {
      log('success', `Redirected to home IdP (${result.institution.homeIdpEndpoint}), authenticated, and returned a SAML assertion the Shibboleth SP consumed.`)
      adjustScore(10)
      if (currentStep === 2) completeStep(2, 'Checkpoint 3 verified: completed a WAYF discovery-service redirect and SP consumption.')
    }
  }

  const handleRevealHint = () => {
    const hints = [
      `The correct RADIUS shared secret is "${RADIUS_CORRECT_SHARED_SECRET}" — try it, then try a wrong one to see the Access-Reject.`,
      'TACACS+ logs three separate phases per action, unlike RADIUS\'s combined AAA — click both commands to see one get denied.',
      'Pick any institution from the WAYF picker — it simulates a redirect to that institution\'s home IdP, then returns a SAML assertion the Shibboleth SP consumes.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = currentStep >= 2 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground('🎉 Explored RADIUS AAA, TACACS+, and Shibboleth/eduGAIN federation — the protocols that ran enterprise network auth before OAuth/SAML dominance.')
  }

  return (
    <PlaygroundShell
      title="Legacy & Academic Federation Playground"
      description="RADIUS AAA, TACACS+, and Shibboleth/CAS/eduGAIN discovery — the protocols still running enormous amounts of real enterprise network-auth and academic-federation infrastructure today."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setRadiusResult(null)
        setSelectedInstitutionId('')
        setWayfResult(null)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab('radius')} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${tab === 'radius' ? 'bg-accent-glow border-accent-primary/40 text-accent-primary' : 'bg-bg-nested border-border-subtle text-text-secondary'}`}>
            <Radio className="w-3.5 h-3.5" /> RADIUS AAA
          </button>
          <button type="button" onClick={() => setTab('tacacs')} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${tab === 'tacacs' ? 'bg-accent-glow border-accent-primary/40 text-accent-primary' : 'bg-bg-nested border-border-subtle text-text-secondary'}`}>
            <Terminal className="w-3.5 h-3.5" /> TACACS+
          </button>
          <button type="button" onClick={() => setTab('wayf')} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${tab === 'wayf' ? 'bg-accent-glow border-accent-primary/40 text-accent-primary' : 'bg-bg-nested border-border-subtle text-text-secondary'}`}>
            <GraduationCap className="w-3.5 h-3.5" /> Shibboleth / eduGAIN
          </button>
        </div>

        {tab === 'radius' && (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">Simulate an 802.1X-style network device login. RADIUS combines Authentication, Authorization, and Accounting into one Access-Request/Access-Accept exchange.</p>
            <div className="space-y-1.5">
              <label htmlFor="radius-secret" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Shared Secret</label>
              <input
                id="radius-secret"
                type="text"
                value={sharedSecretGuess}
                onChange={(e) => setSharedSecretGuess(e.target.value)}
                className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs font-mono"
                placeholder="Enter the NAS shared secret..."
              />
            </div>
            <button type="button" onClick={handleRadiusSubmit} className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold">Send Access-Request</button>
            {radiusResult && (
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${radiusResult.code === 'Access-Accept' ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
                {radiusResult.code === 'Access-Accept' ? <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldX className="w-4 h-4 shrink-0 mt-0.5" />}
                <div className="text-xs"><span className="font-extrabold block">{radiusResult.code}</span>{radiusResult.reason}</div>
              </div>
            )}
            <div className="p-3 rounded-xl bg-bg-nested border border-border-subtle text-[10px] font-mono text-text-secondary space-y-1">
              {RADIUS_SAMPLE_ATTRIBUTES.map((attr) => (
                <div key={attr.name}><span className="text-text-muted">{attr.name}:</span> {attr.value}</div>
              ))}
            </div>
          </div>
        )}

        {tab === 'tacacs' && (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">Unlike RADIUS's combined AAA, TACACS+ separately logs Authentication, Authorization, and Accounting as distinct phases — try a command below.</p>
            <div className="flex gap-2 flex-wrap">
              {TACACS_COMMAND_RULES.map((rule) => (
                <button
                  key={rule.command}
                  type="button"
                  onClick={() => handleTacacsCommand(rule.command)}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-nested text-text-secondary text-[11px] font-mono font-bold hover:border-accent-primary/40"
                >
                  {rule.command}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'wayf' && (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">Pick your home institution — the WAYF ("Where Are You From") discovery service redirects you to its IdP, authenticates you, and returns a SAML assertion the Shibboleth SP consumes.</p>
            <div className="space-y-1.5">
              <label htmlFor="wayf-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Home Institution</label>
              <select
                id="wayf-select"
                value={selectedInstitutionId}
                onChange={(e) => handleWayfSelect(e.target.value)}
                className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
              >
                <option value="">— Select your institution —</option>
                {EDUGAIN_INSTITUTIONS.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            {wayfResult && (
              <div className="p-3 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-extrabold block">SAML Assertion Consumed by SP</span>
                  <span className="font-mono block mt-1">subject: {wayfResult.assertion.subject}</span>
                  <span className="font-mono block">issuer: {wayfResult.assertion.issuer}</span>
                  <span className="font-mono block">audience: {wayfResult.assertion.audience}</span>
                </div>
              </div>
            )}
            {selectedInstitutionId && !wayfResult && (
              <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger flex items-start gap-2.5">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">Institution not found in the eduGAIN metadata list.</span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {canFinish ? 'Finalize This Session' : 'Complete all 3 tabs to finalize'}
        </button>
      </div>
    </PlaygroundShell>
  )
}
