import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function McpServerPlayground() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'mcp_server_lab',
    initialScore: 100
  })

  const [prompt, setPrompt] = useState('Retrieve the definition of mTLS.')

  const handleQuery = () => {
    log('info', `🤖 Desktop LLM client polling the AboutIAM MCP Server...`)
    log('info', `📡 Calling MCP Tool: [Tool = get_encyclopedia_term, Query = "mTLS"]`)
    log('success', `✅ MCP Schema mapping matched 1 Tool: "mTLS" found in Encyclopedia array.`)
    log('success', `📦 Payload marshaled back to LLM context: "Mutual TLS is an identity standard..."`)
    if (currentStep === 1) completeStep(1)
  }

  return (
    <PlaygroundShell
      title="Model Context Protocol (MCP) Server Sandbox"
      description="An interactive Model Context Protocol simulator where users configure the AboutIAM MCP server, see how desktop LLM clients poll the tools, and query the Encyclopedia."
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
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">Enter Local AI Prompt (MCP Client Query)</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <button
          onClick={handleQuery}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
        >
          Execute MCP Tool Protocol Handshake
        </button>
      </div>
    </PlaygroundShell>
  )
}
