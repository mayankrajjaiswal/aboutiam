import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Network, ArrowRight, Shield, Play, Terminal, Cpu, Database,
  Globe, Server, Users, Cloud, RefreshCw, KeySquare, ChevronRight, ChevronDown, Laptop,
  Wallet, Fingerprint, Landmark, TrendingUp, Send, FileCheck, Waypoints, Siren, Building2, IdCard, Scale, Eye,
  HardHat, Router, Cog, Truck, Factory, CreditCard, ScanLine, Boxes, Layers
} from 'lucide-react'
import { ARCHITECTURES } from '../data/architectureData'

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

function buildArchitectureJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/architecture/',
    'name': 'AboutIAM Interactive Architecture Center',
    'description': 'Clickable, beginner-to-advanced reference identity architectures with threat models, node-level specs, and simulated handshake traces.',
    'hasPart': ARCHITECTURES.map((a) => ({
      '@type': 'TechArticle',
      '@id': `https://www.aboutiam.com/architecture/#${a.id}`,
      'headline': a.name,
      'about': a.group,
      'description': a.description,
      'url': `https://www.aboutiam.com/architecture?arch=${a.id}`
    }))
  }
}

// Each architecture's guided simulation, keyed by id — adding a new architecture to
// architectureData.ts only requires adding its steps here, not touching runSimulation itself.
const SIMULATION_STEPS: Record<string, { node: string; msg: string }[]> = {
  basic_session_auth: [
    { node: 'browser', msg: '🚀 User submits the login form with username and password over HTTPS...' },
    { node: 'app_server', msg: '📡 App Server verifies the password against the stored bcrypt hash in the User Database...' },
    { node: 'user_db', msg: '🔐 User Database confirms the hash matches. Credentials are valid!' },
    { node: 'session_store', msg: '✓ App Server creates a new server-side session and sets an HttpOnly, Secure session cookie! 🎉' }
  ],
  ldap_onprem: [
    { node: 'workstation', msg: '🚀 Employee logs into their domain-joined workstation...' },
    { node: 'domain_controller', msg: '📡 Workstation sends a Kerberos AS-REQ to the Domain Controller for pre-authentication...' },
    { node: 'kerberos_kdc', msg: '🔐 KDC validates the request and issues a Ticket Granting Ticket (TGT)...' },
    { node: 'file_server', msg: '✓ Workstation presents a service ticket to the File Server, which grants access without a password re-prompt! 🎉' }
  ],
  social_login_basic: [
    { node: 'browser', msg: '🚀 User clicks "Sign in with Google" on the app\'s login page...' },
    { node: 'social_provider', msg: '📡 Browser redirects to Google. User authenticates and approves the consent screen...' },
    { node: 'app_backend', msg: '✓ App Backend verifies the returned ID token signature and creates a local session! 🎉' }
  ],
  api_key_auth: [
    { node: 'client_service', msg: '🚀 Partner integration sends a request with its static API key in the header...' },
    { node: 'api_gateway', msg: '📡 API Gateway looks up the key, confirms it is active, and checks the rate limit...' },
    { node: 'backend_service', msg: '✓ Gateway forwards the request with the resolved client identity. Backend Service processes it! 🎉' }
  ],
  rbac_basic: [
    { node: 'user', msg: '🚀 Logged-in user attempts to open an admin-only settings page...' },
    { node: 'app_middleware', msg: '📡 Authorization Middleware reads the user\'s role from the session...' },
    { node: 'role_assignment', msg: '🔐 Middleware checks the Role Assignment Store: user holds the "admin" role...' },
    { node: 'protected_resource', msg: '✓ Role matches the required permission. Protected Resource is rendered! 🎉' }
  ],
  jwt_stateless_api: [
    { node: 'client', msg: '🚀 Client logs in once via the Auth Service to obtain an access/refresh token pair...' },
    { node: 'auth_service', msg: '📡 Auth Service signs a short-lived JWT access token with its private key...' },
    { node: 'api_service', msg: '✓ Client calls the Stateless API Service with the Bearer JWT. Service verifies the signature locally via cached JWKS — no session lookup needed! 🎉' }
  ],
  sso_reverse_proxy: [
    { node: 'user', msg: '🚀 User navigates directly to the legacy app\'s URL...' },
    { node: 'reverse_proxy', msg: '📡 Reverse Proxy intercepts the request. No valid session exists, so it forces an OIDC login...' },
    { node: 'idp', msg: '🔐 Central IdP authenticates the user and returns identity claims to the proxy...' },
    { node: 'legacy_app', msg: '✓ Proxy injects a trusted X-Forwarded-User header. Legacy App accepts it as the authenticated identity! 🎉' }
  ],
  mfa_stepup: [
    { node: 'user', msg: '🚀 Already-authenticated user attempts a high-value funds transfer...' },
    { node: 'risk_engine', msg: '📡 Risk Engine scores the transaction: amount exceeds the low-risk threshold...' },
    { node: 'totp_verifier', msg: '🔐 Step-up required. User enters their 6-digit TOTP code, which is validated...' },
    { node: 'protected_action', msg: '✓ Session amr claim now includes the step-up factor. Sensitive Action Handler executes the transfer! 🎉' }
  ],
  iga_access_review: [
    { node: 'manager', msg: '🚀 Quarterly access certification campaign opens for a reviewing manager...' },
    { node: 'iga_platform', msg: '📡 IGA Platform aggregates entitlements from every connected system for the manager\'s reports...' },
    { node: 'hr_system', msg: '🔐 HR System confirms current org structure and manager-report relationships...' },
    { node: 'target_systems', msg: '✓ Manager revokes an unused entitlement. IGA Platform propagates the revocation to the Target System! 🎉' }
  ],
  jit_pam_elevation: [
    { node: 'engineer', msg: '🚀 Engineer submits a request for temporary elevated access with a linked change ticket...' },
    { node: 'approval_workflow', msg: '📡 Approval Workflow routes the request to the resource owner for sign-off...' },
    { node: 'pam_broker', msg: '🔐 PAM Elevation Broker grants a time-boxed IAM role, starting the expiry countdown...' },
    { node: 'target_system', msg: '✓ Engineer completes the task on the Target System. Grant automatically expires at the end of the window! 🎉' }
  ],
  oauth_oidc: [
    { node: 'user', msg: '🚀 User clicks "Login with Identity" in the Client Application...' },
    { node: 'client_app', msg: '📡 Client app redirects browser to Authorization Server with PKCE challenge...' },
    { node: 'auth_server', msg: '🔐 User authenticates and consents. Auth Server issues short-lived Authorization Code...' },
    { node: 'client_app', msg: '🔄 Client app receives code. Initiates back-channel POST with PKCE verifier...' },
    { node: 'auth_server', msg: '✓ Auth Server validates PKCE matching. Issues Access & ID JWTs!' },
    { node: 'resource_server', msg: '🔓 Client calls backend REST API using Bearer Token. Resource Server validates signature and grants access!' }
  ],
  saml: [
    { node: 'user', msg: '🚀 Employee navigates to protected Service Provider SaaS app...' },
    { node: 'sp', msg: '📡 SP creates base64-encoded SAMLRequest. Redirects browser to IdP...' },
    { node: 'idp', msg: '🔐 IdP authenticates employee session. Generates signed SAML Assertion XML...' },
    { node: 'user', msg: '🔄 Browser automatically POSTs SAMLResponse back to SP Assertion Consumer Service (ACS)...' },
    { node: 'sp', msg: '✓ SP validates X.509 signature against IdP metadata. Issues secure local session! 🎉' }
  ],
  pam: [
    { node: 'admin', msg: '🚀 Administrator authenticates to PAM portal via MFA...' },
    { node: 'pam_vault', msg: '📡 Admin requests temporary RDP/SSH access to Target Server without knowing credentials...' },
    { node: 'pam_vault', msg: '🔐 PAM Vault retrieves root credentials internally. Initiates video recording stream...' },
    { node: 'target_server', msg: '✓ PAM proxies the connection. Target Server accepts isolated PAM IP connection! Session established.' }
  ],
  pki: [
    { node: 'device', msg: '🚀 Device generates secure local asymmetric keypair. Crafts PKCS#10 CSR...' },
    { node: 'sub_ca', msg: '📡 Device transmits CSR to active Intermediate CA for signing...' },
    { node: 'root_ca', msg: '🔐 Intermediate CA validates request. Signs public key using authority key linked to Offline Root CA...' },
    { node: 'device', msg: '🔄 Device receives signed X.509 Certificate. Prepares for mTLS handshake...' },
    { node: 'crl', msg: '✓ Target server checks CRL/OCSP responders to verify certificate is not revoked. Handshake complete! 🎉' }
  ],
  k8s_identity: [
    { node: 'developer', msg: '🚀 Developer initiates cluster command using `kubectl` with an OIDC provider plugin...' },
    { node: 'oidc_provider', msg: '📡 Developer authenticates. External IdP issues a signed OIDC JWT mapping the "k8s-admins" group...' },
    { node: 'kube_apiserver', msg: '🔐 Developer passes Bearer token. API Server verifies signature using IdP discovery document...' },
    { node: 'k8s_rbac', msg: '🔄 API Server resolves native RBAC RoleBinding matching the OIDC group claim to cluster roles...' },
    { node: 'pod_sa', msg: '✓ Request authorized! Developer initiates execution on target Pod Service Account. 🎉' }
  ],
  zero_trust: [
    { node: 'client', msg: '🚀 Subject initiates access request to restricted database...' },
    { node: 'pep', msg: '📡 Traffic intercepted at PEP ( Envoy gateway). Validating mTLS certificate...' },
    { node: 'pdp', msg: '🧠 PEP queries PDP (Policy Decision Point) to check authorization rules...' },
    { node: 'idp', msg: '🔐 PDP queries IdP to confirm user "alice.dev" group memberships and active session state...' },
    { node: 'mdm', msg: '📱 PDP queries MDM compliance loop: verifying client machine certificate and posture...' },
    { node: 'pdp', msg: '✓ PDP outputs ALLOW: User is valid engineer on a compliant, managed machine!' },
    { node: 'resource', msg: '🔓 PEP opens secure proxy tunnel. Connection established to SQL Database!' }
  ],
  b2b_saas: [
    { node: 'tenant_router', msg: '🚀 Enterprise user requests SaaS dashboard via tenant subdomain: tenant-a.saasapp.com...' },
    { node: 'central_auth', msg: '📡 Router binds tenant-a context. Redirecting to Central Auth Service...' },
    { node: 'custom_idp', msg: '🏢 Central Auth identifies @corp.com. Redirecting to Enterprise Customer IdP via SAML federation...' },
    { node: 'central_auth', msg: '🔄 Customer IdP signs SAML assertion, redirecting user back to SaaS API gateway...' },
    { node: 'isolated_db', msg: '👥 Synced user record parsed. Querying Database with Row-Level Security current_tenant_id binding...' }
  ],
  multi_cloud: [
    { node: 'aws_workload', msg: '🚀 AWS pod worker initiates gRPC connection over Unix socket to request identity document...' },
    { node: 'spire_agent', msg: '📡 SPIFFE Agent attests pod attributes and forwards data to Central SPIRE Authority...' },
    { node: 'spire_server', msg: '📜 SPIRE Server validates AWS instance attestation and issues cryptographically signed X.509 SVID...' },
    { node: 'workload_mesh', msg: '🔒 Envoy Sidecar proxy intercepts egress. Establishing mTLS tunnel across clouds using SVID...' },
    { node: 'gcp_resource', msg: '🔓 Mutually authenticated mTLS session established! GCP Database grants access to validated AWS SPIFFE workload.' }
  ],
  banking: [
    { node: 'customer_channel', msg: '🚀 Customer initiates a high-value wire transfer via the Digital Banking Channel...' },
    { node: 'sca_engine', msg: '📡 SCA Engine evaluates PSD2 exemption eligibility. Transaction exceeds the low-value threshold, triggering a dynamically-linked SCA challenge...' },
    { node: 'core_ledger', msg: '🔐 Customer approves the dynamically-linked biometric challenge. Core Banking Ledger begins a dual-control posting...' },
    { node: 'fraud_engine', msg: '🔍 Real-Time Fraud & AML Risk Engine screens the payee against OFAC sanctions lists and velocity thresholds... CLEAR.' },
    { node: 'swift_gateway', msg: '✓ SWIFT Gateway obtains dual-authorization sign-off and transmits the wire to the correspondent bank! 🎉' }
  ],
  healthcare: [
    { node: 'patient_portal', msg: '🚀 Patient logs into the Patient Portal, having already completed IAL2 identity proofing...' },
    { node: 'fhir_gateway', msg: '📡 Portal requests lab results via the HL7 FHIR Gateway using a scoped patient/Observation.read token...' },
    { node: 'ehr_system', msg: '🔐 EHR System enforces the Minimum Necessary Standard, returning only the requested lab result fields...' },
    { node: 'break_glass', msg: '🚨 Emergency: an on-call physician invokes Break-Glass access to view the same patient\'s allergy history during a code event...' },
    { node: 'business_associate', msg: '✓ Access logged for mandatory post-hoc review. Billing data for the visit is later shared with a vendor under a signed Business Associate Agreement! 🎉' }
  ],
  government: [
    { node: 'piv_card', msg: '🚀 Federal employee inserts their PIV smart card and enters their PIN at a workstation...' },
    { node: 'assurance_broker', msg: '📡 Assurance Broker validates the hardware-bound certificate and asserts IAL2/AAL3/FAL3 tiers into the token...' },
    { node: 'agency_broker', msg: '🔐 Cross-Agency Federation Broker federates the asserted identity to the target agency application...' },
    { node: 'fedramp_boundary', msg: '🔄 Application resides inside a FedRAMP Moderate authorization boundary. Request is validated against the SSP-mapped control baseline...' },
    { node: 'audit_continuous_monitoring', msg: '✓ Continuous Monitoring logs the access to an immutable audit trail for ConMon reporting! 🎉' }
  ],
  manufacturing: [
    { node: 'plant_operator', msg: '🚀 Operator badges into the Plant Floor HMI to begin a shift on the packaging line...' },
    { node: 'ot_it_gateway', msg: '📡 HMI session request crosses the OT/IT Segmentation Gateway, which enforces the Industrial DMZ protocol break...' },
    { node: 'plc_identity_broker', msg: '🔐 PLC/RTU Machine Identity Broker validates the mutual TLS certificate on the target packaging-line controller...' },
    { node: 'vendor_remote_access', msg: '🔧 An OEM vendor technician requests remote access to recalibrate the same PLC. Vendor Remote Access Broker opens a time-boxed, recorded session...' },
    { node: 'scada_historian', msg: '✓ Recalibration setpoint change requires dual-operator sign-off before the SCADA Historian applies it to the safety-critical control loop! 🎉' }
  ],
  retail: [
    { node: 'pos_terminal', msg: '🚀 Customer taps their loyalty card at checkout while the cashier logs into the POS Terminal with a badge...' },
    { node: 'store_associate_id', msg: '📡 Store Associate Identity confirms cashier-level RBAC permissions to open the sale...' },
    { node: 'omnichannel_ciam', msg: '🔐 Omnichannel Customer Identity Hub resolves the customer\'s unified profile, linking this purchase to their online order history and loyalty balance...' },
    { node: 'payment_gateway', msg: '💳 Tokenized Payment Gateway tokenizes the card at the point of capture — raw PAN never touches the store network...' },
    { node: 'inventory_supply_chain', msg: '✓ Inventory & Supply Chain System deducts the sold SKU and automatically triggers a restock order with the 3PL partner! 🎉' }
  ],
  ciam_social: [
    { node: 'client', msg: '🚀 Customer browser initiates login request to access secure SaaS accounts...' },
    { node: 'social_idp', msg: '📡 Browser redirects user to Google Social Identity Provider (OIDC workflow)...' },
    { node: 'broker', msg: '🧠 User authenticated. Redirection transfers secure OIDC identity assertions back to Broker...' },
    { node: 'user_store', msg: '📝 Broker reads claims, completes Account Linking rules, and synchronizes User Profile Database...' },
    { node: 'api_gw', msg: '✓ Broker issues secure, signed JWT. SaaS API Gateway validates signature and grants access! 🎉' }
  ]
}

export default function ArchitectureCenter() {
  const [activeArch, setActiveArch] = useState<string>('zero_trust')
  const [selectedNode, setSelectedNode] = useState<string>('client')
  const [isOpen, setIsOpen] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<typeof DIFFICULTIES[number]>('All')

  // Animation / simulation trace logs
  const [simLogs, setSimLogs] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  const activeArchObj = ARCHITECTURES.find(a => a.id === activeArch) ?? ARCHITECTURES[0]

  const handleArchChange = (id: string) => {
    const arch = ARCHITECTURES.find(a => a.id === id)
    setActiveArch(id)
    setSelectedNode(arch?.defaultNode ?? Object.keys(arch?.nodes ?? {})[0] ?? '')
    setSimLogs([])
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const archParam = params.get('arch')
      const found = archParam ? ARCHITECTURES.find(a => a.id === archParam) : undefined
      if (found) {
        setTimeout(() => {
          setActiveArch(found.id)
          setSelectedNode(found.defaultNode)
        }, 0)
      }
    }
  }, [])

  const runSimulation = async () => {
    if (isSimulating) return
    setIsSimulating(true)
    setSimLogs([])

    const addLog = (msg: string) => {
      setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    const steps = SIMULATION_STEPS[activeArch] ?? []
    for (const step of steps) {
      addLog(step.msg)
      setSelectedNode(step.node)
      await new Promise(r => setTimeout(r, 800))
    }

    setIsSimulating(false)
  }

  const selectedData = activeArchObj.nodes[selectedNode]

  const matchesDifficulty = (a: typeof ARCHITECTURES[number]) => difficultyFilter === 'All' || a.difficulty === difficultyFilter
  const FUNDAMENTALS = ARCHITECTURES.filter(a => a.group === 'fundamentals' && matchesDifficulty(a))
  const PROTOCOL_ARCHS = ARCHITECTURES.filter(a => a.group === 'protocol' && matchesDifficulty(a))
  const INDUSTRY_ARCHS = ARCHITECTURES.filter(a => a.group === 'industry' && matchesDifficulty(a))

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArchitectureJsonLd()).replace(/</g, '\\u003c') }}
      />

      {/* Page Shell Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Interactive Architecture Center</h1>
            <p className="text-xs text-text-secondary">{ARCHITECTURES.length} beginner-to-advanced reference security architectures, threat models, and real-time handshakes</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Layout Map & Diagram Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Architecture Selector Controls */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md flex flex-col gap-3 relative z-20">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mr-1">Difficulty:</span>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${difficultyFilter === d ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/60 border-border-subtle text-text-secondary hover:border-accent-primary'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 sm:flex-none">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full sm:w-[320px] flex items-center justify-between gap-3 bg-bg-nested/60 border border-border-subtle hover:border-accent-primary p-3 rounded-xl transition text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Network className="w-5 h-5 text-accent-primary shrink-0 animate-pulse-slow" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block leading-none mb-1">Active Blueprint · {activeArchObj.difficulty}</span>
                      <span className="text-xs font-black text-text-primary block truncate">
                        {activeArchObj.name.split(' (')[0]}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <>
                    {/* Click-outside backdrop */}
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-full sm:w-[360px] bg-bg-card border border-border-subtle rounded-xl shadow-2xl p-2.5 z-40 animate-scaleUp max-h-[420px] overflow-y-auto custom-scrollbar">
                      <div className="space-y-3">
                        {FUNDAMENTALS.length > 0 && (
                          <div>
                            <span className="text-[9px] text-accent-secondary font-bold font-mono uppercase tracking-wider px-2 block mb-1.5">Fundamentals (Beginner → Intermediate)</span>
                            <div className="space-y-1">
                              {FUNDAMENTALS.map((a) => (
                                <button
                                  key={a.id}
                                  onClick={() => { handleArchChange(a.id); setIsOpen(false); }}
                                  className={`w-full text-left p-2 rounded-lg text-xs font-bold transition flex flex-col gap-0.5 cursor-pointer ${activeArch === a.id ? 'bg-accent-glow text-accent-secondary border border-accent-secondary/20' : 'text-text-secondary hover:bg-bg-nested/60 border border-transparent'}`}
                                >
                                  <span className="block truncate">{a.name.split(' (')[0]} <span className="text-[9px] font-normal text-text-muted">· {a.difficulty}</span></span>
                                  <span className="text-[10px] text-text-muted font-normal block truncate">{a.description}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {PROTOCOL_ARCHS.length > 0 && (
                          <div className="border-t border-border-subtle/50 my-2 pt-2">
                            <span className="text-[9px] text-accent-primary font-bold font-mono uppercase tracking-wider px-2 block mb-1.5">Core Protocols & Frameworks</span>
                            <div className="space-y-1">
                              {PROTOCOL_ARCHS.map((a) => (
                                <button
                                  key={a.id}
                                  onClick={() => { handleArchChange(a.id); setIsOpen(false); }}
                                  className={`w-full text-left p-2 rounded-lg text-xs font-bold transition flex flex-col gap-0.5 cursor-pointer ${activeArch === a.id ? 'bg-accent-glow text-accent-primary border border-accent-primary/20' : 'text-text-secondary hover:bg-bg-nested/60 border border-transparent'}`}
                                >
                                  <span className="block truncate">{a.name.split(' (')[0]} <span className="text-[9px] font-normal text-text-muted">· {a.difficulty}</span></span>
                                  <span className="text-[10px] text-text-muted font-normal block truncate">{a.description}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {INDUSTRY_ARCHS.length > 0 && (
                          <div className="border-t border-border-subtle/50 my-2 pt-2">
                            <span className="text-[9px] text-accent-secondary font-bold font-mono uppercase tracking-wider px-2 block mb-1.5">Industry Verticals & Ecosystems</span>
                            <div className="space-y-1">
                              {INDUSTRY_ARCHS.map((a) => (
                                <button
                                  key={a.id}
                                  onClick={() => { handleArchChange(a.id); setIsOpen(false); }}
                                  className={`w-full text-left p-2 rounded-lg text-xs font-bold transition flex flex-col gap-0.5 cursor-pointer ${activeArch === a.id ? 'bg-accent-glow border-accent-secondary/20 text-accent-secondary' : 'text-text-secondary hover:bg-bg-nested/60 border border-transparent'}`}
                                >
                                  <span className="block truncate">{a.name.split(' (')[0]} <span className="text-[9px] font-normal text-text-muted">· {a.difficulty}</span></span>
                                  <span className="text-[10px] text-text-muted font-normal block truncate">{a.description}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {FUNDAMENTALS.length === 0 && PROTOCOL_ARCHS.length === 0 && INDUSTRY_ARCHS.length === 0 && (
                          <span className="text-xs text-text-muted italic px-2 block py-4 text-center">No architectures match this difficulty filter.</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`text-xs px-4 py-3 rounded-xl border transition font-bold flex items-center justify-center gap-1.5 shrink-0 ${isSimulating ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary shadow-sm shadow-accent-primary/10'}`}
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? '' : 'animate-pulse'}`} />
                {isSimulating ? 'Simulating...' : 'Run Simulation Handshake'}
              </button>
            </div>
          </div>

          {/* Graphical Diagram Workspace */}
          <div className="border border-slate-800 bg-[#090e1a] rounded-xl p-6 relative min-h-[380px] flex items-center justify-center select-none overflow-x-auto shadow-inner overflow-y-hidden">
            {/* High-tech Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none rounded-xl"></div>

            {/* --- MONOLITHIC SESSION AUTH --- */}
            {activeArch === 'basic_session_auth' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="browser" selected={selectedNode === 'browser'} title="Web Browser" icon={Users} color="blue" onClick={() => setSelectedNode('browser')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="app_server" selected={selectedNode === 'app_server'} title="App Server" icon={Server} color="teal" onClick={() => setSelectedNode('app_server')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="user_db" selected={selectedNode === 'user_db'} title="User Credentials DB" icon={Database} color="blue" onClick={() => setSelectedNode('user_db')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="session_store" selected={selectedNode === 'session_store'} title="Session Store" icon={Database} color="emerald" onClick={() => setSelectedNode('session_store')} />
              </div>
            )}

            {/* --- LDAP / ACTIVE DIRECTORY --- */}
            {activeArch === 'ldap_onprem' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="workstation" selected={selectedNode === 'workstation'} title="Employee Workstation" icon={Laptop} color="blue" onClick={() => setSelectedNode('workstation')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="domain_controller" selected={selectedNode === 'domain_controller'} title="AD Domain Controller" icon={Server} color="teal" onClick={() => setSelectedNode('domain_controller')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="kerberos_kdc" selected={selectedNode === 'kerberos_kdc'} title="Kerberos KDC" icon={KeySquare} color="blue" onClick={() => setSelectedNode('kerberos_kdc')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="file_server" selected={selectedNode === 'file_server'} title="Target File Server" icon={Database} color="emerald" onClick={() => setSelectedNode('file_server')} />
              </div>
            )}

            {/* --- SIMPLE SOCIAL LOGIN --- */}
            {activeArch === 'social_login_basic' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="browser" selected={selectedNode === 'browser'} title="App Browser" icon={Users} color="blue" onClick={() => setSelectedNode('browser')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="social_provider" selected={selectedNode === 'social_provider'} title="Social IdP (Google)" icon={Globe} color="teal" onClick={() => setSelectedNode('social_provider')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="app_backend" selected={selectedNode === 'app_backend'} title="App Backend" icon={Server} color="emerald" onClick={() => setSelectedNode('app_backend')} />
                </div>
              </div>
            )}

            {/* --- REST API KEY AUTH --- */}
            {activeArch === 'api_key_auth' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="client_service" selected={selectedNode === 'client_service'} title="Calling Client" icon={Send} color="blue" onClick={() => setSelectedNode('client_service')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="api_gateway" selected={selectedNode === 'api_gateway'} title="API Gateway" icon={Shield} color="teal" onClick={() => setSelectedNode('api_gateway')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="backend_service" selected={selectedNode === 'backend_service'} title="Backend Service" icon={Server} color="emerald" onClick={() => setSelectedNode('backend_service')} />
                </div>
              </div>
            )}

            {/* --- BASIC RBAC --- */}
            {activeArch === 'rbac_basic' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="Authenticated User" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="app_middleware" selected={selectedNode === 'app_middleware'} title="AuthZ Middleware" icon={Shield} color="teal" onClick={() => setSelectedNode('app_middleware')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="role_assignment" selected={selectedNode === 'role_assignment'} title="Role Assignment Store" icon={Database} color="blue" onClick={() => setSelectedNode('role_assignment')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="protected_resource" selected={selectedNode === 'protected_resource'} title="Protected Resource" icon={FileCheck} color="emerald" onClick={() => setSelectedNode('protected_resource')} />
              </div>
            )}

            {/* --- JWT STATELESS API --- */}
            {activeArch === 'jwt_stateless_api' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="client" selected={selectedNode === 'client'} title="API Client" icon={Users} color="blue" onClick={() => setSelectedNode('client')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="auth_service" selected={selectedNode === 'auth_service'} title="Token Service" icon={KeySquare} color="teal" onClick={() => setSelectedNode('auth_service')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="api_service" selected={selectedNode === 'api_service'} title="Stateless API Service" icon={Server} color="emerald" onClick={() => setSelectedNode('api_service')} />
                </div>
              </div>
            )}

            {/* --- SSO REVERSE PROXY --- */}
            {activeArch === 'sso_reverse_proxy' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="End User" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="reverse_proxy" selected={selectedNode === 'reverse_proxy'} title="Auth Reverse Proxy" icon={Router} color="teal" onClick={() => setSelectedNode('reverse_proxy')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="idp" selected={selectedNode === 'idp'} title="Central IdP" icon={KeySquare} color="blue" onClick={() => setSelectedNode('idp')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="legacy_app" selected={selectedNode === 'legacy_app'} title="Legacy Application" icon={Server} color="emerald" onClick={() => setSelectedNode('legacy_app')} />
              </div>
            )}

            {/* --- STEP-UP MFA (TOTP) --- */}
            {activeArch === 'mfa_stepup' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="Authenticated User" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="risk_engine" selected={selectedNode === 'risk_engine'} title="Risk / Policy Engine" icon={Cpu} color="teal" onClick={() => setSelectedNode('risk_engine')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="totp_verifier" selected={selectedNode === 'totp_verifier'} title="TOTP Verifier" icon={Fingerprint} color="blue" onClick={() => setSelectedNode('totp_verifier')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="protected_action" selected={selectedNode === 'protected_action'} title="Sensitive Action" icon={FileCheck} color="emerald" onClick={() => setSelectedNode('protected_action')} />
              </div>
            )}

            {/* --- IGA ACCESS REVIEW --- */}
            {activeArch === 'iga_access_review' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="manager" selected={selectedNode === 'manager'} title="Reviewing Manager" icon={Users} color="blue" onClick={() => setSelectedNode('manager')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="iga_platform" selected={selectedNode === 'iga_platform'} title="IGA Platform" icon={Scale} color="teal" onClick={() => setSelectedNode('iga_platform')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="hr_system" selected={selectedNode === 'hr_system'} title="HR System of Record" icon={Building2} color="blue" onClick={() => setSelectedNode('hr_system')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="target_systems" selected={selectedNode === 'target_systems'} title="Target Entitlements" icon={Database} color="emerald" onClick={() => setSelectedNode('target_systems')} />
              </div>
            )}

            {/* --- JIT PAM ELEVATION --- */}
            {activeArch === 'jit_pam_elevation' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="engineer" selected={selectedNode === 'engineer'} title="Requesting Engineer" icon={Users} color="blue" onClick={() => setSelectedNode('engineer')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="approval_workflow" selected={selectedNode === 'approval_workflow'} title="Approval Workflow" icon={FileCheck} color="teal" onClick={() => setSelectedNode('approval_workflow')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="pam_broker" selected={selectedNode === 'pam_broker'} title="PAM Elevation Broker" icon={Shield} color="blue" onClick={() => setSelectedNode('pam_broker')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="target_system" selected={selectedNode === 'target_system'} title="Target Privileged System" icon={Server} color="emerald" onClick={() => setSelectedNode('target_system')} />
              </div>
            )}

            {/* --- WORKFORCE ZERO TRUST DIAGRAM --- */}
            {activeArch === 'zero_trust' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-16 items-center justify-center min-w-[500px]">

                {/* Row 1: Users, PEP, Resources */}
                <DiagramNode
                  id="client"
                  selected={selectedNode === 'client'}
                  title="Subject Workstation"
                  icon={Users}
                  color="blue"
                  onClick={() => setSelectedNode('client')}
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-slate-800"></div>
                  <ChevronRight className="w-4 h-4 text-slate-500 absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode
                  id="pep"
                  selected={selectedNode === 'pep'}
                  title="PEP ( Envoy)"
                  icon={Shield}
                  color="teal"
                  onClick={() => setSelectedNode('pep')}
                />

                {/* Vertical Bridge Row */}
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>

                {/* Row 2: MDM, PDP, Resources DB */}
                <DiagramNode
                  id="mdm"
                  selected={selectedNode === 'mdm'}
                  title="MDM (Intune)"
                  icon={RefreshCw}
                  color="blue"
                  onClick={() => setSelectedNode('mdm')}
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-slate-800"></div>
                  <ChevronRight className="w-4 h-4 text-slate-500 absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode
                  id="pdp"
                  selected={selectedNode === 'pdp'}
                  title="PDP (OPA)"
                  icon={Cpu}
                  color="teal"
                  onClick={() => setSelectedNode('pdp')}
                />

                {/* Vertical Bridge Row 2 */}
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>

                {/* Row 3: IdP, Secure DB Target */}
                <DiagramNode
                  id="idp"
                  selected={selectedNode === 'idp'}
                  title="Directory IdP"
                  icon={KeySquare}
                  color="blue"
                  onClick={() => setSelectedNode('idp')}
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-slate-800"></div>
                  <ChevronRight className="w-4 h-4 text-slate-500 absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode
                  id="resource"
                  selected={selectedNode === 'resource'}
                  title="Secure DB Resource"
                  icon={Database}
                  color="emerald"
                  onClick={() => setSelectedNode('resource')}
                />

              </div>
            )}

            {/* --- MULTI-TENANT B2B SAAS DIAGRAM --- */}
            {activeArch === 'b2b_saas' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">

                {/* Row 1: Tenant Router, Customer IdP */}
                <DiagramNode
                  id="tenant_router"
                  selected={selectedNode === 'tenant_router'}
                  title="Tenant Domain Router"
                  icon={Globe}
                  color="blue"
                  onClick={() => setSelectedNode('tenant_router')}
                />

                <div className="w-full h-0.5 bg-slate-800"></div>

                <DiagramNode
                  id="custom_idp"
                  selected={selectedNode === 'custom_idp'}
                  title="Customer Corp IdP"
                  icon={KeySquare}
                  color="teal"
                  onClick={() => setSelectedNode('custom_idp')}
                />

                {/* Row 2: Central Auth */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>

                <div className="col-span-3 flex justify-center">
                  <DiagramNode
                    id="central_auth"
                    selected={selectedNode === 'central_auth'}
                    title="Central Auth Broker"
                    icon={Server}
                    color="blue"
                    onClick={() => setSelectedNode('central_auth')}
                  />
                </div>

                {/* Row 3: SCIM Sync, Isolated DB */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode
                  id="scim_sync"
                  selected={selectedNode === 'scim_sync'}
                  title="SCIM Sync Engine"
                  icon={RefreshCw}
                  color="teal"
                  onClick={() => setSelectedNode('scim_sync')}
                />

                <div className="w-full h-0.5 bg-slate-800"></div>

                <DiagramNode
                  id="isolated_db"
                  selected={selectedNode === 'isolated_db'}
                  title="Tenant Isolated DB"
                  icon={Database}
                  color="emerald"
                  onClick={() => setSelectedNode('isolated_db')}
                />

              </div>
            )}

            {/* --- MULTI-CLOUD WORKLOAD DIAGRAM --- */}
            {activeArch === 'multi_cloud' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">

                {/* AWS compute Workload */}
                <DiagramNode
                  id="aws_workload"
                  selected={selectedNode === 'aws_workload'}
                  title="AWS Pod Workload"
                  icon={Cloud}
                  color="blue"
                  onClick={() => setSelectedNode('aws_workload')}
                />

                <div className="w-full h-0.5 bg-slate-800"></div>

                {/* Local agent */}
                <DiagramNode
                  id="spire_agent"
                  selected={selectedNode === 'spire_agent'}
                  title="SPIRE Attest Agent"
                  icon={Shield}
                  color="blue"
                  onClick={() => setSelectedNode('spire_agent')}
                />

                {/* Vertical to Server */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>

                {/* Central server */}
                <div className="col-span-3 flex justify-center">
                  <DiagramNode
                    id="spire_server"
                    selected={selectedNode === 'spire_server'}
                    title="SPIRE Cert Authority"
                    icon={Server}
                    color="teal"
                    onClick={() => setSelectedNode('spire_server')}
                  />
                </div>

                {/* Down to proxy & GCP target */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode
                  id="workload_mesh"
                  selected={selectedNode === 'workload_mesh'}
                  title="mTLS Workload Mesh"
                  icon={Network}
                  color="teal"
                  onClick={() => setSelectedNode('workload_mesh')}
                />

                <div className="w-full h-0.5 bg-slate-800"></div>

                <DiagramNode
                  id="gcp_resource"
                  selected={selectedNode === 'gcp_resource'}
                  title="GCP Secure Resource"
                  icon={Database}
                  color="emerald"
                  onClick={() => setSelectedNode('gcp_resource')}
                />

              </div>
            )}

            {/* --- CUSTOMER IDENTITY (CIAM) & SOCIAL FEDERATION DIAGRAM --- */}
            {activeArch === 'ciam_social' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">

                {/* Row 1: Client and Social IdP */}
                <DiagramNode
                  id="client"
                  selected={selectedNode === 'client'}
                  title="Customer Browser"
                  icon={Users}
                  color="blue"
                  onClick={() => setSelectedNode('client')}
                />

                <div className="w-full h-0.5 bg-slate-800"></div>

                <DiagramNode
                  id="social_idp"
                  selected={selectedNode === 'social_idp'}
                  title="Social IdP (Google)"
                  icon={KeySquare}
                  color="teal"
                  onClick={() => setSelectedNode('social_idp')}
                />

                {/* Vertical Row to Broker */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>

                <div className="col-span-3 flex justify-center">
                  <DiagramNode
                    id="broker"
                    selected={selectedNode === 'broker'}
                    title="Central Identity Broker"
                    icon={Server}
                    color="blue"
                    onClick={() => setSelectedNode('broker')}
                  />
                </div>

                {/* Vertical Row down to User Store & API Gateway */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode
                  id="user_store"
                  selected={selectedNode === 'user_store'}
                  title="Customer Profile DB"
                  icon={Database}
                  color="teal"
                  onClick={() => setSelectedNode('user_store')}
                />

                <div className="w-full h-0.5 bg-slate-800"></div>

                <DiagramNode
                  id="api_gw"
                  selected={selectedNode === 'api_gw'}
                  title="SaaS API Gateway"
                  icon={Shield}
                  color="emerald"
                  onClick={() => setSelectedNode('api_gw')}
                />

              </div>
            )}

            {/* --- OAUTH 2.0 & OIDC --- */}
            {activeArch === 'oauth_oidc' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="Resource Owner" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="client_app" selected={selectedNode === 'client_app'} title="Client App" icon={Globe} color="blue" onClick={() => setSelectedNode('client_app')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="auth_server" selected={selectedNode === 'auth_server'} title="Authorization Server" icon={KeySquare} color="teal" onClick={() => setSelectedNode('auth_server')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="client_app" selected={selectedNode === 'client_app'} title="Client App (Bearer)" icon={Globe} color="blue" onClick={() => setSelectedNode('client_app')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="resource_server" selected={selectedNode === 'resource_server'} title="Resource Server (API)" icon={Server} color="emerald" onClick={() => setSelectedNode('resource_server')} />
              </div>
            )}

            {/* --- SAML 2.0 --- */}
            {activeArch === 'saml' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="Employee Browser" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="sp" selected={selectedNode === 'sp'} title="Service Provider" icon={Cloud} color="teal" onClick={() => setSelectedNode('sp')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="idp" selected={selectedNode === 'idp'} title="Identity Provider" icon={KeySquare} color="blue" onClick={() => setSelectedNode('idp')} />
                </div>
              </div>
            )}

            {/* --- PAM --- */}
            {activeArch === 'pam' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="admin" selected={selectedNode === 'admin'} title="System Administrator" icon={Users} color="blue" onClick={() => setSelectedNode('admin')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="pam_vault" selected={selectedNode === 'pam_vault'} title="PAM Session Vault" icon={Shield} color="teal" onClick={() => setSelectedNode('pam_vault')} />
                <div className="h-10"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-2"></div>
                <DiagramNode id="target_server" selected={selectedNode === 'target_server'} title="Target Server" icon={Server} color="emerald" onClick={() => setSelectedNode('target_server')} />
              </div>
            )}

            {/* --- PKI --- */}
            {activeArch === 'pki' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="device" selected={selectedNode === 'device'} title="Client Device" icon={Laptop} color="blue" onClick={() => setSelectedNode('device')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="sub_ca" selected={selectedNode === 'sub_ca'} title="Intermediate CA" icon={Server} color="teal" onClick={() => setSelectedNode('sub_ca')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <DiagramNode id="crl" selected={selectedNode === 'crl'} title="Revocation (CRL)" icon={Database} color="emerald" onClick={() => setSelectedNode('crl')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="root_ca" selected={selectedNode === 'root_ca'} title="Offline Root CA" icon={KeySquare} color="blue" onClick={() => setSelectedNode('root_ca')} />
              </div>
            )}

            {/* --- KUBERNETES IDENTITY --- */}
            {activeArch === 'k8s_identity' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                {/* Developer -> OIDC Provider -> Kube API Server */}
                <DiagramNode id="developer" selected={selectedNode === 'developer'} title="Developer (kubectl)" icon={Users} color="blue" onClick={() => setSelectedNode('developer')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="oidc_provider" selected={selectedNode === 'oidc_provider'} title="External IdP (OIDC)" icon={KeySquare} color="teal" onClick={() => setSelectedNode('oidc_provider')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="kube_apiserver" selected={selectedNode === 'kube_apiserver'} title="Kubernetes API Server" icon={Server} color="blue" onClick={() => setSelectedNode('kube_apiserver')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                {/* K8s RBAC -> Pod SA */}
                <DiagramNode id="k8s_rbac" selected={selectedNode === 'k8s_rbac'} title="K8s RBAC (RoleBinding)" icon={Shield} color="emerald" onClick={() => setSelectedNode('k8s_rbac')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="pod_sa" selected={selectedNode === 'pod_sa'} title="Pod Service Account" icon={Cpu} color="teal" onClick={() => setSelectedNode('pod_sa')} />
              </div>
            )}

            {/* --- BANKING & FINANCIAL SERVICES --- */}
            {activeArch === 'banking' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="customer_channel" selected={selectedNode === 'customer_channel'} title="Digital Banking Channel" icon={Wallet} color="blue" onClick={() => setSelectedNode('customer_channel')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="sca_engine" selected={selectedNode === 'sca_engine'} title="SCA Engine (PSD2)" icon={Fingerprint} color="teal" onClick={() => setSelectedNode('sca_engine')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="core_ledger" selected={selectedNode === 'core_ledger'} title="Core Banking Ledger" icon={Landmark} color="blue" onClick={() => setSelectedNode('core_ledger')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="fraud_engine" selected={selectedNode === 'fraud_engine'} title="Fraud & AML Engine" icon={TrendingUp} color="teal" onClick={() => setSelectedNode('fraud_engine')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="swift_gateway" selected={selectedNode === 'swift_gateway'} title="SWIFT Gateway" icon={Send} color="emerald" onClick={() => setSelectedNode('swift_gateway')} />
              </div>
            )}

            {/* --- HEALTHCARE (HIPAA & HL7 FHIR) --- */}
            {activeArch === 'healthcare' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="patient_portal" selected={selectedNode === 'patient_portal'} title="Patient Portal (CIAM)" icon={Users} color="blue" onClick={() => setSelectedNode('patient_portal')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="fhir_gateway" selected={selectedNode === 'fhir_gateway'} title="HL7 FHIR Gateway" icon={Waypoints} color="teal" onClick={() => setSelectedNode('fhir_gateway')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="ehr_system" selected={selectedNode === 'ehr_system'} title="EHR System" icon={FileCheck} color="blue" onClick={() => setSelectedNode('ehr_system')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="break_glass" selected={selectedNode === 'break_glass'} title="Break-Glass Access" icon={Siren} color="teal" onClick={() => setSelectedNode('break_glass')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="business_associate" selected={selectedNode === 'business_associate'} title="Business Associate" icon={Building2} color="emerald" onClick={() => setSelectedNode('business_associate')} />
              </div>
            )}

            {/* --- GOVERNMENT & PUBLIC SECTOR (FedRAMP & NIST 800-63) --- */}
            {activeArch === 'government' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="piv_card" selected={selectedNode === 'piv_card'} title="PIV / CAC Card" icon={IdCard} color="blue" onClick={() => setSelectedNode('piv_card')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="assurance_broker" selected={selectedNode === 'assurance_broker'} title="Assurance Broker" icon={Scale} color="teal" onClick={() => setSelectedNode('assurance_broker')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="agency_broker" selected={selectedNode === 'agency_broker'} title="Cross-Agency Broker" icon={Landmark} color="blue" onClick={() => setSelectedNode('agency_broker')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="fedramp_boundary" selected={selectedNode === 'fedramp_boundary'} title="FedRAMP Boundary" icon={Building2} color="teal" onClick={() => setSelectedNode('fedramp_boundary')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="audit_continuous_monitoring" selected={selectedNode === 'audit_continuous_monitoring'} title="Continuous Monitoring" icon={Eye} color="emerald" onClick={() => setSelectedNode('audit_continuous_monitoring')} />
              </div>
            )}

            {/* --- MANUFACTURING (OT/ICS & IEC 62443) --- */}
            {activeArch === 'manufacturing' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="plant_operator" selected={selectedNode === 'plant_operator'} title="Plant Floor Operator" icon={HardHat} color="blue" onClick={() => setSelectedNode('plant_operator')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="ot_it_gateway" selected={selectedNode === 'ot_it_gateway'} title="OT/IT Segmentation Gateway" icon={Router} color="teal" onClick={() => setSelectedNode('ot_it_gateway')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="plc_identity_broker" selected={selectedNode === 'plc_identity_broker'} title="PLC/RTU Identity Broker" icon={Cog} color="blue" onClick={() => setSelectedNode('plc_identity_broker')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="vendor_remote_access" selected={selectedNode === 'vendor_remote_access'} title="Vendor Remote Access" icon={Truck} color="teal" onClick={() => setSelectedNode('vendor_remote_access')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="scada_historian" selected={selectedNode === 'scada_historian'} title="SCADA Historian" icon={Factory} color="emerald" onClick={() => setSelectedNode('scada_historian')} />
              </div>
            )}

            {/* --- RETAIL (PCI-DSS & OMNICHANNEL) --- */}
            {activeArch === 'retail' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="pos_terminal" selected={selectedNode === 'pos_terminal'} title="Point-of-Sale Terminal" icon={CreditCard} color="blue" onClick={() => setSelectedNode('pos_terminal')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="store_associate_id" selected={selectedNode === 'store_associate_id'} title="Store Associate Identity" icon={IdCard} color="teal" onClick={() => setSelectedNode('store_associate_id')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="omnichannel_ciam" selected={selectedNode === 'omnichannel_ciam'} title="Omnichannel CIAM Hub" icon={Users} color="blue" onClick={() => setSelectedNode('omnichannel_ciam')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-slate-800 mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="payment_gateway" selected={selectedNode === 'payment_gateway'} title="Tokenized Payment Gateway" icon={ScanLine} color="teal" onClick={() => setSelectedNode('payment_gateway')} />
                <div className="w-full h-0.5 bg-slate-800"></div>
                <DiagramNode id="inventory_supply_chain" selected={selectedNode === 'inventory_supply_chain'} title="Inventory & Supply Chain" icon={Boxes} color="emerald" onClick={() => setSelectedNode('inventory_supply_chain')} />
              </div>
            )}

          </div>

          {/* Interactive simulated execution traces */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-4 shadow-xl flex-1 min-h-[140px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-accent-primary animate-pulse" /> Active Handshake Trace Logs
              </div>

              <div className="space-y-1 text-[11px] font-mono leading-normal max-h-32 overflow-y-auto pr-1">
                {simLogs.length === 0 ? (
                  <span className="text-slate-500 italic select-none">No active handshake trace. Click "Run Simulation Handshake" above to watch packets route.</span>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="text-emerald-400 font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {simLogs.length > 0 && !isSimulating && (
              <span className="block text-[9px] text-emerald-400 font-bold font-mono mt-2 animate-pulse">
                ✓ Handshake completed. Dynamic parameters resolved securely.
              </span>
            )}
          </div>

        </div>

        {/* Right Side: Component Details and Specs */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
          {selectedData ? (
            <div className="space-y-5">
              <div className="border-b border-border-subtle pb-3">
                <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider block mb-0.5">Selected Node Component</span>
                <h2 className="text-base font-black text-text-primary">{selectedData.title}</h2>
              </div>

              <div>
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mb-1">Functional Role</span>
                <p className="text-xs text-text-secondary leading-normal">{selectedData.role}</p>
              </div>

              <div className="bg-bg-nested/60 border border-border-subtle p-3 rounded-lg">
                <span className="text-[9px] text-accent-primary font-bold uppercase tracking-wider block mb-1">Friendly Analogy</span>
                <p className="text-xs text-text-secondary leading-relaxed italic">"{selectedData.analogy}"</p>
              </div>

              <div>
                <span className="text-[9px] text-accent-secondary font-bold uppercase tracking-wider block mb-1 font-mono">Expert Specifications</span>
                <p className="text-xs text-text-secondary leading-normal font-mono text-[11px]">{selectedData.spec}</p>
              </div>

              <div className="border border-status-danger/30 bg-status-danger/5 p-3 rounded-lg text-status-danger">
                <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-status-danger">Threat Model & Mitigation</span>
                <p className="text-xs leading-normal">{selectedData.threatModel}</p>
              </div>

              <div className="border border-status-success/30 bg-status-success/5 p-3 rounded-lg text-status-success">
                <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-status-success">Architect Best Practice</span>
                <p className="text-xs leading-normal">{selectedData.bestPractice}</p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center select-none gap-2">
              <Network className="w-8 h-8 text-text-muted animate-pulse" />
              <span>Click on any box in the diagram to inspect its deep-dive workforce role, trust boundaries, threat models, and best practices.</span>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-border-subtle/60">
            <span className="text-[9px] text-text-muted font-mono block text-center">Reference Model: NIST SP 800-207 & RFC Standards.</span>
          </div>
        </div>

      </div>

      {activeArchObj.relatedResources && activeArchObj.relatedResources.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent-primary" /> Related Tools & Playgrounds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeArchObj.relatedResources.map((res, i) => (
                <Link
                  key={i}
                  to={res.path}
                  className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/40 transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[8px] font-mono uppercase text-accent-primary font-bold">{res.type}</span>
                    <h4 className="text-xs font-black text-text-primary group-hover:text-accent-primary mt-0.5 leading-snug">{res.title}</h4>
                  </div>
                  <span className="text-[10px] text-text-secondary hover:text-text-primary mt-3 font-semibold">&rarr; Open</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DiagramNode({
  selected, title, icon: Icon, color, onClick
}: {
  id: string
  selected: boolean
  title: string
  icon: LucideIcon
  color: 'blue' | 'teal' | 'emerald'
  onClick: () => void
}) {
  const colorClasses = {
    blue: selected
      ? 'bg-blue-950/40 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/30'
      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/70',
    teal: selected
      ? 'bg-teal-950/40 border-teal-500 text-teal-400 shadow-lg shadow-teal-500/30'
      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/70',
    emerald: selected
      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/30'
      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/70'
  }

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer min-w-[125px] relative z-10 ${colorClasses[color]}`}
    >
      <Icon className={`w-5 h-5 ${selected ? (color === 'blue' ? 'text-blue-400 animate-pulse' : color === 'teal' ? 'text-teal-400 animate-pulse' : 'text-emerald-400 animate-pulse') : 'text-slate-500'}`} />
      <span className="text-[10px] font-bold tracking-tight block max-w-[110px]">{title}</span>
    </button>
  )
}
