import { useMemo, useState } from 'react'
import { Factory, ShieldCheck, ShieldAlert, Skull, Cpu, MonitorSmartphone, Radio, KeyRound } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { OT_ICS_TOPOLOGY, FLAT_NETWORK_DWELL_DAYS, SEGMENTED_NETWORK_DWELL_DAYS } from '../../data/otIcsScenarios'
import { computeReachableNodes } from '../../lib/tools/otIcsSegmentation'
import type { SegmentationMode } from '../../lib/tools/otIcsSegmentation'
import type { OtIcsNodeType } from '../../data/otIcsScenarios'

const NODE_ICONS: Record<OtIcsNodeType, typeof Cpu> = {
  plc: Cpu,
  hmi: MonitorSmartphone,
  sensor: Radio,
  'engineering-workstation': KeyRound,
  'boundary-gateway': ShieldCheck,
}

export default function OtIcsIdentityLab() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'ot_ics_identity_lab', initialScore: 100, maxHints: 3 })

  const [mode, setMode] = useState<SegmentationMode>('flat')
  const [compromisedId, setCompromisedId] = useState<string | null>(null)

  const reachable = useMemo(
    () => (compromisedId ? computeReachableNodes(OT_ICS_TOPOLOGY, compromisedId, mode) : []),
    [compromisedId, mode],
  )

  const handleSetMode = (newMode: SegmentationMode) => {
    setMode(newMode)
    log('info', `Switched to ${newMode === 'flat' ? 'Flat Network' : 'Identity-Based Microsegmentation'} mode.`)
    if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: toggled the segmentation mode.')
  }

  const handleTriggerRansomware = (nodeId: string) => {
    setCompromisedId(nodeId)
    const node = OT_ICS_TOPOLOGY.nodes.find((n) => n.id === nodeId)!
    log('error', `Ransomware injected at "${node.label}".`)
    const spread = computeReachableNodes(OT_ICS_TOPOLOGY, nodeId, mode)
    log(mode === 'flat' ? 'error' : 'success', `Lateral movement reached ${spread.length} of ${OT_ICS_TOPOLOGY.nodes.length} nodes in ${mode} mode.`)
    adjustScore(mode === 'segmented' ? 10 : -5)

    if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: ran the ransomware-injection simulation.')
  }

  const handleRevealHint = () => {
    const hints = [
      'Toggle between "Flat Network" and "Identity-Based Microsegmentation" to see the difference in blast radius before triggering the attack.',
      'Click an HMI node to inject ransomware there, then compare the reachable-node count between the two modes.',
      'Most OT/ICS field devices (PLCs, HMIs, sensors) structurally cannot authenticate — in segmented mode, an edge crossing a zone boundary only survives if BOTH endpoints can prove identity.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = compromisedId !== null && mode === 'segmented' && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Demonstrated blast-radius reduction from ${OT_ICS_TOPOLOGY.nodes.length} nodes down to ${reachable.length} with microsegmentation.`)
  }

  return (
    <PlaygroundShell
      title="OT/ICS Device Identity & Segmentation Simulator"
      description="Most factory-floor devices structurally cannot authenticate. Toggle flat vs. identity-based microsegmentation, then trigger a ransomware injection to compare lateral-movement blast radius."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setMode('flat')
        setCompromisedId(null)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Factory className="w-4 h-4 text-accent-primary" /> Factory-Floor Topology
          </span>
          <div role="group" aria-label="Segmentation mode" className="inline-flex rounded-lg border border-border-subtle overflow-hidden text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSetMode('flat')}
              aria-pressed={mode === 'flat'}
              className={`px-3 py-1.5 transition ${mode === 'flat' ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-secondary hover:bg-border-subtle'}`}
            >
              Flat Network
            </button>
            <button
              type="button"
              onClick={() => handleSetMode('segmented')}
              aria-pressed={mode === 'segmented'}
              className={`px-3 py-1.5 transition ${mode === 'segmented' ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-secondary hover:bg-border-subtle'}`}
            >
              Identity-Based Microsegmentation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OT_ICS_TOPOLOGY.nodes.map((node) => {
            const Icon = NODE_ICONS[node.type]
            const isCompromised = compromisedId === node.id
            const isReachable = reachable.includes(node.id) && !isCompromised
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleTriggerRansomware(node.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  isCompromised ? 'bg-status-danger/15 border-status-danger text-status-danger' :
                  isReachable ? 'bg-status-warning/10 border-status-warning/40 text-status-warning' :
                  'bg-bg-nested border-border-subtle text-text-secondary hover:border-accent-primary/40'
                }`}
              >
                {isCompromised ? <Skull className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                <span className="text-[10px] font-bold leading-tight">{node.label}</span>
                <span className="text-[8px] font-mono uppercase text-text-muted">{node.canAuthenticate ? 'Can Authenticate' : 'Cannot Authenticate'}</span>
              </button>
            )
          })}
        </div>

        {compromisedId && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${mode === 'segmented' ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
            {mode === 'segmented' ? <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="text-xs">
              <span className="font-extrabold block">
                Lateral movement reached {reachable.length} of {OT_ICS_TOPOLOGY.nodes.length} nodes
              </span>
              <span className="block mt-1">
                {mode === 'flat'
                  ? 'The flat network has no internal boundaries — ransomware at one compromised device spreads to nearly everything.'
                  : 'Microsegmentation traps the compromised device inside its own zone, since it cannot prove identity to cross the boundary.'}
              </span>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-bg-nested/60 border border-border-subtle grid grid-cols-2 gap-3 text-center">
          <div>
            <span className="text-[9px] uppercase font-bold text-text-muted block">Flat Network Avg. Dwell Time</span>
            <span className="text-sm font-mono font-black text-status-danger">~{FLAT_NETWORK_DWELL_DAYS} days</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-text-muted block">Fully Segmented Avg. Dwell Time</span>
            <span className="text-sm font-mono font-black text-status-success">~{SEGMENTED_NETWORK_DWELL_DAYS} days</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {canFinish ? 'Finalize This Simulation' : 'Trigger ransomware in Microsegmentation mode to finalize'}
        </button>
      </div>
    </PlaygroundShell>
  )
}
