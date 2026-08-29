import { useState, useEffect } from 'react'
import { 
  Cpu, Network, ArrowRight,
  Info, RefreshCw, BarChart2, HardDrive
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { PQC_HANDSHAKE_SCENARIOS } from '../../data/pqcHandshakeScenarios'

export default function PqcHandshakeLab() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('classical')
  const currentScenario = PQC_HANDSHAKE_SCENARIOS.find(s => s.id === activeScenarioId) || PQC_HANDSHAKE_SCENARIOS[0]
  const [stepIndex, setStepIndex] = useState<number>(0)
  const currentStep = currentScenario.steps[stepIndex]

  // Track completed scenarios for score multiplier
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
    moduleId: 'pqc_handshake_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { capture, clearFrames } = usePacketCapture()

  // Reset steps on scenario change
  useEffect(() => {
    const timer = setTimeout(() => {
      setStepIndex(0)
      log('info', `Changed handshake scenario to: ${currentScenario.name}`)
      log('info', `Algorithms: Key Exchange = ${currentScenario.keyExchange} | Signature = ${currentScenario.signature}`)
    }, 0)
    return () => clearTimeout(timer)
  }, [activeScenarioId, currentScenario.keyExchange, currentScenario.name, currentScenario.signature, log])

  const handleNextStep = () => {
    if (stepIndex < currentScenario.steps.length - 1) {
      const nextIdx = stepIndex + 1
      setStepIndex(nextIdx)
      const step = currentScenario.steps[nextIdx]
      
      // Log event to cryptographic terminal
      log('success', `[Step ${nextIdx + 1}] ${step.name} completed successfully.`)
      log('info', step.log)

      // Capture packet frame
      capture({
        direction: step.wireHighlight === 'both' ? 'response' : step.wireHighlight === 'client' ? 'request' : 'response',
        protocol: 'TLS 1.3 (PQC)',
        summary: step.name,
        raw: step.log
      })
    } else {
      // Completed the current scenario!
      log('success', `🎉 Successfully completed the full ${currentScenario.name} handshake sequence!`)
      if (!completedScenarios.includes(activeScenarioId)) {
        const nextCompleted = [...completedScenarios, activeScenarioId]
        setCompletedScenarios(nextCompleted)
        
        if (nextCompleted.length === 3) {
          completeStep(1) // Mark primary learning step complete
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
      title="Post-Quantum Cryptography (PQC) Handshake Simulator"
      description="Step through classical vs. hybrid vs. pure post-quantum handshakes. Analyze key exchange sizes, signature overheads, and network packet fragmentation thresholds under FIPS 203/204 lattice cryptography."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={completedScenarios.length}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => {
        if (completedScenarios.length === 0) {
          revealHint('Begin by completing the classical handshake to understand Shor\'s algorithm threat model.')
        } else if (completedScenarios.length === 1) {
          revealHint('Switch to the Hybrid Transition scenario to see how browser-native transition agreements combine classical ECDH and ML-KEM.')
        } else {
          revealHint('Complete the Pure Post-Quantum scenario using only ML-KEM and ML-DSA to achieve 100% quantum resilience.')
        }
      }}
      onReset={handleReset}
      sidebarContent={
        <div className="space-y-4 flex flex-col h-full">
          <TraceTerminal logs={logs} />
          <div className="bg-bg-nested/40 p-4 border border-border-subtle rounded-xl space-y-3 shrink-0">
            <span className="text-[10px] uppercase font-bold text-text-muted block flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent-primary" /> Algorithmic Specifications
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs leading-normal font-sans">
              <div className="bg-bg-card border border-border-subtle p-2 rounded-lg">
                <span className="text-[9px] text-text-muted block">Key Exchange Size</span>
                <span className="font-mono font-bold text-text-primary mt-0.5 inline-block">
                  {currentScenario.keyExchangeSize} B
                </span>
              </div>
              <div className="bg-bg-card border border-border-subtle p-2 rounded-lg">
                <span className="text-[9px] text-text-muted block">Signature Size</span>
                <span className="font-mono font-bold text-text-primary mt-0.5 inline-block">
                  {currentScenario.signatureSize} B
                </span>
              </div>
              <div className="bg-bg-card border border-border-subtle p-2 rounded-lg">
                <span className="text-[9px] text-text-muted block">Cert Size (Est.)</span>
                <span className="font-mono font-bold text-text-primary mt-0.5 inline-block">
                  {currentScenario.certSize} B
                </span>
              </div>
              <div className="bg-bg-card border border-border-subtle p-2 rounded-lg">
                <span className="text-[9px] text-text-muted block">Quantum Vulnerable</span>
                <span className={`font-black mt-0.5 inline-block uppercase text-[10px] ${currentScenario.vulnerable ? 'text-status-danger' : 'text-status-success'}`}>
                  {currentScenario.vulnerable ? 'YES (Shor\'s)' : 'NO (Secure)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6 h-full flex flex-col justify-between">
        
        {/* Scenario Selectors */}
        <div className="shrink-0 space-y-2 select-none">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">1. Select Cryptographic Handshake Profile</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PQC_HANDSHAKE_SCENARIOS.map(s => {
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
                    <span className="text-[9px] font-mono uppercase text-accent-primary font-bold">
                      {s.securityLevel}
                    </span>
                    <h4 className="text-xs font-black text-text-primary mt-1 leading-snug group-hover:text-accent-primary">
                      {s.name}
                    </h4>
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

        {/* Handshake Sequence Diagrams */}
        <div className="flex-1 min-h-0 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="space-y-4 select-none">
            <span className="text-[10px] uppercase font-bold text-text-muted block flex items-center gap-1"><Network className="w-3.5 h-3.5" /> 2. TLS 1.3 Protocol Handshake Flow</span>
            
            {/* Visual Handshake Diagram */}
            <div className="border border-border-subtle/40 bg-bg-nested/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center relative overflow-hidden gap-6 min-h-[140px]">
              {/* Client Box */}
              <div className={`text-center p-3 rounded-xl border transition-all shrink-0 w-28 md:w-32 ${
                currentStep.wireHighlight === 'client' ? 'bg-accent-glow border-accent-primary text-text-primary' : 'bg-bg-card border-border-subtle text-text-secondary'
              }`}>
                <HardDrive className={`w-6 h-6 mx-auto mb-1 ${currentStep.wireHighlight === 'client' ? 'text-accent-primary animate-pulse' : 'text-text-muted'}`} />
                <span className="text-xs font-black">Client Browser</span>
              </div>

              {/* Wire Connection & Flow */}
              <div className="flex-1 w-full relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-border-subtle absolute top-1/2 left-0 -translate-y-1/2"></div>
                <div className={`w-3.5 h-3.5 rounded-full bg-accent-primary absolute top-1/2 -translate-y-1/2 flex items-center justify-center shadow transition-all ${
                  currentStep.wireHighlight === 'client' ? 'left-[20%] animate-ping' :
                  currentStep.wireHighlight === 'server' ? 'left-[80%] animate-ping' :
                  'left-1/2 -translate-x-1/2 animate-pulse'
                }`}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>
                <span className="bg-bg-card border border-border-subtle px-2.5 py-1 rounded text-[9px] font-mono font-bold text-text-muted relative z-10">
                  {currentStep.name} ({currentStep.packetSize} Bytes)
                </span>
              </div>

              {/* Server Box */}
              <div className={`text-center p-3 rounded-xl border transition-all shrink-0 w-28 md:w-32 ${
                currentStep.wireHighlight === 'server' ? 'bg-accent-glow border-accent-primary text-text-primary' : 'bg-bg-card border-border-subtle text-text-secondary'
              }`}>
                <Network className={`w-6 h-6 mx-auto mb-1 ${currentStep.wireHighlight === 'server' ? 'text-accent-primary animate-pulse' : 'text-text-muted'}`} />
                <span className="text-xs font-black">Target Server</span>
              </div>
            </div>

            {/* Current step explanation */}
            <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-accent-secondary font-bold">Step {stepIndex + 1}: {currentStep.name}</span>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">{currentStep.desc}</p>
            </div>
          </div>

          {/* Packet Size Fragmentation Gauge */}
          <div className="border-t border-border-subtle/40 pt-4 space-y-3 select-none">
            <span className="text-[10px] uppercase font-bold text-text-muted block flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-accent-secondary" /> Packet Size Analysis & Fragmentation Gauge
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted">
                <span>TOTAL HANDSHAKE PACKETS: {currentStep.packetSize} BYTES</span>
                <span className={currentStep.packetSize > 1500 ? 'text-status-warning' : 'text-text-muted'}>
                  {currentStep.packetSize > 1500 ? '⚠️ Network MTU Exceeded (1500B limit) — Packet Fragmentation Required!' : '✓ Safe Under Standard MTU Limit'}
                </span>
              </div>
              <div className="w-full h-3 bg-bg-sidebar rounded-full border border-border-subtle overflow-hidden relative">
                {/* Standard MTU threshold divider (1500 bytes) */}
                <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-status-warning/40 z-10" title="Ethernet MTU Limit (1500 bytes)"></div>
                
                {/* Visual bar sizing (scaling based on 10,000 bytes maximum) */}
                <div 
                  className={`h-full transition-all duration-300 ${
                    currentScenario.vulnerable ? 'bg-status-danger/70' :
                    currentStep.packetSize > 1500 ? 'bg-status-warning/70 animate-pulse' : 'bg-status-success/70'
                  }`}
                  style={{ width: `${Math.min((currentStep.packetSize / 10000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[8px] font-mono font-bold text-text-muted leading-none">
                <span>0 B</span>
                <span>1,500 B (Standard MTU)</span>
                <span>5,000 B</span>
                <span>10,000 B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Handshake Trigger Buttons */}
        <div className="shrink-0 flex gap-3 select-none">
          <button
            onClick={() => setStepIndex(0)}
            className="px-4 py-3 rounded-xl bg-bg-card hover:bg-bg-nested/60 border border-border-subtle text-xs font-bold font-sans transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-text-muted" /> Reset Handshake
          </button>
          
          <button
            onClick={handleNextStep}
            className="flex-1 py-3 px-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold font-sans shadow-md transition flex items-center justify-center gap-1.5"
          >
            {stepIndex < currentScenario.steps.length - 1 ? (
              <>
                Advance Handshake Step <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </>
            ) : (
              <>
                Complete Handshake Profile 🎉
              </>
            )}
          </button>
        </div>

        {/* Bottom Explainer */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block flex items-center gap-1.5"><Info className="w-4 h-4 text-accent-primary" /> Post-Quantum Cryptography Migration Strategy</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="font-bold text-accent-primary block mb-0.5">The &quot;Harvest Now, Decrypt Later&quot; Threat</span>
              Adversaries are actively capturing classical encrypted web traffic today. While they cannot decrypt it now, they store it until a sufficiently powerful quantum computer is built to compute private classical keys using Shor\'s algorithm.
            </div>
            <div>
              <span className="font-bold text-accent-secondary block mb-0.5">Recommended Migration: Dual Hybrids</span>
              To mitigate MTU drop risks and preserve certification boundaries (e.g. FIPS compliance), implement concatenated hybrid agreements like X25519+ML-KEM. This satisfies classical audit boundaries while achieving quantum resilience.
            </div>
          </div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
