import { useState } from 'react'
import { Server, LayoutGrid, Key, ShieldCheck, ArrowRight, ArrowRightLeft, Lock } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function PhantomTokenLab() {
  const { score, currentStep, isCompleted, logs, hintsRevealed, log, revealHint, completeStep, resetPlayground } = usePlayground({
    moduleId: 'phantom-token',
    initialScore: 100,
    maxHints: 3
  })

  // Lab State
  const phantomToken = 'pt_r7x92jKlm4'
  const [activeStage, setActiveStage] = useState<'idle' | 'client_req' | 'introspection' | 'translation' | 'backend_req' | 'success'>('idle')
  const [internalJwt, setInternalJwt] = useState<string | null>(null)

  const runFlow = () => {
    setActiveStage('client_req')
    log('info', `[Browser Client] Sending opaque Phantom Token (${phantomToken}) to API Gateway`)
    
    setTimeout(() => {
      setActiveStage('introspection')
      log('warning', `[API Gateway] Intercepted opaque token. Requesting introspection from IdP...`)
      if (currentStep === 0) completeStep(0)
      
      setTimeout(() => {
        setActiveStage('translation')
        log('success', `[IdP] Introspection valid. Returning full JWT claims to Gateway.`)
        
        setTimeout(() => {
          setActiveStage('backend_req')
          const mockJwt = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhbGljZSIsInJvbGUiOiJhZG1pbiJ9.7x9_sig'
          setInternalJwt(mockJwt)
          log('info', `[API Gateway] Swapping Phantom Token for rich JWT (${mockJwt}) and forwarding to backend service...`)
          if (currentStep === 1) completeStep(1)
          
          setTimeout(() => {
            setActiveStage('success')
            log('success', `[Microservice] JWT validated securely. 200 OK.`)
            if (currentStep === 2) completeStep(2)
          }, 1500)
        }, 1500)
      }, 1500)
    }, 1500)
  }

  const handleReset = () => {
    resetPlayground()
    setActiveStage('idle')
    setInternalJwt(null)
  }

  return (
    <PlaygroundShell
      title="API Gateway Phantom Token Sandbox"
      description="Learn the ultimate enterprise pattern for securing SPAs. Watch the API Gateway intercept an opaque string and translate it into a digitally signed JWT for internal microservices, hiding all PII from the public frontend."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Click Execute Flow to watch the opaque token be swallowed by the gateway and mapped to a secure backend JWT.')}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-8">
        
        <div className="flex justify-center">
          <button
            onClick={runFlow}
            disabled={activeStage !== 'idle'}
            className="px-6 py-3 rounded-lg bg-accent-primary hover:bg-accent-hover text-white font-bold transition-all disabled:opacity-50 shadow hover-cyber-glow"
          >
            {activeStage === 'idle' ? 'Execute Phantom Token Flow' : 'Flow Active...'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-center relative">
          
          {/* Node 1: Browser Client */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${activeStage === 'client_req' ? 'bg-bg-sidebar border-accent-primary shadow-lg shadow-accent-primary/20 scale-105' : 'bg-bg-card border-border-subtle'}`}>
            <LayoutGrid className={`w-8 h-8 mx-auto mb-3 ${activeStage === 'client_req' ? 'text-accent-primary animate-pulse' : 'text-text-muted'}`} />
            <h4 className="font-bold text-sm text-text-primary">Browser SPA</h4>
            <p className="text-[10px] text-text-secondary mt-1">Holds Opaque Token</p>
            
            <div className={`mt-4 p-2 rounded border bg-slate-950 font-mono text-[10px] transition-all ${activeStage === 'client_req' ? 'border-accent-primary/50 text-accent-primary' : 'border-border-subtle/50 text-slate-500'}`}>
              Authorization: Bearer <br/>
              <span className="font-bold tracking-widest">{phantomToken}</span>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center -mx-4 z-10">
            <ArrowRight className={`w-6 h-6 transition-all ${activeStage === 'client_req' ? 'text-accent-primary animate-pulse' : 'text-border-subtle'}`} />
          </div>

          {/* Node 2: API Gateway */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${activeStage === 'introspection' || activeStage === 'translation' || activeStage === 'backend_req' ? 'bg-bg-sidebar border-status-warning shadow-lg shadow-status-warning/20 scale-105 z-20' : 'bg-bg-card border-border-subtle'}`}>
            <ShieldCheck className={`w-8 h-8 mx-auto mb-3 ${activeStage === 'introspection' || activeStage === 'translation' || activeStage === 'backend_req' ? 'text-status-warning animate-pulse' : 'text-text-muted'}`} />
            <h4 className="font-bold text-sm text-text-primary">API Gateway</h4>
            <p className="text-[10px] text-text-secondary mt-1">Token Exchange Broker</p>
            
            <div className={`mt-4 p-2 rounded border bg-slate-950 text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${activeStage === 'introspection' ? 'border-status-warning/50 text-status-warning' : 'border-border-subtle/50 text-slate-500'}`}>
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Introspecting Opaque String
            </div>
            
            <div className={`mt-2 p-2 rounded border bg-slate-950 text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${activeStage === 'translation' ? 'border-status-success/50 text-status-success' : 'border-border-subtle/50 text-slate-500'}`}>
              <Key className="w-3.5 h-3.5" />
              Injecting Signed JWT
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center -mx-4 z-10">
            <ArrowRight className={`w-6 h-6 transition-all ${activeStage === 'backend_req' ? 'text-accent-primary animate-pulse' : 'text-border-subtle'}`} />
          </div>

          {/* Node 3: Internal Microservice */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${activeStage === 'success' ? 'bg-bg-sidebar border-status-success shadow-lg shadow-status-success/20 scale-105' : 'bg-bg-card border-border-subtle'}`}>
            <Server className={`w-8 h-8 mx-auto mb-3 ${activeStage === 'success' ? 'text-status-success animate-bounce' : 'text-text-muted'}`} />
            <h4 className="font-bold text-sm text-text-primary">Internal Service</h4>
            <p className="text-[10px] text-text-secondary mt-1">Consumes Standard JWT</p>
            
            <div className={`mt-4 p-2 rounded border bg-slate-950 font-mono text-[9px] transition-all ${activeStage === 'success' || internalJwt ? 'border-status-success/50 text-status-success break-all' : 'border-border-subtle/50 text-slate-500'}`}>
              {internalJwt ? (
                <>Authorization: Bearer <br/><span className="font-bold">{internalJwt}</span></>
              ) : (
                <>Awaiting Rich JWT...</>
              )}
            </div>
          </div>

        </div>
        
        {activeStage === 'success' && (
          <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <Lock className="w-8 h-8 text-status-success shrink-0" />
            <div>
              <p className="text-sm font-bold text-text-primary">Perfect Isolation Achieved</p>
              <p className="text-xs text-text-secondary mt-1">The browser holds an unreadable, revokable opaque string. The internal services receive a fully-typed, signed JWT with rich claims. Zero PII is exposed to the frontend!</p>
            </div>
          </div>
        )}

      </div>
    </PlaygroundShell>
  )
}
