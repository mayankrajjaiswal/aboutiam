import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function OpaWasmPlayground() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'opa_wasm_lab',
    initialScore: 100
  })

  const [regoPolicy, setRegoPolicy] = useState(`package play
default allow = false
allow {
  input.role == "admin"
}`)
  const [inputJson, setInputJson] = useState(`{
  "role": "admin"
}`)

  const handleEvaluate = () => {
    log('info', `📡 Compiling OPA Rego policy to WebAssembly byte-structure locally...`)
    log('info', `🧩 Wasm module loaded: 16.4KB total payload size.`)
    log('info', `🔍 Evaluating OPA policy against input parameters...`)

    try {
      const parsed = JSON.parse(inputJson)
      if (parsed.role === 'admin') {
        log('success', `✅ Evaluation Result: allow = true (FIPS-compliant local Wasm execution)`)
        if (currentStep === 1) completeStep(1)
      } else {
        log('warning', `❌ Evaluation Result: allow = false (Policy matched but rule denied matching parameters)`)
        if (currentStep === 1) completeStep(1)
      }
    } catch {
      log('error', `❌ Error: Input payload is not valid JSON!`)
    }
  }

  return (
    <PlaygroundShell
      title="Wasm-Native OPA & Directory Engine Simulator"
      description="Simulate compiling OPA Rego policies to Wasm and executing them locally, alongside in-memory directory queries."
      score={score}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onReset={resetPlayground}
      sidebarContent={<TraceTerminal logs={logs} />}
      hintsRevealed={0}
      onRevealHint={() => {}}
    >
      <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wide">OPA Rego Policy (Local Editor)</label>
            <textarea
              value={regoPolicy}
              onChange={(e) => setRegoPolicy(e.target.value)}
              className="w-full h-40 p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Evaluation Input (JSON)</label>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-40 p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <button
          onClick={handleEvaluate}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
        >
          Compile to Wasm & Evaluate Policy
        </button>
      </div>
    </PlaygroundShell>
  )
}
