import { useState } from 'react'
import { Fingerprint, CheckCircle2, ShieldAlert, Shield, ShieldCheck, Mail, LogIn } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function Fido2ConditionalUi() {
  const { frames: packetFrames, capture, clearFrames } = usePacketCapture()
  const packetCaptureProps = { frames: packetFrames, onClear: clearFrames }
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    resetPlayground
  } = usePlayground({
    moduleId: 'fido2_conditional_ui',
    initialScore: 100,
    maxHints: 3
  })

  const [activeTab, setActiveTab] = useState<'simulation' | 'code'>('simulation')
  const [email, setEmail] = useState('')
  const [autofillActive, setAutofillActive] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authSuccess, setAuthSuccess] = useState(false)

  // Simulate conditional UI activation
  const activateConditionalUI = () => {
    log('info', "[WebAuthn] navigator.credentials.get({ mediation: 'conditional' }) called.")
    capture({ direction: 'request', protocol: 'WebAuthn API', summary: `mediation: 'conditional'`, raw: `navigator.credentials.get({\n  mediation: 'conditional',\n  publicKey: {\n    challenge: Uint8Array(32),\n    allowCredentials: [] // Discoverable credentials\n  }\n})` })
    setAutofillActive(true)
    if (currentStep === 0) completeStep(1)
  }

  // Simulate selecting the passkey from the autofill dropdown
  const handleAutofillSelect = () => {
    if (!autofillActive) return
    setIsAuthenticating(true)
    setEmail('alex@aboutiam.com')
    log('info', "[Browser] User selected passkey from autofill dialog. Triggering authenticator...")
    
    setTimeout(() => {
      capture({ direction: 'response', protocol: 'Authenticator', summary: `User Verified via Biometrics`, raw: `Hardware Enclave Response:\nUser Presence: Verified\nUser Verification: Verified` })
      log('success', "[Authenticator] Biometric verification successful. Assertion generated.")
      
      setTimeout(() => {
        setAuthSuccess(true)
        setIsAuthenticating(false)
        setAutofillActive(false)
        log('success', "[Relying Party] Assertion verified. Login successful.")
        capture({ direction: 'response', protocol: 'RP API', summary: `200 OK - Login Complete`, raw: `HTTP/1.1 200 OK\n\n{\n  "status": "authenticated",\n  "user": "alex@aboutiam.com"\n}` })
        if (currentStep === 1) completeStep(2)
      }, 800)
    }, 1500)
  }

  return (
    <PlaygroundShell
      title="Passkey Conditional UI (Autofill)"
      description="Experience how WebAuthn's mediation: 'conditional' seamlessly integrates passkeys directly into standard form autocomplete dropdowns, eliminating the need for separate 'Log in with Passkey' buttons."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={() => {
        if (currentStep === 0) revealHint("Click 'Enable Conditional UI' to simulate a site calling the WebAuthn API on page load.")
        else if (currentStep === 1) revealHint("Click on the email input field to see the native passkey autofill suggestion, then select it.")
      }}
      onReset={() => {
        resetPlayground()
        setEmail('')
        setAutofillActive(false)
        setIsAuthenticating(false)
        setAuthSuccess(false)
        clearFrames()
      }}
      sidebarContent={<TraceTerminal logs={logs} title="Browser API Log" />}
      packetCapture={packetCaptureProps}
    >
      <div className="flex flex-col h-full bg-bg-base overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="flex border-b border-border-subtle bg-bg-sidebar overflow-x-auto">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'simulation' ? 'border-accent-primary text-accent-primary bg-bg-nested' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Shield className="w-4 h-4" /> Passkey Login Experience
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'code' ? 'border-accent-primary text-accent-primary bg-bg-nested' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Fingerprint className="w-4 h-4" /> Implementation Code
          </button>
        </div>

        {/* Workspace Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-bg-base/50 flex items-center justify-center relative">
          
          {activeTab === 'simulation' && (
            <div className="w-full max-w-sm">
              {!autofillActive && !authSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-start gap-3 shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-status-warning shrink-0" />
                  <div className="text-xs text-text-primary font-medium leading-relaxed">
                    Conditional UI is currently disabled. In the real world, a site calls the API instantly on page load.
                    <button 
                      onClick={activateConditionalUI}
                      className="mt-3 w-full py-2 bg-status-warning hover:bg-status-warning/90 text-slate-900 font-bold rounded shadow-sm transition"
                    >
                      Enable Conditional UI
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center mx-auto mb-4 border border-accent-primary/20">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary">Sign In</h3>
                  <p className="text-xs text-text-secondary">Welcome back to AboutIAM Secure Vault.</p>
                </div>

                {authSuccess ? (
                  <div className="p-6 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <ShieldCheck className="w-12 h-12 text-status-success mx-auto" />
                    <h4 className="text-lg font-bold text-text-primary">Authenticated!</h4>
                    <p className="text-xs text-text-secondary">Logged in securely via Passkey.</p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted ml-1">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                        </div>
                        <input
                          type="email"
                          autoComplete="username webauthn"
                          placeholder="alex@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                        />
                        {/* Mock Autofill Dropdown */}
                        {autofillActive && !email && (
                          <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-[#202124] border border-[#3c4043] rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                            <button
                              type="button"
                              onClick={handleAutofillSelect}
                              className="w-full text-left px-3 py-2.5 rounded hover:bg-[#3c4043] flex items-center gap-3 transition"
                            >
                              <Fingerprint className="w-5 h-5 text-accent-primary" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">alex@aboutiam.com</span>
                                <span className="text-[10px] text-gray-400">Sign in with Passkey</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAuthenticating}
                      className="w-full py-2.5 bg-text-primary hover:bg-white text-bg-base text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-bg-base border-t-transparent rounded-full animate-spin" /> Authenticating...</span>
                      ) : (
                        <span className="flex items-center gap-2">Continue <LogIn className="w-4 h-4" /></span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="w-full max-w-3xl space-y-4">
              <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" /> Step 1: Add HTML autocomplete attributes
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  The input field must have <code>autoComplete="webauthn"</code> appended to it to signal to the browser that passkey autofill is supported on this field.
                </p>
                <pre className="p-4 rounded-lg bg-[#0d1117] text-xs font-mono text-gray-300 overflow-x-auto border border-border-subtle/50">
{`<input
  type="email"
  name="username"
  id="username"
  autoComplete="username webauthn"
/>`}
                </pre>
              </div>

              <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" /> Step 2: Call WebAuthn API on Page Load
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Instead of waiting for a button click, immediately call <code>navigator.credentials.get()</code> when the page loads, passing <code>mediation: 'conditional'</code>. The browser suppresses the traditional modal popup and instead wires the keys directly into the input dropdown.
                </p>
                <pre className="p-4 rounded-lg bg-[#0d1117] text-xs font-mono text-gray-300 overflow-x-auto border border-border-subtle/50">
{`// Called immediately on page mount, NOT inside an onClick handler
if (window.PublicKeyCredential && PublicKeyCredential.isConditionalMediationAvailable) {
  const isAvailable = await PublicKeyCredential.isConditionalMediationAvailable();
  
  if (isAvailable) {
    try {
      const assertion = await navigator.credentials.get({
        mediation: 'conditional',
        publicKey: {
          challenge: new Uint8Array([/* server challenge */]),
          rpId: window.location.hostname,
          allowCredentials: [], // Empty array triggers discoverable credentials
          userVerification: 'required'
        }
      });
      
      // Send assertion to server for verification
      await sendAssertionToServer(assertion);
      
    } catch (err) {
      console.error("Conditional UI error", err);
    }
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlaygroundShell>
  )
}