import { useState } from 'react'
import { Sliders, ShieldAlert, AlertTriangle } from 'lucide-react'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { usePlayground } from '../../lib/sdk/usePlayground'

export default function AdvancedOauthHackDefend() {
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
    moduleId: 'advanced_oauth_hack_defend',
    initialScore: 100,
    maxHints: 3
  })

  const [exploitTarget, setExploitTarget] = useState('algorithm_confusion')
  const [selectedAlg, setSelectedAlg] = useState('RS256')
  const [selectedKey, setSelectedKey] = useState('Issuer Public Key')
  const [hackedToken, setHackedToken] = useState('')
  const [defended, setDefended] = useState(false)

  const handleSimulateExploit = () => {
    if (exploitTarget === 'algorithm_confusion') {
      log('info', 'Starting JWT Algorithm Confusion Exploit simulation...')
      log('info', `Crafting JWT Header: {"alg": "${selectedAlg}", "typ": "JWT"}`)
      log('info', `Signing token using: ${selectedKey}`)

      if (selectedAlg === 'HS256' && selectedKey === 'Issuer Public Key') {
        log('success', '🎯 EXPLOIT SUCCESSFUL! The Authorization Server parsed the public key as an HMAC symmetric secret and authorized access!')
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '')
        const payload = btoa(JSON.stringify({ sub: 'admin', roles: ['admin'] })).replace(/=/g, '')
        setHackedToken(`${header}.${payload}.signature_of_public_key_as_hmac`)
        
        if (!defended) {
          completeStep(1, "Successfully performed algorithm confusion.")
          log('info', 'Mitigation Required: Secure the token signature verification logic to refuse key-type mismatches.')
        }
        } else {
        log('error', '❌ EXPLOIT FAILED: The server rejected the signature. (HINT: Swapping RS256 to symmetric HS256 while using the Public Key exposes key-type mismatches).')
        }
        } else {
        log('info', 'Starting PKCE Authorization Code Injection Exploit simulation...')
        log('info', 'Intercepting Authorization Code without code_verifier...')

        if (!defended) {
        log('success', '🎯 EXPLOIT SUCCESSFUL! Bypassed OAuth client state checks because PKCE challenge verification was disabled on this endpoint!')
        completeStep(2, "Successfully bypassed PKCE verification.")
      } else {
        log('error', '❌ EXPLOIT BLOCKED: The server refused to exchange code because PKCE challenge verification is strictly enforced!')
      }
    }
  }

  const handleApplyDefenses = () => {
    setDefended(true)
    log('success', '🛡️ MITIGATION APPLIED: Enforced strict asymmetric RS256 signature verification and mandated RFC 7636 PKCE verification on the token endpoint!')
    finishPlayground()
  }

  const handleResetAll = () => {
    resetPlayground()
    setDefended(false)
    setHackedToken('')
    setSelectedAlg('RS256')
    setSelectedKey('Issuer Public Key')
  }

  const currentHintMessage = 
    currentStep === 1 
      ? "Try selecting 'HS256' as the signing algorithm and signing with 'Issuer Public Key' to confuse the validator." 
      : "Apply OAuth 2.1 mitigations to lock down the Authorization Server endpoints.";

  return (
    <PlaygroundShell
      title="Advanced OAuth 2.1 Threat Modeling & Mitigation Simulator"
      description="Interactive multi-stage hacking playground. Model the JWT Algorithm Confusion exploit and simulate the PKCE authorization-code injection bypass, then apply secure OAuth 2.1 mitigations."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint(currentHintMessage)}
      onReset={handleResetAll}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        
        {/* Stage selection tabs */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" />
              Exploit Target Console
            </h3>
            <span className="text-[10px] bg-status-danger/10 border border-status-danger/20 text-status-danger px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Threat Lab</span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            <button
              onClick={() => setExploitTarget('algorithm_confusion')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                exploitTarget === 'algorithm_confusion'
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm'
                  : 'border-border-subtle bg-bg-nested text-text-secondary'
              }`}
            >
              JWT Algorithm Confusion
            </button>
            <button
              onClick={() => setExploitTarget('pkce_bypass')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                exploitTarget === 'pkce_bypass'
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm'
                  : 'border-border-subtle bg-bg-nested text-text-secondary'
              }`}
            >
              PKCE Injection Bypass
            </button>
          </div>

          {/* Dynamic Exploit Controls */}
          {exploitTarget === 'algorithm_confusion' ? (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Signing Algorithm Header (alg)</label>
                  <select
                    value={selectedAlg}
                    onChange={e => setSelectedAlg(e.target.value)}
                    className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                  >
                    <option value="RS256">RS256 (Asymmetric public/private key)</option>
                    <option value="HS256">HS256 (Symmetric shared secret)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Verification Key Selection</label>
                  <select
                    value={selectedKey}
                    onChange={e => setSelectedKey(e.target.value)}
                    className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                  >
                    <option value="Issuer Public Key">Issuer Public Key (PEM)</option>
                    <option value="HMAC Shared Secret">HMAC Symmetric Secret</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-status-warning/5 border border-status-warning/20 rounded-xl text-status-warning flex gap-2 items-center leading-normal text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Under Algorithm Confusion, an attacker registers asymmetric RS256 tokens signed with local HS256, confusing servers that trust public keys as symmetric parameters.</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-bg-sidebar rounded-xl border border-border-subtle space-y-2 text-xs">
              <span className="font-bold text-text-primary block">Target Endpoint: /oauth/token</span>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                By omitting the `code_verifier` during client auth-code exchange, an attacker can attempt to inject intercepted codes without proving possession of the secure local state.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSimulateExploit}
              className="flex-1 py-2.5 rounded-xl bg-status-danger hover:bg-status-danger/90 text-white text-xs font-bold transition-all shadow-md shadow-status-danger/10"
            >
              💥 Simulate Exploit Execution
            </button>
            <button
              onClick={handleApplyDefenses}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
            >
              🛡️ Apply OAuth 2.1 Mitigations
            </button>
          </div>
        </div>

        {/* Hacked Token Viewer */}
        {hackedToken && exploitTarget === 'algorithm_confusion' && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-status-danger">
              <ShieldAlert className="w-4 h-4" />
              <span>Forged Admin Bearer Token Generated</span>
            </div>
            <pre className="text-[10px] font-mono bg-black text-text-secondary border border-zinc-800 rounded-xl p-3.5 overflow-x-auto select-all leading-normal whitespace-pre break-all">
              {hackedToken}
            </pre>
          </div>
        )}

      </div>
    </PlaygroundShell>
  )
}
