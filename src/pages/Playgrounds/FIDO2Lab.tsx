import { useState } from 'react'
import { 
  Fingerprint, Terminal, Copy, Info, Cpu, CheckCircle2
} from 'lucide-react'

export default function FIDO2Lab() {
  const [step, setStep] = useState(0)
  const [isCopied, setIsCopied] = useState<string | null>(null)

  const steps = [
    {
      title: '1. WebAuthn Credential Challenge (From Server)',
      desc: 'The backend server generates a cryptographic, high-entropy random challenge and details of the Relying Party (RP) and User ID.',
      request: `navigator.credentials.create({
  publicKey: {
    challenge: Uint8Array.from("challenge_bits_xyz_881", c => c.charCodeAt(0)),
    rp: { id: "aboutiam.com", name: "AboutIAM" },
    user: { id: Uint8Array.from("u12", c => c.charCodeAt(0)), name: "alex@aboutiam.com" },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }] // ES256
  }
})`,
      explanation: 'Secure Concept: The challenge is uniquely tied to this registration session. This prevents attackers from executing replay attacks using old intercepted packets.'
    },
    {
      title: '2. Device Key Generation & User Approval',
      desc: 'The browser prompts the user\'s local hardware biometric sensor (FaceID, Windows Hello, or USB YubiKeys) to approve key creation.',
      request: `<!-- System Dialog Appears -->
FaceID / Fingerprint Scan Verified Natively.
Device security chip (TPM / Secure Enclave) generates a brand new asymmetric key pair.`,
      explanation: 'Uncompromisable Keys: The private key is created inside the hardware\'s secure enclave and NEVER leaves the device. The public key is prepared for transmission back to the website.'
    },
    {
      title: '3. CBOR payload Delivered to Server',
      desc: 'The browser returns the public key and attestation signature inside a clientDataJSON and authenticatorData structure.',
      request: `{
  "id": "ARv882b_Sfla...",
  "type": "public-key",
  "response": {
    "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJjaGFsbGVuZ2Vf...", // Decodes challenge & origin
    "authenticatorData": "SZYN5Yg0JD...", // Flags verifying user presence
    "attestationObject": "o2NhdHRGbX..." // Contains the public key!
  }
}`,
      explanation: 'Audit: The server receives the public key and registers it to your user account. In subsequent logins, the device simply signs a login challenge using the private key, completely eliminating passwords.'
    }
  ]

  const active = steps[step]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied('cb')
    setTimeout(() => setIsCopied(null), 1500)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Fingerprint className="w-3.5 h-3.5" /> Cryptographic Sandbox
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          FIDO2 / WebAuthn & Passkeys Lab
        </h2>
        <p className="text-text-secondary">
          Simulate a browser-native WebAuthn Passkey registration and verify the public key structure, challenges, and clientDataJSON payload blocks in real-time.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stepper controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Cpu className="w-4 h-4 text-accent-primary" /> Key Emulator Controller
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Step through the native browser credential negotiation lifecycle to see how FaceID/biometrics produce public-key challenges.
            </p>
            <div className="space-y-2 text-xs font-bold">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    step === idx 
                      ? 'border-accent-primary bg-accent-glow text-accent-primary' 
                      : 'border-border-subtle bg-bg-sidebar/30 text-text-secondary hover:bg-bg-sidebar hover:text-text-primary'
                  }`}
                >
                  {s.title.substring(0, 24)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Console Viewer */}
        <div className="lg:col-span-2 space-y-4 font-mono">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4 shadow-sm relative overflow-hidden">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-status-success" />
              {active.title}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold font-sans">
              {active.desc}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-primary">
                <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-accent-secondary" /> JavaScript payload / Payload</span>
                <button onClick={() => copyToClipboard(active.request)} className="text-text-muted hover:text-text-primary">
                  {isCopied === 'cb' ? <span className="text-status-success text-[9px]">Copied!</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/50 text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre">
                {active.request}
              </pre>
            </div>

            {/* Explanations */}
            <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/20 flex gap-3 text-xs text-text-primary font-medium items-start font-sans">
              <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-accent-primary text-[10px] uppercase block">Security Lesson</span>
                <p className="leading-relaxed text-text-secondary">
                  {active.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
