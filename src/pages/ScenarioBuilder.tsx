import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Network, ArrowRight, ShieldCheck, RefreshCw, Clipboard, Check, 
  Laptop, Database, Users, Lock, ShieldAlert, Cpu, 
  Globe, ArrowLeft, Award, FileText, ChevronRight, Zap, Code, Printer, 
  Eye, Sparkles, Building2, Landmark, Heart, ShoppingCart, 
  GraduationCap, KeySquare, Layers, Fingerprint, Terminal
} from 'lucide-react'

// Organization Types
type OrgType = 'startup' | 'enterprise' | 'government' | 'healthcare' | 'banking' | 'retail' | 'education'
type UserScale = 'micro' | 'small' | 'medium' | 'large' | 'massive'
type CloudModel = 'cloud' | 'hybrid' | 'onprem'

interface ScenarioInputs {
  orgType: OrgType
  userScale: UserScale
  cloudModel: CloudModel
  hasWorkforce: boolean
  hasCustomer: boolean
  hasPartner: boolean
  hasInternalApis: boolean
  hasExternalApis: boolean
  requireMfa: boolean
  requirePasswordless: boolean
  hasLegacyApps: boolean
}

export default function ScenarioBuilder() {
  // Navigation / Stepper State
  const [activeStep, setActiveStep] = useState<number>(0)
  const [showResults, setShowResults] = useState<boolean>(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [activeCodeTab, setActiveCodeTab] = useState<'rego' | 'aws' | 'terraform' | 'scim'>('rego')
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  // Questionnaire State
  const [inputs, setInputs] = useState<ScenarioInputs>({
    orgType: 'startup',
    userScale: 'small',
    cloudModel: 'cloud',
    hasWorkforce: true,
    hasCustomer: false,
    hasPartner: false,
    hasInternalApis: true,
    hasExternalApis: false,
    requireMfa: true,
    requirePasswordless: false,
    hasLegacyApps: false
  })

  // Set Default Preconfigurations based on Organization Type
  const handleOrgSelection = (org: OrgType) => {
    let scale: UserScale = 'small'
    let cloud: CloudModel = 'cloud'
    const wf = true
    let cust = false
    let partner = false
    const intApis = true
    let extApis = false
    let mfa = true
    let passkey = false
    let legacy = false

    if (org === 'enterprise') {
      scale = 'large'
      cloud = 'hybrid'
      partner = true
      legacy = true
    } else if (org === 'government') {
      scale = 'medium'
      cloud = 'onprem'
      mfa = true
      passkey = true
      legacy = true
    } else if (org === 'healthcare') {
      scale = 'medium'
      cloud = 'hybrid'
      mfa = true
      legacy = true
    } else if (org === 'banking') {
      scale = 'large'
      cloud = 'hybrid'
      mfa = true
      passkey = true
    } else if (org === 'retail') {
      scale = 'massive'
      cust = true
      extApis = true
    } else if (org === 'education') {
      scale = 'medium'
      cloud = 'hybrid'
      cust = true
    }

    setInputs({
      orgType: org,
      userScale: scale,
      cloudModel: cloud,
      hasWorkforce: wf,
      hasCustomer: cust,
      hasPartner: partner,
      hasInternalApis: intApis,
      hasExternalApis: extApis,
      requireMfa: mfa,
      requirePasswordless: passkey,
      hasLegacyApps: legacy
    })
  }

  // Toggle checklist item
  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Reset Scenario Builder
  const handleReset = () => {
    setActiveStep(0)
    setShowResults(false)
    setCheckedItems({})
    setInputs({
      orgType: 'startup',
      userScale: 'small',
      cloudModel: 'cloud',
      hasWorkforce: true,
      hasCustomer: false,
      hasPartner: false,
      hasInternalApis: true,
      hasExternalApis: false,
      requireMfa: true,
      requirePasswordless: false,
      hasLegacyApps: false
    })
  }

  // Copy code utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Dynamic Recommendation Engine
  const recommendations = useMemo(() => {
    const { orgType, userScale, cloudModel, requireMfa, requirePasswordless, hasLegacyApps, hasCustomer, hasPartner, hasExternalApis } = inputs

    // 1. Core Recommended Standards & RFCs
    const rfcs = [
      { num: 'RFC 6749', name: 'The OAuth 2.0 Authorization Framework', usage: 'Securing web, mobile, and API-driven authentication boundaries.' },
      { num: 'RFC 7519', name: 'JSON Web Token (JWT)', usage: 'Self-contained, cryptographically signed token transmission.' },
    ]
    if (requireMfa && requirePasswordless) {
      rfcs.push({ num: 'FIDO2 / WebAuthn', name: 'W3C Web Authentication Standard', usage: 'Phishing-resistant passwordless hardware biometrics.' })
    }
    if (orgType === 'government') {
      rfcs.push({ num: 'NIST SP 800-63-3', name: 'Digital Identity Guidelines', usage: 'AAL3 and IAL2 authentication and enrollment verification.' })
      rfcs.push({ num: 'FIPS 201-3', name: 'Personal Identity Verification (PIV)', usage: 'Hardware-bound smart card cryptographic handshakes.' })
    }
    if (hasCustomer || userScale === 'massive' || orgType === 'enterprise') {
      rfcs.push({ num: 'RFC 7643/7644', name: 'SCIM 2.0 Protocol & Schema', usage: 'Automating continuous cross-domain directory user synchronization.' })
    }
    if (hasLegacyApps) {
      rfcs.push({ num: 'Kerberos / LDAP', name: 'Standard Directory Access Protocols', usage: 'Securing legacy local network machine authentication.' })
    }
    if (hasPartner) {
      rfcs.push({ num: 'SAML 2.0 Core', name: 'Security Assertion Markup Language', usage: 'Federating corporate SSO across distinct partner trust borders.' })
    }
    if (cloudModel === 'hybrid' || cloudModel === 'onprem') {
      rfcs.push({ num: 'NIST SP 800-207', name: 'Zero Trust Architecture Guidelines', usage: 'Policy Decision and Enforcement Point (PDP/PEP) micro-segmentation.' })
    }

    // 2. Tech Stack recommendations
    const techStack = {
      idp: 'Standard Cloud-Native IdP (OIDC-based)',
      pdp: 'Role-Based Local RBAC Engine',
      pep: 'API Gateway Ingress (Envoy/NGINX)',
      compliance: 'SOC 2 Type II Baseline Controls'
    }

    if (orgType === 'startup') {
      techStack.idp = 'SaaS Auth Provider (e.g., Clerk, Auth0, Keycloak)'
      techStack.pdp = 'Basic Router-level Middleware'
      techStack.pep = 'Lightweight Gateway (e.g., Supabase Gateway, Kong)'
      techStack.compliance = 'SOC 2 Type II & GDPR'
    } else if (orgType === 'enterprise') {
      techStack.idp = 'Enterprise Workforce IdP (Microsoft Entra ID + Okta Federation)'
      techStack.pdp = 'Open Policy Agent (OPA) / Rego Authorization'
      techStack.pep = 'Cloud Service Mesh (Istio / Envoy Sidecars)'
      techStack.compliance = 'ISO 27001, SOC 2 Type II, and GDPR'
    } else if (orgType === 'government') {
      techStack.idp = 'Federal Gov Identity Directory (PIV/CAC Smartcards + Login.gov)'
      techStack.pdp = 'Federal GRC Rules (FIPS 140-3 signed policies)'
      techStack.pep = 'Hardened Air-Gapped Reverse Proxies'
      techStack.compliance = 'FedRAMP High Baseline & NIST SP 800-53'
    } else if (orgType === 'healthcare') {
      techStack.idp = 'Patient CIAM Hub + EHR System (SMART on FHIR-compatible)'
      techStack.pdp = 'Break-Glass Gated Policy Override Controller'
      techStack.pep = 'Standard FHIR API Gateway'
      techStack.compliance = 'HIPAA Privacy & Security Rules, HL7 Compliance'
    } else if (orgType === 'banking') {
      techStack.idp = 'Hardened Financial IdP (Hardware HSM backed + FIDO2 Passkeys)'
      techStack.pdp = 'Dual-Control "Maker-Checker" Approval Logic'
      techStack.pep = 'P2PE Segmented Financial API Ingress'
      techStack.compliance = 'PCI-DSS Level 1 & PSD2 Strong Customer Authentication (SCA)'
    } else if (orgType === 'retail') {
      techStack.idp = 'Omnichannel CIAM Hub + POS VLAN Badging IdP'
      techStack.pdp = 'Contextual Network/IP Risk Evaluator'
      techStack.pep = 'Tokenizing Payment Gateway'
      techStack.compliance = 'PCI-DSS Compliance'
    } else if (orgType === 'education') {
      techStack.idp = 'Academic Federation Hub (Shibboleth / EduGAIN)'
      techStack.pdp = 'Group/Roster Attribute Scoped Controller'
      techStack.pep = 'Standard Reverse Proxy'
      techStack.compliance = 'FERPA Requirements'
    }

    // 3. Dynamic Threat Models
    const threats = [
      { id: 't1', title: 'Brute-Force & Credential Stuffing', risk: 'High', desc: 'Attackers attempt to log in using massive databases of leaked credentials.', mitigation: requirePasswordless ? 'Mitigated: Phishing-resistant FIDO2 Passkeys completely eliminate static passwords.' : 'Mitigation: Enforce mandatory MFA, rate-limiting at API Gateway, and context-aware risk blocks.' }
    ]
    if (hasExternalApis) {
      threats.push({ id: 't2', title: 'API Key Exposure / Token Leakage', risk: 'High', desc: 'Developers hardcode credentials or credentials leak via public code repositories.', mitigation: 'Mitigation: Transition static API keys to scoped, short-lived OAuth 2.0 Access Tokens using PKCE.' })
    }
    if (orgType === 'banking') {
      threats.push({ id: 't3', title: 'Man-In-The-Browser Transaction Forgery', risk: 'Critical', desc: 'Malware modifies transactions (payee/amount) during transit in the browser.', mitigation: 'Mitigation: Enforce PSD2 Dynamic Linking, binding WebAuthn signatures directly to payee and transaction value.' })
    }
    if (orgType === 'healthcare') {
      threats.push({ id: 't4', title: 'Celebrity Chart Snooping (HIPAA Breach)', risk: 'Critical', desc: 'Employees read clinical files of high-profile patients without active treatment relationships.', mitigation: 'Mitigation: Segment directories with role-scoping and implement hard alerts for break-glass emergency overrides.' })
    }
    if (orgType === 'retail') {
      threats.push({ id: 't5', title: 'POS Terminal Memory Scraping (Card Theft)', risk: 'High', desc: 'RAM-scrapers on the POS machine harvest raw card numbers in memory before encryption.', mitigation: 'Mitigation: Deploy Point-to-Point Encryption (P2PE) so that card read-heads encrypt data at first capture.' })
    }
    if (hasLegacyApps) {
      threats.push({ id: 't6', title: 'Legacy Protocol Relay (Kerberos/NTLM Exploits)', risk: 'Medium', desc: 'Attackers capture old NTLM hashes or hijack tickets to move laterally.', mitigation: 'Mitigation: Deploy secure identity proxies (such as OAuth bridges) so legacy backends are isolated from general Wi-Fi.' })
    }

    // 4. Dynamic Checklists
    const implChecklist = [
      { id: 'i1', task: 'Register applications in the central Identity Provider (IdP).' },
      { id: 'i2', task: 'Expose all internal endpoints exclusively behind the API Ingress Gateway.' }
    ]
    if (requireMfa) {
      implChecklist.push({ id: 'i3', task: 'Configure MFA policies: select authenticators (prefer context-aware push or FIDO2).' })
    }
    if (requirePasswordless) {
      implChecklist.push({ id: 'i4', task: 'Initialize WebAuthn credentials, configuring user registration and biometric verification endpoints.' })
    }
    if (hasLegacyApps) {
      implChecklist.push({ id: 'i5', task: 'Provision local identity tunnels/proxies to bridge LDAP/Kerberos apps to the OIDC IdP.' })
    }

    const secChecklist = [
      { id: 's1', task: 'Enforce a strict Content-Security-Policy (CSP) on the front-end to block script injections.' },
      { id: 's2', task: 'Restrict OAuth Redirection Whitelists to exact-match URLs only (no wildcards).' }
    ]
    if (orgType === 'banking' || orgType === 'retail') {
      secChecklist.push({ id: 's3', task: 'Validate cardholder environment isolation boundaries (PCI-DSS VLAN audits).' })
    }
    if (orgType === 'government') {
      secChecklist.push({ id: 's4', task: 'Implement air-gapped cryptographic boundary signing for smartcard PIN logons.' })
    }

    const opsChecklist = [
      { id: 'o1', task: 'Establish append-only centralized security log shipping (SIEM/SOC integration).' },
      { id: 'o2', task: 'Run scheduled automated directory scans to identify inactive orphaned accounts.' }
    ]

    return { rfcs, techStack, threats, implChecklist, secChecklist, opsChecklist }
  }, [inputs])

  // Mock "AI Code Generator" Output based on choices
  const generatedCode = useMemo(() => {
    const { orgType, requireMfa } = inputs

    const rego = `# Open Policy Agent (OPA) - Rego Policy for ${orgType.toUpperCase()}
package authz

default allow = false

# Allow access if the user has correct roles and meets safety bounds
allow {
    user_has_required_role
    device_is_compliant
    mfa_condition_met
}

user_has_required_role {
    input.user.groups[_] == "security-admins"
}
user_has_required_role {
    input.user.groups[_] == "engineers"
    input.action == "read"
}

device_is_compliant {
    input.device.is_managed == true
    input.device.firewall_active == true
}

mfa_condition_met {
    ${requireMfa ? 'input.auth.mfa_verified == true' : 'input.auth.method == "password"'}
}
`

    const aws = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnforceMfaAndDeviceBoundsFor${orgType.toUpperCase()}",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::corporate-ledger-vault/*"
      ],
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "${requireMfa ? 'true' : 'false'}"
        },
        "StringEquals": {
          "aws:PrincipalOrgID": "o-companyorg100"
        }
      }
    }
  ]
}`

    const terraform = `# Terraform Module: Hardened Identity Vault Setup
module "identity_vault" {
  source  = "hashicorp/vault/aws"
  version = "2.4.0"

  vault_cluster_name = "${inputs.orgType}-sec-vault"
  cloud_environment  = "aws"

  # Enforce FIPS 140-3 cryptography and security policies
  compliance_tier = "${inputs.orgType === 'government' ? 'fedramp-high' : inputs.orgType === 'banking' ? 'pci-dss' : 'soc2'}"
  mfa_required    = ${inputs.requireMfa ? 'true' : 'false'}
  passwordless    = ${inputs.requirePasswordless ? 'true' : 'false'}

  tags = {
    Environment = "production"
    Architect   = "AboutIAM_Scenario_Builder"
  }
}
`

    const scim = `{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "2819c223-7f76-453a-919d-413861904646",
  "externalId": "usr_${inputs.orgType}_0092",
  "userName": "alice.security",
  "name": {
    "familyName": "Architect",
    "givenName": "Alice"
  },
  "emails": [
    {
      "value": "alice@${inputs.orgType === 'startup' ? 'getstartup.io' : 'enterprise-corp.com'}",
      "type": "work",
      "primary": true
    }
  ],
  "groups": [
    {
      "value": "e9e30ced-c4a1-43e8-8a30-22c6a084c8a2",
      "display": "Security Operators"
    }
  ],
  "active": true
}`

    return { rego, aws, terraform, scim }
  }, [inputs])

  const currentCodeSnippet = useMemo(() => {
    if (activeCodeTab === 'rego') return generatedCode.rego
    if (activeCodeTab === 'aws') return generatedCode.aws
    if (activeCodeTab === 'terraform') return generatedCode.terraform
    return generatedCode.scim
  }, [activeCodeTab, generatedCode])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      
      {/* Dynamic Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Network className="text-accent-primary w-7 h-7 animate-pulse shrink-0" />
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              Identity Scenario Builder <span className="text-[10px] bg-accent-glow text-accent-primary px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">Beta</span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Define your custom corporate footprint and receive an instant vendor-neutral secure architecture design blueprint.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs bg-bg-nested hover:bg-border-subtle px-3 py-2 rounded-lg text-text-secondary flex items-center gap-1.5 transition shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {!showResults ? (
          
          /* ================= QUESTIONNAIRE ENGINE ================= */
          <div className="max-w-3xl mx-auto bg-bg-card border border-border-subtle rounded-2xl p-6 md:p-8 shadow-xl">
            
            {/* Steps Progress Indicator */}
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-5 mb-6">
              {[
                { title: 'Org Type', icon: Building2 },
                { title: 'Footprint & Scale', icon: Layers },
                { title: 'Security Controls', icon: Lock }
              ].map((step, idx) => {
                const Icon = step.icon
                const isCompleted = activeStep > idx
                const isActive = activeStep === idx
                return (
                  <div key={idx} className="flex-1 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${isCompleted ? 'bg-status-success text-white' : isActive ? 'bg-accent-primary text-white shadow shadow-accent-primary/25' : 'bg-bg-nested/60 text-text-muted border border-border-subtle'}`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-bold hidden sm:inline ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>{step.title}</span>
                    </div>
                    {idx < 2 && <div className={`flex-1 h-0.5 mx-4 hidden sm:block ${activeStep > idx ? 'bg-status-success' : 'bg-border-subtle/50'}`} />}
                  </div>
                )
              })}
            </div>

            {/* STEP 1: ORGANIZATION TYPE */}
            {activeStep === 0 && (
              <div className="space-y-5 animate-scaleUp">
                <div>
                  <h2 className="text-base font-black text-text-primary">What is your Organization Type?</h2>
                  <p className="text-xs text-text-secondary mt-1">Selecting an organization pre-configures recommended standard defaults suited for your sector.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'startup', label: 'Startup / SME', desc: 'High-growth, SaaS-native model, minimizing hosting & operational cost.', icon: Zap },
                    { id: 'enterprise', label: 'Global Enterprise', desc: 'Rigorous governance, hybrid/on-prem legacy integration, complex directories.', icon: Building2 },
                    { id: 'government', label: 'Government / Public Sector', desc: 'Hardware smartcards (PIV/CAC), FedRAMP High, strict air-gapped zones.', icon: Landmark },
                    { id: 'healthcare', label: 'Healthcare & Clinical', desc: 'HIPAA guidelines, SMART on FHIR, strict EHR role-segregation.', icon: Heart },
                    { id: 'banking', label: 'Banking & Financial Services', desc: 'Ultra-secure PSD2, transaction linking, cardholder (CDE) segmentation.', icon: KeySquare },
                    { id: 'retail', label: 'Omnichannel Retail / Commerce', desc: 'Omnichannel customer directories, POS register VLAN isolation.', icon: ShoppingCart },
                    { id: 'education', label: 'Higher Education / Schools', desc: 'Low cost, massive student lifecycles, global academic federation.', icon: GraduationCap }
                  ].map((org) => {
                    const Icon = org.icon
                    const isSelected = inputs.orgType === org.id
                    return (
                      <button
                        key={org.id}
                        onClick={() => handleOrgSelection(org.id as OrgType)}
                        className={`p-4 rounded-xl border text-left transition flex gap-3 cursor-pointer items-start ${isSelected ? 'bg-accent-glow border-accent-primary shadow-md shadow-accent-primary/5' : 'bg-bg-nested/40 border-border-subtle hover:border-border-subtle hover:bg-bg-nested/70'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-secondary'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-text-primary block">{org.label}</span>
                          <span className="text-[11px] text-text-secondary leading-snug block mt-0.5">{org.desc}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: USER DIRECTORIES & SCALE */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-scaleUp">
                <div>
                  <h2 className="text-base font-black text-text-primary">Configure Scale & Identity Directories</h2>
                  <p className="text-xs text-text-secondary mt-1">Map out the scale of your directory database and which active identities need to connect.</p>
                </div>

                {/* Scale Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Estimated Total User Scale</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'micro', label: '< 1,000', desc: 'Micro Scale' },
                      { id: 'small', label: '1k - 10k', desc: 'Small' },
                      { id: 'medium', label: '10k - 100k', desc: 'Medium' },
                      { id: 'large', label: '100k - 1M', desc: 'Large Enterprise' },
                      { id: 'massive', label: '1M - 10M+', desc: 'Hyper Scale' }
                    ].map((scale) => (
                      <button
                        key={scale.id}
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, userScale: scale.id as UserScale }))}
                        className={`p-2.5 rounded-lg border text-center cursor-pointer transition ${inputs.userScale === scale.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/30 border-border-subtle text-text-secondary hover:border-border-subtle hover:bg-bg-nested/60'}`}
                      >
                        <span className="text-xs block">{scale.label}</span>
                        <span className="text-[9px] text-text-muted block mt-0.5">{scale.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cloud Model */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Infrastructure Deployment Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'cloud', label: 'Pure Cloud-Native', desc: '100% Hosted SaaS / PaaS' },
                      { id: 'hybrid', label: 'Hybrid Cloud Network', desc: 'Cloud synced with On-Prem' },
                      { id: 'onprem', label: 'Air-Gapped / Private Cloud', desc: 'Strict local hosted boundaries' }
                    ].map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, cloudModel: model.id as CloudModel }))}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition ${inputs.cloudModel === model.id ? 'bg-accent-glow border-accent-primary' : 'bg-bg-nested/30 border-border-subtle text-text-secondary hover:border-border-subtle hover:bg-bg-nested/60'}`}
                      >
                        <span className="text-xs font-bold text-text-primary block">{model.label}</span>
                        <span className="text-[10px] text-text-secondary block mt-0.5">{model.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Directories Checkbox List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Target Identity Portals & Interfaces</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'hasWorkforce', label: 'Employee / Workforce IAM', desc: 'SSO and secure directories for internal staff.', checked: inputs.hasWorkforce },
                      { id: 'hasCustomer', label: 'Customer Identity (CIAM)', desc: 'Self-registration, social login, and customer profile storage.', checked: inputs.hasCustomer },
                      { id: 'hasPartner', label: 'B2B Partner Identity Portal', desc: 'SSO Federation/SAML trust for partner corporate directories.', checked: inputs.hasPartner },
                      { id: 'hasInternalApis', label: 'Internal Services & M2M APIs', desc: 'Secure machine-to-machine, microservice, or server-to-server APIs.', checked: inputs.hasInternalApis },
                      { id: 'hasExternalApis', label: 'External Public Developer APIs', desc: 'Third-party developer OAuth 2.0 access endpoints.', checked: inputs.hasExternalApis }
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, [dir.id]: !prev[dir.id as keyof ScenarioInputs] }))}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-3 ${dir.checked ? 'bg-accent-glow/50 border-accent-secondary shadow-sm' : 'bg-bg-nested/40 border-border-subtle'}`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 ${dir.checked ? 'bg-accent-secondary border-accent-secondary text-white' : 'border-border-subtle bg-bg-card'}`}>
                          {dir.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-text-primary block">{dir.label}</span>
                          <span className="text-[11px] text-text-secondary leading-snug block mt-0.5">{dir.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SECURITY POSTURE */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-scaleUp">
                <div>
                  <h2 className="text-base font-black text-text-primary">Incorporate Advanced Security Controls</h2>
                  <p className="text-xs text-text-secondary mt-1">Determine authentication boundaries and enforce strict operational compliance.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'requireMfa', label: 'Enforce Mandatory Multi-Factor Authentication (MFA)', desc: 'Blocks static credential stuffing attacks. Required for regulatory SOC2/HIPAA compliance.', checked: inputs.requireMfa, icon: ShieldCheck },
                    { id: 'requirePasswordless', label: 'Mandate Passwordless Authentication (FIDO2 / Passkeys)', desc: 'Replaces static user credentials entirely with browser-attested, non-phishable hardware biometrics.', checked: inputs.requirePasswordless, icon: Fingerprint },
                    { id: 'hasLegacyApps', label: 'Bridges to Local Legacy Applications (LDAP / Kerberos)', desc: 'Indicate if on-premises legacy network services or traditional AD domain directories must remain active.', checked: inputs.hasLegacyApps, icon: Database }
                  ].map((ctrl) => {
                    const Icon = ctrl.icon
                    return (
                      <button
                        key={ctrl.id}
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, [ctrl.id]: !prev[ctrl.id as keyof ScenarioInputs] }))}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition flex items-start gap-4 ${ctrl.checked ? 'bg-accent-glow border-accent-primary shadow-sm' : 'bg-bg-nested/40 border-border-subtle'}`}
                      >
                        <div className={`p-2 rounded-lg ${ctrl.checked ? 'bg-accent-primary text-white animate-pulse-slow' : 'bg-bg-nested text-text-secondary'}`}>
                          <Icon className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-primary">{ctrl.label}</span>
                            <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center shrink-0 ${ctrl.checked ? 'bg-accent-primary' : 'bg-border-subtle'}`}>
                              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute ${ctrl.checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                          </div>
                          <span className="text-[11px] text-text-secondary leading-relaxed block mt-1">{ctrl.desc}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Form Actions footer */}
            <div className="border-t border-border-subtle/50 pt-5 mt-8 flex items-center justify-between">
              {activeStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary bg-bg-nested hover:bg-border-subtle border border-border-subtle rounded-lg cursor-pointer flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary bg-bg-nested hover:bg-border-subtle border border-border-subtle rounded-lg cursor-pointer transition"
                >
                  Reset Form
                </button>
              )}

              {activeStep < 2 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="px-5 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-hover rounded-lg cursor-pointer flex items-center gap-1.5 transition shadow"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResults(true)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-accent-secondary hover:bg-accent-hover rounded-lg cursor-pointer flex items-center gap-2 transition shadow-lg shadow-accent-secondary/25"
                >
                  <Sparkles className="w-4 h-4 text-white fill-current animate-pulse" /> Generate Architecture Blueprint
                </button>
              )}
            </div>

          </div>
        ) : (
          
          /* ================= ARCHITECTURE BLUEPRINT RESULTS ================= */
          <div className="space-y-6 animate-scaleUp">
            
            {/* Header summary widget */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-accent-secondary font-bold font-mono uppercase tracking-wider block">Generated Architecture Blueprint</span>
                <h2 className="text-lg font-black text-text-primary flex items-center gap-1.5 mt-0.5">
                  Secure Identity Footprint for {inputs.orgType.charAt(0).toUpperCase() + inputs.orgType.slice(1)}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[11px] text-text-secondary font-mono">
                  <span>🚀 Scale: <strong className="text-text-primary uppercase">{inputs.userScale}</strong></span>
                  <span>🔒 Deploy: <strong className="text-text-primary uppercase">{inputs.cloudModel}</strong></span>
                  <span>🛡️ Compliance: <strong className="text-accent-primary font-bold uppercase">{recommendations.techStack.compliance.split(' & ')[0]}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 text-xs bg-bg-nested hover:bg-border-subtle border border-border-subtle text-text-secondary hover:text-text-primary font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Design
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Builder
                </button>
              </div>
            </div>

            {/* MAIN ARCHITECTURE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Dynamic Architecture Diagram / Flow Map */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider mb-1">Visual Reference Architecture Mapping</h3>
                    <p className="text-[11px] text-text-muted mb-4">Recommended trust boundaries and network segments based on your specified settings.</p>
                  </div>

                  {/* HIGH-TECH OPERATIONAL SIMULATOR MAP CONTAINER */}
                  <div className="border border-slate-800 bg-[#090e1a] rounded-xl p-6 relative min-h-[350px] flex items-center justify-center select-none overflow-x-auto shadow-inner overflow-y-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none rounded-xl"></div>
                    
                    <div className="grid grid-cols-3 gap-y-10 gap-x-12 items-center justify-center min-w-[500px] relative z-10">
                      
                      {/* Row 1: Users, PEP Gateway, Target Apps */}
                      <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 text-blue-400 text-center flex flex-col items-center gap-1 min-w-[125px]">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] font-bold block">Staff/Customer Ingress</span>
                      </div>

                      <div className="flex flex-col items-center justify-center relative">
                        <div className="w-full h-0.5 bg-slate-800"></div>
                        <ChevronRight className="w-4 h-4 text-slate-500 absolute -top-2" />
                      </div>

                      <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-950/20 text-teal-400 text-center flex flex-col items-center gap-1 min-w-[125px]">
                        <ShieldCheck className="w-5 h-5 text-teal-400 animate-pulse-slow" />
                        <span className="text-[10px] font-bold block">PEP API Gateway</span>
                      </div>

                      {/* Connection cables */}
                      <div className="h-8 border-l border-dashed border-slate-800 mx-auto"></div>
                      <div className="h-8"></div>
                      <div className="h-8 border-l border-dashed border-slate-800 mx-auto"></div>

                      {/* Row 2: MDM health, Directory IdP, Central PDP Policy */}
                      <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-center flex flex-col items-center gap-1 min-w-[125px]">
                        <Laptop className="w-5 h-5 text-slate-500" />
                        <span className="text-[10px] font-bold block">{inputs.requirePasswordless ? 'Hardware Biometrics' : 'MFA Authenticator'}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center relative">
                        <div className="w-full h-0.5 bg-slate-800"></div>
                        <ChevronRight className="w-4 h-4 text-slate-500 absolute -top-2" />
                      </div>

                      <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-950/20 text-teal-400 text-center flex flex-col items-center gap-1 min-w-[125px]">
                        <Cpu className="w-5 h-5 text-teal-400" />
                        <span className="text-[10px] font-bold block">{recommendations.techStack.pdp.split(' ')[0]} Policy Engine</span>
                      </div>

                      {/* Connection cables 2 */}
                      <div className="h-8 border-l border-dashed border-slate-800 mx-auto"></div>
                      <div className="h-8"></div>
                      <div className="h-8 border-l border-dashed border-slate-800 mx-auto"></div>

                      {/* Row 3: IdP Service, Secure backend target */}
                      <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 text-blue-400 text-center flex flex-col items-center gap-1 min-w-[125px]">
                        <KeySquare className="w-5 h-5 text-blue-400 animate-pulse-slow" />
                        <span className="text-[10px] font-bold block">OIDC Identity Provider</span>
                      </div>

                      <div className="flex flex-col items-center justify-center relative">
                        <div className="w-full h-0.5 bg-slate-800"></div>
                        <ChevronRight className="w-4 h-4 text-slate-500 absolute -top-2" />
                      </div>

                      <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-center flex flex-col items-center gap-1 min-w-[125px]">
                        <Database className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-bold block">Segmented Vault / DB</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* ARCHITECT SPEC DETAILS CORES */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-5">
                  <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider border-b border-border-subtle/50 pb-2">Technical Flow & Architecture Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-accent-primary" /> Authentication Flow (Workforce & Users)
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {inputs.requirePasswordless 
                          ? 'Passwordless WebAuthn / Passkeys are enforced at enrollment. Biometric challenges are negotiated with local TPM secure enclaves, validating hardware bindings on every authentication cycle.' 
                          : 'Standard OIDC token transaction supported. Leverages custom directory security with context-matching MFA requirements (TOTP / push notifications) mapped against directory security templates.'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-accent-secondary" /> Authorization Model
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {inputs.orgType === 'startup' 
                          ? 'Simple Role-Based Access Control (RBAC). Standard resource routes are mapped against user group claims (e.g. admin, reader) bundled within cryptographic JSON Web Tokens.' 
                          : 'Fine-Grained Attribute-Based Access Control (ABAC) managed dynamically. Utilizes decoupled policy-as-code evaluations (using OPA / Rego) matching user roles, network segments, and device posture telemetry.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-border-subtle/30 pt-3 md:border-t-0 md:pt-0">
                      <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-status-success" /> Provisioning Flow & Lifecycle
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {inputs.userScale === 'micro' || inputs.userScale === 'small' 
                          ? 'Just-In-Time (JIT) provisioning. Accounts are automatically provisioned inside the target databases upon their first federated single-sign-on assertion.' 
                          : 'Automated Directory Sync utilizing the SCIM 2.0 (RFC 7644) standard. Employee lifecycles (Joiner-Mover-Leaver) are triggered in real-time from HR systems, instantly syncing user states across systems.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-border-subtle/30 pt-3 md:border-t-0 md:pt-0">
                      <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-accent-primary" /> Federation & Trust Boundaries
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {inputs.hasPartner 
                          ? 'Enforces SAML 2.0 / OIDC corporate federation with strict redirect whitelists. Trust scopes are compartmentalized per partner organization, verifying XML cryptographic seals prior to token ingestion.' 
                          : 'Self-contained OpenID Connect identity provider boundary. Third-party directories federated via secure OAuth client authorizations, verifying token signatures using public cached JWKS keys.'}
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: RECS, COMPLIANCE, VENDORS */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* TECHNICAL RECOMMENDATION ENGINE */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                    <Award className="w-4 h-4 text-accent-primary" /> Vendor-Neutral Stack Recs
                  </h3>
                  
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Identity Authority (IdP)</span>
                      <p className="text-xs text-text-secondary font-mono mt-0.5">{recommendations.techStack.idp}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Policy Decision Point (PDP)</span>
                      <p className="text-xs text-text-secondary font-mono mt-0.5">{recommendations.techStack.pdp}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Policy Enforcement Point (PEP)</span>
                      <p className="text-xs text-text-secondary font-mono mt-0.5">{recommendations.techStack.pep}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Standard Compliance Targets</span>
                      <p className="text-xs text-text-primary font-bold font-mono mt-0.5">{recommendations.techStack.compliance}</p>
                    </div>
                  </div>
                </div>

                {/* STANDARDS & RFCS */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                    <FileText className="w-4 h-4 text-accent-secondary" /> Recommended Standards
                  </h3>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {recommendations.rfcs.map((rfc, idx) => (
                      <div key={idx} className="border border-border-subtle/60 p-2.5 rounded-lg bg-bg-nested/35">
                        <span className="text-[10px] text-accent-secondary font-bold font-mono uppercase tracking-wider block">{rfc.num}</span>
                        <span className="text-xs font-black text-text-primary block mt-0.5 leading-snug">{rfc.name}</span>
                        <span className="text-[11px] text-text-secondary block mt-1 leading-snug">{rfc.usage}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* THREAT MODEL & TRUST BOUNDARIES */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                <ShieldAlert className="w-4 h-4 text-status-danger animate-pulse-slow" /> Trust Boundaries & Threat Model Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.threats.map((threat) => (
                  <div key={threat.id} className="border border-status-danger/20 bg-status-danger/5 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary leading-tight">{threat.title}</span>
                        <span className="text-[9px] bg-status-danger/10 text-status-danger px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono shrink-0">
                          {threat.risk} Risk
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1.5 leading-snug">{threat.desc}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-status-danger/10 text-[11px] text-status-success font-bold font-mono">
                      {threat.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHECKLISTS GENERATOR ENGINE */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-5">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-subtle/50 pb-2">
                <Clipboard className="w-4 h-4 text-accent-primary" /> Generated Implementation & Audit Checklists
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Implementation */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-accent-primary flex items-center gap-1.5 border-b border-accent-primary/10 pb-1.5">
                    <Check className="w-4 h-4 text-accent-primary shrink-0" /> Implementation Checklist
                  </h4>
                  <div className="space-y-2">
                    {recommendations.implChecklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-nested/60 transition cursor-pointer text-[11px] text-text-secondary leading-snug"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checkedItems[item.id] ? 'bg-accent-primary border-accent-primary text-white' : 'border-border-subtle bg-bg-card'}`}>
                          {checkedItems[item.id] && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={checkedItems[item.id] ? 'line-through text-text-muted font-normal' : 'font-bold'}>{item.task}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-accent-secondary flex items-center gap-1.5 border-b border-accent-secondary/10 pb-1.5">
                    <Lock className="w-4 h-4 text-accent-secondary shrink-0" /> Hardened Security Checklist
                  </h4>
                  <div className="space-y-2">
                    {recommendations.secChecklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-nested/60 transition cursor-pointer text-[11px] text-text-secondary leading-snug"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checkedItems[item.id] ? 'bg-accent-secondary border-accent-secondary text-white' : 'border-border-subtle bg-bg-card'}`}>
                          {checkedItems[item.id] && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={checkedItems[item.id] ? 'line-through text-text-muted font-normal' : 'font-bold'}>{item.task}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-status-success flex items-center gap-1.5 border-b border-status-success/10 pb-1.5">
                    <Eye className="w-4 h-4 text-status-success shrink-0" /> Continuous Audit / Ops
                  </h4>
                  <div className="space-y-2">
                    {recommendations.opsChecklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-nested/60 transition cursor-pointer text-[11px] text-text-secondary leading-snug"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checkedItems[item.id] ? 'bg-status-success border-status-success text-white' : 'border-border-subtle bg-bg-card'}`}>
                          {checkedItems[item.id] && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={checkedItems[item.id] ? 'line-through text-text-muted font-normal' : 'font-bold'}>{item.task}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* DRAFT AI CODE GENERATOR FORETASTE (FANCY STUFF) */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle/50 pb-3 gap-3">
                <div>
                  <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-accent-primary" /> AI Architect - Auto-Generated Security Policies
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Click any tab below to inspect the code templates generated dynamically based on your requirements.</p>
                </div>
                <div className="flex bg-bg-nested/80 p-1 rounded-lg border border-border-subtle/40 self-start sm:self-auto">
                  {[
                    { id: 'rego', label: 'OPA (Rego)' },
                    { id: 'aws', label: 'AWS IAM JSON' },
                    { id: 'terraform', label: 'Terraform Vault' },
                    { id: 'scim', label: 'SCIM 2.0 JSON' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCodeTab(tab.id as 'rego' | 'aws' | 'terraform' | 'scim')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${activeCodeTab === tab.id ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Snip block with terminal wrapper */}
              <div className="border border-slate-800 rounded-xl overflow-hidden shadow-xl bg-slate-950">
                <div className="flex items-center justify-between bg-[#0b0f19] px-4 py-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Terminal className="w-3.5 h-3.5 text-accent-primary" /> policy_spec.{activeCodeTab === 'rego' ? 'rego' : activeCodeTab === 'aws' ? 'json' : activeCodeTab === 'terraform' ? 'tf' : 'json'}
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentCodeSnippet)}
                    className="text-[10px] bg-slate-900/60 hover:bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800 transition cursor-pointer flex items-center gap-1 focus:outline-none"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-status-success" /> : <Clipboard className="w-3 h-3" />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 whitespace-pre max-h-[350px] custom-scrollbar text-left leading-relaxed">
                  <code>{currentCodeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* SCALABILITY AND FUTURE PROOFING SPEC NOTE */}
            <div className="border border-border-subtle bg-bg-card rounded-2xl p-5 shadow-lg flex items-start gap-4">
              <Award className="w-8 h-8 text-accent-primary shrink-0 mt-0.5 animate-pulse-slow" />
              <div>
                <h4 className="text-xs font-bold text-text-primary">Architect Notes on Future Scalability & Compliance</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                  At your current estimated {inputs.userScale} user scale, directory performance constraints are mostly limited. However, as transactions cross regional borders, ensuring compliance with local laws (such as GDPR residency bounds or HIPAA privacy partitions) is crucial. 
                  Deploying standard OIDC token exchange (RFC 8693) is highly recommended as you introduce new cloud segments, delegating token trust boundaries to avoid long-lived access credential leakage.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  )
}
