import MiniSearch from 'minisearch'
import { TOOLS } from '../../data/toolsRegistry'
import type { ToolMeta } from '../../data/toolsRegistry'
import { ENCYCLOPEDIA_TERMS } from '../../data/encyclopediaData'
import type { Term } from '../../pages/Encyclopedia'
import { VENDOR_CATALOG } from '../../data/vendorCatalog'
import type { VendorType } from '../../data/vendorCatalog'
import { COMPLIANCE_DEADLINES } from '../../data/complianceDeadlines'
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
  { id: 'passkey-internals', title: 'Passkey AuthenticatorData CBOR Decoder', desc: 'Deconstruct FIDO2 authenticatorData byte-arrays and CBOR public keys generated inside secure TPM chips.', link: '/playground/passkey-internals', kw: ['passkey', 'cbor', 'tpm', 'byte', 'binary', 'fido2', 'webauthn'] }
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

// Statically define the 4 living standards
const STANDARDS_LIST = [
  { id: 'oauth21', title: 'OAuth 2.1', desc: 'Consolidated authorization framework deprecating legacy Implicit and Password grants, mandating PKCE.', kw: ['oauth', 'oauth 2.1', 'pkce', 'rfc 6749', 'authorization'] },
  { id: 'oidc', title: 'OpenID Connect (OIDC)', desc: 'Identity layer on top of OAuth 2.0 introducing ID Tokens, UserInfo endpoints, and Discovery documents.', kw: ['oidc', 'openid connect', 'id token', 'discovery', 'userinfo'] },
  { id: 'scim20', title: 'SCIM 2.0', desc: 'System for Cross-domain Identity Management standard for automated user/group provisioning across IdPs and SaaS apps.', kw: ['scim', 'provisioning', 'user lifecycle', 'rfc 7644'] },
  { id: 'webauthn', title: 'WebAuthn / FIDO2', desc: 'W3C standard for passwordless public-key authentication using hardware authenticators and platform passkeys.', kw: ['webauthn', 'fido2', 'passkey', 'authenticator', 'public key'] }
]

// Statically define the 14 reference architectures
const ARCHITECTURES_LIST = [
  { id: 'zero_trust', title: 'Workforce Zero Trust (NIST SP 800-207)', desc: 'Dynamic authentication, device posture, and Policy Decision Point evaluations for workforce access.', kw: ['zero trust', 'nist', 'pdp', 'pep'] },
  { id: 'b2b_saas', title: 'Multi-Tenant B2B SaaS Identity Architecture', desc: 'Tenant isolation, federated SSO, and SCIM provisioning patterns for B2B SaaS platforms.', kw: ['b2b', 'saas', 'multi-tenant', 'federation'] },
  { id: 'multi_cloud', title: 'Multi-Cloud Identity & Machine Workloads (SPIFFE/SPIRE)', desc: 'Non-human identity attestation and X.509 SVID issuance across multi-cloud workloads.', kw: ['spiffe', 'spire', 'multi-cloud', 'workload identity'] },
  { id: 'ciam_social', title: 'Customer Identity & Social Login Federation (CIAM)', desc: 'Consumer registration, social login federation, and progressive profiling architecture.', kw: ['ciam', 'social login', 'consumer identity'] },
  { id: 'oauth_oidc', title: 'OAuth 2.0 & OIDC Authorization Code Flow', desc: 'Reference sequence flow for the authorization code grant with PKCE across front and back channels.', kw: ['oauth', 'oidc', 'authorization code', 'pkce'] },
  { id: 'saml', title: 'SAML 2.0 Enterprise Web SSO', desc: 'Enterprise browser SSO reference architecture using SAML assertions and IdP-initiated flows.', kw: ['saml', 'sso', 'assertion', 'enterprise'] },
  { id: 'pam', title: 'Privileged Access Management (PAM) Vaulting', desc: 'Credential vaulting, session brokering, and Just-in-Time privileged access architecture.', kw: ['pam', 'privileged access', 'vault', 'jit'] },
  { id: 'pki', title: 'Public Key Infrastructure (PKI) & mTLS', desc: 'Certificate authority hierarchies, mTLS handshakes, and revocation checking architecture.', kw: ['pki', 'mtls', 'certificate authority', 'x509'] },
  { id: 'k8s_identity', title: 'Kubernetes Identity (OIDC & RBAC)', desc: 'Cluster authentication via OIDC and fine-grained authorization via Kubernetes RBAC.', kw: ['kubernetes', 'k8s', 'rbac', 'oidc'] },
  { id: 'banking', title: 'Banking & Financial Services Identity Architecture (PCI-DSS & PSD2)', desc: 'Customer channel, strong customer authentication, and PCI-DSS/PSD2-aligned identity controls.', kw: ['banking', 'pci-dss', 'psd2', 'financial services'] },
  { id: 'healthcare', title: 'Healthcare Identity Architecture (HIPAA & HL7 FHIR)', desc: 'Patient portal identity, HIPAA-aligned access controls, and HL7 FHIR integration patterns.', kw: ['healthcare', 'hipaa', 'hl7', 'fhir', 'patient portal'] },
  { id: 'government', title: 'Government & Public Sector Identity Architecture (FedRAMP & NIST 800-63)', desc: 'PIV card authentication, FedRAMP-aligned controls, and NIST 800-63 identity assurance levels.', kw: ['government', 'fedramp', 'piv', 'nist 800-63'] },
  { id: 'manufacturing', title: 'Industrial OT/ICS Identity Architecture (IEC 62443)', desc: 'Plant operator access, OT/ICS segmentation, and IEC 62443-aligned identity controls.', kw: ['manufacturing', 'ot', 'ics', 'iec 62443'] },
  { id: 'retail', title: 'Retail & Point-of-Sale Identity Architecture (PCI-DSS & Omnichannel)', desc: 'POS terminal identity, omnichannel session continuity, and PCI-DSS aligned controls.', kw: ['retail', 'pos', 'pci-dss', 'omnichannel'] }
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

  // 6. Add Living Standards
  STANDARDS_LIST.forEach(s => {
    items.push({
      id: `standard-${s.id}`,
      title: s.title,
      fullName: 'Living Standard & RFC Reference',
      description: s.desc,
      category: '📜 Living Standards & RFCs',
      link: `/standards?standard=${s.id}`,
      keywords: s.kw
    })
  })

  // 7. Add Reference Architectures
  ARCHITECTURES_LIST.forEach(a => {
    items.push({
      id: `arch-${a.id}`,
      title: a.title,
      fullName: 'Reference Architecture',
      description: a.desc,
      category: '🏛️ Reference Architectures',
      link: `/architecture?arch=${a.id}`,
      keywords: a.kw
    })
  })

  // 8. Add Compliance Deadlines
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

  // 9. Add every remaining site page (sidebar/nav pages not covered above)
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
