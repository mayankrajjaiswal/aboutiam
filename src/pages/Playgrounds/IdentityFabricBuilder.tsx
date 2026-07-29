import { useMemo, useState } from 'react'
import { Waypoints, Server, Building2, CheckCircle2, XCircle } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { IDENTITY_FABRIC_SCENARIOS } from '../../data/identityFabricScenarios'
import { attemptWiring } from '../../lib/identityFabric/wiring'
import type { FabricEdge, FabricNodeId } from '../../lib/identityFabric/wiring'

export default function IdentityFabricBuilder() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'identity_fabric_builder', initialScore: 100, maxHints: 3 })

  const [scenarioId, setScenarioId] = useState(IDENTITY_FABRIC_SCENARIOS[0].id)
  const scenario = IDENTITY_FABRIC_SCENARIOS.find((s) => s.id === scenarioId)!

  const [edges, setEdges] = useState<FabricEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<FabricNodeId | null>(null)

  const result = useMemo(() => attemptWiring(edges, scenario), [edges, scenario])

  const handleSelectScenario = (id: string) => {
    setScenarioId(id)
    setEdges([])
    setSelectedNode(null)
  }

  const handleNodeClick = (nodeId: FabricNodeId) => {
    if (!selectedNode) {
      setSelectedNode(nodeId)
      return
    }
    if (selectedNode === nodeId) {
      setSelectedNode(null)
      return
    }
    const newEdge: FabricEdge = { fromId: selectedNode, toId: nodeId }
    const alreadyWired = edges.some(
      (e) => (e.fromId === newEdge.fromId && e.toId === newEdge.toId) || (e.fromId === newEdge.toId && e.toId === newEdge.fromId),
    )
    if (!alreadyWired) {
      setEdges((prev) => [...prev, newEdge])
      log('info', `Wired ${selectedNode} → ${nodeId}.`)

      if (selectedNode === 'app' && nodeId === 'idp') {
        log('error', 'Direct App→IdP wire attempted — protocols do not match.')
        adjustScore(-10)
      } else {
        adjustScore(5)
        if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: made your first wiring connection.')
      }
    }
    setSelectedNode(null)
  }

  const handleReset = () => {
    setEdges([])
    setSelectedNode(null)
    resetPlayground()
  }

  const handleRevealHint = () => {
    const hints = [
      'Click the App node, then click the Orchestration Node to wire them — then do the same for Orchestration → IdP.',
      'Try clicking the App node and then the IdP node directly — the orchestration layer exists precisely because that connection cannot work without a protocol translator.',
      `This scenario needs a "${scenario.appProtocol} → ${scenario.idpProtocol}" translation — once both legs are wired, the trace log will narrate each translation step in order.`,
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = result.success && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Successfully wired the "${scenario.name}" identity fabric scenario.`)
    if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: completed a full App→Orchestration→IdP wiring.')
  }

  const nodeClass = (nodeId: FabricNodeId) => {
    const isSelected = selectedNode === nodeId
    return `p-5 rounded-xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all text-center ${
      isSelected ? 'border-accent-primary bg-accent-glow' : 'border-border-subtle bg-bg-nested hover:border-accent-primary/40'
    }`
  }

  return (
    <PlaygroundShell
      title="Identity Fabric / Orchestration Flow Builder"
      description="Wire a legacy protocol-only app to a modern protocol-only IdP through an orchestration node — model IdP migration without app rewrites and consistent policy enforcement across heterogeneous IdPs."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="fabric-scenario-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Scenario</label>
          <select
            id="fabric-scenario-select"
            value={scenarioId}
            onChange={(e) => handleSelectScenario(e.target.value)}
            className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
          >
            {IDENTITY_FABRIC_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-text-secondary">{scenario.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <button type="button" onClick={() => handleNodeClick('app')} className={nodeClass('app')}>
            <Building2 className="w-8 h-8 text-accent-primary" />
            <span className="text-xs font-bold text-text-primary">{scenario.appName}</span>
            <span className="text-[9px] font-mono text-text-muted uppercase">{scenario.appProtocol}-only</span>
          </button>

          <button type="button" onClick={() => handleNodeClick('orchestration')} className={nodeClass('orchestration')}>
            <Waypoints className="w-8 h-8 text-accent-secondary" />
            <span className="text-xs font-bold text-text-primary">Orchestration Node</span>
            <span className="text-[9px] font-mono text-text-muted uppercase">Protocol Translator</span>
          </button>

          <button type="button" onClick={() => handleNodeClick('idp')} className={nodeClass('idp')}>
            <Server className="w-8 h-8 text-accent-primary" />
            <span className="text-xs font-bold text-text-primary">{scenario.idpName}</span>
            <span className="text-[9px] font-mono text-text-muted uppercase">{scenario.idpProtocol}-only</span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-text-muted">
          Wires: {edges.length === 0 ? 'none yet' : edges.map((e) => `${e.fromId}↔${e.toId}`).join(', ')}
        </div>

        <div className={`p-4 rounded-xl border flex items-start gap-3 ${result.success ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-warning/10 border-status-warning/30 text-status-warning'}`}>
          {result.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-xs font-semibold">{result.message}</p>
        </div>

        {result.translationLog.length > 0 && (
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Translation Steps</span>
            <ol className="space-y-1 list-decimal list-inside">
              {result.translationLog.map((step) => (
                <li key={step} className="text-[11px] text-text-secondary">{step}</li>
              ))}
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {result.success ? 'Finalize This Scenario' : 'Complete the wiring to finalize'}
        </button>
      </div>
    </PlaygroundShell>
  )
}
