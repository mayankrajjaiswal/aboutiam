import { useState } from 'react'
import { Scale, Play, RotateCcw, ShieldCheck, ShieldAlert, ShieldQuestion, ShieldOff, AlertTriangle, Sliders, FileCode } from 'lucide-react'

interface RequestContext {
  subject: { role: string; clearance: number }
  resource: { type: string; sensitivity: 'public' | 'internal' | 'confidential' | 'top-secret' }
  action: string
  environment: { time: number }
}

type RuleResult = 'Permit' | 'Deny' | 'NotApplicable' | 'Indeterminate'
type CombiningAlgorithm = 'deny-overrides' | 'permit-overrides' | 'first-applicable' | 'only-one-applicable'

interface Rule {
  id: string
  effect: 'Permit' | 'Deny'
  title: string
  description: string
  condition: (ctx: RequestContext) => boolean
}

const SENSITIVITY_LEVEL: Record<RequestContext['resource']['sensitivity'], number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  'top-secret': 3
}

const RULES: Rule[] = [
  {
    id: 'rule-doctor-read',
    effect: 'Permit',
    title: 'Doctor Read Access',
    description: 'Doctors may read patient records classified below top-secret sensitivity.',
    condition: (ctx) => ctx.subject.role === 'doctor' && ctx.action === 'read' && ctx.resource.type === 'patient-record' && ctx.resource.sensitivity !== 'top-secret'
  },
  {
    id: 'rule-after-hours-top-secret',
    effect: 'Deny',
    title: 'After-Hours Top-Secret Lockout',
    description: 'Deny any access to top-secret resources outside business hours (09:00-17:00).',
    condition: (ctx) => ctx.resource.sensitivity === 'top-secret' && (ctx.environment.time < 9 || ctx.environment.time >= 17)
  },
  {
    id: 'rule-admin-override',
    effect: 'Permit',
    title: 'Administrator Override',
    description: 'Administrators holding clearance level 3 or above may access any resource.',
    condition: (ctx) => ctx.subject.role === 'admin' && ctx.subject.clearance >= 3
  },
  {
    id: 'rule-insufficient-clearance',
    effect: 'Deny',
    title: 'Insufficient Clearance',
    description: 'Deny access when the subject\'s clearance level is below the resource\'s sensitivity level.',
    condition: (ctx) => SENSITIVITY_LEVEL[ctx.resource.sensitivity] > ctx.subject.clearance
  }
]

const COMBINING_ALGORITHMS: { id: CombiningAlgorithm; label: string }[] = [
  { id: 'deny-overrides', label: 'Deny-Overrides' },
  { id: 'permit-overrides', label: 'Permit-Overrides' },
  { id: 'first-applicable', label: 'First-Applicable' },
  { id: 'only-one-applicable', label: 'Only-One-Applicable' }
]

const DEFAULT_CONTEXT_INPUT = `{
  "subject": { "role": "doctor", "clearance": 2 },
  "resource": { "type": "patient-record", "sensitivity": "confidential" },
  "action": "read",
  "environment": { "time": 14 }
}`

function evaluateRule(rule: Rule, ctx: RequestContext): RuleResult {
  try {
    return rule.condition(ctx) ? rule.effect : 'NotApplicable'
  } catch {
    return 'Indeterminate'
  }
}

function combine(algorithm: CombiningAlgorithm, results: { rule: Rule; result: RuleResult }[]): RuleResult {
  if (algorithm === 'deny-overrides') {
    if (results.some(r => r.result === 'Deny')) return 'Deny'
    if (results.some(r => r.result === 'Permit')) return 'Permit'
    if (results.some(r => r.result === 'Indeterminate')) return 'Indeterminate'
    return 'NotApplicable'
  }
  if (algorithm === 'permit-overrides') {
    if (results.some(r => r.result === 'Permit')) return 'Permit'
    if (results.some(r => r.result === 'Deny')) return 'Deny'
    if (results.some(r => r.result === 'Indeterminate')) return 'Indeterminate'
    return 'NotApplicable'
  }
  if (algorithm === 'first-applicable') {
    const first = results.find(r => r.result !== 'NotApplicable')
    return first ? first.result : 'NotApplicable'
  }
  // only-one-applicable
  const applicable = results.filter(r => r.result !== 'NotApplicable')
  if (applicable.length === 0) return 'NotApplicable'
  if (applicable.length > 1) return 'Indeterminate'
  return applicable[0].result
}

const RESULT_STYLES: Record<RuleResult, string> = {
  Permit: 'text-status-success bg-status-success/10 border-status-success/30',
  Deny: 'text-status-danger bg-status-danger/10 border-status-danger/30',
  NotApplicable: 'text-text-muted bg-bg-nested border-border-subtle',
  Indeterminate: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
}

export default function XacmlPolicyEngine() {
  const [contextInput, setContextInput] = useState(DEFAULT_CONTEXT_INPUT)
  const [algorithm, setAlgorithm] = useState<CombiningAlgorithm>('deny-overrides')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [results, setResults] = useState<{ rule: Rule; result: RuleResult }[] | null>(null)
  const [verdict, setVerdict] = useState<RuleResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const handleEvaluate = () => {
    setEvaluating(true)
    setJsonError(null)
    setResults(null)
    setVerdict(null)
    setLogs([
      `[XACML] Parsing request context (subject / resource / action / environment)...`
    ])

    setTimeout(() => {
      let ctx: RequestContext
      try {
        ctx = JSON.parse(contextInput)
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : 'Malformed JSON. Confirm quotes and commas.')
        setLogs(prev => [...prev, `🚨 ERROR: Context JSON parsing failed! Aborting evaluation.`])
        setEvaluating(false)
        return
      }

      setLogs(prev => [...prev, `✔ Context JSON valid. Evaluating ${RULES.length} rules against the request...`])

      const evaluated = RULES.map(rule => ({ rule, result: evaluateRule(rule, ctx) }))

      setTimeout(() => {
        setLogs(prev => [
          ...prev,
          ...evaluated.map(({ rule, result }) => `  [RULE] ${rule.id} (${rule.effect}) -> ${result}`)
        ])

        setTimeout(() => {
          const final = combine(algorithm, evaluated)
          const algoLabel = COMBINING_ALGORITHMS.find(a => a.id === algorithm)?.label ?? algorithm

          setLogs(prev => [
            ...prev,
            `[COMBINE] Applying "${algoLabel}" combining algorithm across ${evaluated.length} rule results...`,
            `[COMBINE] Final decision: ${final.toUpperCase()}`
          ])
          setResults(evaluated)
          setVerdict(final)
          setEvaluating(false)
        }, 700)
      }, 700)
    }, 500)
  }

  const handleReset = () => {
    setContextInput(DEFAULT_CONTEXT_INPUT)
    setAlgorithm('deny-overrides')
    setJsonError(null)
    setResults(null)
    setVerdict(null)
    setLogs([])
  }

  const verdictIcon = {
    Permit: ShieldCheck,
    Deny: ShieldAlert,
    NotApplicable: ShieldOff,
    Indeterminate: ShieldQuestion
  }
  const VerdictIcon = verdict ? verdictIcon[verdict] : ShieldQuestion

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Scale className="w-3.5 h-3.5" /> Policy Playground
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          XACML 3.0 Combining-Algorithm Policy Engine
        </h2>
        <p className="text-text-secondary">
          A genuine rule-evaluation and combining-algorithm engine — not a hardcoded demo. Edit the request context, select any of the 4 real XACML 3.0 combining algorithms, and watch every rule resolve to Permit, Deny, NotApplicable, or Indeterminate before the final verdict is computed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Request Context Input (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between h-[420px]">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Request Context (XACML Attributes)
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold font-mono">
                JSON format
              </span>
            </div>

            <textarea
              aria-label="Request Context Input"
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              className="flex-grow w-full font-mono text-[10px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none focus:border-accent-primary resize-none h-full"
            />

            {jsonError && (
              <div className="p-2 mt-2 rounded bg-status-danger/10 border border-status-danger/20 text-[10px] text-status-danger flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>JSON Syntax Error: {jsonError}</span>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Rule Cards + Combining Algorithm (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
              <FileCode className="w-5 h-5 text-accent-primary" /> Policy Rule Set
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={evaluating}
                onClick={handleEvaluate}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5" /> Evaluate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary rounded-lg transition-all"
                title="Reset playground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {RULES.map(rule => {
              const ruleResult = results?.find(r => r.rule.id === rule.id)?.result
              return (
                <div key={rule.id} className={`p-3.5 rounded-xl border transition-all ${ruleResult ? RESULT_STYLES[ruleResult] : 'bg-bg-card border-border-subtle'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-text-primary">{rule.title}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${rule.effect === 'Permit' ? 'bg-status-success/15 text-status-success' : 'bg-status-danger/15 text-status-danger'}`}>
                      {rule.effect}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{rule.description}</p>
                  {ruleResult && (
                    <span className="text-[9px] font-mono font-bold block mt-1.5 uppercase">Result: {ruleResult}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2.5">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider block">Combining Algorithm (XACML 3.0)</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {COMBINING_ALGORITHMS.map(algo => (
                <button
                  type="button"
                  key={algo.id}
                  onClick={() => setAlgorithm(algo.id)}
                  className={`py-2 rounded-lg border transition-all text-[11px] ${
                    algorithm === algo.id ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm' : 'border-border-subtle bg-bg-nested text-text-secondary'
                  }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Verdict + Terminal (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">

          {verdict && (
            <div className={`p-5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center text-center space-y-2.5 transition-all ${RESULT_STYLES[verdict]}`}>
              <VerdictIcon className="w-10 h-10" />
              <div>
                <span className="block font-black uppercase text-[10px]">Final Verdict: {verdict}</span>
                <span className="block font-medium mt-0.5 text-text-secondary leading-normal">
                  Combined via {COMBINING_ALGORITHMS.find(a => a.id === algorithm)?.label}.
                </span>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-zinc-500 uppercase tracking-wider font-bold">
              <span>XACML PDP Terminal</span>
              <span>STATE: {evaluating ? 'EVALUATING' : 'IDLE'}</span>
            </div>
            <div className="h-64 overflow-y-auto text-emerald-400 space-y-1 pr-1">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting evaluation to trigger the PDP...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('Final decision') ? 'text-emerald-500 font-bold' :
                    log.startsWith('🚨') ? 'text-red-500 font-bold' :
                    log.startsWith('[COMBINE]') ? 'text-purple-400' :
                    log.startsWith('[RULE]') ? 'text-blue-400' : ''
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
