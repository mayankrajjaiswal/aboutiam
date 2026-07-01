import { useState } from 'react'
import { Bot, ShieldCheck, AlertTriangle, Fingerprint, Mic, XCircle } from 'lucide-react'

export default function AIThreatLab() {
  const [fidoEnabled, setFidoEnabled] = useState(false)
  const [attackActive, setAttackActive] = useState(false)
  const [authStatus, setAuthStatus] = useState<'idle' | 'breached' | 'secured'>('idle')

  const triggerAttack = () => {
    setAttackActive(true)
    setTimeout(() => {
      if (fidoEnabled) {
        setAuthStatus('secured')
      } else {
        setAuthStatus('breached')
      }
      setTimeout(() => {
        setAttackActive(false)
      }, 3000)
    }, 1500)
  }

  const reset = () => {
    setAuthStatus('idle')
    setAttackActive(false)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-danger uppercase tracking-wider bg-status-danger/10 px-2.5 py-1 rounded-full border border-status-danger/20">
          <AlertTriangle className="w-3.5 h-3.5" /> Synthetic Identity Threat Lab
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          AI vs. Identity Deepfakes
        </h2>
        <p className="text-text-secondary">
          Generative AI can clone a CEO's voice in 3 seconds. Legacy biometric verification (Voice MFA) is now broken. See how AI breaches legacy systems, and how FIDO2 hardware keys defeat deepfakes.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Simulator Controls & Phone */}
        <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-status-danger/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Smartphone Simulator */}
          <div className={`w-64 h-[400px] rounded-[2rem] border-4 bg-bg-sidebar border-text-primary p-4 flex flex-col relative shadow-xl transition-all duration-300 ${
            authStatus === 'breached' ? 'shadow-status-danger/20 border-status-danger' : 
            authStatus === 'secured' ? 'shadow-status-success/20 border-status-success' : ''
          }`}>
            <div className="w-20 h-4 bg-text-primary rounded-b-xl mx-auto absolute top-0 left-0 right-0"></div>
            
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 mt-6">
              {authStatus === 'idle' && !attackActive && (
                <>
                  <div className="w-16 h-16 rounded-full bg-bg-nested flex items-center justify-center text-text-secondary">
                    <Mic className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Awaiting Voice Verification</h3>
                  <p className="text-[10px] text-text-muted px-4">Please say: "My voice is my password."</p>
                </>
              )}

              {attackActive && (
                <>
                  <div className="w-16 h-16 rounded-full bg-status-danger/20 flex items-center justify-center text-status-danger animate-pulse">
                    <Bot className="w-8 h-8 animate-bounce" />
                  </div>
                  <h3 className="text-sm font-bold text-status-danger animate-pulse">Injecting AI Voice Clone...</h3>
                  <p className="text-[10px] text-text-muted px-4">Synthesizing vocal patterns...</p>
                </>
              )}

              {authStatus === 'breached' && !attackActive && (
                <>
                  <div className="w-16 h-16 rounded-full bg-status-danger flex items-center justify-center text-white shadow-lg shadow-status-danger/30">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-status-danger">SYSTEM BREACHED</h3>
                  <p className="text-[10px] text-status-danger px-4">AI voice matched with 99.8% accuracy. Attacker authorized.</p>
                </>
              )}

              {authStatus === 'secured' && !attackActive && (
                <>
                  <div className="w-16 h-16 rounded-full bg-status-success flex items-center justify-center text-white shadow-lg shadow-status-success/30">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-status-success">ATTACK BLOCKED</h3>
                  <p className="text-[10px] text-status-success px-4">Voice matched, but cryptographic FIDO2 hardware signature is missing. Access denied.</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-4 w-full justify-center relative z-10">
            <button
              onClick={authStatus !== 'idle' ? reset : triggerAttack}
              disabled={attackActive}
              className={`px-6 py-3 rounded-lg text-white text-xs font-bold transition-all shadow-md ${
                authStatus !== 'idle' ? 'bg-text-secondary hover:bg-text-primary' : 'bg-status-danger hover:bg-status-danger/90 shadow-status-danger/20'
              }`}
            >
              {authStatus !== 'idle' ? 'Reset Simulator' : 'Trigger Generative AI Attack'}
            </button>
          </div>
        </div>

        {/* Defense Configurator */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="font-bold text-text-primary text-sm border-b border-border-subtle pb-2">Defense Configurator</h4>
            <div className="space-y-4 pt-2">
              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                !fidoEnabled ? 'bg-accent-glow/10 border-accent-primary shadow-sm' : 'bg-bg-sidebar/50 border-border-subtle opacity-70'
              }`}>
                <input type="radio" checked={!fidoEnabled} onChange={() => setFidoEnabled(false)} className="mt-1" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-text-primary block">Legacy Voice/Video MFA</span>
                  <span className="text-[10px] text-text-secondary leading-relaxed block">Relies on biometric matching (voiceprints or face mapping). Vulnerable to real-time deepfakes and audio cloning algorithms.</span>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                fidoEnabled ? 'bg-status-success/10 border-status-success shadow-sm' : 'bg-bg-sidebar/50 border-border-subtle opacity-70'
              }`}>
                <input type="radio" checked={fidoEnabled} onChange={() => setFidoEnabled(true)} className="mt-1" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5" /> FIDO2 / WebAuthn Hardware Shield</span>
                  <span className="text-[10px] text-text-secondary leading-relaxed block">Relies on asymmetric cryptography bound to the physical device. Even if the AI perfectly clones the voice, it does not possess the physical private key chip.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Expert Takeaway */}
          <div className="p-6 rounded-2xl bg-bg-sidebar border border-border-subtle space-y-2 text-xs font-medium text-text-secondary leading-relaxed">
            <span className="text-accent-primary font-bold uppercase tracking-wider text-[10px] block">Architect Takeaway</span>
            <p>
              In a post-AI world, human-verifiable traits (voice, video, knowledge questions) are no longer secure authentication factors. IAM architectures must aggressively transition to <strong className="text-text-primary">Possession-Based Cryptography</strong> (Passkeys, Security Keys). Cryptographic math cannot be "deepfaked".
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
