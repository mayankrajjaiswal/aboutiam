import { useState } from 'react'
import { KeySquare, Play, RotateCcw, ShieldCheck, ShieldAlert, FileCode, Sliders, AlertTriangle } from 'lucide-react'
import { evaluateRego } from '../../lib/tools/regoEvaluator'

const DEFAULT_CONTEXT_INPUT = `{
  "user": {
    "id": "alice",
    "role": "doctor",
    "department": "pediatrics"
  },
  "action": "read",
  "resource": {
    "type": "patient-record",
    "department": "pediatrics"
  }
}`

const DEFAULT_REGO_POLICY = `package authz

default allow = false

# Rule 1: Doctors can read patient records 
# if they belong to the same department
allow {
    input.user.role == "doctor"
    input.action == "read"
    input.resource.type == "patient-record"
    input.user.department == input.resource.department
}

# Rule 2: Administrators always have full override access
allow {
    input.user.role == "admin"
}`

export default function OpaPlayground() {
  const [contextInput, setContextInput] = useState(DEFAULT_CONTEXT_INPUT)
  const [regoPolicy, setRegoPolicy] = useState(DEFAULT_REGO_POLICY)
  const [verdict, setVerdict] = useState<boolean | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [jsonError, setJsonError] = useState<string | null>(null)

  // Run the OPA Rego evaluation logic natively using our custom client-side engine!
  const handleEvaluate = () => {
    setEvaluating(true)
    setVerdict(null)
    setJsonError(null)

    setLogs([
      `[OPA] Initializing Rego compiler...`,
      `[OPA] Parsing policy package: 'authz'...`,
      `[OPA] Context Input received. Validating json syntax...`
    ])

    setTimeout(() => {
      try {
        const inputObj = JSON.parse(contextInput)
        
        // Execute real, browser-native Rego evaluation!
        const result = evaluateRego(regoPolicy, inputObj)
        
        setLogs(prev => [
          ...prev,
          `✔ Context JSON syntax valid.`,
          ...result.logs
        ])
        setVerdict(result.allowed)
        setEvaluating(false)
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : 'Malformed JSON. Confirm quotes and commas.')
        setLogs(prev => [...prev, `🚨 ERROR: Context Input parsing failed! Aborting OPA evaluation.`])
        setEvaluating(false)
      }
    }, 1000)
  }

  const handleReset = () => {
    setContextInput(DEFAULT_CONTEXT_INPUT)
    setRegoPolicy(DEFAULT_REGO_POLICY)
    setVerdict(null)
    setLogs([])
    setJsonError(null)
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <KeySquare className="w-3.5 h-3.5" /> Policy Playground
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Open Policy Agent (OPA) & Rego Playground
        </h2>
        <p className="text-text-secondary">
          Decouple policy rules from your core application logic. Write fine-grained access policies using OPA's standard Rego language, model dynamic context JSON payloads, and compile rules in-browser to trace evaluations step-by-step.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Context Payload (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between h-[450px]">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Context Payload Input (input.json)
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold font-mono">
                JSON format
              </span>
            </div>

            <textarea
              aria-label="Context Payload Input"
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

        {/* MIDDLE COLUMN: Rego Policy Editor (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
              <FileCode className="w-5 h-5 text-accent-primary" /> Rego Policy Code (policy.rego)
            </h3>
            
            <div className="flex gap-2">
              <button
                disabled={evaluating}
                onClick={handleEvaluate}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5" /> Evaluate Rego
              </button>
              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary rounded-lg transition-all"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm h-[400px]">
            <textarea
              aria-label="Rego Policy Code Input"
              value={regoPolicy}
              onChange={(e) => setRegoPolicy(e.target.value)}
              className="w-full h-full font-mono text-[10px] leading-normal bg-bg-nested border border-border-subtle rounded-xl p-3.5 focus:outline-none focus:border-accent-primary resize-none text-text-secondary"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Output Verdict & OPA logs (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Final decision verdict card */}
          {verdict !== null && (
            <div className={`p-5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center text-center space-y-2.5 transition-all ${
              verdict 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
            }`}>
              {verdict ? <ShieldCheck className="w-10 h-10 animate-pulse-slow" /> : <ShieldAlert className="w-10 h-10 animate-pulse-slow" />}
              <div>
                <span className="block font-black uppercase text-[10px]">OPA DECISION: {verdict ? 'ALLOW' : 'DENY'}</span>
                <span className="block font-medium mt-0.5 text-text-secondary leading-normal">
                  {verdict ? 'Rego access evaluation matched true assertions.' : 'Rego rules returned default false evaluation.'}
                </span>
              </div>
            </div>
          )}

          {/* OPA Output JSON Response */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-2">
            <span className="text-[9px] text-text-muted font-bold block uppercase font-mono">OPA Engine API Response</span>
            <pre className="p-2.5 rounded-xl bg-bg-nested border border-border-subtle font-mono text-[10px] text-text-secondary">
{`{
  "result": {
    "allow": ${verdict ?? 'false'}
  }
}`}
            </pre>
          </div>

          {/* OPA Logs trace Terminal */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-zinc-500 uppercase tracking-wider font-bold">
              <span>OPA Terminal Compiler</span>
              <span>STATE: {evaluating ? 'EVALUATING' : 'IDLE'}</span>
            </div>
            <div className="h-32 overflow-y-auto text-emerald-400 space-y-1 pr-1">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting evaluation to trigger compilation...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('[RULE-MATCH]') || log.includes('allow\' matched: TRUE') ? 'text-emerald-500 font-bold' :
                    log.includes('[RULE-FAILED]') || log.includes('allow\' matched: FALSE') ? 'text-red-500 font-bold' :
                    log.startsWith('[EVAL]') ? 'text-blue-400' : ''
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
