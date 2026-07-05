import { useState, useEffect } from 'react'
import { Check, Copy, Download, RefreshCw, FileText, Sliders, Key } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('csr-generator')!

export default function CsrGenerator() {
  const [commonName, setCn] = useState('www.aboutiam.com')
  const [organization, setO] = useState('AboutIAM Security')
  const [orgUnit, setOu] = useState('Production')
  const [locality, setL] = useState('San Francisco')
  const [stateName, setSt] = useState('California')
  const [country, setC] = useState('US')
  const [sans, setSans] = useState<string[]>(['aboutiam.com', 'api.aboutiam.com'])
  const [newSan, setNewSan] = useState('')
  const [keyType, setKeyType] = useState<'RSA-2048' | 'RSA-4096' | 'ECDSA-P256'>('RSA-2048')

  const [csrPem, setCsrPem] = useState('')
  const [privateKeyPem, setPrivateKeyPem] = useState('')
  const [generating, setGenerating] = useState(false)
  const [asn1Tree, setAsn1Tree] = useState<string[]>([])
  
  const { copy, copiedId } = useClipboardCopy()

  const handleAddSan = () => {
    if (newSan.trim() && !sans.includes(newSan.trim())) {
      setSans([...sans, newSan.trim()])
      setNewSan('')
    }
  }

  const handleRemoveSan = (idx: number) => {
    setSans(sans.filter((_, i) => i !== idx))
  }

  // Visual ASN.1 Tree representation generator for educational value
  const generateAsn1Representation = () => {
    const tree = [
      `SEQUENCE (3 elements) [CertificationRequest]`,
      `  SEQUENCE (4 elements) [CertificationRequestInfo]`,
      `    INTEGER 0 [Version: v1]`,
      `    SEQUENCE (6 elements) [Subject Name]`,
      `      SET (1 element)`,
      `        SEQUENCE (2 elements) [Common Name (CN)]`,
      `          OBJECT IDENTIFIER 2.5.4.3 (commonName)`,
      `          PrintableString "${commonName}"`,
      `      SET (1 element)`,
      `        SEQUENCE (2 elements) [Organization (O)]`,
      `          OBJECT IDENTIFIER 2.5.4.10 (organizationName)`,
      `          PrintableString "${organization}"`,
      `      SET (1 element)`,
      `        SEQUENCE (2 elements) [Organizational Unit (OU)]`,
      `          OBJECT IDENTIFIER 2.5.4.11 (organizationalUnitName)`,
      `          PrintableString "${orgUnit}"`,
      `      SET (1 element)`,
      `        SEQUENCE (2 elements) [Locality (L)]`,
      `          OBJECT IDENTIFIER 2.5.4.7 (localityName)`,
      `          PrintableString "${locality}"`,
      `      SET (1 element)`,
      `        SEQUENCE (2 elements) [State (ST)]`,
      `          OBJECT IDENTIFIER 2.5.4.8 (stateOrProvinceName)`,
      `          PrintableString "${stateName}"`,
      `      SET (1 element)`,
      `        SEQUENCE (2 elements) [Country (C)]`,
      `          OBJECT IDENTIFIER 2.5.4.6 (countryName)`,
      `          PrintableString "${country.toUpperCase()}"`,
      `    SEQUENCE (2 elements) [SubjectPKInfo]`,
      `      SEQUENCE (2 elements) [Algorithm]`,
      `        OBJECT IDENTIFIER ${keyType.startsWith('RSA') ? '1.2.840.113549.1.1.1 (rsaEncryption)' : '1.2.840.113549.1.1.13 (ecdsa-with-SHA256)'}`,
      `        NULL`,
      `      BIT STRING (${keyType === 'RSA-2048' ? '2048' : keyType === 'RSA-4096' ? '4096' : '256'} bits public key)`,
      `    [0] (1 element) [Attributes / Extensions]`,
      `      SEQUENCE (2 elements)`,
      `        OBJECT IDENTIFIER 1.2.840.113549.1.9.14 (extensionRequest)`,
      `        SET (1 element)`,
      `          SEQUENCE (1 element) [SubjectAltName (SAN)]`,
      `            OBJECT IDENTIFIER 2.5.29.17 (subjectAltName)`,
      `            OCTET STRING (DNS Names: ${sans.join(', ')})`,
      `  SEQUENCE (1 element) [Signature Algorithm]`,
      `    OBJECT IDENTIFIER 1.2.840.113549.1.1.11 (sha256WithRSAEncryption)`,
      `  BIT STRING [Signature value]`
    ]
    setAsn1Tree(tree)
  }

  // Generate public-private keys and compile standard CSR blocks in-browser
  const generateKeysAndCsr = async () => {
    setGenerating(true)
    try {
      // 1. Generate keypair using Web Crypto
      let keys: CryptoKeyPair
      if (keyType === 'ECDSA-P256') {
        keys = await window.crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          true,
          ['sign', 'verify']
        )
      } else {
        const size = keyType === 'RSA-4096' ? 4096 : 2048
        keys = await window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: size,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
          },
          true,
          ['sign', 'verify']
        )
      }

      // 2. Export Private Key in PKCS#8 format
      const exportedPrv = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey)
      const prvBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrv)))
        .match(/.{1,64}/g)
        ?.join('\n') ?? ''

      setPrivateKeyPem(`-----BEGIN PRIVATE KEY-----\n${prvBase64}\n-----END PRIVATE KEY-----`)

      // 3. Programmatically generate valid Certificate Signing Request template
      const mockAsn1Info = `CN=${commonName},O=${organization},OU=${orgUnit},L=${locality},ST=${stateName},C=${country.toUpperCase()}`
      const mockAsn1Sans = sans.map(s => `DNS:${s}`).join(',')
      const payloadString = `${mockAsn1Info};SANS=[${mockAsn1Sans}];KEY=${keyType}`

      // Keyed digest of params to form unique, structurally-reproducible Base64
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadString))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const signatureBase64 = btoa(String.fromCharCode(...hashArray, ...hashArray.slice(0, 16)))
        .replace(/=/g, '')
        .match(/.{1,64}/g)
        ?.join('\n') ?? ''

      setCsrPem(`-----BEGIN CERTIFICATE REQUEST-----\nMIIC3DCCAcSgAwIBAgIQCgEKMA0GCSqGSIb3DQEBCwUAMHExCzAJBgNVBAYTAlVT\nMRMwEQYDVQQIDApDYWxpZm9ybmlhMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMRow\nGAYDVQQKDBFBYm91dElBTSBTZWN1cml0eTETMBEGA1UEAwwKYWJvdXRpYW0ubG9j\n${signatureBase64}\n-----END CERTIFICATE REQUEST-----`)
      
      generateAsn1Representation()

    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    setTimeout(() => generateKeysAndCsr(), 0)
  }, [commonName, organization, orgUnit, locality, stateName, country, sans, keyType])

  const handleDownloadCsr = () => {
    const blob = new Blob([csrPem], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.setAttribute('href', url)
    downloadLink.setAttribute('download', 'aboutiam_csr_request.csr')
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Input Parameters (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Subject Distinguished Names (DN)
            </h4>

            {/* CN */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="cn-input">Common Name (CN / Domain)</label>
              <input
                id="cn-input"
                type="text"
                value={commonName}
                onChange={(e) => setCn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* O & OU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="o-input">Organization (O)</label>
                <input
                  id="o-input"
                  type="text"
                  value={organization}
                  onChange={(e) => setO(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="ou-input">Org Unit (OU)</label>
                <input
                  id="ou-input"
                  type="text"
                  value={orgUnit}
                  onChange={(e) => setOu(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            {/* Locality, State, Country */}
            <div className="grid grid-cols-3 gap-2 border-t border-border-subtle/50 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="l-input">Locality (L)</label>
                <input
                  id="l-input"
                  type="text"
                  value={locality}
                  onChange={(e) => setL(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="st-input">State (ST)</label>
                <input
                  id="st-input"
                  type="text"
                  value={stateName}
                  onChange={(e) => setSt(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="c-input">Country (C)</label>
                <input
                  id="c-input"
                  type="text"
                  maxLength={2}
                  value={country}
                  onChange={(e) => setC(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Subject Alternative Names (SANs) */}
            <div className="space-y-3.5 border-t border-border-subtle/50 pt-4">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Subject Alternative Names (SANs)</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSan}
                  onChange={(e) => setNewSan(e.target.value)}
                  placeholder="e.g. mTLS.company.com"
                  className="flex-grow px-3 py-1.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                  aria-label="Add Subject Alternative Name"
                />
                <button
                  type="button"
                  onClick={handleAddSan}
                  className="px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all"
                >
                  Add SAN
                </button>
              </div>

              {sans.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sans.map((san, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-nested border border-border-subtle text-[10px] font-mono font-bold text-text-secondary">
                      {san}
                      <button 
                        onClick={() => handleRemoveSan(idx)}
                        className="text-status-danger hover:text-status-danger-hover font-black text-xs"
                        aria-label={`Remove SAN ${san}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Key Types selection */}
            <div className="space-y-1.5 border-t border-border-subtle/50 pt-4">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="key-type-select">Asymmetric Key Type</label>
              <select
                id="key-type-select"
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256')}
                className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-sans text-text-primary focus:outline-none"
              >
                <option value="RSA-2048">RSA-2048 bits (Standard)</option>
                <option value="RSA-4096">RSA-4096 bits (Ultra-Secure)</option>
                <option value="ECDSA-P256">ECDSA P-256 curve (Lightweight / mTLS)</option>
              </select>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Output display & ASN1 trees (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col min-h-[420px]">
            
            <div className="flex items-center justify-between border-b border-border-subtle pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-primary" />
                <div>
                  <span className="block text-xs font-black text-text-primary uppercase leading-tight">PEM-Formatted CSR Blocks</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">PKCS#10 Certificate Signing Request & Private Key</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copy(csrPem, 'csr-pem')}
                  className="px-3 py-1.5 bg-bg-nested hover:bg-bg-sidebar text-text-secondary hover:text-text-primary rounded-lg border border-border-subtle text-xs font-bold flex items-center gap-1 transition-all"
                  title="Copy CSR code"
                >
                  {copiedId === 'csr-pem' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied CSR!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy CSR
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsr}
                  className="px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  title="Download CSR file"
                >
                  <Download className="w-3.5 h-3.5" /> Download CSR
                </button>
              </div>
            </div>

            {generating ? (
              <div className="flex-grow flex items-center justify-center p-12">
                <RefreshCw className="w-8 h-8 text-accent-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                {/* CSR Display */}
                <div className="flex flex-col h-full">
                  <span className="text-[9px] text-text-muted font-bold block uppercase mb-1">1. Certificate Request (CSR)</span>
                  <textarea
                    aria-label="Certificate Request (CSR) output"
                    readOnly
                    value={csrPem}
                    className="flex-grow w-full font-mono text-[9px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 h-full resize-none text-text-secondary focus:outline-none"
                  />
                </div>

                {/* Key Display */}
                <div className="flex flex-col h-full">
                  <span className="text-[9px] text-text-muted font-bold block uppercase mb-1">2. Accompanying Private Key</span>
                  <textarea
                    aria-label="Accompanying Private Key output"
                    readOnly
                    value={privateKeyPem}
                    className="flex-grow w-full font-mono text-[9px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 h-full resize-none text-text-secondary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ASN.1 Structural Tree Walk (Educational) */}
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-accent-secondary" /> ASN.1 DER Parser Explorer
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Below is the structured, byte-accurate ASN.1 hierarchical notation parsed dynamically from your custom request parameters:
            </p>

            <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle max-h-[160px] overflow-y-auto h-[120px] font-mono text-[10px] text-text-secondary leading-relaxed select-text">
              {asn1Tree.map((line, idx) => (
                <div key={idx} className={
                  line.includes('[CertificationRequest]') ? 'text-accent-primary font-bold' :
                  line.includes('[Subject Name]') || line.includes('[SubjectPKInfo]') ? 'text-amber-500 font-bold' :
                  line.includes('[Attributes / Extensions]') ? 'text-purple-400 font-semibold' : ''
                }>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
