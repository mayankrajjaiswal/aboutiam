import { useState, useEffect } from 'react'
import { 
  RefreshCw, BarChart2, Play, Zap, HelpCircle
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { AGENT_BATTLE_SCENARIOS } from '../../data/autonomousAgentScenarios'

export default function AutonomousAgentLab() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('token_hijacking')
  const currentScenario = AGENT_BATTLE_SCENARIOS.find(s => s.id === activeScenarioId) || AGENT_BATTLE_SCENARIOS[0]
  const [stepIndex, setStepIndex] = useState<number>(0)
  const currentStep = currentScenario.steps[stepIndex]

  const [completedScenarios, setCompletedScenarios] = useState<string[]>([])

  const {
    score,
    hintsRevealed,
    logs,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'autonomous_security_agent_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { capture, clearFrames } = usePacketCapture()

  useEffect(() => {
    const timer = setTimeout(() => {
      setStepIndex(0)
      log('info', `Switched Agentic Battle arena to: ${currentScenario.name}`)
      log('info', `Attack Vector: ${currentScenario.attackVector}`)
    }, 0)
    return () => clearTimeout(timer)
  }, [activeScenarioId, currentScenario.attackVector, currentScenario.name, log])

  const handleNextStep = () => {
    if (stepIndex < currentScenario.steps.length - 1) {
      const nextIdx = stepIndex + 1
      setStepIndex(nextIdx)
      const step = currentScenario.steps[nextIdx]
      
      log('info', `[Red Team AI] ${step.redAction}`)
      if (step.result === 'SUCCESS') {
        log('error', `💥 ${step.log}`)
      } else {
        log('success', `🛡️ ${step.log}`)
      }
      log('success', `[Blue Team AI] ${step.blueReaction}`)

      capture({
        direction: step.result === 'SUCCESS' ? 'request' : 'error',
        protocol: 'Agentic Handshake',
        summary: step.name,
        raw: `Attack: "${step.redAction}"\nReaction: "${step.blueReaction}"\nOutcome: ${step.result}`
      })
    } else {
      log('success', `🎉 Successfully completed the full ${currentScenario.name} autonomous battle simulation!`)
      if (!completedScenarios.includes(activeScenarioId)) {
        const nextCompleted = [...completedScenarios, activeScenarioId]
        setCompletedScenarios(nextCompleted)
        
        if (nextCompleted.length === 2) {
          completeStep(1)
          finishPlayground()
        }
      }
    }
  }

  const handleReset = () => {
    resetPlayground()
    clearFrames()
    setStepIndex(0)
    setCompletedScenarios([])
    log('info', 'Playground simulation has been fully reset.')
  }

  return (
    <PlaygroundShell
      title="Autonomous Security Agent Simulation Playground"
      description="Deploy autonomous Red Team and Blue Team AI security agents in simulated token-hijacking and redirect-hijacking arenas. Watch security enforcers dynamically adapt, detect anomalies, and apply cryptographic defenses."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={completedScenarios.length}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={() => {
        revealHint('To complete the simulation, run both "Session Hijacking" and "OAuth Redirect" scenarios to their final phases, observing how Blue Team AI deploys DPoP and strict exact-path checks.')
      }}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6 h-full flex flex-col justify-between">
        
        {/* Scenario Selector */}
        <div className="shrink-0 space-y-2 select-none">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">1. Select Autonomous Battle Arena</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AGENT_BATTLE_SCENARIOS.map(s => {
              const isSelected = activeScenarioId === s.id
              const isDone = completedScenarios.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScenarioId(s.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all font-sans relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-accent-glow border-accent-primary text-text-primary scale-[1.01] shadow' 
                      : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested/60'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-text-primary mt-1 leading-snug group-hover:text-accent-primary">
                      {s.name}
                    </h4>
                    <span className="text-[9px] text-text-muted mt-1 leading-normal block">
                      Attack: {s.attackVector.substring(0, 50)}...
                    </span>
                  </div>
                  {isDone && (
                    <span className="absolute top-2 right-2 text-xs bg-status-success/15 border border-status-success/20 text-status-success px-1.5 py-0.5 rounded-full font-bold select-none scale-90">
                      PASSED
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dual Battle Panels */}
        <div className="flex-1 min-h-0 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm overflow-y-auto space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-text-muted block flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 2. Real-Time Autonomous Agent Engagement</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Red Team AI Card */}
              <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-status-danger flex items-center gap-1">
                  🔴 Red Team AI (Malicious Agent)
                </span>
                <p className="text-xs text-text-secondary leading-relaxed italic">
                  &quot;{currentStep.redAction}&quot;
                </p>
              </div>

              {/* Blue Team AI Card */}
              <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/20 space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-status-success flex items-center gap-1">
                  🔵 Blue Team AI (Defense Agent)
                </span>
                <p className="text-xs text-text-secondary leading-relaxed italic">
                  &quot;{currentStep.blueReaction}&quot;
                </p>
              </div>
            </div>

            {/* Current Phase Description */}
            <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-accent-secondary font-bold">{currentStep.name}</span>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                Status Outcome: <span className={`font-black uppercase ${currentStep.result === 'SUCCESS' ? 'text-status-danger' : 'text-status-success'}`}>{currentStep.result}</span>
              </p>
            </div>
          </div>

          {/* Progress gauge inside battle */}
          <div className="border-t border-border-subtle/40 pt-4 space-y-2">
            <span className="text-[10px] uppercase font-bold text-text-muted block flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-accent-secondary" /> Battle Engagement Timeline
            </span>
            <div className="grid grid-cols-4 gap-2 select-none">
              {['Acquisition', 'Replay', 'Defense', 'Defeated'].map((p, idx) => {
                const isActive = stepIndex === idx
                const isPassed = stepIndex >= idx
                return (
                  <div 
                    key={p}
                    className={`p-2 rounded-lg border text-center font-bold text-[9px] uppercase tracking-wider ${
                      isActive ? 'bg-accent-glow border-accent-primary text-text-primary' :
                      isPassed ? 'bg-bg-sidebar border-status-success/20 text-status-success' :
                      'bg-bg-sidebar border-border-subtle text-text-muted'
                    }`}
                  >
                    {p}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Handshake Trigger Buttons */}
        <div className="shrink-0 flex gap-3 select-none">
          <button
            onClick={() => setStepIndex(0)}
            className="px-4 py-3 rounded-xl bg-bg-card hover:bg-bg-nested/60 border border-border-subtle text-xs font-bold font-sans transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-text-muted" /> Reset Battle
          </button>
          
          <button
            onClick={handleNextStep}
            className="flex-1 py-3 px-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold font-sans shadow-md transition flex items-center justify-center gap-1.5"
          >
            {stepIndex < currentScenario.steps.length - 1 ? (
              <>
                Advance Autonomous Battle <Play className="w-3.5 h-3.5 animate-pulse" />
              </>
            ) : (
              <>
                Complete Battle Simulation 🎉
              </>
            )}
          </button>
        </div>

        {/* Bottom Explainer */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-accent-primary" /> Autonomous Security Orchestrations</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="font-bold text-accent-primary block mb-0.5">The Paradigm of AI-vs-AI battles</span>
              With standard API attacks becoming fully scripted by adversarial LLMs, defensive routers are upgrading to autonomous enforcers. These enforcers detect anomalous behavioral patterns and instantly activate cryptographic guardrails like DPoP.
            </div>
            <div>
              <span className="font-bold text-accent-secondary block mb-0.5">Lattice-Based Zero Trust Defense</span>
              Rather than waiting for manual administrators to write policies, modern Blue Team AIs dynamically adjust trust settings, restrict wildcards, and enforce absolute identity-first segment isolation in milliseconds.
            </div>
          </div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
