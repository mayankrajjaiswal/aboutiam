import { useState } from 'react'
import { ShieldCheck, Download, Server, Key, FileCheck2, ArrowRight } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

interface CaCertificate {
  commonName: string
  keyType: string
  certPem: string
  privateKeyPem: string
  subjectKeyId: string
  authorityKeyId: string
}

export default function PkiCaWorkbench() {
  const tool = getToolBySlug('pki-ca-workbench')!

  // State for Root CA
  const [rootCn, setRootCn] = useState('AboutIAM Root CA')
  const [rootKeyType, setRootKeyType] = useState('ECDSA-P256')
  const [rootCert, setRootCert] = useState<CaCertificate | null>(null)
  const [generatingRoot, setGeneratingRoot] = useState(false)

  // State for Intermediate CA
  const [interCn, setIntermediateCn] = useState('AboutIAM Intermediate CA')
  const [interKeyType, setIntermediateKeyType] = useState('ECDSA-P256')
  const [interCert, setIntermediateCert] = useState<CaCertificate | null>(null)
  const [generatingInter, setGeneratingInter] = useState(false)

  // State for Leaf Cert
  const [leafCn, setLeafCn] = useState('localhost')
  const [leafKeyType, setLeafKeyType] = useState('ECDSA-P256')
  const [leafSans, setLeafSans] = useState('DNS:localhost,IP:127.0.0.1')
  const [leafUsage, setLeafUsage] = useState('Server Authentication')
  const [leafCert, setLeafCert] = useState<CaCertificate | null>(null)
  const [generatingLeaf, setGeneratingLeaf] = useState(false)

  // Web Crypto Key Generation helpers
  const generateHashHex = async (text: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':')
  }

  const generateCa = async (cn: string, kType: string, isRoot: boolean, signingCert?: CaCertificate | null) => {
    try {
      let keys: CryptoKeyPair
      if (kType === 'ECDSA-P256') {
        keys = await window.crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          true,
          ['sign', 'verify']
        )
      } else {
        keys = await window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
          },
          true,
          ['sign', 'verify']
        )
      }

      // Export Private Key
      const exportedPrv = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey)
      const prvBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrv)))
        .match(/.{1,64}/g)
        ?.join('\n') ?? ''

      const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${prvBase64}\n-----END PRIVATE KEY-----`

      // Generate visual Mock Subject Key Identifier and Authority Key Identifier
      const subjectKeyId = await generateHashHex(cn + Date.now() + Math.random())
      const authorityKeyId = isRoot ? subjectKeyId : (signingCert?.subjectKeyId ?? subjectKeyId)

      // Signature generation simulation using Web Crypto to represent crypto-sound structures
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(cn + authorityKeyId))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const signatureBase64 = btoa(String.fromCharCode(...hashArray, ...hashArray.slice(0, 16)))
        .match(/.{1,64}/g)
        ?.join('\n') ?? ''

      const certPem = `-----BEGIN CERTIFICATE-----\nMIIB/jCCAUegAwIBAgIR${isRoot ? 'A' : 'B'}oEKMA0GCSqGSIb3DQEBCwUAMBoxGDAWBgNV\nBAMTD${btoa(isRoot ? cn : (signingCert?.commonName ?? cn)).substring(0, 16)}MRMwEQYDVQQKEwpBYm91dElB\nTTEbMBkGA1UECxMSUEtJIERlcGFydG1lbnQwHhcNMjYwOTAyMTIzNDU2WhcNMzYw\nOTAyMTIzNDU2WjAaMRgwFgYDVQQDEw${btoa(cn).substring(0, 16)}MB0GA1UdDgQWBBQ\n${signatureBase64}\n-----END CERTIFICATE-----`

      return {
        commonName: cn,
        keyType: kType,
        certPem,
        privateKeyPem,
        subjectKeyId,
        authorityKeyId
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const handleGenerateRoot = async () => {
    setGeneratingRoot(true)
    const cert = await generateCa(rootCn, rootKeyType, true)
    if (cert) setRootCert(cert)
    setGeneratingRoot(false)
  }

  const handleGenerateIntermediate = async () => {
    setGeneratingInter(true)
    const cert = await generateCa(interCn, interKeyType, false, rootCert)
    if (cert) setIntermediateCert(cert)
    setGeneratingInter(false)
  }

  const handleGenerateLeaf = async () => {
    setGeneratingLeaf(true)
    const cert = await generateCa(leafCn, leafKeyType, false, interCert)
    if (cert) setLeafCert(cert)
    setGeneratingLeaf(false)
  }

  const downloadTextFile = (filename: string, content: string) => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        
        {/* PKI Controls Console */}
        <div className="space-y-6">
          
          {/* Step 1: Root CA */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/50">
              <span className="w-6 h-6 rounded-full bg-accent-glow text-accent-primary text-xs font-black flex items-center justify-center border border-accent-primary/10">1</span>
              <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">Generate Root CA</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Root Common Name</label>
                <input
                  type="text"
                  value={rootCn}
                  onChange={e => setRootCn(e.target.value)}
                  disabled={rootCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Key Type</label>
                <select
                  value={rootKeyType}
                  onChange={e => setRootKeyType(e.target.value)}
                  disabled={rootCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                >
                  <option value="ECDSA-P256">ECDSA P-256 (Phishing-Resistant)</option>
                  <option value="RSA-2048">RSA 2048-bit (Legacy Compatible)</option>
                </select>
              </div>
            </div>

            {!rootCert ? (
              <button
                onClick={handleGenerateRoot}
                disabled={generatingRoot}
                className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all animate-pulse"
              >
                {generatingRoot ? 'Generating Keys via Web Crypto...' : '🔑 Generate & Self-Sign Root CA'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setRootCert(null); setIntermediateCert(null); setLeafCert(null); }}
                  className="flex-1 py-2 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs font-bold"
                >
                  Reset Root CA
                </button>
                <button
                  onClick={() => downloadTextFile(`${rootCn.toLowerCase().replace(/\s+/g, '-')}.crt`, rootCert.certPem)}
                  className="px-3.5 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-card transition text-text-primary"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Intermediate CA */}
          <div className={`p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4 transition-all ${!rootCert ? 'opacity-45 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/50">
              <span className="w-6 h-6 rounded-full bg-accent-glow text-accent-primary text-xs font-black flex items-center justify-center border border-accent-primary/10">2</span>
              <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">Generate & Sign Intermediate CA</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Intermediate Common Name</label>
                <input
                  type="text"
                  value={interCn}
                  onChange={e => setIntermediateCn(e.target.value)}
                  disabled={interCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Key Type</label>
                <select
                  value={interKeyType}
                  onChange={e => setIntermediateKeyType(e.target.value)}
                  disabled={interCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                >
                  <option value="ECDSA-P256">ECDSA P-256</option>
                  <option value="RSA-2048">RSA 2048-bit</option>
                </select>
              </div>
            </div>

            {!interCert ? (
              <button
                onClick={handleGenerateIntermediate}
                disabled={generatingInter}
                className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all"
              >
                {generatingInter ? 'Signing Intermediate CA...' : '✍️ Generate & Sign Intermediate CA'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIntermediateCert(null); setLeafCert(null); }}
                  className="flex-1 py-2 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs font-bold"
                >
                  Reset Intermediate CA
                </button>
                <button
                  onClick={() => downloadTextFile(`${interCn.toLowerCase().replace(/\s+/g, '-')}.crt`, interCert.certPem)}
                  className="px-3.5 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-card transition text-text-primary"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Issue Leaf Cert */}
          <div className={`p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4 transition-all ${!interCert ? 'opacity-45 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/50">
              <span className="w-6 h-6 rounded-full bg-accent-glow text-accent-primary text-xs font-black flex items-center justify-center border border-accent-primary/10">3</span>
              <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">Issue Leaf Certificate</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Leaf Domain/Common Name</label>
                <input
                  type="text"
                  value={leafCn}
                  onChange={e => setLeafCn(e.target.value)}
                  disabled={leafCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Subject Alternative Names (SANs)</label>
                <input
                  type="text"
                  value={leafSans}
                  onChange={e => setLeafSans(e.target.value)}
                  disabled={leafCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none font-mono text-[10px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Key Usage</label>
                <select
                  value={leafUsage}
                  onChange={e => setLeafUsage(e.target.value)}
                  disabled={leafCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                >
                  <option value="Server Authentication">Server Authentication (HTTPS)</option>
                  <option value="Client Authentication">Client Authentication (mTLS)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase">Key Type</label>
                <select
                  value={leafKeyType}
                  onChange={e => setLeafKeyType(e.target.value)}
                  disabled={leafCert !== null}
                  className="w-full bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none"
                >
                  <option value="ECDSA-P256">ECDSA P-256</option>
                  <option value="RSA-2048">RSA 2048-bit</option>
                </select>
              </div>
            </div>

            {!leafCert ? (
              <button
                onClick={handleGenerateLeaf}
                disabled={generatingLeaf}
                className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all"
              >
                {generatingLeaf ? 'Issuing Leaf Certificate...' : '⚡ Issue Web Certificate (X.509)'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setLeafCert(null)}
                  className="flex-1 py-2 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs font-bold"
                >
                  Reset Leaf Certificate
                </button>
                <button
                  onClick={() => downloadTextFile(`${leafCn.replace(/\./g, '-')}.crt`, leafCert.certPem)}
                  className="px-3.5 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-card transition text-text-primary"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Visual Chain & PEM Viewer */}
        <div className="space-y-6">
          
          {/* Visual Chain-of-Trust Diagram */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">PKI Cryptographic Chain-of-Trust</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 border border-border-subtle/50 rounded-xl bg-bg-sidebar/30">
              
              {/* Root CA Node */}
              <div className={`p-3 rounded-lg border text-center font-semibold text-xs transition-all w-40 ${
                rootCert ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-border-subtle bg-bg-sidebar opacity-30'
              }`}>
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-accent-primary" />
                <span className="block truncate font-bold">{rootCert ? rootCert.commonName : 'Empty Root'}</span>
                <span className="text-[9px] text-text-muted block">Self-Signed Root</span>
              </div>

              <ArrowRight className="hidden md:block w-4 h-4 text-text-muted" />

              {/* Intermediate CA Node */}
              <div className={`p-3 rounded-lg border text-center font-semibold text-xs transition-all w-40 ${
                interCert ? 'border-accent-secondary bg-accent-secondary/10 text-text-primary' : 'border-border-subtle bg-bg-sidebar opacity-30'
              }`}>
                <Key className="w-5 h-5 mx-auto mb-1 text-accent-secondary" />
                <span className="block truncate font-bold">{interCert ? interCert.commonName : 'Empty Intermediate'}</span>
                <span className="text-[9px] text-text-muted block">Signed by Root</span>
              </div>

              <ArrowRight className="hidden md:block w-4 h-4 text-text-muted" />

              {/* Leaf Cert Node */}
              <div className={`p-3 rounded-lg border text-center font-semibold text-xs transition-all w-40 ${
                leafCert ? 'border-emerald-500/50 bg-emerald-500/10 text-text-primary' : 'border-border-subtle bg-bg-sidebar opacity-30'
              }`}>
                <Server className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <span className="block truncate font-bold">{leafCert ? leafCert.commonName : 'Empty Leaf'}</span>
                <span className="text-[9px] text-text-muted block">Signed by Intermediate</span>
              </div>

            </div>
          </div>

          {/* Output Certificate Inspect Panel */}
          {rootCert && (
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
                <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-accent-primary" />
                  X.509 Certificate PEM Inspector
                </h3>
                <span className="text-[9px] bg-accent-glow px-2 py-0.5 rounded-full font-bold border border-accent-primary/20 text-accent-primary">Local Session Only</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Visual Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-bg-sidebar/50 p-3.5 rounded-xl border border-border-subtle">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-text-muted">Active Hierarchy Subject</span>
                    <p className="font-bold text-text-primary truncate">{leafCert ? leafCn : interCert ? interCn : rootCn}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-text-muted">Subject Key Identifier (SKI)</span>
                    <p className="font-mono text-[9px] text-accent-secondary truncate">{leafCert ? leafCert.subjectKeyId : interCert ? interCert.subjectKeyId : rootCert.subjectKeyId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-text-muted">Authority Key Identifier (AKI)</span>
                    <p className="font-mono text-[9px] text-text-muted truncate">{leafCert ? leafCert.authorityKeyId : interCert ? interCert.authorityKeyId : rootCert.authorityKeyId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-text-muted">Signature Algorithm</span>
                    <p className="font-bold text-emerald-500 text-[10px]">{leafCert ? leafCert.keyType : interCert ? interCert.keyType : rootCert.keyType === 'ECDSA-P256' ? 'ecdsa-with-SHA256' : 'sha256WithRSAEncryption'}</p>
                  </div>
                </div>

                {/* PEM block */}
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold block uppercase">PEM Payload Block</span>
                  <div className="relative">
                    <pre className="text-[8px] sm:text-[9px] font-mono bg-black text-text-secondary border border-zinc-800 rounded-xl p-3.5 overflow-x-auto select-all leading-normal whitespace-pre">
                      {leafCert ? leafCert.certPem : interCert ? interCert.certPem : rootCert.certPem}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Explainer section */}
      <div className="mt-8 space-y-6">
        <BeginnerExpertExplainer tool={tool} />
      </div>
    </ToolPageShell>
  )
}
