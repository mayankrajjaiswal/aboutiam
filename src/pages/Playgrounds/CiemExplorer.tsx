import { useMemo, useState } from 'react'
import { Network, ShieldAlert, ShieldCheck, Scissors, Users, KeyRound, Database, Building } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { CIEM_SCENARIOS, TOXIC_COMBINATION_RULES } from '../../data/ciemScenarios'
import type { CiemNodeType } from '../../data/ciemScenarios'
import { computeForceLayout } from '../../lib/graph/forcePath'
import {
  computeGrantedPermissions, computeEffectivePermissions, detectToxicCombinations, computeLeastPrivilegePolicy,
} from '../../lib/graph/ciemAnalysis'

const GRAPH_WIDTH = 680
const GRAPH_HEIGHT = 420

const NODE_STYLE: Record<CiemNodeType, { fill: string; icon: typeof Users; label: string }> = {
  role: { fill: '#3b82f6', icon: Users, label: 'IAM Role' },
  policy: { fill: '#a855f7', icon: KeyRound, label: 'Policy' },
  resource: { fill: '#f59e0b', icon: Database, label: 'Resource' },
  account: { fill: '#64748b', icon: Building, label: 'Account' },
}

export default function CiemExplorer() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'ciem_explorer', initialScore: 100, maxHints: 3 })

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [showEffective, setShowEffective] = useState(false)

  const scenario = CIEM_SCENARIOS[scenarioIndex]
  const nodeIds = useMemo(() => scenario.nodes.map((n) => n.id), [scenario])
  const positions = useMemo(() => computeForceLayout(nodeIds, scenario.edges, GRAPH_WIDTH, GRAPH_HEIGHT), [nodeIds, scenario])
  const findings = useMemo(() => detectToxicCombinations(scenario, TOXIC_COMBINATION_RULES), [scenario])

  const handleScenarioChange = (index: number) => {
    setScenarioIndex(index)
    setSelectedRoleId(null)
    log('info', `Loaded scenario: "${CIEM_SCENARIOS[index].title}".`)
    if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: loaded a CIEM scenario.')
  }

  const handleNodeClick = (nodeId: string) => {
    const node = scenario.nodes.find((n) => n.id === nodeId)
    if (node?.type !== 'role') return
    setSelectedRoleId(nodeId)
    log('info', `Selected role "${node.label}" for inspection.`)
  }

  const handleToggleEffective = () => {
    setShowEffective((prev) => !prev)
    if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: compared granted vs. effective permissions.')
  }

  const selectedRoleFindings = selectedRoleId ? findings.filter((f) => f.roleId === selectedRoleId) : []
  const grantedPermissions = selectedRoleId ? computeGrantedPermissions(scenario, selectedRoleId) : []
  const effectivePermissions = selectedRoleId ? computeEffectivePermissions(scenario, selectedRoleId) : []
  const leastPrivilegePermissions = selectedRoleId ? computeLeastPrivilegePolicy(scenario, selectedRoleId) : []

  const handleShrinkToLeastPrivilege = () => {
    if (!selectedRoleId) return
    log('success', `Shrunk "${selectedRoleId}" to least privilege: ${leastPrivilegePermissions.join(', ') || '(no permissions actually used)'}.`)
    adjustScore(10)
    if (currentStep === 2) completeStep(2, 'Checkpoint 3 verified: recalculated a least-privilege policy from the access log.')
  }

  const handleRevealHint = () => {
    const hints = [
      'Click a blue "IAM Role" node to inspect its granted and effective permissions on the right.',
      'Toggle "Show Effective Permissions" — in the cross-account scenario, a role gains permissions it was never directly granted by assuming another role.',
      'Click "Shrink to Least Privilege" on a selected role — it keeps only the permissions the mock access log shows were actually used.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = currentStep >= 2 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Found ${findings.length} toxic combination(s) across the CIEM scenarios and recalculated a least-privilege policy.`)
  }

  return (
    <PlaygroundShell
      title="Cloud Entitlement Graph Explorer (CIEM Lite)"
      description="Inventory hygiene of permissions themselves — click a role to see what it's granted on paper vs. what it can actually reach once cross-account trust and role-assumption chains are traced."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setSelectedRoleId(null)
        setShowEffective(false)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CIEM_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleScenarioChange(idx)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                idx === scenarioIndex ? 'bg-accent-glow border-accent-primary/40 text-accent-primary' : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">{scenario.description}</p>

        <button
          type="button"
          onClick={handleToggleEffective}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            showEffective ? 'bg-accent-glow border-accent-primary/40 text-accent-primary' : 'bg-bg-nested border-border-subtle text-text-secondary'
          }`}
        >
          <Network className="w-3.5 h-3.5" /> {showEffective ? 'Showing Effective Permissions' : 'Showing Granted Permissions Only'}
        </button>

        <div className="rounded-2xl border border-border-subtle bg-bg-nested overflow-x-auto">
          <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="w-full min-w-[520px]" style={{ height: GRAPH_HEIGHT }} role="img" aria-label={`CIEM policy graph for scenario ${scenario.title}`}>
            {scenario.edges.map((edge) => {
              const a = positions[edge.source]
              const b = positions[edge.target]
              if (!a || !b) return null
              return (
                <line
                  key={edge.id}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={edge.type === 'Grants' ? '#f59e0b' : edge.type === 'CanAssume' ? '#3b82f6' : '#64748b'}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  data-testid={`ciem-edge-${edge.id}`}
                />
              )
            })}
            {scenario.nodes.map((node) => {
              const pos = positions[node.id]
              if (!pos) return null
              const style = NODE_STYLE[node.type]
              const isSelected = selectedRoleId === node.id
              const isToxic = node.type === 'role' && findings.some((f) => f.roleId === node.id)
              return (
                <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} onClick={() => handleNodeClick(node.id)} style={{ cursor: node.type === 'role' ? 'pointer' : 'default' }} data-testid={`ciem-node-${node.id}`}>
                  <circle r={12} fill={style.fill} stroke={isToxic ? '#ef4444' : isSelected ? '#facc15' : 'white'} strokeWidth={isToxic || isSelected ? 3 : 1.5} opacity={0.92} />
                  <text y={24} textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" className="text-text-primary select-none">{node.label}</text>
                </g>
              )
            })}
          </svg>
        </div>

        {findings.length > 0 && (
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 space-y-1">
            <span className="text-[11px] font-bold text-status-danger flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Toxic Combinations Detected</span>
            {findings.map((f) => (
              <p key={`${f.roleId}-${f.rule.id}`} className="text-[10px] text-text-secondary pl-5">
                <span className="font-mono font-bold text-text-primary">{f.roleId}</span>: {f.rule.name}
              </p>
            ))}
          </div>
        )}

        {selectedRoleId && (
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Inspecting: {selectedRoleId}</span>
            <div className="text-[11px] text-text-secondary">
              <span className="font-bold text-text-primary">{showEffective ? 'Effective' : 'Granted'} Permissions:</span>{' '}
              {(showEffective ? effectivePermissions : grantedPermissions).join(', ') || 'none'}
            </div>
            {selectedRoleFindings.length > 0 ? (
              <p className="text-[11px] text-status-danger font-semibold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 shrink-0" /> This role has a toxic combination reachable.</p>
            ) : (
              <p className="text-[11px] text-status-success font-semibold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 shrink-0" /> No toxic combination reachable from this role.</p>
            )}
            <button
              type="button"
              onClick={handleShrinkToLeastPrivilege}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-bold transition-all"
            >
              <Scissors className="w-3.5 h-3.5" /> Shrink to Least Privilege
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {canFinish ? 'Finalize This Session' : 'Toggle effective permissions and shrink a role to finalize'}
        </button>
      </div>
    </PlaygroundShell>
  )
}
