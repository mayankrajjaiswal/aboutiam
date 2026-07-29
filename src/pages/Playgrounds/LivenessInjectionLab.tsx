import { useMemo, useState } from 'react'
import { ScanFace, ShieldCheck, ShieldX } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { LIVENESS_ATTACKS, LIVENESS_DEFENSES, getLivenessOutcome } from '../../data/livenessAttackMatrix'
import type { LivenessAttack, LivenessDefense } from '../../data/livenessAttackMatrix'

export default function LivenessInjectionLab() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'liveness_injection_lab', initialScore: 100, maxHints: 3 })

  const [attack, setAttack] = useState<LivenessAttack>(LIVENESS_ATTACKS[0].id)
  const [defense, setDefense] = useState<LivenessDefense>(LIVENESS_DEFENSES[0].id)
  const [triedPairs, setTriedPairs] = useState<Set<string>>(new Set())

  const outcome = useMemo(() => getLivenessOutcome(attack, defense), [attack, defense])
  const attackInfo = LIVENESS_ATTACKS.find((a) => a.id === attack)!
  const defenseInfo = LIVENESS_DEFENSES.find((d) => d.id === defense)!

  const handleRunMatchup = () => {
    if (!outcome) return
    const key = `${attack}::${defense}`
    setTriedPairs((prev) => new Set(prev).add(key))
    log(outcome.stopped ? 'success' : 'error', `${defenseInfo.label} vs ${attackInfo.label}: ${outcome.stopped ? 'BLOCKED' : 'BYPASSED'}.`)
    adjustScore(outcome.stopped ? 5 : 2)

    if (currentStep === 0) completeStep(0, 'Checkpoint 1 verified: ran your first attack×defense matchup.')
    const uniquePairs = new Set(triedPairs).add(key)
    if (currentStep === 1 && uniquePairs.size >= 4) {
      completeStep(1, 'Checkpoint 2 verified: explored at least 4 different attack×defense combinations.')
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Pick an attack and a defense, then click "Run Matchup" to see whether that defense actually stops that specific attack.',
      'Try the Challenge-Response Flash Sequence against both Presentation Replay and Camera-Feed Injection — the same defense gives opposite results depending on the attack.',
      'Only Full ISO 30107-3 PAD Scoring stops every attack — it is the only defense that combines depth, texture, and hardware-integrity signals together.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = triedPairs.size >= 4 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Explored ${triedPairs.size} attack×defense combinations in the liveness lab.`)
  }

  return (
    <PlaygroundShell
      title="Liveness Detection & Injection Attack Lab"
      description="Pick an attack vector and a defense, then see which one wins and why — 2026's decisive shift is from presentation attacks to camera-feed injection, which many older defenses never anticipated."
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
            <label htmlFor="attack-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Attack Vector</label>
            <select
              id="attack-select"
              value={attack}
              onChange={(e) => setAttack(e.target.value as LivenessAttack)}
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
            >
              {LIVENESS_ATTACKS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-text-secondary">{attackInfo.description}</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="defense-select" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Defense Stack</label>
            <select
              id="defense-select"
              value={defense}
              onChange={(e) => setDefense(e.target.value as LivenessDefense)}
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-text-primary text-xs"
            >
              {LIVENESS_DEFENSES.map((d) => (
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
          <ScanFace className="w-4 h-4" /> Run Matchup
        </button>

        {outcome && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${outcome.stopped ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
            {outcome.stopped ? <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldX className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <span className="text-xs font-extrabold block">{outcome.stopped ? 'ATTACK BLOCKED' : 'ATTACK BYPASSED DEFENSE'}</span>
              <p className="text-[11px] leading-relaxed mt-1">{outcome.explanation}</p>
            </div>
          </div>
        )}

        <div className="text-[10px] font-mono text-text-muted">
          Combinations explored: {triedPairs.size} / {LIVENESS_ATTACKS.length * LIVENESS_DEFENSES.length}
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {triedPairs.size >= 4 ? 'Finalize Lab Session' : `Explore at least 4 combinations to finalize (${triedPairs.size}/4)`}
        </button>
      </div>
    </PlaygroundShell>
  )
}
