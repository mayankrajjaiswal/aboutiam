import { useMemo, useState } from 'react'
import { Glasses, ShieldCheck, ShieldX } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { SPATIAL_IDENTITY_RISKS, SPATIAL_IDENTITY_DEFENSES, getSpatialIdentityOutcome } from '../../data/spatialIdentityMatrix'
import type { SpatialIdentityRisk, SpatialIdentityDefense } from '../../data/spatialIdentityMatrix'

const FINALIZE_THRESHOLD = 5

export default function SpatialIdentityLab() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'spatial_identity_lab', initialScore: 100, maxHints: 3 })

  const [risk, setRisk] = useState<SpatialIdentityRisk>(SPATIAL_IDENTITY_RISKS[0].id)
  const [defense, setDefense] = useState<SpatialIdentityDefense>(SPATIAL_IDENTITY_DEFENSES[0].id)
  const [triedPairs, setTriedPairs] = useState<Set<string>>(new Set())

  const outcome = useMemo(() => getSpatialIdentityOutcome(risk, defense), [risk, defense])
  const riskInfo = SPATIAL_IDENTITY_RISKS.find((r) => r.id === risk)!
  const defenseInfo = SPATIAL_IDENTITY_DEFENSES.find((d) => d.id === defense)!

  const handleRunMatchup = () => {
    if (!outcome) return
    const key = `${risk}::${defense}`
    setTriedPairs((prev) => new Set(prev).add(key))
    log(outcome.stopped ? 'success' : 'error', `${defenseInfo.label} vs ${riskInfo.label}: ${outcome.stopped ? 'CAUGHT' : 'MISSED'}.`)
    adjustScore(outcome.stopped ? 5 : 2)

    if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: ran your first risk×defense matchup.')
    const uniquePairs = new Set(triedPairs).add(key)
    if (currentStep === 1 && uniquePairs.size >= FINALIZE_THRESHOLD) {
      completeStep(1, `Checkpoint 2 verified: explored at least ${FINALIZE_THRESHOLD} different risk×defense combinations.`)
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Pick a risk scenario and a defense, then click "Run Matchup" to see whether that defense actually catches that specific risk.',
      'Try Continuous Behavioral Telemetry against both Mid-Session Handoff and the Motion-Capture Replay Bot — the same defense gives opposite results depending on the risk.',
      'Wallet-Based Age Attestation alone never catches anything here — it proves a credential claim, not who is physically wearing the headset. Only pairing it with a live Challenge-Response catches every risk.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = triedPairs.size >= FINALIZE_THRESHOLD && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Explored ${triedPairs.size} risk×defense combinations in the spatial identity lab.`)
  }

  return (
    <PlaygroundShell
      title="Avatar & Spatial Identity Verification Lab"
      description="A headset-only VR/AR session has no front-facing camera and is often a shared device. Pick a risk scenario and a defense to see why wallet-based cryptographic attestation and continuous behavioral telemetry catch very different things — and why neither alone is enough."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setTriedPairs(new Set())
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="risk-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Risk Scenario</label>
            <select
              id="risk-select"
              value={risk}
              onChange={(e) => setRisk(e.target.value as SpatialIdentityRisk)}
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
            >
              {SPATIAL_IDENTITY_RISKS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-text-secondary">{riskInfo.description}</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="defense-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Verification Approach</label>
            <select
              id="defense-select"
              value={defense}
              onChange={(e) => setDefense(e.target.value as SpatialIdentityDefense)}
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
            >
              {SPATIAL_IDENTITY_DEFENSES.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-text-secondary">{defenseInfo.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunMatchup}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Glasses className="w-4 h-4" /> Run Matchup
        </button>

        {outcome && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${outcome.stopped ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
            {outcome.stopped ? <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldX className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <span className="text-xs font-extrabold block">{outcome.stopped ? 'RISK CAUGHT' : 'RISK MISSED'}</span>
              <p className="text-[11px] leading-relaxed mt-1">{outcome.explanation}</p>
            </div>
          </div>
        )}

        <div className="text-[10px] font-mono text-text-muted">
          Combinations explored: {triedPairs.size} / {SPATIAL_IDENTITY_RISKS.length * SPATIAL_IDENTITY_DEFENSES.length}
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {triedPairs.size >= FINALIZE_THRESHOLD ? 'Finalize Lab Session' : `Explore at least ${FINALIZE_THRESHOLD} combinations to finalize (${triedPairs.size}/${FINALIZE_THRESHOLD})`}
        </button>
      </div>
    </PlaygroundShell>
  )
}
