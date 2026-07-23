export interface ResourceLink {
  title: string;
  path: string;
  type: 'tool' | 'playground' | 'lab' | 'encyclopedia' | 'architecture' | 'vendor' | 'certification';
  desc?: string;
}

export interface ComparisonData {
  id: string;
  title: string;
  entityA: string;
  entityB: string;
  summary: string;
  table: { feature: string; a: string; b: string }[];
  useCasesA: string[];
  useCasesB: string[];
  winner?: string;
}

export interface InterviewQuestion {
  id: string;
  domain: string;
  question: string;
  hint: string;
  answer: string;
  rfc?: string;
}

export interface LearningTrack {
  level: string;
  goal: string;
  title: string;
  description: string;
  steps: { title: string; desc: string; resources: ResourceLink[] }[];
}

// 1. KNOWLEDGE GRAPH FOR CONTEXTUAL SIDEBAR
export const KNOWLEDGE_GRAPH: Record<string, ResourceLink[]> = {
  oauth: [
    { title: 'OAuth Request Builder', path: '/tools/oauth-builder', type: 'tool', desc: 'Build standard OAuth 2.0 URLs' },
    { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground', desc: 'Step-by-step OIDC flow chart' },
    { title: 'OAuth Attack Lab', path: '/playground/oauth-attack', type: 'lab', desc: 'Hack-and-defend sandbox' },
    { title: 'OAuth 2.0', path: '/encyclopedia?term=oauth', type: 'encyclopedia' }
  ],
  oidc: [
    { title: 'OIDC Discovery Auditor', path: '/tools/oidc-discovery', type: 'tool', desc: 'Decode metadata' },
    { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground', desc: 'OIDC flow chart' },
    { title: 'OpenID Connect', path: '/encyclopedia?term=oidc', type: 'encyclopedia' }
  ],
  jwt: [
    { title: 'JWT Decoder', path: '/tools/jwt-decoder', type: 'tool', desc: 'Inspect & Verify Tokens' },
    { title: 'JWT Studio', path: '/playground/jwt', type: 'playground', desc: 'JWT encoder/decoder & signatures' },
    { title: 'JWT Cracker', path: '/playground/jwt-cracker', type: 'lab', desc: 'Dictionary attack simulator' },
    { title: 'JWT Refresh Token Rotation', path: '/references?ref=jwt-refresh-rotation', type: 'tool', desc: 'Reference middleware implementation' }
  ],
  saml: [
    { title: 'SAML Workbench', path: '/playground/saml', type: 'playground', desc: 'XML assertion workbench' },
    { title: 'SAML Metadata Builder', path: '/tools/saml-metadata-builder', type: 'tool', desc: 'Compile SP/IdP XML' },
    { title: 'Golden SAML', path: '/wall-of-shame?tab=breaches&lab=goldensaml', type: 'lab', desc: 'SolarWinds Attack' },
    { title: 'SAML 2.0', path: '/encyclopedia?term=saml', type: 'encyclopedia' }
  ],
  passkey: [
    { title: 'FIDO2 Lab', path: '/playground/fido2', type: 'playground', desc: 'WebAuthn key emulator' },
    { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Deconstructs authenticatorData' },
    { title: 'WebAuthn', path: '/encyclopedia?term=passkey', type: 'encyclopedia' }
  ],
  fido2: [
    { title: 'FIDO2 Lab', path: '/playground/fido2', type: 'playground', desc: 'WebAuthn key emulator' },
    { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Deconstructs authenticatorData' },
    { title: 'WebAuthn', path: '/encyclopedia?term=fido2', type: 'encyclopedia' }
  ],
  webauthn: [
    { title: 'FIDO2 Lab', path: '/playground/fido2', type: 'playground', desc: 'WebAuthn key emulator' },
    { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Deconstructs authenticatorData' }
  ],
  scim: [
    { title: 'SCIM Lab', path: '/playground/scim', type: 'playground', desc: 'Visual SCIM sync pipeline' },
    { title: 'SCIM Payload Validator', path: '/tools/scim-payload-validator', type: 'tool', desc: 'Validates JSON payloads' },
    { title: 'SCIM Diff Tool', path: '/tools/scim-diff', type: 'tool', desc: 'Side-by-side comparison engine' },
    { title: 'SCIM Provisioning API', path: '/references?ref=scim-server-payload', type: 'tool', desc: 'SCIM 2.0 implementation' }
  ],
  opa: [
    { title: 'OPA Playground', path: '/playground/opa', type: 'playground', desc: 'Rego authorization rules' },
    { title: 'Policy Evaluator', path: '/tools/policy-evaluator', type: 'tool', desc: 'Dynamic JSON ABAC/RBAC' },
    { title: 'OPA + Rego Policies', path: '/references?ref=opa-rego-authorization', type: 'tool', desc: 'Cloud Native ABAC implementation' }
  ],
  xacml: [
    { title: 'XACML Policy Engine', path: '/playground/xacml', type: 'playground', desc: 'Combining-algorithm decision engine' }
  ],
  abac: [
    { title: 'Access Control Lab', path: '/playground/access', type: 'playground', desc: 'Dynamic ABAC/RBAC engine' },
    { title: 'Policy Evaluator', path: '/tools/policy-evaluator', type: 'tool', desc: 'Dynamic JSON ABAC/RBAC' }
  ],
  rbac: [
    { title: 'Access Control Lab', path: '/playground/access', type: 'playground', desc: 'Dynamic ABAC/RBAC engine' },
    { title: 'Policy Evaluator', path: '/tools/policy-evaluator', type: 'tool', desc: 'Dynamic JSON ABAC/RBAC' }
  ],
  zero_trust: [
    { title: 'ZTA Planner', path: '/playground/zta', type: 'playground', desc: 'NIST SP 800-207 controller' },
    { title: 'Device Trust', path: '/playground/device-trust', type: 'playground', desc: 'Endpoint posture attestation' },
    { title: 'Conditional Access', path: '/playground/conditional-access', type: 'playground', desc: 'Policy evaluations' }
  ],
  ldap: [
    { title: 'LDAP Tree Simulator', path: '/playground/ldap', type: 'playground', desc: 'AD directory tree simulator' },
    { title: 'LDAP Filter Builder', path: '/tools/ldap-filter-builder', type: 'tool', desc: 'Visual RFC 4515 composer' }
  ],
  kerberos: [
    { title: 'Kerberos Tickets Lab', path: '/playground/kerberos', type: 'lab', desc: 'AS/TGS ticket exchange & Golden/Silver ticket exploits' },
    { title: 'AD GPO Simulator', path: '/playground/gpo-simulator', type: 'playground', desc: 'Password/lockout policy editor' },
    { title: 'Kerberos', path: '/encyclopedia?term=kerberos', type: 'encyclopedia' }
  ],
  pki: [
    { title: 'Cert Chain Validator', path: '/playground/cert-chain', type: 'playground', desc: 'Map of Certificate Authorities' },
    { title: 'CSR Generator', path: '/tools/csr-generator', type: 'tool', desc: 'PKCS#10 Certificate Signing Requests' }
  ],
  mtls: [
    { title: 'Cert Chain & mTLS Validator', path: '/playground/cert-chain', type: 'playground', desc: 'CRL/OCSP revocation & mTLS handshakes' },
    { title: 'Device Trust', path: '/playground/device-trust', type: 'playground', desc: 'Client certificate posture attestation' },
    { title: 'mTLS', path: '/encyclopedia?term=mtls', type: 'encyclopedia' }
  ],
  spiffe: [
    { title: 'Workload Mesh (SPIFFE/SPIRE)', path: '/playground/workload-mesh', type: 'playground', desc: 'X.509 SVID microservice attestations' },
    { title: 'SPIFFE/SPIRE', path: '/encyclopedia?term=spiffe_spire', type: 'encyclopedia' }
  ],
  mfa: [
    { title: 'TOTP Generator & Verifier', path: '/tools/totp-generator', type: 'tool', desc: 'RFC 6238 TOTP codes' },
    { title: 'ITDR Lab', path: '/playground/itdr', type: 'playground', desc: 'Brute-force/push fatigue detection' },
    { title: 'MFA', path: '/encyclopedia?term=mfa', type: 'encyclopedia' }
  ],
  totp: [
    { title: 'TOTP Generator & Verifier', path: '/tools/totp-generator', type: 'tool', desc: 'Live RFC 6238 codes with countdown ring' }
  ],
  dpop: [
    { title: 'Session Hijacking Lab', path: '/playground/session-hijacking', type: 'lab', desc: 'DPoP, IP-binding & CAEP token defenses' },
    { title: 'DPoP', path: '/encyclopedia?term=dpop', type: 'encyclopedia' }
  ],
  caep: [
    { title: 'CAEP Continuous Access Evaluation Lab', path: '/playground/caep', type: 'playground', desc: 'Shared Signals Framework SET events' },
    { title: 'CAEP', path: '/encyclopedia?term=caep', type: 'encyclopedia' }
  ],
  gnap: [
    { title: 'GNAP Grant Negotiation Visualizer', path: '/playground/gnap', type: 'playground', desc: 'RFC 9635 grant negotiation timeline' }
  ],
  fapi: [
    { title: 'Financial-Grade API Pattern', path: '/patterns?pattern=banking', type: 'architecture', desc: 'FAPI mTLS & sender-constrained tokens' }
  ],
  pam: [
    { title: 'PAM Vaulting & JIT Elevation Lab', path: '/playground/pam-vaulting', type: 'lab', desc: 'Vault checkout, JIT elevation, session recording' },
    { title: 'PAM', path: '/encyclopedia?term=pam', type: 'encyclopedia' }
  ],
  iga: [
    { title: 'Access Certification Campaign Simulator', path: '/playground/access-certification', type: 'lab', desc: 'Access reviews & Separation-of-Duties' },
    { title: 'IGA', path: '/encyclopedia?term=iga', type: 'encyclopedia' }
  ],
  vault: [
    { title: 'Ansible Vault Encryptor/Decryptor', path: '/tools/ansible-vault', type: 'tool', desc: 'AES-256 secrets encryption' },
    { title: 'SOPS GitOps Secrets Simulator', path: '/tools/sops-simulator', type: 'tool', desc: 'Selective secret encryption' },
    { title: 'PAM Vaulting Lab', path: '/playground/pam-vaulting', type: 'lab', desc: 'Credential vaulting & rotation' }
  ],
  hsm: [
    { title: 'Hardware Key Ring & HSM Emulator', path: '/tools/key-ring', type: 'tool', desc: 'Simulated hardware-backed key storage' }
  ],
  zkp: [
    { title: 'Zero-Knowledge Proof Wallet', path: '/playground/zkp-wallet', type: 'playground', desc: 'Age-verification without exposing birthdate' },
    { title: 'ZKP', path: '/encyclopedia?term=zkp', type: 'encyclopedia' }
  ],
  did: [
    { title: 'Verifiable Credentials & DID Lab', path: '/playground/vc-did', type: 'playground', desc: 'Issuer/Holder/Verifier Ed25519 flows' },
    { title: 'DID', path: '/encyclopedia?term=did', type: 'encyclopedia' }
  ],
  hibp: [
    { title: 'Credential Stuffing Defense Lab', path: '/playground/credential-stuffing', type: 'lab', desc: 'Breached-password detection & lockout defenses' }
  ],
  step_up: [
    { title: 'Magic Link & Step-Up Auth Lab', path: '/playground/magic-link-stepup', type: 'lab', desc: 'Forced step-up to WebAuthn/OTP' }
  ],
  risk_engine: [
    { title: 'Adaptive Risk-Based Authentication Engine', path: '/playground/risk-engine', type: 'lab', desc: 'Impossible travel & device reputation scoring' }
  ],
  gdpr: [
    { title: 'GDPR Cheat Sheet', path: '/cheat-sheets?sheet=gdpr', type: 'architecture', desc: 'Data protection compliance checklist' },
    { title: 'GDPR Compliance Deadlines', path: '/standards?view=deadlines', type: 'architecture' }
  ],
  hipaa: [
    { title: 'HIPAA Cheat Sheet', path: '/cheat-sheets?sheet=hipaa', type: 'architecture', desc: 'Healthcare compliance checklist' }
  ],
  pci: [
    { title: 'PCI-DSS Cheat Sheet', path: '/cheat-sheets?sheet=pci_dss', type: 'architecture', desc: 'Payment card industry checklist' }
  ],
  soc2: [
    { title: 'SOC 2 Type II Cheat Sheet', path: '/cheat-sheets?sheet=soc2', type: 'architecture', desc: 'Trust services criteria checklist' }
  ],
  fedramp: [
    { title: 'FedRAMP High Cheat Sheet', path: '/cheat-sheets?sheet=fedramp_high', type: 'architecture', desc: 'US federal cloud authorization checklist' }
  ],
  sso: [
    { title: 'Identity Broker & Federation Sandbox', path: '/playground/identity-broker', type: 'playground', desc: 'SSO federation & SAML-to-OIDC translation' },
    { title: 'SSO', path: '/encyclopedia?term=sso', type: 'encyclopedia' }
  ],
  thales: [
    { title: 'Thales Platform Ecosystem', path: '/vendor?v=thales', type: 'vendor', desc: 'Sovereign CIAM & SafeNet Trusted Access' },
    { title: 'Identity Summit', path: '/vendor?v=thales', type: 'vendor', desc: 'Thales B2B & CIAM webinar sessions' }
  ],
  onewelcome: [
    { title: 'Thales OneWelcome Platform', path: '/vendor?v=thales', type: 'vendor', desc: 'Europe’s leading Customer & Partner CIAM platform' },
    { title: 'OneWelcome Case Study', path: '/case-studies', type: 'vendor', desc: 'Delegated consent & retail banking CIAM case study' }
  ],
  sta: [
    { title: 'SafeNet Trusted Access (STA)', path: '/vendor?v=thales', type: 'vendor', desc: 'Military-grade adaptive MFA and SSO policy engine' },
    { title: 'Zero Trust (ZTA) Planner', path: '/playground/zta', type: 'playground', desc: 'STA adaptive compliance checks mapping' }
  ],
  idcloud: [
    { title: 'Thales IdCloud', path: '/vendor?v=thales', type: 'vendor', desc: 'Sovereign Digital Banking & Passport Verification' }
  ]
}

// 2. COMPARISON ENGINE DATA
export const COMPARISONS: ComparisonData[] = [
  {
    id: 'oauth_vs_oidc',
    title: 'OAuth 2.0 vs OpenID Connect',
    entityA: 'OAuth 2.0',
    entityB: 'OpenID Connect (OIDC)',
    summary: 'OAuth 2.0 is an authorization framework designed to grant third-party applications limited access to HTTP services. OpenID Connect is an identity layer built on top of the OAuth 2.0 protocol, allowing clients to verify the identity of the end-user.',
    table: [
      { feature: 'Primary Purpose', a: 'Authorization (Delegated Access)', b: 'Authentication (Identity Verification)' },
      { feature: 'Token Type', a: 'Access Token (Opaque or JWT)', b: 'ID Token (Strictly JWT)' },
      { feature: 'Standardized Profiles', a: 'No (API specific)', b: 'Yes (UserInfo endpoint, standard claims)' },
      { feature: 'Typical Analogy', a: 'A hotel keycard (grants access to a room)', b: 'A passport (proves who you are)' }
    ],
    useCasesA: ['Granting an app access to a users calendar', 'Server-to-Server API access', 'Microservices communication'],
    useCasesB: ['Logging into a web application', 'SSO across corporate portals', 'Mobile app user authentication']
  },
  {
    id: 'saml_vs_oauth',
    title: 'SAML 2.0 vs OAuth 2.0',
    entityA: 'SAML 2.0',
    entityB: 'OAuth 2.0',
    summary: 'SAML is an older, XML-based standard primarily used for enterprise SSO (workforce). OAuth 2.0 is a modern, lighter JSON/HTTP-based framework used for delegated authorization, often paired with OIDC for authentication.',
    table: [
      { feature: 'Data Format', a: 'XML Assertions', b: 'JSON / HTTP' },
      { feature: 'Primary Use Case', a: 'Enterprise Single Sign-On (B2E)', b: 'Delegated Authorization / APIs' },
      { feature: 'Cryptography', a: 'XML Digital Signatures (Heavy)', b: 'JSON Web Signatures (Lightweight)' },
      { feature: 'Client Types', a: 'Server-side web apps', b: 'SPAs, Mobile Apps, IoT, Servers' }
    ],
    useCasesA: ['Legacy corporate portals', 'Government identity integrations', 'Active Directory Federation Services (ADFS)'],
    useCasesB: ['Modern Single Page Apps (React/Angular)', 'Mobile applications', 'RESTful API security']
  },
  {
    id: 'saml_vs_oidc',
    title: 'SAML 2.0 vs OpenID Connect',
    entityA: 'SAML 2.0',
    entityB: 'OpenID Connect (OIDC)',
    summary: 'Both federate identity across domains, but SAML uses heavy XML assertions over SOAP/POST bindings while OIDC layers a lightweight JSON identity token on top of OAuth 2.0, making it far friendlier to mobile and single-page apps.',
    table: [
      { feature: 'Assertion Format', a: 'XML (signed SAML Assertion)', b: 'JSON (signed ID Token / JWT)' },
      { feature: 'Mobile/SPA Friendliness', a: 'Poor (heavyweight, browser-redirect centric)', b: 'Excellent (native SDK support)' },
      { feature: 'Discovery', a: 'Manual metadata XML exchange', b: 'Automated `.well-known/openid-configuration`' },
      { feature: 'Session Logout', a: 'SAML Single Logout (SLO), complex to implement', b: 'RP-Initiated Logout / Back-Channel Logout' }
    ],
    useCasesA: ['Legacy enterprise workforce portals', 'Government/education federations (e.g. Shibboleth)'],
    useCasesB: ['New consumer & workforce apps', 'Mobile-first SSO', 'API-driven microservice ecosystems']
  },
  {
    id: 'rbac_vs_abac',
    title: 'RBAC vs ABAC',
    entityA: 'RBAC (Role-Based)',
    entityB: 'ABAC (Attribute-Based)',
    summary: 'RBAC grants access based on static roles assigned to users. ABAC dynamically evaluates attributes of the user, resource, and environment to make fine-grained access decisions.',
    table: [
      { feature: 'Access Decision', a: 'User Roles (e.g., "Admin", "User")', b: 'Attributes (e.g., User Dept, Device Health, Time)' },
      { feature: 'Granularity', a: 'Coarse-grained (Broad access)', b: 'Fine-grained (Highly specific)' },
      { feature: 'Complexity', a: 'Low (Easy to set up initially)', b: 'High (Requires policy engine like OPA)' },
      { feature: 'Role Explosion', a: 'High risk (Too many roles to manage)', b: 'None (Rules apply dynamically)' }
    ],
    useCasesA: ['Simple internal tools', 'Small teams', 'Legacy monolithic applications'],
    useCasesB: ['Zero Trust architectures', 'Multi-tenant B2B SaaS', 'Highly regulated environments (Finance/Healthcare)']
  },
  {
    id: 'opa_vs_xacml',
    title: 'Open Policy Agent (OPA) vs XACML',
    entityA: 'Open Policy Agent (Rego)',
    entityB: 'XACML 3.0',
    summary: 'OPA is a modern, cloud-native general-purpose policy engine using the Rego query language. XACML is an older, verbose XML-based standard purpose-built for ABAC with formal combining algorithms (deny-overrides, permit-overrides).',
    table: [
      { feature: 'Policy Language', a: 'Rego (Datalog-inspired)', b: 'XACML XML policy schema' },
      { feature: 'Ecosystem Fit', a: 'Kubernetes, cloud-native, sidecars', b: 'Legacy enterprise PDP/PEP deployments' },
      { feature: 'Combining Algorithms', a: 'Custom logic written in Rego', b: 'Formal built-in (deny/permit-overrides, first-applicable)' },
      { feature: 'Interoperability', a: 'JSON input, REST API', b: 'XML request/response (SOAP-era)' }
    ],
    useCasesA: ['Kubernetes admission control', 'Cloud-native microservice authorization'],
    useCasesB: ['Legacy enterprise ABAC deployments', 'Standards-mandated government/financial PDPs']
  },
  {
    id: 'ldap_vs_scim',
    title: 'LDAP vs SCIM 2.0',
    entityA: 'LDAP',
    entityB: 'SCIM 2.0',
    summary: 'LDAP is an older protocol for querying and modifying directory services over TCP. SCIM 2.0 is a modern, REST/JSON-based standard specifically designed to automate the exchange of user identity information across different domains.',
    table: [
      { feature: 'Protocol', a: 'Binary/TCP (Port 389/636)', b: 'REST API over HTTP/HTTPS' },
      { feature: 'Data Format', a: 'ASN.1 / BER', b: 'JSON' },
      { feature: 'Primary Domain', a: 'On-Premises (Inside firewall)', b: 'Cloud & B2B SaaS (Cross-domain)' },
      { feature: 'Cloud Friendly', a: 'No (Requires complex firewalls/VPNs)', b: 'Yes (Standard HTTP endpoints)' }
    ],
    useCasesA: ['On-prem Active Directory', 'Internal network printer authentication', 'Legacy VPNs'],
    useCasesB: ['Provisioning users to AWS/Salesforce', 'Automated cloud onboarding', 'IdP to SP synchronization']
  },
  {
    id: 'jwt_vs_session',
    title: 'JWT vs Session Cookies',
    entityA: 'JSON Web Tokens (JWT)',
    entityB: 'Session Cookies',
    summary: 'JWTs are client-stored, stateless security tokens containing claims that are cryptographically verified by the server. Session Cookies are server-stored, stateful references to an active session in a backend database.',
    table: [
      { feature: 'Storage Location', a: 'Client-side (LocalStorage or cookie)', b: 'Server-side (Memory/DB) + Client Reference' },
      { feature: 'Statelessness', a: 'Yes (No server database lookup needed)', b: 'No (Requires database querying on every request)' },
      { feature: 'Revocation', a: 'Difficult (Requires blacklist/short lifespans)', b: 'Instant (Delete session record on the server)' },
      { feature: 'Size', a: 'Large (Contains payload + signature)', b: 'Very Small (Simple random session ID string)' }
    ],
    useCasesA: ['Stateless Microservices APIs', 'Multi-tenant cloud architectures', 'Mobile application authentication'],
    useCasesB: ['Monolithic web applications', 'High-security financial interfaces (requiring instant logout)', 'Simple administrative portals']
  },
  {
    id: 'jwt_vs_paseto',
    title: 'JWT vs PASETO',
    entityA: 'JSON Web Tokens (JWT)',
    entityB: 'PASETO',
    summary: 'JWT is the ubiquitous but famously misuse-prone token format (algorithm confusion, "none" bypass). PASETO ("Platform-Agnostic Security Tokens") was designed specifically to eliminate JWT\'s footguns by removing algorithm negotiation entirely.',
    table: [
      { feature: 'Algorithm Agility', a: 'Header declares algorithm (misuse-prone)', b: 'Fixed per-version algorithm suite (no negotiation)' },
      { feature: '"none" Algorithm Risk', a: 'Real-world exploited vulnerability class', b: 'Not possible by design' },
      { feature: 'Adoption', a: 'Universal (every major IdP & library)', b: 'Niche (security-focused Go/Rust/Node projects)' },
      { feature: 'Format', a: 'Base64URL header.payload.signature', b: 'Versioned purpose string + payload + footer' }
    ],
    useCasesA: ['Ubiquitous API/SSO tooling', 'Interop with existing IdPs/JWKS ecosystems'],
    useCasesB: ['Greenfield systems prioritizing cryptographic misuse-resistance', 'Security-critical services avoiding JWT CVEs']
  },
  {
    id: 'passkeys_vs_passwords',
    title: 'Passkeys vs Traditional Passwords',
    entityA: 'Passkeys (FIDO2/WebAuthn)',
    entityB: 'Traditional Passwords',
    summary: 'Passkeys are cryptographic keys stored on a users hardware device, leveraging asymmetric public-key cryptography to authenticate. Passwords are shared secrets that the user must memorize and type, which are sent to the server for verification.',
    table: [
      { feature: 'Cryptography', a: 'Asymmetric (Public/Private keys - ES256)', b: 'Symmetric (Shared secret hash match - bcrypt/argon2)' },
      { feature: 'Phishing Resistance', a: 'Phishing-resistant (Tied strictly to origin domain)', b: 'Highly vulnerable to credential harvesting/spoof sites' },
      { feature: 'User Experience', a: 'No typing needed (Touch ID, Face ID, local PIN)', b: 'Requires memorization, character complexity rules' },
      { feature: 'Credential Stuffing', a: 'Impossible (No shared secret can be leaked)', b: 'Extremely high risk if server database is breached' }
    ],
    useCasesA: ['Phishing-resistant modern CIAM systems', 'Zero-friction consumer onboardings', 'High-security administrative logins'],
    useCasesB: ['Legacy system compatibility', 'Simple hobbyist setups', 'Environments without biometric sensors/TPMs']
  },
  {
    id: 'webauthn_vs_totp',
    title: 'WebAuthn/Passkeys vs TOTP',
    entityA: 'WebAuthn / Passkeys',
    entityB: 'TOTP (Authenticator Apps)',
    summary: 'WebAuthn uses hardware-bound asymmetric keys verified via a device biometric or PIN. TOTP is a shared-secret, time-based one-time code that the user reads and manually types — still phishable since the code itself can be relayed.',
    table: [
      { feature: 'Phishing Resistance', a: 'Yes — origin-bound, cannot be relayed', b: 'No — a phished code can be replayed by an attacker in real time' },
      { feature: 'Setup', a: 'Platform/biometric prompt, no shared secret', b: 'QR code scan sharing a symmetric seed' },
      { feature: 'Offline Support', a: 'Yes (local hardware attestation)', b: 'Yes (30s rolling code, RFC 6238)' },
      { feature: 'Recovery Complexity', a: 'Requires backup passkey/device enrollment', b: 'Simple backup codes' }
    ],
    useCasesA: ['Modern passwordless CIAM', 'High-assurance admin consoles'],
    useCasesB: ['Legacy MFA rollouts', 'Low-cost second factor for internal tools']
  },
  {
    id: 'pam_vs_iga',
    title: 'PAM vs IGA',
    entityA: 'Privileged Access Management (PAM)',
    entityB: 'Identity Governance & Administration (IGA)',
    summary: 'PAM focuses on securing, vaulting, and time-boxing access to privileged/admin accounts in real time. IGA focuses on the lifecycle governance of *all* identities — birthright provisioning, periodic access reviews, and Separation-of-Duties policy enforcement.',
    table: [
      { feature: 'Primary Focus', a: 'Just-in-time elevation of high-risk credentials', b: 'Lifecycle governance & periodic access certification' },
      { feature: 'Typical User Scope', a: 'Admins, service accounts, break-glass credentials', b: 'Every employee/contractor identity' },
      { feature: 'Key Control', a: 'Credential vaulting, session recording, rotation', b: 'Access reviews, SoD conflict detection, attestation' },
      { feature: 'Compliance Driver', a: 'SOC 2, PCI-DSS privileged account controls', b: 'SOX, ISO 27001 access recertification mandates' }
    ],
    useCasesA: ['Securing root/domain-admin credentials', 'Vendor/contractor break-glass access'],
    useCasesB: ['Quarterly manager access reviews', 'Joiner-mover-leaver automation', 'SoD conflict audits']
  },
  {
    id: 'gnap_vs_oauth',
    title: 'GNAP vs OAuth 2.0',
    entityA: 'GNAP (RFC 9635)',
    entityB: 'OAuth 2.0',
    summary: 'GNAP is a from-scratch redesign of delegated authorization intended to fix OAuth 2.0\'s accumulated complexity — unifying multiple grant types into one negotiation model and building in native support for rich authorization requests and interactive/polling flows.',
    table: [
      { feature: 'Grant Model', a: 'Single unified grant-request negotiation', b: 'Multiple separate grant types (auth code, client creds, etc.)' },
      { feature: 'Client Instance Identity', a: 'First-class, key-bound client instances', b: 'Client ID/secret, often static' },
      { feature: 'Token Binding', a: 'Sender-constrained by default', b: 'Bearer by default (DPoP/mTLS optional add-ons)' },
      { feature: 'Adoption', a: 'Emerging, limited production use', b: 'Ubiquitous industry standard' }
    ],
    useCasesA: ['Greenfield APIs wanting sender-constrained tokens by default', 'Simplifying multi-grant-type complexity'],
    useCasesB: ['Any existing IdP/API ecosystem', 'Interop with established SDKs and libraries']
  },
  {
    id: 'spiffe_vs_apikeys',
    title: 'SPIFFE/SPIRE vs Static API Keys',
    entityA: 'SPIFFE/SPIRE (Workload Identity)',
    entityB: 'Static API Keys',
    summary: 'SPIFFE issues short-lived, automatically rotated cryptographic identities (SVIDs) to workloads based on attested platform metadata. Static API keys are long-lived shared secrets manually distributed and rarely rotated.',
    table: [
      { feature: 'Credential Lifetime', a: 'Minutes to hours, auto-rotated', b: 'Months to years, manually rotated (if ever)' },
      { feature: 'Issuance', a: 'Automatic, based on platform attestation (no human)', b: 'Manual generation & distribution' },
      { feature: 'Leak Blast Radius', a: 'Small — key expires quickly, scoped to workload identity', b: 'Large — valid until manually revoked' },
      { feature: 'mTLS Support', a: 'Native (X.509 SVIDs)', b: 'Not applicable' }
    ],
    useCasesA: ['Kubernetes/mesh service-to-service auth', 'Multi-cloud workload identity federation'],
    useCasesB: ['Simple internal scripts', 'Legacy systems without a workload identity platform']
  },
  {
    id: 'vault_vs_kms',
    title: 'HashiCorp Vault vs Cloud KMS',
    entityA: 'HashiCorp Vault',
    entityB: 'Cloud KMS (AWS/Azure/GCP)',
    summary: 'Vault is a platform-agnostic secrets manager supporting dynamic secrets, PKI issuance, and pluggable auth methods across any cloud. Cloud KMS is a managed, cloud-native key management service tightly integrated with its own provider\'s IAM and encryption services.',
    table: [
      { feature: 'Portability', a: 'Multi-cloud, self-hosted or HCP-managed', b: 'Locked to a single cloud provider' },
      { feature: 'Dynamic Secrets', a: 'Yes (databases, cloud creds, PKI, SSH)', b: 'No — primarily static key management/encryption' },
      { feature: 'Operational Overhead', a: 'Higher (cluster to run/unseal, unless HCP)', b: 'Low (fully managed)' },
      { feature: 'Auth Methods', a: 'Pluggable (AppRole, K8s, LDAP, OIDC, AWS IAM)', b: 'Native IAM roles/policies of that cloud' }
    ],
    useCasesA: ['Multi-cloud/hybrid secrets management', 'Dynamic, short-lived database credentials'],
    useCasesB: ['Single-cloud envelope encryption', 'Native cloud KMS-backed disk/object encryption']
  },
  {
    id: 'did_vs_federated',
    title: 'Decentralized Identifiers (DID) vs Federated Identity',
    entityA: 'DIDs / Verifiable Credentials',
    entityB: 'Federated Identity (OIDC/SAML)',
    summary: 'DIDs let a user hold and present cryptographically verifiable credentials directly from a wallet with no phone-home to an issuer at verification time. Federated identity requires the Relying Party to redirect back to a centralized IdP for every login.',
    table: [
      { feature: 'Trust Model', a: 'Issuer signs once; verifier checks signature offline', b: 'Relying party trusts IdP live at login time' },
      { feature: 'IdP Availability Dependency', a: 'None at verification time', b: 'Full — IdP outage blocks all logins' },
      { feature: 'User Control', a: 'User holds credentials in their own wallet', b: 'IdP holds and controls the identity record' },
      { feature: 'Standards', a: 'W3C DID Core, Verifiable Credentials Data Model', b: 'OpenID Connect, SAML 2.0' }
    ],
    useCasesA: ['Digital driver licenses / mDL', 'Cross-border credential portability', 'Self-sovereign identity wallets'],
    useCasesB: ['Enterprise workforce SSO', 'Consumer social login']
  },
  {
    id: 'basicauth_vs_oauth',
    title: 'Basic Auth vs OAuth 2.0',
    entityA: 'HTTP Basic Authentication',
    entityB: 'OAuth 2.0',
    summary: 'Basic Auth sends a base64-encoded (not encrypted) username:password pair on every request. OAuth 2.0 issues short-lived, scoped, revocable tokens so the underlying password is never shared with the resource being accessed.',
    table: [
      { feature: 'Credential Exposure', a: 'Raw password sent on every single request', b: 'Password never leaves the authorization server' },
      { feature: 'Scope Limiting', a: 'None — full account access', b: 'Yes — fine-grained scopes per token' },
      { feature: 'Revocation', a: 'Must change the password (breaks all clients)', b: 'Revoke just that one token/refresh token' },
      { feature: 'Delegated Access', a: 'Not possible', b: 'Core design goal' }
    ],
    useCasesA: ['Quick internal scripts/curl testing', 'Legacy systems with no OAuth support'],
    useCasesB: ['Any third-party or delegated API access', 'Modern public/partner APIs']
  },
  {
    id: 'kerberos_vs_oauth',
    title: 'Kerberos vs OAuth 2.0',
    entityA: 'Kerberos',
    entityB: 'OAuth 2.0',
    summary: 'Kerberos is a mutual-authentication ticketing protocol built for trusted internal networks (Windows domains), relying on a central KDC and symmetric cryptography. OAuth 2.0 is designed for the open internet, using asymmetric/HMAC-signed bearer tokens over HTTPS.',
    table: [
      { feature: 'Trust Boundary', a: 'Single trusted internal network/domain', b: 'Open internet, cross-domain by design' },
      { feature: 'Cryptography', a: 'Symmetric keys shared with the KDC', b: 'HMAC or asymmetric JWS-signed tokens' },
      { feature: 'Transport', a: 'Custom binary protocol (UDP/TCP 88)', b: 'HTTPS / REST' },
      { feature: 'Classic Attack', a: 'Golden/Silver Ticket forgery', b: 'Token theft / replay, PKCE-code interception' }
    ],
    useCasesA: ['Windows Active Directory domain authentication', 'Legacy enterprise SSO (via SPNEGO)'],
    useCasesB: ['Public and partner web/mobile APIs', 'Cloud-native microservice authorization']
  },
  {
    id: 'opa_vs_cedar',
    title: 'Open Policy Agent (OPA) vs AWS Cedar',
    entityA: 'Open Policy Agent (OPA / Rego)',
    entityB: 'AWS Cedar',
    summary: 'OPA (Rego) is an open-source, general-purpose policy engine capable of evaluating any JSON input against logic trees. AWS Cedar is an authorization language specialized for Attribute-Based and Role-Based Access Control, optimized for speed and automated reasoning.',
    table: [
      { feature: 'Language', a: 'Rego (Datalog-inspired query language)', b: 'Cedar (Custom language designed for authorization)' },
      { feature: 'Primary Domain', a: 'Kubernetes, Cloud-Native, General Gateways', b: 'Application-level fine-grained AuthZ, Amazon Verified Permissions' },
      { feature: 'Analyzability', a: 'Decidable with bounds (complex rules)', b: 'Highly analyzable (Formal verification/automated reasoning)' },
      { feature: 'Performance', a: 'Depends on rules (in-memory lookup)', b: 'Extremely fast, constant-time evaluations' }
    ],
    useCasesA: ['Kubernetes admission control', 'Terraform security plan auditing', 'General HTTP microservices gatekeeping'],
    useCasesB: ['Fine-grained SaaS resource authorization', 'AWS Verified Permissions integrations', 'Decidable, high-frequency app-logic access checks']
  },
  {
    id: 'sta_vs_entra',
    title: 'Thales SafeNet Trusted Access vs Microsoft Entra ID',
    entityA: 'SafeNet Trusted Access (STA)',
    entityB: 'Microsoft Entra ID',
    summary: 'SafeNet Trusted Access is a specialized access management service combining adaptive authentication with exceptionally broad multi-factor token support (hardware, software, push, smartcards). Microsoft Entra ID is a complete cloud directory and workforce identity infrastructure tightly integrated with the Azure and Office 365 ecosystems.',
    table: [
      { feature: 'Core Identity Directory', a: 'Synchronized via local directory agents (AD, LDAP)', b: 'Native cloud-first directory (with hybrid sync)' },
      { feature: 'MFA Tokens Support', a: 'Highly broad (mobile push, SMS, software/hardware OTP, grids)', b: 'Focused (Authenticator App, SMS, hardware FIDO2 keys)' },
      { feature: 'Cryptographic Signing', a: 'Military-grade, FIPS 140-2 HSM-backed', b: 'Software-backed cloud tenant signing keys' },
      { feature: 'Sovereignty Options', a: 'Excellent (isolated local data clouds across Europe)', b: 'Moderate (bound to global Azure datacenter clusters)' }
    ],
    useCasesA: ['Defense, public sector, and banking mandating physical tokens', 'Securing multi-cloud, non-Azure corporate setups', 'Enforcing compliance across European sovereign clouds'],
    useCasesB: ['Tightly bound Office 365 & Azure environments', 'Standard enterprise directory services', 'Single cloud workforce directories']
  },
  {
    id: 'onewelcome_vs_okta_ciam',
    title: 'Thales OneWelcome vs Okta CIAM / Auth0',
    entityA: 'Thales OneWelcome',
    entityB: 'Okta Customer Identity (Auth0)',
    summary: 'Thales OneWelcome is Europe’s leading B2B and Customer IAM platform, prioritizing complex user consent, privacy regulations (GDPR), and partner delegated administration. Okta Customer Identity (Auth0) is a developer-first SaaS CIAM platform focusing on frictionless social logins, extensibility, and rapid SDK integrations.',
    table: [
      { feature: 'Primary Jurisdiction', a: 'Europe (GDPR-focused sovereign clouds)', b: 'United States (Global SaaS hosting networks)' },
      { feature: 'GDPR Consent Tracking', a: 'Deeply native, granular tracking with cryptographic logs', b: 'Customizable via serverless rules/actions' },
      { feature: 'Delegated B2B Admin', a: 'Outstanding, built-in partner administration consoles', b: 'Requires custom coding or separate enterprise licensing' },
      { feature: 'Developer Onboarding', a: 'Moderate (structured enterprise integrations)', b: 'Excellent (quickstarts, extensive SDK libraries, social hubs)' }
    ],
    useCasesA: ['European digital banking with strict PSD2 KYC requirements', 'B2B/B2B2C partner networks with delegated administration', 'Highly regulated medical and public-sector consumer portals'],
    useCasesB: ['Consumer mobile apps seeking simple social login setups', 'Early-stage SaaS startups needing rapid MVP integrations', 'Global consumer platforms requiring high developer agility']
  }
];

// 3. INTERVIEW PREP DATA
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    domain: 'OAuth/OIDC',
    question: 'An attacker manages to intercept an authorization code in an OAuth 2.0 flow. How can you prevent them from exchanging it for an access token?',
    hint: 'Think about dynamically tying the authorization request to the token request without using a static client secret.',
    answer: 'Implement PKCE (Proof Key for Code Exchange - RFC 7636). The client generates a random `code_verifier` and sends its hash (`code_challenge`) in the initial request. When exchanging the authorization code, the client must send the original `code_verifier`. The authorization server hashes it and verifies it matches the original challenge. An attacker with only the code cannot guess the verifier.',
    rfc: 'RFC 7636'
  },
  {
    id: 'q2',
    domain: 'Zero Trust',
    question: 'How do you enforce Continuous Access Evaluation (CAEP) in a system where JWT access tokens are valid for 1 hour?',
    hint: 'If a token is valid but a security event happens (e.g., device compromised), how does the resource server know?',
    answer: 'Using the Shared Signals Framework (SSF) and CAEP. The Identity Provider pushes asynchronous security events (like "Session Revoked" or "Device Risk Elevated") directly to the Resource Server (API Gateway). The Gateway caches these events and immediately denies access, overriding the local JWT expiration time.',
    rfc: 'RFC 9396'
  },
  {
    id: 'q3',
    domain: 'Cryptography',
    question: 'A developer uses the "none" algorithm in a JWT to bypass signature verification during testing, but leaves it in production. What is this attack called and how do you prevent it?',
    hint: 'The library is blindly trusting the header of the token.',
    answer: 'This is the "Algorithm Confusion / None Algorithm Bypass" attack. To prevent it, the JWT validation library must be hardcoded to strictly enforce an expected list of secure algorithms (e.g., `algorithms: ["RS256"]`) and reject any token presenting `alg: none`, `alg: HS256` (when expecting RS256), or unsupported algorithms.',
    rfc: 'RFC 8725'
  },
  {
    id: 'q4',
    domain: 'Core IAM',
    question: 'What is the primary difference between Authentication (AuthN) and Authorization (AuthZ)? Provide a simple analogy.',
    hint: 'Identity vs Permissions.',
    answer: 'Authentication (AuthN) verifies WHO you are. Authorization (AuthZ) determines WHAT you are allowed to do. Analogy: AuthN is presenting a valid boarding pass at the airport security checkpoint. AuthZ is the gate agent checking if your boarding pass allows you into the First Class Lounge.',
  },
  {
    id: 'q5',
    domain: 'SAML',
    question: 'What is a SAML Signature Wrapping (SSW) attack, and how does a validator defend against it?',
    hint: 'The attacker doesn\'t forge a signature — they exploit how the XML is parsed versus how it is validated.',
    answer: 'SSW abuses the mismatch between the XML node a validator cryptographically verifies and the node the application logic actually reads. An attacker copies a legitimately-signed assertion, wraps it inside a new, unsigned envelope containing forged attributes, and moves the original signed assertion to a sibling location the application ignores. Defenses: validate the signature against the exact node referenced by its own `Reference URI` (not just "a signature exists somewhere in the document"), and reject any document with unexpected/duplicate assertion IDs.',
    rfc: 'RFC 6376 (XML-DSig context)'
  },
  {
    id: 'q6',
    domain: 'PAM',
    question: 'Why is "Just-in-Time" (JIT) privileged access considered more secure than always-on standing admin access?',
    hint: 'Think about the attack window and the blast radius of a compromised credential.',
    answer: 'Standing admin access means a compromised credential is exploitable 24/7. JIT access grants time-boxed, approval-gated elevation only for the duration of a specific task, then automatically revokes it and rotates the credential. This shrinks the attack window from "always" to "minutes," and every elevation event is individually logged/approved, satisfying least-privilege and audit requirements.',
  },
  {
    id: 'q7',
    domain: 'Compliance',
    question: 'Under GDPR, what is the difference between a Data Controller and a Data Processor, and why does it matter for an IAM system logging user access?',
    hint: 'Who decides *why* data is processed vs who just executes the processing.',
    answer: 'The Data Controller determines the purposes and means of processing personal data (e.g., the company running the IAM system). The Data Processor processes data on the controller\'s behalf (e.g., a cloud IdP vendor). This matters for IAM audit logs because the controller is accountable for lawful basis and data subject rights (access/erasure requests), while the processor must only act on the controller\'s documented instructions and support those rights contractually (Art. 28 DPA).',
  },
  {
    id: 'q8',
    domain: 'Directory/Kerberos',
    question: 'What is a "Golden Ticket" attack in Kerberos, and why is it so hard to detect?',
    hint: 'The attacker has already compromised the one account that signs every ticket.',
    answer: 'A Golden Ticket forges a Kerberos Ticket Granting Ticket (TGT) using the stolen KRBTGT account\'s password hash, granting the attacker domain-wide, arbitrary-duration admin access without ever touching a real domain controller after the initial compromise. It\'s hard to detect because the forged ticket is cryptographically valid — the only reliable remediation is rotating the KRBTGT password (twice, due to two-generation key retention) and hunting for anomalous ticket lifetimes/encryption types in logs.',
  },
  {
    id: 'q9',
    domain: 'Cryptography',
    question: 'Why is bcrypt (or Argon2) preferred over SHA-256 for storing passwords, even though SHA-256 is cryptographically "stronger" in terms of collision resistance?',
    hint: 'Speed is the enemy here, not strength.',
    answer: 'SHA-256 is designed to be fast — great for integrity checks, terrible for password storage, since an attacker with a GPU can compute billions of hashes per second to brute-force a leaked hash. bcrypt/Argon2 are deliberately slow, tunable ("work factor") key-derivation functions designed to make brute-forcing computationally expensive, and Argon2 additionally resists GPU/ASIC acceleration via memory-hardness.',
  },
  {
    id: 'q10',
    domain: 'SCIM',
    question: 'An HR system deprovisions an employee, but they still have access to a SaaS app three days later. Where does the SCIM integration likely fail, and how would you diagnose it?',
    hint: 'SCIM sync is usually asynchronous and can silently queue failures.',
    answer: 'Likely causes: the SCIM DELETE/PATCH (deactivate) request returned an HTTP 429 (rate-limited) or 409 (conflict) that wasn\'t retried, the user\'s external ID mapping drifted (so the deprovision targeted the wrong/no resource), or the sync job simply hasn\'t run yet due to a scheduling interval. Diagnose by checking the IdP\'s SCIM sync logs for the specific user\'s external ID, verifying the last successful sync timestamp, and confirming the SP actually deactivated (not just unassigned) the account.',
    rfc: 'RFC 7644'
  },
  {
    id: 'q11',
    domain: 'Zero Trust',
    question: 'How does the NIST SP 800-207 Zero Trust model change the traditional "castle-and-moat" network security assumption?',
    hint: 'What happens to trust once you\'re already inside the firewall?',
    answer: 'Castle-and-moat assumes anything inside the network perimeter is trusted. NIST SP 800-207 assumes breach and enforces per-request authorization: every access request is evaluated by a Policy Decision Point using real-time signals (identity, device posture, location, resource sensitivity) regardless of network location — there is no privileged "inside the firewall" trust zone.',
    rfc: 'NIST SP 800-207'
  },
  {
    id: 'q12',
    domain: 'OAuth/OIDC',
    question: 'Why should a public client (like a Single Page App) never use the OAuth 2.0 Implicit Grant flow today?',
    hint: 'Where does the access token end up, and who else can read it?',
    answer: 'The Implicit Grant returns the access token directly in the URL fragment, exposing it to browser history, referrer leaks, and any malicious script running on the page. It also has no client authentication step. Modern guidance (OAuth 2.1) removes the Implicit Grant entirely in favor of Authorization Code + PKCE, which never exposes the token in the URL and cryptographically binds the token exchange to the original request.',
    rfc: 'RFC 7636 / OAuth 2.1'
  },
  {
    id: 'q13',
    domain: 'PKI',
    question: 'What is Certificate Revocation and why is OCSP generally preferred over CRLs for checking it in real time?',
    hint: 'Think about the size of the revocation list versus a single lookup.',
    answer: 'A CRL (Certificate Revocation List) is a full, periodically-published list of every revoked certificate a client must download and search. OCSP (Online Certificate Status Protocol) lets a client query a responder for the status of one specific certificate in real time, avoiding the download/parse overhead of an ever-growing list — at the cost of a live network dependency (mitigated by OCSP Stapling).',
    rfc: 'RFC 6960'
  },
  {
    id: 'q14',
    domain: 'Compliance',
    question: 'What is Separation of Duties (SoD), and give a concrete IAM example of a SoD conflict.',
    hint: 'No single person should be able to complete an entire sensitive process alone.',
    answer: 'Separation of Duties requires that no single individual holds enough combined access to both perform and approve/conceal a sensitive action, reducing fraud and error risk. Example: a user who can both *create a vendor* in the ERP system and *approve payments* to vendors could create a fake vendor and approve payment to themselves — an IGA access review should flag and prevent that combination of entitlements.',
  },
  {
    id: 'q15',
    domain: 'Core IAM',
    question: 'What does "least privilege" mean in practice, and what is the most common IAM anti-pattern that violates it?',
    hint: 'It\'s not just about roles — it\'s about how long access lasts.',
    answer: 'Least privilege means granting only the minimum access necessary to perform a task, for only as long as needed. The most common violation is "role accumulation" / privilege creep — an employee changes teams over the years but old entitlements are never revoked, so their access silently grows unbounded. Regular access recertification campaigns (IGA) are the standard control against this.',
  },
  {
    id: 'q16',
    domain: 'Directory/Kerberos',
    question: 'What is "Kerberoasting," and why does it specifically target service accounts?',
    hint: 'Any authenticated domain user can request a TGS for any service — what can they do with it offline?',
    answer: 'Kerberoasting abuses the fact that any authenticated domain user can request a Kerberos service ticket (TGS) for any Service Principal Name, which is encrypted with that service account\'s NTLM password hash. The attacker extracts the ticket and brute-forces it offline with no further network interaction. Service accounts are targeted because they\'re often configured with weak, never-rotated passwords and elevated privileges. Mitigation: long random passwords (or gMSA managed accounts) and monitoring for abnormal TGS request volume.',
  }
];

// 4. LEARNING PLANNER DATA
export const LEARNING_TRACKS: LearningTrack[] = [
  {
    level: 'Beginner',
    goal: 'Security Engineer',
    title: 'Foundations of Identity Security',
    description: 'A ground-up approach to understanding how the internet secures users.',
    steps: [
      {
        title: 'Step 1: Understand the Basics',
        desc: 'Read the Beginner Primer to understand the "Digital Bouncer" analogy.',
        resources: [{ title: 'Beginner Primer', path: '/primer', type: 'encyclopedia' }]
      },
      {
        title: 'Step 2: Core Hashing & Passwords',
        desc: 'Understand why passwords alone fail.',
        resources: [
          { title: 'Password Generator & Entropy', path: '/tools/password-generator', type: 'tool' },
          { title: 'SHA256 Hash Tool', path: '/tools/sha256-hash-generator', type: 'tool' }
        ]
      },
      {
        title: 'Step 3: Multi-Factor Authentication',
        desc: 'Learn about TOTP and why it is better than passwords.',
        resources: [{ title: 'TOTP Generator', path: '/tools/totp-generator', type: 'tool' }]
      }
    ]
  },
  {
    level: 'Beginner',
    goal: 'IAM Architect',
    title: 'Foundations of IAM Architecture',
    description: 'Learn the architectural layouts, directories, and compliance guidelines.',
    steps: [
      {
        title: 'Step 1: Directory Tree Hierarchies',
        desc: 'Learn how users, groups, and permissions are mapped in Active Directory and SCIM.',
        resources: [
          { title: 'LDAP Tree Simulator', path: '/playground/ldap', type: 'playground' },
          { title: 'LDAP Filter Builder', path: '/tools/ldap-filter-builder', type: 'tool' }
        ]
      },
      {
        title: 'Step 2: Access Policies',
        desc: 'Evaluate custom ABAC vs RBAC rules client-side.',
        resources: [
          { title: 'Access Control Lab', path: '/playground/access', type: 'playground' },
          { title: 'Policy Evaluator Tool', path: '/tools/policy-evaluator', type: 'tool' }
        ]
      }
    ]
  },
  {
    level: 'Intermediate',
    goal: 'Security Engineer',
    title: 'Applied Identity Hacking & Defense',
    description: 'An active, scenario-based track focused on patching critical web token and assertion flaws.',
    steps: [
      {
        title: 'Step 1: Exploiting and Securing JSON Web Tokens',
        desc: 'Analyze common signature-bypass strategies and cracking constraints.',
        resources: [
          { title: 'JWT Studio', path: '/playground/jwt', type: 'playground' },
          { title: 'JWT Cracker Lab', path: '/playground/jwt-cracker', type: 'lab' }
        ]
      },
      {
        title: 'Step 2: Defensive Token Handshakes',
        desc: 'Configure PKCE code challenges to shield public redirects from interceptors.',
        resources: [
          { title: 'OAuth Attack Lab', path: '/playground/oauth-attack', type: 'lab' },
          { title: 'PKCE Generator Tool', path: '/tools/oauth-pkce-generator', type: 'tool' }
        ]
      }
    ]
  },
  {
    level: 'Intermediate',
    goal: 'IAM Architect',
    title: 'Enterprise Architecture & Federation',
    description: 'Deep dive into standard protocols that run the modern enterprise.',
    steps: [
      {
        title: 'Step 1: Mastering OAuth & OIDC',
        desc: 'Visually map out the industry standard authorization flows.',
        resources: [
          { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground' },
          { title: 'OAuth Builder Tool', path: '/tools/oauth-builder', type: 'tool' }
        ]
      },
      {
        title: 'Step 2: Deconstructing JWTs',
        desc: 'Understand stateless token security and signatures.',
        resources: [
          { title: 'JWT Studio', path: '/playground/jwt', type: 'playground' },
          { title: 'JWT Decoder', path: '/tools/jwt-decoder', type: 'tool' }
        ]
      },
      {
        title: 'Step 3: Reference Implementations',
        desc: 'See how these protocols are implemented in production.',
        resources: [{ title: 'Enterprise References', path: '/references', type: 'architecture' }]
      }
    ]
  },
  {
    level: 'Advanced',
    goal: 'Security Engineer',
    title: 'Session Security & Continuous Threat Detection',
    description: 'Harden long-lived sessions and detect identity attacks as they happen, not after the breach report.',
    steps: [
      {
        title: 'Step 1: Defend Against Token & Cookie Theft',
        desc: 'Model infostealer session hijacking and apply DPoP/CAEP/IP-binding countermeasures.',
        resources: [
          { title: 'Session Hijacking Lab', path: '/playground/session-hijacking', type: 'lab' },
          { title: 'CAEP Continuous Access Evaluation Lab', path: '/playground/caep', type: 'playground' }
        ]
      },
      {
        title: 'Step 2: Detect Brute Force & Push Fatigue',
        desc: 'Monitor SecOps logs and trigger automated lockouts on credential-stuffing and MFA fatigue patterns.',
        resources: [
          { title: 'ITDR SecOps Lab', path: '/playground/itdr', type: 'lab' },
          { title: 'Credential Stuffing Defense Lab', path: '/playground/credential-stuffing', type: 'lab' }
        ]
      },
      {
        title: 'Step 3: Study Real Breaches',
        desc: 'Deconstruct real-world incident post-mortems to internalize root causes and remediations.',
        resources: [{ title: 'Security Bulletins & IR Simulator', path: '/bulletins', type: 'architecture' }]
      }
    ]
  },
  {
    level: 'Advanced',
    goal: 'IAM Architect',
    title: 'Privileged Access & Governance at Scale',
    description: 'Design the controls that protect an enterprise\'s most sensitive credentials and satisfy audit-grade governance mandates.',
    steps: [
      {
        title: 'Step 1: Just-in-Time Privileged Access',
        desc: 'Model vaulting, time-boxed elevation, and automatic credential rotation.',
        resources: [{ title: 'PAM Vaulting & JIT Elevation Lab', path: '/playground/pam-vaulting', type: 'lab' }]
      },
      {
        title: 'Step 2: Access Governance & Reviews',
        desc: 'Run access certification campaigns and flag Separation-of-Duties conflicts.',
        resources: [{ title: 'Access Certification Campaign Simulator', path: '/playground/access-certification', type: 'lab' }]
      },
      {
        title: 'Step 3: Map to Compliance Frameworks',
        desc: 'Translate governance controls into SOC 2, ISO 27001, and NIST 800-63-3 checklist items.',
        resources: [{ title: 'Developer Playbooks & Cheat Sheets', path: '/cheat-sheets', type: 'architecture' }]
      }
    ]
  },
  {
    level: 'Expert',
    goal: 'Security Engineer',
    title: 'Next-Generation Identity Threats',
    description: 'Confront the frontier of identity attacks: AI-driven social engineering, workload identity, and decentralized trust.',
    steps: [
      {
        title: 'Step 1: AI-Driven Identity Attacks',
        desc: 'Simulate voice deepfake social engineering against legacy MFA and evaluate hardware-bound defenses.',
        resources: [{ title: 'AI vs Identity Threat Lab', path: '/playground/ai-threat-lab', type: 'lab' }]
      },
      {
        title: 'Step 2: Zero-Trust Workload Identity',
        desc: 'Secure service-to-service traffic with short-lived, attested SPIFFE/SPIRE credentials instead of static secrets.',
        resources: [{ title: 'Workload Mesh (SPIFFE/SPIRE)', path: '/playground/workload-mesh', type: 'playground' }]
      },
      {
        title: 'Step 3: Decentralized & Ambient Trust',
        desc: 'Explore Zero-Knowledge Proofs and continuous ambient trust decay for the post-password future.',
        resources: [
          { title: 'Zero-Knowledge Proof Wallet', path: '/playground/zkp-wallet', type: 'playground' },
          { title: 'Continuous Ambient Trust Decayer', path: '/playground/ambient-trust', type: 'playground' }
        ]
      }
    ]
  },
  {
    level: 'Expert',
    goal: 'IAM Architect',
    title: 'Enterprise IAM and Workforce Protection with Thales',
    description: 'Learn sovereign identity, adaptive access controls, and visual Customer IAM (CIAM) orchestration.',
    steps: [
      {
        title: 'Step 1: Discover Sovereign CIAM',
        desc: 'Understand GDPR-compliant consent management and delegated administration workflows.',
        resources: [
          { title: 'Thales Platform Directory', path: '/vendor?v=thales', type: 'vendor' },
          { title: 'PSD2 Banking Case Study', path: '/case-studies', type: 'vendor' }
        ]
      },
      {
        title: 'Step 2: Adaptive Access Control & MFA',
        desc: 'Model risk-based authentication rules checking network geolocations and device postures.',
        resources: [
          { title: 'Zero Trust (ZTA) Planner', path: '/playground/zta', type: 'playground' },
          { title: 'Device Trust & Posture Attestation Lab', path: '/playground/device-trust', type: 'playground' }
        ]
      }
    ]
  }
];
