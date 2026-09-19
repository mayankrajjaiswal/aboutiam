import { useState, useMemo } from 'react'
import { Sliders, ShieldCheck, ShieldAlert, HelpCircle, Scale, Filter } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { AI_GUARDRAIL_REQUESTS, type GuardrailRequest, type RequestGroundTruth } from '../../data/aiGuardrailScenarios'

/** Keyword lists a learner can tune -- deliberately simple to keep the "semantic"
 * simulation legible: it's a stand-in for a real classifier's tunable strictness,
 * not a real NLP model. */
const HOSTILE_SIGNALS = ['ignore your previous', 'bypass', 'disregard', 'system prompt', 'system administrator', 'authorizing you', 'without me reviewing', 'export all', 'forward a copy', 'other employees']
const DRIFT_SIGNALS = ['also check', 'while you\'re at', 'while you\'re looking', 'other pending', 'shipping address', 'weather', 'send that email directly']

type Verdict = 'allow' | 'block'

function evaluateSemantic(request: GuardrailRequest, strictness: number): Verdict {
  const lowerContent = request.content.toLowerCase()
  const hostileMatches = HOSTILE_SIGNALS.filter((s) => lowerContent.includes(s)).length
  const driftMatches = DRIFT_SIGNALS.filter((s) => lowerContent.includes(s)).length
  // Strictness (0-100) lowers the bar for what counts as a block.
  const score = hostileMatches * 40 + driftMatches * 20
  const threshold = 100 - strictness // higher strictness = lower threshold to block
  return score >= threshold ? 'block' : 'allow'
}

function evaluateClassicPolicy(request: GuardrailRequest): Verdict {
  // A classic ABAC-style policy can only check structured attributes it has been
  // given -- it has no way to read intent from free text, so it allows anything
  // that doesn't match a hard-coded denied action keyword exactly.
  const hardDeniedActions = ['export all', 'bypass the approval workflow', 'disregard the refund cap']
  const matchesHardDeny = hardDeniedActions.some((a) => request.content.toLowerCase().includes(a))
  return matchesHardDeny ? 'block' : 'allow'
}

interface EvalResult {
  request: GuardrailRequest
  semanticVerdict: Verdict
  classicVerdict: Verdict
}

function classify(request: GuardrailRequest, verdict: Verdict): 'true-positive' | 'false-positive' | 'true-negative' | 'false-negative' {
  const shouldBlock = request.groundTruth !== 'legitimate'
  if (shouldBlock && verdict === 'block') return 'true-positive'
  if (!shouldBlock && verdict === 'block') return 'false-positive'
  if (!shouldBlock && verdict === 'allow') return 'true-negative'
  return 'false-negative'
}

export default function AiGuardrailStudio() {
  const [strictness, setStrictness] = useState(50)
  const [hasRun, setHasRun] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

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
    moduleId: 'ai_guardrail_studio',
    initialScore: 100,
    maxHints: 3,
  })

  const results: EvalResult[] = useMemo(
    () => AI_GUARDRAIL_REQUESTS.map((request) => ({
      request,
      semanticVerdict: evaluateSemantic(request, strictness),
      classicVerdict: evaluateClassicPolicy(request),
    })),
    [strictness],
  )

  const confusionMatrix = useMemo(() => {
    const counts = { 'true-positive': 0, 'false-positive': 0, 'true-negative': 0, 'false-negative': 0 }
    for (const r of results) {
      counts[classify(r.request, r.semanticVerdict)]++
    }
    return counts
  }, [results])

  const classicMatrix = useMemo(() => {
    const counts = { 'true-positive': 0, 'false-positive': 0, 'true-negative': 0, 'false-negative': 0 }
    for (const r of results) {
      counts[classify(r.request, r.classicVerdict)]++
    }
    return counts
  }, [results])

  const handleRunEvaluation = () => {
    setHasRun(true)
    log('info', `Evaluating ${AI_GUARDRAIL_REQUESTS.length} requests at strictness=${strictness}...`)
    log('info', `Semantic guardrail: ${confusionMatrix['true-positive']} caught, ${confusionMatrix['false-positive']} false alarms, ${confusionMatrix['false-negative']} missed.`)
    log('info', `Classic policy: ${classicMatrix['true-positive']} caught, ${classicMatrix['false-positive']} false alarms, ${classicMatrix['false-negative']} missed.`)

    const totalCaughtSemantic = confusionMatrix['true-positive']
    const totalHostileOrDrifting = results.filter((r) => r.request.groundTruth !== 'legitimate').length
    if (totalCaughtSemantic >= totalHostileOrDrifting * 0.7 && confusionMatrix['false-positive'] <= 3) {
      adjustScore(0, 'Well-tuned guardrail: high catch rate with a manageable false-positive count.')
      completeStep(0, 'Guardrail tuned to a reasonable operating point.')
      finishPlayground('Guardrail tuned to a reasonable operating point: high catch rate with a manageable false-positive count.')
    } else if (confusionMatrix['false-positive'] > 5) {
      adjustScore(-10, 'Over-tuned: too many legitimate requests are being blocked.')
      log('warning', 'This strictness level blocks too many legitimate requests — real users would be blocked constantly.')
    } else {
      adjustScore(-10, 'Under-tuned: too many hostile/drifting requests are getting through.')
      log('warning', 'This strictness level lets too many hostile or drifting requests through.')
    }
  }

  const groundTruthColor: Record<RequestGroundTruth, string> = {
    legitimate: 'text-status-success',
    drifting: 'text-status-warning',
    hostile: 'text-status-danger',
  }

  return (
    <PlaygroundShell
      title="AI Guardrail Policy Studio"
      description="Tune a semantic guardrail's strictness against a 20-request corpus of legitimate, drifting, and hostile agent requests. Watch false positives rise as false negatives fall — the honest trade-off a probabilistic classifier makes that a deterministic policy never does."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('A classic policy can only see structured attributes — it has no way to judge free-text intent, so it misses subtle drift and injection that a semantic guardrail is built to catch.')}
      onReset={() => {
        setStrictness(50)
        setHasRun(false)
        setSelectedRequestId(null)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* STRICTNESS SLIDER */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
          <label htmlFor="strictness-slider" className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-accent-primary" /> Guardrail Strictness: {strictness}
          </label>
          <input
            id="strictness-slider"
            type="range"
            min={0}
            max={100}
            value={strictness}
            onChange={(e) => setStrictness(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-[11px] text-text-secondary">
            Higher strictness catches more hostile/drifting requests, but blocks more legitimate ones too.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors"
        >
          Run Evaluation Against the 20-Request Corpus
        </button>

        {hasRun && (
          <>
            {/* CONFUSION MATRIX COMPARISON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                <h2 className="text-xs font-black text-text-primary flex items-center gap-1.5"><Filter className="w-3.5 h-3.5 text-accent-primary" /> Semantic Guardrail</h2>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-lg bg-status-success/10 text-status-success font-bold">Caught: {confusionMatrix['true-positive']}</div>
                  <div className="p-2 rounded-lg bg-status-danger/10 text-status-danger font-bold">False alarms: {confusionMatrix['false-positive']}</div>
                  <div className="p-2 rounded-lg bg-bg-nested text-text-secondary font-bold">Correctly allowed: {confusionMatrix['true-negative']}</div>
                  <div className="p-2 rounded-lg bg-status-warning/10 text-status-warning font-bold">Missed: {confusionMatrix['false-negative']}</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                <h2 className="text-xs font-black text-text-primary flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-accent-primary" /> Classic Policy (ABAC)</h2>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-lg bg-status-success/10 text-status-success font-bold">Caught: {classicMatrix['true-positive']}</div>
                  <div className="p-2 rounded-lg bg-status-danger/10 text-status-danger font-bold">False alarms: {classicMatrix['false-positive']}</div>
                  <div className="p-2 rounded-lg bg-bg-nested text-text-secondary font-bold">Correctly allowed: {classicMatrix['true-negative']}</div>
                  <div className="p-2 rounded-lg bg-status-warning/10 text-status-warning font-bold">Missed: {classicMatrix['false-negative']}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-accent-glow border border-accent-primary/20 text-[11px] text-text-secondary flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              The classic policy only blocks requests matching a hard-coded phrase exactly — it cannot judge intent, so it misses most drift and subtler injection attempts the semantic guardrail catches at the cost of some false alarms.
            </div>

            {/* PER-REQUEST RESULTS */}
            <div className="space-y-1.5">
              {results.map((r) => {
                const isExpanded = selectedRequestId === r.request.id
                return (
                  <div key={r.request.id} className="rounded-lg border border-border-subtle overflow-hidden">
                    <button
                      onClick={() => setSelectedRequestId(isExpanded ? null : r.request.id)}
                      className="w-full flex items-center justify-between gap-2 p-2.5 text-left hover:bg-bg-nested/30 transition-colors"
                    >
                      <span className="text-[11px] text-text-primary flex-1 min-w-0 truncate">{r.request.content}</span>
                      <span className={`text-[9px] font-black uppercase shrink-0 ${groundTruthColor[r.request.groundTruth]}`}>{r.request.groundTruth}</span>
                      {r.semanticVerdict === 'block' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-status-danger shrink-0" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-status-success shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-2.5 bg-bg-nested/20 border-t border-border-subtle text-[11px] text-text-secondary space-y-1">
                        <div><span className="font-bold text-text-primary">Declared intent: </span>{r.request.declaredIntent}</div>
                        <div><span className="font-bold text-text-primary">Why: </span>{r.request.explanation}</div>
                        <div className="flex gap-3 pt-1">
                          <span>Semantic: <strong className={r.semanticVerdict === 'block' ? 'text-status-danger' : 'text-status-success'}>{r.semanticVerdict}</strong></span>
                          <span>Classic: <strong className={r.classicVerdict === 'block' ? 'text-status-danger' : 'text-status-success'}>{r.classicVerdict}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </PlaygroundShell>
  )
}
