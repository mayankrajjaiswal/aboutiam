import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function RagAuthorization() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'rag_auth_lab',
    initialScore: 100
  })

  const [policyType, setPolicyType] = useState<'permissive' | 'restrictive'>('permissive')

  const handleQuery = (query: string) => {
    log('info', `🤖 Processing user query: "${query}"`)
    log('info', `📡 Fetching vectors from database...`)

    if (policyType === 'permissive') {
      log('warning', `⚠️ Permissive Policy Active: Vector-level claims validation bypassed.`)
      log('info', `🔓 Retrieval success: [Chunk 1: CEO Salary = $1,500,000]`)
      log('success', `✅ Response synthesized and exposed raw salary detail!`)
      if (currentStep === 1) completeStep(1)
    } else {
      log('success', `🔒 Restrictive Policy Active: Masking unauthorized vector metadata...`)
      log('info', `🛡️ Intersecting user token claims (Role = Employee) against Vector metadata (Classification = Executive).`)
      log('warning', `❌ Redacting Chunk 1 due to claim mismatch.`)
      log('success', `✅ Response synthesized safely with confidential details redacted!`)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="RAG-Aware Authorization Policy Engine"
      description="Simulate vector-level chunk metadata masking to authorize access to AI generated embeddings before the LLM synthesizes an answer."
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">1. Configure Metadata Policy</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setPolicyType('permissive'); log('info', 'Switched to Permissive Policy Mode'); }}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${policyType === 'permissive' ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
            >
              Permissive (Bypass Metadata)
            </button>
            <button
              onClick={() => { setPolicyType('restrictive'); log('info', 'Switched to Restrictive Metadata-Aware Policy Mode'); }}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${policyType === 'restrictive' ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
            >
              Restrictive (Claims-Aware Masking)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">2. Execute Simulated AI Queries</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleQuery('Show me the CEO salary figures from last year.')}
              className="p-3 text-xs rounded-xl bg-bg-nested border border-border-subtle text-left hover:bg-border-subtle transition font-bold"
            >
              "Show me the CEO salary figures."
            </button>
            <button
              onClick={() => handleQuery('What are the company Q3 marketing objectives?')}
              className="p-3 text-xs rounded-xl bg-bg-nested border border-border-subtle text-left hover:bg-border-subtle transition font-bold"
            >
              "What are Q3 marketing goals?"
            </button>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  )
}
