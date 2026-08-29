import { useState } from 'react'
import { 
  Settings2, Smartphone, Key, HelpCircle, ArrowRight
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { AUTHENTICATOR_DEVICES, validatePasskeyRegistration, type PasskeyPolicy, type AuthenticatorDevice } from '../../data/passkeyPolicyScenarios'

export default function PasskeyPolicyLab() {
  const [policy, setPolicy] = useState<PasskeyPolicy>({
    requireResidentKey: false,
    userVerification: 'preferred',
    restrictAaguid: false,
    requireHardwareAttestation: false
  })

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
    moduleId: 'passkey_policy_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { capture, clearFrames } = usePacketCapture()

  // Evaluate registration on device trigger
  const handleRegisterDevice = (device: AuthenticatorDevice) => {
    log('info', `Initiating WebAuthn registration handshake for device: ${device.name}`)
    
    // Simulate navigator.credentials.create WebAuthn call
    log('info', `[WebAuthn API] navigator.credentials.create({ publicKey: { challenge: Uint8Array, rp: { name: "AboutIAM Enterprise" }, user: { id: "usr-01", name: "admin@corp.com" } } })`)

    // Policy Validation
    const result = validatePasskeyRegistration(device, policy)
    
    result.logs.forEach(msg => {
      if (msg.startsWith('❌')) {
        log('error', msg)
      } else if (msg.startsWith('✓') || msg.startsWith('🎉')) {
        log('success', msg)
      } else {
        log('info', msg)
      }
    })

    // Capture WebAuthn registration payload
    capture({
      direction: 'request',
      protocol: 'FIDO2 / WebAuthn',
      summary: 'RegisterCredential (direct/attestation)',
      raw: `attestationObject: { format: "${device.attestationFormat}", aaguid: "${device.aaguid}", alg: "COSE: ES256 (-7)" }`
    })

    if (result.allowed) {
      log('success', `✓ Device '${device.name}' successfully registered under the current Relying Party policy!`)
      
      // Complete steps if we successfully registered the YubiKey with strict options or any secure setup
      if (policy.requireHardwareAttestation && policy.restrictAaguid && device.id === 'yubikey_5_fips') {
        completeStep(1)
        finishPlayground()
      }
    } else {
      log('error', `❌ Registration failed for '${device.name}' due to strict policy constraints.`)
    }
  }

  const handleReset = () => {
    resetPlayground()
    clearFrames()
    setPolicy({
      requireResidentKey: false,
      userVerification: 'preferred',
      restrictAaguid: false,
      requireHardwareAttestation: false
    })
    log('info', 'Playground simulation has been fully reset.')
  }

  return (
    <PlaygroundShell
      title="Advanced Passkey Policy & Attestation Workbench"
      description="Act as a Relying Party (RP) Security Admin configuring enterprise-grade FIDO2 / WebAuthn registration parameters. Enforce FIPS-restricted AAGUIDs, direct packed attestation anchors, and resident key storage rules."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => {
        revealHint('To complete this lab, toggle BOTH "Require Hardware Attestation" and "Enforce AAGUID restrictions" to active, then successfully register the "YubiKey 5 FIPS" device.')
      }}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6 h-full flex flex-col justify-between">
        
        {/* Policy Configuration Controls */}
        <div className="shrink-0 space-y-3 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-accent-primary animate-spin" /> 1. Relying Party (RP) Registration Policy Configuration
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Resident Key & User Verification */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-sidebar border border-border-subtle select-none">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-text-primary block">Require Resident Key (rk)</span>
                  <span className="text-[10px] text-text-muted leading-tight block mt-0.5">Force the device to store credentials locally (Discoverable Credential). Required for passwordless usernames.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={policy.requireResidentKey}
                  onChange={e => setPolicy(p => ({ ...p, requireResidentKey: e.target.checked }))}
                  className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-0 focus:ring-offset-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-sidebar border border-border-subtle select-none">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-text-primary block">User Verification (uv)</span>
                  <span className="text-[10px] text-text-muted leading-tight block mt-0.5">Configure bio-metric PIN/fingerprint verification requirements for credential creation.</span>
                </div>
                <select
                  value={policy.userVerification}
                  onChange={e => setPolicy(p => ({ ...p, userVerification: e.target.value as 'required' | 'preferred' | 'discouraged' }))}
                  className="p-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary outline-none font-bold"
                >
                  <option value="required">Required</option>
                  <option value="preferred">Preferred</option>
                  <option value="discouraged">Discouraged</option>
                </select>
              </div>
            </div>

            {/* AAGUID and Attestation restrictions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-sidebar border border-border-subtle select-none">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-text-primary block">Require Hardware Attestation</span>
                  <span className="text-[10px] text-text-muted leading-tight block mt-0.5">Enforce direct packed attestation. Rejects synched/software credentials by verifying hardware roots.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={policy.requireHardwareAttestation}
                  onChange={e => setPolicy(p => ({ ...p, requireHardwareAttestation: e.target.checked }))}
                  className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-0 focus:ring-offset-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-sidebar border border-border-subtle select-none">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-text-primary block">Enforce FIPS AAGUID Restriction</span>
                  <span className="text-[10px] text-text-muted leading-tight block mt-0.5">Restricts passkey creations exclusively to authorized FIPS hardware models (e.g. YubiKeys).</span>
                </div>
                <input 
                  type="checkbox"
                  checked={policy.restrictAaguid}
                  onChange={e => setPolicy(p => ({ ...p, restrictAaguid: e.target.checked }))}
                  className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-0 focus:ring-offset-0"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Devices Simulation Selector */}
        <div className="flex-1 min-h-0 space-y-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-accent-secondary" /> 2. Choose User Device and Simulate Registration
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
            {AUTHENTICATOR_DEVICES.map(device => (
              <div 
                key={device.id}
                className="bg-bg-card border border-border-subtle rounded-2xl p-4 flex flex-col justify-between hover:border-accent-primary/40 transition-all shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Key className={`w-4 h-4 ${device.isHardwareBacked ? 'text-accent-primary animate-pulse' : 'text-text-muted'}`} />
                      <span className="text-xs font-black text-text-primary">{device.name}</span>
                    </div>
                    <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                      device.isHardwareBacked ? 'bg-accent-glow text-accent-primary border border-accent-primary/15' : 'bg-bg-sidebar text-text-muted border border-border-subtle'
                    }`}>
                      {device.attachment}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-text-secondary leading-normal mt-2 pr-2">{device.description}</p>
                  
                  <div className="mt-3 flex gap-2 font-mono text-[8px] text-text-muted">
                    <span className="bg-bg-sidebar px-1.5 py-0.5 rounded border border-border-subtle">AAGUID: {device.aaguid.substring(0, 13)}...</span>
                    <span className="bg-bg-sidebar px-1.5 py-0.5 rounded border border-border-subtle">Format: {device.attestationFormat}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterDevice(device)}
                  className="w-full mt-4 py-2 px-3 rounded-lg bg-bg-sidebar hover:bg-accent-primary/10 border border-border-subtle hover:border-accent-primary text-[10px] font-bold font-sans text-text-primary transition flex items-center justify-center gap-1.5 group"
                >
                  Register Authenticator <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Explainer */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-accent-primary" /> FIDO2/WebAuthn Enterprise Attestation Principles</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="font-bold text-accent-primary block mb-0.5">AAGUID (Authenticator Attestation GUID)</span>
              The AAGUID is a 128-bit identifier indicating the precise authenticator model and version. High-security organizations use this list to restrict authentication credentials to verified hardware models, preventing software-emulated credential creation.
            </div>
            <div>
              <span className="font-bold text-accent-secondary block mb-0.5">What Hardware Attestation Solves</span>
              During registration, a secure key signs user credentials with a private attestation key locked inside its hardware enclave. By validating the certificate chain of this attestation back to root CA trust anchors, RPs prove the passkey is hardware-bound.
            </div>
          </div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
