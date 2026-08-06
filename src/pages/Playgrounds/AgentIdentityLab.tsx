import { useState, useEffect } from 'react'
import { 
  Bot, User, ArrowRight, ShieldAlert, CheckCircle2,
  Trash2, Play, Lock, Plus, ToggleLeft, ToggleRight,
  Layers, Info, Eye
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { AGENT_IDENTITY_SCENARIOS, type AgentIdentityScenario } from '../../data/agentIdentityScenarios'
import { signJwtHmac } from '../../lib/tools/jwt'

interface ChainHop {
  id: string
  name: string
  role: string
  scopes: string[]
  token: string
  isGeneratingToken: boolean
}

function buildHumanHop(scenario: AgentIdentityScenario): ChainHop {
  return {
    id: 'human_principal',
    name: 'Human User (Principal)',
    role: 'human_user',
    scopes: [...scenario.startingScopes],
    token: '',
    isGeneratingToken: true
  }
}

export default function AgentIdentityLab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(AGENT_IDENTITY_SCENARIOS[0].id)
  const currentScenario = AGENT_IDENTITY_SCENARIOS.find(s => s.id === selectedScenarioId) || AGENT_IDENTITY_SCENARIOS[0]

  // Simulated compromise toggle
  const [isCompromised, setIsCompromised] = useState<boolean>(false)

  // Scopes selected at each hop.
  // Hop 0 is always the Human Principal (unmodifiable, has all scenario.startingScopes).
  // Hop 1+ are sub-agents.
  const [hops, setHops] = useState<ChainHop[]>(() => [buildHumanHop(AGENT_IDENTITY_SCENARIOS[0])])
  const [activeTab, setActiveTab] = useState<'chain' | 'token_inspect'>('chain')
  const [inspectHopIndex, setInspectHopIndex] = useState<number>(0)
  
  // State for the "Add Sub-Agent" modal/form
  const [newAgentName, setNewAgentName] = useState<string>('')
  const [newAgentRole, setNewAgentRole] = useState<string>('Orchestrator Agent')
  const [selectedScopesForNewAgent, setSelectedScopesForNewAgent] = useState<string[]>([])
  const [isAddingHop, setIsAddingHop] = useState<boolean>(false)

  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'agent_identity_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { frames: packetFrames, capture, clearFrames } = usePacketCapture()

  // Sequentially sign tokens whenever hops or scopes change
  useEffect(() => {
    if (hops.length === 0) return

    let isSubscribed = true

    const generateTokens = async () => {
      const updatedHops = [...hops]
      let changed = false

      for (let i = 0; i < updatedHops.length; i++) {
        const hop = updatedHops[i]
        if (!hop.token && !hop.isGeneratingToken) {
          updatedHops[i] = { ...hop, isGeneratingToken: true }
          setHops(updatedHops)
          return
        }

        if (hop.isGeneratingToken) {
          // Compute the token
          try {
            const header = { alg: 'HS256', typ: 'JWT' }
            const prevHop = i > 0 ? updatedHops[i - 1] : null
            
            const payload = {
              iss: 'aboutiam-mcp-idp',
              sub: hop.role,
              name: hop.name,
              aud: i === updatedHops.length - 1 ? currentScenario.targetTool : updatedHops[i + 1]?.role || 'downstream-agent',
              scopes: hop.scopes,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor((Date.now() + 300) / 1000), // 5 minute validity
              // Express standard delegation act (actor) claim from RFC 8693
              ...(prevHop ? { act: { sub: prevHop.role, name: prevHop.name } } : {})
            }

            const token = await signJwtHmac('HS256', header, payload, 'mcp_trust_key_secret_2026')
            
            if (isSubscribed) {
              updatedHops[i] = {
                ...hop,
                token,
                isGeneratingToken: false
              }
              changed = true
            }
          } catch (err) {
            console.error('Failed to sign JWT for delegation hop:', err)
            if (isSubscribed) {
              updatedHops[i] = {
                ...hop,
                token: 'SIGNING_ERROR',
                isGeneratingToken: false
              }
              changed = true
            }
          }
        }
      }

      if (changed && isSubscribed) {
        setHops(updatedHops)
      }
    }

    generateTokens()

    return () => {
      isSubscribed = false
    }
  }, [hops, currentScenario.targetTool])

  const handleScenarioChange = (id: string) => {
    const scenario = AGENT_IDENTITY_SCENARIOS.find(s => s.id === id) || AGENT_IDENTITY_SCENARIOS[0]

    setSelectedScenarioId(id)
    resetPlayground()
    setHops([buildHumanHop(scenario)])
    setIsCompromised(false)
    setIsAddingHop(false)
    setInspectHopIndex(0)

    log('info', `Loaded Scenario: "${scenario.title}"`)
    log('info', `Human Principal initialized with scopes: [${scenario.startingScopes.join(', ')}]`)
    log('info', `Deploy target: "${scenario.targetTool}" (Requires scopes: [${scenario.requiredToolScopes.join(', ')}])`)
  }

  // Pre-fill scopes for the new agent addition
  const openAddHopModal = () => {
    setIsAddingHop(true)
    setNewAgentName(hops.length === 1 ? 'Orchestrator Agent' : 'Worker Sub-Agent')
    setNewAgentRole(hops.length === 1 ? 'orchestrator' : 'worker_sub_agent')
    // Default to forwarding all scopes of the parent
    const parentHop = hops[hops.length - 1]
    setSelectedScopesForNewAgent([...parentHop.scopes])
  }

  const handleAddHopSubmit = () => {
    if (!newAgentName.trim()) {
      alert('Please provide an agent name.')
      return
    }

    const parentHop = hops[hops.length - 1]
    
    // Safety check: verify that no scopes are escalated (present in new agent but not parent)
    const escalatedScopes = selectedScopesForNewAgent.filter(s => !parentHop.scopes.includes(s))
    if (escalatedScopes.length > 0) {
      log('error', `🚨 [Escalation Blocked] Attempted to escalate privileges at hop "${newAgentName}". Scopes requested [${escalatedScopes.join(', ')}] are not granted to the parent agent!`)
      alert(`Security Escalation Blocked!\nYou cannot assign scopes that the parent agent does not possess: ${escalatedScopes.join(', ')}`)
      return
    }

    const newHop: ChainHop = {
      id: `hop_${Date.now()}`,
      name: newAgentName,
      role: newAgentRole,
      scopes: [...selectedScopesForNewAgent],
      token: '',
      isGeneratingToken: true
    }

    const updated = [...hops, newHop]
    setHops(updated)
    setIsAddingHop(false)
    log('success', `Issued OAuth 2.1 On-Behalf-Of (OBO) token to delegate to sub-agent "${newAgentName}" with scopes: [${selectedScopesForNewAgent.join(', ')}]`)
    capture({ direction: 'response', protocol: 'OAuth 2.1 OBO', summary: `Delegation token issued to "${newAgentName}"`, raw: `sub: ${newAgentRole}\nscopes: [${selectedScopesForNewAgent.join(', ')}]` })

    // Verify checkpoint 1: User built a 2-hop delegation chain
    if (currentStep === 0 && updated.length >= 3) {
      completeStep(0, 'Checkpoint 1 Verified: Completed 2-hop sub-agent delegation chain (Human -> Orchestrator -> Sub-Agent).')
    }
  }

  const handleRemoveHop = (index: number) => {
    if (index === 0) return // cannot remove Human root
    const updated = hops.slice(0, index)
    setHops(updated)
    log('warning', `Removed delegation sub-agents from index ${index} onwards.`)
    setInspectHopIndex(Math.min(inspectHopIndex, updated.length - 1))
  }

  const toggleCompromise = () => {
    const nextVal = !isCompromised
    setIsCompromised(nextVal)
    if (nextVal) {
      log('warning', `⚠️ [Threat Emulation Triggered] Simulating compromise/prompt injection on specialized sub-agent!`)
    } else {
      log('info', `Threat emulation deactivated. Sub-agents restored to trusted state.`)
    }
  }

  const executeToolCall = () => {
    if (hops.length < 2) {
      log('error', '❌ Cannot execute tool call: Delegation chain is too short. Add at least one sub-agent to execute the task.')
      alert('Your delegation chain is incomplete. Add sub-agents first.')
      return
    }

    const finalHop = hops[hops.length - 1]

    capture({ direction: 'request', protocol: 'MCP Tool Call', summary: `Tool call to "${currentScenario.targetTool}"`, raw: finalHop.token || '(token still generating)' })

    // Verify required scopes are present
    const missingScopes = currentScenario.requiredToolScopes.filter(s => !finalHop.scopes.includes(s))

    if (missingScopes.length > 0) {
      log('error', `❌ [Execution Blocked] Target tool "${currentScenario.targetTool}" rejected call: Missing required scopes [${missingScopes.join(', ')}]. Final agent token only had: [${finalHop.scopes.join(', ')}]`)
      capture({ direction: 'error', protocol: 'MCP Tool Call', summary: 'Execution blocked — missing required scopes', raw: `missing: [${missingScopes.join(', ')}]` })
      alert(`Execution Blocked! The final sub-agent lacks the required scopes to operate the tool: ${missingScopes.join(', ')}`)
      return
    }

    // Success check: does the final hop contain the trap scope?
    const containsTrap = finalHop.scopes.includes(currentScenario.trapScope)

    if (containsTrap) {
      log('warning', `⚠️ [Call Completed - High Risk] Tool call executed successfully, BUT over-broad scopes (including "${currentScenario.trapScope}") were leaked. The delegation chain did not perform scope narrowing. Checkpoint 2 failed.`)
      alert(`Warning: Tool call completed but with elevated risk! You leaked the administrative scope "${currentScenario.trapScope}" downstream to the sub-agent. Narrow down scopes before calling.`)
    } else {
      // Success - Least privilege verified
      if (currentStep <= 1) {
        completeStep(1, `Checkpoint 2 Verified: Scopes successfully narrowed. Excluded dangerous administrative scope "${currentScenario.trapScope}".`)
      }
      
      log('success', `✓ [Success] Executed Tool Call on "${currentScenario.targetTool}" under rigid least-privilege context. Token verified successfully.`)
      capture({ direction: 'response', protocol: 'MCP Tool Call', summary: `"${currentScenario.targetTool}" call succeeded`, raw: `scopes: [${finalHop.scopes.join(', ')}]` })
      
      if (isCompromised) {
        completeStep(2, `Checkpoint 3 Verified: Blast radius containment fully validated under active compromise emulator.`)
        finishPlayground(`🎉 Mission Accomplished! You successfully delegated agentic identity without privilege leaks, surviving a sub-agent compromise!`)
      } else {
        log('info', `💡 Now try triggering "Simulate Sub-Agent Compromise" to verify the blast-radius containment of your secure delegation chain under active threat emulation!`)
      }
    }
  }

  // Help hints implementation
  const handleRevealHint = () => {
    const hints = [
      `Analyze the "Required Scopes" for the target tool. When adding sub-agents, ensure they only get these exact scopes instead of blindly forwarding everything.`,
      `Watch out for the trap scope: "${currentScenario.trapScope}". When configuring the sub-agent's scopes, uncheck "${currentScenario.trapScope}" to narrow down the token privileges.`,
      `To complete the final checkpoint, narrow down the scopes to exclude "${currentScenario.trapScope}", enable the "Simulate Sub-Agent Compromise" toggle, and click "Execute Tool Call".`
    ]
    revealHint(hints[hintsRevealed])
  }

  // Parse and format JWT for inspecting
  const getInspectTokenJson = (tokenStr: string) => {
    if (!tokenStr) return 'Token generating...'
    if (tokenStr === 'SIGNING_ERROR') return 'Error signing token.'
    try {
      const parts = tokenStr.split('.')
      if (parts.length < 2) return 'Invalid token'
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      return JSON.stringify({
        header: { alg: 'HS256', typ: 'JWT' },
        payload
      }, null, 2)
    } catch {
      return 'Error parsing token details'
    }
  }

  return (
    <PlaygroundShell
      title="Agentic Identity & MCP Trust Simulator"
      description="Design secure delegation pipelines for non-human AI agents. Issue short-lived scoped tokens, configure OAuth 2.1 on-behalf-of trust chains, and enforce scope narrowing to contain blast radius under sub-agent compromise."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setSelectedScenarioId(currentScenario.id)
        setHops([buildHumanHop(currentScenario)])
        setIsCompromised(false)
        setIsAddingHop(false)
        setInspectHopIndex(0)
        clearFrames()
        log('info', 'Playground reset successfully.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
      packetCapture={{ frames: packetFrames, onClear: clearFrames }}
    >
      <div className="space-y-6">
        
        {/* Scenario Selection */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Select Enterprise Agentic Scenario
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AGENT_IDENTITY_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(s.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScenarioId === s.id
                    ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow-sm'
                    : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
                }`}
              >
                <div className="text-sm font-semibold truncate">{s.title}</div>
                <div className="text-[11px] font-normal opacity-85 mt-1 line-clamp-2">
                  {s.targetTool}
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-text-muted leading-relaxed pt-1">
            <span className="font-semibold text-text-secondary">Context:</span> {currentScenario.description}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('chain')}
            className={`py-2 px-4 font-bold text-xs border-b-2 transition-all -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'chain'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Layers className="w-4 h-4" />
            Active Delegation Chain
          </button>
          <button
            onClick={() => setActiveTab('token_inspect')}
            className={`py-2 px-4 font-bold text-xs border-b-2 transition-all -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'token_inspect'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Eye className="w-4 h-4" />
            Cryptographic Token Inspector ({hops.length})
          </button>
        </div>

        {activeTab === 'chain' ? (
          <div className="space-y-6">
            
            {/* Delegation Chain Visualizer */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-primary" />
                  OAuth 2.1 Trust Topology
                </h3>
                <span className="text-xs text-text-muted font-mono bg-bg-nested px-2 py-0.5 rounded border border-border-subtle">
                  RFC 8693 (Token Exchange)
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {hops.map((hop, index) => {
                  const isLast = index === hops.length - 1
                  const isHuman = index === 0
                  const isHopCompromised = isCompromised && !isHuman && isLast
                  
                  return (
                    <div key={hop.id} className="relative flex flex-col md:flex-row items-stretch gap-4">
                      {/* Left Connector Arrow */}
                      {!isHuman && (
                        <div className="absolute -top-4 left-6 md:left-1/2 md:-translate-x-1/2 h-4 w-0.5 bg-accent-secondary/50 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-accent-secondary rotate-90 md:rotate-90 hidden" />
                        </div>
                      )}

                      {/* Card block */}
                      <div className={`flex-grow p-4 rounded-xl border transition-all ${
                        isHopCompromised 
                          ? 'bg-status-danger/10 border-status-danger/60 shadow-md animate-pulse'
                          : isHuman
                            ? 'bg-bg-nested border-accent-secondary/30'
                            : 'bg-bg-card border-border-subtle hover:border-accent-primary/30'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isHuman ? (
                              <div className="p-2 rounded-lg bg-accent-secondary/15 text-accent-secondary">
                                <User className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className={`p-2 rounded-lg ${isHopCompromised ? 'bg-status-danger/20 text-status-danger' : 'bg-accent-primary/15 text-accent-primary'}`}>
                                <Bot className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                {hop.name}
                                {isHuman && <span className="text-[10px] bg-accent-secondary/10 text-accent-secondary font-bold px-1.5 py-0.5 rounded uppercase">Root Principal</span>}
                                {isHopCompromised && <span className="text-[10px] bg-status-danger/25 text-status-danger font-bold px-1.5 py-0.5 rounded uppercase animate-bounce">Compromised</span>}
                              </div>
                              <div className="text-[11px] text-text-muted">Role identifier: <span className="font-mono bg-bg-nested px-1 rounded">{hop.role}</span></div>
                            </div>
                          </div>

                          {/* Delete Action for added hops */}
                          {!isHuman && (
                            <button
                              onClick={() => handleRemoveHop(index)}
                              className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                              title="Revoke Sub-Agent Delegation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Scopes Section */}
                        <div className="mt-3 pt-3 border-t border-border-subtle/40 space-y-2">
                          <div className="text-[10px] font-extrabold uppercase tracking-wide text-text-muted">
                            Assigned Scopes / Claims:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {hop.scopes.map(s => {
                              const isTrap = s === currentScenario.trapScope
                              return (
                                <span
                                  key={s}
                                  className={`text-xs px-2 py-0.5 rounded font-mono ${
                                    isTrap 
                                      ? 'bg-status-warning/20 text-status-warning font-semibold border border-status-warning/30'
                                      : 'bg-bg-nested text-text-secondary border border-border-subtle/55'
                                  }`}
                                  title={isTrap ? `This is an over-broad scope (Trap): ${currentScenario.trapExplanation}` : ''}
                                >
                                  {s}
                                  {isTrap && ' ⚠️'}
                                </span>
                              )
                            })}
                          </div>
                        </div>

                        {/* JWT Output Row */}
                        <div className="mt-3 pt-2 border-t border-border-subtle/30 flex items-center justify-between text-[11px]">
                          <span className="text-text-muted font-medium">Issued Delegation JWT:</span>
                          <button
                            onClick={() => {
                              setInspectHopIndex(index)
                              setActiveTab('token_inspect')
                            }}
                            className="text-accent-primary hover:underline font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect Signed JWT
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Topology Tail target */}
              <div className="p-4 rounded-xl bg-bg-nested border border-dashed border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-bg-card border border-border-subtle text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      {currentScenario.targetTool}
                      <span className="text-[10px] bg-status-info/10 text-status-info font-bold px-1.5 py-0.5 rounded uppercase">Target Tool</span>
                    </div>
                    <div className="text-[11px] text-text-secondary mt-0.5">
                      Required Scopes: <span className="font-mono bg-bg-card border border-border-subtle px-1 rounded">{currentScenario.requiredToolScopes.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={openAddHopModal}
                    disabled={isCompleted || isAddingHop}
                    className="flex-grow md:flex-none py-2 px-3.5 bg-accent-glow hover:bg-accent-glow/75 border border-accent-primary/30 text-accent-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Delegation Hop
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Agent Form Modal overlay */}
            {isAddingHop && (
              <div className="p-5 rounded-2xl bg-bg-card border-2 border-accent-primary/40 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                  <Bot className="w-5 h-5 text-accent-primary" />
                  <h4 className="font-bold text-sm text-text-primary">Configure Delegation Token & Sub-Agent</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase">Sub-Agent Name</label>
                    <input
                      type="text"
                      value={newAgentName}
                      onChange={e => setNewAgentName(e.target.value)}
                      placeholder="e.g. Orchestrator Assistant"
                      className="w-full p-2.5 rounded-xl border border-border-subtle bg-bg-nested text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase">Identity Role Identifier (sub)</label>
                    <select
                      value={newAgentRole}
                      onChange={e => setNewAgentRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border-subtle bg-bg-nested text-xs text-text-primary focus:outline-none"
                    >
                      <option value="orchestrator">orchestrator (Planner / Agent Gateway)</option>
                      <option value="worker_sub_agent">worker_sub_agent (Task Executants)</option>
                      <option value="db_searcher">database_searcher_sub_agent (Data Queries)</option>
                      <option value="billing_trigger">billing_agent_sub_agent (Financial)</option>
                    </select>
                  </div>
                </div>

                {/* Scope Narrowing Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-text-secondary uppercase block">
                      Scope Allocation (Delegate Token Privileges)
                    </label>
                    <span className="text-[10px] text-text-muted font-medium">
                      Select which parent privileges to pass on
                    </span>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-bg-nested border border-border-subtle space-y-2 max-h-40 overflow-y-auto">
                    {hops[hops.length - 1].scopes.map(scope => {
                      const isTrap = scope === currentScenario.trapScope
                      const isSelected = selectedScopesForNewAgent.includes(scope)
                      return (
                        <label key={scope} className="flex items-start gap-2.5 p-1.5 hover:bg-bg-card rounded-lg cursor-pointer transition-colors text-xs">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedScopesForNewAgent(prev => prev.filter(s => s !== scope))
                              } else {
                                setSelectedScopesForNewAgent(prev => [...prev, scope])
                              }
                            }}
                            className="mt-0.5 rounded text-accent-primary border-border-subtle focus:ring-0"
                          />
                          <div className="flex-grow">
                            <span className={`font-mono text-xs ${isTrap ? 'text-status-warning font-bold' : 'text-text-primary'}`}>
                              {scope} {isTrap && '(⚠️ Broad Admin Scope)'}
                            </span>
                            {isTrap && (
                              <p className="text-[10px] text-text-muted mt-0.5 leading-tight">
                                <span className="font-semibold">Trap Warning:</span> {currentScenario.trapExplanation}
                              </p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-border-subtle">
                  <button
                    onClick={() => setIsAddingHop(false)}
                    className="py-2 px-3.5 bg-bg-nested hover:bg-bg-base text-text-secondary text-xs font-bold rounded-xl transition-colors border border-border-subtle"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHopSubmit}
                    className="py-2 px-4 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Issue Delegate Token
                  </button>
                </div>
              </div>
            )}

            {/* Compromised Emulation & Call Execution Dashboard */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border-subtle/30">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-accent-primary" />
                    Threat Analysis & Blast Radius Containment
                  </h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Least privilege isolates the impact of prompt-injection or compromised agents.
                  </p>
                </div>

                <button
                  onClick={toggleCompromise}
                  disabled={hops.length < 2}
                  className={`py-2 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    hops.length < 2
                      ? 'bg-bg-nested text-text-muted cursor-not-allowed border-border-subtle'
                      : isCompromised
                        ? 'bg-status-danger/15 border-status-danger text-status-danger animate-pulse shadow-sm'
                        : 'bg-bg-nested border-border-subtle text-text-secondary hover:bg-bg-base shadow-sm'
                  }`}
                >
                  {isCompromised ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Compromise Simulation: ON
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Simulate Compromise
                    </>
                  )}
                </button>
              </div>

              {/* Blast Radius Visualizer card */}
              {isCompromised && hops.length >= 2 && (
                <div className={`p-4 rounded-xl border animate-in slide-in-from-top-2 duration-200 ${
                  hops[hops.length - 1].scopes.includes(currentScenario.trapScope)
                    ? 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                    : 'bg-status-success/10 border-status-success/30 text-status-success'
                }`}>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold uppercase">
                        {hops[hops.length - 1].scopes.includes(currentScenario.trapScope)
                          ? '🚨 Critical Compromise Detected!'
                          : '🛡️ Blast Radius Contained Successfully!'}
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">
                        {hops[hops.length - 1].scopes.includes(currentScenario.trapScope)
                          ? `Because the over-broad administrative privilege "${currentScenario.trapScope}" was delegated to the sub-agent, the attacker has fully subverted the pipeline, acquiring administrative access to override policies, steal other keys, and compromise the core platform.`
                          : `The sub-agent was fully compromised. However, because you restricted the delegated token's scopes to the strict minimum required ([${currentScenario.requiredToolScopes.join(', ')}]), the attacker has absolutely zero administrative foothold. System integrity is entirely safe!`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Execute Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={executeToolCall}
                  className="py-3 px-6 bg-accent-primary hover:bg-accent-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Execute Safe Tool Call
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Cryptographic Token Inspector View */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block shrink-0">
                Select Hop to Inspect:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {hops.map((hop, idx) => (
                  <button
                    key={hop.id}
                    onClick={() => setInspectHopIndex(idx)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      inspectHopIndex === idx
                        ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold'
                        : 'bg-bg-nested border-border-subtle text-text-secondary hover:bg-bg-card'
                    }`}
                  >
                    Hop {idx}: {hop.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {hops[inspectHopIndex] ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Raw JWT Segment */}
                <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-accent-primary" />
                      Raw Decoded JWT Structure
                    </h4>
                    <p className="text-[10px] text-text-muted leading-tight">
                      This token is cryptographically signed locally using client-side HMAC.
                    </p>
                  </div>

                  <div className="font-mono text-[11px] p-3 rounded-lg bg-bg-card border border-border-subtle text-text-secondary select-all break-all h-48 overflow-y-auto scrollbar-thin">
                    {hops[inspectHopIndex].isGeneratingToken ? 'Generating signature...' : hops[inspectHopIndex].token}
                  </div>

                  <div className="text-[10px] text-text-muted flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Structure format: <span className="font-mono text-accent-primary font-semibold">header.payload.signature</span>
                  </div>
                </div>

                {/* Parsed JSON details segment */}
                <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-accent-secondary" />
                      Parsed JWT Assertions (JSON-LD)
                    </h4>
                    <p className="text-[10px] text-text-muted leading-tight">
                      Decoded claims showing subject, delegation context, and scopes.
                    </p>
                  </div>

                  <pre className="font-mono text-[10px] p-3 rounded-lg bg-bg-card border border-border-subtle text-accent-secondary h-48 overflow-y-auto scrollbar-thin leading-relaxed">
                    {hops[inspectHopIndex].isGeneratingToken ? 'Decrypting headers...' : getInspectTokenJson(hops[inspectHopIndex].token)}
                  </pre>

                  <div className="text-[10px] text-text-muted flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    <span>On-Behalf-Of <span className="font-mono text-text-primary">(act)</span> claim correctly represents trust delegation.</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center p-6 text-text-muted">No hop selected.</div>
            )}
          </div>
        )}

        {/* Informational Pedagogy Card */}
        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-accent-primary" />
            Why This Simulator Matters in 2026
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            In modern architectures, AI agents do not act independently—they act on behalf of humans or other microservices. The **Model Context Protocol (MCP)** and modern workspace agents (like Microsoft Entra Agent ID and AWS IAM Identity Center) mandate the secure propagation of trust.
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            If an Orchestrator Agent forwards a client's full token (with <code className="bg-bg-card px-1 py-0.5 rounded font-mono border border-border-subtle">admin:all</code> rights) to a downstream Sub-Agent that is compromised via prompt-injection, the attacker gains immediate administrative access over the system. This simulator demonstrates how cryptographically signed, short-lived **On-Behalf-Of (OBO)** scope-narrowed JWTs isolate and fully neutralize this blast radius.
          </p>
        </div>

      </div>
    </PlaygroundShell>
  )
}
