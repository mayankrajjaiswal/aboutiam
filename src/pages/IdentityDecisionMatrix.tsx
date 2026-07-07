import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Compass, HelpCircle, Check, ShieldCheck, 
  Layers, Sparkles, Network, CheckSquare, ShieldAlert, Award
} from 'lucide-react'

// Define Decision Engine Types
interface DecisionInput {
  deployment: 'cloud' | 'hybrid' | 'onprem'
  audience: 'workforce' | 'ciam' | 'b2b'
  scale: 'small' | 'medium' | 'enterprise'
  techStack: 'spa' | 'mobile' | 'legacy' | 'm2m'
  securityPriority: 'passwordless' | 'compliance' | 'finegrained' | 'mesh'
}

interface RecommendationOutput {
  authnProtocol: string
  authzModel: string
  federation: string
  recommendedIdpClass: string
  architectureLayout: string
  standards: string[]
  checklists: { impl: string[]; security: string[] }
  aboutiamResources: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
}

interface MatrixComparison {
  id: string
  title: string
  entityA: string
  entityB: string
  summary: string
  prosA: string[]
  prosB: string[]
  winner: string
}

export default function IdentityDecisionMatrix() {
  const [activeTab, setActiveTab] = useState<'wizard' | 'matrix'>('wizard')

  // --- WIZARD STATE ---
  const [inputs, setInputs] = useState<DecisionInput>({
    deployment: 'cloud',
    audience: 'ciam',
    scale: 'medium',
    techStack: 'spa',
    securityPriority: 'passwordless'
  })
  const [hasCalculated, setHasCalculated] = useState(false)

  // --- DYNAMIC DECISION RESOLVER ENGINE ---
  const recommendation: RecommendationOutput = useMemo(() => {
    let authnProtocol = 'OpenID Connect (OIDC)'
    let authzModel = 'Role-Based Access Control (RBAC)'
    let federation = 'OpenID Connect (OIDC) Federation'
    let recommendedIdpClass = 'Cloud Identity-as-a-Service (e.g., Auth0, Okta, Clerk)'
    let architectureLayout = 'API Gateway Token Exchange & Stateless JWT verification.'
    const standards = ['RFC 7519 (JSON Web Tokens)', 'RFC 6749 (OAuth 2.0)']
    const implChecklist = [
      'Implement code_verifier & code_challenge parameters (PKCE - RFC 7636).',
      'Validate audience (aud) and issuer (iss) claims on downstream APIs.',
      'Configure automated key rotation on verification middleware.'
    ]
    const securityChecklist = [
      'Mandate HTTPS/TLS on all front/back channel exchanges.',
      'Enforce HTTP-Only Secure cookies for storing access credentials.',
      'Store private signing keys securely in Hardware Security Modules (HSM).'
    ]
    const aboutiamResources: RecommendationOutput['aboutiamResources'] = []

    // 1. Resolve AuthN & IdPs based on Audience and Deployment
    if (inputs.audience === 'workforce') {
      authnProtocol = inputs.deployment === 'onprem' ? 'SAML 2.0 / LDAP' : 'OIDC / SAML 2.0'
      recommendedIdpClass = inputs.deployment === 'cloud' 
        ? 'Workforce IdPs (e.g., Thales SafeNet Trusted Access, Microsoft Entra ID, Okta)' 
        : inputs.deployment === 'hybrid' 
          ? 'Hybrid IdPs (e.g., Thales SafeNet Trusted Access, Ping Identity, Keycloak)' 
          : 'On-Prem Directory (e.g., Active Directory, openLDAP)'
      federation = 'SAML 2.0 metadata federation'
      standards.push('SAML 2.0 Core Spec', 'NIST SP 800-63B')
      implChecklist.push('Set up automated user onboarding via SCIM directory sync.')
      securityChecklist.push('Establish Conditional Access posture policies.')
      aboutiamResources.push(
        { title: 'Zero Trust (ZTA) Planner', path: '/playground/zta', type: 'playground' },
        { title: 'LDAP Filter Builder Tool', path: '/tools/ldap-filter-builder', type: 'tool' }
      )
    } else if (inputs.audience === 'ciam') {
      authnProtocol = inputs.securityPriority === 'passwordless' ? 'WebAuthn / Passkeys' : 'OIDC'
      recommendedIdpClass = 'Customizable Customer IdPs (e.g., Thales OneWelcome, Auth0, Clerk, Keycloak)'
      federation = 'Social OAuth Gateways (Google, Apple, Facebook)'
      standards.push('W3C WebAuthn', 'FIDO2 Core Specifications')
      implChecklist.push('Implement progressive registration profiling to minimize sign-up friction.')
      securityChecklist.push('Enforce credential-stuffing defense monitoring and CAPTCHAs.')
      aboutiamResources.push(
        { title: 'FIDO2 / WebAuthn Lab', path: '/playground/fido2', type: 'playground' },
        { title: 'Passkey Internals Playground', path: '/playground/passkey-internals', type: 'playground' }
      )
    } else if (inputs.audience === 'b2b') {
      authnProtocol = 'SAML 2.0 / OpenID Connect'
      recommendedIdpClass = 'Enterprise B2B IdPs (e.g., Thales OneWelcome, Okta B2B, Keycloak)'
      federation = 'Multi-Tenant Federated SSO'
      standards.push('RFC 7644 (SCIM 2.0 User Provisioning)', 'SAML 2.0 Metadata')
      implChecklist.push('Publish standard OIDC Discovery endpoints and JWKS signing keys.')
      securityChecklist.push('Inforce strict, tenant-isolated cryptographic signing keys.')
      aboutiamResources.push(
        { title: 'SCIM Provisioning Lab', path: '/playground/scim', type: 'playground' },
        { title: 'SCIM Payload Validator Tool', path: '/tools/scim-payload-validator', type: 'tool' }
      )
    }

    // 2. Resolve AuthZ based on Security Priority and Tech Stack
    if (inputs.securityPriority === 'finegrained') {
      authzModel = 'Attribute-Based Access Control (ABAC) / Policy-as-Code'
      architectureLayout = 'Decoupled Fine-Grained Authorization using central Policy Decision Points (PDP).'
      standards.push('XACML 3.0', 'Open Policy Agent (OPA) Rego Specifications')
      implChecklist.push('Write access authorization policies as code (e.g., OPA Rego rules).')
      securityChecklist.push('Audit policy compiles asynchronously to ensure constant-time gateway evaluations.')
      aboutiamResources.push(
        { title: 'OPA & Rego Playground', path: '/playground/opa', type: 'playground' },
        { title: 'Policy Evaluator Tool', path: '/tools/policy-evaluator', type: 'tool' },
        { title: 'OPA Rego Policy References', path: '/references', type: 'references' }
      )
    } else if (inputs.securityPriority === 'mesh' || inputs.techStack === 'm2m') {
      authzModel = 'SPIFFE/SPIRE Mutual TLS (mTLS) identities'
      architectureLayout = 'Workload Mesh and service-to-service validation without shared keys.'
      authnProtocol = 'SPIFFE SVIDs / X.509 mutual TLS'
      standards.push('SPIFFE Workload API', 'RFC 8252 (PKI)')
      implChecklist.push('Deploy local node SPIRE agents to issue cryptographically unique SVIDs.')
      securityChecklist.push('Enforce short-lived cert lifetimes (e.g., 1 hour) with automated key rotations.')
      aboutiamResources.push(
        { title: 'Workload Mesh Playground', path: '/playground/workload-mesh', type: 'playground' },
        { title: 'mTLS & Cert Chain Validator', path: '/playground/cert-chain', type: 'playground' }
      )
    }

    // Standard fallback additions if lists are too short
    if (aboutiamResources.length < 3) {
      aboutiamResources.push(
        { title: 'OAuth Request Builder', path: '/tools/oauth-builder', type: 'tool' },
        { title: 'OAuth 2.0 Visualizer', path: '/playground/oauth', type: 'playground' }
      );
    }

    return {
      authnProtocol,
      authzModel,
      federation,
      recommendedIdpClass,
      architectureLayout,
      standards: Array.from(new Set(standards)),
      checklists: { impl: implChecklist, security: securityChecklist },
      aboutiamResources
    }
  }, [inputs])

  // --- STATIC MATRIX COMPARISONS EXPLORER ---
  const COMPARISONS_MATRIX: MatrixComparison[] = [
    {
      id: 'abac_vs_rebac',
      title: 'ABAC (Attribute) vs ReBAC (Relation)',
      entityA: 'Attribute-Based (ABAC)',
      entityB: 'Relation-Based (ReBAC / Google Zanzibar)',
      summary: 'ABAC evaluates dynamic user, resource, and environment claims (e.g., Department, IP location, Hour). ReBAC authorizes based on relationships (e.g., User is "owner" of "document-123", or User is "member" of "Admin Group" which owns document).',
      prosA: [
        'Excellent for environment variables (time-windows, compliance health).',
        'Decoupled from data hierarchies (stateless policies).'
      ],
      prosB: [
        'Blazing-fast graph-traversals.',
        'Perfect for document-sharing architectures (Google Docs style "who has access to this folder").'
      ],
      winner: 'ReBAC is the winner for modern consumer document sharing; ABAC wins for Zero Trust compliance.'
    },
    {
      id: 'secrets_vs_vault',
      title: 'Secrets Manager vs Vault',
      entityA: 'Cloud Secrets Managers (AWS/Azure Secrets)',
      entityB: 'HashiCorp Vault',
      summary: 'Secrets Managers are managed services for storing static application API keys. Vault is a multi-cloud enterprise platform supporting dynamic ephemeral secrets, PKI, and key rotation.',
      prosA: [
        'Managed serverless setups (zero server maintenance).',
        'Easy IAM-role integration natively on cloud provider.'
      ],
      prosB: [
        'Dynamic short-lived credentials generated on-the-fly.',
        'Multi-cloud independent governance.'
      ],
      winner: 'Vault is the winner for multi-cloud enterprise platforms; Cloud Secrets managers win for rapid SaaS startup MVPs.'
    },
    {
      id: 'pam_vs_iga',
      title: 'PAM (Privileged) vs IGA (Governance)',
      entityA: 'Privileged Access Management (PAM)',
      entityB: 'Identity Governance & Administration (IGA)',
      summary: 'PAM secures and audits high-risk administrative access (e.g., root ssh logins, domain admin credentials). IGA orchestrates automated enterprise onboarding, joiner-mover-leaver lifecycle syncing, and access certifications.',
      prosA: [
        'Live session-recordings and password vault check-outs.',
        'Just-In-Time (JIT) administrative privilege elevations.'
      ],
      prosB: [
        'Automated enterprise joiner-mover-leaver lifecycle loops.',
        'SOC2/ISO access-compliance reviews.'
      ],
      winner: 'PAM wins for infrastructure and database gatekeeping; IGA wins for workforce compliance auditing.'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
              <Compass className="w-3.5 h-3.5" /> Initiative 2 Milestone
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Identity Decision Matrix
            </h1>
            <p className="text-sm text-text-secondary">
              Transform static protocol guides into an active, intelligent advisory engine. Resolve your exact target infrastructure stack.
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-2 border-b border-border-subtle overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'wizard' 
                ? 'border-accent-primary text-accent-primary bg-accent-glow/50' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            🎯 Architecture Decision Wizard
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'matrix' 
                ? 'border-accent-primary text-accent-primary bg-accent-glow/50' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            ⚖️ Enterprise Paradigms Matrix
          </button>
        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="flex-grow min-h-0 relative">
        
        {/* TAB 1: DECISION WIZARD */}
        {activeTab === 'wizard' && (
          <div className="h-full flex flex-col lg:flex-row gap-6 overflow-y-auto">
            
            {/* Left Column: Questionnaire Input */}
            <div className="lg:w-1/3 flex flex-col gap-5 shrink-0 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 select-none">
                <HelpCircle className="w-4 h-4 text-accent-primary animate-pulse" />
                <span className="text-sm font-bold text-text-primary">Workspace Parameters</span>
              </div>

              {/* Deployment Select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted block">Deployment Model</label>
                <select
                  value={inputs.deployment}
                  onChange={(e) => { setInputs(p => ({ ...p, deployment: e.target.value as 'cloud' | 'hybrid' | 'onprem' })); setHasCalculated(true); }}
                  className="w-full p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-xs text-text-primary font-bold outline-none focus:border-accent-primary"
                >
                  <option value="cloud">Cloud-Native (Multi-Tenant SaaS)</option>
                  <option value="hybrid">Hybrid (Cloud + On-Premise Gateways)</option>
                  <option value="onprem">On-Premise (Strict Private Network)</option>
                </select>
              </div>

              {/* Target Audience Select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted block">Primary Audience Identity</label>
                <select
                  value={inputs.audience}
                  onChange={(e) => { setInputs(p => ({ ...p, audience: e.target.value as 'workforce' | 'ciam' | 'b2b' })); setHasCalculated(true); }}
                  className="w-full p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-xs text-text-primary font-bold outline-none focus:border-accent-primary"
                >
                  <option value="workforce">Workforce / Internal Employees (B2E)</option>
                  <option value="ciam">Customers / External Consumer Apps (B2C / CIAM)</option>
                  <option value="b2b">Partner Organizations (B2B SaaS / Federation)</option>
                </select>
              </div>

              {/* Scale Select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted block">Audience Scale</label>
                <select
                  value={inputs.scale}
                  onChange={(e) => { setInputs(p => ({ ...p, scale: e.target.value as 'small' | 'medium' | 'enterprise' })); setHasCalculated(true); }}
                  className="w-full p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-xs text-text-primary font-bold outline-none focus:border-accent-primary"
                >
                  <option value="small">Small Startup (&lt; 1,000 users)</option>
                  <option value="medium">Medium Growing Organ. (1,000 - 100k users)</option>
                  <option value="enterprise">Global Large Enterprise (&gt; 100k users)</option>
                </select>
              </div>

              {/* Primary Tech Stack Select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted block">Application Architecture</label>
                <select
                  value={inputs.techStack}
                  onChange={(e) => { setInputs(p => ({ ...p, techStack: e.target.value as 'spa' | 'mobile' | 'legacy' | 'm2m' })); setHasCalculated(true); }}
                  className="w-full p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-xs text-text-primary font-bold outline-none focus:border-accent-primary"
                >
                  <option value="spa">Single Page App (React/Angular) + REST APIs</option>
                  <option value="mobile">Native Mobile App (iOS / Android)</option>
                  <option value="legacy">Legacy Server-Side Monoliths (MVC)</option>
                  <option value="m2m">Machine-to-Machine APIs (Workload integration)</option>
                </select>
              </div>

              {/* Security Priority Select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-muted block">Primary Security Priority</label>
                <select
                  value={inputs.securityPriority}
                  onChange={(e) => { setInputs(p => ({ ...p, securityPriority: e.target.value as 'passwordless' | 'compliance' | 'finegrained' | 'mesh' })); setHasCalculated(true); }}
                  className="w-full p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-xs text-text-primary font-bold outline-none focus:border-accent-primary"
                >
                  <option value="passwordless">Phishing-Resistant Passwordless (FIDO2)</option>
                  <option value="compliance">Strict GRC Regulatory Compliance (SOC2 / HIPAA / PCI)</option>
                  <option value="finegrained">Fine-Grained Authorization (ABAC / Policy-as-Code)</option>
                  <option value="mesh">Zero-Trust workload attestation (mTLS certs)</option>
                </select>
              </div>

              {/* Calculate trigger button */}
              {!hasCalculated && (
                <button
                  onClick={() => setHasCalculated(true)}
                  className="w-full py-3 px-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold shadow-md transition"
                >
                  Compile Decision Matrix
                </button>
              )}
            </div>

            {/* Right Column: Output recommendations */}
            <div className="flex-grow min-w-0 bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6">
              {hasCalculated ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Summary recommendations grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-black text-text-muted block leading-none">Authentication Protocol</span>
                        <span className="text-xs font-black text-text-primary mt-1 inline-block">{recommendation.authnProtocol}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle flex gap-3">
                      <Layers className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-black text-text-muted block leading-none">Authorization Model</span>
                        <span className="text-xs font-black text-text-primary mt-1 inline-block">{recommendation.authzModel}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle flex gap-3">
                      <Network className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-black text-text-muted block leading-none">Federation Strategy</span>
                        <span className="text-xs font-black text-text-primary mt-1 inline-block">{recommendation.federation}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle flex gap-3">
                      <Compass className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-black text-text-muted block leading-none">Recommended IdP Class</span>
                        <span className="text-xs font-black text-text-primary mt-1 inline-block">{recommendation.recommendedIdpClass}</span>
                      </div>
                    </div>
                  </div>

                  {/* Architecture layout recommendations */}
                  <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-2">
                    <span className="text-[10px] uppercase font-black text-text-muted">Recommended Deployment Architecture</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{recommendation.architectureLayout}</p>
                  </div>

                  {/* Checklists grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <span className="text-xs font-black text-text-primary uppercase tracking-wide border-b border-border-subtle/30 pb-2.5 block flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-status-success" /> Implementation Checklist</span>
                      <ul className="space-y-2">
                        {recommendation.checklists.impl.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-text-secondary leading-normal">
                            <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <span className="text-xs font-black text-text-primary uppercase tracking-wide border-b border-border-subtle/30 pb-2.5 block flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-status-warning" /> Security Checklist</span>
                      <ul className="space-y-2">
                        {recommendation.checklists.security.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-text-secondary leading-normal">
                            <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Deep Linked interactive tools and playgrounds */}
                  <div className="space-y-4">
                    <div className="border-t border-border-subtle/30 pt-6">
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-1">Deep-Linked Practice Resources</span>
                      <p className="text-[11px] text-text-secondary mb-3 leading-normal">Interact with our bespoke client-side simulators to test the parameters selected in this decision wizard.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendation.aboutiamResources.map((res, i) => (
                          <Link
                            key={i}
                            to={res.path}
                            className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/40 transition-all text-left flex flex-col justify-between group"
                          >
                            <div>
                              <span className="text-[8px] font-mono uppercase text-accent-primary font-bold">{res.type}</span>
                              <h4 className="text-xs font-black text-text-primary group-hover:text-accent-primary mt-0.5 leading-snug">{res.title}</h4>
                            </div>
                            <span className="text-[10px] text-text-secondary hover:text-text-primary mt-3 font-semibold">&rarr; Run Simulator</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-text-muted space-y-4">
                  <Sparkles className="w-12 h-12 text-accent-primary animate-bounce" />
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Decision Matrix is Waiting</h3>
                    <p className="text-xs text-text-secondary mt-1">Configure your corporate parameters on the left and click &quot;Compile Decision Matrix&quot;.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PARADIGMS MATRIX */}
        {activeTab === 'matrix' && (
          <div className="h-full overflow-y-auto space-y-6 pb-12">
            
            {/* Category header */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-2 select-none">
              <h2 className="text-base font-black text-text-primary">Enterprise Security Paradigms</h2>
              <p className="text-xs text-text-secondary">Compare dynamic access structures, dynamic secrets management vaults, and compliance monitoring scopes side-by-side.</p>
            </div>

            {/* Comparison cards */}
            <div className="grid grid-cols-1 gap-6">
              {COMPARISONS_MATRIX.map((c) => (
                <div key={c.id} className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <div className="border-b border-border-subtle/30 pb-3">
                    <h3 className="text-base font-black text-text-primary">{c.title}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{c.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/60 space-y-3">
                      <span className="text-xs font-bold text-accent-primary block border-b border-border-subtle/20 pb-1.5">{c.entityA} Capabilities</span>
                      <ul className="space-y-2">
                        {c.prosA.map((pro, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-text-secondary leading-normal">
                            <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/60 space-y-3">
                      <span className="text-xs font-bold text-accent-primary block border-b border-border-subtle/20 pb-1.5">{c.entityB} Capabilities</span>
                      <ul className="space-y-2">
                        {c.prosB.map((pro, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-text-secondary leading-normal">
                            <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendation winner block */}
                  <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 flex gap-3">
                    <Award className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-black text-accent-primary block leading-none">Architect Recommendations Summary</span>
                      <span className="text-xs font-bold text-text-primary mt-1 inline-block">{c.winner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
