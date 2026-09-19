import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle2, Download } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { CRYPTO_MIGRATION_WORKSTREAMS, type HndlExposure } from '../../data/cryptoAgilityRoadmap'

const HNDL_COLOR: Record<HndlExposure, string> = {
  none: 'bg-bg-nested border-border-subtle text-text-secondary',
  low: 'bg-status-info/10 border-status-info/30 text-status-info',
  medium: 'bg-status-warning/10 border-status-warning/30 text-status-warning',
  high: 'bg-status-danger/10 border-status-danger/30 text-status-danger',
}

// Start with a reasonable-but-imperfect default order (by title) so the
// learner has real reordering work to do, not an already-solved sequence.
const INITIAL_ORDER = [...CRYPTO_MIGRATION_WORKSTREAMS].sort((a, b) => a.title.localeCompare(b.title)).map((w) => w.id)

export default function CryptoMigrationPlanner() {
  const [order, setOrder] = useState<string[]>(INITIAL_ORDER)
  const [hasChecked, setHasChecked] = useState(false)

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
    moduleId: 'crypto_migration_planner',
    initialScore: 100,
    maxHints: 3,
  })

  const workstreamsById = useMemo(
    () => new Map(CRYPTO_MIGRATION_WORKSTREAMS.map((w) => [w.id, w])),
    [],
  )

  const violations = useMemo(() => {
    const positionOf = new Map(order.map((id, i) => [id, i]))
    const found: { workstreamId: string; dependsOnId: string }[] = []
    for (const id of order) {
      const workstream = workstreamsById.get(id)!
      for (const depId of workstream.dependsOn) {
        if ((positionOf.get(depId) ?? -1) > (positionOf.get(id) ?? -1)) {
          found.push({ workstreamId: id, dependsOnId: depId })
        }
      }
    }
    return found
  }, [order, workstreamsById])

  const moveUp = (index: number) => {
    if (index === 0) return
    setOrder((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moveDown = (index: number) => {
    if (index === order.length - 1) return
    setOrder((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleCheckPlan = () => {
    setHasChecked(true)
    log('info', 'Validating the migration sequence against workstream dependencies...')

    if (violations.length === 0) {
      log('success', 'No dependency violations — every workstream is sequenced after everything it depends on.')
      adjustScore(0, 'Dependency-valid roadmap produced.')
      completeStep(0, 'Produced a dependency-valid crypto migration roadmap.')
      finishPlayground('Your roadmap correctly sequences dependent workstreams (e.g. the CA hierarchy and HSM firmware) before anything that depends on them.')
    } else {
      for (const v of violations) {
        const workstream = workstreamsById.get(v.workstreamId)!
        const dep = workstreamsById.get(v.dependsOnId)!
        log('error', `Dependency violation: "${workstream.title}" is sequenced before "${dep.title}", which it depends on.`)
      }
      adjustScore(-10 * violations.length, `${violations.length} dependency violation(s) found — reorder and re-check.`)
    }
  }

  const handleExport = () => {
    const plan = order.map((id, i) => {
      const w = workstreamsById.get(id)!
      return `${i + 1}. ${w.title} (${w.domain}, HNDL: ${w.hndlExposure})`
    }).join('\n')
    log('info', 'Exported the migration roadmap as a plain-text plan.')
    if (typeof window !== 'undefined') {
      const blob = new Blob([plan], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'crypto-migration-roadmap.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <PlaygroundShell
      title="Crypto Migration Planner"
      description="Sequence 10 crypto migration workstreams into a dependency-valid roadmap. You cannot migrate what a component depends on after the component itself — reorder until every dependency comes first, prioritizing high harvest-now-decrypt-later exposure workstreams where the dependency graph allows."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('The root-level workstreams with no dependencies of their own (like the root CA hierarchy and HSM firmware) must come before anything that depends on them, regardless of how urgent those dependent workstreams feel.')}
      onReset={() => {
        setOrder(INITIAL_ORDER)
        setHasChecked(false)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <p className="text-xs text-text-secondary">
          Use the arrows to reorder workstreams (earlier = migrated sooner). A workstream's dependencies are listed under it.
        </p>

        <div className="space-y-1.5">
          {order.map((id, index) => {
            const w = workstreamsById.get(id)!
            const hasViolation = hasChecked && violations.some((v) => v.workstreamId === id)
            return (
              <div key={id} className={`p-3 rounded-xl border space-y-1.5 ${hasViolation ? 'bg-status-danger/5 border-status-danger/30' : 'bg-bg-card border-border-subtle'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary font-black flex items-center justify-center text-[10px] shrink-0">{index + 1}</span>
                  <span className="text-xs font-bold text-text-primary flex-1">{w.title}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border shrink-0 ${HNDL_COLOR[w.hndlExposure]}`}>HNDL: {w.hndlExposure}</span>
                  {hasViolation ? <AlertTriangle className="w-4 h-4 text-status-danger shrink-0" /> : hasChecked ? <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" /> : null}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => moveUp(index)} disabled={index === 0} aria-label={`Move ${w.title} up`} className="p-1 rounded bg-bg-nested border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index === order.length - 1} aria-label={`Move ${w.title} down`} className="p-1 rounded bg-bg-nested border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {w.dependsOn.length > 0 && (
                  <div className="text-[10px] text-text-muted pl-7">
                    Depends on: {w.dependsOn.map((depId) => workstreamsById.get(depId)?.title).join(', ')}
                  </div>
                )}
                {hasViolation && (
                  <div className="text-[10px] text-status-danger pl-7">
                    Sequenced too early — a dependency of this workstream appears later in the plan.
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleCheckPlan}
            className="py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors"
          >
            Check Dependency Validity
          </button>
          <button
            onClick={handleExport}
            className="py-2.5 rounded-xl bg-bg-nested border border-border-subtle text-xs font-black text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Roadmap
          </button>
        </div>

        {hasChecked && (
          <div className={`p-3 rounded-xl border text-xs ${violations.length === 0 ? 'bg-status-success/5 border-status-success/30 text-status-success' : 'bg-status-danger/5 border-status-danger/30 text-status-danger'}`}>
            {violations.length === 0
              ? 'Dependency-valid roadmap — every workstream comes after everything it depends on.'
              : `${violations.length} dependency violation(s) found. Reorder the flagged workstreams and re-check.`}
          </div>
        )}

        <div className="pt-1">
          <Link to="/tools/pqc-readiness-auditor" className="text-xs font-bold text-accent-primary hover:underline">
            Assess your own PQC readiness with the PQC Readiness Auditor →
          </Link>
        </div>
      </div>
    </PlaygroundShell>
  )
}
