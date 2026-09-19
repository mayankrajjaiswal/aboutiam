import { useState, useMemo } from 'react'
import { ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle, UserCheck } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { AGENTIC_QUADRANTS, type AgenticQuadrantId } from '../../data/agenticEcosystemQuadrants'

type DelegationMechanism = 'token-exchange' | 'rar-constrained' | 'ciba-approval' | 'raw-forward'

const MECHANISM_LABELS: Record<DelegationMechanism, string> = {
  'token-exchange': 'Token Exchange (RFC 8693)',
  'rar-constrained': 'RAR-Constrained Token (RFC 9396)',
  'ciba-approval': 'CIBA Human Approval',
  'raw-forward': 'Raw Scope Forwarding',
}

const MECHANISM_PRESERVES_ATTRIBUTION: Record<DelegationMechanism, boolean> = {
  'token-exchange': true,
  'rar-constrained': true,
  'ciba-approval': true,
  'raw-forward': false,
}

interface HopDefinition {
  id: string
  fromLabel: string
  toLabel: string
  availableScopes: string[]
}

const HOPS: HopDefinition[] = [
  { id: 'user-to-orchestrator', fromLabel: 'User', toLabel: 'Orchestrator Agent', availableScopes: ['claims:read', 'claims:write', 'claims:submit', 'admin:all'] },
  { id: 'orchestrator-to-subagent', fromLabel: 'Orchestrator Agent', toLabel: 'Sub-Agent', availableScopes: ['claims:submit'] },
  { id: 'subagent-to-tool', fromLabel: 'Sub-Agent', toLabel: 'Tool / Downstream API', availableScopes: ['claims:submit'] },
]

interface HopConfig {
  mechanism: DelegationMechanism
  grantedScopes: string[]
}

function buildInitialHopConfig(hop: HopDefinition): HopConfig {
  return { mechanism: 'token-exchange', grantedScopes: [...hop.availableScopes] }
}

export default function DelegationChainAuditor() {
  const [quadrantId, setQuadrantId] = useState<AgenticQuadrantId>('enterprise')
  const quadrant = useMemo(() => AGENTIC_QUADRANTS.find((q) => q.id === quadrantId)!, [quadrantId])

  const [originalScopes] = useState<string[]>(['claims:read', 'claims:write', 'claims:submit', 'admin:all'])
  const [hopConfigs, setHopConfigs] = useState<HopConfig[]>(() => HOPS.map(buildInitialHopConfig))
  const [auditRun, setAuditRun] = useState(false)

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
    moduleId: 'delegation_chain_auditor',
    initialScore: 100,
    maxHints: 3,
  })

  const handleMechanismChange = (hopIndex: number, mechanism: DelegationMechanism) => {
    setHopConfigs((prev) => {
      const next = [...prev]
      next[hopIndex] = { ...next[hopIndex], mechanism }
      // Raw forwarding always carries the full original scope set forward
      if (mechanism === 'raw-forward') {
        next[hopIndex] = { ...next[hopIndex], grantedScopes: [...originalScopes] }
      }
      return next
    })
  }

  const handleToggleScope = (hopIndex: number, scope: string) => {
    setHopConfigs((prev) => {
      const next = [...prev]
      const config = next[hopIndex]
      if (config.mechanism === 'raw-forward') return prev // raw forward isn't scope-editable
      const has = config.grantedScopes.includes(scope)
      next[hopIndex] = {
        ...config,
        grantedScopes: has ? config.grantedScopes.filter((s) => s !== scope) : [...config.grantedScopes, scope],
      }
      return next
    })
  }

  // Authority at each point in the chain
  const authorityAtHop = useMemo(() => {
    const chain: string[][] = [originalScopes]
    for (const config of hopConfigs) {
      chain.push(config.grantedScopes)
    }
    return chain
  }, [originalScopes, hopConfigs])

  const findings = useMemo(() => {
    const items: { hopId: string; type: 'widened' | 'attribution-lost' | 'confused-deputy' | 'ok'; message: string }[] = []
    for (let i = 0; i < HOPS.length; i++) {
      const hop = HOPS[i]
      const config = hopConfigs[i]
      const previousScopes = authorityAtHop[i]
      const widened = config.grantedScopes.some((s) => !previousScopes.includes(s))
      const overBroad = config.grantedScopes.length > hop.availableScopes.length
        && hop.availableScopes.every((s) => config.grantedScopes.includes(s))
        && config.grantedScopes.some((s) => !hop.availableScopes.includes(s))

      if (widened) {
        items.push({ hopId: hop.id, type: 'widened', message: `Authority widened at "${hop.toLabel}" — it now holds a scope its parent hop never had.` })
      }
      if (config.mechanism === 'raw-forward' && overBroad) {
        items.push({ hopId: hop.id, type: 'confused-deputy', message: `"${hop.toLabel}" received the full original token via raw forwarding — a classic confused-deputy risk: it holds far more authority than its task requires.` })
      }
      if (!MECHANISM_PRESERVES_ATTRIBUTION[config.mechanism]) {
        items.push({ hopId: hop.id, type: 'attribution-lost', message: `"${MECHANISM_LABELS[config.mechanism]}" at this hop does not preserve an act/may_act chain — attribution to the original principal is lost.` })
      }
      if (!widened && (config.mechanism !== 'raw-forward' || !overBroad) && MECHANISM_PRESERVES_ATTRIBUTION[config.mechanism]) {
        items.push({ hopId: hop.id, type: 'ok', message: `"${hop.toLabel}" hop is properly scoped and attributable.` })
      }
    }
    return items
  }, [hopConfigs, authorityAtHop])

  const handleRunAudit = () => {
    setAuditRun(true)
    log('info', `Running delegation-chain audit for the "${quadrant.title}" quadrant...`)
    let issuesFound = 0
    for (const finding of findings) {
      if (finding.type === 'ok') {
        log('success', finding.message)
      } else {
        issuesFound++
        log(finding.type === 'attribution-lost' ? 'error' : 'warning', finding.message)
      }
    }
    if (issuesFound === 0) {
      adjustScore(0, 'Chain audit passed: every hop narrows authority and preserves attribution.')
      completeStep(0, 'Delegation chain fully audited with zero findings.')
      finishPlayground('Chain is dependency-safe: authority narrows monotonically and attribution is preserved end-to-end.')
    } else {
      adjustScore(-10 * issuesFound, `${issuesFound} issue(s) found in the delegation chain.`)
      log('warning', `Audit complete: ${issuesFound} issue(s) found. Fix them and re-run.`)
    }
  }

  const finalAccountability = useMemo(() => {
    const attributionIntact = hopConfigs.every((c) => MECHANISM_PRESERVES_ATTRIBUTION[c.mechanism])
    return attributionIntact
      ? 'The original user remains accountable — every hop preserved the act/may_act chain back to them.'
      : `Attribution is broken somewhere in the chain — the final action by "${HOPS[HOPS.length - 1].toLabel}" cannot be reliably traced back to the original user.`
  }, [hopConfigs])

  return (
    <PlaygroundShell
      title="Delegation Chain Auditor"
      description="Build a multi-hop on-behalf-of authority chain — user, orchestrator agent, sub-agent, downstream tool — choose a delegation mechanism at each hop, and see whether authority narrows (safe) or widens (confused deputy), and whether attribution survives to the end."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Raw scope forwarding never narrows authority and never preserves attribution — it is almost always the wrong choice for a sub-agent hop.')}
      onReset={() => {
        setHopConfigs(HOPS.map(buildInitialHopConfig))
        setAuditRun(false)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* QUADRANT SELECTOR */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Ecosystem Quadrant</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AGENTIC_QUADRANTS.map((q) => (
              <button
                key={q.id}
                onClick={() => setQuadrantId(q.id)}
                className={`p-2 rounded-lg border text-[11px] font-bold transition-all ${
                  quadrantId === q.id ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'border-border-subtle bg-bg-card text-text-secondary'
                }`}
              >
                {q.title}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-secondary pt-1">{quadrant.governanceNotes}</p>
        </div>

        {/* CHAIN BUILDER */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-bg-card border border-border-subtle text-xs">
            <span className="font-black text-text-primary">User's Original Authority: </span>
            <span className="text-text-secondary">{originalScopes.join(', ')}</span>
          </div>

          {HOPS.map((hop, i) => {
            const config = hopConfigs[i]
            return (
              <div key={hop.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-text-primary">
                  {hop.fromLabel} <ArrowRight className="w-3.5 h-3.5 text-accent-primary" /> {hop.toLabel}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(MECHANISM_LABELS) as DelegationMechanism[]).map((mech) => (
                    <button
                      key={mech}
                      onClick={() => handleMechanismChange(i, mech)}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        config.mechanism === mech ? 'bg-accent-primary text-white border-accent-primary' : 'border-border-subtle bg-bg-nested text-text-secondary'
                      }`}
                    >
                      {MECHANISM_LABELS[mech]}
                    </button>
                  ))}
                </div>
                {config.mechanism === 'raw-forward' ? (
                  <div className="text-[11px] text-status-warning flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Forwards the entire original token — not editable.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {originalScopes.map((scope) => {
                      const granted = config.grantedScopes.includes(scope)
                      return (
                        <button
                          key={scope}
                          onClick={() => handleToggleScope(i, scope)}
                          className={`px-2 py-1 rounded-md border text-[10px] font-mono transition-all ${
                            granted ? 'bg-accent-glow border-accent-primary/40 text-accent-primary' : 'border-border-subtle bg-bg-nested text-text-muted line-through'
                          }`}
                        >
                          {scope}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={handleRunAudit}
          className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors"
        >
          Run Delegation Chain Audit
        </button>

        {auditRun && (
          <div className="space-y-2">
            {findings.map((f, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  f.type === 'ok' ? 'bg-status-success/5 border-status-success/20 text-text-secondary' :
                  f.type === 'attribution-lost' ? 'bg-status-danger/5 border-status-danger/20 text-text-secondary' :
                  'bg-status-warning/5 border-status-warning/20 text-text-secondary'
                }`}
              >
                {f.type === 'ok' ? <ShieldCheck className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />}
                {f.message}
              </div>
            ))}
            <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 flex items-start gap-2 text-xs text-text-secondary">
              <UserCheck className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-text-primary block mb-0.5">Who is accountable for the final action?</span>
                {finalAccountability}
              </div>
            </div>
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
