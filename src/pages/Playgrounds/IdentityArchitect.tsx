import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Cpu, ArrowRight, Terminal, Sparkles, Download
} from 'lucide-react'

type UseCaseType = 'workforce' | 'ciam'
type ComplianceType = 'soc2' | 'hipaa' | 'gdpr'
type CloudType = 'aws' | 'gcp' | 'azure' | 'multi_cloud'
type ScaleType = 'growth' | 'enterprise'

export default function IdentityArchitect() {
  const [step, setStep] = useState(0)

  // Questionnaire States
  const [useCase, setUseCase] = useState<UseCaseType>('workforce')
  const [compliance, setCompliance] = useState<ComplianceType>('soc2')
  const [cloud, setCloud] = useState<CloudType>('aws')
  const [scale, setScale] = useState<ScaleType>('growth')

  // UI Active tabs for generated outputs
  const [activeTab, setActiveTab] = useState<'blueprint' | 'threat' | 'products' | 'policy'>('blueprint')

  const resetWizard = () => {
    setStep(0)
    setUseCase('workforce')
    setCompliance('soc2')
    setCloud('aws')
    setScale('growth')
  }

  // Dynamic Blueprint Generation Engine
  const generatedBlueprint = useMemo(() => {
    // Generate ASCII/text topological flow diagram
    let topology = ''
    if (useCase === 'workforce') {
      topology = `[ Workstation (Postured) ]\n       │ (mTLS TLS 1.3)\n       ▼\n[ API Gateway PEP (Envoy) ] ──(queries gRPC)──► [ PDP Engine (OPA) ]\n       │                                                │\n       │ (authorizes JWT / SVID)                       │ (evaluates OIDC Groups)\n       ▼                                                ▼\n[ Target microservice ] ◄─────────────────────── [ Entra ID / Okta IdP ]`
    } else {
      topology = `[ Consumer Browser (SPA) ]\n       │ (OIDC / OAuth 2.1 Code Flow + PKCE)\n       ▼\n[ Tenant Router (API Gateway) ]\n       │\n       ├──► [ Central Auth Service ] ──(SAML SSO)──► [ Client Enterprise IdP ]\n       │\n       ▼\n[ Shared Database (PostgreSQL Row-Level Security) ]`
    }

    // Generate Threat Model List
    const threats = [
      {
        risk: 'Administrative Account Session Hijacking',
        mitigation: useCase === 'workforce' 
          ? 'Enforce strict Microsoft Entra Privileged Identity Management (PIM) with 2-hour JIT expirations.' 
          : 'Enforce phishing-resistant WebAuthn Passkeys at the Central Auth Portal.'
      },
      {
        risk: `Cross-Tenant data leakage on ${cloud.toUpperCase()} network paths`,
        mitigation: scale === 'enterprise' 
          ? 'Deploy isolated database-per-tenant partitions with KMS envelope encryption.' 
          : 'Configure PostgreSQL Row Level Security (RLS) policies binding queries to current Tenant IDs.'
      },
      {
        risk: `Compliance violation under ${compliance.toUpperCase()} parameters`,
        mitigation: compliance === 'hipaa'
          ? 'Encrypt all data-at-rest using AES-256 and enforce strict TLS 1.3 cryptographic transit audits.'
          : 'Configure SCIM 2.0 automated directory syncing to immediately de-provision terminated users.'
      }
    ]

    // Generate Product/Protocol Recommendations
    const products = {
      protocols: useCase === 'workforce' 
        ? ['OIDC Core 1.0', 'SAML 2.0', 'mTLS TLS 1.3', 'RFC 9396 CAEP'] 
        : ['OAuth 2.1 (Draft)', 'RFC 7636 PKCE', 'SCIM 2.0 (RFC 7644)', 'W3C WebAuthn'],
      software: useCase === 'workforce'
        ? ['Microsoft Entra ID', 'Okta Workforce', 'Open Policy Agent (OPA)', 'Envoy API Gateway']
        : ['Keycloak Open Source', 'PingFederate Server', 'Envoy Router', 'PostgreSQL Clustered']
    }

    // Generate access policy code (Rego or AWS IAM)
    let policyCode = ''
    if (useCase === 'workforce') {
      policyCode = `# Open Policy Agent (Rego) Access Control Policy\npackage identity.authz\n\ndefault allow = false\n\n# Allow engineers on compliant, managed devices inside internal network\nallow {\n    input.subject.role == "Developer"\n    input.subject.department == "Engineering"\n    input.environment.deviceState == "compliant"\n    input.environment.network == "internal"\n}`
    } else {
      policyCode = `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "AllowTenantPartitionReadWrite",\n      "Effect": "Allow",\n      "Action": [\n        "dynamodb:GetItem",\n        "dynamodb:PutItem"\n      ],\n      "Resource": "arn:aws:dynamodb:${cloud === 'aws' ? 'us-east-1' : 'global'}:*:table/TenantData",\n      "Condition": {\n        "StringEquals": {\n          "dynamodb:LeadingKeys": [\n            "\${cognito-identity.amazonaws.com:sub}"\n          ]\n        }\n      }\n    }\n  ]\n}`
    }

    return {
      topology,
      threats,
      products,
      policyCode
    }
  }, [useCase, compliance, cloud, scale])

  // Download entire bundle as text file
  const downloadBlueprint = () => {
    const content = `=========================================
ABOUTIAM IDENTITY ARCHITECTURE BLUEPRINT
Generated: ${new Date().toLocaleDateString()}
=========================================

1. QUESTIONNAIRE ANSWERS:
- Use Case: ${useCase.toUpperCase()}
- Compliance: ${compliance.toUpperCase()}
- Cloud Provider: ${cloud.toUpperCase()}
- Tenant Scale: ${scale.toUpperCase()}

2. TOPOLOGICAL FLOW DIAGRAM:
${generatedBlueprint.topology}

3. THREAT MODELING:
${generatedBlueprint.threats.map((t, idx) => `${idx + 1}. RISK: ${t.risk}\n   MITIGATION: ${t.mitigation}`).join('\n')}

4. ACCESS CONTROL POLICY TEMPLATE:
${generatedBlueprint.policyCode}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `identity-blueprint-${useCase}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Architect (AI Blueprint Generator)</h1>
            <p className="text-xs text-text-secondary">Answer baseline business requirements to dynamically generate secure, compliant identity architectures, threat models, and policies</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Container */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Active Wizard Steps */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
          
          {step === 0 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs text-accent-primary font-extrabold uppercase tracking-widest border-b border-border-subtle pb-1.5 mb-1">
                <Sparkles className="w-4 h-4 animate-bounce" /> 1. Select Target Use Case
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Choose the primary audience category you are architectural modeling for. Workforce systems focus on employees, whereas CIAM systems focus on external SaaS clients.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setUseCase('workforce')}
                  className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-1 ${useCase === 'workforce' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                >
                  <span className="text-sm block">Workforce IAM (Employees/Internal)</span>
                  <span className="text-[10px] text-text-muted font-normal">Standardizes single-sign-on (SSO), active directory sync, device posturing, and HR joiner/mover/leaver pipelines.</span>
                </button>

                <button
                  onClick={() => setUseCase('ciam')}
                  className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-1 ${useCase === 'ciam' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                >
                  <span className="text-sm block">Customer Identity (CIAM / B2B SaaS)</span>
                  <span className="text-[10px] text-text-muted font-normal">Focuses on external customer portals, multi-tenant single-sign-on (SAML/OIDC), API gatekeepings, and passwordless FIDO2.</span>
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs text-accent-primary font-extrabold uppercase tracking-widest border-b border-border-subtle pb-1.5 mb-1">
                <Sparkles className="w-4 h-4 animate-bounce" /> 2. Security Compliance & Scale
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Compliance Mandate</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['soc2', 'hipaa', 'gdpr'] as ComplianceType[]).map(comp => (
                    <button
                      key={comp}
                      onClick={() => setCompliance(comp)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition text-center ${compliance === comp ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                    >
                      {comp.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Principal Cloud Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['aws', 'gcp', 'azure', 'multi_cloud'] as CloudType[]).map(c => (
                    <button
                      key={c}
                      onClick={() => setCloud(c)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition text-center ${cloud === c ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                    >
                      {c === 'multi_cloud' ? 'Multi-Cloud' : c.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">User Directory Scale</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['growth', 'enterprise'] as ScaleType[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition text-center ${scale === s ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                    >
                      {s === 'growth' ? 'Growth Scale' : 'Enterprise Global'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Stepper Wizard Navigation Buttons */}
          <div className="pt-4 border-t border-border-subtle flex justify-between gap-3 mt-6">
            <button
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 0}
              className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition ${step === 0 ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-bg-nested hover:bg-border-subtle text-text-secondary'}`}
            >
              Back
            </button>
            
            {step === 0 ? (
              <button
                onClick={() => setStep(1)}
                className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm shadow-accent-primary/10 animate-pulse"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={resetWizard}
                className="bg-accent-glow border border-accent-primary/30 text-accent-primary text-xs font-bold px-4 py-1.5 rounded-lg transition hover:bg-accent-primary/20"
              >
                Restart Wizard
              </button>
            )}
          </div>

        </div>

        {/* Right pane: Custom Generated Outputs Panel */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex-grow flex flex-col justify-between min-h-[460px]">
            <div>
              {/* Output Tab Selection Header */}
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('blueprint')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeTab === 'blueprint' ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                  >
                    Architect Topology
                  </button>
                  <button
                    onClick={() => setActiveTab('threat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeTab === 'threat' ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                  >
                    Threat Model
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeTab === 'products' ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                  >
                    Products & Specs
                  </button>
                  <button
                    onClick={() => setActiveTab('policy')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeTab === 'policy' ? 'bg-accent-glow border-accent-primary text-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                  >
                    Access Policy Code
                  </button>
                </div>

                <button
                  onClick={downloadBlueprint}
                  className="text-xs bg-accent-primary hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Export Blueprint Bundle
                </button>
              </div>

              {/* TAB 1: GRAPHICAL TOPOLOGY BLUEPRINT */}
              {activeTab === 'blueprint' && (
                <div className="space-y-4 animate-fadeIn">
                  <span className="text-[10px] font-bold text-text-muted uppercase block font-mono">Custom Identity Flow Architecture</span>
                  <pre className="text-xs font-mono bg-bg-base border border-border-subtle p-5 rounded-xl text-accent-primary overflow-x-auto select-all leading-relaxed shadow-inner">
                    {generatedBlueprint.topology}
                  </pre>
                </div>
              )}

              {/* TAB 2: COMPLIANCE THREAT MODEL */}
              {activeTab === 'threat' && (
                <div className="space-y-3.5 animate-fadeIn">
                  <span className="text-[10px] font-bold text-text-muted uppercase block font-mono">Risk Mitigations & Trust Boundaries</span>
                  
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {generatedBlueprint.threats.map((t, idx) => (
                      <div key={idx} className="p-3 bg-bg-base border border-border-subtle rounded-xl space-y-1 text-xs">
                        <span className="font-extrabold text-status-danger block uppercase text-[9px] tracking-wider">
                          ⚠️ RISK {idx + 1}: {t.risk}
                        </span>
                        <p className="text-text-secondary leading-relaxed">
                          <strong>Remediation:</strong> {t.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCT & STANDARD RECOMMENDATIONS */}
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  
                  {/* Protocol Standards */}
                  <div className="bg-bg-base border border-border-subtle rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-text-muted uppercase font-mono block border-b border-border-subtle/50 pb-1.5">
                      Required Protocol Standards
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {generatedBlueprint.products.protocols.map(prot => (
                        <span key={prot} className="text-[10px] font-bold bg-accent-glow border border-accent-primary/25 px-2 py-0.5 rounded text-accent-primary">
                          {prot}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      Always select platforms and software containers that are verified, certified, and compliant with these strict cryptographic standards.
                    </p>
                  </div>

                  {/* Software Products */}
                  <div className="bg-bg-base border border-border-subtle rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-text-muted uppercase font-mono block border-b border-border-subtle/50 pb-1.5">
                      Recommended Software Engines
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {generatedBlueprint.products.software.map(soft => (
                        <span key={soft} className="text-[10px] font-bold bg-bg-card border border-border-subtle px-2 py-0.5 rounded text-text-primary">
                          {soft}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      These core IAM platforms, gateways, directory trees, or sidecar policy providers offer the best out-of-the-box support for your specific architecture.
                    </p>
                  </div>

                </div>
              )}

              {/* TAB 4: ACCESS POLICY CODE */}
              {activeTab === 'policy' && (
                <div className="space-y-4 animate-fadeIn">
                  <span className="text-[10px] font-bold text-text-muted uppercase block font-mono">
                    {useCase === 'workforce' ? 'Open Policy Agent (Rego) Policy Script' : 'AWS IAM JSON Policy Template'}
                  </span>
                  <pre className="text-xs font-mono bg-bg-base border border-border-subtle p-5 rounded-xl text-text-primary overflow-x-auto select-all leading-relaxed shadow-inner max-h-72">
                    {generatedBlueprint.policyCode}
                  </pre>
                </div>
              )}

            </div>

            {/* Console summary footer */}
            <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-[11px] text-text-primary overflow-y-auto mt-4 leading-normal flex items-start gap-2.5">
              <Terminal className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-text-primary block mb-0.5 uppercase tracking-wider text-[10px]">Architect Compiler Verdict:</span>
                Your setup requires <strong className="font-bold text-accent-primary">{generatedBlueprint.products.protocols[0]}</strong> as the base federation layer. We recommend backing your setup with <strong className="font-bold text-accent-secondary">{generatedBlueprint.products.software[0]}</strong> to satisfy <strong className="font-bold text-status-success">{compliance.toUpperCase()}</strong> compliance mandates.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
