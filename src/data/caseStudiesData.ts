// Single source of truth for the /case-studies "Enterprise Identity Case Study Center" — every
// entry here automatically renders as a card on CaseStudyCenter.tsx AND becomes searchable/
// deep-linkable (?study=<id>) via searchService.ts. Add a new case study by appending one object
// below; nothing else needs to be edited to make it searchable (see GEMINI.md §4R).
export type CaseStudyCategory = 'Big Technology' | 'Financial Services' | 'Government' | 'Healthcare' | 'Retail' | 'Education'

export interface CaseStudy {
  id: string
  title: string
  company: string
  logo: string
  category: CaseStudyCategory
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  summary: string
  problem: string
  requirements: string[]
  challenges: string[]
  architecture: string
  authModel: string
  authzModel: string
  lifecycle: string
  federation: string
  sequence: string
  threatModel: { risk: string; mitigation: string }[]
  lessons: string[]
  mistakes: string[]
  bestPractices: string[]
  interviewQuestions: { q: string; a: string }[]
  rfcs: string[]
  relatedResources: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
}

// Derived, deduplicated list of categories actually in use by CASE_STUDIES — avoids the
// filter-button UI drifting out of sync with a hand-typed duplicate array.
export const CASE_STUDY_CATEGORIES: CaseStudyCategory[] = ['Big Technology', 'Financial Services', 'Government', 'Healthcare', 'Retail', 'Education']

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'netflix',
    title: 'Scaling Edge Gateway Security & mTLS Mesh',
    company: 'Netflix',
    logo: '🍿',
    category: 'Big Technology',
    difficulty: 'Advanced',
    summary: 'Deconstruct Netflix’s edge architecture, utilizing Zuul API Gateway, stateless cryptographic tokens, and service-to-service mTLS mesh powered by SPIFFE/SPIRE.',
    problem: 'Securing thousands of decoupled microservices processing billions of daily video requests without incurring heavy database lookup latencies or relying on fragile static keys.',
    requirements: [
      'Stateless, cryptographically signed token verification at high frequency.',
      'Zero-trust, automated non-human identity (NHI) issuance.',
      'Continuous trust evaluation for API boundaries.'
    ],
    challenges: [
      'Database bottleneck when performing stateful session checks across microservices.',
      'Key rotation failures during high-velocity deployments.',
      'Mitigating token replay attacks across decoupled clouds.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                     NETFLIX EDGE TOPOLOGY                   |
+-------------------------------------------------------------+

             [ Consumer Device / Smart TV ]
                           |  (HTTPS + JWT/DPoP)
                           v
              [ Zuul API Edge Gateway ]
                           |
            +--------------+--------------+
            |  (mTLS + SPIFFE/SPIRE Cert)  |
            v                             v
   [ User Microservice ]         [ Billing Microservice ]
`,
    authModel: 'Consumer Smart TVs and mobile clients authenticate via OAuth 2.0 Authorization Code Flow + PKCE. Upon validation, the Zuul edge gateway issues a stateless, encrypted token containing validated claims, which is propagated down to downstream microservices.',
    authzModel: 'Coarse-grained Authorization is validated at the Zuul Edge Gateway. Microservices implement fine-grained Attribute-Based Access Control (ABAC) using localized policy engine checks to verify resource ownership claims.',
    lifecycle: 'Non-human service identity credentials (X.509 SVIDs) are issued dynamically with short lifespans (typically 1 hour) using SPIFFE/SPIRE agents linked to local Kubernetes nodes.',
    federation: 'Integrates with public identity authorities and telco partners via OpenID Connect (OIDC) to streamline smart TV partner onboardings.',
    sequence: `
 Zuul Edge Gateway           User Service           SPIRE Authority
       |                          |                        |
       |----- Validate JWT ------>|                        |
       |                          |                        |
       |                          |<-- Fetch SVID Cert ----|
       |<==== Secure mTLS Handshake ======================>|
`,
    threatModel: [
      { risk: 'Token hijacking via public client interception', mitigation: 'Mandate strict sender-constrained tokens (DPoP - RFC 9449).' },
      { risk: 'Service-to-service impersonation', mitigation: 'Automated mTLS validation using short-lived SPIFFE/SPIRE certificate identities.' }
    ],
    lessons: [
      'Stateless tokens are essential for scaling edge APIs but require strict, short-lived lifespans.',
      'Decoupling token validation from DB state improves fault tolerance dramatically.'
    ],
    mistakes: [
      'Initially relying on static long-lived private certificates which failed key rotation under load.',
      'Forgetting to validate JWT signature algorithms at internal microservice entry points.'
    ],
    bestPractices: [
      'Enforce strict expiration limits (exp) on all tokens.',
      'Pin and restrict mTLS handshakes to specific corporate Certificate Authorities (CAs).'
    ],
    interviewQuestions: [
      { q: 'How does Netflix secure service-to-service calls stateless-ly?', a: 'They use SPIFFE/SPIRE to issue short-lived, cryptographically verifiable X.509 SVID credentials to individual workloads, securing pipelines via mutual TLS (mTLS) without relying on static shared API keys.' }
    ],
    rfcs: ['RFC 7519 (JWT)', 'RFC 9449 (DPoP)', 'RFC 8693 (Token Exchange)'],
    relatedResources: [
      { title: 'Workload Mesh (SPIFFE) Playground', path: '/playground/workload-mesh', type: 'playground' },
      { title: 'JWT Decoder Tool', path: '/tools/jwt-decoder', type: 'tool' },
      { title: 'Enterprise JWT Middleware Reference', path: '/references', type: 'references' }
    ]
  },
  {
    id: 'uber',
    title: 'Consumer Passwordless & FIDO2 Passkeys Integration',
    company: 'Uber',
    logo: '🚗',
    category: 'Big Technology',
    difficulty: 'Intermediate',
    summary: 'Explore how Uber transitioned millions of drivers and consumers away from phishable SMS MFA toward hardware-backed FIDO2 Passkey logins.',
    problem: 'High volumes of driver credential-stuffing and social-engineering phishing attacks bypassing SMS/MFA prompts, leading to session takeovers and account compromises.',
    requirements: [
      'Phishing-resistant authentication across iOS, Android, and web clients.',
      'Zero driver-friction biometric authentication (Touch ID / Face ID).',
      'Offline cryptographic authentication support.'
    ],
    challenges: [
      'Legacy Android devices lacking local hardware Secure Enclave TPMs.',
      'Driver onboarding friction when transitioning away from traditional passwords.',
      'Syncing credentials securely across personal consumer clouds.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                    UBER FIDO2 LOGIN HANDSHAKE               |
+-------------------------------------------------------------+

      [ Driver Mobile Device ]         [ Uber Auth Gateway ]
                 |                              |
                 |--- 1. Get Login Challenge -->|
                 |<-- 2. Challenge (random) ----|
                 |                              |
      [ Secure Enclave TPM ]                    |
      - Sign Challenge with Private Key         |
                 |                              |
                 |--- 3. Signed Assertion ----->|
                 |<-- 4. Verify with Pub Key ---|
`,
    authModel: 'Biometric passkey authentication utilizing asymmetric public-key cryptography (WebAuthn/FIDO2). Drivers generate local private/public key pairs during registration, registering only the public key to Uber servers.',
    authzModel: 'Role-Based Access Control (RBAC) maps drivers, consumers, and merchants to specific gateway permissions, validated against active session tokens on each REST API endpoint.',
    lifecycle: 'Enclaves generate persistent, un-exportable private keys. Passkey credentials are synchronized across user Cloud environments (e.g., Apple Keychain, Google Password Manager) for backup.',
    federation: 'Maintains federated OAuth 2.0 social gateways (Google, Apple) as fallback options, utilizing step-up device trust checks upon risk detection.',
    sequence: `
 Driver App             Local TPM Enclave            Uber Servers
     |                          |                          |
     |---- Request Challenge ----------------------------->|
     |<--- Send Challenge (bytes) -------------------------|
     |                          |                          |
     |--- Sign Challenge ======>|                          |
     |<-- Signed Bytes <========|                          |
     |                                                     |
     |---- Send Cryptographic Signature ------------------>|
`,
    threatModel: [
      { risk: 'Phishing website harvests driver logins', mitigation: 'FIDO2 WebAuthn bindings tie the signature strictly to the origin domain, causing verification to fail on spoof sites.' },
      { risk: 'Session hijacking via stolen cookie tokens', mitigation: 'Implement Device Posture Attestation and DPoP sender constraints.' }
    ],
    lessons: [
      'SMS MFA is no longer secure against motivated social-engineering or SIM-swap attacks.',
      'Passkeys provide superior security while drastically reducing driver login times (frictionless UX).'
    ],
    mistakes: [
      'Initially allowing driver logins from domains with weak redirect white-lists.',
      'Failing to validate the authenticatorData byte-offsets correctly, causing validation crashes on legacy browsers.'
    ],
    bestPractices: [
      'Enforce WebAuthn origin-matching strictly on your servers.',
      'Map driver session trust decaying metrics continuously.'
    ],
    interviewQuestions: [
      { q: 'Why is FIDO2/WebAuthn resistant to phishing?', a: 'Because the FIDO2 standard mandates that the browser signs the login challenge using keys tied strictly to the specific origin domain (e.g., login.uber.com). It will refuse to sign for spoof sites (e.g., uber-login-fraud.com).' }
    ],
    rfcs: ['WebAuthn (W3C Standard)', 'FIDO2 Core Spec'],
    relatedResources: [
      { title: 'FIDO2 WebAuthn Lab', path: '/playground/fido2', type: 'playground' },
      { title: 'Passkey Internals Playground', path: '/playground/passkey-internals', type: 'playground' },
      { title: 'Passphrase Entropy Calculator', path: '/tools/passphrase-entropy', type: 'tool' }
    ]
  },
  {
    id: 'cloudflare',
    title: 'Zero Trust Access & Employee Device Posture',
    company: 'Cloudflare',
    logo: '☁️',
    category: 'Big Technology',
    difficulty: 'Advanced',
    summary: 'Deconstruct how Cloudflare replaced corporate VPNs with a Zero Trust Access model, verifying employee device compliance, networks, and biometric status continuously.',
    problem: 'Securing administrative and internal corporate resources from compromise without VPN bottlenecks, enforcing continuous device-compliance checks globally.',
    requirements: [
      'Elimination of static, open perimeter corporate VPN targets.',
      'Continuous device posture validation (firewall active, disk encrypted).',
      'MFA step-up prompts upon anomaly detection.'
    ],
    challenges: [
      'Enforcing posture checks on heterogeneous developer environments (macOS, Windows, Linux).',
      'Minimizing network latency when evaluating access policies on every HTTP request.',
      'Handling secure contractor access without enrolling external devices in local MDMs.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                CLOUDFLARE ZERO TRUST PIPELINE               |
+-------------------------------------------------------------+

      [ Employee Device ]  ===> [ Cloudflare Access Gateway ] ===> [ Internal Admin Portal ]
               |                             |
         - Firewalls Active?           - Evaluates Access
         - MDM Compliance?               Policies in parallel
         - mTLS Certificate?
`,
    authModel: 'Context-aware authentication checking employee corporate OIDC credentials, client mutual TLS (mTLS) certificates, and active local posture status synchronously.',
    authzModel: 'Dynamic Attribute-Based Access Control (ABAC) evaluating user department, device health state, geolocation, and current risk score.',
    lifecycle: 'Employee accounts are synced directly from corporate Identity Providers (Okta/Entra ID) using SCIM directory loops, ensuring instant account revocation upon termination.',
    federation: 'Utilizes federated OIDC Single Sign-On (SSO) mapped to Cloudflare Access Gateways, requiring mutual TLS checks on the browser client.',
    sequence: `
 Employee Browser        Access Gateway        Identity Provider (Okta)
        |                      |                          |
        |--- Request Portal -->|                          |
        |                      |--- Redirect OIDC ------->|
        |                      |<-- ID Token (JWT) -------|
        |--- Send Client cert >|                          |
`,
    threatModel: [
      { risk: 'Compromised admin credentials used on private device', mitigation: 'Block connection if device lacks active MDM compliance posture and client mTLS certificate.' },
      { risk: 'Session hijacking via stolen cookie', mitigation: 'Continuous Ambient Trust evaluation decays session immediately if device network changes.' }
    ],
    lessons: [
      'Secure perimeters (VPNs) are obsolete. Verifying the individual endpoint state continuously is mandatory.',
      'SCIM automated directory syncing prevents "orphaned accounts" from remaining active after offboarding.'
    ],
    mistakes: [
      'Assuming static certificate possession equals device compliance. Certificates must be paired with active posture checks.',
      'Over-complicating policies, leading to accidental developer lockouts.'
    ],
    bestPractices: [
      'Enforce continuous post-login trust evaluations.',
      'Enforce device compliance posture audits natively on modern OS layers.'
    ],
    interviewQuestions: [
      { q: 'How does Zero Trust replace a corporate VPN?', a: 'By removing the concept of a trusted internal network. Every request is treated as external, untrusted, and must prove identity, client certificate possession, and compliance posture (e.g. disk encryption status) dynamically before accessing a portal.' }
    ],
    rfcs: ['NIST SP 800-207 (Zero Trust Architecture)', 'RFC 8252 (OAuth 2.0 for Native Apps)'],
    relatedResources: [
      { title: 'Zero Trust Architecture (ZTA) Planner', path: '/playground/zta', type: 'playground' },
      { title: 'Device Trust & Posture Attestation Lab', path: '/playground/device-trust', type: 'playground' },
      { title: 'OIDC Discovery Auditor Tool', path: '/tools/oidc-discovery', type: 'tool' }
    ]
  },
  {
    id: 'thales_financial_ciam',
    title: 'PSD2 Strong Authentication & Delegated Consent CIAM',
    company: 'Thales OneWelcome Platform',
    logo: '🛡️',
    category: 'Financial Services',
    difficulty: 'Advanced',
    summary: 'Deconstruct a Tier-1 retail bank’s transition to a frictionless, PSD2-compliant Customer IAM model utilizing Thales OneWelcome’s Identity Orchestrator, mobile biometric signatures, and delegated administration.',
    problem: 'Heavy user abandonment in digital onboarding due to disjointed KYC verification, coupled with complex PSD2 Strong Customer Authentication (SCA) mandates on wire transfers.',
    requirements: [
      'Secure, GDPR-compliant Consent & Preference tracking with cryptographic event receipts.',
      'Seamless integration with third-party digital KYC/passport liveness checks.',
      'Phishing-resistant transaction signing via mobile FIDO2 authenticators.'
    ],
    challenges: [
      'Orchestrating diverse localized KYC vendors across multiple European borders dynamically.',
      'Enabling partner business administrators (delegated admin) to self-manage accounts without central directory burdens.',
      'Minimizing authentication fatigue during low-risk micro-transactions.'
    ],
    architecture: `
+-------------------------------------------------------------+
|               THALES ONEWELCOME BANKING CIAM FLOW           |
+-------------------------------------------------------------+

                     [ New Retail Customer ]
                                | (Register & KYC)
                                v
               [ OneWelcome Identity Orchestrator ]
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
  [ AI Pass-Liveness Scan ]               [ GDPR Consent Registry ]
             |                                     |
             +------------------+------------------+
                                |
                                v
                [ Issued Banking Wallet / FIDO2 ]
`,
    authModel: 'Customers authenticate utilizing WebAuthn biometrics / Passkeys on registered devices. Wire transfers exceeding PSD2 thresholds prompt a server-initiated mobile push notification triggering a cryptographic signature generated in the device’s Hardware Enclave (TPM).',
    authzModel: 'Coarse-grained authentication is governed by OneWelcome. Fine-grained transaction thresholds and delegated corporate capabilities are validated against localized banking ABAC rules.',
    lifecycle: 'External consumer lifecycle events (Onboarding, Account Lockout, Re-KYC verification) are orchestrated via no-code visual workflow graphs, synchronizing directory state dynamically across database clusters.',
    federation: 'Seamlessly federates identity credentials across secondary banking partners, payment networks, and open banking API gateways utilizing standard OpenID Connect (OIDC) core specifications.',
    sequence: `
 Customer Device             OneWelcome Orchestrator         KYC / Passport API
        |                              |                             |
        |------ Submit Selfie -------->|                             |
        |                              |----- Verify Passport ------>|
        |                              |<==== Liveness Verified =====|
        |<--- Prompt GDPR Consent -----|                             |
        |====== Consent Stored =======>|                             |
`,
    threatModel: [
      { risk: 'GDPR user consent audit falsification', mitigation: 'Store consent authorizations as cryptographic events inside the immutable database registry.' },
      { risk: 'Wire transfer hijack (Man-in-the-Middle)', mitigation: 'Enforce PSD2-compliant mobile push transaction signing containing target account and price hashes.' }
    ],
    lessons: [
      'Visual Identity Orchestrators allow security teams to modify KYC check sequence branches without rewriting main app code.',
      'Delegated administration is essential for B2B and partner federations, transferring profile helpdesk load directly to the partners.',
      'Integrating document OCR scanners directly into registration portals cuts bank onboarding times in half.'
    ],
    mistakes: [
      'Failing to tie OIDC session cookies to exact custom domains, which causes modern browsers to drop OIDC authorization cookies.',
      'Enforcing rigid, complex password-composition rules on consumer databases, driving customers back to high-friction SMS recovery paths.'
    ],
    bestPractices: [
      'Enable adaptive risk engines (SafeNet Trusted Access) checking IP speed velocities to skip MFA on familiar customer paths.',
      'Provide a centralized self-service portal for GDPR consent reviews, satisfying EU Article 7 privacy mandates natively.'
    ],
    interviewQuestions: [
      { q: 'What is PSD2 Strong Customer Authentication (SCA) and how does Thales satisfy it?', a: 'SCA requires logins or transfers to verify at least two independent factors: knowledge (something you know), possession (something you have), or inherence (something you are). Thales achieves this via mobile biometric push notifications or hardware FIDO2 tokens, generating signed cryptographic assertions tied directly to the transfer transaction context.' }
    ],
    rfcs: ['RFC 7519 (JSON Web Tokens)', 'RFC 6749 (OAuth 2.0 Framework)', 'W3C WebAuthn'],
    relatedResources: [
      { title: 'SAML Metadata Builder Tool', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'SCIM Provisioning Lab', path: '/playground/scim', type: 'playground' },
      { title: 'OAuth Request Builder Tool', path: '/tools/oauth-builder', type: 'tool' }
    ]
  },
  {
    id: 'google_beyondcorp',
    title: 'BeyondCorp Zero Trust Network Access (ZTNA)',
    company: 'Google',
    logo: '🌐',
    category: 'Big Technology',
    difficulty: 'Advanced',
    summary: 'Explore Google’s pioneer BeyondCorp Zero Trust model, detailing Access Gateways, strict context-aware device posture audits, client-side certificates, and unified enterprise authorization proxies.',
    problem: 'Securing administrative and internal corporate resources globally for over 100,000 employees without relying on vulnerable, perimeter-based corporate VPN networks.',
    requirements: [
      'Complete removal of network location as an access authorization vector.',
      'Enforcing client device compliance (OS updates, disk encryption, MDM status) natively.',
      'Unified reverse proxy acting as a single point of resource egress.'
    ],
    challenges: [
      'Evaluating device telemetry state dynamically on every HTTP request without incurring latencies.',
      'Migrating thousands of legacy corporate portals to standard OIDC and reverse proxy routes.',
      'Managing public trust chains for client-side mutual TLS (mTLS) browser certificates.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                     GOOGLE BEYONDCORP ZTNA                  |
+-------------------------------------------------------------+

      [ Employee Device ] ===> [ BeyondCorp Access Proxy ] ===> [ Google Corp Apps ]
               |                         ^
        - Client Certificate?            | (Validates context via PDP)
        - MDM Compliance Check?          v
               +=============> [ Context Trust Engine ]
`,
    authModel: 'Context-aware authentication checking corporate single sign-on (SSO) credentials, client mutual TLS (mTLS) device certificates, and active local posture status synchronously.',
    authzModel: 'Dynamic Attribute-Based Access Control (ABAC) evaluating user department, device health state, geolocation, and current risk score.',
    lifecycle: 'Employee accounts are synced directly from corporate Identity Providers (Okta/Entra ID) using SCIM directory loops, ensuring instant account revocation upon termination.',
    federation: 'Utilizes federated OIDC Single Sign-On (SSO) mapped to the internal Access Proxy, requiring mutual TLS checks on the browser client for every corporate application.',
    sequence: `
 Employee Browser        BeyondCorp Access Proxy       Context Engine
        |                          |                          |
        |--- Request App --------->|                          |
        |                          |--- Get Telemetry ------->|
        |                          |<-- Posture Verified -----|
        |<== Access Granted =======|                          |
`,
    threatModel: [
      { risk: 'Credential theft via credential stuffing', mitigation: 'Access is completely blocked if the device lacks active corporate MDM posture or is missing the client mTLS certificate.' },
      { risk: 'Lateral movement after network perimeter compromise', mitigation: 'BeyondCorp removes trust from local networks entirely. Access is evaluated on every application endpoint individually.' }
    ],
    lessons: [
      'Network location (internal IP) must never be trusted. Treat every connection as external.',
      'Real-time posture evaluations are highly resilient compared to static daily compliance audits.'
    ],
    mistakes: [
      'Initially attempting to roll out posture requirements too aggressively, leading to developer friction and workflow lockouts.',
      'Allowing fallback access without client-side certificates in remote branch offices.'
    ],
    bestPractices: [
      'Ensure the reverse proxy caches authorization decisions at the edge for sub-millisecond latencies.',
      'Integrate client-side certificates directly into hardware TPM enclaves.'
    ],
    interviewQuestions: [
      { q: 'What is the core philosophy of Google BeyondCorp?', a: 'To move access controls from the network perimeter to individual users and devices. This enables all employees to work securely from any location without a VPN, by evaluating access context (device state, client certificates, identity) dynamically on every request.' }
    ],
    rfcs: ['NIST SP 800-207 (Zero Trust Architecture)', 'RFC 8252 (OAuth 2.0 for Native Apps)'],
    relatedResources: [
      { title: 'Zero Trust Architecture (ZTA) Planner', path: '/playground/zta', type: 'playground' },
      { title: 'Device Posture MDM Attestation Lab', path: '/playground/device-trust', type: 'playground' },
      { title: 'OIDC Discovery Auditor Tool', path: '/tools/oidc-discovery', type: 'tool' }
    ]
  },
  {
    id: 'slack_scim_scale',
    title: 'Scalable SCIM Directory Sync & Org Provisioning',
    company: 'Slack',
    logo: '💬',
    category: 'Big Technology',
    difficulty: 'Intermediate',
    summary: 'Deconstruct how Slack scales enterprise directories using the SCIM 2.0 protocol, managing millions of workspace members, automated group synchronization, rate-limiting HTTP 429 backqueues, and real-time reconciliation loops.',
    problem: 'Provisioning and synchronizing millions of channel members and workspaces across hundreds of independent enterprise customers without crashing directory servers during massive hiring/layoff cycles.',
    requirements: [
      'Full support for RFC 7643 and 7644 SCIM 2.0 REST specifications.',
      'Real-time automated group synchronization and workspace assignment mapping.',
      'Resilient queueing to handle high-velocity bulk updates from Entra ID/Okta.'
    ],
    challenges: [
      'Preventing API server crashes when enterprise clients trigger massive bulk sync dumps.',
      'Handling SCIM PATCH reconciliation conflicts when user email addresses change.',
      'Optimizing DB locks during simultaneous user provisioning and group mapping operations.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                     SLACK HIGH-SCALE SCIM FLOW              |
+-------------------------------------------------------------+

      [ Customer IdP (Okta) ] ===> [ SCIM REST API Gateway ] ===> [ Message Queue (Kafka) ]
                                            |
                                            v (Processes jobs asynchronously)
                                    [ Slack Database ]
`,
    authModel: 'Identity Providers (IdPs) authenticate against Slack\'s SCIM REST endpoints using highly secure, long-lived, scoped OAuth Bearer Tokens or administrative API keys.',
    authzModel: 'Coarse-grained route authorization is verified at the API Gateway. Fine-grained user role and channel membership configurations are resolved during queue consumption in the Slack DB.',
    lifecycle: 'Active account lifecycles (create, update, suspend, delete) are processed asynchronously via queues. When a user is deactivated in the customer directory, a SCIM `active: false` PATCH is dispatched, instantly terminating all active WebSocket connections.',
    federation: 'Federated directories are managed per enterprise org partition, allowing custom attribute mapping and OIDC-linked SSO connections.',
    sequence: `
 Customer IdP             SCIM API Gateway           Slack DB Queue
      |                          |                          |
      |--- POST /Users (JSON) -->|                          |
      |                          |--- Push Sync Job ------->|
      |<-- 201 Created (JSON) ---|                          |
`,
    threatModel: [
      { risk: 'Orphaned accounts retaining access post-termination', mitigation: 'Enforce real-time SCIM de-provisioning loops that disable the account and invalidate session cookies instantly.' },
      { risk: 'SCIM API credential leakage', mitigation: 'Utilize short-lived, scoped OAuth client credentials for directory sync operations with strict IP white-listing.' }
    ],
    lessons: [
      'SCIM 2.0 is the gold standard for enterprise lifecycle automation, eliminating manual offboarding slipups.',
      'Asynchronous job queues are essential to prevent API gateways from timing out during bulk synchronizations.'
    ],
    mistakes: [
      'Initially attempting to run SCIM sync calls synchronously, causing database locks and REST gateway timeouts during enterprise-wide profile updates.',
      'Ignoring SCIM schema mismatch validations, leading to partial profile corruptions.'
    ],
    bestPractices: [
      'Implement resilient HTTP 429 rate-limiting backoff policies with retry queues.',
      'Enforce clean, unique constraints on the externalId parameter to prevent duplicate member provisioning.'
    ],
    interviewQuestions: [
      { q: 'Why is SCIM essential for enterprise IAM over simple SSO?', a: 'SSO only authenticates a user once they actively click to log in (just-in-time). SCIM runs continuously in the background, automatically creating, updating, and—most importantly—instantly revoking accounts when employees leave, ensuring absolute access compliance.' }
    ],
    rfcs: ['RFC 7643 (SCIM 2.0 Schema)', 'RFC 7644 (SCIM 2.0 Protocol)'],
    relatedResources: [
      { title: 'SCIM Provisioning Lab & Sync Engine', path: '/playground/scim', type: 'playground' },
      { title: 'SCIM Payload Validator Tool', path: '/tools/scim-payload-validator', type: 'tool' },
      { title: 'SCIM Diff & Reconciliation Tool', path: '/tools/scim-diff', type: 'tool' }
    ]
  },
  {
    id: 'stripe_api_auth',
    title: 'API Client Authentication & Secure Token Exchange',
    company: 'Stripe',
    logo: '💳',
    category: 'Financial Services',
    difficulty: 'Intermediate',
    summary: 'Deconstruct Stripe’s API authentication model, detailing API keys, secure Bearer token exchanges, DPoP, and secure machine-to-machine (M2M) microservice delegation.',
    problem: 'Authenticating billions of secure financial transactions from third-party developer servers while restricting credentials and preventing API token exposure.',
    requirements: [
      'Secure, scoped, and revokable API keys for developers.',
      'Symmetric signature verification (HMAC) on webhook callbacks.',
      'Zero-trust workload credential exchange inside microservice meshes.'
    ],
    challenges: [
      'Preventing token theft via man-in-the-middle interception on developer servers.',
      'Scaling HMAC webhook delivery verification across high-frequency consumer networks.',
      'Managing M2M credential lifecycles with absolute least privilege.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                     STRIPE M2M ACCESS PIPELINE               |
+-------------------------------------------------------------+

      [ Developer Server ] ===> [ Stripe API Gateway ] ===> [ Security Token Service ]
                                        |                             ^
                                 - Validates API Key                  | (Swaps key for scoped DEK)
                                        +-----------------------------+
`,
    authModel: 'Clients authenticate server-side utilizing standard scoped REST API keys (e.g., `sk_live_...`). Internal microservices exchange these developer credentials for highly restricted, short-lived tokens via a central Security Token Service (STS) mapping.',
    authzModel: 'Explicit role and resource scope restrictions. Webhook callback endpoints utilize HMAC-SHA256 signature hashes containing a timestamp header, blocking replay attacks.',
    lifecycle: 'API keys are rotated dynamically with zero downtime using rolling key pairs. Workload tokens are ephemeral (10-minute expirations), automatically managed by local SPIRE and OAuth clients.',
    federation: 'Federates partner developer integrations utilizing custom OAuth 2.0 Connect gateways, allowing third-party platforms to perform actions on behalf of merchant accounts safely.',
    sequence: `
 Developer Server           Stripe API Gateway          Security Token Service
        |                            |                             |
        |--- POST /Charge (API Key)->|                             |
        |                            |--- Request Token Swap ----->|
        |                            |<-- Scoped Downstream Token -|
        |<-- 200 Paid (JSON) --------|                             |
`,
    threatModel: [
      { risk: 'Leaked API keys in developer repositories', mitigation: 'Implement active GitHub scanning for API key prefixes, instantly triggering auto-revocation and warning alerts.' },
      { risk: 'Webhook spoofing attacks', mitigation: 'Webhook endpoints verify the HMAC-SHA256 signature generated using a shared webhook secret, confirming payload authenticity.' }
    ],
    lessons: [
      'Workload credentials must follow the least privilege model. Swap broad edge keys for restricted downstream tokens instantly.',
      'Webhooks require strict signature validation and timestamp assertions to prevent malicious replays.'
    ],
    mistakes: [
      'Allowing wildcard scopes on developer API keys by default, making leaked credentials highly dangerous.',
      'Initially failing to validate webhook timestamps, leaving endpoints open to replay hacks.'
    ],
    bestPractices: [
      'Prefix API keys (e.g., `sk_live_`) to enable rapid detection by regex scanners.',
      'Enforce DPoP (Demonstrating Proof-of-Possession) for sensitive partner API integrations.'
    ],
    interviewQuestions: [
      { q: 'Why should an API use Token Exchange instead of forwarding the developer API key?', a: 'To protect the key and enforce least privilege. Forwarding the original key to internal services exposes it unnecessarily. Swapping the key at the gateway for a highly restricted, short-lived token scoped only for the necessary downstream calls prevents lateral movement and token abuse.' }
    ],
    rfcs: ['RFC 8693 (Token Exchange)', 'RFC 9449 (DPoP)', 'RFC 6749 (OAuth 2.0 Framework)'],
    relatedResources: [
      { title: 'Token Exchange (RFC 8693) Lab', path: '/playground/token-exchange', type: 'playground' },
      { title: 'HMAC Signature Generator Tool', path: '/tools/hmac-generator', type: 'tool' },
      { title: 'OIDC Request Builder Tool', path: '/tools/oauth-builder', type: 'tool' }
    ]
  },
  {
    id: 'login_gov_ial2',
    title: 'Federated Identity Verification & IAL2 Proofing',
    company: 'Login.gov (U.S. GSA)',
    logo: '🏛️',
    category: 'Government',
    difficulty: 'Beginner',
    summary: 'Understand how a shared government identity platform lets citizens use one verified account to access many public benefits sites, using OIDC federation and NIST 800-63 identity-proofing levels.',
    problem: 'Dozens of independent government benefits agencies each building their own login system, forcing citizens to create and remember separate accounts and re-prove their identity repeatedly.',
    requirements: [
      'A single, reusable citizen identity federated across many independent agency websites.',
      'Standards-based identity proofing matching NIST SP 800-63-3 Identity Assurance Level 2 (IAL2).',
      'Phishing-resistant MFA options (authenticator app, security key, or backup codes).'
    ],
    challenges: [
      'Verifying a real-world identity (documents + selfie liveness) without a physical office visit.',
      'Keeping agency-specific data siloed while sharing only a verified identity assertion.',
      'Supporting citizens with limited smartphone access or older devices.'
    ],
    architecture: `
+-------------------------------------------------------------+
|                 GOVERNMENT FEDERATED LOGIN FLOW              |
+-------------------------------------------------------------+

    [ Citizen Browser ]        [ Shared Identity Platform ]      [ Agency Benefits Site ]
             |                          |                                  |
             |--- 1. Click "Sign in" -->|                                  |
             |<-- 2. Redirect to IdP ---|                                  |
             |--- 3. Verify + MFA ----->|                                  |
             |<== 4. OIDC ID Token (signed) ==========================>    |
`,
    authModel: 'Citizens authenticate once at the shared identity platform using a password plus a phishing-resistant second factor (TOTP app, hardware security key, or backup codes), then are redirected back to the agency site with a signed OIDC ID Token.',
    authzModel: 'Each agency independently authorizes what the citizen can do inside its own system; the shared platform only asserts "this is a verified person," never agency-specific entitlements.',
    lifecycle: 'A single citizen account is proofed once (IAL2) and reused across every participating agency; re-proofing is only triggered if the identity evidence expires or a fraud signal is raised.',
    federation: 'Every participating agency integrates as a standard OpenID Connect Relying Party against one central OIDC Provider, avoiding bespoke point-to-point integrations.',
    sequence: `
 Citizen              Identity Platform         Agency Site (RP)
    |                        |                        |
    |-- Visit agency page -------------------------->|
    |<-- Redirect to /authorize ----------------------|
    |-- Login + MFA -------->|                        |
    |<-- Redirect w/ code ---|                        |
    |                        |<-- Exchange code ------|
    |                        |--- ID Token (JWT) ----->|
`,
    threatModel: [
      { risk: 'Fraudulent document submission during proofing', mitigation: 'Combine automated document liveness/tamper checks with a live selfie match before granting IAL2 status.' },
      { risk: 'Phishing of the shared login page', mitigation: 'Require a phishing-resistant second factor (WebAuthn security key or authenticator app) rather than SMS codes.' }
    ],
    lessons: [
      'Proofing identity once and federating it everywhere is far cheaper than every agency re-building proofing independently.',
      'A shared IdP must stay strictly identity-only — agencies keep their own authorization data separate to preserve citizen trust.'
    ],
    mistakes: [
      'Early SMS-only MFA options remained vulnerable to SIM-swap attacks until phishing-resistant options were prioritized.',
      'Underestimating support load from citizens without a modern smartphone for document capture.'
    ],
    bestPractices: [
      'Publish a public, standard OIDC discovery document so every agency integrates the same well-tested way.',
      'Offer multiple proofing paths (remote document + selfie, or in-person) so no single failure mode blocks access.'
    ],
    interviewQuestions: [
      { q: 'Why use IAL2 identity proofing instead of just a strong password?', a: 'A strong password only proves someone knows a secret — it says nothing about whether they are the real person. IAL2 proofing (per NIST SP 800-63-3) validates government-issued documents and a live biometric match, so the account can be trusted for higher-risk transactions like benefits or tax filings.' }
    ],
    rfcs: ['NIST SP 800-63-3 (Digital Identity Guidelines)', 'RFC 6749 (OAuth 2.0 Framework)', 'OpenID Connect Core 1.0'],
    relatedResources: [
      { title: 'OIDC Discovery Document Auditor', path: '/tools/oidc-discovery', type: 'tool' },
      { title: 'OAuth Request Builder Tool', path: '/tools/oauth-builder', type: 'tool' },
      { title: 'Standards Conformance Checker', path: '/tools/conformance-checker', type: 'tool' }
    ]
  },
  {
    id: 'healthcare_portal_hipaa',
    title: 'Patient Portal SSO & HIPAA Break-Glass Access',
    company: 'Regional Hospital Network',
    logo: '🏥',
    category: 'Healthcare',
    difficulty: 'Intermediate',
    summary: 'Examine how a hospital network unifies patient-facing SSO across its portal, telehealth, and billing apps, while giving clinicians an audited "break-glass" emergency override into records during a crisis.',
    problem: 'Clinicians need instant record access during emergencies, but standard role-based access controls can block a doctor covering an unfamiliar department — while every access must remain fully auditable under HIPAA.',
    requirements: [
      'Single sign-on across patient portal, telehealth, and billing systems via one hospital identity.',
      'Fine-grained RBAC/ABAC scoped to a clinician\'s department, shift, and patient assignment.',
      'A logged, time-boxed "break-glass" override for genuine emergencies.'
    ],
    challenges: [
      'Balancing least-privilege access controls against the real risk of blocking life-saving care.',
      'Producing a tamper-evident audit trail satisfying HIPAA Security Rule §164.312 access controls.',
      'Onboarding rotating residents and locum clinicians without manual per-system provisioning.'
    ],
    architecture: `
+-------------------------------------------------------------+
|              HOSPITAL IDENTITY & BREAK-GLASS FLOW            |
+-------------------------------------------------------------+

  [ Clinician Workstation ] --SAML/OIDC SSO--> [ Hospital IdP ] --> [ EHR / Portal / Billing ]
             |                                                              |
             |------------------ Emergency override request -------------->|
             |<----------- Break-glass grant (logged, time-boxed) ---------|
`,
    authModel: 'Clinicians authenticate once against the hospital Identity Provider via SAML 2.0 SSO with a smart-card or FIDO2 second factor; the resulting assertion is trusted by the patient portal, telehealth, and billing applications.',
    authzModel: 'Standard access uses department/shift-scoped RBAC layered with ABAC (patient assignment, ward, time-of-day). A "break-glass" role grants temporary elevated access, auto-expiring and requiring a post-hoc justification note.',
    lifecycle: 'Clinician accounts are provisioned from the HR system via SCIM on hire/rotation and instantly deactivated on termination or credential suspension; residents\' access auto-adjusts as rotations change monthly.',
    federation: 'Federates with external specialist networks and telehealth partners via SAML, so a visiting specialist authenticates with their home institution\'s IdP rather than a new hospital-issued credential.',
    sequence: `
 Clinician              Hospital IdP              EHR System
     |                        |                         |
     |-- Login + smart card ->|                          |
     |<-- SAML Assertion -----|                          |
     |------------------- Present Assertion ------------>|
     |<----- Emergency? Prompt break-glass reason --------|
     |------------------- Reason submitted -------------->|
`,
    threatModel: [
      { risk: 'Break-glass access abused for casual record browsing', mitigation: 'Every break-glass grant requires a mandatory justification note and triggers an automatic compliance-team review within 24 hours.' },
      { risk: 'Stolen clinician workstation session', mitigation: 'Enforce short session timeouts plus badge-tap re-authentication at shared nursing-station terminals.' }
    ],
    lessons: [
      'Emergency-access design must assume clinicians will occasionally need access outside their normal scope — blocking it entirely creates patient-safety risk.',
      'Auditability, not prevention alone, is what makes break-glass access defensible under HIPAA.'
    ],
    mistakes: [
      'Initially requiring a help-desk phone call for every emergency override, adding dangerous delay during codes.',
      'Failing to auto-expire break-glass grants, leaving elevated access active long after the emergency ended.'
    ],
    bestPractices: [
      'Auto-expire every break-glass grant (e.g. 4 hours) and require a documented reason before or immediately after use.',
      'Route every break-glass event to the compliance/privacy team\'s review queue automatically, not on request.'
    ],
    interviewQuestions: [
      { q: 'What is "break-glass" access and why does HIPAA compliance require it to still be tightly controlled?', a: 'Break-glass access is a deliberate emergency override that bypasses normal least-privilege restrictions so a clinician can save a life without waiting on an access request. HIPAA still requires it be logged, time-boxed, and reviewed after the fact, so the flexibility needed for emergencies never becomes an unaudited backdoor.' }
    ],
    rfcs: ['HIPAA Security Rule (45 CFR §164.312)', 'SAML 2.0 Core', 'W3C WebAuthn'],
    relatedResources: [
      { title: 'SAML Metadata Builder Tool', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'Access Control (ABAC/RBAC) Lab', path: '/playground/access', type: 'playground' },
      { title: 'Policy Evaluator Tool', path: '/tools/policy-evaluator', type: 'tool' }
    ]
  },
  {
    id: 'retail_multitenant_ciam',
    title: 'Multi-Tenant Merchant & Customer Identity at Scale',
    company: 'Global Retail Commerce Platform',
    logo: '🛒',
    category: 'Retail',
    difficulty: 'Intermediate',
    summary: 'Deconstruct how a multi-tenant e-commerce platform isolates each merchant\'s customer identity data while sharing one scalable CIAM engine across hundreds of thousands of storefronts.',
    problem: 'Every merchant storefront needs its own branded login and its own isolated customer list, but building and operating a full identity stack per-merchant would be prohibitively expensive at scale.',
    requirements: [
      'Per-merchant tenant isolation of customer profiles, sessions, and consent records.',
      'Social login and passwordless options to minimize checkout cart abandonment.',
      'Progressive profiling — collect only the customer data each merchant actually needs, when needed.'
    ],
    challenges: [
      'Preventing one merchant\'s compromised API key from exposing another merchant\'s customer data.',
      'Keeping login latency low during flash-sale traffic spikes across shared infrastructure.',
      'Reconciling loyalty/rewards identity across a customer\'s multiple merchant accounts without violating tenant isolation.'
    ],
    architecture: `
+-------------------------------------------------------------+
|              MULTI-TENANT RETAIL CIAM TOPOLOGY               |
+-------------------------------------------------------------+

   [ Shopper Browser ]  --> [ Storefront (Tenant A) ] --> [ Shared CIAM Engine ]
                                                                   |
                                                    (tenant_id scoped token + DB partition)
                                                                   v
                                                          [ Tenant A Customer Store ]
`,
    authModel: 'Shoppers authenticate per-storefront via email/passwordless magic link, social login (OAuth 2.0), or a saved passkey; every issued token is scoped with a `tenant_id` claim so it can never be replayed against a different merchant\'s API.',
    authzModel: 'Tenant isolation is enforced at both the token layer (`tenant_id` claim validated on every request) and the database layer (row-level partitioning), so a bug in one merchant\'s storefront code cannot leak another merchant\'s customers.',
    lifecycle: 'Customer accounts are created just-in-time at first checkout (progressive profiling); merchants can request additional verified attributes later without forcing a full re-registration.',
    federation: 'Supports federated social login (Google, Apple, Facebook) per storefront, and an opt-in "One Account" bridge letting a shopper link their identity across multiple storefronts on the same platform for shared loyalty points.',
    sequence: `
 Shopper                 Storefront (Tenant A)         Shared CIAM Engine
    |                            |                              |
    |--- Click "Sign in" ------->|                              |
    |                            |--- Redirect w/ tenant_id --->|
    |--- Authenticate (social) ---------------------------------->|
    |<===================== Tenant-scoped Token ===================|
`,
    threatModel: [
      { risk: 'Cross-tenant token replay', mitigation: 'Every API call validates the `tenant_id` claim against the resource being accessed, rejecting mismatches even if the token is otherwise valid.' },
      { risk: 'Credential-stuffing bots targeting checkout logins during flash sales', mitigation: 'Adaptive risk scoring and CAPTCHA step-up triggered automatically on abnormal login velocity per tenant.' }
    ],
    lessons: [
      'Passwordless and social login options measurably reduce cart abandonment compared to forced account creation.',
      'Tenant isolation must be enforced at more than one layer — token claims alone are not sufficient without matching database-level partitioning.'
    ],
    mistakes: [
      'An early version validated `tenant_id` only in the UI layer, not the API layer, allowing a crafted request to cross tenant boundaries.',
      'Forcing full profile completion (address, phone, DOB) before allowing a first purchase, which discouraged first-time shoppers.'
    ],
    bestPractices: [
      'Default new merchants to progressive profiling — collect only what is needed for the transaction at hand.',
      'Rate-limit and monitor login attempts per tenant independently, not just globally.'
    ],
    interviewQuestions: [
      { q: 'How would you design customer identity isolation for a multi-tenant e-commerce platform?', a: 'Scope every session token with a tenant identifier claim, validate that claim on every backend request (not just at login), and back it with database-level partitioning so a bug or leaked token in one tenant cannot expose another tenant\'s customer data.' }
    ],
    rfcs: ['RFC 6749 (OAuth 2.0 Framework)', 'RFC 7519 (JSON Web Tokens)'],
    relatedResources: [
      { title: 'OAuth Request Builder Tool', path: '/tools/oauth-builder', type: 'tool' },
      { title: 'JWT Decoder Tool', path: '/tools/jwt-decoder', type: 'tool' },
      { title: 'Access Control (ABAC/RBAC) Lab', path: '/playground/access', type: 'playground' }
    ]
  },
  {
    id: 'university_federated_sso',
    title: 'University Federated SSO via Shibboleth & eduGAIN',
    company: 'State University Consortium',
    logo: '🎓',
    category: 'Education',
    difficulty: 'Beginner',
    summary: 'Learn how universities let students and researchers use one campus login across library databases, learning platforms, and thousands of partner institutions worldwide through SAML federation.',
    problem: 'Students and researchers need access to hundreds of external library, journal, and research-collaboration systems, but no single vendor can maintain direct accounts for every university in the world.',
    requirements: [
      'One campus login usable across internal systems (LMS, email, library) and external partner services.',
      'Interoperability with thousands of other institutions worldwide without bilateral integration work.',
      'Single logout so a session ends everywhere when a student logs out or graduates.'
    ],
    challenges: [
      'Every external service needing a different, non-standard set of user attributes.',
      'Handling identity federation with institutions in dozens of countries and legal jurisdictions.',
      'Deactivating access promptly when a student graduates or a researcher\'s affiliation ends.'
    ],
    architecture: `
+-------------------------------------------------------------+
|             UNIVERSITY SAML FEDERATION (eduGAIN)             |
+-------------------------------------------------------------+

  [ Student Browser ] -> [ Campus IdP (Shibboleth) ] -> [ eduGAIN Metadata Federation ]
                                                                    |
                                                                    v
                                                     [ Partner Library / Journal (SP) ]
`,
    authModel: 'Students authenticate once at their home campus Identity Provider (Shibboleth) using their standard university credentials; the resulting SAML assertion is trusted by any partner Service Provider that trusts the eduGAIN federation metadata.',
    authzModel: 'Access decisions at each partner service are typically attribute-based (e.g. `eduPersonAffiliation: student` or `staff`), letting a journal grant access to any enrolled student worldwide without knowing them individually in advance.',
    lifecycle: 'Student and staff directory records are synced from the campus registrar; SAML attribute release is automatically cut off the moment a student\'s registrar record marks them as graduated or withdrawn.',
    federation: 'Joins the global eduGAIN interfederation, letting the university\'s IdP be automatically trusted by thousands of participating research and library Service Providers without individual bilateral agreements.',
    sequence: `
 Student                Campus IdP (Shibboleth)      Partner Library (SP)
    |                           |                            |
    |-- Visit library resource ------------------------------>|
    |<-- Redirect to campus IdP -------------------------------|
    |-- Login (campus credentials) -->|                        |
    |<-- SAML Assertion (attributes) --|                        |
    |------------------- Present Assertion ------------------->|
`,
    threatModel: [
      { risk: 'Graduated student retaining access to paid journal resources', mitigation: 'Attribute release is tied live to the registrar feed, so `eduPersonAffiliation` stops asserting "student" the moment enrollment ends.' },
      { risk: 'Malicious Service Provider harvesting more attributes than needed', mitigation: 'Federation metadata publishes an attribute-release policy per SP, and IdPs enforce minimal attribute disclosure by default.' }
    ],
    lessons: [
      'Interfederation (trusting a shared metadata registry) scales far better than bilateral SSO integrations with every partner.',
      'Attribute-based authorization (affiliation, not identity) lets partner services make access decisions without ever seeing personally identifying data.'
    ],
    mistakes: [
      'Early integrations released full name and email to every partner by default instead of minimizing to just the affiliation attribute needed.',
      'Not implementing Single Logout initially, leaving partner-service sessions active after a campus logout.'
    ],
    bestPractices: [
      'Release the minimum SAML attributes a partner service actually needs (e.g. affiliation, not full profile).',
      'Automate IdP metadata rotation and publish updates through the federation registry rather than manual per-partner emails.'
    ],
    interviewQuestions: [
      { q: 'What problem does an interfederation like eduGAIN solve that direct SAML SSO does not?', a: 'Direct SAML SSO requires a bilateral trust relationship (and metadata exchange) between every pair of institutions — that does not scale past a handful of partners. An interfederation publishes a shared, cryptographically signed metadata aggregate that every member trusts automatically, so one university\'s IdP is instantly usable by thousands of partner services worldwide.' }
    ],
    rfcs: ['SAML 2.0 Core', 'SAML Metadata Interoperability Profile'],
    relatedResources: [
      { title: 'SAML 2.0 XML Workbench', path: '/playground/saml', type: 'playground' },
      { title: 'SAML Metadata Builder Tool', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'LDAP Tree Simulator', path: '/playground/ldap', type: 'playground' }
    ]
  },
  {
    id: 'github_oauth_apps',
    title: 'OAuth Apps, Scoped Tokens & Personal Access Tokens',
    company: 'GitHub',
    logo: '🐙',
    category: 'Big Technology',
    difficulty: 'Beginner',
    summary: 'A gentle introduction to how a developer platform lets millions of third-party apps request limited, user-approved access to an account without ever seeing the user\'s password.',
    problem: 'Third-party CI tools, code editors, and bots need to act on a developer\'s behalf (read repos, open pull requests), but sharing a password directly with every tool would be a massive security risk.',
    requirements: [
      'Let a user approve exactly what a third-party app can do (e.g. "read repositories" but not "delete account").',
      'Allow the user to revoke a single app\'s access without changing their password.',
      'Support both interactive apps (OAuth Apps) and simple personal scripts (Personal Access Tokens).'
    ],
    challenges: [
      'Explaining scopes in plain language so users understand what they are approving.',
      'Preventing a leaked token from granting more access than the user intended.',
      'Balancing convenience (broad, long-lived tokens) against security (narrow, short-lived tokens).'
    ],
    architecture: `
+-------------------------------------------------------------+
|                  OAUTH APP AUTHORIZATION FLOW                |
+-------------------------------------------------------------+

   [ Third-Party App ]  ---1. Redirect to authorize--->  [ GitHub ]
           |                                                 |
           |<--2. User approves requested scopes-------------|
           |---3. Exchange code for access token ------------>|
           |<--4. Scoped access token -------------------------|
`,
    authModel: 'The user never shares their password with the third-party app. Instead, they log into GitHub directly and approve a specific list of scopes; GitHub then issues the app a scoped OAuth access token via the Authorization Code Flow.',
    authzModel: 'Every API call from the third-party app is checked against the exact scopes the user approved (e.g. `repo:read` but not `admin:org`) — the token simply cannot perform an action outside its granted scope.',
    lifecycle: 'Users can view every authorized app and personal access token in their account settings and revoke any one individually at any time, instantly invalidating just that credential.',
    federation: 'The same scoped-token model extends to GitHub Actions workflows and CI integrations, which request short-lived, workflow-scoped tokens instead of long-lived personal credentials.',
    sequence: `
 User                 Third-Party App           GitHub Authorization Server
   |                        |                              |
   |                        |--- Redirect to /authorize --->|
   |<---------------------- Show consent screen ------------|
   |--- Approve scopes ------------------------------------->|
   |                        |<-- Redirect w/ code -----------|
   |                        |--- Exchange code for token ---->|
   |                        |<-- Scoped access token ---------|
`,
    threatModel: [
      { risk: 'A leaked personal access token granting full account access', mitigation: 'Encourage fine-grained tokens scoped to a single repository and a short expiration instead of classic broad, non-expiring tokens.' },
      { risk: 'A malicious OAuth App requesting excessive scopes', mitigation: 'Display every requested scope in plain language on the consent screen and let users approve or deny individually before any token is issued.' }
    ],
    lessons: [
      'Scoped tokens dramatically reduce blast radius compared to sharing a password or an all-access credential.',
      'Clear, plain-language consent screens meaningfully change what users actually approve.'
    ],
    mistakes: [
      'Classic personal access tokens defaulted to never expiring, which meant a leaked token remained valid indefinitely until manually revoked.',
      'Early scope names were technical and unclear, leading users to over-approve broader access than they intended.'
    ],
    bestPractices: [
      'Default new tokens to a short expiration and the narrowest scope that accomplishes the task.',
      'Let users see, per app, exactly which scopes were granted and when the token was last used.'
    ],
    interviewQuestions: [
      { q: 'Why is OAuth\'s scope model more secure than sharing a password with a third-party app?', a: 'Scopes let a user approve a specific, limited set of actions (e.g. "read repositories") instead of handing over full account control. If the third-party app is compromised, the attacker only gains whatever narrow permissions were granted — not the ability to change the password, delete the account, or access unrelated data.' }
    ],
    rfcs: ['RFC 6749 (OAuth 2.0 Framework)', 'RFC 7636 (PKCE)'],
    relatedResources: [
      { title: 'OAuth 2.0 / OIDC Flow Visualizer', path: '/playground/oauth', type: 'playground' },
      { title: 'OAuth PKCE Generator Tool', path: '/tools/oauth-pkce-generator', type: 'tool' },
      { title: 'Basic/Bearer Auth Header Decoder', path: '/tools/basic-auth-decoder', type: 'tool' }
    ]
  },
  {
    id: 'crossborder_b2b_federation',
    title: 'Cross-Border B2B Multi-Org Federation for Payments',
    company: 'Global Payments Network',
    logo: '🌍',
    category: 'Financial Services',
    difficulty: 'Advanced',
    summary: 'Deconstruct a payments network that federates thousands of independent bank and fintech partner organizations across borders, brokering delegated, narrowly-scoped access via standards-based token exchange.',
    problem: 'Thousands of partner banks and fintechs across dozens of regulatory jurisdictions each need scoped, auditable access to a shared payments network — without the network having to trust every partner\'s raw internal credentials directly.',
    requirements: [
      'Standards-based federation supporting both SAML 2.0 (legacy bank IdPs) and OIDC (modern fintech IdPs) simultaneously.',
      'Delegated, narrowly-scoped access tokens per partner integration, brokered rather than trusted directly.',
      'Fine-grained, policy-driven authorization respecting each jurisdiction\'s regulatory constraints.'
    ],
    challenges: [
      'Bridging partners still running legacy SAML-only identity stacks with modern OIDC-native fintechs on one network.',
      'Preventing a compromised partner credential from being usable to impersonate a different partner organization.',
      'Applying jurisdiction-specific transaction and data-residency policies consistently across the network.'
    ],
    architecture: `
+-------------------------------------------------------------+
|         CROSS-BORDER B2B PAYMENTS FEDERATION TOPOLOGY         |
+-------------------------------------------------------------+

 [ Partner Bank IdP (SAML) ]   [ Partner Fintech IdP (OIDC) ]
             |                              |
             +--------------+---------------+
                            v
              [ Federation Broker / STS ]
                            |
                            v
                [ Payments Network Core API ]
`,
    authModel: 'Each partner organization authenticates its own users against its own IdP (SAML or OIDC); the Federation Broker normalizes both into a single internal token format after validating the partner\'s trust anchor and signature.',
    authzModel: 'A central policy engine evaluates fine-grained, jurisdiction-aware ABAC rules (partner org, transaction type, regulatory region) before the Security Token Service issues a narrowly-scoped downstream token via RFC 8693 Token Exchange.',
    lifecycle: 'Partner organizations are onboarded through a formal trust-establishment process (metadata exchange, key ceremony); individual partner users are provisioned and deprovisioned through each partner\'s own SCIM or manual process, never directly by the network.',
    federation: 'Bridges legacy SAML 2.0 partner IdPs and modern OIDC partner IdPs into one normalized internal identity, using RFC 8693 Token Exchange to broker delegated, minimally-scoped access for every downstream call.',
    sequence: `
 Partner IdP          Federation Broker (STS)          Payments Core API
     |                        |                                |
     |-- Assertion/ID Token ->|                                |
     |                        |-- Validate + Policy Check ---->|
     |                        |<-- Exchange for scoped token ---|
     |                        |------- Scoped Token ----------->|
`,
    threatModel: [
      { risk: 'Compromised partner credential used to impersonate another partner organization', mitigation: 'Every token carries a partner-org claim validated independently at the network core, and partner trust anchors are cryptographically pinned per organization.' },
      { risk: 'Regulatory data-residency violation from a cross-border data flow', mitigation: 'The policy engine evaluates jurisdiction-specific rules before issuing any downstream token, blocking flows that would violate data-residency requirements.' }
    ],
    lessons: [
      'A federation broker that normalizes SAML and OIDC into one internal format avoids forcing every downstream service to support both protocols.',
      'Token Exchange (RFC 8693) lets the network grant each partner integration only the minimal scope needed, rather than passing through a partner\'s original broad credential.'
    ],
    mistakes: [
      'Early integrations passed partner IdP assertions through to downstream services directly, which meant every downstream service had to independently validate two different protocols.',
      'Underestimating the operational overhead of the manual key-ceremony trust-establishment process during rapid partner-network growth.'
    ],
    bestPractices: [
      'Normalize every inbound partner credential (SAML or OIDC) to one internal token format immediately at the broker, never downstream.',
      'Encode jurisdiction and partner-org identity as explicit claims validated at every hop, not just at initial authentication.'
    ],
    interviewQuestions: [
      { q: 'Why use a Federation Broker with Token Exchange instead of letting each partner IdP talk directly to every downstream service?', a: 'Direct integration would force every downstream service to independently trust and validate potentially thousands of different partner IdPs across two protocols (SAML and OIDC). A broker validates the partner assertion once, applies jurisdiction-aware policy, and issues one normalized, narrowly-scoped token via RFC 8693 Token Exchange — so downstream services only ever need to trust one internal token format.' }
    ],
    rfcs: ['RFC 8693 (Token Exchange)', 'SAML 2.0 Core', 'OpenID Connect Core 1.0'],
    relatedResources: [
      { title: 'Token Exchange (RFC 8693) Lab', path: '/playground/token-exchange', type: 'playground' },
      { title: 'SAML Metadata Builder Tool', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'Open Policy Agent (OPA) & Rego Playground', path: '/playground/opa', type: 'playground' }
    ]
  }
]
