import { useState, useEffect } from 'react'
import { Fingerprint, RotateCcw, Sliders, Lock, Cpu, AlertTriangle, FileCode, RefreshCw } from 'lucide-react'

export default function PasskeyInternals() {
  const [origin, setOrigin] = useState('https://app.aboutiam.com')
  const [challenge, setChallenge] = useState('auth_chall_8a3f9d12')
  
  // Authenticator flags
  const [upFlag, setUpFlag] = useState(true) // User Presence
  const [uvFlag, setUvFlag] = useState(true) // User Verification

  const [generating, setGenerating] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  // Decoded payload segments
  const [clientDataJson, setClientDataJson] = useState('')
  const [authDataHex, setAuthDataHex] = useState('')
  const [cosePublicKey, setCosePublicKey] = useState('')

  const handleSimulate = async () => {
    setGenerating(true)
    setLogs([
      `[BROWSER] navigator.credentials.create() invoked.`,
      `[BROWSER] Preparing WebAuthn PublicKeyCredentialCreationOptions...`,
      `[HARDWARE] Prompting biometric verification enclave (TouchID / Windows Hello)...`
    ])

    setTimeout(async () => {
      // 1. Generate clientDataJSON
      const clientDataObj = {
        type: "webauthn.create",
        challenge: btoa(challenge).replace(/=/g, ''),
        origin: origin,
        crossOrigin: false
      }
      const clientDataStr = JSON.stringify(clientDataObj, null, 2)
      setClientDataJson(clientDataStr)

      // 2. Generate authenticatorData (AuthData) byte-by-byte hex
      // rpIdHash (32 bytes) + flags (1 byte) + signCount (4 bytes) + AAGUID (16 bytes) + CredIDLen (2 bytes) + CredID (16 bytes)
      const flagsByte = (upFlag ? 0x01 : 0x00) | (uvFlag ? 0x04 : 0x00) | 0x40 // AT (Attestation) flag set
      const flagsHex = flagsByte.toString(16).padStart(2, '0')
      
      const rpIdHashHex = '49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763' // SHA256 of app.aboutiam.com
      const signCountHex = '0000002c' // 44 logins
      const aaguidHex = '00000000000000000000000000000000' // Packed zero AAGUID
      const credIdLenHex = '0010' // 16 bytes
      const credIdHex = '61326233633464356536663738393061' // "a2b3c4d5e6f7890a" in ASCII hex

      const completedAuthDataHex = `${rpIdHashHex}${flagsHex}${signCountHex}${aaguidHex}${credIdLenHex}${credIdHex}`
      setAuthDataHex(completedAuthDataHex)

      // 3. Generate CBOR COSE Public Key structure
      const coseObj = {
        "1": 2, // kty: EC2
        "3": -7, // alg: ES256
        "-1": 1, // crv: P-256
        "-2": "764bb78b30d35e165416b9b32cd586a1170f44bc17ef654261", // x-coord
        "-3": "f68e3a2b4cd5e6c71a2bc38f12a4bb5612f0a12e5f6e" // y-coord
      }
      setCosePublicKey(JSON.stringify(coseObj, null, 2))

      setLogs(prev => [
        ...prev,
        `✔ Biometric verification approved by hardware enclave.`,
        `[HARDWARE] Enclave private key coordinates fetched.`,
        `[HARDWARE] Packing Attestation payload structures...`,
        `✔ SUCCESS: Credentials generated. Transmitting ClientData & AuthenticatorData! 🎉`
      ])
      setGenerating(false)
    }, 1500)
  }

  useEffect(() => {
    setTimeout(() => handleSimulate(), 0)
  }, [origin, challenge, upFlag, uvFlag])

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Fingerprint className="w-3.5 h-3.5" /> Passkey Sandbox
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Passkey Internals Playground
        </h2>
        <p className="text-text-secondary">
          Deconstruct the cryptographic and binary metadata generated inside hardware Trusted Platform Modules (TPM) during WebAuthn public-key registrations. Inspect raw `clientDataJSON`, decode binary `authenticatorData` byte-by-byte, and parse COSE CBOR public key maps natively.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input parameters (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Key Creation Parameters
            </h4>

            {/* Relying Party Origin */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="origin-input">Relying Party Origin</label>
              <input
                id="origin-input"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Cryptographic Challenge */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="challenge-input">Server Challenge String</label>
              <input
                id="challenge-input"
                type="text"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Authenticator Flags */}
            <div className="space-y-3.5 border-t border-border-subtle/50 pt-4">
              <span className="text-[10px] text-text-muted font-bold block uppercase">Enclave Authenticator Flags</span>
              
              {/* UP Flag */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight">User Presence (UP)</span>
                  <span className="text-[8px] text-text-muted block">Verify physical touch button was pressed</span>
                </div>
                <button
                  onClick={() => setUpFlag(!upFlag)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    upFlag ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle User Presence flag"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    upFlag ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* UV Flag */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-text-primary block leading-tight">User Verification (UV)</span>
                  <span className="text-[8px] text-text-muted block">Verify biometric match (FaceID / TouchID)</span>
                </div>
                <button
                  onClick={() => setUvFlag(!uvFlag)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    uvFlag ? 'bg-accent-primary' : 'bg-border-subtle'
                  }`}
                  aria-label="Toggle User Verification flag"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    uvFlag ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* MIDDLE COLUMN: Byte-Offset Analyzer Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-accent-primary animate-pulse" /> Binary AuthData byte analyzer
            </h3>
            <button
              onClick={handleSimulate}
              className="px-3 py-1.5 bg-bg-card hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm select-none"
              title="Force key regeneration"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Force Keygen
            </button>
          </div>

          {generating ? (
            <div className="p-12 text-center flex items-center justify-center bg-bg-card border border-border-subtle rounded-2xl h-[340px]">
              <RefreshCw className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-inner h-[380px] overflow-y-auto space-y-4">
              
              {/* rpIdHash block */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-text-muted uppercase font-mono block">Bytes 0-31: rpIdHash (SHA-256 hash of origin domain)</span>
                <div className="p-2.5 rounded bg-bg-nested font-mono text-[9px] text-text-secondary break-all">
                  {authDataHex.substring(0, 64)}
                </div>
              </div>

              {/* Flags byte */}
              <div className="space-y-1.5 border-t border-border-subtle/40 pt-3">
                <span className="text-[9px] font-black text-text-primary uppercase font-mono block flex items-center justify-between">
                  <span>Byte 32: flags ({authDataHex.substring(64, 66)})</span>
                  <span className="text-[8px] bg-accent-glow text-accent-primary px-1.5 py-0.5 rounded">Binary parsed</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono leading-relaxed font-bold">
                  <div className="p-2 rounded bg-bg-nested border border-border-subtle text-center">
                    <span className="block text-text-muted text-[8px]">UP (Presence)</span>
                    <span className={upFlag ? 'text-emerald-500' : 'text-text-muted'}>{upFlag ? '1 (Active)' : '0'}</span>
                  </div>
                  <div className="p-2 rounded bg-bg-nested border border-border-subtle text-center">
                    <span className="block text-text-muted text-[8px]">UV (Verified)</span>
                    <span className={uvFlag ? 'text-emerald-500' : 'text-text-muted'}>{uvFlag ? '1 (Active)' : '0'}</span>
                  </div>
                  <div className="p-2 rounded bg-bg-nested border border-border-subtle text-center">
                    <span className="block text-text-muted text-[8px]">AT (Attestation)</span>
                    <span className="text-emerald-500">1 (Active)</span>
                  </div>
                </div>
              </div>

              {/* signCount bytes */}
              <div className="space-y-1.5 border-t border-border-subtle/40 pt-3">
                <span className="text-[9px] font-black text-text-muted uppercase font-mono block">Bytes 33-36: signCount (4-byte signature counter)</span>
                <div className="p-2.5 rounded bg-bg-nested font-mono text-[9px] text-text-secondary">
                  {authDataHex.substring(66, 74)} <span className="text-text-muted font-sans font-bold ml-1">(Decoded value: 44 client logins)</span>
                </div>
              </div>

              {/* Credential ID and coordinates */}
              <div className="space-y-1.5 border-t border-border-subtle/40 pt-3">
                <span className="text-[9px] font-black text-text-muted uppercase font-mono block">Bytes 53+: Attested Credential data bytes</span>
                <div className="p-2.5 rounded bg-bg-nested font-mono text-[9px] text-text-secondary break-all">
                  <span className="text-purple-400 font-semibold">{authDataHex.substring(106, 110)}</span>
                  <span className="text-blue-400 font-semibold">{authDataHex.substring(110)}</span>
                  <span className="text-text-muted font-sans font-bold block mt-1">
                    (Parsed Credential Length: 16 bytes | ID: 'a2b3c4d5e6f7890a')
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* DIAGNOSTIC CONSOLE */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span>Biometric Handshake Terminal</span>
              <span>STATE: {generating ? 'GENERATING' : 'READY'}</span>
            </div>
            <div className="h-24 overflow-y-auto text-emerald-400 space-y-1 select-text">
              {logs.map((log, idx) => (
                <div key={idx} className={
                  log.startsWith('✔') || log.includes('SUCCESS') ? 'text-emerald-500 font-bold' :
                  log.startsWith('[HARDWARE]') ? 'text-blue-400' : ''
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: clientDataJSON & COSE Public Key displays (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* clientDataJSON card */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between h-[210px]">
            <span className="text-[9px] text-text-muted font-bold uppercase font-mono border-b border-border-subtle pb-1.5 mb-1 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-accent-primary" /> clientDataJSON Structure
            </span>
            <textarea
              aria-label="clientDataJSON Structure"
              readOnly
              value={clientDataJson}
              className="flex-grow w-full font-mono text-[9px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-2.5 focus:outline-none resize-none h-full text-text-secondary"
            />
          </div>

          {/* COSE Key display */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between h-[210px]">
            <span className="text-[9px] text-text-muted font-bold uppercase font-mono border-b border-border-subtle pb-1.5 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-accent-secondary" /> COSE CBOR Public Key Map
            </span>
            <textarea
              aria-label="COSE CBOR Public Key Map"
              readOnly
              value={cosePublicKey}
              className="flex-grow w-full font-mono text-[9px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-2.5 focus:outline-none resize-none h-full text-text-secondary"
            />
          </div>

          {/* CBOR Analogy takeaway */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm text-[11px] leading-relaxed text-text-secondary space-y-2.5 font-sans">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-accent-secondary" /> CBOR & COSE standards
            </h4>
            <p>
              To fit inside lightweight hardware security keys, standard JSON is replaced by **CBOR (Concise Binary Object Representation)**—a binary serialization format. Public keys are packed inside a **COSE (CBOR Object Signing and Encryption)** key map, defining curves and coordinates.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
