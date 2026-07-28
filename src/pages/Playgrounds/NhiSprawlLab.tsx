import { useState, useMemo } from 'react'
import { RotateCw, Trash2, Check, Filter, AlertTriangle, ShieldAlert } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { NHI_RECORDS, TOTAL_NHI_COUNT, type NhiRecord, type NhiAction, type NhiType } from '../../data/nhiSprawlRecords'

const CORRECT_POINTS = 5
const INCORRECT_POINTS = -8
const CASCADE_FAILURE_PENALTY = -7

type TypeFilter = 'all' | NhiType
type StatusFilter = 'all' | 'pending' | 'actioned'
type SortKey = 'risk' | 'lastUsed' | 'age' | 'owner'

const ACTION_LABEL: Record<NhiAction, string> = {
  rotate: 'Rotate',
  revoke: 'Revoke',
  keep: 'Keep'
}

function riskWeight(record: NhiRecord): number {
  const privilegeWeight = { low: 0, medium: 1, high: 2, admin: 3 }[record.privilege]
  return (record.isOrphaned ? 5 : 0) + privilegeWeight + Math.floor(record.ageDays / 200) + Math.floor(record.lastUsedDaysAgo / 100)
}

export default function NhiSprawlLab() {
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
    resetPlayground
  } = usePlayground({
    moduleId: 'nhi_sprawl_lab',
    initialScore: 100,
    maxHints: 3
  })

  const [actions, setActions] = useState<Record<string, NhiAction>>({})
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [sortKey, setSortKey] = useState<SortKey>('risk')

  const actionedCount = Object.keys(actions).length
  const totalRecords = NHI_RECORDS.length

  const visibleRecords = useMemo(() => {
    let records = NHI_RECORDS.filter((r) => typeFilter === 'all' || r.type === typeFilter)
    records = records.filter((r) => {
      if (statusFilter === 'pending') return !actions[r.id]
      if (statusFilter === 'actioned') return !!actions[r.id]
      return true
    })
    records = [...records].sort((a, b) => {
      if (sortKey === 'risk') return riskWeight(b) - riskWeight(a)
      if (sortKey === 'lastUsed') return b.lastUsedDaysAgo - a.lastUsedDaysAgo
      if (sortKey === 'age') return b.ageDays - a.ageDays
      return (a.owner ?? 'zzz-orphaned').localeCompare(b.owner ?? 'zzz-orphaned')
    })
    return records
  }, [typeFilter, statusFilter, sortKey, actions])

  const applyAction = (record: NhiRecord, action: NhiAction) => {
    if (actions[record.id]) return

    const isCorrect = action === record.correctAction
    const causesCascadeFailure = action === 'revoke' && record.hasDependents && !isCorrect

    setActions((prev) => ({ ...prev, [record.id]: action }))

    if (isCorrect) {
      adjustScore(CORRECT_POINTS, `✓ Correct: ${ACTION_LABEL[action]} on ${record.id} (${record.owner ?? 'orphaned'}) — ${record.rationale}`)
    } else if (causesCascadeFailure) {
      adjustScore(
        INCORRECT_POINTS + CASCADE_FAILURE_PENALTY,
        `🚨 Cascading failure: Revoking ${record.id} broke a dependent service that still relied on it. Correct action was "${ACTION_LABEL[record.correctAction]}" — ${record.rationale}`
      )
    } else {
      adjustScore(
        INCORRECT_POINTS,
        `✗ Incorrect: chose "${ACTION_LABEL[action]}" for ${record.id}, correct action was "${ACTION_LABEL[record.correctAction]}" — ${record.rationale}`
      )
    }

    const nextActionedCount = actionedCount + 1
    if (currentStep === 0 && nextActionedCount >= 10) {
      completeStep(0, 'Checkpoint 1 verified: Triaged the first 10 non-human identities in the fleet.')
    }

    const orphanedIds = NHI_RECORDS.filter((r) => r.isOrphaned).map((r) => r.id)
    const nextActions = { ...actions, [record.id]: action }
    const allOrphansHandled = orphanedIds.every((id) => !!nextActions[id])
    if (currentStep <= 1 && allOrphansHandled) {
      const foundOrphans = orphanedIds.filter((id) => nextActions[id] === 'revoke').length
      completeStep(1, `Checkpoint 2 verified: Processed all ${orphanedIds.length} orphaned identities (${foundOrphans}/${orphanedIds.length} correctly revoked).`)
    }

    if (nextActionedCount >= totalRecords) {
      const correctCount = NHI_RECORDS.filter((r) => nextActions[r.id] === r.correctAction).length
      const orphansFound = orphanedIds.filter((id) => nextActions[id] === 'revoke').length
      const remediatedAges = NHI_RECORDS.filter((r) => nextActions[r.id] !== 'revoke').map((r) => (nextActions[r.id] === 'rotate' ? 0 : r.ageDays))
      const meanAgeBefore = Math.round(NHI_RECORDS.reduce((sum, r) => sum + r.ageDays, 0) / NHI_RECORDS.length)
      const meanAgeAfter = remediatedAges.length > 0 ? Math.round(remediatedAges.reduce((sum, age) => sum + age, 0) / remediatedAges.length) : 0
      finishPlayground(
        `🎉 Fleet triage complete! Correctly triaged ${correctCount}/${totalRecords} identities. Found ${orphansFound}/${orphanedIds.length} planted orphans. Mean credential age reduced from ${meanAgeBefore} to ${meanAgeAfter} days.`
      )
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Sort by "Highest Risk First" and start with any record that has no owner — an orphaned credential should always be revoked.',
      'A credential older than 365 days that is still being actively used (used within the last month) needs to be rotated, not revoked — revoking it would break whatever still depends on it.',
      'Before you click Revoke, check the "Has Dependents" flag. Revoking a credential with active dependents when it should have been kept or rotated triggers a cascading service failure and a bigger score penalty.'
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="NHI Sprawl Cleanup Game"
      description="Triage a seeded fleet of service accounts, API keys, and CI/CD tokens against a real non-human-identity governance rubric: rotate what's stale, revoke what's orphaned or over-privileged, and keep what's legitimately still in use."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setActions({})
        resetPlayground()
        log('info', 'Sprawl fleet reset. All identities restored to pending triage.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-text-secondary">
            Simulating <span className="font-bold text-text-primary">{TOTAL_NHI_COUNT.toLocaleString()}</span> total non-human identities across the org — showing the top <span className="font-bold text-text-primary">{totalRecords}</span> by risk.
          </div>
          <div className="text-xs font-bold text-text-primary bg-bg-card border border-border-subtle px-3 py-1 rounded-lg">
            {actionedCount} / {totalRecords} triaged
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="text-xs p-1.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
          >
            <option value="all">All Types</option>
            <option value="service-account">Service Accounts</option>
            <option value="api-key">API Keys</option>
            <option value="ci-token">CI/CD Tokens</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs p-1.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
          >
            <option value="pending">Pending Only</option>
            <option value="actioned">Actioned Only</option>
            <option value="all">All Records</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-xs p-1.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
          >
            <option value="risk">Sort: Highest Risk First</option>
            <option value="lastUsed">Sort: Least Recently Used</option>
            <option value="age">Sort: Oldest Credential</option>
            <option value="owner">Sort: Owner</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-xs">
            <thead className="bg-bg-nested">
              <tr>
                <th className="p-2.5 text-left font-bold text-text-secondary">Identity</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Owner</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Privilege</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Age</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Last Used</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Dependents</th>
                <th className="p-2.5 text-left font-bold text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-text-muted">No identities match the current filters.</td>
                </tr>
              )}
              {visibleRecords.map((record) => {
                const takenAction = actions[record.id]
                return (
                  <tr key={record.id} className="border-t border-border-subtle/50">
                    <td className="p-2.5">
                      <div className="font-mono font-bold text-text-primary">{record.id}</div>
                      <div className="text-[10px] text-text-muted">{record.type}</div>
                    </td>
                    <td className="p-2.5">
                      {record.owner ?? (
                        <span className="text-status-danger font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Orphaned
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 capitalize">{record.privilege}</td>
                    <td className="p-2.5">{record.ageDays}d</td>
                    <td className="p-2.5">{record.lastUsedDaysAgo}d ago</td>
                    <td className="p-2.5">{record.hasDependents ? 'Yes' : 'No'}</td>
                    <td className="p-2.5">
                      {takenAction ? (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          takenAction === record.correctAction ? 'bg-status-success/15 text-status-success' : 'bg-status-danger/15 text-status-danger'
                        }`}>
                          {ACTION_LABEL[takenAction]}
                        </span>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => applyAction(record, 'rotate')}
                            title="Rotate"
                            className="p-1.5 rounded-lg bg-status-info/10 hover:bg-status-info/20 text-status-info border border-status-info/25"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => applyAction(record, 'revoke')}
                            title="Revoke"
                            className="p-1.5 rounded-lg bg-status-danger/10 hover:bg-status-danger/20 text-status-danger border border-status-danger/25"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => applyAction(record, 'keep')}
                            title="Keep"
                            className="p-1.5 rounded-lg bg-status-success/10 hover:bg-status-success/20 text-status-success border border-status-success/25"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-accent-primary" />
            Why NHI Sprawl Matters
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Non-human identities — service accounts, API keys, CI/CD tokens — now outnumber human identities in most enterprises many times over, and unlike human accounts they rarely get deprovisioned when a project ends. Orphaned credentials with no accountable owner, over-privileged keys nobody has touched in months, and secrets that were issued once and never rotated are the quiet inventory-hygiene failures that turn into supply-chain and lateral-movement incidents.
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
