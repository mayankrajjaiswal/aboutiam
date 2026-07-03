import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Network, ArrowRight, ShieldCheck, ShieldAlert, 
  Server, FileCheck, RefreshCw, KeySquare
} from 'lucide-react'

export default function CertChainValidator() {
  const [leafRevoked, setLeafRevoked] = useState(false)
  const [intermediateRevoked, setIntermediateRevoked] = useState(false)

  // Simulation step states
  const [handshakeStep, setHandshakeStep] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])
  const [handshakeResult, setHandshakeResult] = useState<'success' | 'failed' | null>(null)

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const resetSimulator = () => {
    setHandshakeStep(0)
    setLogs([])
    setHandshakeResult(null)
  }

  const triggerHandshake = async () => {
    resetSimulator()
    setHandshakeStep(1)
    addLog('🚀 Initiating Mutual TLS (mTLS) Handshake Validation pipeline...')
    addLog('Client presents Leaf Certificate to target Enterprise Server (AP-REQ).')
    await new Promise(r => setTimeout(r, 800))

    setHandshakeStep(2)
    addLog('🔍 Server checking Client Leaf Certificate validity...')
    if (leafRevoked) {
      addLog('❌ OCSP Check Failed! Client Leaf Certificate serial number matched active CRL revocation list.')
      setHandshakeResult('failed')
      return
    }
    addLog('✓ Client Leaf Certificate validity checks and serial matching: OK.')
    await new Promise(r => setTimeout(r, 800))

    setHandshakeStep(3)
    addLog('🔍 Tracing signature to Subordinate Certificate Authority (Intermediate CA)...')
    if (intermediateRevoked) {
      addLog('❌ Signature Verification Failed! Intermediate CA Certificate is flagged as compromised on OCSP checks.')
      setHandshakeResult('failed')
      return
    }
    addLog('✓ Subordinate Intermediate CA Signature verified: OK.')
    await new Promise(r => setTimeout(r, 800))

    setHandshakeStep(4)
    addLog('🔍 Tracing signature to Trusted Root CA...')
    addLog('✓ Root CA Certificate is trusted, present in Local Server Key Store: OK.')
    addLog('🔓 mTLS Handshake Completed! Cryptographic verification loop successfully authenticated.')
    setHandshakeResult('success')
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">mTLS & Certificate Chain Validator</h1>
            <p className="text-xs text-text-secondary">Interactive PKI playground to model Certificate Authority trust chains and simulate real-time OCSP / CRL revocations</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Diagram & Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls toolbar */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md flex justify-between items-center">
            <div className="flex gap-4">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={leafRevoked} 
                  onChange={e => { setLeafRevoked(e.target.checked); resetSimulator() }}
                  className="rounded text-accent-primary focus:ring-accent-primary" 
                />
                Revoke Client Cert
              </label>

              <label className="text-xs font-bold text-text-secondary flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={intermediateRevoked} 
                  onChange={e => { setIntermediateRevoked(e.target.checked); resetSimulator() }}
                  className="rounded text-accent-primary focus:ring-accent-primary" 
                />
                Revoke Intermediate CA
              </label>
            </div>

            <button
              onClick={triggerHandshake}
              className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Validate mTLS Chain
            </button>
          </div>

          {/* Visual Trust Tree Chain */}
          <div className="border border-border-subtle bg-bg-base rounded-xl p-6 relative min-h-[300px] flex items-center justify-center select-none overflow-x-auto shadow-inner">
            <div className="grid grid-cols-5 items-center justify-center min-w-[500px] gap-4">
              
              {/* Node 1: Client Leaf Cert */}
              <div className="text-center flex flex-col items-center">
                <div className={`p-4 rounded-xl border transition ${
                  leafRevoked ? 'bg-status-danger/10 border-status-danger text-status-danger' :
                  handshakeStep >= 1 ? 'bg-accent-glow border-accent-primary text-accent-primary shadow shadow-accent-primary/20' : 'bg-bg-nested border-border-subtle text-text-secondary'
                }`}>
                  <FileCheck className="w-7 h-7 mx-auto" />
                </div>
                <span className="block text-xs font-black mt-2">Client Leaf Cert</span>
                <span className="text-[9px] text-text-muted font-mono">{leafRevoked ? 'REVOKED' : 'Active'}</span>
              </div>

              <div className="w-full h-0.5 bg-border-subtle"></div>

              {/* Node 2: Intermediate CA */}
              <div className="text-center flex flex-col items-center">
                <div className={`p-4 rounded-xl border transition ${
                  intermediateRevoked ? 'bg-status-danger/10 border-status-danger text-status-danger' :
                  handshakeStep >= 3 ? 'bg-accent-glow border-accent-secondary text-accent-secondary shadow shadow-accent-secondary/20' : 'bg-bg-nested border-border-subtle text-text-secondary'
                }`}>
                  <KeySquare className="w-7 h-7 mx-auto" />
                </div>
                <span className="block text-xs font-black mt-2">Intermediate CA</span>
                <span className="text-[9px] text-text-muted font-mono">{intermediateRevoked ? 'REVOKED' : 'Trusted'}</span>
              </div>

              <div className="w-full h-0.5 bg-border-subtle"></div>

              {/* Node 3: Trusted Root CA */}
              <div className="text-center flex flex-col items-center">
                <div className={`p-4 rounded-xl border transition ${
                  handshakeStep >= 4 ? 'bg-status-success/15 border-status-success text-status-success shadow shadow-status-success/20' : 'bg-bg-nested border-border-subtle text-text-secondary'
                }`}>
                  <Server className="w-7 h-7 mx-auto" />
                </div>
                <span className="block text-xs font-black mt-2">Root CA (Trust Anchor)</span>
                <span className="text-[9px] text-text-muted font-mono">Self-Signed Root</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right column: Trace Logs & Educational Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active outcome badge & trace logs */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col h-[380px] justify-between">
            <div>
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
                mTLS Handshake Status
              </span>

              {handshakeResult === 'success' && (
                <div className="p-3 bg-status-success/15 text-status-success border border-status-success/35 rounded-xl flex items-start gap-2.5 animate-fadeIn mb-3">
                  <ShieldCheck className="w-5 h-5 text-status-success shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-extrabold block">mTLS Authentication Approved!</span>
                    Server validated the full public certificate chain-of-trust up to the local root anchor.
                  </div>
                </div>
              )}

              {handshakeResult === 'failed' && (
                <div className="p-3 bg-status-danger/10 text-status-danger border border-status-danger/35 rounded-xl flex items-start gap-2.5 animate-fadeIn mb-3">
                  <ShieldAlert className="w-5 h-5 text-status-danger shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-extrabold block">mTLS Authentication Blocked!</span>
                    Cryptographic signature trace broke due to certificate revocation lists (CRL) matching anomalies.
                  </div>
                </div>
              )}

              {/* Trace log panel */}
              <div className="border border-border-subtle bg-bg-nested rounded-lg p-2.5 font-mono text-[10px] text-text-primary h-44 overflow-y-auto leading-normal">
                {logs.length === 0 ? (
                  <span className="text-text-muted italic select-none">Console ready. Trigger validation checks on the left to start tracing PKCE/mTLS packets.</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed text-text-secondary">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle/50 text-[10px] text-text-muted font-mono text-center">
              Trust Anchor Standard: RFC 5280 PKIX profiles.
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
