import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Fingerprint, Terminal, Copy, Info, Cpu, CheckCircle2, ShieldCheck, ShieldAlert
} from 'lucide-react'

export default function FIDO2Lab() {
  const [step, setStep] = useState(0)
  const [isCopied, setIsCopied] = useState<string | null>(null)

  interface RealCredentialDetails {
    id: string
    type: string
    clientData: unknown
    flags: { up: boolean; uv: boolean }
    authDataHex: string
  }

  // Real Hardware WebAuthn States
  const [realCred, setRealCred] = useState<RealCredentialDetails | null>(null)
  const [realHandshakeError, setRealHandshakeError] = useState<string | null>(null)
  const [realHandshakeActive, setRealHandshakeActive] = useState(false)

  const handleTriggerRealWebAuthn = async () => {
    setRealHandshakeActive(true)
    setRealCred(null)
    setRealHandshakeError(null)

    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { id: window.location.hostname || "localhost", name: "AboutIAM Sandbox" },
          user: {
            id: new TextEncoder().encode("user_aboutiam_99c1"),
            name: "passkey-tester@aboutiam.com",
            displayName: "Passkey Tester"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
          authenticatorSelection: {
            userVerification: "preferred"
          },
          timeout: 60000
        }
      }) as unknown as { id: string; type: string; response: { clientDataJSON: ArrayBuffer; authenticatorData: ArrayBuffer } }

      if (credential) {
        // Decode clientDataJSON
        const clientDataBytes = new Uint8Array(credential.response.clientDataJSON)
        const clientDataText = new TextDecoder().decode(clientDataBytes)
        const clientDataObj = JSON.parse(clientDataText)

        // Decode authenticatorData
        const authDataBytes = new Uint8Array(credential.response.authenticatorData)
        // Extract flags (UP is Bit 0, UV is Bit 2)
        const flags = authDataBytes[37]
        const up = (flags & 0x01) !== 0
        const uv = (flags & 0x04) !== 0

        setRealCred({
          id: credential.id,
          type: credential.type,
          clientData: clientDataObj,
          flags: { up, uv },
          authDataHex: Array.from(authDataBytes.slice(0, 40)).map(b => b.toString(16).padStart(2, '0')).join(' ') + '...'
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setRealHandshakeError(msg || 'Verification or registration canceled.')
    } finally {
      setRealHandshakeActive(false)
    }
  }

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
        <Link to="/tools/webauthn-decoder" className="text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors inline-block">
          Decode a real clientDataJSON, authenticatorData, or attestationObject →
        </Link>
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

          {/* LIVE HARDWARE HANDSHAKE BOX */}
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Fingerprint className="w-4.5 h-4.5 text-accent-primary animate-pulse" /> Live TPM / Hardware Handshake
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold font-sans">
              Test your device's actual hardware security chip (TPM / Secure Enclave)! Click below to trigger a real, browser-native WebAuthn passkey registration ceremony.
            </p>

            <button
              type="button"
              disabled={realHandshakeActive}
              onClick={handleTriggerRealWebAuthn}
              className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover disabled:opacity-40 text-white font-black rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              {realHandshakeActive ? (
                <>⏳ Complete Fingerprint/Key Scan...</>
              ) : (
                <>🔑 Trigger Live WebAuthn Ceremony</>
              )}
            </button>

            {realHandshakeError && (
              <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/20 text-[10px] font-mono text-status-danger flex items-start gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{realHandshakeError}</span>
              </div>
            )}

            {realCred && (
              <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/20 text-xs space-y-3 font-mono">
                <span className="text-[10px] font-bold text-status-success uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Hardware Credentials Registered!
                </span>

                <div className="space-y-1 text-[10px] text-text-secondary">
                  <p className="font-bold">Credential Details:</p>
                  <p>Type: <strong className="font-bold">{realCred.type}</strong></p>
                  <p className="truncate">ID: {realCred.id}</p>
                </div>

                <div className="space-y-1 text-[10px] text-text-secondary">
                  <p className="font-bold">authenticatorData Flags:</p>
                  <p>✔ User Present (UP): <strong className="font-bold text-status-success">{realCred.flags.up ? 'TRUE' : 'FALSE'}</strong></p>
                  <p>✔ User Verified (UV): <strong className="font-bold text-status-success">{realCred.flags.uv ? 'TRUE' : 'FALSE'}</strong></p>
                </div>

                <div className="space-y-1 text-[10px] text-text-secondary">
                  <p className="font-bold">Binary Attestation Object (Hex Slices):</p>
                  <p className="bg-bg-nested p-1.5 rounded border border-border-subtle/50 break-all text-[9px]">
                    {realCred.authDataHex}
                  </p>
                </div>
              </div>
            )}
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
