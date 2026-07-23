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
  { path: '/primer', title: "Beginner's Onboarding Primer", description: 'Plain-English onboarding to Identity and Access Management — Identify, Authenticate, Authorize, Audit.' },
  { path: '/roadmap', title: 'Zero-to-Hero Learning Pathway', description: 'Chronological, guided learning sequence across every AboutIAM course track.' },
  { path: '/learn', title: 'IAM Academy Curriculum', description: '6 course tracks, 36 modules on Identity and Access Management, with persisted completion progress.' },
  { path: '/architecture', title: 'Interactive Architecture Center', description: '24 clickable, beginner-to-advanced reference identity architectures — from basic session login and LDAP bind auth up through Zero Trust, B2B SaaS, and Multi-Cloud SPIFFE/SPIRE — each with threat models and simulated handshake traces.' },
  { path: '/vendor', title: 'Vendor Knowledge Center', description: '12 comprehensive enterprise IAM vendor deep-dives: Microsoft Entra, Okta, Keycloak, CyberArk, Ping Identity, ForgeRock, SailPoint, Saviynt, WSO2, One Identity, BeyondTrust, and Delinea. Each includes architectures, certifications, deployment checklists, and technical interview questions.' },
  { path: '/research', title: 'Identity Research & CVE Tracker', description: 'Database tracking critical security CVEs, standard IETF RFC drafts, and remediations.' },
  { path: '/patterns', title: 'Identity Design Pattern Library', description: 'Production-grade integration patterns, tradeoffs, and checklists for B2B multi-tenant SaaS, API token exchange, and passwordless FIDO2.' },
  { path: '/certifications', title: 'Enterprise Certification Hub', description: '27 beginner-to-advanced identity, cloud, PAM, IGA, privacy, and GRC certifications — SC-900/SC-300/AZ-500, Okta, Ping, CyberArk, SailPoint, Saviynt, AWS/GCP security, CISSP, CCSP, CISM, CRISC, CIPT/CIPM, and CKS — with study blueprints and mock practice quizzes.' },
  { path: '/bulletins', title: 'Identity Security Bulletin Board', description: 'Incident Response console tracking major real-world identity breaches, attack vectors, and hardened playbooks.' },
  { path: '/playground', title: 'Simulators & Playgrounds', description: 'Index of every interactive IAM simulator: OAuth, SAML, JWT, FIDO2, Zero Trust, and more.' },
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
  { path: '/tools/oidc-discovery', title: 'OIDC Discovery Document Auditor', description: 'Parse, visualize, and audit modern Identity Provider metadata profiles containing standard OIDC endpoint registries.' },
  { path: '/tools/ansible-vault', title: 'Ansible Vault Encryptor & Decryptor', description: 'Encrypt or decrypt secrets client-side using the standard Ansible Vault 1.1/1.2 AES-256 cipher format — 100% browser-native PBKDF2 + AES-CTR + HMAC-SHA256.' },
  { path: '/tools/sops-simulator', title: 'Mozilla SOPS — GitOps Secrets Simulator', description: 'An interactive envelope encryption playground. Selectively encrypt configuration values in YAML or JSON files using simulated AWS KMS, Azure Key Vault, or Age keys, preserving key paths for Git diffs.' },
  { path: '/playground/jwt', title: 'JWT Studio & Exploit Arena', description: 'Browser-native HS256 JWT signing, plus the none-algorithm and JWKS-spoofing exploits.' },
  { path: '/playground/oauth', title: 'OAuth 2.0 / OIDC Handshake Visualizer', description: 'Step-by-step front/back-channel OAuth 2.0 and OIDC flow animation with PKCE and raw HTTP inspection.' },
  { path: '/playground/saml', title: 'SAML 2.0 XML Workbench', description: 'SAML assertion builder and Signature Wrapping (SSW) attack simulator.' },
  { path: '/playground/fido2', title: 'FIDO2 / WebAuthn Lab', description: 'Emulated FIDO2/WebAuthn key ceremonies parsing clientDataJSON and authenticatorData.' },
  { path: '/playground/access', title: 'Access Control Lab', description: 'Dynamic ABAC vs. static RBAC access-control policy evaluation engine.' },
  { path: '/playground/ldap', title: 'LDAP Tree Simulator', description: 'Active Directory schema tree simulator with live LDAP filter search.' },
  { path: '/playground/zta', title: 'Zero Trust Planner', description: 'NIST SP 800-207 Zero Trust risk-scoring planner.' },
  { path: '/playground/scim', title: 'SCIM Provisioning Lab & Sync Engine', description: 'Visual Identity Provider (IdP) to Service Provider (SP) SCIM 2.0 user/group provisioning simulator.' },
  { path: '/playground/oauth-attack', title: 'OAuth 2.0 Attack Lab', description: 'Interactive hack-and-defend arena showcasing PKCE bypasses, Redirect URI wildcard hijacks, and CSRF token theft.' },
  { path: '/playground/kerberos', title: 'Kerberos Tickets Lab', description: 'Interactive Active Directory Kerberos protocol simulator detailing Golden and Silver Ticket exploits.' },
  { path: '/playground/ctf', title: 'Identity CTF Hacking Arena', description: 'Hands-on, browser-native CTF hacking puzzles for JWT signature bypasses, SAML wrapping injections, and LDAP filter parameter escapes.' },
  { path: '/playground/identity-architect', title: 'Identity Architect Dashboard', description: 'Answer simple business questions to dynamically generate highly secure, compliance-ready identity blueprints and policies.' },
  { path: '/playground/jwt-cracker', title: 'JWT Signature Secret Cracker', description: 'Interactive cryptographic simulator demonstrating the danger of using weak shared secrets for HMAC signature keys.' },
  { path: '/playground/cert-chain', title: 'mTLS & Certificate Chain Validator', description: 'Interactive PKI playground to model Certificate Authority trust chains and simulate real-time OCSP / CRL revocations.' },
  { path: '/playground/gpo-simulator', title: 'Active Directory GPO Security Simulator', description: 'Configure Default Domain GPO security variables, simulate client logon lockouts, and inspect issued Kerberos TGT ticket lifespans.' },
  { path: '/playground/reference-builder', title: 'Enterprise IAM Reference Builder', description: 'An interactive drag-and-drop designer for enterprise identity environments and handshakes.' },
  { path: '/playground/session-hijacking', title: 'Session Hijacking & Token Theft Lab', description: 'An interactive simulator demonstrating session cookie hijacking and mitigations like DPoP, IP-binding, and CAEP.' },
  { path: '/playground/conditional-access', title: 'Conditional Access Policy Simulator', description: 'Model context-aware access policies and evaluate incoming requests against device, network, geolocation and risk parameters.' },
  { path: '/playground/opa', title: 'Open Policy Agent (OPA) & Rego Playground', description: 'Write fine-grained access policies using Regos language, design context JSON, and trace compiler rules.' },
  { path: '/playground/token-exchange', title: 'Token Exchange Lab (RFC 8693)', description: 'Exchange incoming user security assertions for scoped downstream APIs access tokens dynamically using delegation or impersonation parameters.' },
  { path: '/playground/itdr', title: 'Identity Threat Detection (ITDR) Lab', description: 'Monitor authentication security streams in real-time, inject brute-force, geovelocity travel or push bombing attacks, and trigger active lockout countermeasures.' },
  { path: '/playground/device-trust', title: 'Device Posture Attestation Lab', description: 'Model Zero Trust endpoint handshakes checking workstation firewalls, disk encryption states, OS kernels, and client certificates.' },
  { path: '/playground/passkey-internals', title: 'Passkey Internals Playground', description: 'Deconstruct the cryptographic and binary metadata generated inside hardware TPMs during WebAuthn public-key registrations.' },
  { path: '/playground/ai-threat-lab', title: 'AI Threat Lab', description: 'Voice-deepfake attack simulations against legacy MFA vs. FIDO2 hardware bounds.' },
  { path: '/playground/zkp-wallet', title: 'ZKP Wallet', description: 'Zero-knowledge age proofs that verify without exposing raw birthdates.' },
  { path: '/playground/ambient-trust', title: 'Ambient Trust', description: 'Continuous ambient biometric telemetry and session trust-score decay.' },
  { path: '/playground/workload-mesh', title: 'Workload Mesh', description: 'SPIFFE/SPIRE attestation and X.509 SVID credential issuance simulator.' },
  { path: '/playground/xacml', title: 'XACML 3.0 Policy Engine', description: 'A real combining-algorithm engine evaluating rules and applying deny-overrides, permit-overrides, first-applicable, and only-one-applicable semantics.' },
  { path: '/playground/gnap', title: 'GNAP Grant Negotiation Visualizer', description: 'RFC 9635 Grant Negotiation and Authorization Protocol timeline: grant requests, interaction, continuation, and key-bound token issuance.' },
  { path: '/playground/caep', title: 'CAEP Continuous Access Evaluation Lab', description: 'Shared Signals Framework transmitter/receiver simulator pushing signed Security Event Tokens (SETs) for session-revoked and risk-change signals.' },
  { path: '/playground/vc-did', title: 'Verifiable Credentials & DID Lab', description: 'Issuer, Holder, and Verifier flow signing and verifying a real Ed25519 Verifiable Credential and Presentation in-browser.' },
  { path: '/explore/matchmaker', title: 'Auth Matchmaker', description: 'Wizard that recommends an authentication stack with copyable boilerplate code.' },
  { path: '/assess', title: 'GRC Maturity Assessments', description: '5-pillar organizational readiness assessment with an exportable roadmap.' },
  { path: '/tools/key-ring', title: 'Hardware Key Ring & HSM Emulator', description: 'Generate, store, and execute asymmetric and symmetric cryptographic keys locally inside your browser\'s secure sandbox — emulating a corporate Hardware Security Module (HSM).' },
  { path: '/tools/conformance-checker', title: 'Standards Conformance Checker', description: 'Paste an OIDC discovery document or SAML 2.0 metadata XML and run an automated pass/fail checklist against required fields and structural rules — 100% client-side.' },
  { path: '/tools/pbkdf2-generator', title: 'PBKDF2 Key Derivation & Hash Verifier', description: 'Derive a key from a password using PBKDF2 with a configurable salt, iteration count, and hash function, and verify a password against a stored derived hash — all via the Web Crypto API.' },
  { path: '/tools/cert-bundle-splitter', title: 'PEM Certificate Bundle Splitter & Chain Order Checker', description: 'Paste a multi-certificate PEM bundle to split it into individual certificates, inspect each one\'s subject/issuer/expiry, and check whether the leaf-to-root chain order is correct.' },
  { path: '/tools/did-document-validator', title: 'DID Document Validator & Resolver Preview', description: 'Paste a Decentralized Identifier (DID) Document JSON and validate it against the W3C DID Core structural requirements, with a pretty-printed, field-by-field resolved preview.' },
  { path: '/playground/identity-broker', title: 'Identity Broker & Federation Sandbox', description: 'Explore multi-tenant single sign-on (SSO), federation routing, and real-time SAML-to-OIDC token translation topologies.' },
  { path: '/playground/magic-link-stepup', title: 'Passwordless Magic Link & Step-Up Auth Lab', description: 'Email magic-link login followed by a forced step-up to WebAuthn/OTP before a high-risk action.' },
  { path: '/playground/credential-stuffing', title: 'Credential Stuffing & Password Spray Defense Lab', description: 'Replay leaked credentials against a mock login and toggle rate-limiting, CAPTCHA, breached-password detection, and lockout defenses.' },
  { path: '/playground/ciam-consent', title: 'CIAM Consent & Progressive Profiling Sandbox', description: 'Social login consent screen, OAuth scope grants, and progressive profile-field collection across sessions.' },
  { path: '/playground/access-certification', title: 'Access Certification Campaign Simulator', description: 'Reviewer walks user-to-entitlement rows, approves or revokes access, and flags Separation-of-Duties (SoD) conflicts.' },
  { path: '/playground/risk-engine', title: 'Adaptive Risk-Based Authentication Engine', description: 'Composite risk score from impossible travel, device reputation, and behavior anomaly signals drives allow, step-up, or block decisions.' },
  { path: '/playground/pam-vaulting', title: 'PAM Vaulting & Just-in-Time Elevation Lab', description: 'Check out a vaulted credential, request time-boxed JIT elevation and approval, toggle session recording, and auto rotate on check-in.' },
  { path: '/playground/hybrid-ad-sync', title: 'Hybrid Identity Sync Lab (PHS / PTA / Federation)', description: 'Toggle between Password Hash Sync, Pass-Through Authentication, and Federation (AD FS) to see how each handles an on-prem login.' },
  { path: '/career-center', title: 'Interview & Career Preparation Center', description: 'Role-based interview preparation, multiple-choice mastery, incident scenarios, system design, code terminals, and resume guidance.' },
  { path: '/scenario-builder', title: 'Identity Scenario Builder & Architect', description: 'Describe your custom corporate footprint and receive an instant vendor-neutral secure architecture design blueprint.' },
  { path: '/labs', title: 'Interactive Identity Labs Academy', description: 'Solve real-world identity security vulnerabilities (OAuth, JWT, SAML, SCIM) in our browser-native pen-test sandbox.' },
  { path: '/references', title: 'Enterprise Reference Implementations', description: 'Categorized, beginner-to-advanced library of production-quality, copyable IAM reference code — session auth, LDAP, OAuth/OIDC, WebAuthn, SCIM, OPA/Rego, Vault, cloud workload identity, Kubernetes RBAC, and Istio mTLS.' },
  { path: '/case-studies', title: 'Enterprise Identity Case Study Center', description: 'Deconstruct real-world, production-quality IAM implementation case studies across Netflix, Uber, Cloudflare, and digital banks.' },
  { path: '/decision-matrix', title: 'Identity Decision Matrix', description: 'Interactive architecture recommendation engine mapping standard protocols, authorization schemas, IdPs, checklists, and deep-linked tools.' },
  { path: '/threat-modeling', title: 'Interactive Threat Modeling Studio', description: 'Visually build an IAM architecture and run threat analysis against STRIDE, MITRE ATT&CK, and OWASP. Calculate dynamic risk scores and generate mitigation reports.' },
  { path: '/design-review', title: 'IAM Design Review Assistant', description: 'Interactive design reviewer executing automated structural audits on OAuth parameters, SAML XML, and JWT payload configurations.' },
  { path: '/standards', title: 'Living Standards & RFC Explorer', description: 'Visually explore standard specifications and RFC timelines across OAuth, OpenID Connect, SCIM, SAML, and WebAuthn.' },
  { path: '/events', title: 'IAM Events & Conferences', description: 'Upcoming Identity and Access Management conferences and summits — EIC, Identiverse, Gartner IAM Summit, Authenticate, RSA Conference, and KuppingerCole Impact Days — with dates, locations, and official links.' },
  { path: '/reports', title: 'IAM Analyst Reports & Research', description: 'Curated abstracts, named leaders, and a cross-analyst leaderboard from the Gartner Magic Quadrant, Forrester Wave, and KuppingerCole Leadership Compass reports on Access Management, PAM, and CIAM, plus Thales\'s annual Data Threat Report research.' },
  { path: '/explore', title: 'IAM Landscape Directory', description: 'Identity product blueprints with copyable integration code.' },
  { path: '/assistant', title: 'AI Knowledge Assistant 2.0', description: 'Intelligent IAM platform navigator, side-by-side protocol comparison engine, learning planner, and interview prep simulator.' },
  { path: '/encyclopedia', title: 'Master IAM Glossary', description: 'Searchable A-Z glossary of 35+ Identity and Access Management standards and acronyms.' },
  { path: '/timeline', title: 'Interactive Identity Timeline', description: 'An immersive, clickable, dual-themed timeline tracing the history of digital identity from 1961 mainframes to future ambient trust, with active inline simulators for each era.' },
  { path: '/community', title: 'Community Achievements & Challenges', description: 'Unlock offline contributor achievements, tackle tactical security challenges, and trace your learning progression scoreboard.' },
  { path: '/community-forums', title: 'Community Forums & Showcase', description: 'Browse expert architectural discussion boards, deconstruct hardened IAM code snippets, and federate your designed Reference Architectures.' },
  { path: '/wall-of-shame', title: 'Vulnerability Lab', description: 'Historic identity breaches, including Golden SAML and MFA push-bombing fatigue attacks.' },
  { path: '/cheat-sheets', title: 'Developer Playbooks', description: 'Compliance checklists for SPAs and machine-to-machine credentials.' },
  { path: '/contributors', title: 'Team & Contact', description: 'Meet the AboutIAM contributors and get in touch.' },
  { path: '/terms', title: 'Terms, License & Disclaimer', description: 'MIT license details and educational-use disclaimer for AboutIAM\'s interactive identity security labs.' },
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

function renderPage(template, route) {
  const title = `${route.title} | AboutIAM`
  const description = escapeHtml(route.description)
  const canonicalUrl = `${SITE_URL}${route.path}/`
  const ogImage = getOgImage(route.path)

  let html = template
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
  return html
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8')

for (const route of ROUTES) {
  const outDir = join(distDir, ...route.path.split('/').filter(Boolean))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), renderPage(template, route))
}

console.log(`postbuild-ssg: wrote ${ROUTES.length} pre-rendered route pages`)
