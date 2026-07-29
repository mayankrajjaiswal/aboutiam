import { useMemo, useState } from 'react'
import { ArrowRight, AlertTriangle, CheckCircle2, Link2, Trash2 } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { HR_MAPPING_SCENARIOS } from '../../data/hrAttributeMappingFixtures'
import {
  computeMappedRecord, findMappingConflicts, DEFAULT_TRANSFORM_CONFIG,
} from '../../lib/tools/attributeTransform'
import type { AttributeConnection, TransformConfig, TransformType } from '../../lib/tools/attributeTransform'

const TRANSFORM_LABELS: Record<TransformType, string> = {
  direct: 'Direct (1:1)',
  concat: 'Concatenate',
  regex: 'Regex Extract',
  lookup: 'Lookup Table',
}

export default function HrAttributeMapper() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'hr_attribute_mapper', initialScore: 100, maxHints: 3 })

  const [scenarioId, setScenarioId] = useState(HR_MAPPING_SCENARIOS[0].id)
  const scenario = HR_MAPPING_SCENARIOS.find((s) => s.id === scenarioId)!

  const [connections, setConnections] = useState<AttributeConnection[]>([])
  const [transformConfigs, setTransformConfigs] = useState<Record<string, TransformConfig>>({})
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const mappedRecord = useMemo(
    () => computeMappedRecord(connections, transformConfigs, scenario.sampleRecord),
    [connections, transformConfigs, scenario.sampleRecord],
  )
  const conflicts = useMemo(
    () => findMappingConflicts(connections, scenario.targetAttributes, transformConfigs),
    [connections, scenario.targetAttributes, transformConfigs],
  )

  const handleSelectScenario = (id: string) => {
    setScenarioId(id)
    setConnections([])
    setTransformConfigs({})
    setSelectedFieldId(null)
  }

  const handleFieldClick = (fieldId: string) => {
    setSelectedFieldId((prev) => (prev === fieldId ? null : fieldId))
  }

  const handleTargetClick = (targetId: string) => {
    if (!selectedFieldId) {
      log('warning', 'Select an HR field on the left first, then click a target attribute to connect them.')
      return
    }
    const alreadyConnected = connections.some((c) => c.sourceFieldId === selectedFieldId && c.targetAttributeId === targetId)
    if (alreadyConnected) {
      setSelectedFieldId(null)
      return
    }
    setConnections((prev) => [...prev, { sourceFieldId: selectedFieldId, targetAttributeId: targetId }])
    log('success', `Connected "${selectedFieldId}" → "${targetId}".`)
    adjustScore(5)
    setSelectedFieldId(null)

    if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: made your first field connection.')
  }

  const handleRemoveConnection = (connection: AttributeConnection) => {
    setConnections((prev) => prev.filter((c) => c !== connection))
    log('info', `Removed connection "${connection.sourceFieldId}" → "${connection.targetAttributeId}".`)
  }

  const handleTransformChange = (targetId: string, type: TransformType) => {
    setTransformConfigs((prev) => ({ ...prev, [targetId]: { ...prev[targetId], type } }))
    if (type === 'concat' && currentStep === 1) completeStep(1, 'Checkpoint 2 verified: applied a concat transformation.')
    if (type === 'lookup') {
      const sourceId = connections.find((c) => c.targetAttributeId === targetId)?.sourceFieldId
      const table = sourceId ? scenario.suggestedLookupTables[sourceId] : undefined
      if (table) {
        setTransformConfigs((prev) => ({ ...prev, [targetId]: { type: 'lookup', lookupTable: table } }))
        if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: applied a lookup-table transformation.')
      }
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Click an HR field on the left, then click a target attribute on the right to connect them — no drag-and-drop needed.',
      'Connect two HR fields to the same target and switch its transform to "Concatenate" to combine them (e.g. first + last name into displayName).',
      'The Cost_Center/Kostenstelle field has a suggested lookup table — connect it to "department" and switch the transform to "Lookup Table" to translate the code into a real department name.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = conflicts.missingRequired.length === 0 && conflicts.duplicateTargets.length === 0 && connections.length > 0 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Mapped ${connections.length} HR field connections with zero conflicts.`)
  }

  return (
    <PlaygroundShell
      title="HR-to-IdP Attribute Mapper"
      description="Click an HR field, then click a target identity-store attribute to connect them. Apply transformations (concat, regex, lookup table) and watch the live preview and conflict warnings update in real time."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setConnections([])
        setTransformConfigs({})
        setSelectedFieldId(null)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="scenario-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">HR System Scenario</label>
          <select
            id="scenario-select"
            value={scenarioId}
            onChange={(e) => handleSelectScenario(e.target.value)}
            className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
          >
            {HR_MAPPING_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {(conflicts.missingRequired.length > 0 || conflicts.duplicateTargets.length > 0) && (
          <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 space-y-1">
            {conflicts.missingRequired.length > 0 && (
              <p className="text-[11px] text-status-warning font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Missing required mapping: {conflicts.missingRequired.join(', ')}
              </p>
            )}
            {conflicts.duplicateTargets.length > 0 && (
              <p className="text-[11px] text-status-warning font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Ambiguous mapping (multiple sources, not concatenated): {conflicts.duplicateTargets.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">HR Fields ({scenario.name.split(' → ')[0]})</span>
            {scenario.hrFields.map((field) => (
              <button
                key={field.id}
                type="button"
                onClick={() => handleFieldClick(field.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                  selectedFieldId === field.id ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-card border-border-subtle text-text-secondary hover:border-accent-primary/40'
                }`}
              >
                {field.label}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Target Attributes</span>
            {scenario.targetAttributes.map((target) => {
              const targetConnections = connections.filter((c) => c.targetAttributeId === target.id)
              return (
                <div key={target.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleTargetClick(target.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all border flex items-center justify-between gap-2 ${
                      targetConnections.length > 0 ? 'bg-status-success/5 border-status-success/30 text-status-success' : 'bg-bg-card border-border-subtle text-text-secondary hover:border-accent-primary/40'
                    }`}
                  >
                    <span>{target.label}{target.required && <span className="text-status-danger">*</span>}</span>
                    {targetConnections.length > 0 && <Link2 className="w-3 h-3 shrink-0" />}
                  </button>
                  {targetConnections.length > 0 && (
                    <div className="pl-2 space-y-1">
                      {targetConnections.map((c) => (
                        <div key={c.sourceFieldId} className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                          <ArrowRight className="w-2.5 h-2.5 shrink-0" /> {c.sourceFieldId}
                          <button type="button" onClick={() => handleRemoveConnection(c)} aria-label={`Remove connection from ${c.sourceFieldId} to ${target.id}`}>
                            <Trash2 className="w-2.5 h-2.5 text-status-danger" />
                          </button>
                        </div>
                      ))}
                      <select
                        aria-label={`Transform for ${target.id}`}
                        value={(transformConfigs[target.id] ?? DEFAULT_TRANSFORM_CONFIG).type}
                        onChange={(e) => handleTransformChange(target.id, e.target.value as TransformType)}
                        className="text-[10px] p-1 rounded bg-bg-card border border-border-subtle text-text-primary"
                      >
                        {Object.entries(TRANSFORM_LABELS).map(([type, label]) => (
                          <option key={type} value={type}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Live Preview: Sample Record Transformed</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
            {scenario.targetAttributes.map((target) => (
              <div key={target.id} className="flex items-center justify-between border-b border-border-subtle/40 pb-1">
                <span className="text-text-muted">{target.label}:</span>
                <span className="text-text-primary font-semibold truncate max-w-[60%]">{mappedRecord[target.id] || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {canFinish ? 'Finalize Attribute Mapping' : 'Resolve all warnings and map at least one field to finalize'}
        </button>
      </div>
    </PlaygroundShell>
  )
}
