// Writes a real dist/<route>/index.html per route so GitHub Pages (no server-side
// rewrites) serves a genuine 200 with a unique <title>/description/canonical for
// every page, instead of every deep link 404ing or collapsing into one document.
//
// Kept in sync with src/routeMeta.ts — that file can't be cheaply imported here
// without adding a TS-execution step to the build, so this is a deliberate,
// small, plain-JS duplicate. Update both when routes change.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const SITE_URL = 'https://www.aboutiam.com'

const ROUTES = [
  { path: '/primer', title: 'IAM for Beginners — What Is Identity & Access Management?', description: 'A plain-English introduction to Identity and Access Management: Identify, Authenticate, Authorize, Audit — no prior security background required.' },
  { path: '/roadmap', title: 'IAM Learning Roadmap — Zero to Hero Pathway', description: 'A guided, chronological learning sequence connecting every AboutIAM course track, from IAM fundamentals to Zero Trust architecture.' },
  { path: '/learn', title: 'IAM Academy — Free Identity & Access Management Courses', description: '6 course tracks and 36 modules covering OAuth, SAML, SCIM, Zero Trust, and PAM, with persisted completion progress and role-based recommendations.' },
  { path: '/architecture', title: 'IAM Reference Architecture Center — 24 Identity Diagrams', description: '24 clickable, beginner-to-advanced reference identity architectures — from basic session login and LDAP bind auth up through Zero Trust, B2B SaaS, and Multi-Cloud SPIFFE/SPIRE — each with threat models and simulated handshake traces.' },
  { path: '/knowledge-graph', title: 'IAM Knowledge Graph — How Identity Concepts Connect', description: 'A visual map connecting IAM standards, glossary terms, and reference architectures by relationship — search or click a concept to explore its neighbors and jump straight to the matching page.' },
  { path: '/daily-puzzle', title: 'Daily Identity Puzzle — A New IAM Challenge Every Day', description: 'A new identity-security puzzle every day — spot the JWT vulnerability, catch the tampered SAML field, or guess the protocol from progressively revealing clues. Everyone gets the same puzzle on the same day.' },
  { path: '/vendor', title: 'IAM Vendor Comparison — Okta, Entra, Keycloak & More', description: '18 comprehensive enterprise IAM vendor deep-dives: Microsoft Entra, Okta, Keycloak, CyberArk, Ping Identity, ForgeRock, SailPoint, Saviynt, WSO2, AWS, GCP, Oracle, Auth0, and more — architectures, certifications, deployment checklists, and interview questions.' },
  { path: '/research', title: 'Identity CVE Database & RFC Registry — IAM Security Research', description: 'Track 13 critical identity CVEs (Log4Shell, Zerologon, JWT alg:none) with vulnerable/secure code patches, plus a 17-entry OAuth, OIDC, and SCIM RFC registry.' },
  { path: '/patterns', title: 'IAM Design Pattern Library — B2B SSO, Token Exchange & FIDO2', description: 'Production-grade integration patterns, tradeoffs, and checklists for B2B multi-tenant SaaS, API token exchange (RFC 8693), and passwordless FIDO2.' },
  { path: '/certifications', title: 'IAM Certifications Guide — SC-300, CISSP, CyberArk & More', description: '27 beginner-to-advanced identity, cloud, PAM, IGA, privacy, and GRC certifications — SC-900/SC-300/AZ-500, Okta, Ping, CyberArk, SailPoint, CISSP, CCSP, CISM — with study blueprints and mock practice quizzes.' },
  { path: '/bulletins', title: 'Identity Security Bulletins — Real-World IAM Breach Playbooks', description: '18 incident bulletins on credential theft, MFA push fatigue, OAuth abuse, and Kerberos attacks, each paired with a hands-on Crisis Response simulator.' },
  { path: '/playground', title: 'IAM Playgrounds — Free Interactive Security Simulators', description: 'Hands-on OAuth, SAML, JWT, FIDO2, Kerberos, and Zero Trust simulators — learn identity security by attacking and defending live in your browser.' },
  { path: '/tools', title: 'Free Client-Side IAM & Security Tools', description: '34 free, 100% browser-based identity and security utilities — JWT, SAML, X.509, bcrypt, TOTP, PKCE, and more. No signup, no uploads, nothing leaves your device.' },
  { path: '/tools/jwt-decoder', title: 'JWT Decoder — Inspect & Verify Tokens Online', description: 'Paste any JSON Web Token to instantly decode its header, payload, and signature, check expiry, and flag insecure algorithms — 100% client-side, nothing is uploaded.' },
  { path: '/tools/jwt-generator', title: 'JWT Generator — Build & Sign Tokens (HS256/RS256)', description: 'Create and cryptographically sign JSON Web Tokens with custom claims using HS256, HS384, HS512, or RS256 — computed locally with the Web Crypto API.' },
  { path: '/tools/base64-encoder-decoder', title: 'Base64 & Base64URL Encoder / Decoder', description: 'Encode or decode text, JSON, and files to Base64 or URL-safe Base64 (used by JWTs) instantly in your browser — no data ever leaves your device.' },
  { path: '/tools/sha256-hash-generator', title: 'SHA-256 & Hash Generator — Text and File Checksums', description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text or files directly in your browser using the Web Crypto API — no uploads, ever.' },
  { path: '/tools/hmac-generator', title: 'HMAC Generator & Verifier (SHA-256/SHA-1/SHA-512)', description: 'Compute and verify HMAC signatures with a shared secret key using SHA-1, SHA-256, or SHA-512 — the same primitive that signs your JWTs, run locally.' },
  { path: '/tools/uuid-generator', title: 'UUID & ULID Generator (v4, v7, Bulk)', description: 'Generate cryptographically random UUIDv4, time-sortable UUIDv7, or ULID identifiers in bulk, with one-click copy — 100% client-side randomness.' },
  { path: '/tools/password-generator', title: 'Password Generator & Entropy Strength Checker', description: 'Generate strong random passwords or passphrases with custom rules, and see the exact entropy bits and estimated crack time — computed locally.' },
  { path: '/tools/oauth-pkce-generator', title: 'OAuth PKCE Code Generator (code_verifier / code_challenge)', description: 'Generate an RFC 7636-compliant PKCE code_verifier and S256 code_challenge, and build a full OAuth 2.0 authorization URL — no backend required.' },
  { path: '/tools/totp-generator', title: 'TOTP Generator & Verifier (RFC 6238 Authenticator Codes)', description: 'Generate live, time-based one-time passwords (TOTP) from any Base32 secret and verify 6-digit codes — the same algorithm behind Google Authenticator.' },
  { path: '/tools/ldap-filter-builder', title: 'LDAP Filter Builder — Visual RFC 4515 Query Composer', description: 'Compose valid LDAP search filters visually with AND/OR/NOT groups, then copy the exact RFC 4515 filter string — no directory connection needed.' },
  { path: '/tools/scim-payload-validator', title: 'SCIM Payload Validator & Builder (RFC 7643/7644)', description: 'Validate or scaffold SCIM 2.0 User and Group JSON payloads against the core schema, with inline errors for missing or malformed attributes.' },
  { path: '/tools/basic-auth-decoder', title: 'Basic & Bearer Auth Header Decoder', description: 'Decode HTTP Basic Authentication headers to reveal the username/password, or inspect Bearer tokens — a quick, private, client-side debugging utility.' },
  { path: '/tools/jwk-pem-converter', title: 'JWK to PEM Converter (and back) + Thumbprint', description: 'Convert RSA/EC JSON Web Keys (JWK) to PEM format and back, and compute the RFC 7638 JWK thumbprint — all cryptography runs in your browser.' },
  { path: '/tools/x509-certificate-decoder', title: 'X.509 Certificate Decoder — Parse PEM Certs & CSRs', description: 'Decode X.509 certificates and PKCS#10 CSRs to view subject, issuer, validity dates, SANs, key usage, and fingerprints — parsed locally, never uploaded.' },
  { path: '/tools/saml-decoder', title: 'SAML Decoder — Inspect SAMLRequest/Response & Metadata', description: 'Decode Base64/deflate-encoded SAMLRequest and SAMLResponse parameters, or pretty-print SP/IdP metadata XML — no server round-trip, fully client-side.' },
  { path: '/tools/saml-metadata-builder', title: 'SAML Metadata Builder — Generate SP & IdP Metadata XML', description: 'Visually configure compliant SAML 2.0 Service Provider (SP) or Identity Provider (IdP) XML metadata configurations, endpoints, certificates, and export completed files.' },
  { path: '/tools/scim-diff', title: 'SCIM Diff & Reconciliation Tool — Calculate Sync Drift', description: 'Input Identity Provider (IdP) and Service Provider (SP) user records to visually calculate attribute sync drift and programmatically generate standard-compliant SCIM PATCH reconciliation scripts.' },
  { path: '/tools/csr-generator', title: 'X.509 CSR Generator — Compile PKCS#10 Requests Online', description: 'Visually construct secure X.509 Certificate Signing Requests (CSR) with Subject DN attributes and SAN fields, generate browser-native private/public keys, and inspect their ASN.1 DER-parsed structure.' },
  { path: '/tools/sd-jwt-decoder', title: 'SD-JWT Decoder — Selective Disclosure JWT Inspector', description: 'Decode Selective Disclosure JWTs (SD-JWT), reveal individual disclosures, and verify each digest binding against the issuer-signed JWT — entirely in-browser.' },
  { path: '/tools/webauthn-decoder', title: 'WebAuthn / Passkey Assertion & Attestation Decoder', description: 'Decode clientDataJSON, authenticatorData, and CBOR attestationObject from a WebAuthn credential to inspect flags, counters, and public keys.' },
  { path: '/tools/did-key-generator', title: 'DID Generator — Create a did:key Identifier', description: 'Generate an Ed25519 keypair entirely in your browser and derive its did:key decentralized identifier and DID document — no wallet, no blockchain.' },
  { path: '/tools/bcrypt-generator', title: 'bcrypt Hash Generator & Verifier Online', description: 'Hash passwords with bcrypt at a custom cost factor, or verify a password against an existing bcrypt hash — computed entirely client-side, in pure JavaScript.' },
  { path: '/tools/oauth-builder', title: 'OAuth 2.0 / OIDC Request Builder & Handshake Debugger', description: 'Visually construct standard-compliant OAuth 2.0 and OpenID Connect authorization URLs and token exchange payloads.' },
  { path: '/tools/jwks-inspector', title: 'JWKS JSON Web Key Set Inspector', description: 'Parse, inspect, and validate public JSON Web Key Sets (JWKS) representing cryptographic signing keys used for JWT verification.' },
  { path: '/tools/policy-evaluator', title: 'ABAC & RBAC Client-Side Policy Evaluator', description: 'An interactive sandbox to evaluate custom JSON-based access policies against simulated user, device, and resource contexts.' },
  { path: '/tools/passphrase-entropy', title: 'Diceware Passphrase & Entropy Strength Calculator', description: 'Compare standard character-shuffled passwords against word-based dictionary passphrases to calculate mathematical entropy bits and offline GPU cracking times.' },
  { path: '/tools/oidc-discovery', title: 'OIDC Discovery Document Auditor', description: 'Parse, visualize, and audit modern Identity Provider metadata profiles containing standard OIDC endpoint registries.' },
  { path: '/tools/ansible-vault', title: 'Ansible Vault Encryptor & Decryptor', description: 'Encrypt or decrypt secrets client-side using the standard Ansible Vault 1.1/1.2 AES-256 cipher format — 100% browser-native PBKDF2 + AES-CTR + HMAC-SHA256.' },
  { path: '/tools/sops-simulator', title: 'Mozilla SOPS — GitOps Secrets Simulator', description: 'An interactive envelope encryption playground. Selectively encrypt configuration values in YAML or JSON files using simulated AWS KMS, Azure Key Vault, or Age keys, preserving key paths for Git diffs.' },
  { path: '/playground/jwt', title: 'JWT Playground — Sign, Crack & Exploit Tokens Live', description: 'Sign real HS256 JSON Web Tokens in your browser, then exploit the alg:none bypass and JWKS-spoofing vulnerabilities hands-on.' },
  { path: '/playground/oauth', title: 'OAuth 2.0 & OIDC Flow Visualizer — Step-by-Step Simulator', description: 'Watch a real OAuth 2.0 / OpenID Connect authorization code flow unfold step-by-step with PKCE, animated redirects, and raw HTTP inspection.' },
  { path: '/playground/saml', title: 'SAML 2.0 Playground — XML Assertions & Signature Wrapping', description: 'Build SAML assertions and launch a live Signature Wrapping (SSW) attack against a mock Service Provider — entirely in your browser.' },
  { path: '/playground/fido2', title: 'FIDO2 & WebAuthn Playground — Passkey Registration Simulator', description: 'Emulate a full FIDO2/WebAuthn passkey registration and login ceremony, parsing real clientDataJSON and authenticatorData bytes.' },
  { path: '/playground/fido2-conditional-ui', title: 'Passkey Conditional UI (Autofill)', description: 'Experience how WebAuthn mediation: conditional seamlessly integrates passkeys directly into standard form autocomplete dropdowns.' },
  { path: '/playground/access', title: 'ABAC vs RBAC Playground — Access Control Policy Simulator', description: 'Evaluate live attribute-based (ABAC) and role-based (RBAC) access decisions side-by-side against device, location, and department context.' },
  { path: '/playground/ldap', title: 'LDAP Playground — Active Directory Filter Simulator', description: 'Search a simulated Active Directory tree with real RFC 4515 LDAP filters and watch matching nodes highlight instantly.' },
  { path: '/playground/zta', title: 'Zero Trust Playground — NIST SP 800-207 Risk Planner', description: 'Model a NIST SP 800-207 Zero Trust risk-scoring engine and see how device, network, and identity signals change access outcomes live.' },
  { path: '/playground/scim', title: 'SCIM Playground — User Provisioning Sync Simulator', description: 'Simulate real-time SCIM 2.0 user and group provisioning between an Identity Provider and Service Provider, including 429/409 sync conflicts.' },
  { path: '/playground/oauth-attack', title: 'OAuth 2.0 Attack Lab — PKCE Bypass & Redirect Hijack Playground', description: 'Hack and defend a mock OAuth 2.0 flow: exploit PKCE downgrade, wildcard redirect URIs, and CSRF state omission, then patch each vulnerability.' },
  { path: '/playground/kerberos', title: 'Kerberos Playground — Golden & Silver Ticket Attack Simulator', description: 'Walk through a full Kerberos AS/TGS ticket exchange, then forge Golden and Silver Tickets against a simulated Active Directory domain.' },
  { path: '/playground/ctf', title: 'Identity CTF Arena — Free IAM Hacking Challenges', description: 'Solve browser-native capture-the-flag challenges covering JWT bypasses, SAML wrapping injections, and LDAP filter escapes, with a live scoreboard.' },
  { path: '/playground/identity-architect', title: 'AI Identity Architect — Generate IAM Blueprints Instantly', description: 'Answer a few questions about your organization and generate a bespoke, compliance-ready identity architecture, threat model, and OPA policy.' },
  { path: '/playground/jwt-cracker', title: 'JWT Cracker — HMAC Secret Dictionary Attack Simulator', description: 'Watch a client-side dictionary attack recover a weak HS256 JWT signing secret in seconds, and learn why short shared secrets are dangerous.' },
  { path: '/playground/cert-chain', title: 'mTLS & Certificate Chain Playground — PKI Trust Simulator', description: 'Build a Root → Intermediate → Leaf Certificate Authority chain, then simulate real-time OCSP and CRL revocation checks and mTLS handshakes.' },
  { path: '/playground/gpo-simulator', title: 'Active Directory GPO Simulator — Password Policy Playground', description: 'Configure Default Domain GPO password length, lockout thresholds, and Kerberos ticket lifetimes, then watch simulated logon lockouts play out.' },
  { path: '/playground/reference-builder', title: 'Enterprise IAM Architecture Builder — Drag & Drop Designer', description: 'Drag and drop identity components to design an enterprise topology, with animated OIDC, SAML, and SCIM handshake traces between them.' },
  { path: '/playground/session-hijacking', title: 'Session Hijacking Playground — Token Theft & DPoP Defense Lab', description: 'Simulate an infostealer stealing a session cookie, then compare how DPoP, IP-binding, and CAEP each stop the replayed token from working.' },
  { path: '/playground/conditional-access', title: 'Conditional Access Playground — Policy Simulator', description: 'Evaluate simulated sign-in requests against device compliance, network, geolocation, and risk-score conditional access policies.' },
  { path: '/playground/opa', title: 'Open Policy Agent (OPA) & Rego Playground — Live Policy Editor', description: 'Write real Rego authorization rules against custom input JSON and trace how the OPA policy engine evaluates each decision.' },
  { path: '/playground/token-exchange', title: 'Token Exchange Playground — RFC 8693 STS Simulator', description: 'Model a Security Token Service broker exchanging an incoming token for a scoped, delegated, or impersonated downstream access token.' },
  { path: '/playground/itdr', title: 'ITDR Playground — Identity Threat Detection Simulator', description: 'Monitor a live authentication log stream, inject brute-force and push-fatigue attacks, and trigger automated lockout countermeasures.' },
  { path: '/playground/gaming-identity', title: 'Gaming & Esports Identity Lab', description: 'Model cross-platform account linking with ban propagation, smurf/ban-evasion detection via device and behavioral signals, and continuous KYC for real-money wagering platforms.' },
  { path: '/playground/device-code-flow', title: 'IoT Device Code Flow — RFC 8628 Authorization', description: 'Simulate OAuth 2.0 on input-constrained devices like Smart TVs. Watch asynchronous polling while the user authenticates out-of-band on a smartphone.' },
  { path: '/playground/jit-provisioning', title: 'B2B SaaS JIT Provisioning — Identity Mapper', description: 'Simulate how enterprise SaaS platforms automatically onboard new corporate users on the fly by mapping SAML/OIDC claims directly into the application database.' },
  { path: '/playground/phantom-token', title: 'API Gateway Phantom Token Sandbox', description: 'Learn the ultimate enterprise pattern for securing SPAs. Watch an API Gateway translate an opaque string into a signed JWT for microservices, hiding PII from the frontend.' },
  { path: '/playground/stix-taxii-ioc', title: 'STIX/TAXII Identity-IOC Fan-Out Simulator', description: 'Assemble a STIX 2.1 object bundle for an identity-relevant indicator of compromise, publish it to a mock TAXII 2.1 collection, and watch subscription filters shape fan-out delivery.' },
  { path: '/playground/oidc-federation', title: 'OIDC Federation Lab (Shared Trust Chains)', description: 'Simulate how multi-tenant federated networks discover, trust, and verify public JWKS across independent issuers.' },
  { path: '/playground/device-trust', title: 'Device Posture Playground — Zero Trust Attestation Simulator', description: 'Simulate a Zero Trust device-posture handshake checking firewall state, disk encryption, OS version, and client certificates before granting access.' },
  { path: '/playground/passkey-internals', title: 'Passkey Internals Playground — WebAuthn Byte-Level Explorer', description: 'Deconstruct the raw authenticatorData byte offsets and CBOR public keys a hardware TPM generates during passkey registration.' },
  { path: '/playground/ai-threat-lab', title: 'AI Deepfake vs MFA Playground — Voice Spoofing Simulator', description: 'Simulate an AI voice-deepfake attack against legacy phone-based MFA and see why FIDO2 hardware-bound credentials resist it.' },
  { path: '/playground/zkp-wallet', title: 'Zero-Knowledge Proof Wallet — Age Verification Playground', description: 'Generate a real zero-knowledge proof that verifies you are over an age threshold without ever revealing your actual birthdate.' },
  { path: '/playground/ambient-trust', title: 'Ambient Trust Playground — Continuous Authentication Simulator', description: 'Watch a session trust score decay and recover in real time as simulated keystroke and location telemetry signals change.' },
  { path: '/playground/workload-mesh', title: 'SPIFFE/SPIRE Playground — Workload Identity Simulator', description: 'Issue dynamic X.509 SVID credentials between simulated microservices and see how workload identity replaces static API keys.' },
  { path: '/playground/xacml', title: 'XACML 3.0 Playground — Policy Combining Algorithm Engine', description: 'Evaluate real XACML 3.0 rules and compare deny-overrides, permit-overrides, first-applicable, and only-one-applicable combining algorithms live.' },
  { path: '/playground/gnap', title: 'GNAP Playground — Grant Negotiation Protocol Visualizer', description: 'Step through an RFC 9635 GNAP grant request, user interaction, continuation, and key-bound token issuance timeline.' },
  { path: '/playground/caep', title: 'CAEP Playground — Continuous Access Evaluation Simulator', description: 'Push signed Security Event Tokens between a transmitter and receiver to see how CAEP revokes sessions and reacts to risk changes in real time.' },
  { path: '/playground/vc-did', title: 'Verifiable Credentials & DID Playground — Issuer/Holder/Verifier Flow', description: 'Issue, hold, and verify a real Ed25519 Verifiable Credential and Presentation entirely in your browser.' },
  { path: '/explore/matchmaker', title: 'Auth Matchmaker — Find Your Ideal Authentication Stack', description: 'Answer a short wizard and get a recommended authentication stack with copyable boilerplate code for your exact requirements.' },
  { path: '/assess', title: 'GRC Maturity Assessment — Free IAM Readiness Self-Test', description: 'A 5-pillar Identity Governance, Risk & Compliance maturity self-assessment with dynamic charts and an exportable roadmap.' },
  { path: '/command-center', title: 'Executive Command Center — Identity Program GRC Hub', description: 'A curated executive front door organizing the site\'s GRC and program-management tools around the four questions a board actually asks — risk, deadline, cost, and ownership.' },
  { path: '/tools/key-ring', title: 'Hardware Key Ring & HSM Emulator', description: 'Generate, store, and execute asymmetric and symmetric cryptographic keys locally inside your browser\'s secure sandbox — emulating a corporate Hardware Security Module (HSM).' },
  { path: '/tools/conformance-checker', title: 'Standards Conformance Checker', description: 'Paste an OIDC discovery document or SAML 2.0 metadata XML and run an automated pass/fail checklist against required fields and structural rules — 100% client-side.' },
  { path: '/tools/pbkdf2-generator', title: 'PBKDF2 Key Derivation & Hash Verifier', description: 'Derive a key from a password using PBKDF2 with a configurable salt, iteration count, and hash function, and verify a password against a stored derived hash — all via the Web Crypto API.' },
  { path: '/tools/cert-bundle-splitter', title: 'PEM Certificate Bundle Splitter & Chain Order Checker', description: 'Paste a multi-certificate PEM bundle to split it into individual certificates, inspect each one\'s subject/issuer/expiry, and check whether the leaf-to-root chain order is correct.' },
  { path: '/tools/did-document-validator', title: 'DID Document Validator & Resolver Preview', description: 'Paste a Decentralized Identifier (DID) Document JSON and validate it against the W3C DID Core structural requirements, with a pretty-printed, field-by-field resolved preview.' },
  { path: '/tools/identity-sbom-analyzer', title: 'Identity SBOM Analyzer — Auth-Adjacent Dependency Risk Report', description: 'Paste a package.json to get an auth-relevant dependency risk report, cross-referenced against known JWT/SAML library CVEs, plus a downloadable "Identity SBOM" JSON export.' },
  { path: '/tools/iam-tco-calculator', title: 'IAM Build vs. Buy TCO Calculator — 3-Year Cost Comparison', description: 'An editable-slider calculator comparing the 3-year total cost of ownership of building an in-house identity stack versus buying a commercial IDaaS subscription.' },
  { path: '/tools/iam-rfp-generator', title: 'IAM RFP Generator — Tailored Vendor Evaluation Questionnaire', description: 'Answer a short questionnaire to generate a categorized, downloadable RFP with deep links to named vendors known to support each capability.' },
  { path: '/tools/iam-salary-compass', title: 'IAM Salary Compass — Identity & Access Management Compensation Guide', description: 'A filterable, IAM-specific compensation comparator by role, seniority, specialization, and region — directional estimates aggregated from public sources.' },
  { path: '/tools/tabletop-exercise-generator', title: 'Tabletop Exercise Generator — Identity Incident Facilitator Script', description: 'Answer a short questionnaire to generate a printable, facilitator-ready tabletop exercise script — objectives, timed injects, discussion prompts, and a scoring rubric — drawn from the Security Bulletins archive.' },
  { path: '/tools/raci-builder', title: 'IAM RACI Builder — Identity Program Governance Matrix', description: 'Assign Responsible/Accountable/Consulted/Informed roles across common IAM program activities, with built-in validation for missing owners and overloaded roles.' },
  { path: '/tools/risk-register-builder', title: 'IAM Risk Register Builder — Impact x Likelihood Scoring', description: 'Add identity program risks, score each by impact x likelihood on a standard 5x5 matrix, assign an owner and mitigation, and export a standard risk-register table.' },
  { path: '/tools/certificate-verifier', title: 'Completion Certificate Verifier — Check a Signed AboutIAM Certificate', description: 'Paste or upload a signed AboutIAM completion certificate to verify its ECDSA P-256 signature locally via SubtleCrypto.verify().' },
  { path: '/tools/pqc-readiness-auditor', title: 'PQC Readiness Auditor — Post-Quantum Crypto-Agility Checklist', description: 'Paste a PEM certificate chain, JWKS JSON, or TLS cipher-suite list to flag quantum-vulnerable algorithms, estimate hybrid post-quantum handshake size growth, and get a prioritized migration checklist.' },
  { path: '/tools/cyber-insurance-readiness', title: 'Cyber-Insurance Identity Readiness Calculator', description: 'Score your identity posture against the controls cyber insurers explicitly underwrite against for a directional premium-impact estimate, gap checklist, and real MFA-related coverage-denial case studies.' },
  { path: '/tools/print-poster', title: 'Printable Identity Security Poster — High-Fidelity A4 Quick Reference', description: 'Renders a beautiful, high-fidelity, printable SVG Cheat Sheet Poster. Perfect for office walls or dev workspaces—summarizes key OAuth, SAML, and JWT guidelines on a single high-contrast sheet.' },
  { path: '/tools/oauth-risk-analyzer', title: 'OAuth 2.0 Authorization URL Parser & Risk Analyzer', description: 'Paste a complex OAuth 2.0 or OIDC authorization URL to parse its parameters, decode scopes, and instantly flag security risks.' },
  { path: '/tools/csp-builder', title: 'Identity-Grade CSP (Content-Security-Policy) Builder', description: 'Visually construct a hardened Content-Security-Policy header. Select your authentication providers to automatically generate strict directive rules.' },
  { path: '/tools/x509-to-jwks-converter', title: 'X.509 Certificate to JWKS Converter', description: 'Convert legacy PEM X.509 certificates directly into modern JSON Web Key Sets (JWKS) arrays for OIDC migrations.' },
  { path: '/tools/saml-metadata-auditor', title: 'SAML Metadata Auditor', description: 'Decode, parse, and flag critical schema risks in XML metadata.' },
  { path: '/tools/oauth-2-1-auditor', title: 'OAuth 2.1 Transition Auditor', description: 'Scan authorization requests and client configurations against OAuth 2.1 best practices.' },
  { path: '/playground/ldap-schema-designer', title: 'AD/LDAP OU & Schema Designer', description: 'Build an Organizational Unit tree from scratch, apply GPOs that cascade through inheritance (or block it), and export the constructed schema as valid LDIF.' },
  { path: '/playground/hr-attribute-mapper', title: 'HR-to-IdP Attribute Mapper', description: 'Click-to-connect mock HR fields (Workday/SAP-style) to AD/Entra/SCIM attributes, apply concat/regex/lookup-table transformations, and watch a live preview and conflict warnings update in real time.' },
  { path: '/playground/identity-fabric', title: 'Identity Fabric / Orchestration Flow Builder', description: 'Wire a legacy protocol-only app to a modern protocol-only IdP through an orchestration node, and watch the trace log narrate each protocol-translation step for IdP migration and cross-IdP policy consistency scenarios.' },
  { path: '/playground/liveness-injection', title: 'Liveness Detection & Injection Attack Lab', description: 'Pit presentation-replay, camera-feed-injection, and real-time face-swap attacks against static-photo, flash-challenge, depth-motion, and full PAD-scoring defenses to see which defense catches which attack class and why.' },
  { path: '/playground/ot-ics-identity', title: 'OT/ICS Device Identity & Segmentation Simulator', description: 'Toggle a factory-floor topology between a flat network and identity-based microsegmentation, trigger a ransomware injection at an HMI, and compare the lateral-movement blast radius between the two modes.' },
  { path: '/playground/trust-registry', title: 'Trust Registry & Issuer Governance Explorer', description: 'Verify a presented credential against a chosen trust registry — see cross-border recognition gaps between national registries and watch a revoked issuer fail authorization even though its signature is still cryptographically valid.' },
  { path: '/playground/ciem-explorer', title: 'Cloud Entitlement Graph Explorer (CIEM Lite)', description: 'Click a role in a seeded AWS-style IAM policy graph to see toxic privilege-escalation combinations, compare granted vs. effective permissions across cross-account trust chains, and shrink a role to least privilege from a mock access log.' },
  { path: '/playground/legacy-federation', title: 'Legacy & Academic Federation Playground', description: 'RADIUS AAA Access-Request/Access-Accept packet exchanges, TACACS+ separated authentication/authorization/accounting phases, and a Shibboleth/eduGAIN WAYF discovery-service redirect — the protocols running enterprise network-auth and academic federation before OAuth/SAML dominance.' },
  { path: '/playground/spatial-identity-lab', title: 'Avatar & Spatial Identity Verification Lab', description: 'Contrast wallet-based cryptographic age attestation against continuous behavioral/gesture telemetry for headset-only VR/AR sessions — no front-facing camera, often a shared device — and see why neither alone catches every risk.' },
  { path: '/playground/agent-identity', title: 'Agentic Identity & MCP Trust Simulator', description: 'Design secure delegation pipelines for non-human AI agents, issue short-lived scoped tokens, configure OAuth 2.1 on-behalf-of trust chains, and enforce scope narrowing to contain blast radius under sub-agent compromise.' },
  { path: '/playground/nhi-sprawl', title: 'NHI Sprawl Cleanup Game', description: 'Triage a seeded fleet of service accounts, API keys, and CI/CD tokens against a real non-human-identity governance rubric — rotate what\'s stale, revoke what\'s orphaned or over-privileged, and keep what\'s legitimately still in use.' },
  { path: '/playground/passkey-rollout-strategist', title: 'Passkey Fleet Rollout Strategist', description: 'Play CISO: allocate a fixed rollout budget across platform SDKs, help-desk training, legacy-fallback sunset, and account recovery, then see a year of quarterly outcomes scored against real 2026 industry benchmarks.' },
  { path: '/playground/modernization-backlog', title: 'IAM Modernization Backlog Game', description: 'Sequence 20 realistic legacy-IAM tech-debt items into a 12-month roadmap under a fixed quarterly budget — respect dependency ordering, stay within budget, and maximize risk reduction per dollar.' },
  { path: '/playground/incident-commander', title: 'Incident Commander — Branching Identity Breach Simulator', description: 'Play incident commander during a live identity breach built from real Security Bulletins incidents (Golden SAML, MFA push fatigue) — every branching decision terminates in a scored outcome with a real-world post-mortem.' },
  { path: '/playground/build-your-idp', title: 'Build-Your-Own-IdP Sandbox', description: 'Assemble a minimal OIDC Provider step by step — generate signing keys, configure the discovery document, register a client, build a consent screen — then watch a mock Relying Party consume it and complete a real signed login, entirely offline.' },
  { path: '/playground/openid4vc-wallet', title: 'OpenID4VC Wallet Studio', description: 'Issue a real SD-JWT verifiable credential, store it in a mock wallet, and selectively disclose only the claims a verifier actually requested — the OID4VCI/OID4VP flow behind eIDAS 2.0 EUDI Wallets.' },
  { path: '/playground/fapi2', title: 'FAPI 2.0 / Open Banking Security Profile Playground', description: 'Simulate the three controls FAPI 2.0 adds on top of plain OAuth 2.0 for financial-grade APIs — Pushed Authorization Requests, sender-constrained tokens, and signed authorization responses — and watch each one independently block a real attack.' },
  { path: '/playground/dpop', title: 'DPoP (Proof-of-Possession) Sandbox — Sender-Constrained Tokens', description: 'Prevent session hijacking using Sender-Constrained Tokens (RFC 9449). Generate a browser keypair, bind it to an access token, and watch an API Gateway block replayed tokens.' },
  { path: '/playground/caep-event-storm', title: 'CAEP Event Storm Visualizer', description: 'Fire a Continuous Access Evaluation Protocol (CAEP) event from a mock IdP and watch it fan out to multiple subscribed relying parties in real time — each with its own subscription list, latency, and enforcement decision.' },
  { path: '/playground/attack-path-graph', title: 'Identity Attack-Path Graph Visualizer — BloodHound-Style Simulator', description: 'Trace privilege-escalation paths through a seeded identity graph of users, groups, service accounts, and machines — click hop-by-hop toward Domain Admin or Cloud Admin, then reveal the true shortest path and its real-world techniques.' },
  { path: '/playground/identity-broker', title: 'Identity Broker Playground — Multi-Tenant SSO Federation Simulator', description: 'Explore multi-tenant single sign-on routing and real-time SAML-to-OIDC token translation across a federated identity broker.' },
  { path: '/playground/magic-link-stepup', title: 'Magic Link & Step-Up Auth Playground — Passwordless Simulator', description: 'Log in with a passwordless email magic link, then trigger a forced step-up to WebAuthn or OTP before completing a high-risk action.' },
  { path: '/playground/credential-stuffing', title: 'Credential Stuffing Defense Playground — Password Spray Simulator', description: 'Replay leaked credentials against a mock login and toggle rate-limiting, CAPTCHA, breached-password detection, and lockout defenses to stop them.' },
  { path: '/playground/ciam-consent', title: 'CIAM Consent Playground — Social Login & Progressive Profiling', description: 'Simulate a social login consent screen, OAuth scope grants, and progressive profile-field collection across multiple sessions.' },
  { path: '/playground/access-certification', title: 'Access Certification Playground — SoD Review Simulator', description: 'Review simulated user-to-entitlement access rows, approve or revoke access, and flag Separation-of-Duties conflicts like a real IGA campaign.' },
  { path: '/playground/role-mining', title: 'Role Mining Workbench — Jaccard-Similarity Role Discovery', description: 'Run Jaccard-similarity clustering over a seeded 30-user entitlement matrix to discover candidate roles — accept, reject, and watch the orphan-entitlement count drop.' },
  { path: '/playground/access-request-cart', title: 'Access Request Cart Simulator — IGA Approval Chain', description: 'Shop a mock entitlement catalog and submit a request through a deterministic approval chain — manager, app-owner for privileged items, and a compliance-officer override for Separation-of-Duties conflicts.' },
  { path: '/playground/risk-engine', title: 'Risk-Based Authentication Playground — Adaptive MFA Simulator', description: 'Combine impossible-travel, device-reputation, and behavior-anomaly signals into a composite risk score that drives allow, step-up, or block.' },
  { path: '/playground/pam-vaulting', title: 'PAM Vaulting Playground — Just-in-Time Elevation Simulator', description: 'Check out a vaulted credential, request time-boxed JIT elevation with approval, and watch session recording and auto-rotation on check-in.' },
  { path: '/playground/hybrid-ad-sync', title: 'Hybrid Identity Sync Playground — PHS vs PTA vs Federation', description: 'Toggle between Password Hash Sync, Pass-Through Authentication, and AD FS Federation to see how each handles the same on-prem login.' },
  { path: '/playground/pqc-handshake', title: 'Post-Quantum Cryptography Handshake Simulator', description: 'Step through classical vs. hybrid vs. pure post-quantum handshakes. Analyze key exchange sizes, signature overheads, and network packet fragmentation thresholds under FIPS 203/204 lattice cryptography.' },
  { path: '/playground/passkey-policy', title: 'Advanced Passkey Policy & Attestation Workbench', description: 'Act as a Relying Party (RP) Security Admin configuring enterprise-grade FIDO2 / WebAuthn registration parameters. Enforce FIPS-restricted AAGUIDs, direct packed attestation anchors, and resident key storage rules.' },
  { path: '/playground/workload-identity', title: 'Workload Identity Federation & OIDC Visualizer', description: 'Ditch long-lived static API secrets. Secure your automated build pipelines (GitHub Actions, GitLab CI) using federated OIDC token handshakes with Cloud Providers.' },
  { path: '/playground/cloud-policy-evaluator', title: 'Multi-Cloud Overlapping IAM Policy Evaluator', description: 'Step inside the heart of an enterprise Policy Evaluation Engine. Visualize and evaluate how Organization SCP boundaries, identity-based IAM permissions, and Resource policies combine to govern access.' },
  { path: '/playground/federated-vp', title: 'Dynamic Trust Framework & Verifiable Presentation Playground', description: 'Explore the architecture of eIDAS 2.0 and the European Digital Identity (EUDI) Wallet. Selectively disclose claims, verify cryptographic SD-JWT signatures, and audit issuers against cross-border trust registries.' },
  { path: '/playground/autonomous-agent', title: 'Autonomous Security Agent Simulation Playground', description: 'Deploy autonomous Red Team and Blue Team AI security agents in simulated token-hijacking and redirect-hijacking arenas. Watch security enforcers dynamically adapt, detect anomalies, and apply cryptographic defenses.' },
  { path: '/career-center', title: 'IAM Interview Prep & Career Center — 6 Role Tracks', description: 'Role-based interview preparation from Fresher to Principal, with MCQs, incident scenarios, system design audits, and resume guidance.' },
  { path: '/scenario-builder', title: 'Identity Scenario Builder — Custom Architecture Generator', description: "Describe your organization's footprint and get an instant, vendor-neutral secure identity architecture blueprint." },
  { path: '/labs', title: 'Interactive Identity Labs — Hands-On IAM Pen-Test Academy', description: 'Solve real OAuth, JWT, SAML, and SCIM security vulnerabilities in a browser-native penetration-testing sandbox.' },
  { path: '/references', title: 'Enterprise IAM Reference Implementations — Copyable Code', description: 'Categorized, beginner-to-advanced library of production-quality, copyable IAM reference code — session auth, LDAP, OAuth/OIDC, WebAuthn, SCIM, OPA/Rego, Vault, cloud workload identity, Kubernetes RBAC, and Istio mTLS.' },
  { path: '/case-studies', title: 'IAM Case Studies — Netflix, Uber, Cloudflare & More', description: '13 real-world, production-quality IAM implementation case studies across Big Tech, Financial Services, Government, and Healthcare.' },
  { path: '/decision-matrix', title: 'Identity Architecture Decision Matrix — Protocol Recommender', description: 'Interactive architecture recommendation engine mapping standard protocols, authorization schemas, IdPs, checklists, and deep-linked tools.' },
  { path: '/threat-modeling', title: 'IAM Threat Modeling Studio — STRIDE & MITRE ATT&CK Simulator', description: 'Visually build an IAM architecture and run threat analysis against STRIDE, MITRE ATT&CK, and OWASP, with dynamic risk scores and mitigation reports.' },
  { path: '/design-review', title: 'IAM Design Review Assistant — OAuth, SAML & JWT Auditor', description: 'Interactive design reviewer executing automated structural audits on OAuth parameters, SAML XML, and JWT payload configurations.' },
  { path: '/standards', title: 'IAM Standards & RFC Explorer — OAuth, SAML, SCIM, WebAuthn', description: '19 living identity standards with visual specifications and RFC timelines across OAuth, OpenID Connect, SCIM, SAML, and WebAuthn.' },
  { path: '/events', title: 'IAM Events & Conferences', description: 'Upcoming Identity and Access Management conferences and summits — EIC, Identiverse, Gartner IAM Summit, Authenticate, RSA Conference, and KuppingerCole Impact Days — with dates, locations, and official links.' },
  { path: '/reports', title: 'IAM Analyst Reports & Research', description: 'Curated abstracts, named leaders, and a cross-analyst leaderboard from the Gartner Magic Quadrant, Forrester Wave, and KuppingerCole Leadership Compass reports on Access Management, PAM, and CIAM, plus Thales\'s annual Data Threat Report research.' },
  { path: '/explore', title: 'IAM Landscape Directory — Compare 21 Identity Products', description: 'Browse Open Source IdPs, Enterprise SaaS, CIAM, PAM, and Secrets Engines side-by-side, with license details and copyable integration snippets.' },
  { path: '/assistant', title: 'AI IAM Assistant — Knowledge Chat, Comparisons & Interview Prep', description: 'Intelligent IAM platform navigator, 20 side-by-side protocol comparisons, a learning planner, and an interview prep simulator.' },
  { path: '/encyclopedia', title: 'IAM Glossary — 182 Identity & Access Management Terms Defined', description: 'A searchable A-Z encyclopedia of Identity and Access Management standards, protocols, and acronyms, each with a beginner analogy and expert spec.' },
  { path: '/timeline', title: 'Interactive Identity Timeline', description: 'An immersive, clickable, dual-themed timeline tracing the history of digital identity from 1961 mainframes to future ambient trust, with active inline simulators for each era.' },
  { path: '/community', title: 'Community Achievements & Challenges', description: 'Unlock offline contributor achievements, tackle tactical security challenges, and trace your learning progression scoreboard.' },
  { path: '/community-forums', title: 'Community Forums & Showcase', description: 'Browse expert architectural discussion boards, deconstruct hardened IAM code snippets, and federate your designed Reference Architectures.' },
  { path: '/wall-of-shame', title: 'IAM Breach Museum — 27 Real-World Identity Security Incidents', description: 'Explore historic identity breaches like Golden SAML and MFA push-bombing fatigue, each with a vulnerable-vs-secure code deconstruction.' },
  { path: '/cheat-sheets', title: 'IAM Cheat Sheets — 24 Security Compliance Checklists', description: 'Interactive hardening checklists for OAuth, SAML, JWT, Zero Trust, Kubernetes RBAC, SOC 2, HIPAA, and GDPR, with live compliance gauges.' },
  { path: '/contributors', title: 'Team & Contact', description: 'Meet the AboutIAM contributors and get in touch.' },
  { path: '/terms', title: 'Terms, License & Disclaimer', description: 'MIT license details and educational-use disclaimer for AboutIAM\'s interactive identity security labs.' },
  { path: '/playground/rag-authorization', title: 'RAG-Aware Authorization Policy Engine', description: 'Simulate vector-level chunk metadata masking to authorize access to AI generated embeddings before the LLM synthesizes an answer.' },
  { path: '/playground/ai-swarm', title: 'Ephemeral AI Swarm Identity Orchestrator', description: 'Deploy an AI swarm and visualize constrained, short-lived tokens (RFC 8693) generated and revoked autonomously by a parent AI.' },
  { path: '/playground/fhe-auth', title: 'Fully Homomorphic Encryption (FHE) Auth Sandbox', description: 'Perform mathematical polynomial intersection on encrypted ciphertexts to verify credentials without exposing the underlying plaintext.' },
  { path: '/playground/qkd-simulator', title: 'Quantum Key Distribution (QKD) Simulator', description: 'Observe the quantum state of photons collapsing during a transmission interception, compared to traditional lattice-based PQC.' },
  { path: '/playground/mdl-proximity', title: 'ISO 18013-5 mDL Proximity Authentication Lab', description: 'Establish an offline secure BLE session using ECDH to pass a cryptographically signed CBOR payload without internet access.' },
  { path: '/playground/space-identity', title: 'Space Identity & DTN Simulator', description: 'Construct a Delay-Tolerant Networking (DTN) space identity packet and simulate store-and-forward authentication across planetary lag.' },
  { path: '/playground/v2x-pki', title: 'V2X PKI Expressway Simulator', description: 'Simulate autonomous vehicles validating sub-10ms ephemeral pseudonymous certificates and rejecting invalid leaf-node brake signals.' },
  { path: '/playground/ebpf-tracer', title: 'eBPF Kernel-Level Identity Tracer', description: 'Configure an eBPF ring-0 authorization policy and watch the kernel drop unauthorized network packets at the OS level.' },
  { path: '/playground/digital-twin', title: 'Digital Twin Identity Binding Workbench', description: 'Cryptographically bond a Physical Unclonable Function (PUF) chip to an X.509 cloud certificate representing an IoT digital twin.' },
  { path: '/playground/bci-auth', title: 'BCI Neural Auth Baseline Simulator', description: 'Map a Brain-Computer Interface (BCI) P300 brainwave hash against a baseline for continuous spatial computing authentication.' },
  { path: '/tools/c2pa-provenance', title: 'C2PA Cryptographic Provenance Tool', description: 'Decode C2PA cryptographic manifests to verify the signing certificate of camera hardware and review exact AI-generation edit history.' },
  { path: '/tools/eu-ai-act-assessor', title: 'EU AI Act Identity Compliance Assessor', description: 'Map your identity architecture against the EU AI Act focusing on governance of high-risk AI, human-in-the-loop, and identity logging.' },
  { path: '/tools/log-anonymizer', title: 'OIDC / SAML Trace Log Anonymizer', description: 'Locally parse and redact PII, signatures, and Bearer tokens from raw HTTP/HAR trace logs so they can be safely shared for debugging.' },
  { path: '/playground/opa-wasm', title: 'Wasm-Native OPA & Directory Engine Simulator', description: 'Simulate compiling OPA Rego policies to Wasm and executing them locally, alongside in-memory directory queries.' },
  { path: '/playground/mcp-server', title: 'Model Context Protocol (MCP) Server Sandbox', description: 'An interactive Model Context Protocol simulator where users configure the AboutIAM MCP server, see how desktop LLM clients poll the tools, and query the Encyclopedia.' },
  { path: '/playground/webrtc-p2p', title: 'WebRTC P2P Cryptographic Handshake', description: 'A split-pane simulator where users manually generate SDP offers, exchange ICE candidates, and negotiate a secure Diffie-Hellman channel between Peer A and Peer B.' },
  { path: '/playground/war-room', title: 'Active SOC "War Room" Threat Simulator', description: 'A gamified, timed incident response dashboard. Users must parse incoming logs, issue revokes, and manage an active threat before a 60-second timer exhausts the simulated insurance coverage.' },
  { path: '/playground/biometric-mesh', title: 'Computer-Vision Biometric Mesh Lab', description: 'A visual canvas simulator tracking head angles, blink rates, and flash-challenge responses to differentiate a live human from a deepfake replay attack.' },
  { path: '/playground/mpc-threshold', title: 'MPC Threshold Signature Scheme Sandbox', description: 'Model Shamir\'s Secret Sharing to split, distribute, and combine cryptographic signature shards across separate user devices.' },
  { path: '/playground/zk-cross-chain', title: 'ZK Cross-Chain Auth Simulator', description: 'Generate a browser-native zk-SNARK cryptographic proof of Web3 wallet holdings to authorize access to corporate Web2 APIs anonymously.' },
  { path: '/playground/sybil-orb', title: 'Sybil-Resistant Iris Hash Lab', description: 'Explore how biometric Gabor filter vectors generate secure, irreversible, Sybil-resistant Iris-Codes for Proof-of-Personhood.' },
  { path: '/playground/m2m-negotiator', title: 'M2M AI Protocol Negotiator', description: 'Visualize autonomous AI agents executing smart-contract bids to negotiate custom-scoped OAuth 2.1 access rules dynamically.' },
  { path: '/playground/ocular-kinetic', title: 'Kinetic-Tremor Continuous Trust Simulator', description: 'Model spatial computing continuous authentication by tracking microscopic hand tremors and involuntary eye saccades.' },
]

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const replaceTag = (html, regex, replacement) => html.replace(regex, () => replacement)

function getOgImage(path) {
  if (path.startsWith('/tools')) return `${SITE_URL}/og-tools.png`
  if (path.startsWith('/playground')) return `${SITE_URL}/og-playground.png`
  if (path.startsWith('/encyclopedia')) return `${SITE_URL}/og-encyclopedia.png`
  if (path.startsWith('/wall-of-shame')) return `${SITE_URL}/og-wall-of-shame.png`
  if (path.startsWith('/learn') || path.startsWith('/primer') || path.startsWith('/roadmap')) return `${SITE_URL}/og-learn.png`
  return `${SITE_URL}/og-image.png`
}

const TOOL_FAQS = {
  '/tools/jwt-decoder': [
    { q: 'Is my JWT sent to any server?', a: 'No, decoding is performed entirely locally inside your browser using JavaScript. No tokens ever leave your machine.' },
    { q: 'What happens if a token has "alg: none"?', a: 'This tool flags "alg: none" as a critical security vulnerability, indicating that signature verification can be easily bypassed.' }
  ],
  '/tools/totp-generator': [
    { q: 'How are TOTP codes computed?', a: 'TOTP codes are generated from a Base32 secret using the HMAC-SHA1 algorithm according to RFC 6238.' },
    { q: 'Can this tool verify codes?', a: 'Yes, you can input a generated code to verify its mathematical alignment with the secret in real-time.' }
  ]
}

function generateJsonLd(route) {
  const canonicalUrl = `${SITE_URL}${route.path}/`
  const graphList = []

  // Base Organization
  graphList.push({
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": "AboutIAM",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/pwa-512.png`
    }
  })

  // 1. BreadcrumbList Schema
  const pathSegments = route.path.split('/').filter(Boolean)
  if (pathSegments.length > 0) {
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`
      }
    ]
    let runningPath = ''
    pathSegments.forEach((segment, idx) => {
      runningPath += `/${segment}`
      const isLast = idx === pathSegments.length - 1
      let name = segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      if (isLast) {
        name = route.title.split('—')[0].split('|')[0].trim()
      }
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": idx + 2,
        "name": name,
        "item": `${SITE_URL}${runningPath}/`
      })
    })
    graphList.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": breadcrumbItems
    })
  }

  // 1.1 FAQ Page Schema
  const faqs = TOOL_FAQS[route.path]
  if (faqs && faqs.length > 0) {
    graphList.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    })
  }

  // 2. Specific Page Schemas
  if (route.path.startsWith('/tools/')) {
    graphList.push({
      "@type": "SoftwareApplication",
      "@id": `${canonicalUrl}#software`,
      "name": route.title.split('—')[0].split('|')[0].trim(),
      "operatingSystem": "All",
      "applicationCategory": "SecurityApplication",
      "browserRequirements": "Requires HTML5, WebCrypto API",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "description": route.description,
      "publisher": { "@id": `${SITE_URL}/#organization` }
    })
  } else if (route.path.startsWith('/playground/') && route.path !== '/playground') {
    graphList.push({
      "@type": "SoftwareApplication",
      "@id": `${canonicalUrl}#software`,
      "name": route.title.split('—')[0].split('|')[0].trim(),
      "operatingSystem": "All",
      "applicationCategory": "EducationalApplication",
      "browserRequirements": "Requires HTML5, WebCrypto API",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "description": route.description,
      "publisher": { "@id": `${SITE_URL}/#organization` }
    })
  } else if (route.path.startsWith('/learn') || route.path.startsWith('/primer')) {
    graphList.push({
      "@type": "Course",
      "@id": `${canonicalUrl}#course`,
      "name": route.title.split('—')[0].split('|')[0].trim(),
      "description": route.description,
      "provider": { "@id": `${SITE_URL}/#organization` }
    })
  } else if (route.path.startsWith('/standards/') || route.path.startsWith('/research') || route.path.startsWith('/bulletins')) {
    const wikidataMap = {
      'oauth': 'https://www.wikidata.org/wiki/Q1046342',
      'oidc': 'https://www.wikidata.org/wiki/Q25112117',
      'saml': 'https://www.wikidata.org/wiki/Q1632736',
      'scim': 'https://www.wikidata.org/wiki/Q17144933',
      'webauthn': 'https://www.wikidata.org/wiki/Q60753556',
      'jwt': 'https://www.wikidata.org/wiki/Q28127393',
      'zero-trust': 'https://www.wikidata.org/wiki/Q104840842'
    }
    const matchingKey = Object.keys(wikidataMap).find(k => route.path.toLowerCase().includes(k))
    const sameAs = matchingKey ? [wikidataMap[matchingKey]] : []

    const articleSchema = {
      "@type": "TechArticle",
      "@id": `${canonicalUrl}#article`,
      "headline": route.title.split('—')[0].split('|')[0].trim(),
      "description": route.description,
      "author": { "@id": `${SITE_URL}/#organization` },
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "url": canonicalUrl
    }
    if (sameAs.length > 0) {
      articleSchema.sameAs = sameAs
    }
    graphList.push(articleSchema)
  }

  const finalSchema = {
    "@context": "https://schema.org",
    "@graph": graphList
  }

  return `<script type="application/ld+json">${JSON.stringify(finalSchema)}</script>`
}

function renderPage(template, route) {
  const title = `${route.title} | AboutIAM`
  const description = escapeHtml(route.description)
  const canonicalUrl = `${SITE_URL}${route.path}/`
  const ogImage = getOgImage(route.path)
  const dynamicJsonLd = generateJsonLd(route)

  const connectSrcTargets = ["'self'"]
  if (process.env.VITE_GISCUS_REPO) {
    connectSrcTargets.push('https://giscus.app', 'https://api.github.com')
  }
  if (process.env.VITE_GOOGLE_CLIENT_ID) {
    connectSrcTargets.push('https://www.googleapis.com')
  }
  const connectSrc = connectSrcTargets.join(' ')
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://giscus.app; style-src 'self' 'unsafe-inline' https://giscus.app; img-src 'self' data: https:; font-src 'self' data:; connect-src ${connectSrc}; base-uri 'self'; form-action 'self'" />`

  const hreflangs = `
  <link rel="alternate" hreflang="en" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />
  `.trim()

  let html = template
  html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*"\s*\/?>/, cspMeta)
  html = replaceTag(html, /<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
  html = replaceTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonicalUrl}" />`)
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}" />`)
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
  html = replaceTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${ogImage}" />`)
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)
  html = replaceTag(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${ogImage}" />`)
  
  if (dynamicJsonLd) {
    html = html.replace('</head>', `${hreflangs}\n${dynamicJsonLd}\n</head>`)
  }
  
  return html
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8')

for (const route of ROUTES) {
  const outDir = join(distDir, ...route.path.split('/').filter(Boolean))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), renderPage(template, route))
}

console.log(`postbuild-ssg: wrote ${ROUTES.length} pre-rendered route pages`)
