import { useState, useMemo } from 'react'
import { Check, Copy, Download, RefreshCw, FileCode } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('saml-metadata-builder')!

const MOCK_CERTIFICATE = 
  `MIIDcjCCAlqgAwIBAgIQT0212765MA0GCSqGSIb3DQEBCwUAMBsxFzAVBgNVBAMTDmFi
b3V0aWFtLmxvY2FsMB4XDTI2MDcwNDE1MDAwMFoXDTM2MDcwNDE1MDAwMFowGzEZMBcG
A1UEAxMOYWJvdXRpYW0ubG9jYWwwZzAiMA0GCSqGSIb3DQEBAQUAA0sAMEgCQQC1jY8f
eUfXN182Ccl7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD
9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7d
G7vDAgMBAAGjgaYwgaMwHQYDVR0OBBYEFOf7+r/Z9X3t7P8+r/Z9X3t7P8+rMB8GA1Ud
IwQYMBaAFOf7+r/Z9X3t7P8+r/Z9X3t7P8+rMAsGA1UdDwQEAwIHgDATBgNVHSUEDDAK
BggrBgEFBQcDATAnBgNVHREEIDAeghxhcHAuYWJvdXRpYW0ubG9jYWyCDmFib3V0aWFt
LmxvY2FsMA0GCSqGSIb3DQEBCwUAD0SAMEgCQQC1jY8feUfXN182Ccl7vD9v8eUz3l9e
1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz
3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v
8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7vD9v8eUz3l9e1m7dG7
vDAg==`

export default function SamlMetadataBuilder() {
  const [role, setRole] = useState<'sp' | 'idp'>('sp')
  const [entityId, setEntityId] = useState('https://sp.aboutiam.local/saml')
  const [endpointUrl, setEndpointUrl] = useState('https://sp.aboutiam.local/saml/acs')
  const [endpointBinding, setEndpointBinding] = useState('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST')
  const [sloUrl, setSloUrl] = useState('https://sp.aboutiam.local/saml/slo')
  const [sloBinding, setSloBinding] = useState('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect')
  const [includeSlo, setIncludeSlo] = useState(false)
  const [signingCert, setSigningCert] = useState('')
  const [nameIdFormat, setNameIdFormat] = useState('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress')
  const [authnSigned, setAuthnRequestsSigned] = useState(true)
  const [assertionsSigned, setWantAssertionsSigned] = useState(true)

  const { copy, copiedId } = useClipboardCopy()

  // Auto-adjust default URLs depending on role
  const handleRoleChange = (newRole: 'sp' | 'idp') => {
    setRole(newRole)
    if (newRole === 'sp') {
      setEntityId('https://sp.aboutiam.local/saml')
      setEndpointUrl('https://sp.aboutiam.local/saml/acs')
      setEndpointBinding('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST')
      setSloUrl('https://sp.aboutiam.local/saml/slo')
    } else {
      setEntityId('https://idp.aboutiam.local/saml')
      setEndpointUrl('https://idp.aboutiam.local/saml/sso')
      setEndpointBinding('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect')
      setSloUrl('https://idp.aboutiam.local/saml/slo')
    }
  }

  // Load a realistic self-signed certificate PEM
  const handleLoadMockCert = () => {
    setSigningCert(MOCK_CERTIFICATE.replace(/\s+/g, ''))
  }

  // Calculate XML output dynamically
  const xmlOutput = useMemo(() => {
    const cleanCert = signingCert.trim().replace(/-----BEGIN CERTIFICATE-----/g, '').replace(/-----END CERTIFICATE-----/g, '').replace(/\s+/g, '')

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                     entityID="${entityId}">`

    if (role === 'sp') {
      // Service Provider
      xml += `
  <md:SPSSODescriptor AuthnRequestsSigned="${authnSigned}"
                      WantAssertionsSigned="${assertionsSigned}"
                      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">`

      if (cleanCert) {
        xml += `
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${cleanCert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:KeyDescriptor use="encryption">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${cleanCert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>`
      }

      if (includeSlo && sloUrl) {
        xml += `
    <md:SingleLogoutService Binding="${sloBinding}"
                            Location="${sloUrl}" />`
      }

      if (nameIdFormat) {
        xml += `
    <md:NameIDFormat>${nameIdFormat}</md:NameIDFormat>`
      }

      xml += `
    <md:AssertionConsumerService Binding="${endpointBinding}"
                                 Location="${endpointUrl}"
                                 index="0"
                                 isDefault="true" />
  </md:SPSSODescriptor>`

    } else {
      // Identity Provider
      xml += `
  <md:IDPSSODescriptor WantAuthnRequestsSigned="${authnSigned}"
                       protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">`

      if (cleanCert) {
        xml += `
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${cleanCert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>`
      }

      if (includeSlo && sloUrl) {
        xml += `
    <md:SingleLogoutService Binding="${sloBinding}"
                            Location="${sloUrl}" />`
      }

      if (nameIdFormat) {
        xml += `
    <md:NameIDFormat>${nameIdFormat}</md:NameIDFormat>`
      }

      xml += `
    <md:SingleSignOnService Binding="${endpointBinding}"
                            Location="${endpointUrl}" />
  </md:IDPSSODescriptor>`
    }

    xml += `
</md:EntityDescriptor>`

    return xml
  }, [role, entityId, endpointUrl, endpointBinding, sloUrl, sloBinding, includeSlo, signingCert, nameIdFormat, authnSigned, assertionsSigned])

  // Download XML file
  const handleDownloadXml = () => {
    const blob = new Blob([xmlOutput], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.setAttribute('href', url)
    downloadLink.setAttribute('download', `${role === 'sp' ? 'sp' : 'idp'}_saml_metadata.xml`)
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls Pane (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            
            {/* Role Tab selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-text-muted font-bold block uppercase">Federation Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('sp')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    role === 'sp'
                      ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm'
                      : 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
                  }`}
                >
                  Service Provider (SP)
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('idp')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    role === 'idp'
                      ? 'bg-accent-glow/5 border-accent-primary text-accent-primary shadow-sm'
                      : 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
                  }`}
                >
                  Identity Provider (IdP)
                </button>
              </div>
            </div>

            {/* Entity ID */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="entity-id-input">ENTITY ID (ISSUER AUDIENCE)</label>
              <input
                id="entity-id-input"
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Core Endpoint (ACS or SSO depending on role) */}
            <div className="space-y-3.5 border-t border-border-subtle/50 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="endpoint-url-input">
                  {role === 'sp' ? 'Assertion Consumer Service (ACS) URL' : 'Single Sign-On (SSO) URL'}
                </label>
                <input
                  id="endpoint-url-input"
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="endpoint-binding-select">ENDPOINT BINDING</label>
                <select
                  id="endpoint-binding-select"
                  value={endpointBinding}
                  onChange={(e) => setEndpointBinding(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-sans text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">HTTP-POST</option>
                  <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect">HTTP-Redirect</option>
                </select>
              </div>
            </div>

            {/* Optional SLO toggler */}
            <div className="space-y-3.5 border-t border-border-subtle/50 pt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="include-slo-check" className="text-[10px] text-text-primary font-black uppercase">Include Single Logout (SLO)</label>
                <input
                  id="include-slo-check"
                  type="checkbox"
                  checked={includeSlo}
                  onChange={(e) => setIncludeSlo(e.target.checked)}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary"
                />
              </div>

              {includeSlo && (
                <div className="space-y-3.5 pt-1.5 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="slo-url-input">SLO TARGET ENDPOINT URL</label>
                    <input
                      id="slo-url-input"
                      type="text"
                      value={sloUrl}
                      onChange={(e) => setSloUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="slo-binding-select">SLO BINDING TYPE</label>
                    <select
                      id="slo-binding-select"
                      value={sloBinding}
                      onChange={(e) => setSloBinding(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-sans text-text-primary focus:outline-none focus:border-accent-primary"
                    >
                      <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect">HTTP-Redirect</option>
                      <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">HTTP-POST</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Certificates PEM Area */}
            <div className="space-y-2 border-t border-border-subtle/50 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="signing-cert-input">Public signing Certificate (Base64)</label>
                <button
                  type="button"
                  onClick={handleLoadMockCert}
                  className="text-[9px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1 transition-all"
                  title="Generate a self-signed key template"
                >
                  <RefreshCw className="w-3 h-3" /> Load Mock Key
                </button>
              </div>
              <textarea
                id="signing-cert-input"
                value={signingCert}
                onChange={(e) => setSigningCert(e.target.value)}
                placeholder="Paste public certificate payload (Base64 format)..."
                className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle font-mono text-[9px] text-text-secondary h-20 resize-none focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* NameID Formats */}
            <div className="space-y-1.5 border-t border-border-subtle/50 pt-4">
              <label className="text-[10px] text-text-muted font-bold block uppercase" htmlFor="nameid-format-select">Preferred NameID Format</label>
              <select
                id="nameid-format-select"
                value={nameIdFormat}
                onChange={(e) => setNameIdFormat(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-sans text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">emailAddress (User email)</option>
                <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">persistent (Secure opaque ID)</option>
                <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">transient (Temporary session ID)</option>
                <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">unspecified</option>
              </select>
            </div>

            {/* Cryptographic Signing checks */}
            <div className="space-y-2 border-t border-border-subtle/50 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-text-primary font-black uppercase">
                  {role === 'sp' ? 'Sign AuthnRequests' : 'Expect AuthnRequests Signed'}
                </span>
                <input
                  type="checkbox"
                  checked={authnSigned}
                  onChange={(e) => setAuthnRequestsSigned(e.target.checked)}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary"
                  aria-label="Toggle AuthnRequests Signed"
                />
              </div>

              {role === 'sp' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-text-primary font-black uppercase">Expect Assertions Signed</span>
                  <input
                    type="checkbox"
                    checked={assertionsSigned}
                    onChange={(e) => setWantAssertionsSigned(e.target.checked)}
                    className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary"
                    aria-label="Toggle Assertions Signed"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Code Output (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col min-h-[480px]">
            
            <div className="flex items-center justify-between border-b border-border-subtle pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-accent-primary" />
                <div>
                  <span className="block text-xs font-black text-text-primary uppercase leading-tight">Formatted SAML Metadata XML</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">Live schema conforming to XML Metadata profile</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copy(xmlOutput, 'saml-metadata')}
                  className="px-3 py-1.5 bg-bg-nested hover:bg-bg-sidebar text-text-secondary hover:text-text-primary rounded-lg border border-border-subtle text-xs font-bold flex items-center gap-1 transition-all"
                  title="Copy to clipboard"
                >
                  {copiedId === 'saml-metadata' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadXml}
                  className="px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" /> Download XML
                </button>
              </div>
            </div>

            {/* XML Textarea display */}
            <textarea
              aria-label="SAML Metadata XML Output"
              readOnly
              value={xmlOutput}
              className="flex-grow w-full font-mono text-[10px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-4 focus:outline-none resize-none h-[420px] text-text-secondary select-text"
            />
          </div>
        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
