import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, ShieldAlert, ShieldCheck, Lock, Fingerprint, 
  Terminal, Shield, Globe, Cpu, Play, RotateCcw, AlertTriangle, FileText, 
  Fingerprint as BioIcon, RefreshCw, Sparkles
} from 'lucide-react'

// Define the Era structure
interface Era {
  id: number
  year: string
  title: string
  boundary: string
  layman: string
  expert: string
  techBadge: string
}

const ERAS: Era[] = [
  {
    id: 1,
    year: '1961',
    title: 'The Dawn of Passwords',
    boundary: 'Physical Borders & Text Files',
    layman: 'The physical key to a shared desk drawer. Only authorized staff are supposed to access it, but if anyone copies or steals the master ledger listing everyone\'s keys, every single drawer is compromised.',
    expert: 'Fernando Corbató introduced the first computer password at MIT to ration mainframe terminal hours. However, security was an afterthought: the user ledger (PASSWD.TXT) was stored on magnetic tapes in unhashed plaintext, exposing the system to direct file-read exploitation.',
    techBadge: 'MIT CTSS, Plaintext Tapes'
  },
  {
    id: 2,
    year: '1988',
    title: 'Network Authentication & Kerberos',
    boundary: 'Corporate Network Firewalls',
    layman: 'Buying a ticket at a movie theater. You buy a general admission ticket at the front window (Authentication Server), exchange it for a specific screen voucher inside (Ticket Granting Server), and hand that voucher to the usher (Application Server) to enter.',
    expert: 'Kerberos (RFC 4120) secured logins across untrusted client-server networks using symmetric cryptography and a trusted Key Distribution Center (KDC). By exchanging encrypted tickets and authenticators, users verify identity without ever exposing raw passwords over network wires.',
    techBadge: 'MIT Kerberos, KDC, Symmetric Keys'
  },
  {
    id: 3,
    year: '2001',
    title: 'Federation & SAML 2.0',
    boundary: 'XML Federated Trust Boundaries',
    layman: 'A visa-stamped physical passport. An official government agency (Identity Provider) certifies who you are and stamps your passport. The destination country border control (Service Provider) trusts that official stamp without calling your home nation.',
    expert: 'SAML 2.0 (Security Assertion Markup Language) uses XML digital signatures (XMLDSig) to cryptographically bind identities across separate domain borders. By passing signed XML assertion envelopes via browser-based redirects, companies achieved secure Federated Single Sign-On (SSO).',
    techBadge: 'SAML 2.0, XMLDSig, IdP / SP Trust'
  },
  {
    id: 4,
    year: '2012',
    title: 'SaaS, Mobile & OAuth / OIDC',
    boundary: 'JSON REST APIs & IDaaS Providers',
    layman: 'A hotel electronic keycard or a valet key. Instead of handing the valet driver your physical master car key, you give them a restricted valet key that only operates the ignition—completely preventing them from opening the locked trunk or glovebox.',
    expert: 'OAuth 2.0 (RFC 6749) solved token-based API authorization delegation, while OpenID Connect (OIDC) added a structured identity profile layer. They replaced heavy XML with lightweight, web-compatible JSON Web Tokens (JWT) signed using HMAC or asymmetric RSA key pairs.',
    techBadge: 'OAuth 2.1, OIDC, JWT, JWKS, REST'
  },
  {
    id: 5,
    year: '2020',
    title: 'Hardware-Bound Passwordless',
    boundary: 'Phishing-Resistant Asymmetric TPMs',
    layman: 'A high-security smart-safe. To unlock it, you prove your identity directly to your phone via your fingerprint. The phone\'s internal secure chip then signs a custom challenge proving it was you, without ever sending your fingerprint or any password to the internet.',
    expert: 'FIDO2 and WebAuthn (W3C Standard) completely eliminate shared secrets on the server. Instead, a unique cryptographic keypair is generated per site inside a hardware TPM or security key. The server sends a random challenge, which the device signs locally with the private key.',
    techBadge: 'FIDO2, WebAuthn, Passkeys, TPM'
  },
  {
    id: 6,
    year: '2030+',
    title: 'Continuous Ambient Trust & SSI',
    boundary: 'Zero-Session Post-Auth Boundaries',
    layman: 'A smart building that recognizes your unique walking pace, typing rhythm, and vocal cadence. It keeps secure doors open for you as you walk, but if your behavior or posture suddenly shifts, it gently decays your trust and asks for a quick biometric re-verify.',
    expert: 'Post-2030 architectures abandon the "one-time login" session paradigm. Adaptive Trust Engines continuously stream ambient biometric telemetry (typing dynamics, network latency) and decay session trust scores over time. Decentralized IDs utilize Verifiable Credentials and Zero-Knowledge Proofs.',
    techBadge: 'Continuous adaptive trust, ZKP, VCs'
  }
]

export default function IdentityTimeline() {
  const [selectedEra, setSelectedEra] = useState<number>(1)

  // Era 1 (CTSS) State
  const [ctssPassword, setCtssPassword] = useState('security_ctss_1961')
  const [ctssUsername, setCtssPasswordUser] = useState('Fernando')
  const [ctssExploited, setCtssExploited] = useState(false)
  const [ctssTerminalLogs, setCtssTerminalLogs] = useState<string[]>([
    'MIT CTSS SYSTEM READY - JULY 1961',
    'TYPE "LOGIN" OR ENTER CORBATO CREDENTIALS'
  ])

  // Era 2 (Kerberos) State
  const [kerberosStep, setKerberosStep] = useState(0)
  const [kerberosLogs, setKerberosLogs] = useState<string[]>([
    'Kerberos system initialized. Ready to request network resources.'
  ])

  // Era 3 (SAML) State
  const [samlRole, setSamlRole] = useState<'User' | 'Administrator'>('User')
  const [samlUser, setSamlUser] = useState('Alice Smith')
  const [samlSignatureVerified, setSamlSignatureVerified] = useState(true)
  const [samlXml, setSamlXml] = useState('')

  // Era 4 (JWT) State
  const [jwtSub, setJwtSub] = useState('usr_987')
  const [jwtName, setJwtName] = useState('Mayank')
  const [jwtRole, setJwtRole] = useState('User')
  const [jwtSecret, setJwtSecret] = useState('super-secret-key-123')
  const [jwtAlg, setJwtAlg] = useState<'HS256' | 'none'>('HS256')

  // Era 5 (WebAuthn) State
  const [webauthnState, setWebauthnState] = useState<'idle' | 'challenging' | 'biometric' | 'signing' | 'verified'>('idle')
  const [webauthnLogs, setWebauthnLogs] = useState<string[]>([])

  // Era 6 (Ambient Trust) State
  const [ambientTrustScore, setAmbientTrustScore] = useState(100)
  const [ambientLogs, setAmbientLogs] = useState<string[]>([
    'Adaptive Trust Engine active. Baseline telemetry normal.'
  ])
  const [ambientActive, setAmbientActive] = useState(false)

  // Sync SAML XML based on state
  useEffect(() => {
    const computedSignature = samlSignatureVerified 
      ? 'dGhlX3NpZ25hdHVyZV9vY29tcGxldGVfZXhhbXBsZV9zYW1sXzIwMDE=' 
      : 'INVALID_SIGNATURE_TAMPERED_HASH_ERROR_0x99'

    setSamlXml(`<?xml version="1.0" encoding="UTF-8"?>
<saml:Assertion ID="_a1b2c3d4e5f6" IssueInstant="2001-10-12T14:20:00Z" Version="2.0">
  <saml:Issuer>https://idp.company.com</saml:Issuer>
  <ds:Signature>
    <ds:SignedInfo>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
    </ds:SignedInfo>
    <ds:SignatureValue>
      ${computedSignature}
    </ds:SignatureValue>
  </ds:Signature>
  <saml:Subject>
    <saml:NameID>${samlUser}</saml:NameID>
  </saml:Subject>
  <saml:AttributeStatement>
    <saml:Attribute Name="Role">
      <saml:AttributeValue>${samlRole}</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`)
  }, [samlRole, samlUser, samlSignatureVerified])

  // Trigger SAML tampering
  const handleSamlRoleChange = (role: 'User' | 'Administrator') => {
    setSamlRole(role)
    setSamlSignatureVerified(false)
  }

  // Resign SAML Assertion
  const resignSaml = () => {
    setSamlSignatureVerified(true)
  }

  // MIT CTSS terminal simulator actions
  const runCtssRegister = () => {
    if (!ctssUsername || !ctssPassword) return
    setCtssTerminalLogs(prev => [
      ...prev,
      `> REGISTER ${ctssUsername.toUpperCase()} PASSWORD:${'*'.repeat(ctssPassword.length)}`,
      `[SYS] Writing record to tape index...`,
      `[SYS] Entry successfully saved in PASSWD.TXT!`,
      `[SYS] Password stored: "${ctssPassword}" (Plaintext format)`
    ])
  }

  const triggerCtssExploit = () => {
    setCtssExploited(true)
    setCtssTerminalLogs(prev => [
      ...prev,
      `> RUN ALLAN_SCHERR_1962_EXPLOIT.BAT`,
      `[EXPLOIT] Accessing core magnetic core buffers...`,
      `[EXPLOIT] Reading shared offline spooling systems...`,
      `[EXPLOIT] Printing raw file: PASSWD.TXT`,
      `----------------------------------------`,
      `USER            PASSWORD       DEPT`,
      `----------------------------------------`,
      `Fernando        security_ctss  Admin`,
      `Corbato         multics_ctss   Admin`,
      `Scherr          spacewar88     Research`,
      `${ctssUsername.padEnd(15)} ${ctssPassword.padEnd(14)} User-Custom`,
      `----------------------------------------`,
      `[EXPLOIT] Attack complete! All plaintext user credentials printed.`
    ])
  }

  const resetCtss = () => {
    setCtssExploited(false)
    setCtssTerminalLogs([
      'MIT CTSS SYSTEM READY - JULY 1961',
      'TYPE "LOGIN" OR ENTER CORBATO CREDENTIALS'
    ])
  }

  // Kerberos Handshake simulator actions
  const advanceKerberos = () => {
    if (kerberosStep >= 5) {
      setKerberosStep(0)
      setKerberosLogs(['Kerberos system initialized. Ready to request network resources.'])
      return
    }

    const nextStep = kerberosStep + 1
    setKerberosStep(nextStep)

    const logs: Record<number, string[]> = {
      1: [
        'Step 1: Client requests TGT (Ticket Granting Ticket) from AS.',
        'Sent: [Plaintext User ID, Target KDC Realm, Timestamp]',
        'Destination: KDC Authentication Server (AS)'
      ],
      2: [
        'Step 2: AS replies with encrypted TGT and Client-TGS Session Key.',
        'Received: TGT encrypted with TGS Secret Key, and Session Key encrypted with Client password hash.',
        'Status: Client successfully decrypts Session Key locally.'
      ],
      3: [
        'Step 3: Client requests a Service Ticket from TGS.',
        'Sent: TGT + Authenticator (Encrypted with Client-TGS Session Key)',
        'Destination: Ticket Granting Server (TGS)'
      ],
      4: [
        'Step 4: TGS replies with Service Ticket & Client-Server Session Key.',
        'Received: Service Ticket (ST) encrypted with Application Server Secret Key, and Client-Server Session Key.',
        'Status: Client extracts Client-Server Session Key.'
      ],
      5: [
        'Step 5: Client presents Service Ticket to Target App Server.',
        'Sent: Service Ticket + Authenticator (Encrypted with Client-Server Session Key)',
        'Result: Application Server validates, decodes ST, and GRANTS SECURE ACCESS! 🛡️'
      ]
    }

    setKerberosLogs(prev => [...prev, ...logs[nextStep]])
  }

  const resetKerberos = () => {
    setKerberosStep(0)
    setKerberosLogs(['Kerberos system initialized. Ready to request network resources.'])
  }

  // JWT helper to mimic signature calculations
  const getJwtStrings = () => {
    const headerObj = { alg: jwtAlg, typ: 'JWT' }
    const payloadObj = { sub: jwtSub, name: jwtName, role: jwtRole, iat: 1334198400 }

    const encodedHeader = btoa(JSON.stringify(headerObj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const encodedPayload = btoa(JSON.stringify(payloadObj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    let signature = 'none'
    let verified = false

    if (jwtAlg !== 'none') {
      // Mock HMAC computation
      const combined = `${encodedHeader}.${encodedPayload}`
      const hash = Array.from(combined)
        .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
        .toString(16)
      
      const secretHash = Array.from(jwtSecret)
        .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
        .toString(16)

      signature = btoa(`${hash}${secretHash}`).substring(0, 32).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
      verified = jwtSecret.trim().length > 0
    } else {
      signature = ''
      verified = true // none is syntactically valid in insecure parsers
    }

    return {
      header: JSON.stringify(headerObj, null, 2),
      payload: JSON.stringify(payloadObj, null, 2),
      signature,
      token: `${encodedHeader}.${encodedPayload}.${signature}`,
      verified
    }
  }

  // WebAuthn simulator actions
  const runWebauthnCeremony = () => {
    if (webauthnState !== 'idle') return

    setWebauthnState('challenging')
    setWebauthnLogs([`[SERVER] Issuing cryptographic login challenge: "auth_chall_${Math.random().toString(36).substring(7)}"`])

    setTimeout(() => {
      setWebauthnState('biometric')
      setWebauthnLogs(prev => [...prev, '[BROWSER] Triggering WebAuthn API credentials request...', '[HARDWARE] Awaiting User Presence Verification (TouchID/FaceID)...'])
    }, 1500)
  }

  const verifyBiometric = () => {
    setWebauthnState('signing')
    setWebauthnLogs(prev => [
      ...prev,
      '✔ User presence verified via device biometric sensor.',
      '[HARDWARE] Accessing enclave secure key coordinates...',
      '[HARDWARE] Signing challenge using Private Key inside enclave...'
    ])

    setTimeout(() => {
      setWebauthnState('verified')
      setWebauthnLogs(prev => [
        ...prev,
        '✔ Signature successfully generated.',
        'Sent Assertion: [clientDataJSON, authenticatorData, signature]',
        '[SERVER] Cryptographically verifying signature against registered Public Key...',
        '✔ Cryptographic verification successful! Session granted password-free. 🎉'
      ])
    }, 1800)
  }

  const resetWebauthn = () => {
    setWebauthnState('idle')
    setWebauthnLogs([])
  }

  // Era 6: Ambient Trust continuous decay simulation
  useEffect(() => {
    let interval: any
    if (ambientActive && ambientTrustScore > 0) {
      interval = setInterval(() => {
        setAmbientTrustScore(prev => {
          const nextScore = Math.max(0, prev - 4)
          
          if (nextScore === 80) {
            setAmbientLogs(p => [...p, '[TELEMETRY] 5s inactivity detected. Initiating slow trust-score decay...'])
          } else if (nextScore === 60) {
            setAmbientLogs(p => [...p, '[WARN] Trust score fell below 70. Resource sensitivity: RESTRICTED file-sharing.'])
          } else if (nextScore === 36) {
            setAmbientLogs(p => [...p, '🚨 ALERT: Trust score below 40. High risk state. Step-up biometric challenge prompted!'])
          }

          return nextScore
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [ambientActive, ambientTrustScore])

  const boostAmbientTrust = (type: 'fingerprint' | 'gps' | 'face') => {
    let points = 0
    let label = ''

    if (type === 'fingerprint') {
      points = 35
      label = 'Fingerprint enclave match'
    } else if (type === 'gps') {
      points = 25
      label = 'Device GPS location boundary match'
    } else {
      points = 45
      label = '3D Face ID camera check successful'
    }

    setAmbientTrustScore(prev => {
      const updated = Math.min(100, prev + points)
      setAmbientLogs(p => [
        ...p,
        `[ACTION] ${label}. Boosted trust +${points}. Current score: ${updated}`
      ])
      return updated
    })
  }

  const toggleAmbientSimulation = () => {
    setAmbientActive(!ambientActive)
  }

  const resetAmbient = () => {
    setAmbientActive(false)
    setAmbientTrustScore(100)
    setAmbientLogs(['Adaptive Trust Engine active. Baseline telemetry normal.'])
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <History className="w-3.5 h-3.5" /> Interactive Edition
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Interactive Identity Timeline
        </h2>
        <p className="text-text-secondary">
          Trace the continuous evolutionary journey of digital identity, secure borders, and cryptography. Click each era along the timeline path to explore technical details and fire live inline simulators.
        </p>
      </div>

      {/* Main Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANE: The Timeline Path (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-border-subtle pb-3">
              <History className="w-4 h-4 text-accent-primary" /> The Historical Path
            </h3>

            <div className="relative pl-6 border-l-2 border-border-subtle/80 space-y-6">
              {ERAS.map((era) => {
                const isSelected = selectedEra === era.id
                return (
                  <div key={era.id} className="relative group">
                    {/* Circle Node */}
                    <button
                      onClick={() => setSelectedEra(era.id)}
                      className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-accent-primary border-accent-primary shadow-md shadow-accent-primary/20 scale-125 z-10'
                          : 'bg-bg-card border-border-subtle group-hover:border-accent-primary'
                      }`}
                      title={`Go to ${era.title}`}
                      aria-label={`Go to ${era.title}`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </button>

                    {/* Timeline Text Item */}
                    <div 
                      onClick={() => setSelectedEra(era.id)}
                      className={`cursor-pointer rounded-xl p-3.5 transition-all text-left border ${
                        isSelected
                          ? 'bg-accent-glow/5 border-accent-primary/20 shadow-sm'
                          : 'border-transparent hover:bg-bg-sidebar hover:border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black tracking-wide uppercase px-2 py-0.5 rounded ${
                          isSelected ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-muted'
                        }`}>
                          {era.year}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold truncate max-w-[120px]">
                          {era.techBadge.split(',')[0]}
                        </span>
                      </div>
                      <h4 className={`text-sm font-extrabold mt-2 ${
                        isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                      }`}>
                        {era.title}
                      </h4>
                      <p className="text-[11px] text-text-muted mt-1 line-clamp-1">
                        {era.boundary}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Deep Dive & Active Simulator (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6 lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            {ERAS.filter(e => e.id === selectedEra).map((era) => (
              <motion.div
                key={era.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Era Description & Analogies */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
                    <div>
                      <span className="text-xs font-bold text-accent-primary tracking-wider uppercase bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
                        Era {era.id} • {era.year}
                      </span>
                      <h3 className="text-2xl font-black text-text-primary mt-2">
                        {era.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-text-muted bg-bg-sidebar border border-border-subtle/50 px-3 py-1.5 rounded-lg shrink-0">
                      📟 {era.techBadge}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 pt-2">
                    {/* Layman Analogy */}
                    <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/15 space-y-2">
                      <h5 className="text-xs font-bold text-accent-primary flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> Layman Analogy
                      </h5>
                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                        {era.layman}
                      </p>
                    </div>

                    {/* Expert Specifications */}
                    <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
                      <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-accent-secondary" /> Expert Spec Details
                      </h5>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {era.expert}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-text-muted block">Active Security Boundary:</span>
                    <span className="text-xs text-text-primary font-extrabold flex items-center gap-1 mt-1">
                      <Shield className="w-3.5 h-3.5 text-accent-primary shrink-0" /> {era.boundary}
                    </span>
                  </div>
                </div>

                {/* ERA-SPECIFIC MINI-SIMULATORS */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
                  <div className="border-b border-border-subtle pb-4">
                    <h4 className="text-md font-extrabold text-text-primary flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-accent-primary" /> Active Mini-Simulator
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Interact with the core technological design or vulnerability of this era.
                    </p>
                  </div>

                  {/* Simulator 1: MIT CTSS Plaintext Exploitation */}
                  {era.id === 1 && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Terminal Registration Input */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
                          <h5 className="text-xs font-extrabold text-text-primary uppercase">Tape Directory Entry</h5>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] text-text-muted font-bold block" htmlFor="ctss-user">USERNAME (CORBATO COMPATIBLE)</label>
                            <input 
                              id="ctss-user"
                              type="text" 
                              value={ctssUsername} 
                              onChange={(e) => setCtssPasswordUser(e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-bold focus:outline-none focus:border-accent-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] text-text-muted font-bold block" htmlFor="ctss-pass">PLAINTEXT PASSWORD</label>
                            <input 
                              id="ctss-pass"
                              type="text" 
                              value={ctssPassword} 
                              onChange={(e) => setCtssPassword(e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-bold focus:outline-none focus:border-accent-primary"
                            />
                          </div>

                          <button
                            onClick={runCtssRegister}
                            className="w-full py-2 rounded bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all"
                          >
                            Add to Tape Buffer
                          </button>
                        </div>

                        {/* Retro Terminal Window */}
                        <div className="p-4 rounded-xl bg-black border border-zinc-800 text-[11px] font-mono text-emerald-400 space-y-2 min-h-[160px] max-h-[180px] overflow-y-auto flex flex-col justify-between">
                          <div className="space-y-1">
                            {ctssTerminalLogs.map((log, i) => (
                              <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                            ))}
                          </div>
                          {ctssExploited && (
                            <span className="text-red-500 font-bold block animate-pulse">*** FILE SYSTEM EXPOSED ***</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          onClick={triggerCtssExploit}
                          className="px-4 py-2.5 rounded-lg bg-status-danger/10 text-status-danger hover:bg-status-danger/20 border border-status-danger/20 text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <AlertTriangle className="w-4 h-4" /> Trigger Allan Scherr 1962 Exploit
                        </button>

                        <button
                          onClick={resetCtss}
                          className="px-3 py-2 rounded-lg bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Reset console"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/10 text-xs text-text-secondary leading-relaxed">
                        <strong className="text-text-primary">Defensive Breakdown:</strong> Storages like 1961's magnetic tapes preserved raw plaintext. If an attacker gains read access to the server, they possess everyone's password instantly. Modern systems remediate this by hashing inputs using salted slow-algorithms (e.g., bcrypt).
                      </div>
                    </div>
                  )}

                  {/* Simulator 2: Kerberos Interactive Handshake */}
                  {era.id === 2 && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-5 gap-3 text-center">
                        <div className={`p-3 rounded-xl border transition-all ${
                          kerberosStep === 0 ? 'bg-accent-glow/5 border-accent-primary' : 'bg-bg-nested border-border-subtle'
                        }`}>
                          <div className="text-xs font-bold">1. Client</div>
                          <div className="text-[10px] text-text-muted mt-1">User workstation</div>
                        </div>

                        <div className="flex items-center justify-center text-text-muted">➔</div>

                        <div className={`p-3 rounded-xl border transition-all ${
                          kerberosStep === 1 || kerberosStep === 2 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'bg-bg-nested border-border-subtle'
                        }`}>
                          <div className="text-xs font-bold">2. AS</div>
                          <div className="text-[10px] text-text-muted mt-1">Auth Server (TGT)</div>
                        </div>

                        <div className="flex items-center justify-center text-text-muted">➔</div>

                        <div className={`p-3 rounded-xl border transition-all ${
                          kerberosStep === 3 || kerberosStep === 4 ? 'bg-accent-glow/5 border-accent-primary animate-pulse-slow' : 'bg-bg-nested border-border-subtle'
                        }`}>
                          <div className="text-xs font-bold">3. TGS</div>
                          <div className="text-[10px] text-text-muted mt-1">Ticket Grant Server</div>
                        </div>
                      </div>

                      {/* Diagnostic Log Output */}
                      <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
                        <span className="text-[10px] text-text-muted font-bold block uppercase">Kerberos Ticket Exchange Terminal</span>
                        <div className="space-y-1 text-xs font-mono text-text-secondary">
                          {kerberosLogs.map((log, idx) => (
                            <p key={idx} className={log.startsWith('✔') || log.includes('SUCCESS') ? 'text-emerald-500 font-bold' : ''}>
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={advanceKerberos}
                          className="px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow"
                        >
                          <Play className="w-3.5 h-3.5" /> 
                          {kerberosStep === 0 ? 'Start Handshake' : kerberosStep === 5 ? 'Restart' : `Advance (Step ${kerberosStep + 1}/5)`}
                        </button>
                        <button
                          onClick={resetKerberos}
                          className="px-3 py-2 rounded-lg bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Reset exchange"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Simulator 3: SAML xml assertion signature */}
                  {era.id === 3 && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-4">
                          <h5 className="text-xs font-extrabold text-text-primary uppercase">Assertion Claims</h5>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] text-text-muted font-bold block" htmlFor="saml-user-input">SUBJECT USERNAME</label>
                            <input 
                              id="saml-user-input"
                              type="text" 
                              value={samlUser} 
                              onChange={(e) => {
                                setSamlUser(e.target.value)
                                setSamlSignatureVerified(false)
                              }}
                              className="w-full px-3 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-bold focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] text-text-muted font-bold block">SAML USER ROLE CLAIM</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleSamlRoleChange('User')}
                                className={`py-2 px-3 rounded text-xs font-bold border transition-all ${
                                  samlRole === 'User' 
                                    ? 'bg-accent-glow/10 border-accent-primary text-accent-primary' 
                                    : 'bg-bg-card border-border-subtle text-text-secondary'
                                }`}
                              >
                                User
                              </button>
                              <button
                                onClick={() => handleSamlRoleChange('Administrator')}
                                className={`py-2 px-3 rounded text-xs font-bold border transition-all ${
                                  samlRole === 'Administrator' 
                                    ? 'bg-status-danger/10 border-status-danger text-status-danger' 
                                    : 'bg-bg-card border-border-subtle text-text-secondary'
                                }`}
                              >
                                Administrator
                              </button>
                            </div>
                          </div>

                          <div className="pt-2">
                            <div className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                              samlSignatureVerified 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                : 'bg-status-danger/10 border-status-danger/20 text-status-danger animate-pulse'
                            }`}>
                              {samlSignatureVerified ? (
                                <>
                                  <ShieldCheck className="w-4 h-4 shrink-0" />
                                  XML Signature Verified (100% Secure)
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
                                  Claim Tampered! Signature Invalid!
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SAML XML Output code */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle flex flex-col">
                          <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">Resulting SAML Assertion XML</span>
                          <textarea
                            aria-label="Resulting SAML Assertion XML"
                            readOnly
                            value={samlXml}
                            className="flex-grow w-full font-mono text-[10px] bg-bg-card border border-border-subtle rounded p-2.5 focus:outline-none resize-none text-text-secondary leading-normal h-[240px]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {!samlSignatureVerified && (
                          <button
                            onClick={resignSaml}
                            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Re-Sign SAML Assertion
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSamlUser('Alice Smith')
                            setSamlRole('User')
                            setSamlSignatureVerified(true)
                          }}
                          className="px-3 py-2 rounded-lg bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Reset assertion"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Simulator 4: JWT encoder / signer */}
                  {era.id === 4 && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* JWT Claims Input fields */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
                          <h5 className="text-xs font-extrabold text-text-primary uppercase">JWT Token Parameters</h5>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-text-muted font-bold block mb-1">SIGNING ALGORITHM</label>
                              <select
                                aria-label="SIGNING ALGORITHM"
                                value={jwtAlg}
                                onChange={(e) => setJwtAlg(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-bold focus:outline-none"
                              >
                                <option value="HS256">HS256 (HMAC-SHA256)</option>
                                <option value="none">none (No Signature Exploit)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-text-muted font-bold block mb-1">USER ROLE</label>
                              <select
                                aria-label="USER ROLE"
                                value={jwtRole}
                                onChange={(e) => setJwtRole(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-bold focus:outline-none"
                              >
                                <option value="User">User</option>
                                <option value="Admin">Administrator</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-text-muted font-bold block mb-1" htmlFor="jwt-sub-input">SUBJECT (SUB)</label>
                              <input 
                                id="jwt-sub-input"
                                type="text" 
                                value={jwtSub} 
                                onChange={(e) => setJwtSub(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-semibold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-text-muted font-bold block mb-1" htmlFor="jwt-name-input">NAME</label>
                              <input 
                                id="jwt-name-input"
                                type="text" 
                                value={jwtName} 
                                onChange={(e) => setJwtName(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-semibold focus:outline-none"
                              />
                            </div>
                          </div>

                          {jwtAlg !== 'none' && (
                            <div className="space-y-1">
                              <label className="text-[9px] text-text-muted font-bold block" htmlFor="jwt-secret-input">HMAC SECRET KEY</label>
                              <input 
                                id="jwt-secret-input"
                                type="password" 
                                value={jwtSecret} 
                                onChange={(e) => setJwtSecret(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-border-subtle text-xs text-text-primary font-semibold focus:outline-none"
                              />
                            </div>
                          )}

                          {jwtAlg === 'none' && (
                            <div className="p-2.5 rounded bg-status-danger/10 border border-status-danger/20 text-[10px] text-status-danger leading-normal font-bold">
                              ⚠️ EXPLOIT DETECTED: The "none" algorithm instructs the parser to skip signature checks entirely. A classic JWT library vulnerability!
                            </div>
                          )}
                        </div>

                        {/* Live JWT visual representations */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-[10px] text-text-muted font-bold block uppercase">Decoded Structure</span>
                            <div className="font-mono text-[9px] p-2 bg-bg-card rounded border border-border-subtle space-y-2 max-h-[140px] overflow-y-auto">
                              <div>
                                <span className="text-red-500 font-bold">// HEADER</span>
                                <pre className="text-text-secondary">{getJwtStrings().header}</pre>
                              </div>
                              <div>
                                <span className="text-blue-500 font-bold">// PAYLOAD</span>
                                <pre className="text-text-secondary">{getJwtStrings().payload}</pre>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-text-muted font-bold block uppercase">Compact Encoded Token</span>
                            <div className="p-2 rounded bg-bg-card border border-border-subtle font-mono text-[10px] break-all select-all select-none text-text-primary">
                              <span className="text-red-500">{getJwtStrings().token.split('.')[0]}</span>.
                              <span className="text-blue-500">{getJwtStrings().token.split('.')[1]}</span>.
                              <span className="text-teal-500 font-semibold">{getJwtStrings().token.split('.')[2] || ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setJwtSub('usr_987')
                            setJwtName('Mayank')
                            setJwtRole('User')
                            setJwtSecret('super-secret-key-123')
                            setJwtAlg('HS256')
                          }}
                          className="px-3 py-2 rounded-lg bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Reset inputs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset Token
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Simulator 5: Hardware WebAuthn Authenticate Challenge */}
                  {era.id === 5 && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Smartphone Authenticator Graphic */}
                        <div className="p-6 rounded-xl bg-bg-nested border border-border-subtle flex flex-col items-center justify-center space-y-4 min-h-[220px]">
                          <div className="w-32 h-44 rounded-2xl border-4 border-text-primary bg-bg-card p-3 relative shadow-inner flex flex-col justify-between items-center">
                            <div className="w-8 h-1 rounded-full bg-text-primary/30" />
                            
                            <div className="flex flex-col items-center space-y-2 py-4">
                              {webauthnState === 'idle' && (
                                <>
                                  <Lock className="w-8 h-8 text-text-muted animate-pulse-slow" />
                                  <span className="text-[9px] font-bold text-text-muted uppercase text-center">FIDO2 Ready</span>
                                </>
                              )}

                              {webauthnState === 'challenging' && (
                                <>
                                  <RefreshCw className="w-8 h-8 text-accent-primary animate-spin" />
                                  <span className="text-[9px] font-bold text-accent-primary uppercase text-center">Challenging...</span>
                                </>
                              )}

                              {webauthnState === 'biometric' && (
                                <>
                                  <div className="relative">
                                    <Fingerprint className="w-12 h-12 text-accent-secondary animate-pulse" />
                                    <div className="absolute inset-0 bg-accent-secondary/10 rounded-full animate-ping scale-75" />
                                  </div>
                                  <button
                                    onClick={verifyBiometric}
                                    className="px-3 py-1.5 rounded-lg bg-accent-secondary hover:bg-accent-hover-secondary text-white text-[10px] font-bold shadow animate-bounce"
                                  >
                                    Verify TouchID
                                  </button>
                                </>
                              )}

                              {webauthnState === 'signing' && (
                                <>
                                  <Cpu className="w-10 h-10 text-accent-primary animate-pulse" />
                                  <span className="text-[9px] font-bold text-accent-primary uppercase text-center">Signing assertion...</span>
                                </>
                              )}

                              {webauthnState === 'verified' && (
                                <>
                                  <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse-slow" />
                                  <span className="text-[9px] font-black text-emerald-500 uppercase text-center">Access Granted</span>
                                </>
                              )}
                            </div>

                            <div className="w-3 h-3 rounded-full border border-text-primary/30" />
                          </div>
                        </div>

                        {/* Diagnostic Log Panel */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle flex flex-col justify-between min-h-[220px]">
                          <span className="text-[10px] text-text-muted font-bold block uppercase mb-2">WebAuthn API Handshake Console</span>
                          <div className="flex-grow font-mono text-[10px] text-text-secondary space-y-1.5 max-h-[140px] overflow-y-auto">
                            {webauthnLogs.length === 0 ? (
                              <p className="text-text-muted">Awaiting connection to WebAuthn browser API...</p>
                            ) : (
                              webauthnLogs.map((log, idx) => (
                                <p key={idx} className={log.startsWith('✔') ? 'text-emerald-500 font-bold' : log.startsWith('[SERVER]') ? 'text-accent-primary' : ''}>
                                  {log}
                                </p>
                              ))
                            )}
                          </div>

                          <div className="pt-4 flex gap-2">
                            {webauthnState === 'idle' && (
                              <button
                                onClick={runWebauthnCeremony}
                                className="w-full py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Trigger OIDC / WebAuthn Challenge
                              </button>
                            )}

                            {webauthnState === 'verified' && (
                              <button
                                onClick={resetWebauthn}
                                className="w-full py-2 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold rounded-lg transition-all"
                              >
                                Run Handshake Again
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulator 6: Post-2030 Continuous ambient trust scoring */}
                  {era.id === 6 && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Live Trust gauge */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle flex flex-col items-center justify-between space-y-4">
                          <span className="text-[10px] text-text-muted font-bold block uppercase self-start">Active Ambient Session Score</span>
                          
                          <div className="relative w-36 h-36 flex items-center justify-center">
                            {/* Simple circular graphic mimicking gauge */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                stroke="rgba(var(--color-border-subtle), 0.1)" 
                                strokeWidth="8" 
                                fill="transparent" 
                              />
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                stroke={
                                  ambientTrustScore > 70 
                                    ? '#10b981' 
                                    : ambientTrustScore > 40 
                                      ? '#f59e0b' 
                                      : '#ef4444'
                                } 
                                strokeWidth="8" 
                                fill="transparent" 
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * ambientTrustScore) / 100}
                                className="transition-all duration-300"
                              />
                            </svg>
                            <div className="absolute text-center space-y-0.5">
                              <span className="text-3xl font-black text-text-primary block">{ambientTrustScore}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                ambientTrustScore > 70 
                                  ? 'text-emerald-500 bg-emerald-500/10' 
                                  : ambientTrustScore > 40 
                                    ? 'text-amber-500 bg-amber-500/10' 
                                    : 'text-red-500 bg-red-500/10'
                              } px-2 py-0.5 rounded-full`}>
                                {ambientTrustScore > 70 ? 'High Trust' : ambientTrustScore > 40 ? 'Medium Risk' : 'Step-Up Required'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full pt-2">
                            <button
                              onClick={toggleAmbientSimulation}
                              className={`flex-grow py-2 rounded-lg text-xs font-bold text-white transition-all shadow ${
                                ambientActive 
                                  ? 'bg-status-danger hover:bg-status-danger-hover' 
                                  : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              {ambientActive ? 'Pause Trust Decay' : 'Start Active Trust Decay'}
                            </button>
                            <button
                              onClick={resetAmbient}
                              className="px-3 py-2 rounded-lg bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold"
                              title="Reset simulation"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Prove Presence triggers */}
                        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle flex flex-col justify-between space-y-3">
                          <span className="text-[10px] text-text-muted font-bold block uppercase">Telemetry Actions & Streams</span>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => boostAmbientTrust('face')}
                              className="p-2 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-sidebar text-center transition-all flex flex-col items-center justify-center gap-1"
                              title="Prove presence via 3D camera"
                            >
                              <BioIcon className="w-4 h-4 text-accent-primary" />
                              <span className="text-[8px] font-black uppercase text-text-secondary leading-tight">Face Check</span>
                              <span className="text-[7px] text-emerald-500 font-bold mt-0.5">+45 Trust</span>
                            </button>

                            <button
                              onClick={() => boostAmbientTrust('fingerprint')}
                              className="p-2 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-sidebar text-center transition-all flex flex-col items-center justify-center gap-1"
                              title="Prove presence via biometric scan"
                            >
                              <Fingerprint className="w-4 h-4 text-accent-secondary" />
                              <span className="text-[8px] font-black uppercase text-text-secondary leading-tight">Fingerprint</span>
                              <span className="text-[7px] text-emerald-500 font-bold mt-0.5">+35 Trust</span>
                            </button>

                            <button
                              onClick={() => boostAmbientTrust('gps')}
                              className="p-2 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-sidebar text-center transition-all flex flex-col items-center justify-center gap-1"
                              title="Verify device location"
                            >
                              <Globe className="w-4 h-4 text-accent-primary" />
                              <span className="text-[8px] font-black uppercase text-text-secondary leading-tight">GPS Verify</span>
                              <span className="text-[7px] text-emerald-500 font-bold mt-0.5">+25 Trust</span>
                            </button>
                          </div>

                          <div className="flex-grow p-2.5 rounded bg-bg-card border border-border-subtle max-h-[100px] overflow-y-auto font-mono text-[9px] text-text-secondary space-y-1">
                            {ambientLogs.map((log, index) => (
                              <p key={index} className={
                                log.startsWith('🚨') 
                                  ? 'text-red-500 font-semibold' 
                                  : log.includes('[WARN]') 
                                    ? 'text-amber-500' 
                                    : log.includes('[ACTION]') 
                                      ? 'text-emerald-500 font-semibold' 
                                      : ''
                              }>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
