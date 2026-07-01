import { useState, useEffect } from 'react'
import { 
  Lock, AlertTriangle, ShieldCheck, Terminal, Copy, Info, RefreshCw
} from 'lucide-react'

export default function SAMLWorkbench() {
  const [sswActive, setSswActive] = useState(false)
  const [isCopied, setIsCopied] = useState<string | null>(null)
  const [xmlContent, setXmlContent] = useState('')
  const [verification, setVerification] = useState<'valid' | 'spoofed' | 'invalid'>('valid')

  const generateSAMLXml = () => {
    if (sswActive) {
      setVerification('spoofed')
      return `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_resp123">
  <!-- Signature wrapping exploit wraps a signed, legitimate assertion -->
  <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_legitAssert">
    <saml:Subject><saml:NameID>user@company.com</saml:NameID></saml:Subject>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/01/xmlsig#">
      <ds:SignedInfo><ds:Reference URI="#_legitAssert" /></ds:SignedInfo>
      <ds:SignatureValue>M38a8b...[Valid Signature]</ds:SignatureValue>
    </ds:Signature>
  </saml:Assertion>
  
  <!-- ATTACKER INJECTS A DUPLICATE, SPROOFED ASSERTION AT THE END -->
  <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_spoofedAssert">
    <saml:Subject><saml:NameID>admin@company.com</saml:NameID></saml:Subject>
    <saml:AttributeStatement>
      <saml:Attribute Name="role"><saml:AttributeValue>admin</saml:AttributeValue></saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`
    }

    setVerification('valid')
    return `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_resp123">
  <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_legitAssert">
    <saml:Issuer>https://auth.company.com</saml:Issuer>
    <saml:Subject>
      <saml:NameID>user@company.com</saml:NameID>
    </saml:Subject>
    <saml:AttributeStatement>
      <saml:Attribute Name="role"><saml:AttributeValue>user</saml:AttributeValue></saml:Attribute>
    </saml:AttributeStatement>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/01/xmlsig#">
      <ds:SignedInfo><ds:Reference URI="#_legitAssert" /></ds:SignedInfo>
      <ds:SignatureValue>M38a8b...[Valid Signature]</ds:SignatureValue>
    </ds:Signature>
  </saml:Assertion>
</samlp:Response>`
  }

  useEffect(() => {
    setXmlContent(generateSAMLXml())
  }, [sswActive])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(xmlContent)
    setIsCopied('xml')
    setTimeout(() => setIsCopied(null), 1500)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Lock className="w-3.5 h-3.5" /> Cryptographic Sandbox
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          SAML 2.0 XML Workbench
        </h2>
        <p className="text-text-secondary">
          Inspect raw XML SSO Assertions and simulate **SAML Signature Wrapping (SSW)** exploits to see how vulnerable XML parsers can be tricked into validating spoofed admin rights.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <RefreshCw className="w-4 h-4 text-accent-primary" /> Signature Wrapper
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Enable the SSW attack vector. In this exploit, the attacker wraps a signed, legitimate user assertion, and appends a duplicate unsigned assertion carrying admin privileges.
            </p>
            <button
              onClick={() => setSswActive(!sswActive)}
              className={`w-full py-2 px-4 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                sswActive 
                  ? 'bg-status-danger/10 border-status-danger text-status-danger shadow-md shadow-status-danger/5' 
                  : 'border-border-subtle hover:bg-bg-sidebar text-text-primary'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {sswActive ? 'Deactivate SSW Attack' : 'Trigger SAML SSW Attack'}
            </button>
          </div>
        </div>

        {/* XML Viewer */}
        <div className="lg:col-span-2 space-y-4 font-mono">
          {/* Status Bar */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors text-xs ${
            verification === 'valid' 
              ? 'bg-status-success/5 border-status-success/20 text-status-success' 
              : 'bg-status-danger/5 border-status-danger/20 text-status-danger'
          }`}>
            {verification === 'valid' ? (
              <>
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="font-bold uppercase tracking-wider">SAML Verified:</span> Signature on assertion ID "_legitAssert" matches perfectly. User is authenticated as "user@company.com".
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
                <span className="font-bold uppercase tracking-wider">SSW Bypass Success:</span> The XML parser validates the signature on "_legitAssert" but reads the payload of "_spoofedAssert" (admin). User logged in as admin!
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-primary">
              <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-accent-secondary" /> Raw SAML Assertion (XML)</span>
              <button onClick={copyToClipboard} className="text-text-muted hover:text-text-primary">
                {isCopied === 'xml' ? <span className="text-status-success text-[10px]">Copied!</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-5 rounded-xl bg-bg-card border border-border-subtle text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre overflow-y-auto max-h-[300px]">
              {xmlContent}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-bg-sidebar/50 border border-border-subtle flex gap-3 text-xs text-text-muted font-semibold items-start relative z-10">
            <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-text-primary text-[10px] uppercase">Remediation Alert</span>
              <p className="leading-relaxed text-text-secondary">
                Always ensure your XML parser validates signatures against exact node references (SAML assertions IDs) rather than checking the signature of one element and reading the payload of another. Enforce strict schema validations before reading DOM values.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
