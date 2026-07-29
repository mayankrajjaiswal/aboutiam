import { useMemo, useState } from 'react'
import { Network, Users, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { ROLE_MINING_DATASET, ALL_ENTITLEMENTS } from '../../data/roleMiningDataset'
import { proposeRoleCandidates, computeOrphanEntitlements, type RoleCandidate } from '../../lib/analytics/jaccardClustering'

const SIMILARITY_THRESHOLD = 0.6

export default function RoleMiningWorkbench() {
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
  } = usePlayground({ moduleId: 'role_mining_workbench', initialScore: 100, maxHints: 3 })

  const [acceptedRoleIds, setAcceptedRoleIds] = useState<string[]>([])
  const [rejectedRoleIds, setRejectedRoleIds] = useState<string[]>([])

  const candidates = useMemo(() => proposeRoleCandidates(ROLE_MINING_DATASET, SIMILARITY_THRESHOLD), [])
  const acceptedRoles = candidates.filter((c) => acceptedRoleIds.includes(c.id))
  const pendingCandidates = candidates.filter((c) => !acceptedRoleIds.includes(c.id) && !rejectedRoleIds.includes(c.id))

  const orphanEntitlements = useMemo(
    () => computeOrphanEntitlements(ROLE_MINING_DATASET, acceptedRoles),
    [acceptedRoles]
  )

  const singlePurposeRoleCount = acceptedRoles.filter((r) => r.commonEntitlements.length <= 1).length

  const handleAccept = (candidate: RoleCandidate) => {
    setAcceptedRoleIds((prev) => [...prev, candidate.id])
    adjustScore(10, `Accepted role "${candidate.commonEntitlements.join(' + ')}" covering ${candidate.memberUserIds.length} users.`)

    if (currentStep === 0) {
      completeStep(0, 'Checkpoint 1 verified: accepted your first mined role candidate.')
    }

    const nextOrphans = computeOrphanEntitlements(ROLE_MINING_DATASET, [...acceptedRoles, candidate])
    if (currentStep === 1 && nextOrphans.length < ALL_ENTITLEMENTS.length) {
      completeStep(1, 'Checkpoint 2 verified: orphan entitlement count is dropping as roles are accepted.')
    }
  }

  const handleReject = (candidate: RoleCandidate) => {
    setRejectedRoleIds((prev) => [...prev, candidate.id])
    log('info', `Rejected candidate covering ${candidate.memberUserIds.length} users — kept as individual entitlements.`)
  }

  const handleRevealHint = () => {
    const hints = [
      'A role candidate is a group of users whose entitlements overlap enough (Jaccard similarity) to plausibly represent a real job function — look at the "common entitlements" list to judge if it makes business sense.',
      'Accepting every proposed role reduces the "orphan entitlements" counter — those are permissions granted to users but not covered by any accepted role definition.',
      'Try to accept at least 3 role candidates to see the orphan count drop substantially — some noise users will never cluster, and that\'s expected.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = acceptedRoles.length >= 3 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(
      `🎉 Accepted ${acceptedRoles.length} mined roles, reducing orphan entitlements from ${ALL_ENTITLEMENTS.length} to ${orphanEntitlements.length}.`
    )
  }

  return (
    <PlaygroundShell
      title="Role Mining Workbench"
      description="Run Jaccard-similarity clustering over a seeded 30-user entitlement matrix to discover candidate roles — accept, reject, and watch the orphan-entitlement count drop as real role structure emerges."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setAcceptedRoleIds([])
        setRejectedRoleIds([])
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs">
            <div className="text-text-muted flex items-center gap-1"><Users className="w-3 h-3" /> Users</div>
            <div className="font-extrabold text-text-primary">{ROLE_MINING_DATASET.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs">
            <div className="text-text-muted flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted Roles</div>
            <div className="font-extrabold text-text-primary">{acceptedRoles.length}</div>
          </div>
          <div className={`p-3 rounded-xl border text-xs ${orphanEntitlements.length > 5 ? 'bg-status-warning/10 border-status-warning/40' : 'bg-bg-nested border-border-subtle'}`}>
            <div className="text-text-muted flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Orphan Entitlements</div>
            <div className={`font-extrabold ${orphanEntitlements.length > 5 ? 'text-status-warning' : 'text-text-primary'}`}>{orphanEntitlements.length} / {ALL_ENTITLEMENTS.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs">
            <div className="text-text-muted">Role Explosion Risk</div>
            <div className="font-extrabold text-text-primary">{singlePurposeRoleCount}</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Network className="w-4 h-4 text-accent-primary" /> Proposed Role Candidates ({pendingCandidates.length} pending)
          </h4>
          {pendingCandidates.length === 0 ? (
            <p className="text-xs text-text-muted">No more candidates pending review — accept/reject decisions are done.</p>
          ) : (
            <div className="space-y-3">
              {pendingCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-text-primary">{candidate.memberUserIds.length} users, {(candidate.avgSimilarity * 100).toFixed(0)}% avg similarity</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(candidate)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-[11px] font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept as Role
                      </button>
                      <button
                        onClick={() => handleReject(candidate)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-[11px] font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <span className="font-bold">Common entitlements:</span> {candidate.commonEntitlements.join(', ')}
                  </p>
                  <p className="text-[10px] text-text-muted">Members: {candidate.memberUserIds.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {acceptedRoles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Accepted Roles</h4>
            {acceptedRoles.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-status-success/5 border border-status-success/20 text-[11px] text-text-secondary">
                <span className="font-bold text-status-success">{r.memberUserIds.length} users</span> — {r.commonEntitlements.join(', ')}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {acceptedRoles.length >= 3 ? 'Finalize Role Mining Session' : `Accept at least 3 roles to finalize (${acceptedRoles.length}/3)`}
        </button>
      </div>
    </PlaygroundShell>
  )
}
