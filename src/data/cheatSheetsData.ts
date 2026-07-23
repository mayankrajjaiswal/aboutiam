// Single source of truth for the /cheat-sheets "Developer Playbooks" checklist library —
// every entry here automatically renders in the difficulty/category-filterable selector on
// CheatSheets.tsx AND becomes searchable/deep-linkable (?sheet=<id>) via searchService.ts.
// Add a new cheat sheet by appending one object below; nothing else needs to be edited to
// make it searchable (see GEMINI.md §4Z).

export type SheetCategory = 'Application Security' | 'Identity Infrastructure & Governance' | 'Compliance & Regulatory'
export type SheetDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface CheckItem {
  id: string
  task: string
  desc: string
}

export interface CheatSheet {
  id: string
  title: string
  target: string
  category: SheetCategory
  difficulty: SheetDifficulty
  checks: CheckItem[]
}

// Derived, deduplicated list of categories actually in use by CHEAT_SHEETS — avoids the
// category-grouping UI drifting out of sync with a hand-typed duplicate array.
export const SHEET_CATEGORIES: SheetCategory[] = [
  'Application Security',
  'Identity Infrastructure & Governance',
  'Compliance & Regulatory'
]

export const CHEAT_SHEETS: CheatSheet[] = [
  // ── Application Security ──
  {
    id: 'spa',
    title: 'Single-Page App (SPA) Security Baseline',
    target: 'React, Angular, Vue Developers',
    category: 'Application Security',
    difficulty: 'Beginner',
    checks: [
      { id: 'spa_1', task: 'Implement Authorization Code flow with PKCE', desc: 'Ensure you are NOT using the deprecated Implicit Grant. Generate a SHA-256 code challenge for every login request.' },
      { id: 'spa_2', task: 'Enforce exact Redirect URI matching', desc: 'The authorization server must validate the redirect URI via an exact string match, barring any wildcards.' },
      { id: 'spa_3', task: 'Avoid localStorage for sensitive tokens', desc: 'If possible, use a Backend-For-Frontend (BFF) pattern to store tokens in HttpOnly, Secure, SameSite=Strict cookies to defeat XSS.' },
      { id: 'spa_4', task: 'Verify ID Token Signatures & Claims', desc: 'If parsing the id_token locally, verify the JWT signature against the IdP JWKS and check the "aud" (audience) matches your client ID.' }
    ]
  },
  {
    id: 'm2m',
    title: 'Machine-to-Machine (M2M) API Hardening',
    target: 'Backend Microservices, Cron Jobs',
    category: 'Application Security',
    difficulty: 'Intermediate',
    checks: [
      { id: 'm2m_1', task: 'Use Client Credentials Grant', desc: 'Authenticate daemons using client_id and client_secret directly at the /token endpoint.' },
      { id: 'm2m_2', task: 'Enforce Scope Limitations (Least Privilege)', desc: 'Do not issue global admin tokens. Request exact scopes (e.g., `system.read` vs `system.write`).' },
      { id: 'm2m_3', task: 'Implement Token Exchange (RFC 8693) for internal hops', desc: 'If Service A calls Service B on behalf of a user, exchange the public token for a restricted internal token before the hop.' },
      { id: 'm2m_4', task: 'Store secrets in an encrypted vault', desc: 'Never hardcode `client_secret` in environments. Inject it dynamically via HashiCorp Vault or AWS Secrets Manager.' }
    ]
  },
  {
    id: 'password_session',
    title: 'Password & Session Management Baseline',
    target: 'Full-Stack Developers, AppSec Reviewers',
    category: 'Application Security',
    difficulty: 'Beginner',
    checks: [
      { id: 'passsess_1', task: 'Hash passwords with bcrypt or Argon2id', desc: 'Never store plaintext or fast-hash (MD5/SHA-1) passwords. Use a slow, salted KDF with a work factor tuned to current hardware.' },
      { id: 'passsess_2', task: 'Set HttpOnly, Secure, SameSite=Strict on session cookies', desc: 'Prevent JavaScript access (XSS theft) and cross-site transmission (CSRF) of the session identifier.' },
      { id: 'passsess_3', task: 'Regenerate the session ID on privilege change', desc: 'Issue a brand-new session identifier immediately after login and after any privilege escalation to prevent session fixation.' },
      { id: 'passsess_4', task: 'Enforce idle and absolute session timeouts', desc: 'Expire sessions after a period of inactivity and enforce a hard maximum lifetime regardless of activity.' }
    ]
  },
  {
    id: 'jwt_security',
    title: 'JWT Implementation Security Checklist',
    target: 'API & Backend Developers',
    category: 'Application Security',
    difficulty: 'Beginner',
    checks: [
      { id: 'jwt_1', task: 'Reject `alg: none` and enforce an algorithm allow-list', desc: 'Never trust the `alg` header from the token itself — pin verification to one expected algorithm server-side.' },
      { id: 'jwt_2', task: 'Validate `exp`, `nbf`, `aud`, and `iss` on every verification', desc: 'A syntactically valid signature is not enough — reject expired, not-yet-valid, or wrong-audience/issuer tokens.' },
      { id: 'jwt_3', task: 'Rotate signing keys via a JWKS endpoint with overlapping validity', desc: 'Publish multiple active keys during rotation windows so in-flight tokens signed by the old key still verify.' },
      { id: 'jwt_4', task: 'Never place secrets or excessive PII in the payload', desc: 'JWT payloads are base64url-encoded, not encrypted — anyone holding the token can read every claim.' }
    ]
  },
  {
    id: 'ciam_social_login',
    title: 'CIAM Social Login & Consent Checklist',
    target: 'Consumer-Facing App Developers',
    category: 'Application Security',
    difficulty: 'Beginner',
    checks: [
      { id: 'ciam_1', task: 'Validate the `state` and `nonce` parameters on callback', desc: 'Reject the callback if the returned `state` does not match what was issued, preventing CSRF login injection.' },
      { id: 'ciam_2', task: 'Request the minimal OAuth scopes needed', desc: 'Do not request `profile`/`email`/broad data scopes unless the feature actually consumes that data immediately.' },
      { id: 'ciam_3', task: 'Show an explicit, readable consent screen', desc: 'Clearly state which data will be shared with the relying party before redirecting to the identity provider.' },
      { id: 'ciam_4', task: 'Handle account-linking collisions safely', desc: 'If a social login email matches an existing local account, require re-verification before merging identities.' }
    ]
  },
  {
    id: 'oauth_best_practices',
    title: 'OAuth 2.0 / OIDC Security Best Practices (RFC 9700)',
    target: 'API Platform & Identity Engineers',
    category: 'Application Security',
    difficulty: 'Intermediate',
    checks: [
      { id: 'oauthbp_1', task: 'Require PKCE for every client type, not just public clients', desc: 'RFC 9700 recommends PKCE universally — it neutralizes authorization-code interception even for confidential clients.' },
      { id: 'oauthbp_2', task: 'Validate redirect_uri with an exact string match', desc: 'Disallow wildcard, prefix, or open-redirect-style matching; register every valid URI explicitly.' },
      { id: 'oauthbp_3', task: 'Disable the Implicit and Resource Owner Password grants', desc: 'Both grants leak tokens into browser history or require handling raw user passwords — deprecated by RFC 9700.' },
      { id: 'oauthbp_4', task: 'Adopt sender-constrained tokens (DPoP or mTLS) where possible', desc: 'Bind access tokens to a client-held key so a stolen bearer token alone cannot be replayed elsewhere.' }
    ]
  },
  {
    id: 'saml_security',
    title: 'SAML 2.0 Security Hardening Checklist',
    target: 'Enterprise SSO & Federation Engineers',
    category: 'Application Security',
    difficulty: 'Intermediate',
    checks: [
      { id: 'saml_1', task: 'Validate the XML signature on the Assertion, not just the Response', desc: 'Signature Wrapping (SSW) attacks exploit implementations that only check the outer Response element.' },
      { id: 'saml_2', task: 'Enforce AudienceRestriction and Recipient checks', desc: 'Reject assertions not explicitly addressed to your service provider entity ID and ACS URL.' },
      { id: 'saml_3', task: 'Enforce one-time-use and reasonable NotOnOrAfter windows', desc: 'Track consumed assertion IDs to block replay, and keep validity windows tight (minutes, not hours).' },
      { id: 'saml_4', task: 'Disable XML external entity (XXE) processing in the parser', desc: 'Use a hardened XML parser configuration to prevent XXE injection via crafted assertion payloads.' }
    ]
  },
  {
    id: 'api_security',
    title: 'REST API Authentication & Authorization Checklist',
    target: 'Backend & Platform Engineers',
    category: 'Application Security',
    difficulty: 'Intermediate',
    checks: [
      { id: 'apisec_1', task: 'Authenticate every endpoint by default (deny-by-default)', desc: 'Require an explicit opt-in (e.g. a `@public` annotation) for any unauthenticated route, never the reverse.' },
      { id: 'apisec_2', task: 'Enforce object-level authorization checks (anti-BOLA/IDOR)', desc: 'Verify the authenticated caller owns or is entitled to the specific resource ID in the path, not just that they are logged in.' },
      { id: 'apisec_3', task: 'Rate-limit authentication and sensitive endpoints', desc: 'Apply per-account and per-IP throttling to login, password-reset, and token endpoints to blunt brute-force/credential stuffing.' },
      { id: 'apisec_4', task: 'Issue narrowly scoped, short-lived tokens', desc: 'Prefer fine-grained scopes and short expiries over broad, long-lived API keys wherever the client can refresh.' }
    ]
  },

  // ── Identity Infrastructure & Governance ──
  {
    id: 'secrets_management',
    title: 'Secrets & Credential Management Checklist',
    target: 'DevOps & Platform Security Engineers',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Intermediate',
    checks: [
      { id: 'secrets_1', task: 'Never commit secrets to source control', desc: 'Enable repository secret-scanning and pre-commit hooks; treat any credential ever found in git history as compromised.' },
      { id: 'secrets_2', task: 'Fetch secrets dynamically from a vault at runtime', desc: 'Use HashiCorp Vault, AWS Secrets Manager, or equivalent instead of baking secrets into images or config files.' },
      { id: 'secrets_3', task: 'Rotate credentials on a fixed schedule', desc: 'Automate rotation for database passwords, API keys, and signing certificates rather than relying on manual, ad-hoc rotation.' },
      { id: 'secrets_4', task: 'Scope vault access itself to least privilege', desc: 'A workload should only be able to read the specific secret paths it needs, not the entire vault namespace.' }
    ]
  },
  {
    id: 'ldap_ad_hardening',
    title: 'LDAP / Active Directory Hardening Checklist',
    target: 'Directory & Infrastructure Administrators',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Intermediate',
    checks: [
      { id: 'ldapad_1', task: 'Require LDAPS or StartTLS for all directory binds', desc: 'Plaintext LDAP binds transmit credentials in the clear over the network — enforce encrypted transport exclusively.' },
      { id: 'ldapad_2', task: 'Disable anonymous bind', desc: 'Anonymous binds allow unauthenticated directory enumeration, leaking usernames and group structure to any network client.' },
      { id: 'ldapad_3', task: 'Grant service bind accounts least-privilege read scope', desc: 'A bind account used for lookups should not also hold write or replication rights it does not need.' },
      { id: 'ldapad_4', task: 'Enable audit logging on directory object changes', desc: 'Log and alert on group membership changes, especially additions to privileged/admin groups.' }
    ]
  },
  {
    id: 'iga_access_reviews',
    title: 'IGA Access Certification & Least-Privilege Checklist',
    target: 'Identity Governance & Compliance Teams',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Intermediate',
    checks: [
      { id: 'iga_1', task: 'Run scheduled quarterly entitlement recertification campaigns', desc: 'Have managers or resource owners actively re-approve every standing access grant on a fixed cadence.' },
      { id: 'iga_2', task: 'Automate Joiner-Mover-Leaver (JML) provisioning', desc: 'De-provision access automatically on termination and re-scope access automatically on role change — do not rely on manual tickets.' },
      { id: 'iga_3', task: 'Detect and remediate orphaned accounts', desc: 'Flag accounts with no matching active HR record or owner as high-priority cleanup targets.' },
      { id: 'iga_4', task: 'Flag Separation-of-Duties (SoD) conflicts', desc: 'Detect toxic entitlement combinations (e.g. "create vendor" + "approve payment") held by the same identity.' }
    ]
  },
  {
    id: 'zero_trust',
    title: 'Zero Trust Architecture Readiness Checklist (NIST SP 800-207)',
    target: 'Enterprise Security Architects',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Advanced',
    checks: [
      { id: 'zt_1', task: 'Continuously verify every request — never trust by default', desc: 'Evaluate policy on every access request rather than granting standing trust after an initial perimeter login.' },
      { id: 'zt_2', task: 'Micro-segment the network around individual resources', desc: 'Replace flat, perimeter-trusted network zones with per-resource or per-workload segmentation.' },
      { id: 'zt_3', task: 'Incorporate device posture as a first-class policy input', desc: 'Factor patch level, disk encryption, and endpoint compliance into the access decision, not just user identity.' },
      { id: 'zt_4', task: 'Eliminate implicit trust based on network location', desc: 'Being "inside the corporate network" (VPN, office Wi-Fi) must not itself grant elevated access.' }
    ]
  },
  {
    id: 'k8s_rbac',
    title: 'Kubernetes RBAC & Service Account Hardening Checklist',
    target: 'Platform & Cloud-Native Engineers',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Advanced',
    checks: [
      { id: 'k8s_1', task: 'Grant least-privilege Role/ClusterRole bindings', desc: 'Avoid the built-in `cluster-admin` role for workloads; scope custom roles to the exact verbs/resources needed.' },
      { id: 'k8s_2', task: 'Disable automatic service account token mounting by default', desc: 'Set `automountServiceAccountToken: false` unless a pod genuinely needs to call the Kubernetes API.' },
      { id: 'k8s_3', task: 'Use short-lived, audience-bound projected service account tokens', desc: 'Prefer the TokenRequest API\'s projected, expiring tokens over the legacy long-lived secret-mounted tokens.' },
      { id: 'k8s_4', task: 'Audit-log all RBAC role and binding changes', desc: 'Alert on any creation or modification of a ClusterRoleBinding, especially ones granting cluster-wide access.' }
    ]
  },
  {
    id: 'kerberos_tiering',
    title: 'Kerberos & Active Directory Tiered Admin Model Checklist',
    target: 'Active Directory & Domain Security Engineers',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Advanced',
    checks: [
      { id: 'kerbtier_1', task: 'Implement a tiered administration model (Tier 0/1/2, PAW)', desc: 'Isolate domain-controller-level admin credentials to hardened Privileged Access Workstations, never standard endpoints.' },
      { id: 'kerbtier_2', task: 'Rotate the krbtgt account password on a fixed schedule', desc: 'A stolen krbtgt hash enables Golden Ticket forgery; rotate it twice on a regular cadence per Microsoft guidance.' },
      { id: 'kerbtier_3', task: 'Restrict "Replicating Directory Changes" extended rights', desc: 'Only domain controllers should legitimately hold the rights required for a DCSync-style replication request.' },
      { id: 'kerbtier_4', task: 'Never use domain-admin credentials on standard workstations', desc: 'Enforce credential tiering so a compromised standard endpoint cannot harvest a domain-admin session.' }
    ]
  },
  {
    id: 'incident_response_identity',
    title: 'Identity Breach Incident Response Playbook Checklist',
    target: 'SecOps & Incident Response Teams',
    category: 'Identity Infrastructure & Governance',
    difficulty: 'Advanced',
    checks: [
      { id: 'iram_1', task: 'Maintain a credential and session revocation runbook', desc: 'Pre-write the exact steps and tooling needed to instantly revoke tokens, sessions, and API keys for a compromised identity.' },
      { id: 'iram_2', task: 'Force re-authentication of all active sessions on suspected compromise', desc: 'Invalidate refresh tokens and session cookies platform-wide when a signing key or IdP compromise is suspected.' },
      { id: 'iram_3', task: 'Document a signing-key rotation procedure', desc: 'Have a tested, time-boxed process to rotate JWT/SAML signing keys without a full-platform outage.' },
      { id: 'iram_4', task: 'Perform forensic review of authentication and access logs post-incident', desc: 'Reconstruct the attacker\'s full access timeline before declaring containment complete.' }
    ]
  },

  // ── Compliance & Regulatory ──
  {
    id: 'soc2',
    title: 'SOC 2 Type II - Trust Services Criteria (Identity Controls)',
    target: 'Security Auditors, CTOs, and Compliance Managers',
    category: 'Compliance & Regulatory',
    difficulty: 'Intermediate',
    checks: [
      { id: 'soc2_1', task: 'CC6.1: Automated Directory Provisioning (SCIM)', desc: 'Configure automated directory lifecycle synchronization (SCIM) to immediately de-provision terminated employees, preventing unauthorized residual access.' },
      { id: 'soc2_2', task: 'CC6.2: Phishing-Proof Multi-Factor Authentication', desc: 'Mandate phishing-resistant Multi-Factor Authentication (FIDO2 / WebAuthn passkeys) for all administrative logins and core workforce endpoints.' },
      { id: 'soc2_3', task: 'CC6.3: Just-In-Time role elevation (PIM)', desc: 'Enforce Role-Based Access Control (RBAC) backed by Just-In-Time role elevation (PIM) to prevent permanent, static administrator credential keys.' },
      { id: 'soc2_4', task: 'CC6.8: API Gateway Authorization & Scope Validation', desc: 'Secure API endpoints by terminating connections at an API Gateway, validating JWT scopes, and blocking unauthenticated backchannel hops.' }
    ]
  },
  {
    id: 'iso27001',
    title: 'ISO/IEC 27001:2022 - Access Control (A.5.15 - A.5.18)',
    target: 'Information Security Officers, Compliance Auditors',
    category: 'Compliance & Regulatory',
    difficulty: 'Advanced',
    checks: [
      { id: 'iso_1', task: 'Control A.5.15: Access Rights Lifecycle Workflows', desc: 'Implement automated, documented Joiner-Mover-Leaver workflows with mandatory quarterly user access entitlement reviews.' },
      { id: 'iso_2', task: 'Control A.5.16: Secure Identity & Secrets Management', desc: 'Enforce unique identifier bindings (disallowing shared admin credentials) and store secrets vaulted with automated CPM rotation cycles.' },
      { id: 'iso_3', task: 'Control A.5.17: Privileged Session Monitoring & Vaulting', desc: 'Maintain complete session recordings, command logs, and credential masking for all privileged sessions accessing production clusters.' },
      { id: 'iso_4', task: 'Control A.5.18: Dynamic Departmental Group Re-evaluation', desc: 'Establish automated triggers to re-evaluate and reclaim security group memberships when users transfer departments or change roles.' }
    ]
  },
  {
    id: 'hipaa',
    title: 'HIPAA Security Rule - Technical Safeguards (§ 164.312)',
    target: 'Healthcare App Developers, Compliance Officers',
    category: 'Compliance & Regulatory',
    difficulty: 'Intermediate',
    checks: [
      { id: 'hipaa_1', task: '§164.312(a)(1): Unique User Identification', desc: 'Configure distinct, cryptographically-bound identifiers for every workforce member accessing systems that store or process Protected Health Information (PHI).' },
      { id: 'hipaa_2', task: '§164.312(a)(2)(iv): Encryption-at-Rest & In-Transit', desc: 'Mandate TLS 1.3 for all PHI transit pipelines (mTLS) and encrypt database partitions-at-rest using AES-256 keys.' },
      { id: 'hipaa_3', task: '§164.312(d): Person or Entity Authentication', desc: 'Disable standard IP-based or static API key authentication, requiring dynamic cryptographic user and system-to-system validations.' },
      { id: 'hipaa_4', task: '§164.312(e): Transmission Security (Integrity)', desc: 'Block unauthorized message modification in transit by signing all API payload parameters with asymmetric cryptographic hashes.' }
    ]
  },
  {
    id: 'pci_dss',
    title: 'PCI-DSS v4.0 - Identity & Access Requirements',
    target: 'Payment/Banking Engineers',
    category: 'Compliance & Regulatory',
    difficulty: 'Intermediate',
    checks: [
      { id: 'pci_1', task: 'Req 7: Restrict Access by Business Need-to-Know', desc: 'Limit access to system components and cardholder data to only those individuals whose job requires such access, defined by role.' },
      { id: 'pci_2', task: 'Req 8.3: MFA for All Access Into the CDE', desc: 'Enforce multi-factor authentication for all access into the Cardholder Data Environment, not just remote or administrative access.' },
      { id: 'pci_3', task: 'Req 8.6: Unique Authentication for Service/System Accounts', desc: 'Prohibit shared credentials for service and system accounts; each account must be uniquely identifiable and managed.' },
      { id: 'pci_4', task: 'Req 10.2: Audit Trails for All Access to Cardholder Data', desc: 'Log all individual access to cardholder data, including the identity performing the action and the outcome.' }
    ]
  },
  {
    id: 'nist_80063',
    title: 'NIST SP 800-63-3 - Digital Identity Guidelines',
    target: 'Government & Federal Contractors',
    category: 'Compliance & Regulatory',
    difficulty: 'Advanced',
    checks: [
      { id: 'nist_1', task: 'IAL2: Identity Proofing Evidence Requirements', desc: 'Collect and validate at least one piece of superior or two pieces of strong evidence during remote or in-person identity proofing.' },
      { id: 'nist_2', task: 'AAL2/AAL3: Phishing-Resistant Authenticator Requirements', desc: 'Require multi-factor cryptographic authenticators at AAL2, and hardware-based, verifier-impersonation-resistant authenticators at AAL3.' },
      { id: 'nist_3', task: 'FAL3: Holder-of-Key Federation Assertions', desc: 'Bind federated assertions to a cryptographic key held by the subscriber, rather than relying on bearer assertions alone.' },
      { id: 'nist_4', task: 'Re-authentication & Session Binding Requirements', desc: 'Enforce periodic re-authentication and bind sessions to the authenticated device or channel to prevent session injection.' }
    ]
  },
  {
    id: 'gdpr',
    title: 'GDPR Article 32 - Technical & Organizational Measures',
    target: 'EU-Facing SaaS & Data Controllers',
    category: 'Compliance & Regulatory',
    difficulty: 'Intermediate',
    checks: [
      { id: 'gdpr_1', task: 'Art. 32(1)(a): Pseudonymization & Encryption of Personal Data', desc: 'Apply pseudonymization and encryption as appropriate technical measures to protect personal data at rest and in transit.' },
      { id: 'gdpr_2', task: 'Art. 32(1)(b): Ongoing Confidentiality, Integrity & Availability', desc: 'Ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems handling personal data.' },
      { id: 'gdpr_3', task: 'Art. 25: Privacy-by-Design Least-Privilege Access', desc: 'Design access to personal data stores around least-privilege defaults, granting the minimum necessary scope by default.' },
      { id: 'gdpr_4', task: 'Art. 33: 72-Hour Breach Notification Readiness', desc: 'Maintain sufficient audit logging and detection capability to identify a personal data breach and notify the supervisory authority within 72 hours.' }
    ]
  },
  {
    id: 'ccpa_cpra',
    title: 'CCPA/CPRA Consumer Identity & Data Access Checklist',
    target: 'US Consumer-Facing SaaS & Privacy Teams',
    category: 'Compliance & Regulatory',
    difficulty: 'Intermediate',
    checks: [
      { id: 'ccpa_1', task: 'Verify requester identity before fulfilling data access requests', desc: 'Apply a proportionate identity-proofing step for Verifiable Consumer Requests so data is not disclosed to an impersonator.' },
      { id: 'ccpa_2', task: 'Honor "Do Not Sell or Share My Personal Information" opt-outs', desc: 'Propagate the opt-out signal (including Global Privacy Control) to every downstream system and data partner.' },
      { id: 'ccpa_3', task: 'Apply data minimization to collected identity attributes', desc: 'Collect only the personal information genuinely required for the stated business purpose.' },
      { id: 'ccpa_4', task: 'Retain access-request logs for audit response', desc: 'Keep a defensible record of every consumer rights request and its fulfillment for regulatory inquiry.' }
    ]
  },
  {
    id: 'fedramp_high',
    title: 'FedRAMP High - Baseline Access & Cryptographic Controls',
    target: 'Federal Agency Providers & SaaS Contractors',
    category: 'Compliance & Regulatory',
    difficulty: 'Advanced',
    checks: [
      { id: 'fedramp_1', task: 'AC-2: Automated Account Management & PIM', desc: 'Configure strict automated provisioning integrations (SCIM) and Just-in-Time (JIT) administrative elevations, ensuring all accounts are audited and deactivated on inactivity.' },
      { id: 'fedramp_2', task: 'IA-2(1): Phishing-Resistant MFA (FIDO2 / PIV / CAC)', desc: 'Enforce verifier-impersonation-resistant multi-factor authentication (PIV/CAC cards or hardware FIDO2 keys) for all local and network access.' },
      { id: 'fedramp_3', task: 'SC-13: FIPS 140-3 Validated Cryptographic Modules', desc: 'Enforce strictly validated FIPS 140-3 cryptographic modules for all digital signatures, secure key exchanges (mTLS), and database encryption-at-rest.' },
      { id: 'fedramp_4', task: 'AU-2: Comprehensive Audit Event Logs (SIEM)', desc: 'Configure central security logging recording identity handshakes, session revocations, and configuration modifications, streaming to a secure, write-once SIEM vault.' }
    ]
  },
  {
    id: 'dora_ict',
    title: 'DORA ICT Third-Party & Access Control Checklist',
    target: 'EU Financial Entities & ICT Providers',
    category: 'Compliance & Regulatory',
    difficulty: 'Advanced',
    checks: [
      { id: 'dora_1', task: 'Maintain a register of critical ICT third-party access', desc: 'Inventory every third-party identity/system with privileged access to critical functions, per DORA\'s register-of-information requirement.' },
      { id: 'dora_2', task: 'Include authentication paths in resilience testing', desc: 'Cover identity provider, MFA, and session-management failure scenarios in digital operational resilience testing, not just infrastructure failover.' },
      { id: 'dora_3', task: 'Maintain identity-related major-incident reporting readiness', desc: 'Be able to produce authentication/access timelines quickly enough to meet DORA\'s incident-reporting deadlines.' },
      { id: 'dora_4', task: 'Define an exit strategy for privileged vendor access', desc: 'Document how privileged third-party ICT access is fully revoked and re-owned if a critical vendor relationship ends.' }
    ]
  }
]
