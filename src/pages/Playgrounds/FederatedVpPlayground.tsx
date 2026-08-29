import { useState, useEffect } from 'react'
import { 
  ShieldCheck, ShieldAlert, ArrowRight,
  Smartphone, CheckSquare, Square, FileJson, HelpCircle
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { VP_SCENARIOS, type VpClaim } from '../../data/federatedVpScenarios'

export default function FederatedVpPlayground() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('student_exchange')
  const currentScenario = VP_SCENARIOS.find(s => s.id === activeScenarioId) || VP_SCENARIOS[0]
  
  const [claims, setClaims] = useState<VpClaim[]>([])
  const [verificationStep, setVerificationStep] = useState<number>(0)
  const [verificationResult, setVerificationFinal] = useState<boolean | null>(null)

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
    moduleId: 'federated_vp_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { capture, clearFrames } = usePacketCapture()

  // Load claims on scenario change
  useEffect(() => {
    const timer = setTimeout(() => {
      setClaims(currentScenario.claims.map(c => ({ ...c })))
      setVerificationStep(0)
      setVerificationFinal(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [activeScenarioId, currentScenario.claims])

  const toggleClaimDisclosure = (key: string) => {
    setClaims(prev => prev.map(c => c.key === key ? { ...c, disclosed: !c.disclosed } : c))
  }

  const handleVerifyPresentation = () => {
    if (verificationStep === 0) {
      log('info', `[OpenID4VP] Received Verifiable Presentation from wallet...`)
      
      const disclosedClaims = claims.filter(c => c.disclosed)
      log('info', `Disclosed claims parsed: [${disclosedClaims.map(c => c.key).join(', ')}]`)
      
      capture({
        direction: 'request',
        protocol: 'OpenID4VP / SD-JWT',
        summary: 'VerifiablePresentationExchange',
        raw: JSON.stringify({
          _sd: disclosedClaims.map(c => `${c.key}:${c.value}`),
          _sd_hashes: claims.filter(c => !c.disclosed).map(c => `sha256(salt+${c.key})`)
        }, null, 2)
      })

      setVerificationStep(1)
    } else if (verificationStep === 1) {
      log('info', `[Signature Check] Validating issuer cryptographic signature...`)
      log('info', `Issuer: "${currentScenario.issuerName}"`)
      log('info', `✓ Cryptographic signature valid. Certificate matches public key bound to payload.`)
      setVerificationStep(2)
    } else if (verificationStep === 2) {
      log('info', `[Trust Registry Audit] Querying cross-border federated trust list (eIDAS 2.0)...`)
      
      const isTrusted = currentScenario.issuerRegistry !== 'Unlisted'
      const hasRequiredClaims = currentScenario.expectedClaims.every(reqKey => 
        claims.some(c => c.key === reqKey && c.disclosed)
      )

      if (!isTrusted) {
        log('error', `❌ [Trust Failure] Issuer "${currentScenario.issuerName}" is NOT present in any trusted national identity registries. Connection rejected.`)
        setVerificationFinal(false)
        setVerificationStep(3)
      } else if (!hasRequiredClaims) {
        log('error', `❌ [Claims Mismatch] Presentation rejected. Verifier requires claims: [${currentScenario.expectedClaims.join(', ')}], but the user chose to keep one or more required claims private.`)
        setVerificationFinal(false)
        setVerificationStep(3)
      } else {
        log('success', `✓ Issuer is authorized in National Identity Registry (${currentScenario.issuerRegistry}).`)
        log('success', `✓ All expected verification claims successfully matched and verified.`)
        setVerificationFinal(true)
        setVerificationStep(3)

        completeStep(1)
        finishPlayground()
      }
    }
  }

  const handleReset = () => {
    resetPlayground()
    clearFrames()
    setClaims(currentScenario.claims.map(c => ({ ...c })))
    setVerificationStep(0)
    setVerificationFinal(null)
    log('info', 'Playground simulation has been fully reset.')
  }

  return (
    <PlaygroundShell
      title="Dynamic Trust Framework & Verifiable Presentation Playground"
      description="Explore the architecture of eIDAS 2.0 and the European Digital Identity (EUDI) Wallet. Selectively disclose claims, verify cryptographic SD-JWT signatures, and audit issuers against cross-border trust registries."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => {
        revealHint('To complete the simulation, choose the "German Student ID" scenario, ensure both "Family Name" and "Enrollment Status" are checked (disclosed) in your wallet, and run the verification sequence to completion.')
      }}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6 h-full flex flex-col justify-between">
        
        {/* Scenario Selectors */}
        <div className="shrink-0 space-y-2 select-none">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">1. Select Exchange Scenario</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VP_SCENARIOS.map(s => {
              const isSelected = activeScenarioId === s.id
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
                  <h4 className="text-xs font-black text-text-primary group-hover:text-accent-primary">
                    {s.name}
                  </h4>
                  <span className="text-[9px] text-text-muted leading-relaxed mt-1 block">
                    Issuer: {s.issuerName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selective Disclosure Wallet and Verifier Box */}
        <div className="flex-1 min-h-0 space-y-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-accent-secondary" /> 2. Manage Wallet Disclosures & Run Verification Handshake
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto">
            
            {/* Wallet Panel (Col-span 5) */}
            <div className="md:col-span-5 flex flex-col justify-between h-full bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm">
              <div className="space-y-3">
                <span className="text-xs font-bold text-text-primary block flex items-center gap-1"><Smartphone className="w-4 h-4 text-accent-primary" /> EUDI Identity Wallet</span>
                <p className="text-[10px] text-text-secondary leading-normal">
                  Check the boxes below to selectively share only those claims. Unchecked claims remain hidden in your browser as cryptographically locked digests.
                </p>

                <div className="space-y-2 select-none">
                  {claims.map(c => (
                    <div 
                      key={c.key} 
                      onClick={() => toggleClaimDisclosure(c.key)}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        c.disclosed ? 'bg-accent-glow/50 border-accent-primary text-text-primary' : 'bg-bg-sidebar border-border-subtle text-text-muted hover:border-border-subtle/80'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[10px] block">{c.label}</span>
                        <span className="font-mono text-[9px] text-text-secondary">{c.disclosed ? c.value : '•••••••• (Hidden digest)'}</span>
                      </div>
                      {c.disclosed ? (
                        <CheckSquare className="w-4 h-4 text-accent-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerifyPresentation}
                className="w-full mt-4 py-2.5 px-3 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-bold font-sans shadow transition flex items-center justify-center gap-1.5"
              >
                Send Verifiable Presentation <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </div>

            {/* Verifier Panel (Col-span 7) */}
            <div className="md:col-span-7 bg-bg-card border border-border-subtle rounded-2xl p-4 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <span className="text-xs font-bold text-text-primary block">Sorbonne University Verifier Terminal</span>
                  <span className="text-[9px] bg-bg-sidebar text-text-muted border border-border-subtle px-2 py-0.5 rounded font-mono">
                    Expected: {currentScenario.expectedClaims.join(', ')}
                  </span>
                </div>

                {verificationStep === 0 ? (
                  <div className="flex flex-col items-center justify-center h-44 text-slate-500 gap-1 select-none text-center">
                    <FileJson className="w-8 h-8 text-slate-600 animate-pulse" />
                    <span>Waiting for Verifiable Presentation.</span>
                    <span className="text-[9px] text-slate-600 max-w-[200px]">Perform selective disclosure configurations on the left, then click send.</span>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans text-xs">
                    {[
                      { name: '1. Parse Presentation', desc: 'Decoding disclosed values from SD-JWT signature wrapper.', id: 1 },
                      { name: '2. Signature Validation', desc: `Verifying issuer key matching cryptographic certificates.`, id: 2 },
                      { name: '3. Trust Registry Audit', desc: `Cross-checking issuer against national trust databases.`, id: 3 }
                    ].map(s => {
                      const isActive = verificationStep === s.id - 1
                      const isPassed = verificationStep >= s.id
                      return (
                        <div 
                          key={s.id}
                          className={`p-2.5 rounded-xl border flex justify-between items-center gap-3 ${
                            isActive ? 'bg-accent-glow border-accent-primary text-text-primary scale-102' :
                            isPassed ? 'bg-bg-sidebar border-status-success/30 text-status-success' :
                            'bg-bg-sidebar border-border-subtle text-text-muted'
                          }`}
                        >
                          <div>
                            <span className="font-bold block">{s.name}</span>
                            <span className="text-[10px] text-text-muted leading-tight block mt-0.5">{s.desc}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[8px] border ${
                            isActive ? 'bg-accent-glow border-accent-primary text-accent-primary animate-pulse' :
                            isPassed ? 'bg-status-success/15 border-status-success/20 text-status-success' :
                            'bg-bg-card border-border-subtle text-text-muted'
                          }`}>
                            {isActive ? 'RUNNING' : isPassed ? 'PASSED' : 'PENDING'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {verificationResult !== null && (
                <div className={`p-3 rounded-xl border flex items-center justify-between mt-3 font-sans select-none animate-in fade-in duration-300 ${
                  verificationResult ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                }`}>
                  <div className="flex items-center gap-2">
                    {verificationResult ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    <span className="text-xs font-black">PRESENTATION VERIFICATION STATUS:</span>
                  </div>
                  <span className="font-mono font-black text-xs uppercase tracking-wider">
                    {verificationResult ? 'APPROVED' : 'REJECTED'}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Informational Explainer */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-accent-primary" /> Selective Disclosure & SD-JWT Architecture</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="font-bold text-accent-primary block mb-0.5">What is Selective Disclosure?</span>
              Legacy ID cards expose your full name, home address, and precise date of birth just to prove you are over 18 or enrolled in school. Selective disclosure enables holders to disclose ONLY the relevant claims, keeping all other attributes cryptographically secure.
            </div>
            <div>
              <span className="font-bold text-accent-secondary block mb-0.5">The Dynamic Trust Backbone (eIDAS 2.0)</span>
              Cross-border identity validation is powered by a chain of national registries. Trust lists register authorized digital credential issuers (like ministries or universities) in each country, letting verifiers check validity in real-time without central databases.
            </div>
          </div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
