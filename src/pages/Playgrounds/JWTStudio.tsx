import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Key, ShieldAlert, Cpu, Terminal, Copy, Check, Info, 
  CheckCircle2, AlertOctagon, Lock, LockOpen
} from 'lucide-react'

type JwtAlg = 'HS256' | 'RS256' | 'none'

export default function JWTStudio() {
  const [alg, setAlg] = useState<JwtAlg>('HS256')
  const [headerJson, setHeaderJson] = useState(`{\n  "alg": "HS256",\n  "typ": "JWT"\n}`)
  const [payloadJson, setPayloadJson] = useState(`{\n  "sub": "aboutiam-user-889",\n  "name": "Alex Hacker",\n  "role": "user",\n  "iat": 1516239022\n}`)
  const [secret, setSecret] = useState('super-secret-security-key-2026')
  
  // Encoded States
  const [headerB64, setHeaderB64] = useState('')
  const [payloadB64, setPayloadB64] = useState('')
  const [signatureB64, setSignatureB64] = useState('')
  const [tokenString, setTokenString] = useState('')

  // Validation States
  const [isHeaderValid, setIsHeaderValid] = useState(true)
  const [isPayloadValid, setIsPayloadValid] = useState(true)
  const [verificationResult, setVerificationResult] = useState<'valid' | 'invalid' | 'none_bypass' | 'jwks_spoofed'>('valid')

  // Exploit Toggles
  const [noneExploitActive, setNoneExploitActive] = useState(false)
  const [jwksExploitActive, setJwksExploitActive] = useState(false)
  const [isCopied, setIsCopied] = useState<string | null>(null)

  // Standard Base64Url encoder helper
  const base64UrlEncode = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str)
      return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    } catch {
      return ''
    }
  }

  // Native HMAC-SHA256 Signature Builder using Browser Web Crypto
  const generateSignature = async (hB64: string, pB64: string, secKey: string, activeAlg: JwtAlg) => {
    if (activeAlg === 'none') {
      setSignatureB64('')
      setVerificationResult('none_bypass')
      return ''
    }

    if (jwksExploitActive) {
      // Simulate signature with a fake private key
      const fakeSig = base64UrlEncode('spoofed_attacker_signature_bits')
      setSignatureB64(fakeSig)
      setVerificationResult('jwks_spoofed')
      return fakeSig
    }

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secKey)
      const messageData = encoder.encode(`${hB64}.${pB64}`)

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData)
      const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      setSignatureB64(sigB64)
      setVerificationResult('valid')
      return sigB64
    } catch (e) {
      setSignatureB64('error_signing')
      setVerificationResult('invalid')
      return ''
    }
  }

  // Handle dynamic text area edits & compute encoded blocks
  const recomputeJWT = async () => {
    let currentHeader = headerJson
    let currentPayload = payloadJson

    // Validate JSON format
    let hValid = false
    let pValid = false
    try {
      JSON.parse(currentHeader)
      hValid = true
    } catch {}
    try {
      const parsed = JSON.parse(currentPayload)
      pValid = true
      // If none exploit is active, modify claims to look like an admin privilege escalation!
      if (noneExploitActive) {
        parsed.role = 'admin'
        currentPayload = JSON.stringify(parsed, null, 2)
      }
    } catch {}

    setIsHeaderValid(hValid)
    setIsPayloadValid(pValid)

    if (!hValid || !pValid) {
      setTokenString('Invalid JSON Inputs')
      return
    }

    // Force algorithm in header JSON dynamically if exploits are toggled
    try {
      const headerObj = JSON.parse(currentHeader)
      if (noneExploitActive) {
        headerObj.alg = 'none'
      } else if (jwksExploitActive) {
        headerObj.alg = 'RS256'
        headerObj.jku = 'https://attacker-domain.com/keys.json' // Spoofed JWK URL
        headerObj.kid = 'key_attacker_01'
      } else {
        headerObj.alg = alg
      }
      currentHeader = JSON.stringify(headerObj, null, 2)
    } catch {}

    const hB64 = base64UrlEncode(currentHeader)
    const pB64 = base64UrlEncode(currentPayload)
    setHeaderB64(hB64)
    setPayloadB64(pB64)

    const activeAlg = noneExploitActive ? 'none' : alg
    const sigB64 = await generateSignature(hB64, pB64, secret, activeAlg)

    if (activeAlg === 'none') {
      setTokenString(`${hB64}.${pB64}.`)
    } else {
      setTokenString(`${hB64}.${pB64}.${sigB64}`)
    }
  }

  // Trigger recomputation on any inputs changes
  useEffect(() => {
    recomputeJWT()
  }, [headerJson, payloadJson, secret, alg, noneExploitActive, jwksExploitActive])

  // If user switches grant or exploit states, synchronize headers
  const triggerNoneExploit = () => {
    if (!noneExploitActive) {
      setJwksExploitActive(false)
    }
    setNoneExploitActive(!noneExploitActive)
  }

  const triggerJwksExploit = () => {
    if (!jwksExploitActive) {
      setNoneExploitActive(false)
      setAlg('RS256')
    }
    setJwksExploitActive(!jwksExploitActive)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(id)
    setTimeout(() => setIsCopied(null), 1500)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Key className="w-3.5 h-3.5" /> Security Playground
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          JWT Studio & Exploit Arena
        </h2>
        <p className="text-text-secondary">
          Craft cryptographically valid JSON Web Tokens completely client-side. Explore and simulate core authentication vulnerabilities like signature exclusions or JWKS domain injection.
        </p>
        <p className="text-xs text-text-muted">
          Just need to decode or sign one token? Try the <Link to="/tools/jwt-decoder" className="text-accent-primary font-semibold hover:text-accent-hover">JWT Decoder</Link> or <Link to="/tools/jwt-generator" className="text-accent-primary font-semibold hover:text-accent-hover">JWT Generator</Link> tools.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Control Console */}
        <div className="lg:col-span-1 space-y-6">
          {/* Signature Configuration */}
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Cpu className="w-4 h-4 text-accent-primary" /> Key Setup
            </h4>
            <div className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="block font-bold text-text-secondary uppercase tracking-wider">Signature Algorithm</label>
                <select 
                  value={alg}
                  onChange={(e) => {
                    setAlg(e.target.value as JwtAlg)
                    setNoneExploitActive(false)
                    setJwksExploitActive(false)
                  }}
                  disabled={noneExploitActive || jwksExploitActive}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary font-bold disabled:opacity-50"
                >
                  <option value="HS256">HS256 (HMAC-SHA256 / Symmetric)</option>
                  <option value="RS256">RS256 (RSA-SHA256 / Asymmetric)</option>
                </select>
              </div>

              {/* Secret Key Input (Only active for Symmetric HS256) */}
              {alg === 'HS256' && !noneExploitActive && !jwksExploitActive && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary uppercase tracking-wider">Shared HMAC Secret</label>
                  <input 
                    type="text" 
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono"
                  />
                </div>
              )}

              {/* Private Key Mock for Asymmetric RS256 */}
              {alg === 'RS256' && !noneExploitActive && !jwksExploitActive && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary uppercase tracking-wider">RSA Private Key (PEM Mock)</label>
                  <pre className="p-2 rounded bg-bg-nested text-[9px] font-mono text-text-muted truncate max-h-[80px] overflow-y-auto">
{`-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6gH3m9V2L4p...
-----END PRIVATE KEY-----`}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Exploit Arena Console */}
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <ShieldAlert className="w-4.5 h-4.5 text-status-danger" /> Exploit Arena
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Activate interactive parameters to see how insecure JSON Web Token parsing engines fail in production environments.
            </p>
            <div className="space-y-2 pt-2">
              {/* None alg toggle */}
              <button 
                onClick={triggerNoneExploit}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  noneExploitActive 
                    ? 'bg-status-danger/10 border-status-danger text-status-danger shadow-md shadow-status-danger/5' 
                    : 'border-border-subtle hover:bg-bg-sidebar text-text-primary'
                }`}
              >
                {noneExploitActive ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-text-muted" />}
                Trigger "none" Alg Attack
              </button>

              {/* JWKS Domain spoof toggle */}
              <button 
                onClick={triggerJwksExploit}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  jwksExploitActive 
                    ? 'bg-status-warning/10 border-status-warning text-status-warning shadow-md shadow-status-warning/5' 
                    : 'border-border-subtle hover:bg-bg-sidebar text-text-primary'
                }`}
              >
                {jwksExploitActive ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-text-muted" />}
                Trigger JWKS Spoofing Attack
              </button>
            </div>
          </div>
        </div>

        {/* Right Editor Panes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Validation Status Strip */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
            verificationResult === 'valid' && 'bg-status-success/5 border-status-success/30 text-status-success'
          } ${
            verificationResult === 'none_bypass' && 'bg-status-danger/5 border-status-danger/30 text-status-danger'
          } ${
            verificationResult === 'jwks_spoofed' && 'bg-status-warning/5 border-status-warning/30 text-status-warning'
          } ${
            verificationResult === 'invalid' && 'bg-status-danger/5 border-status-danger/30 text-status-danger'
          }`}>
            {verificationResult === 'valid' && (
              <>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="text-xs font-semibold">
                  <span className="font-extrabold uppercase">Verified Signature:</span> Symmetric key checked. Token is safe and validated.
                </div>
              </>
            )}
            {verificationResult === 'none_bypass' && (
              <>
                <AlertOctagon className="w-5 h-5 shrink-0 animate-bounce" />
                <div className="text-xs font-semibold">
                  <span className="font-extrabold uppercase">Exploit Success (Bypass):</span> Alg "none" accepted. Role forced to <span className="font-black underline uppercase">admin</span>. Signature ignored!
                </div>
              </>
            )}
            {verificationResult === 'jwks_spoofed' && (
              <>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div className="text-xs font-semibold">
                  <span className="font-extrabold uppercase">Spoof Active (Domain Spoof):</span> Server fetched fake public key from <span className="underline font-mono text-[10px]">attacker-domain.com</span>!
                </div>
              </>
            )}
          </div>

          {/* Editors Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Header Editor */}
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Header (JSON)</span>
                {!isHeaderValid && <span className="text-[10px] text-status-danger font-bold">Invalid JSON</span>}
              </div>
              <textarea 
                value={noneExploitActive ? `{\n  "alg": "none",\n  "typ": "JWT"\n}` : jwksExploitActive ? `{\n  "alg": "RS256",\n  "jku": "https://attacker-domain.com/keys.json",\n  "kid": "key_attacker_01",\n  "typ": "JWT"\n}` : headerJson}
                onChange={(e) => {
                  if (!noneExploitActive && !jwksExploitActive) {
                    setHeaderJson(e.target.value)
                  }
                }}
                disabled={noneExploitActive || jwksExploitActive}
                className="w-full h-44 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle focus:shadow-inner resize-none disabled:opacity-80"
              />
            </div>

            {/* Payload Editor */}
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Payload (Claims)</span>
                {!isPayloadValid && <span className="text-[10px] text-status-danger font-bold">Invalid JSON</span>}
              </div>
              <textarea 
                value={noneExploitActive ? `{\n  "sub": "aboutiam-user-889",\n  "name": "Alex Hacker",\n  "role": "admin",\n  "iat": 1516239022\n}` : payloadJson}
                onChange={(e) => {
                  if (!noneExploitActive) {
                    setPayloadJson(e.target.value)
                  }
                }}
                disabled={noneExploitActive}
                className="w-full h-44 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle focus:shadow-inner resize-none disabled:opacity-80"
              />
            </div>
          </div>

          {/* Encoded JWT Output Frame */}
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center pb-3 border-b border-border-subtle relative z-10">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-accent-secondary" /> Generated Token String
              </span>
              <button 
                onClick={() => copyToClipboard(tokenString, 'token')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-bg-sidebar hover:bg-bg-nested text-xs text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
              >
                {isCopied === 'token' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">Copy Token</span>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-bg-sidebar border border-border-subtle/50 text-[11px] text-text-primary break-all leading-relaxed whitespace-pre-wrap relative z-10 tracking-wide max-h-[120px] overflow-y-auto">
              <span className="text-status-danger underline font-bold" title="Header (Algorithm & Key ID)">{headerB64}</span>.
              <span className="text-accent-primary underline font-bold" title="Payload (User Details & Claims)">{payloadB64}</span>.
              <span className="text-accent-secondary underline font-bold" title="Cryptographic Signature">{signatureB64 || ''}</span>
            </div>

            {/* Quick Helper Tip */}
            <div className="p-3.5 bg-bg-sidebar/50 rounded-lg flex gap-2.5 items-start text-xs border border-border-subtle/30 relative z-10">
              <Info className="w-4.5 h-4.5 text-accent-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-text-primary text-[10px] uppercase">Remediation Blueprint</span>
                {verificationResult === 'none_bypass' && (
                  <p className="text-[10px] text-text-muted leading-relaxed font-semibold">
                    <span className="font-extrabold text-status-danger">Fix:</span> Configure your backend JWT parsing library to strictly reject tokens signed with algorithm <span className="font-mono">"none"</span>. Force a whitelist of allowed algorithms (e.g. <span className="font-mono">["HS256", "RS256"]</span>) explicitly on validation.
                  </p>
                )}
                {verificationResult === 'jwks_spoofed' && (
                  <p className="text-[10px] text-text-muted leading-relaxed font-semibold">
                    <span className="font-extrabold text-status-warning">Fix:</span> Never fetch keys dynamically from an untrusted <span className="font-mono">"jku"</span> header URL. Verify the JKU domain matches a trusted whitelist (your secure domain) or retrieve keys directly from local cache constants.
                  </p>
                )}
                {verificationResult === 'valid' && (
                  <p className="text-[10px] text-text-muted leading-relaxed font-semibold">
                    The signature verifies that the header and payload have not been modified by an attacker. Always maintain a strong secret length ($\ge 256$ bits) for HS256, or use secure RSA key-sizes ($\ge 2048$ bits) for RS256.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
