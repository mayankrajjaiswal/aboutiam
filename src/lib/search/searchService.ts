import MiniSearch from 'minisearch'
import { TOOLS } from '../../data/toolsRegistry'
import type { ToolMeta } from '../../data/toolsRegistry'
import { ENCYCLOPEDIA_TERMS } from '../../data/encyclopediaData'
import type { Term } from '../../pages/Encyclopedia'
import { VENDOR_CATALOG } from '../../data/vendorCatalog'
import type { VendorType } from '../../data/vendorCatalog'
import { COMPLIANCE_DEADLINES } from '../../data/complianceDeadlines'
import { STANDARDS } from '../../data/standardsData'
import { CASE_STUDIES } from '../../data/caseStudiesData'
import { ARCHITECTURES } from '../../data/architectureData'
import { PROJECTS as REFERENCE_PROJECTS } from '../../data/referenceProjects'
import { EXPLORE_PRODUCTS } from '../../data/exploreData'
import { CERTIFICATIONS } from '../../data/certificationsData'
import { CVE_DATABASE, RFC_DATABASE, rfcSlug } from '../../data/researchData'
import { ROUTE_META } from '../../routeMeta'

export interface SearchItem {
  id: string
  title: string
  fullName?: string
  description: string
  category: string
  link: string
  keywords: string[]
}

// Statically define the 27 simulators to avoid file parsing overhead
const SIMULATORS_LIST = [
  { id: 'jwt-studio', title: 'JWT Studio', desc: 'JSON Web Token simulator running HS256/RS256 signatures & "none" algorithm confused bypass exploits.', link: '/playground/jwt', kw: ['jwt', 'json web token', 'exploit', 'sign', 'verify'] },
  { id: 'oauth-flow', title: 'OIDC / OAuth 2.0 Flow Visualizer', desc: 'Interactive step-by-step OIDC authentication flowchart, animating authorization codes, ID tokens, and backchannel CURL handshakes.', link: '/playground/oauth', kw: ['oidc', 'oauth', 'flow', 'handshake', 'id token', 'code flow'] },
  { id: 'saml-workbench', title: 'SAML Assertion Workbench', desc: 'XML Assertion workbench. Decode SAML payloads and simulate Signature Wrapping (SSW) hacker attacks.', link: '/playground/saml', kw: ['saml', 'xml', 'ssw', 'signature wrapping', 'assertion'] },
  { id: 'fido2-lab', title: 'WebAuthn / FIDO2 Passkey Emulator', desc: 'Biometric Passkey TPM enclave emulator. Parse CBOR public keys and clientDataJSON byte-offset signatures.', link: '/playground/fido2', kw: ['fido2', 'webauthn', 'passkey', 'biometric', 'enclave', 'tpm', 'cbor'] },
  { id: 'access-lab', title: 'Dynamic ABAC & RBAC Access Lab', desc: 'Interactive policy evaluator testing departments, IP addresses, geolocations, and resource attributes dynamically.', link: '/playground/access', kw: ['abac', 'rbac', 'policy', 'pdp', 'authorization'] },
  { id: 'ldap-tree', title: 'LDAP Tree Simulator', desc: 'Active Directory domain trees simulator. Perform dry-run LDAP queries and filter trees.', link: '/playground/ldap', kw: ['ldap', 'ad', 'active directory', 'query', 'filter'] },
  { id: 'zta-planner', title: 'Zero Trust risk Controller (NIST SP 800-207)', desc: 'Zero Trust architectural planner based on NIST guidelines. Calculate network, posture, and biometric scores.', link: '/playground/zta', kw: ['zta', 'zero trust', 'nist', 'nist sp 800-207', 'score', 'posture'] },
  { id: 'scim-lab', title: 'SCIM 2.0 Syncer Lab', desc: 'Visual Identity Provider (IdP) to SaaS Service Provider (SP) automatic sync pipeline.', link: '/playground/scim', kw: ['scim', 'sync', 'provisioning', 'reconciliation'] },
  { id: 'oauth-attack', title: 'OAuth Attack & Defend Lab', desc: 'Visual playground mapping PKCE bypasses, wildcard redirect vulnerabilities, and CSRF token omission exploits.', link: '/playground/oauth-attack', kw: ['oauth', 'attack', 'pkce', 'csrf', 'exploit', 'bypass'] },
  { id: 'kerberos-lab', title: 'Active Directory Kerberos Lab', desc: 'Simulate ticket exchanges (AS/TGS) and exploit Golden/Silver Ticket domain controller takeover attacks.', link: '/playground/kerberos', kw: ['kerberos', 'ad', 'ticket', 'golden ticket', 'silver ticket', 'active directory'] },
  { id: 'ctf-arena', title: 'Identity CTF Arena', desc: 'Gamified identity hacking challenges including JWT none alg bypasses, SAML wrapped assertions, and LDAP injection vulnerability triggers.', link: '/playground/ctf', kw: ['ctf', 'capture the flag', 'hack', 'challenge', 'game'] },
  { id: 'identity-architect', title: 'Identity Architect AI Wizard', desc: 'AI-assisted topology planner. Automatically draft structural sequence flows and dynamic Rego security code policies.', link: '/playground/identity-architect', kw: ['ai', 'architect', 'topology', 'visualizer', 'diagram'] },
  { id: 'jwt-cracker', title: 'JWT Secret Cracker', desc: 'Client-side dictionary cracking simulator. Perform off-line brute force hash cracking on HS256 signatures.', link: '/playground/jwt-cracker', kw: ['jwt', 'crack', 'brute force', 'dictionary', 'hmac', 'secret'] },
  { id: 'cert-chain', title: 'Certificate Chain mTLS Validator', desc: 'Visual hierarchical map of Root, Intermediate, and Leaf CAs. Simulate SSL handshakes and mTLS posture tests.', link: '/playground/cert-chain', kw: ['cert', 'ca', 'mtls', 'ssl', 'tls', 'certificate'] },
  { id: 'gpo-simulator', title: 'AD Group Policy Object (GPO) Simulator', desc: 'Active Directory GPO policy editor. Enforce password complexity rules, lockout parameters, and ticket bounds.', link: '/playground/gpo-simulator', kw: ['gpo', 'ad', 'group policy', 'password', 'active directory'] },
  { id: 'ai-threat-lab', title: 'AI Voice Deepfake & MFA Threat Lab', desc: 'Simulate voice cloned phishing attacks against phone legacy verification and evaluate FIDO2 hardware protection bounds.', link: '/playground/ai-threat-lab', kw: ['ai', 'deepfake', 'biometric', 'phishing', 'voice clone', 'mfa'] },
  { id: 'zkp-wallet', title: 'Zero-Knowledge Proof (ZKP) Age Wallet', desc: 'Mathematical age-verification simulator. Generate cryptographic range proofs without exposing birthdate or identity.', link: '/playground/zkp-wallet', kw: ['zkp', 'zero knowledge', 'wallet', 'did', 'cryptography'] },
  { id: 'ambient-trust', title: 'Biometric Ambient Trust Simulator', desc: 'Continuous authentication simulator. Track biometric signals and decay active token trust bounds in real-time.', link: '/playground/ambient-trust', kw: ['ambient', 'trust', 'biometric', 'continuous', 'telemetry', 'session'] },
  { id: 'workload-mesh', title: 'Workload Mesh SPIFFE/SPIRE Lab', desc: 'Microservice identity manager. Simulate SPIFFE attestations and X.509 SVID credentials across mesh networks.', link: '/playground/workload-mesh', kw: ['spiffe', 'spire', 'mesh', 'workload', 'attestation', 'x509'] },
  { id: 'reference-builder', title: 'Reference Topology Architect', desc: 'Drag-and-drop IAM network architect. Wire up OIDC redirects, SAML handshakes, and SCIM sync animations visually.', link: '/playground/reference-builder', kw: ['topology', 'builder', 'drag and drop', 'diagram', 'network'] },
  { id: 'session-hijacking', title: 'Session Hijacking & Cookie Theft Lab', desc: 'Simulate infostealer session cookie thefts. Apply DPoP, IP-binding, and CAEP to defend web sessions.', link: '/playground/session-hijacking', kw: ['session', 'hijack', 'cookie', 'steal', 'dpop', 'caep'] },
  { id: 'conditional-access', title: 'Conditional Access Policy Engine', desc: 'Model enterprise gateway evaluations, validating device firewall, geolocation compliance, and risk levels.', link: '/playground/conditional-access', kw: ['conditional', 'access', 'policy', 'firewall', 'risk', 'posture'] },
  { id: 'opa-playground', title: 'Open Policy Agent (OPA) Rego Playground', desc: 'Evaluate authorization decisions client-side using OPA\'s standard Rego language with JSON input scopes.', link: '/playground/opa', kw: ['opa', 'rego', 'policy', 'open policy agent', 'json'] },
  { id: 'token-exchange', title: 'STS Token Exchange Broker (RFC 8693)', desc: 'Model Security Token Service (STS) integrations. Execute OAuth impersonation and delegation flows.', link: '/playground/token-exchange', kw: ['token', 'exchange', 'sts', 'broker', 'impersonation', 'delegation', 'rfc 8693'] },
  { id: 'itdr-lab', title: 'ITDR SecOps Log Monitor Lab', desc: 'Track brute force and MFA push fatigue attacks in log dashboards. Implement automated user locks and triggers.', link: '/playground/itdr', kw: ['itdr', 'log', 'secops', 'lockout', 'monitoring', 'threat detection'] },
  { id: 'device-trust', title: 'Zero Trust Device Posture Lab', desc: 'Model endpoint posture attestations evaluating firewall statuses, local encryption, and client mTLS.', link: '/playground/device-trust', kw: ['device', 'trust', 'posture', 'attestation', 'endpoint'] },
  { id: 'passkey-internals', title: 'Passkey AuthenticatorData CBOR Decoder', desc: 'Deconstruct FIDO2 authenticatorData byte-arrays and CBOR public keys generated inside secure TPM chips.', link: '/playground/passkey-internals', kw: ['passkey', 'cbor', 'tpm', 'byte', 'binary', 'fido2', 'webauthn'] },
  { id: 'xacml-engine', title: 'XACML 3.0 Policy Engine', desc: 'Real combining-algorithm engine evaluating rules and applying deny-overrides, permit-overrides, first-applicable, and only-one-applicable semantics.', link: '/playground/xacml', kw: ['xacml', 'policy', 'pdp', 'combining algorithm', 'deny-overrides', 'permit-overrides'] },
  { id: 'gnap-visualizer', title: 'GNAP Grant Negotiation Visualizer', desc: 'RFC 9635 Grant Negotiation and Authorization Protocol timeline: grant requests, interaction, continuation, and key-bound token issuance.', link: '/playground/gnap', kw: ['gnap', 'grant negotiation', 'rfc 9635', 'authorization'] },
  { id: 'caep-lab', title: 'CAEP Continuous Access Evaluation Lab', desc: 'Shared Signals Framework transmitter/receiver simulator pushing signed Security Event Tokens (SETs) for session-revoked and risk-change signals.', link: '/playground/caep', kw: ['caep', 'shared signals', 'ssf', 'set', 'security event token', 'session revocation'] },
  { id: 'vc-did-lab', title: 'Verifiable Credentials & DID Lab', desc: 'Issuer, Holder, and Verifier flow signing and verifying a real Ed25519 Verifiable Credential and Presentation in-browser.', link: '/playground/vc-did', kw: ['verifiable credentials', 'did', 'decentralized identity', 'ed25519', 'issuer', 'holder', 'verifier'] },
  { id: 'identity-broker', title: 'Identity Broker & Federation Sandbox', desc: 'Explore multi-tenant single sign-on (SSO), federation routing, and real-time SAML-to-OIDC token translation topologies.', link: '/playground/identity-broker', kw: ['identity broker', 'federation', 'sso', 'saml to oidc', 'multi-tenant'] },
  { id: 'magic-link-stepup', title: 'Passwordless Magic Link & Step-Up Auth Lab', desc: 'Email magic-link login followed by a forced step-up to WebAuthn/OTP before a high-risk action.', link: '/playground/magic-link-stepup', kw: ['magic link', 'passwordless', 'step-up', 'stepup authentication', 'otp', 'email login'] },
  { id: 'credential-stuffing', title: 'Credential Stuffing & Password Spray Defense Lab', desc: 'Replay leaked credentials against a mock login and toggle rate-limiting, CAPTCHA, breached-password detection, and lockout defenses.', link: '/playground/credential-stuffing', kw: ['credential stuffing', 'password spray', 'brute force', 'rate limiting', 'captcha', 'lockout'] },
  { id: 'ciam-consent', title: 'CIAM Consent & Progressive Profiling Sandbox', desc: 'Social login consent screen, OAuth scope grants, and progressive profile-field collection across sessions.', link: '/playground/ciam-consent', kw: ['ciam', 'consent', 'progressive profiling', 'social login', 'scope grant', 'customer identity'] },
  { id: 'access-certification', title: 'Access Certification Campaign Simulator', desc: 'Reviewer walks user-to-entitlement rows, approves or revokes access, and flags Separation-of-Duties (SoD) conflicts.', link: '/playground/access-certification', kw: ['access certification', 'access review', 'iga', 'governance', 'sod', 'separation of duties', 'recertification'] },
  { id: 'risk-engine', title: 'Adaptive Risk-Based Authentication Engine', desc: 'Composite risk score from impossible travel, device reputation, and behavior anomaly signals drives allow, step-up, or block decisions.', link: '/playground/risk-engine', kw: ['risk based authentication', 'adaptive auth', 'ueba', 'impossible travel', 'device reputation', 'risk score'] },
  { id: 'pam-vaulting', title: 'PAM Vaulting & Just-in-Time Elevation Lab', desc: 'Check out a vaulted credential, request time-boxed JIT elevation and approval, toggle session recording, and auto rotate on check-in.', link: '/playground/pam-vaulting', kw: ['pam', 'privileged access', 'vaulting', 'just-in-time', 'jit elevation', 'session recording', 'credential rotation'] },
  { id: 'hybrid-ad-sync', title: 'Hybrid Identity Sync Lab (PHS / PTA / Federation)', desc: 'Toggle between Password Hash Sync, Pass-Through Authentication, and Federation (AD FS) to see how each handles an on-prem login.', link: '/playground/hybrid-ad-sync', kw: ['hybrid identity', 'password hash sync', 'pass-through authentication', 'federation', 'ad fs', 'azure ad connect'] }
]

// Statically define the 6 breaches for the museum
const BREACHES_LIST = [
  { id: 'breach-goldensaml', title: 'SolarWinds Golden SAML Hack', desc: 'Historical Supply-Chain Incident (2020) by Nobelium. Attackers stole private AD FS signing keys to forge SAML assertions offline.', link: '/wall-of-shame?tab=breaches&lab=goldensaml', kw: ['solarwinds', 'golden saml', 'nobelium', 'adfs', 'signing key', 'supply chain', '2020'] },
  { id: 'breach-pushfatigue', title: 'MFA Push Fatigue Prompt Bombing', desc: 'Identity hijacking vector (2022) affecting Uber/Cisco. Attackers spam push notifications until users click approve.', link: '/wall-of-shame?tab=breaches&lab=pushfatigue', kw: ['uber', 'cisco', 'push fatigue', 'spam', 'prompt bombing', 'mfa bypass', '2022'] },
  { id: 'breach-wildcard', title: 'OAuth Wildcard Redirect Hijacks', desc: 'Front-channel token-leaking flaw. Misconfigured server allowed *.attacker-domain.com to steal login codes.', link: '/wall-of-shame?tab=breaches&lab=wildcard', kw: ['wildcard', 'oauth', 'redirect', 'hijack', 'code theft', 'configuration'] },
  { id: 'breach-oktahar', title: 'Okta HAR Support Ticket Cookie Theft', desc: 'Session hijacking incident (2023). Support HAR logs contained active admin session cookies loaded directly into attacker browsers.', link: '/wall-of-shame?tab=breaches&lab=oktahar', kw: ['okta', 'har', 'cookie', 'session', 'stolen', 'support', '2023'] },
  { id: 'breach-silversaml', title: 'Entra ID Silver SAML Attack', desc: 'Targeted SaaS hijacking (2024). Attackers steal self-signed application signing keys to bypass central AD domain rules.', link: '/wall-of-shame?tab=breaches&lab=silversaml', kw: ['silver saml', 'entra id', 'entra', 'microsoft', 'saas', 'signing key', '2024'] },
  { id: 'breach-lastpass', title: 'LastPass Offline Vault Cracking', desc: 'Offline brute force attack (2022). Weak corporate PBKDF2 iteration counts allowed rapid GPU hash dictionary cracking.', link: '/wall-of-shame?tab=breaches&lab=lastpass', kw: ['lastpass', 'vault', 'pbkdf2', 'iterations', 'crack', 'brute force', '2022'] }
]

// Statically define the 19 design patterns (Beginner -> Advanced) in the Pattern Library
const PATTERNS_LIST = [
  { id: 'basic_session_auth', title: 'Session Cookie Auth', desc: 'Username/password login backed by a server-side session and an HttpOnly cookie.', kw: ['session', 'cookie', 'login', 'password', 'basic auth'] },
  { id: 'social_login', title: 'Social Login', desc: 'Sign in with Google/Apple/Microsoft via OAuth 2.0/OIDC instead of a new password.', kw: ['social login', 'oauth', 'sign in with google', 'oidc', 'federation'] },
  { id: 'otp_verification', title: 'OTP Verification', desc: 'Email/SMS one-time password verification for signup or lightweight second factor.', kw: ['otp', 'one time password', 'sms', 'email verification', '2fa'] },
  { id: 'rbac_basic', title: 'Basic RBAC', desc: 'Assign users to roles and gate features by role instead of per-user checks.', kw: ['rbac', 'role based access control', 'roles', 'permissions'] },
  { id: 'password_reset', title: 'Password Reset', desc: 'Self-service password reset and account recovery via a time-boxed secure link.', kw: ['password reset', 'account recovery', 'forgot password'] },
  { id: 'mfa_totp_stepup', title: 'MFA Step-Up (TOTP)', desc: 'Time-based one-time-password second factor and step-up before high-risk actions.', kw: ['mfa', 'totp', 'step up', '2fa', 'authenticator app', 'rfc 6238'] },
  { id: 'sso_reverse_proxy', title: 'Reverse-Proxy SSO', desc: 'Centralize SSO at a reverse proxy that injects trusted identity headers to backend apps.', kw: ['reverse proxy', 'sso', 'header injection', 'oauth2-proxy'] },
  { id: 'api_key_m2m', title: 'API Key (M2M)', desc: 'Long-lived API key authentication for machine-to-machine and partner integrations.', kw: ['api key', 'machine to machine', 'm2m', 'service account'] },
  { id: 'jwt_stateless_api', title: 'Stateless JWT API', desc: 'Self-contained signed JWT bearer tokens for stateless API authorization at scale.', kw: ['jwt', 'stateless', 'bearer token', 'jwks'] },
  { id: 'b2b_sso', title: 'B2B Multi-Tenant SSO', desc: 'Federated SAML/OIDC SSO and SCIM provisioning across enterprise tenants.', kw: ['b2b', 'multi-tenant', 'federated sso', 'scim'] },
  { id: 'token_exchange', title: 'API Gateway Token Exchange', desc: 'RFC 8693 token exchange delegating restricted, service-scoped downstream tokens.', kw: ['token exchange', 'rfc 8693', 'delegation', 'sts'] },
  { id: 'passwordless', title: 'Passwordless FIDO2', desc: 'WebAuthn/FIDO2 phishing-resistant passwordless registration and login.', kw: ['passwordless', 'fido2', 'webauthn', 'passkey'] },
  { id: 'banking', title: 'Financial-Grade API (FAPI)', desc: 'FAPI 1.0 Advanced mTLS, sender-constrained tokens, and signed request objects.', kw: ['fapi', 'banking', 'open banking', 'mtls', 'jar'] },
  { id: 'healthcare', title: 'SMART on FHIR', desc: 'HL7 SMART on FHIR scoped patient authorization and clinical consent.', kw: ['smart on fhir', 'healthcare', 'hipaa', 'hl7'] },
  { id: 'government', title: 'PIV/CAC Gov Federation', desc: 'Hardware-backed PIV/CAC smart card mTLS authentication for FedRAMP systems.', kw: ['piv', 'cac', 'government', 'fedramp', 'smart card'] },
  { id: 'workforce', title: 'Workforce Zero Trust', desc: 'Continuous device posture attestation and conditional risk-based access rules.', kw: ['workforce', 'zero trust', 'conditional access', 'posture'] },
  { id: 'jit_pam', title: 'JIT Privileged Access', desc: 'Zero standing privilege PAM vaulting with just-in-time, time-boxed elevation.', kw: ['pam', 'jit', 'just in time', 'privileged access', 'zero standing privilege'] },
  { id: 'caep_continuous', title: 'CAEP Continuous Eval', desc: 'Shared Signals Framework push events for real-time session revocation.', kw: ['caep', 'shared signals', 'ssf', 'continuous access evaluation', 'set'] },
  { id: 'spiffe_workload', title: 'SPIFFE Workload Identity', desc: 'Short-lived X.509 SVID mTLS identity for non-human microservice workloads.', kw: ['spiffe', 'spire', 'workload identity', 'svid', 'mtls'] }
]

let searchIndex: MiniSearch<SearchItem> | null = null

export function getSearchIndex(): MiniSearch<SearchItem> {
  if (searchIndex) return searchIndex

  const index = new MiniSearch<SearchItem>({
    fields: ['title', 'fullName', 'description', 'keywords'],
    storeFields: ['id', 'title', 'fullName', 'description', 'category', 'link'],
    searchOptions: {
      boost: { title: 4, fullName: 2.5, keywords: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    }
  })

  const items: SearchItem[] = []

  // 1. Add Simulators
  SIMULATORS_LIST.forEach(s => {
    items.push({
      id: `sim-${s.id}`,
      title: s.title,
      fullName: 'Interactive Simulator',
      description: s.desc,
      category: '📁 Interactive Labs & Simulators',
      link: s.link,
      keywords: s.kw
    })
  })

  // 2. Add Security Tools
  TOOLS.forEach((t: ToolMeta) => {
    if (t.status === 'live') {
      items.push({
        id: `tool-${t.slug}`,
        title: t.title,
        fullName: t.keywords?.join(' • ') || 'Security Tool',
        description: t.description,
        category: '🔧 Client-Side Security Tools',
        link: `/tools/${t.slug}`,
        keywords: t.keywords || []
      })
    }
  })

  // 3. Add Encyclopedia Terms
  ENCYCLOPEDIA_TERMS.forEach((term: Term) => {
    items.push({
      id: `term-${term.id}`,
      title: term.term,
      fullName: term.fullName,
      description: term.analogy.slice(0, 150) + '...',
      category: '📚 Master Glossary & Encyclopedia',
      link: `/encyclopedia?term=${term.id}`,
      keywords: [term.category, 'acronym', 'definition']
    })
  })

  // 4. Add Vendor Profiles
  Object.keys(VENDOR_CATALOG).forEach(key => {
    const v = VENDOR_CATALOG[key as VendorType]
    items.push({
      id: `vendor-${key}`,
      title: key === 'thales' ? `Thales (OneWelcome & SafeNet)` : v.fullName,
      fullName: `${v.category} Enterprise Platform`,
      description: v.marketPositioning || '',
      category: '🏢 Enterprise Vendor Profiles',
      link: `/vendor?v=${key}`,
      keywords: v.strengths.concat(v.certifications).concat([v.licensingModel])
    })
  })

  // 5. Add Breaches
  BREACHES_LIST.forEach(b => {
    items.push({
      id: b.id,
      title: b.title,
      fullName: 'Historical Cyber Attack Profile',
      description: b.desc,
      category: '💣 Breach Museum Cases',
      link: b.link,
      keywords: b.kw
    })
  })

  // 6. Add Living Standards (derived from the shared standardsData.ts — every
  // standard added there is automatically searchable, no separate list to sync)
  STANDARDS.forEach(s => {
    items.push({
      id: `standard-${s.id}`,
      title: s.title,
      fullName: `${s.fullname} · ${s.difficulty}`,
      description: s.summary,
      category: '📜 Living Standards & RFCs',
      link: `/standards?standard=${s.id}`,
      keywords: [s.category, s.difficulty, ...s.rfcs]
    })
  })

  // 7. Add Reference Architectures (derived from the shared architectureData.ts — every
  // architecture added there is automatically searchable, no separate list to sync)
  ARCHITECTURES.forEach(a => {
    items.push({
      id: `arch-${a.id}`,
      title: a.name,
      fullName: `Reference Architecture · ${a.difficulty}`,
      description: a.description,
      category: '🏛️ Reference Architectures',
      link: `/architecture?arch=${a.id}`,
      keywords: [a.difficulty, a.group, ...a.tags]
    })
  })

  // 8. Add Design Patterns
  PATTERNS_LIST.forEach(p => {
    items.push({
      id: `pattern-${p.id}`,
      title: p.title,
      fullName: 'Design Pattern',
      description: p.desc,
      category: '🧩 Design Pattern Library',
      link: `/patterns?pattern=${p.id}`,
      keywords: p.kw
    })
  })

  // 9. Add Reference Implementations — derived directly from referenceProjects.ts's
  // PROJECTS array so a new reference entry is automatically searchable with no separate list to sync.
  REFERENCE_PROJECTS.forEach(p => {
    items.push({
      id: `reference-${p.id}`,
      title: p.title,
      fullName: `${p.category} · ${p.tech}`,
      description: p.description,
      category: '🗂️ Reference Implementations',
      link: `/references?ref=${p.id}`,
      keywords: [p.category, p.tech, p.level, p.shortLabel]
    })
  })

  // 10. Add Case Studies (derived from the shared caseStudiesData.ts — every case study
  // added there is automatically searchable, no separate list to sync)
  CASE_STUDIES.forEach(cs => {
    items.push({
      id: `case-${cs.id}`,
      title: `${cs.company} — ${cs.title}`,
      fullName: `${cs.category} · ${cs.difficulty}`,
      description: cs.summary,
      category: '🏢 Case Study Center',
      link: `/case-studies?study=${cs.id}`,
      keywords: [cs.company, cs.category, cs.difficulty, ...cs.rfcs]
    })
  })

  // 11. Add Compliance Deadlines
  COMPLIANCE_DEADLINES.forEach(d => {
    items.push({
      id: `deadline-${d.id}`,
      title: d.regulation,
      fullName: `${d.jurisdiction} Compliance Deadline`,
      description: d.description,
      category: '📅 Compliance Deadlines',
      link: '/standards?view=deadlines',
      keywords: [d.jurisdiction, d.deadlineDate, 'compliance', 'regulation', 'deadline']
    })
  })

  // 12. Add IAM Landscape Directory products (derived from the shared exploreData.ts —
  // every product added there is automatically searchable, no separate list to sync)
  EXPLORE_PRODUCTS.forEach(p => {
    items.push({
      id: `explore-${p.id}`,
      title: p.name,
      fullName: `${p.type} · ${p.difficulty}`,
      description: p.bestUse,
      category: '🧭 IAM Landscape Directory',
      link: `/explore?product=${p.id}`,
      keywords: [p.type, p.difficulty, ...p.tags]
    })
  })

  // 13. Add Certifications (derived from the shared certificationsData.ts — every
  // certification added there is automatically searchable, no separate list to sync)
  CERTIFICATIONS.forEach(c => {
    items.push({
      id: `cert-${c.id}`,
      title: c.title,
      fullName: `${c.vendor} · ${c.difficulty}`,
      description: `${c.category} certification — ${c.domains.map(d => d.name).join(', ')}`,
      category: '🎓 Certification Hub',
      link: `/certifications?cert=${c.id}`,
      keywords: [c.vendor, c.category, c.difficulty, c.examCode ?? ''].filter(Boolean)
    })
  })

  // 14. Add CVE & Vulnerability Research entries (derived from the shared researchData.ts —
  // every CVE added there is automatically searchable, no separate list to sync)
  CVE_DATABASE.forEach(c => {
    items.push({
      id: `cve-${c.id}`,
      title: `${c.id}: ${c.title}`,
      fullName: `${c.component} · ${c.difficulty}`,
      description: c.description,
      category: '🦠 CVE & Vulnerability Research',
      link: `/research?cve=${c.id}`,
      keywords: [c.component, c.vulnerabilityType, c.difficulty, String(c.cvss)]
    })
  })

  // 15. Add RFC & Protocol Registry entries (derived from the shared researchData.ts —
  // every RFC/draft added there is automatically searchable, no separate list to sync)
  RFC_DATABASE.forEach(r => {
    items.push({
      id: `rfc-${rfcSlug(r.number)}`,
      title: `${r.number}: ${r.title}`,
      fullName: `${r.category} · ${r.difficulty}`,
      description: r.description,
      category: '📡 RFC & Protocol Registry',
      link: `/research?rfc=${rfcSlug(r.number)}`,
      keywords: [r.category, r.status, r.difficulty]
    })
  })

  // 16. Add every remaining site page (sidebar/nav pages not covered above)
  // sourced from routeMeta.ts — the same table already required to be kept
  // in sync for SEO, so new routes get indexed here automatically.
  const coveredPaths = new Set(items.map(i => i.link.split('?')[0]))
  ROUTE_META.forEach(route => {
    if (coveredPaths.has(route.path)) return
    coveredPaths.add(route.path)
    const keywords = route.title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length > 2)
    items.push({
      id: `page-${route.path.replace(/\//g, '-') || 'home'}`,
      title: route.title,
      fullName: 'Site Page',
      description: route.description,
      category: '📄 Site Pages',
      link: route.path,
      keywords
    })
  })

  index.addAll(items)
  searchIndex = index
  return searchIndex
}

export interface CommandAction {
  type: 'theme' | 'reset' | 'redirect' | 'airplane'
  message: string
  actionUrl?: string
}

export function parseSlashCommand(query: string): CommandAction | null {
  const q = query.trim().toLowerCase()
  if (!q.startsWith('/')) return null

  if (q === '/airplane' || q === '/offline') {
    return {
      type: 'airplane',
      message: 'Toggle Simulated Offline Mode (Airplane Mode) to test local identity survivability and client air-gap.',
    }
  }

  if (q === '/theme') {
    return {
      type: 'theme',
      message: 'Toggle console theme styles (System light & dark mode).',
    }
  }

  if (q === '/reset') {
    return {
      type: 'reset',
      message: 'Clear all learning progress, lab credentials, and simulator high-scores from browser local storage.',
    }
  }

  if (q === '/ctf' || q === '/challenge') {
    return {
      type: 'redirect',
      message: 'Direct shortcut to the client-side Identity CTF hacking arena.',
      actionUrl: '/playground/ctf',
    }
  }

  if (q === '/labs' || q === '/simulators') {
    return {
      type: 'redirect',
      message: 'Filter active index view to display all interactive simulators.',
      actionUrl: '/playground',
    }
  }

  if (q === '/tools' || q === '/utilities') {
    return {
      type: 'redirect',
      message: 'Filter active index view to browse all browser-native security utilities.',
      actionUrl: '/tools',
    }
  }

  return null
}
