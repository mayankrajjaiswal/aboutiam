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
import { BULLETINS } from '../../data/bulletinsData'
import { BREACHES } from '../../data/breachesData'
import { CHEAT_SHEETS } from '../../data/cheatSheetsData'
import { COMPARISONS, LEARNING_TRACKS, INTERVIEW_QUESTIONS } from '../../data/aiKnowledgeGraph'
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
  { id: 'device-code-flow', title: 'IoT Device Code Flow (RFC 8628) Lab', desc: 'Simulate OAuth 2.0 on input-constrained devices like Smart TVs. Watch asynchronous polling while the user authenticates out-of-band on a smartphone.', link: '/playground/device-code-flow', kw: ['device code flow', 'rfc 8628', 'smart tv', 'iot', 'polling', 'out-of-band', 'oauth'] },
  { id: 'jit-provisioning', title: 'B2B SaaS Just-In-Time (JIT) Provisioning Visualizer', desc: 'Simulate how enterprise SaaS platforms automatically onboard new corporate users on the fly by mapping SAML/OIDC claims directly into the application database.', link: '/playground/jit-provisioning', kw: ['jit', 'just-in-time', 'provisioning', 'saas', 'mapping', 'saml', 'oidc', 'claims'] },
  { id: 'phantom-token', title: 'API Gateway Phantom Token Sandbox', desc: 'Learn the ultimate enterprise pattern for securing SPAs. Watch an API Gateway translate an opaque string into a signed JWT for microservices, hiding PII from the frontend.', link: '/playground/phantom-token', kw: ['phantom token', 'opaque token', 'api gateway', 'spa', 'introspection', 'translation', 'jwt'] },
  { id: 'agent-identity', title: 'Agentic Identity & MCP Trust Simulator', desc: 'OAuth 2.1 delegation chains and scope-narrowing limits for AI agents. Run cryptographic OBO JWT token exchanges and simulate agent compromises.', link: '/playground/agent-identity', kw: ['agentic', 'mcp', 'oauth 2.1', 'delegation', 'on-behalf-of', 'scope narrowing', 'compromise', 'obo', 'jwt'] },
  { id: 'nhi-sprawl', title: 'NHI Sprawl Cleanup Game', desc: 'Triage a seeded fleet of service accounts, API keys, and CI/CD tokens against a real non-human-identity governance rubric — rotate, revoke, or keep each one.', link: '/playground/nhi-sprawl', kw: ['nhi', 'non-human identity', 'service account', 'api key', 'ci/cd token', 'sprawl', 'orphaned', 'rotation', 'governance', 'inventory hygiene'] },
  { id: 'passkey-rollout-strategist', title: 'Passkey Fleet Rollout Strategist', desc: 'Play CISO: allocate a rollout budget across platforms, help-desk training, legacy sunset, and recovery, then see a year of adoption/phishing/ticket outcomes scored against industry benchmarks.', link: '/playground/passkey-rollout-strategist', kw: ['passkey', 'fido2', 'webauthn', 'rollout', 'budget', 'ciso', 'strategy', 'account recovery', 'phishing-resistant', 'adoption'] },
  { id: 'modernization-backlog', title: 'IAM Modernization Backlog Game', desc: 'Sequence 20 legacy-IAM tech-debt items into a 12-month roadmap under a fixed budget, respecting dependency order and maximizing risk reduction per dollar.', link: '/playground/modernization-backlog', kw: ['modernization', 'backlog', 'roadmap', 'tech debt', 'prioritization', 'risk reduction', 'dependency', 'budget', 'grc', 'planning'] },
  { id: 'incident-commander', title: 'Incident Commander', desc: 'Play incident commander during a live identity breach built from real Security Bulletins incidents (Golden SAML, MFA push fatigue) — every branching decision terminates in a scored outcome with a real-world post-mortem.', link: '/playground/incident-commander', kw: ['incident commander', 'incident response', 'tabletop', 'golden saml', 'mfa fatigue', 'branching', 'decision tree', 'crisis simulation', 'post-mortem', 'breach response'] },
  { id: 'build-your-idp', title: 'Build-Your-Own-IdP Sandbox', desc: 'Assemble a minimal OIDC Provider — generate signing keys, configure the discovery document, register a client, build a consent screen — then run a real signed login entirely offline.', link: '/playground/build-your-idp', kw: ['oidc provider', 'idp', 'discovery document', 'jwks', 'openid-configuration', 'rs256', 'consent screen', 'relying party', 'authorization code', 'pkce'] },
  { id: 'openid4vc-wallet', title: 'OpenID4VC Wallet Studio', desc: 'Issue a real SD-JWT verifiable credential, store it in a mock wallet, and selectively disclose only the claims a verifier actually requested.', link: '/playground/openid4vc-wallet', kw: ['openid4vc', 'oid4vci', 'oid4vp', 'sd-jwt', 'verifiable credential', 'mdl', 'eudi wallet', 'eidas', 'selective disclosure', 'issuer wallet verifier'] },
  { id: 'fapi2-lab', title: 'FAPI 2.0 / Open Banking Security Profile Playground', desc: 'Simulate PAR, sender-constrained tokens, and signed authorization responses — the three FAPI 2.0 controls that stop attacks plain OAuth 2.0 can\'t.', link: '/playground/fapi2', kw: ['fapi', 'fapi 2.0', 'open banking', 'open finance', 'par', 'pushed authorization requests', 'mtls', 'dpop', 'jarm', 'jar', 'financial-grade api'] },
  { id: 'dpop-sandbox', title: 'DPoP (Proof-of-Possession) Sandbox — Sender-Constrained Tokens', desc: 'Prevent session hijacking using Sender-Constrained Tokens (RFC 9449). Generate a browser keypair, bind it to an access token, and watch an API Gateway block replayed tokens.', link: '/playground/dpop', kw: ['dpop', 'sender-constrained', 'proof of possession', 'session hijacking', 'replay attack', 'token theft', 'oauth', 'rfc 9449'] },
  { id: 'caep-event-storm', title: 'CAEP Event Storm Visualizer', desc: 'Fire a CAEP event from a mock IdP and watch it fan out to multiple subscribed relying parties in real time, each with its own latency and enforcement decision.', link: '/playground/caep-event-storm', kw: ['caep', 'shared signals framework', 'ssf', 'continuous access evaluation', 'security event token', 'set', 'pub-sub', 'relying party', 'event storm'] },
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
  { id: 'hybrid-ad-sync', title: 'Hybrid Identity Sync Lab (PHS / PTA / Federation)', desc: 'Toggle between Password Hash Sync, Pass-Through Authentication, and Federation (AD FS) to see how each handles an on-prem login.', link: '/playground/hybrid-ad-sync', kw: ['hybrid identity', 'password hash sync', 'pass-through authentication', 'federation', 'ad fs', 'azure ad connect'] },
  { id: 'pqc-handshake', title: 'Post-Quantum Cryptography Handshake Simulator', desc: 'Step through classical vs. hybrid vs. pure post-quantum handshakes. Analyze key exchange sizes, signature overheads, and network packet fragmentation thresholds under FIPS 203/204 lattice cryptography.', link: '/playground/pqc-handshake', kw: ['pqc', 'post-quantum cryptography', 'lattice-based', 'ml-kem', 'ml-dsa', 'hybrid handshake', 'fragmentation', 'mtu', 'shor\'s algorithm'] },
  { id: 'passkey-policy', title: 'Advanced Passkey Policy & Attestation Workbench', desc: 'Act as a Relying Party (RP) Security Admin configuring enterprise-grade FIDO2 / WebAuthn registration parameters. Enforce FIPS-restricted AAGUIDs, direct packed attestation anchors, and resident key storage rules.', link: '/playground/passkey-policy', kw: ['passkey policy', 'attestation', 'aaguid', 'fido2', 'webauthn', 'resident key', 'packed attestation', 'user verification', 'fips'] },
  { id: 'workload-identity', title: 'Workload Identity Federation & OIDC Visualizer', desc: 'Ditch long-lived static API secrets. Secure your automated build pipelines (GitHub Actions, GitLab CI) using federated OIDC token handshakes with Cloud Providers.', link: '/playground/workload-identity', kw: ['workload identity', 'oidc federation', 'github actions oidc', 'sts', 'assume-role', 'ephemeral keys', 'branch hijacking', 'trust policy'] },
  { id: 'cloud-policy-evaluator', title: 'Multi-Cloud Overlapping IAM Policy Evaluator', desc: 'Step inside the heart of an enterprise Policy Evaluation Engine. Visualize and evaluate how Organization SCP boundaries, identity-based IAM permissions, and Resource policies combine to govern access.', link: '/playground/cloud-policy-evaluator', kw: ['cloud policy', 'iam evaluator', 'scp', 'aws policy', 'resource-based policy', 'explicit deny', 'overlapping policies', 'effective permissions'] },
  { id: 'federated-vp', title: 'Dynamic Trust Framework & Verifiable Presentation Playground', desc: 'Explore the architecture of eIDAS 2.0 and the European Digital Identity (EUDI) Wallet. Selectively disclose claims, verify cryptographic SD-JWT signatures, and audit issuers against cross-border trust registries.', link: '/playground/federated-vp', kw: ['verifiable presentation', 'sd-jwt', 'eudi wallet', 'eidas 2.0', 'selective disclosure', 'trust registry', 'cross-border identity', 'digital wallet'] },
  { id: 'autonomous-agent', title: 'Autonomous Security Agent Simulation Playground', desc: 'Deploy autonomous Red Team and Blue Team AI security agents in simulated token-hijacking and redirect-hijacking arenas. Watch security enforcers dynamically adapt, detect anomalies, and apply cryptographic defenses.', link: '/playground/autonomous-agent', kw: ['autonomous agent', 'red team', 'blue team', 'itdr', 'ai simulation', 'dpop', 'wildcard redirect', 'agentic battle'] },
  { id: 'rag-authorization', title: 'RAG-Aware Authorization Policy Engine', desc: 'Simulate vector-level chunk metadata masking to authorize access to AI generated embeddings before the LLM synthesizes an answer.', link: '/playground/rag-authorization', kw: ['rag', 'vector-level', 'chunk metadata', 'masking', 'embeddings', 'llm', 'claims-aware'] },
  { id: 'ai-swarm', title: 'Ephemeral AI Swarm Identity Orchestrator', desc: 'Deploy an AI swarm and visualize constrained, short-lived tokens (RFC 8693) generated and revoked autonomously by a parent AI.', link: '/playground/ai-swarm', kw: ['swarm', 'delegation', 'rfc 8693', 'token exchange', 'revocation', 'orchestrator'] },
  { id: 'fhe-auth', title: 'Fully Homomorphic Encryption (FHE) Auth Sandbox', desc: 'Perform mathematical polynomial intersection on encrypted ciphertexts to verify credentials without exposing the underlying plaintext.', link: '/playground/fhe-auth', kw: ['fhe', 'fully homomorphic encryption', 'polynomial', 'intersection', 'encrypted', 'ciphertext'] },
  { id: 'qkd-simulator', title: 'Quantum Key Distribution (QKD) Simulator', desc: 'Observe the quantum state of photons collapsing during a transmission interception, compared to traditional lattice-based PQC.', link: '/playground/qkd-simulator', kw: ['qkd', 'quantum key distribution', 'photons', 'uncertainty principle', 'interception', 'pqc'] },
  { id: 'mdl-proximity', title: 'ISO 18013-5 mDL Proximity Authentication Lab', desc: 'Establish an offline secure BLE session using ECDH to pass a cryptographically signed CBOR payload without internet access.', link: '/playground/mdl-proximity', kw: ['mdl', 'proximity', 'ble', 'ecdh', 'cbor', 'iso 18013-5', 'offline'] },
  { id: 'space-identity', title: 'Space Identity & DTN Simulator', desc: 'Construct a Delay-Tolerant Networking (DTN) space identity packet and simulate store-and-forward authentication across planetary lag.', link: '/playground/space-identity', kw: ['space identity', 'dtn', 'bpsec', 'orbital delay', 'mars', 'lunar'] },
  { id: 'v2x-pki', title: 'V2X PKI Expressway Simulator', desc: 'Simulate autonomous vehicles validating sub-10ms ephemeral pseudonymous certificates and rejecting invalid leaf-node brake signals.', link: '/playground/v2x-pki', kw: ['v2x', 'pki', 'autonomous vehicle', 'ieee 1609.2', 'brake signal', 'leaf-node'] },
  { id: 'ebpf-tracer', title: 'eBPF Kernel-Level Identity Tracer', desc: 'Configure an eBPF ring-0 authorization policy and watch the kernel drop unauthorized network packets at the OS level.', link: '/playground/ebpf-tracer', kw: ['ebpf', 'kernel-level', 'ring-0', 'socket', 'tracer', 'active drop'] },
  { id: 'digital-twin', title: 'Digital Twin Identity Binding Workbench', desc: 'Cryptographically bond a Physical Unclonable Function (PUF) chip to an X.509 cloud certificate representing an IoT digital twin.', link: '/playground/digital-twin', kw: ['digital twin', 'puf', 'silicon', 'x.509', 'iot', 'binding'] },
  { id: 'bci-auth', title: 'BCI Neural Auth Baseline Simulator', desc: 'Map a Brain-Computer Interface (BCI) P300 brainwave hash against a baseline for continuous spatial computing authentication.', link: '/playground/bci-auth', kw: ['bci', 'neural auth', 'brainwave', 'p300', 'spatial computing', 'continuous'] }
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

  // Add Patent Timeline tab search result
  items.push({
    id: 'patent-timeline-tab',
    title: 'IAM Patent Timeline & Legal History Guide',
    fullName: 'Operational Reference & Timeline',
    description: 'Step through an interactive reference timeline of legal disputes, RSA patents, Samba AD antitrust, and Open Web Foundation royalty-free covenants.',
    category: '📁 Interactive Labs & Simulators',
    link: '/timeline?tab=patents',
    keywords: ['patent', 'patents', 'timeline', 'legal history', 'open web foundation', 'non-assert', 'royalty free', 'samba antitrust', 'rsa patent']
  })

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

  // 5. Add Breaches (derived from the shared breachesData.ts — every breach added there
  // is automatically searchable, no separate list to sync)
  BREACHES.forEach(b => {
    items.push({
      id: `breach-${b.id}`,
      title: b.title,
      fullName: `${b.category} · ${b.difficulty}`,
      description: b.summary,
      category: '💣 Breach Museum Cases',
      link: `/wall-of-shame?tab=breaches&lab=${b.id}`,
      keywords: [b.company, b.category, b.difficulty, String(b.year)]
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

  // 16. Add Security Bulletins (derived from the shared bulletinsData.ts — every
  // bulletin added there is automatically searchable, no separate list to sync)
  BULLETINS.forEach(b => {
    items.push({
      id: `bulletin-${b.id}`,
      title: b.title,
      fullName: `${b.category} · ${b.difficulty}`,
      description: b.description,
      category: '🚨 Security Bulletins',
      link: `/bulletins?bulletin=${b.id}`,
      keywords: [b.vector, b.severity, b.difficulty, b.category]
    })
  })

  // 17. Add Developer Playbooks / Cheat Sheets (derived from the shared cheatSheetsData.ts —
  // every cheat sheet added there is automatically searchable, no separate list to sync)
  CHEAT_SHEETS.forEach(s => {
    items.push({
      id: `sheet-${s.id}`,
      title: s.title,
      fullName: `${s.category} · ${s.difficulty}`,
      description: s.checks.map(c => c.task).join('; '),
      category: '✅ Developer Playbooks & Cheat Sheets',
      link: `/cheat-sheets?sheet=${s.id}`,
      keywords: [s.category, s.difficulty, s.target]
    })
  })

  // 18. Add AI Knowledge Assistant Comparisons (derived from the shared aiKnowledgeGraph.ts —
  // every comparison added there is automatically searchable, no separate list to sync)
  COMPARISONS.forEach(c => {
    items.push({
      id: `assistant-compare-${c.id}`,
      title: c.title,
      fullName: `${c.entityA} vs ${c.entityB}`,
      description: c.summary,
      category: '🤖 AI Assistant — Comparisons',
      link: `/assistant?tab=compare&compare=${c.id}`,
      keywords: [c.entityA, c.entityB]
    })
  })

  // 19. Add AI Knowledge Assistant Learning Tracks (derived from the shared aiKnowledgeGraph.ts)
  LEARNING_TRACKS.forEach(t => {
    const trackId = `${t.level.toLowerCase()}-${t.goal.toLowerCase().replace(/\s+/g, '-')}`
    items.push({
      id: `assistant-learn-${trackId}`,
      title: t.title,
      fullName: `${t.level} · ${t.goal}`,
      description: t.description,
      category: '🧭 AI Assistant — Learning Tracks',
      link: `/assistant?tab=learn&level=${encodeURIComponent(t.level)}&goal=${encodeURIComponent(t.goal)}`,
      keywords: [t.level, t.goal, 'learning track', 'roadmap']
    })
  })

  // 20. Add AI Knowledge Assistant Interview Prep questions (derived from the shared aiKnowledgeGraph.ts —
  // every question added there is automatically searchable, no separate list to sync)
  INTERVIEW_QUESTIONS.forEach(q => {
    items.push({
      id: `assistant-interview-${q.id}`,
      title: q.question,
      fullName: `${q.domain} · Interview Question`,
      description: q.answer,
      category: '🎯 AI Assistant — Interview Prep',
      link: `/assistant?tab=interview&q=${q.id}`,
      keywords: [q.domain, q.rfc ?? '', 'interview', 'prep'].filter(Boolean)
    })
  })

  // 21. Add every remaining site page (sidebar/nav pages not covered above)
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
