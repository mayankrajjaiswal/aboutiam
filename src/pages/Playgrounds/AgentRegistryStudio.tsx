import { useState, useMemo } from 'react'
import { CheckCircle2, AlertTriangle, Download, ClipboardList, Workflow, ShieldCheck } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import {
  AGENT_RECORD_FIELDS,
  SAMPLE_AGENT_RECORDS,
  type AgentRecordFieldGroup,
  type SampleAgentRecord,
} from '../../data/agentRegistryModel'

const FIELD_GROUP_ORDER: AgentRecordFieldGroup[] = [
  'Identity', 'Ownership', 'Principal', 'Intent', 'Authority', 'Conditions', 'Provenance', 'Lifecycle',
]

type LifecycleStage = 'unregistered' | 'registered' | 'approved' | 'operating' | 'reviewed' | 'revoked' | 'decommissioned'

const LIFECYCLE_ORDER: { stage: LifecycleStage; label: string }[] = [
  { stage: 'unregistered', label: 'Unregistered' },
  { stage: 'registered', label: 'Registered' },
  { stage: 'approved', label: 'Approved' },
  { stage: 'operating', label: 'Operating' },
  { stage: 'reviewed', label: 'Reviewed' },
  { stage: 'revoked', label: 'Revoked' },
  { stage: 'decommissioned', label: 'Decommissioned' },
]

function buildRecordJson(agent: SampleAgentRecord, fixedFieldIds: Set<string>) {
  const record: Record<string, unknown> = {}
  for (const group of FIELD_GROUP_ORDER) {
    const fields = AGENT_RECORD_FIELDS.filter((f) => f.group === group)
    const groupValues: Record<string, string> = {}
    for (const field of fields) {
      const gap = agent.governanceGaps.find((g) => g.fieldId === field.id)
      if (gap && !fixedFieldIds.has(field.id)) {
        groupValues[field.id] = agent.values[field.id] ?? '(unset — governance gap)'
      } else {
        groupValues[field.id] = agent.values[field.id] ?? field.exampleValue
      }
    }
    record[group] = groupValues
  }
  return record
}

export default function AgentRegistryStudio() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(SAMPLE_AGENT_RECORDS[0].id)
  const agent = useMemo(
    () => SAMPLE_AGENT_RECORDS.find((a) => a.id === selectedAgentId) ?? SAMPLE_AGENT_RECORDS[0],
    [selectedAgentId],
  )

  const [flaggedFieldIds, setFlaggedFieldIds] = useState<Set<string>>(new Set())
  const [fixedFieldIds, setFixedFieldIds] = useState<Set<string>>(new Set())
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>('unregistered')
  const [activeTab, setActiveTab] = useState<'audit' | 'lifecycle'>('audit')

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
    moduleId: 'agent_registry_studio',
    initialScore: 100,
    maxHints: 3,
  })

  const realGapFieldIds = useMemo(() => new Set(agent.governanceGaps.map((g) => g.fieldId)), [agent])

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id)
    setFlaggedFieldIds(new Set())
    setFixedFieldIds(new Set())
    setLifecycleStage('unregistered')
    setActiveTab('audit')
    log('info', `Loaded agent record: ${SAMPLE_AGENT_RECORDS.find((a) => a.id === id)?.name}`)
  }

  const handleToggleFlag = (fieldId: string) => {
    setFlaggedFieldIds((prev) => {
      const next = new Set(prev)
      if (next.has(fieldId)) {
        next.delete(fieldId)
        return next
      }
      next.add(fieldId)
      const isRealGap = realGapFieldIds.has(fieldId)
      const field = AGENT_RECORD_FIELDS.find((f) => f.id === fieldId)
      if (isRealGap) {
        adjustScore(0, `Correctly flagged a governance gap: ${field?.label}`)
        log('success', `Correctly flagged "${field?.label}" as a governance gap.`)
        if (next.size === realGapFieldIds.size && [...next].every((id) => realGapFieldIds.has(id))) {
          completeStep(0, 'All governance gaps identified! Now fix them below.')
        }
      } else {
        adjustScore(-5, `False positive: "${field?.label}" has no governance gap.`)
        log('warning', `"${field?.label}" was flagged, but has no actual governance gap.`)
      }
      return next
    })
  }

  const handleFixGap = (fieldId: string) => {
    if (fixedFieldIds.has(fieldId)) return
    setFixedFieldIds((prev) => new Set(prev).add(fieldId))
    const field = AGENT_RECORD_FIELDS.find((f) => f.id === fieldId)
    const gap = agent.governanceGaps.find((g) => g.fieldId === fieldId)
    adjustScore(5, `Fixed: ${field?.label} — ${gap?.fix}`)
    log('success', `Fixed "${field?.label}": ${gap?.fix}`)

    const allFixed = agent.governanceGaps.every((g) => fixedFieldIds.has(g.fieldId) || g.fieldId === fieldId)
    if (allFixed) {
      completeStep(1, 'Every governance gap has been remediated.')
    }
  }

  const advanceLifecycle = () => {
    const currentIndex = LIFECYCLE_ORDER.findIndex((s) => s.stage === lifecycleStage)
    if (currentIndex >= LIFECYCLE_ORDER.length - 1) return
    const next = LIFECYCLE_ORDER[currentIndex + 1]
    setLifecycleStage(next.stage)
    log('info', `Lifecycle transition: ${LIFECYCLE_ORDER[currentIndex].label} → ${next.label}`)
    if (next.stage === 'decommissioned') {
      completeStep(2, 'Agent lifecycle complete: registered through decommissioned.')
      finishPlayground(`Agent "${agent.name}" fully governed and lifecycle-completed.`)
    }
  }

  const governancePosture = agent.governanceGaps.length === 0
    ? 100
    : Math.round((fixedFieldIds.size / agent.governanceGaps.length) * 100)

  const handleExport = () => {
    const json = JSON.stringify(buildRecordJson(agent, fixedFieldIds), null, 2)
    log('info', 'Exported agent identity record as JSON.')
    if (typeof window !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${agent.id}-identity-record.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <PlaygroundShell
      title="Agent Registry & Lifecycle Studio"
      description="Audit an AI agent's identity record for governance gaps — missing owners, absent expiry, over-broad authority — then remediate them and walk the agent through its full lifecycle from registration to decommission."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Compare each field against its declared purpose — does the value actually match what the agent needs to do its job?')}
      onReset={() => {
        setFlaggedFieldIds(new Set())
        setFixedFieldIds(new Set())
        setLifecycleStage('unregistered')
        setActiveTab('audit')
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* AGENT SELECTOR */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Select a Sample Agent</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_AGENT_RECORDS.map((a) => (
              <button
                key={a.id}
                onClick={() => handleSelectAgent(a.id)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  selectedAgentId === a.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'border-border-subtle bg-bg-card text-text-secondary'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        {/* GOVERNANCE POSTURE METER */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <div className="flex items-center justify-between text-xs font-bold text-text-primary mb-2">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-primary" /> Governance Posture</span>
            <span>{governancePosture}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-bg-nested overflow-hidden">
            <div
              className={`h-full transition-all ${governancePosture === 100 ? 'bg-status-success' : governancePosture >= 50 ? 'bg-status-warning' : 'bg-status-danger'}`}
              style={{ width: `${governancePosture}%` }}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${activeTab === 'audit' ? 'bg-accent-primary text-white' : 'bg-bg-nested/30 text-text-secondary border border-border-subtle'}`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Audit the Record
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${activeTab === 'lifecycle' ? 'bg-accent-primary text-white' : 'bg-bg-nested/30 text-text-secondary border border-border-subtle'}`}
          >
            <Workflow className="w-3.5 h-3.5" /> Run the Lifecycle
          </button>
        </div>

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">
              Click a field to flag it as a governance gap. {flaggedFieldIds.size} flagged · {realGapFieldIds.size} actual gaps in this record.
            </p>
            {FIELD_GROUP_ORDER.map((group) => {
              const fields = AGENT_RECORD_FIELDS.filter((f) => f.group === group)
              return (
                <div key={group} className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
                  <div className="px-3 py-2 bg-bg-nested/30 border-b border-border-subtle text-[10px] font-black text-text-primary uppercase tracking-wider">
                    {group}
                  </div>
                  <div className="divide-y divide-border-subtle/40">
                    {fields.map((field) => {
                      const isFlagged = flaggedFieldIds.has(field.id)
                      const isFixed = fixedFieldIds.has(field.id)
                      const gap = agent.governanceGaps.find((g) => g.fieldId === field.id)
                      const value = agent.values[field.id] ?? '(not set)'
                      return (
                        <div key={field.id} className="p-2.5">
                          <button
                            onClick={() => handleToggleFlag(field.id)}
                            disabled={isFixed}
                            className={`w-full text-left flex items-start justify-between gap-2 text-xs rounded-lg p-1.5 -m-1.5 transition-colors ${
                              isFixed ? 'opacity-60 cursor-default' : isFlagged ? 'bg-status-warning/10' : 'hover:bg-bg-nested/40'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-text-primary">{field.label}</span>
                              <span className="text-text-secondary ml-2">{value}</span>
                            </div>
                            {isFixed ? (
                              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                            ) : isFlagged ? (
                              <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />
                            ) : null}
                          </button>
                          {isFlagged && gap && !isFixed && (
                            <div className="mt-2 p-2 rounded-lg bg-status-warning/5 border border-status-warning/20 text-[11px] text-text-secondary space-y-1.5">
                              <div><span className="font-bold text-status-warning">Issue: </span>{gap.issue}</div>
                              <div><span className="font-bold text-accent-primary">Fix: </span>{gap.fix}</div>
                              <button
                                onClick={() => handleFixGap(field.id)}
                                className="mt-1 px-2.5 py-1 rounded-lg bg-accent-primary text-white text-[10px] font-black hover:bg-accent-hover transition-colors"
                              >
                                Apply Fix
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <button
              onClick={handleExport}
              className="w-full py-2.5 rounded-xl bg-bg-nested border border-border-subtle text-xs font-black text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Agent Identity Record (JSON)
            </button>
          </div>
        )}

        {/* LIFECYCLE TAB */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              Walk the agent through its full lifecycle. Each transition is logged as a real governance system would emit it.
            </p>
            <div className="space-y-2">
              {LIFECYCLE_ORDER.map((s, i) => {
                const currentIndex = LIFECYCLE_ORDER.findIndex((x) => x.stage === lifecycleStage)
                const isPast = i < currentIndex
                const isCurrent = i === currentIndex
                return (
                  <div
                    key={s.stage}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isCurrent ? 'bg-accent-glow border-accent-primary' : isPast ? 'bg-bg-nested/30 border-border-subtle' : 'border-border-subtle/40 opacity-60'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isPast || isCurrent ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-muted'}`}>
                      {isPast ? '✔' : i + 1}
                    </span>
                    <span className="text-xs font-bold text-text-primary">{s.label}</span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={advanceLifecycle}
              disabled={lifecycleStage === 'decommissioned'}
              className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {lifecycleStage === 'decommissioned' ? 'Lifecycle Complete' : 'Advance to Next Stage'}
            </button>
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
