import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Fingerprint,
  Sliders,
  ArrowRight,
  Terminal,
} from 'lucide-react'

interface ByteSegment {
  name: string
  start: number
  end: number
  length: number
  color: string
  hexValue: string
  description: string
}

export default function PasskeyInternals() {
  const [origin, setOrigin] = useState('https://app.aboutiam.com')
  const [challenge, setChallenge] = useState('auth_chall_8a3f9d12')
  
  // Authenticator flags
  const [upFlag, setUpFlag] = useState(true) // User Presence
  const [uvFlag, setUvFlag] = useState(true) // User Verification

  const [generating, setGenerating] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  // Decoded payload segments
  const [authDataHex, setAuthDataHex] = useState('')

  // Selected hover segment
  const [hoveredSegment, setHoveredSegment] = useState<ByteSegment | null>(null)

  // Byte structure decomposition
  const flagsByte = (upFlag ? 0x01 : 0x00) | (uvFlag ? 0x04 : 0x00) | 0x40 // AT flag set
  const flagsHex = flagsByte.toString(16).padStart(2, '0')
  const rpIdHashHex = '49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763'
  const signCountHex = '0000002c'
  const aaguidHex = '00000000000000000000000000000000'
  const credIdLenHex = '0010'
  const credIdHex = '61326233633464356536663738393061'

  const segments: ByteSegment[] = [
    {
      name: 'RP ID Hash',
      start: 0,
      end: 31,
      length: 32,
      color: 'bg-blue-500/20 border-blue-500 text-blue-400',
      hexValue: rpIdHashHex,
      description: 'The SHA-256 hash of the relying party domain (origin). Verification ensures the credential is bound to this website only, completely preventing phishing!'
    },
    {
      name: 'Flags',
      start: 32,
      end: 32,
      length: 1,
      color: 'bg-amber-500/20 border-amber-500 text-amber-400',
      hexValue: flagsHex,
      description: `Flags byte indicating UP (User Presence) = Bit 0, UV (User Verification) = Bit 2, and AT (Attestation Data Present) = Bit 6. Active bits set: ${upFlag ? 'UP' : ''} ${uvFlag ? 'UV' : ''} AT.`
    },
    {
      name: 'Sign Counter',
      start: 33,
      end: 36,
      length: 4,
      color: 'bg-purple-500/20 border-purple-500 text-purple-400',
      hexValue: signCountHex,
      description: 'A big-endian monotonic signature counter. The server validates that the counter increments on each login, mitigating device-cloning or replay attacks.'
    },
    {
      name: 'AAGUID',
      start: 37,
      end: 52,
      length: 16,
      color: 'bg-teal-500/20 border-teal-500 text-teal-400',
      hexValue: aaguidHex,
      description: 'Authenticator Attestation GUID. A unique identifier indicating the specific hardware model of the enclave / FIDO2 security key.'
    },
    {
      name: 'Cred ID Len',
      start: 53,
      end: 54,
      length: 2,
      color: 'bg-orange-500/20 border-orange-500 text-orange-400',
      hexValue: credIdLenHex,
      description: 'The big-endian length of the generated credential ID (16 bytes).'
    },
    {
      name: 'Credential ID',
      start: 55,
      end: 70,
      length: 16,
      color: 'bg-rose-500/20 border-rose-500 text-rose-400',
      hexValue: credIdHex,
      description: 'The unique cryptographically-random identifier assigned to this public-key credential by the secure hardware.'
    }
  ]

  const handleSimulate = async () => {
    setGenerating(true)
    setLogs([
      `[BROWSER] navigator.credentials.create() invoked.`,
      `[BROWSER] Preparing WebAuthn PublicKeyCredentialCreationOptions...`,
      `[HARDWARE] Prompting biometric verification enclave (TouchID / Windows Hello)...`
    ])

    setTimeout(async () => {
      // 1. clientDataJSON
      const completedAuthDataHex = `${rpIdHashHex}${flagsHex}${signCountHex}${aaguidHex}${credIdLenHex}${credIdHex}`
      setAuthDataHex(completedAuthDataHex)

      setLogs(prev => [
        ...prev,
        `✔ Biometric verification approved by hardware enclave.`,
        `[HARDWARE] Enclave private key coordinates fetched.`,
        `[HARDWARE] Packing Attestation payload structures...`,
        `✔ SUCCESS: Credentials generated. Transmitting ClientData & AuthenticatorData! 🎉`
      ])
      setGenerating(false)
    }, 1200)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSimulate()
    }, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, challenge, upFlag, uvFlag])

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Fingerprint className="w-3.5 h-3.5" /> TPM Enclave Internals
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            Passkey CBOR Byte-Offset Visualizer
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Deconstruct the raw binary payloads generated inside secure hardware Trusted Platform Modules (TPM) during WebAuthn registrations.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 shrink-0" /> Configuration Parameters
            </span>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label htmlFor="origin-input" className="block text-[10px] font-bold text-text-muted uppercase">Relying Party Origin</label>
                <input
                  id="origin-input"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="challenge-input" className="block text-[10px] font-bold text-text-muted uppercase">Secure Session Challenge</label>
                <input
                  id="challenge-input"
                  type="text"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2 border-t border-border-subtle/50 pt-3">
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Hardware Flag Overrides</label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-text-secondary">User Presence (UP)</span>
                  <input
                    type="checkbox"
                    checked={upFlag}
                    onChange={(e) => setUpFlag(e.target.checked)}
                    className="accent-accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-text-secondary">User Verification (UV)</span>
                  <input
                    type="checkbox"
                    checked={uvFlag}
                    onChange={(e) => setUvFlag(e.target.checked)}
                    className="accent-accent-primary"
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={generating}
                onClick={handleSimulate}
                className="w-full py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-black shadow-sm transition"
              >
                Regenerate Credentials
              </button>
            </div>
          </div>

          {/* Micro-guide */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
            <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle pb-1.5">
              💡 Interactive Verification Hint
            </span>
            <p className="text-xs text-text-secondary leading-normal">
              Hover your mouse over any segment of the binary **authenticatorData** box on the right. It will instantly highlight the offset ranges, decoding the binary layout in real-time.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Offset map visualizer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Visualizer Board */}
          <div className="p-6 bg-bg-card border border-border-subtle rounded-xl shadow-lg space-y-5">
            <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle pb-1.5">
              Hardware AuthenticatorData Binary Structure
            </span>

            {/* Render segments layout */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-muted uppercase block">Binary Layout (Color-Coded Segments):</span>
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-bg-sidebar border border-border-subtle rounded-xl">
                {segments.map((s) => {
                  const hovered = hoveredSegment?.name === s.name
                  return (
                    <div
                      key={s.name}
                      onMouseEnter={() => setHoveredSegment(s)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className={`p-2.5 rounded-lg border cursor-help transition-all text-center flex-1 min-w-[80px] font-mono text-xs font-bold truncate ${s.color} ${
                        hovered ? 'scale-105 ring-2 ring-accent-primary/20' : ''
                      }`}
                    >
                      <div className="text-[10px] uppercase font-black tracking-wider opacity-85 truncate mb-0.5">{s.name}</div>
                      <div className="truncate text-[9px] font-semibold opacity-70">{s.hexValue.substring(0, 10)}...</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hover Segment Details panel */}
            <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle min-h-[100px] flex flex-col justify-center animate-fadeIn">
              {hoveredSegment ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-accent-primary uppercase tracking-wide">{hoveredSegment.name} segment</span>
                    <span className="text-[10px] font-mono text-text-muted font-bold">
                      Bytes: {hoveredSegment.start} – {hoveredSegment.end} (Length: {hoveredSegment.length} byte{hoveredSegment.length > 1 ? 's' : ''})
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-normal font-medium">{hoveredSegment.description}</p>
                </div>
              ) : (
                <div className="text-center text-text-muted text-xs italic">
                  Hover over any color-coded segment above to deconstruct its binary cryptographic parameters…
                </div>
              )}
            </div>

            {/* Complete hexadecimal dump stream */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase block">Full Hexadecimal Attestation Dump:</span>
              <pre className="p-4 bg-black border border-zinc-800 text-[10px] font-mono text-emerald-400 rounded-xl leading-relaxed whitespace-pre-wrap select-all break-all shadow-inner">
                {authDataHex}
              </pre>
            </div>
          </div>

          {/* Logs terminal */}
          <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-accent-secondary" /> TPM Call Trace Logs</span>
            </div>
            <div className="h-28 overflow-y-auto text-emerald-400 space-y-1 mt-3 leading-relaxed">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Awaiting TPM execution...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('✔') ? 'text-emerald-500 font-black' : ''}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
