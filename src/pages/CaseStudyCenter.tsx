import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, ArrowLeft, BookOpen, Layers, ShieldCheck, 
  Award, Check, ShieldAlert, Cpu, Network
} from 'lucide-react'

// Define Types
type CategoryType = 'Big Technology' | 'Financial Services' | 'Government' | 'Healthcare' | 'Retail' | 'Education'

interface CaseStudy {
  id: string
  title: string
  company: string
  logo: string
  category: CategoryType
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

export default function CaseStudyCenter() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStudyId, setActiveLabId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'architecture' | 'security' | 'lessons' | 'interview'>('summary')

  // Curated Enterprise Case Studies Dataset
  const CASE_STUDIES: CaseStudy[] = [
    {
      id: 'netflix',
      title: 'Scaling Edge Gateway Security & mTLS Mesh',
      company: 'Netflix',
      logo: '🍿',
      category: 'Big Technology',
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
        'Map driver session trust decaying metrics continuous-ly.'
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
      summary: 'Deconstruct how Cloudflare replaced corporate VPNs with a Zero Trust Access model, verifying employee device compliance, networks, and biometric status continuous-ly.',
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
        { risk: 'Compromised admin credentials used on private device', mitigation: 'Block connection if device lack active MDM compliance posture and client mTLS certificate.' },
        { risk: 'Session hijacking via stole cookie', mitigation: 'Continuous Ambient Trust evaluation decays session immediately if device network changes.' }
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
        'Enforcing rigid, multi-character passwords on consumer databases, driving customers back to high-friction SMS recovery paths.'
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
      federation: 'Utilizes federated OIDC Single Sign-On (SSO) mapped to Cloudflare Access Gateways, requiring mutual TLS checks on the browser client.',
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
    }
  ]

  // Filter and search logic
  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter(study => {
      const categoryMatches = selectedCategory === 'All' || study.category === selectedCategory
      const searchMatches = 
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.summary.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatches && searchMatches
    })
  }, [selectedCategory, searchQuery])

  const activeStudy = useMemo(() => {
    return CASE_STUDIES.find(s => s.id === activeStudyId)
  }, [activeStudyId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 shrink-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Layers className="w-3.5 h-3.5" /> Initiative 1 Milestone
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Enterprise Identity Case Study Center
          </h1>
          <p className="text-sm text-text-secondary">
            Deconstruct real-world production configurations and scaling challenges from Netflix, Uber, Cloudflare, and digital banks.
          </p>
        </div>
        {activeStudyId && (
          <button
            onClick={() => { setActiveLabId(null); setActiveTab('summary'); }}
            className="text-xs bg-bg-card border border-border-subtle hover:bg-bg-sidebar px-4 py-2.5 rounded-xl text-text-secondary flex items-center gap-1.5 transition-colors font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Case Studies Inventory
          </button>
        )}
      </div>

      {/* CASE STUDIES DIRECTORY LIST VIEW */}
      {!activeStudyId ? (
        <div className="space-y-6">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-10 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="Search Netflix, Uber, JWT..."
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex overflow-x-auto gap-2 w-full md:w-auto scrollbar-hide pb-1">
              {['All', 'Big Technology', 'Financial Services', 'Government', 'Healthcare', 'Retail', 'Education'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as CategoryType | 'All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                    selectedCategory === cat 
                      ? 'bg-accent-primary border-accent-primary text-white shadow' 
                      : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* CASE STUDIES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStudies.map((study) => (
              <div 
                key={study.id}
                className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-accent-primary hover:shadow transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {study.logo}
                    </span>
                    <span className="text-[10px] bg-bg-sidebar border border-border-subtle px-2.5 py-0.5 rounded-full font-bold text-text-secondary uppercase">
                      {study.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-text-primary tracking-tight">
                      {study.company} — {study.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                      {study.summary}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border-subtle/30 pt-4 mt-6 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted font-bold tracking-wide uppercase">
                    {study.rfcs.length} standards listed
                  </span>
                  <button
                    onClick={() => enterCaseStudy(study.id)}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all shadow-md shadow-accent-primary/10"
                  >
                    Explore Case Study
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        
        /* ================= CASE STUDY DETAIL VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start min-h-0">
          
          {/* LEFT SUB-NAV MENU */}
          <div className="lg:col-span-1 flex flex-col gap-3 shrink-0">
            {[
              { id: 'summary', label: '📋 Executive Summary', desc: 'Business challenges & goals' },
              { id: 'architecture', label: '🏗️ Architecture & Models', desc: 'Flowcharts, AuthN & AuthZ rules' },
              { id: 'security', label: '🛡️ Threat Model & Security', desc: 'Risks, mitigations & boundaries' },
              { id: 'lessons', label: '💡 Lessons & Pitfalls', desc: 'Lessons learned & mistakes' },
              { id: 'interview', label: '🎤 Interview & Standards', desc: 'Architect Q&As & RFCs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'summary' | 'architecture' | 'security' | 'lessons' | 'interview')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  activeTab === tab.id 
                    ? 'border-accent-primary bg-accent-glow/50 text-accent-primary shadow-sm' 
                    : 'border-border-subtle bg-bg-card hover:bg-bg-sidebar text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="text-xs font-bold">{tab.label}</div>
                <div className="text-[10px] text-text-muted mt-1">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* RIGHT DETAILED WORKSPACE CANVAS */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">
            
            {/* Header Badge */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
              <span className="text-3xl p-3 bg-bg-sidebar rounded-2xl border border-border-subtle">{activeStudy?.logo}</span>
              <div>
                <span className="text-[9px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase">
                  {activeStudy?.category} STUDY
                </span>
                <h2 className="text-xl font-black text-text-primary mt-1">{activeStudy?.company} — {activeStudy?.title}</h2>
              </div>
            </div>

            {/* TAB CONTENT 1: EXECUTIVE SUMMARY */}
            {activeTab === 'summary' && activeStudy && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Business Problem</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{activeStudy.problem}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Business Requirements</h3>
                    <ul className="space-y-2">
                      {activeStudy.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-normal">
                          <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Primary Identity Challenges</h3>
                    <ul className="space-y-2">
                      {activeStudy.challenges.map((ch, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-normal">
                          <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" /> {ch}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ARCHITECTURE & MODELS */}
            {activeTab === 'architecture' && activeStudy && (
              <div className="space-y-6">
                
                {/* Visual flowchart */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-accent-primary" /> Edge Deployment Architecture
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStudy.architecture}
                  </pre>
                </div>

                {/* Sequence flowchart */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-accent-primary animate-pulse" /> Cryptographic Signatures Flow
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStudy.sequence}
                  </pre>
                </div>

                {/* AuthN vs AuthZ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Authentication (AuthN) Model</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.authModel}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Authorization (AuthZ) Model</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.authzModel}</p>
                  </div>
                </div>

                {/* Lifecycle / Provisioning / Federation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Identity Lifecycle Model</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.lifecycle}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Federation Strategy</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.federation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: THREAT MODEL */}
            {activeTab === 'security' && activeStudy && (
              <div className="space-y-6">
                
                {/* STRIDE threat model table */}
                <div className="overflow-x-auto rounded-2xl border border-border-subtle shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sidebar border-b border-border-subtle select-none">
                        <th className="p-4 text-xs font-bold text-text-muted uppercase">Primary Threat Risk</th>
                        <th className="p-4 text-xs font-bold text-text-primary uppercase">Defensive Mitigation Control</th>
                      </tr>
                    </thead>
                    <tbody className="bg-bg-card">
                      {activeStudy.threatModel.map((item, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-bg-sidebar/30 transition-colors">
                          <td className="p-4 text-xs font-bold text-text-primary flex items-start gap-2.5 max-w-sm leading-normal">
                            <ShieldAlert className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                            {item.risk}
                          </td>
                          <td className="p-4 text-xs text-text-secondary max-w-sm leading-normal">
                            <Check className="w-4 h-4 text-status-success shrink-0 inline-block mr-2 mt-0.5 align-top" />
                            {item.mitigation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: LESSONS & PITFALLS */}
            {activeTab === 'lessons' && activeStudy && (
              <div className="space-y-6">
                
                {/* Common Mistakes */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-status-danger" /> Common Implementation Mistakes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStudy.mistakes.map((mis, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/10 text-xs text-text-secondary leading-relaxed">
                        {mis}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Practices */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-status-success" /> Production Best Practices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStudy.bestPractices.map((bp, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-success/5 border border-status-success/10 text-xs text-text-secondary leading-relaxed">
                        {bp}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lessons Learned */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Lessons Learned</h3>
                  <ul className="space-y-2">
                    {activeStudy.lessons.map((les, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
                        <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {les}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: INTERVIEW PREP & STANDARDS */}
            {activeTab === 'interview' && activeStudy && (
              <div className="space-y-6">
                
                {/* Related RFCs */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-accent-primary" /> Primary Standards & RFCs Used
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeStudy.rfcs.map((rfc, i) => (
                      <span key={i} className="px-3.5 py-1.5 rounded-lg bg-bg-sidebar border border-border-subtle text-xs font-bold text-text-secondary tracking-tight">
                        {rfc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mock Interview Q&A flashcards */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-500" /> Architectural Interview Q&A Prep
                  </h3>
                  <div className="space-y-4">
                    {activeStudy.interviewQuestions.map((qa, i) => (
                      <div key={i} className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3 leading-relaxed">
                        <h4 className="text-xs font-bold text-text-primary flex items-start gap-2">
                          <span className="px-2 py-0.5 rounded bg-accent-glow text-accent-primary text-[10px] font-mono tracking-tight font-black">Q</span>
                          {qa.q}
                        </h4>
                        <p className="text-xs text-text-secondary pl-8 border-l border-border-subtle mt-2">
                          <strong>Expert Answer:</strong> {qa.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RELATED PLATFORM RESOURCES (Always shown at the bottom of the Detail View) */}
            {activeStudy && activeStudy.relatedResources && (
              <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4 shrink-0">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-primary" /> Deep-Linked Hands-On Practice Resources
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Bridge theory with browser-native execution. Leverage our custom tools, checklists, or reference directories to inspect the protocols deployed in this case study.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeStudy.relatedResources.map((res, idx) => (
                    <Link 
                      key={idx}
                      to={res.path}
                      className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/50 transition-all text-left flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold text-accent-primary tracking-wide">
                          {res.type}
                        </span>
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-primary mt-1">
                          {res.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-text-secondary hover:text-text-primary mt-3 font-semibold flex items-center gap-1">
                        Run Resource &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  )

  function enterCaseStudy(id: string) {
    setActiveLabId(id)
    setActiveTab('summary')
  }
}
