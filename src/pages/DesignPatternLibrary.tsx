import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, ArrowRight, ShieldCheck,
  Terminal, Settings, Layers, AlertTriangle, Cpu
} from 'lucide-react'

type PatternType =
  | 'basic_session_auth' | 'social_login' | 'otp_verification' | 'rbac_basic' | 'password_reset'
  | 'mfa_totp_stepup' | 'sso_reverse_proxy' | 'api_key_m2m' | 'jwt_stateless_api'
  | 'b2b_sso' | 'token_exchange' | 'passwordless' | 'banking' | 'healthcare' | 'government' | 'workforce'
  | 'jit_pam' | 'caep_continuous' | 'spiffe_workload'

type PatternLevel = 'beginner' | 'intermediate' | 'advanced'

interface PatternDetails {
  name: string
  shortLabel: string
  level: PatternLevel
  subtitle: string
  problemStatement: string
  architectureOverview: string
  tradeoffs: { title: string; desc: string }[]
  sequenceFlow: string[]
  checklist: string[]
  sequenceDiagram?: string // Optional ASCII visual sequence flow
  sequenceDiagramTitle?: string
  /** Optional cross-links to hands-on tools/playgrounds that validate this pattern — same shape as standardsData.ts/architectureData.ts. */
  relatedResources?: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
}

const LEVEL_LABELS: Record<PatternLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
}

const PATTERN_DATA: Record<PatternType, PatternDetails> = {
  b2b_sso: {
    name: 'B2B Multi-Tenant Federated SSO & Provisioning',
    shortLabel: 'B2B Multi-Tenant',
    level: 'advanced',
    subtitle: 'Enterprise-grade tenant isolation, domain-based SSO redirection, and automated user synchronization.',
    problemStatement: 'Enterprise SaaS customers demand that their employees authenticate utilizing their own existing corporate identity providers (e.g. Okta, Entra ID) and expect automated provisioning/de-provisioning when employees join or leave the company, preventing manual account overheads and access leakage.',
    architectureOverview: 'Federates the SaaS central authentication broker with multiple tenant-specific identity directories using SAML 2.0 / OIDC. Implements domain-based routing (intercepting email suffixes like `@corp-a.com` to redirect to Tenant A\'s IdP) and exposes an RFC 7644 SCIM 2.0 endpoint for real-time CRUD user sync.',
    tradeoffs: [
      { title: 'Shared DB with Row-Level Security (RLS)', desc: 'Highly cost-effective and simple to deploy, but risks accidental cross-tenant data leakage if SQL queries are malformed.' },
      { title: 'Database-per-Tenant Isolation', desc: 'Guarantees absolute compliance and cryptographic isolation, but incurs heavy infrastructure scaling costs and cluster database migration overheads.' }
    ],
    sequenceFlow: [
      'User accesses tenant landing page: `company-a.saasapp.com`.',
      'SaaS Router identifies Tenant A context and retrieves registered IDP configurations.',
      'SaaS redirects the user’s browser carrying a SAMLRequest/OIDC authorization payload to Tenant A\'s Okta directory.',
      'User completes corporate MFA; Okta redirects browser back carrying a cryptographically signed assertion.',
      'SaaS central broker validates the signature, maps claims, and opens an isolated database session.'
    ],
    checklist: [
      'Implement strict subdomain and email-domain parsing algorithms at the ingress layer.',
      'Support both metadata-URL-syncing and manual XML upload for customer SAML certificates.',
      'Expose standard, token-secured `/Users` and `/Groups` SCIM 2.0 endpoints.',
      'Enable strict SAML Assertion signature validation, ensuring XML signature wrapping (SSW) is prevented.'
    ],
    relatedResources: [
      { title: 'SAML Metadata Builder', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'SCIM Payload Validator & Builder', path: '/tools/scim-payload-validator', type: 'tool' },
      { title: 'Identity Broker & Federation Sandbox', path: '/playground/identity-broker', type: 'playground' }
    ]
  },
  token_exchange: {
    name: 'API Gateway Token Exchange & Delegation (RFC 8693)',
    shortLabel: 'Token Exchange',
    level: 'advanced',
    subtitle: 'Swapping external user-scoped tokens for restricted, machine-specific downstream credentials.',
    problemStatement: 'A public client application (SPA or mobile app) accesses a secure API Gateway with a high-privilege user access token. However, calling downstream microservices with the same token violates the least privilege principle, exposing user permissions to internal network components and risking token replay attacks across internal systems.',
    architectureOverview: 'Enforces the RFC 8693 Token Exchange standard. The edge API Gateway acts as a Token Exchange client: it accepts the incoming user token, requests the central security token service (STS) to validate it, and exchanges it for a restricted, short-lived, service-to-service JWT token containing limited scopes mapped strictly for downstream microservice boundaries.',
    tradeoffs: [
      { title: 'Edge Token Exchange', desc: 'Ensures absolute downstream isolation and microservice security, but adds database network latency overheads on the token-swap round-trip.' },
      { title: 'Shared Gateway Cache', desc: 'Allows downstream proxies to cached token exchanges locally, speeding up requests, but increases token revocation synchronization lag.' }
    ],
    sequenceFlow: [
      'Client SPA calls Edge API Gateway with standard User Access Token (Scope: `user.write`).',
      'API Gateway validates the token and extracts identity attributes.',
      'API Gateway calls Security Token Service (STS) `/token` endpoint with `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`.',
      'STS validates parameters and issues a restricted, machine-scoped downstream JWT (Scope: `service.billing.write`).',
      'API Gateway forwards request to billing microservice carrying only the restricted downstream token.'
    ],
    checklist: [
      'Configure the central STS to accept and parse standard RFC 8693 `subject_token` and `actor_token` parameters.',
      'Ensure exchanged downstream tokens have highly restricted lifetimes (e.g. 5 minutes max).',
      'Set up mutual TLS (mTLS) to secure the backchannel transport between API Gateway, STS, and downstream microservices.',
      'Map aud (Audience) claims strictly on exchanged tokens to restrict them to specific backend microservice domains.'
    ],
    sequenceDiagram: `
+--------------------+            +-------------------+            +--------------------+
|     Client SPA     |            |  API Edge Gateway |            | Security Token Svc |
+--------------------+            +-------------------+            +--------------------+
          |                                 |                                 |
          |--- 1. GET /billing ------------>|                                 |
          |    (User Access Token)          |--- 2. POST /token ------------->|
          |                                 |    (Exchange Request)           |
          |                                 |                                 |
          |                                 |<-- 3. Exchanged billing JWT ----|
          |                                 |                                 |
          |                                 |=== 4. Forward billing JWT ====> | [ Billing Service ]
`,
    sequenceDiagramTitle: 'Interactive Token Exchange Handshake Tracing (RFC 8693)',
    relatedResources: [
      { title: 'Token Exchange Lab (RFC 8693)', path: '/playground/token-exchange', type: 'playground' },
      { title: 'JWT Decoder', path: '/tools/jwt-decoder', type: 'tool' },
      { title: 'JWT Generator', path: '/tools/jwt-generator', type: 'tool' }
    ]
  },
  passwordless: {
    name: 'Passwordless FIDO2 / WebAuthn Customer Journey',
    shortLabel: 'Passwordless FIDO2',
    level: 'advanced',
    subtitle: 'Implementing phishing-proof public-key credential registration and authentication loops.',
    problemStatement: 'Relying on traditional passwords leads to massive security liabilities: corporate users fall victim to phishing links, share credentials, and suffer from password reuse. Standard MFA channels like SMS OTP or push notifications are prone to interception, SIM-swapping, and push fatigue hacking.',
    architectureOverview: 'Implements WebAuthn (W3C/FIDO2) public-key cryptography directly inside the application browser context. During registration, the browser requests the device’s hardware TPM to generate an asymmetric key pair, keeping the private key locked in hardware and sending the public key to the relying party (SaaS backend). During login, the user completes local biometrics (TouchID, FaceID) to sign a cryptographic challenge.',
    tradeoffs: [
      { title: 'Passkey Cloud Sync (Apple/Google)', desc: 'Provides seamless, user-friendly recovery and cross-device synchronization, but removes absolute hardware binding controls required by ultra-high-risk systems.' },
      { title: 'Hardware-Bound Security Keys (YubiKey)', desc: 'Guarantees absolute physical identity ownership and is completely uncopyable, but introduces recovery friction if the physical key is lost.' }
    ],
    sequenceFlow: [
      'User clicks "Login with Passkey" and enters their username.',
      'SaaS server generates a random challenge and returns registration options, including the Relying Party ID.',
      'Browser invokes `navigator.credentials.create()` (or `.get()` for login), triggering local biometrics.',
      'Device TPM signs the challenge, and browser returns the signature payload and credential ID.',
      'SaaS server verifies the signature against the stored public key, establishing the secure session.'
    ],
    checklist: [
      'Enforce strict verification of `clientDataJSON` and `authenticatorData` bytes on the server backend.',
      'Verify that the incoming `origin` matches the registered application custom domain exactly to prevent phishing relays.',
      'Validate and record the signature counter to detect cloned or replayed authenticator payloads.',
      'Provide fallback authentication options (e.g., recovery codes) during initial passkey setup.'
    ],
    relatedResources: [
      { title: 'WebAuthn / Passkey Assertion Decoder', path: '/tools/webauthn-decoder', type: 'tool' },
      { title: 'FIDO2 & WebAuthn Playground', path: '/playground/fido2', type: 'playground' },
      { title: 'Passkey Internals Playground', path: '/playground/passkey-internals', type: 'playground' }
    ]
  },
  banking: {
    name: 'Financial-grade API (FAPI 1.0 Advanced) Security Pattern',
    shortLabel: 'Financial-grade API',
    level: 'advanced',
    subtitle: 'Enforcing mTLS, sender-constrained tokens, private_key_jwt, and signed request objects (JAR) for open banking APIs.',
    problemStatement: 'Standard retail banking OAuth bearer tokens are highly vulnerable to leakage and man-in-the-middle interceptions. If a standard access token is stolen via network proxies or leaked server logs, an attacker can immediately replay it to execute unauthorized wire transfers.',
    architectureOverview: 'Implements Financial-grade API (FAPI 1.0 Advanced) specifications. Enforces mutual TLS (mTLS) for both transport encryption and sender-constraining access tokens. Replaces shared client secrets with asymmetric Client Assertion JWTs (private_key_jwt) and requires cryptographically signed request objects (JAR / RFC 9101) to eliminate client-side parameter tampering.',
    tradeoffs: [
      { title: 'Strict mTLS Routing', desc: 'Provides absolute, unbreakable cryptographic proof-of-possession, but increases proxy configuration overhead and does not support legacy HTTP gateways.' },
      { title: 'Signed JAR requests', desc: 'Eliminates request parameter modification exploits completely, but adds cryptographic signature-verification compute overhead to the API server.' }
    ],
    sequenceFlow: [
      'FinTech Client initiates an mTLS connection to the bank\'s Token endpoint.',
      'FinTech presents a cryptographically signed Client Assertion JWT signed with its private key.',
      'Bank Token endpoint verifies the signature, and issues an access token constrained to the client\'s TLS certificate.',
      'FinTech calls `/transfer` API presenting the sender-constrained token over mTLS.',
      'Bank API Gateway verifies the token\'s certificate thumbprint matches the TLS client certificate.'
    ],
    checklist: [
      'Enforce asymmetric `private_key_jwt` client authentication inside OAuth client settings.',
      'Configure the API Gateway to bind the client\'s TLS certificate thumbprint (cnf claim) to the issued JWT access token.',
      'Require cryptographically signed authorization request objects (JAR / RFC 9101) to protect incoming URL parameters.',
      'Reject any incoming connections lacking valid mTLS handshakes or utilizing blacklisted cipher suites.'
    ]
  },
  healthcare: {
    name: 'SMART on FHIR Patient Access & Consent Pattern',
    shortLabel: 'SMART on FHIR',
    level: 'advanced',
    subtitle: 'Standardizing scoped user authorization and EHR profile mappings across hospital databases.',
    problemStatement: 'Healthcare directories contain sensitive patient PII under strict HIPAA and GDPR boundaries. Connecting third-party doctor or patient portals to Electronic Health Record (EHR) databases often leads to massive privilege escalations, leaking unrelated patient records.',
    architectureOverview: 'Implements the HL7 SMART on FHIR authorization profile based on OAuth 2.0. Utilizes granular clinical scope strings (e.g., `patient/Patient.read`, `user/Observation.write`) to enforce least-privilege boundaries. The central EHR server evaluates user context, ensuring clinicians can only retrieve patient records mapped directly to their assigned active care groups.',
    tradeoffs: [
      { title: 'Granular FHIR Scopes', desc: 'Limits API access to specific patient records and resources, but increases OIDC claim mapping complexity across old HL7 database schemas.' },
      { title: 'Dynamic Care-Team Checks', desc: 'Enforces strict clinical compliance boundaries, but adds run-time database lookup latency during authorization checks.' }
    ],
    sequenceFlow: [
      'Clinician logs into third-party patient portal and requests records.',
      'Portal redirects clinician to hospital EHR OIDC authorization endpoint requesting scopes: `patient/*.read`.',
      'EHR prompts credentials, verifies clinician group, and asks user to confirm clinical consent.',
      'EHR issues signed ID Token and Access Token containing the clinician\'s active `patient_context` claim.',
      'Portal calls hospital FHIR REST API with the token. FHIR Gateway restricts queries strictly to the assigned patient.'
    ],
    checklist: [
      'Map all user profiles to standard HL7 FHIR resource schemas (e.g. Practitioner, Patient).',
      'Enforce strict scope verification checks (e.g. `patient/Condition.read`) at the clinical gateway boundary.',
      'Implement dynamic care-team database checks to block clinicians from accessing records of patients they are not actively treating.',
      'Encrypt all FHIR resource payloads at-rest and sanitize all transaction audit logs.'
    ]
  },
  government: {
    name: 'PIV/CAC High-Assurance Gov Federation Pattern',
    shortLabel: 'PIV/CAC Gov',
    level: 'advanced',
    subtitle: 'Implementing hardware-backed PIV/CAC certificate handshakes and FedRAMP security bounds.',
    problemStatement: 'Government systems manage critical infrastructure and sensitive national databases. Traditional passwords or mobile app SMS OTPs are completely insufficient, failing high-assurance FedRAMP compliance and remaining vulnerable to advanced persistent threat (APT) spear-phishing.',
    architectureOverview: 'Enforces High-Assurance credential integrations conforming to NIST SP 800-63B (AAL3). Enforces physical cryptographic smart cards (PIV / Personal Identity Verification, or CAC / Common Access Card) carrying hardware-bound client certificates. During login, the browser negotiates a secure client-certificate TLS handshake, prompting the user for their smart card PIN to unlock local signing keys.',
    tradeoffs: [
      { title: 'PIV/CAC mTLS Auth', desc: 'Guarantees the highest possible level of phishing-resistant, hardware-backed identity, but requires specialized physical card-reader hardware and enterprise certificate authority setups.' },
      { title: 'Offline Root CA setup', desc: 'Ensures absolute cryptographic trust control, but requires physical safes and strict multi-person quorum ceremonies.' }
    ],
    sequenceFlow: [
      'User inserts their physical PIV/CAC smart card into the reader and navigates to the government portal.',
      'Government portal gateway terminates connection and initiates an mTLS handshake, requesting a client certificate.',
      'Browser prompts user for their smart card PIN to unlock the certificate\'s private signing key.',
      'Browser signs the TLS handshake claim. Gateway validates the certificate chain against the federal Root CA.',
      'Gateway parses the subject name (e.g. EDIPI) and maps it to directory permissions, granting access.'
    ],
    checklist: [
      'Enforce NIST SP 800-63B Authenticator Assurance Level 3 (AAL3) guidelines for all admin boundaries.',
      'Configure the gateway proxies to terminate mTLS and extract the unique Subject Alternative Name (SAN) from the PIV/CAC.',
      'Maintain active local Certificate Revocation Lists (CRL) or real-time OCSP responders to detect stolen or revoked smart cards.',
      'Store all intermediate CA signing keys inside physical, air-gapped FIPS 140-2 Level 3 HSM hardware.'
    ]
  },
  workforce: {
    name: 'Workforce Contextual Access & Posture Pattern',
    shortLabel: 'Workforce Zero Trust',
    level: 'advanced',
    subtitle: 'Continuous device posture attestation and conditional risk-based access rules.',
    problemStatement: 'Securing corporate workforce directories against lateral movement. In modern remote-work setups, attackers who compromise user credentials can immediately log in from untrusted personal laptops, bypassing static MFA parameters and accessing confidential source code.',
    architectureOverview: 'Implements Workforce Zero Trust contextual access controls (NIST SP 800-207). It integrates with Endpoint Protection (EDR) and Mobile Device Management (MDM) agents to continuously verify device compliance (encryption active, firewall enabled, managed certificate present) and evaluates real-time geolocation risk scores before allowing a session.',
    tradeoffs: [
      { title: 'Continuous Attestation', desc: 'Minimizes lateral movement risk and blocks unmanaged endpoints, but requires installing native agents on employee workstations.' },
      { title: 'Adaptive MFA Step-Up', desc: 'Balances user friction and security, but requires complex correlation algorithms inside the central policy engine.' }
    ],
    sequenceFlow: [
      'Employee workstation initiates a connection to the corporate SaaS portal.',
      'Gateway intercepts request and queries local MDM compliance agents to attest device posture.',
      'Gateway evaluates context variables: user department, device health, trusted IP range, and session risk.',
      'Central PDP evaluates policies and determines that an unmanaged IP requires biometric step-up checks.',
      'Workstation prompts local FaceID verification. Handshake completes successfully, granting restricted access.'
    ],
    checklist: [
      'Deploy MDM agents to all corporate endpoints to enforce mandatory disk encryption and active firewalls.',
      'Deploy client-attestation certificates (mTLS) to corporate-managed devices to identify managed vs personal BYOD.',
      'Enforce dynamic risk-based policy rules to block or step-up authentication based on impossible travel or anomalous IPs.',
      'Enforce a default-deny rule fallback. If the device posture agent is offline, restrict access.'
    ]
  },
  basic_session_auth: {
    name: 'Username/Password + Server-Side Session Cookie',
    shortLabel: 'Session Cookie Auth',
    level: 'beginner',
    subtitle: 'The classic login form: verify a password hash, then track the user with an opaque server-side session cookie.',
    problemStatement: 'A brand-new application needs the simplest possible way to know "who is making this request" across multiple page loads, without building any external identity infrastructure.',
    architectureOverview: 'The user submits credentials over HTTPS. The server looks up the account, compares the submitted password against a salted hash (bcrypt/Argon2) stored in the database, and on success creates a session record (in-memory store or database) keyed by a random session ID. That ID is returned to the browser as an `HttpOnly`, `Secure`, `SameSite=Lax` cookie, which the browser automatically attaches to every subsequent request so the server can look up the session and identify the user.',
    tradeoffs: [
      { title: 'Server-Side Session Store', desc: 'Sessions can be instantly revoked by deleting the record, but requires a shared store (Redis) once you run more than one server instance.' },
      { title: 'Cookie-Only, No Server State', desc: 'Removes the shared-store dependency, but you lose instant revocation — the cookie itself would need to become a signed token (see JWT pattern) with a natural downside of only expiring, not being revocable, mid-lifetime.' }
    ],
    sequenceFlow: [
      'User submits email + password over an HTTPS POST to `/login`.',
      'Server fetches the stored password hash for that email and verifies it with bcrypt/Argon2.',
      'On success, server generates a cryptographically random session ID and stores `{ sessionId: userId }` in the session store.',
      'Server responds with a `Set-Cookie: sessionId=...; HttpOnly; Secure; SameSite=Lax` header.',
      'Every later request includes the cookie automatically; the server looks up the session ID to resolve the current user.'
    ],
    checklist: [
      'Always hash passwords with a slow, salted algorithm (bcrypt/Argon2/scrypt) — never store or compare plaintext.',
      'Set the session cookie as `HttpOnly` (blocks JS/XSS theft) and `Secure` (HTTPS-only transmission).',
      'Rotate the session ID on privilege change (e.g. right after login) to prevent session fixation attacks.',
      'Enforce an absolute session lifetime and an idle timeout, and invalidate the server-side record on logout.'
    ]
  },
  social_login: {
    name: 'Social Login ("Sign in with Google/Apple")',
    shortLabel: 'Social Login',
    level: 'beginner',
    subtitle: 'Let users log in with an identity they already trust, instead of creating and remembering yet another password.',
    problemStatement: 'Forcing every new user through a fresh registration form (choose a password, verify an email) creates signup friction and adds a database of passwords the app must protect — a liability if the app itself is ever breached.',
    architectureOverview: 'The app becomes an OAuth 2.0 / OIDC Relying Party to a large identity provider (Google, Apple, Microsoft). The user is redirected to the provider, authenticates there (often already has an active session), and grants the app permission to read basic profile scopes (`openid profile email`). The app receives an ID Token, verifies its signature against the provider\'s public JWKS, and creates or matches a local account keyed by the provider\'s stable subject (`sub`) claim.',
    tradeoffs: [
      { title: 'Single Social Provider', desc: 'Fastest to implement and covers most users, but locks out anyone without that specific account (e.g. no Google account) unless a fallback is offered.' },
      { title: 'Multi-Provider "Auth Aggregator"', desc: 'Maximizes conversion by offering Google, Apple, and Microsoft side by side, but multiplies the account-linking edge cases (same email registered via two different providers).' }
    ],
    sequenceFlow: [
      'User clicks "Sign in with Google" and the app redirects to Google\'s OAuth authorization endpoint with `scope=openid profile email`.',
      'User authenticates (or reuses an existing Google session) and consents to sharing profile/email.',
      'Google redirects back to the app\'s callback URL with an authorization code.',
      'App exchanges the code server-side for an ID Token + Access Token, and verifies the ID Token signature against Google\'s JWKS.',
      'App looks up or creates a local user record keyed by the verified `sub` claim and starts a local session.'
    ],
    checklist: [
      'Always validate the `state` parameter to prevent CSRF and the `nonce` claim to prevent ID-token replay.',
      'Key the local account on the provider\'s immutable `sub` claim, never on the (changeable, sometimes unverified) email address alone.',
      'Verify the ID Token\'s signature, issuer (`iss`), and audience (`aud`) server-side — never trust an unverified token from the browser.',
      'Offer an account-linking flow for users who sign up once via email and later try a social provider with the same address.'
    ]
  },
  otp_verification: {
    name: 'Email/SMS One-Time Password (OTP) Verification',
    shortLabel: 'OTP Verification',
    level: 'beginner',
    subtitle: 'Prove control of an email inbox or phone number with a short-lived, single-use numeric code.',
    problemStatement: 'An app needs to verify a new user actually owns the email address or phone number they registered with — or wants a lightweight second factor — without requiring them to install an authenticator app or manage a password at all.',
    architectureOverview: 'When verification is triggered, the server generates a random 6-digit code, stores a salted hash of it alongside an expiry timestamp (typically 5–10 minutes) and an attempt counter, then delivers the raw code out-of-band via email or SMS. The user types the code back into the app; the server hashes the submission and compares it to the stored hash, rejecting on expiry or after too many wrong attempts.',
    tradeoffs: [
      { title: 'SMS Delivery', desc: 'Familiar and works on any phone without an app install, but vulnerable to SIM-swap attacks and carries per-message SMS gateway costs.' },
      { title: 'Email Delivery', desc: 'Free and avoids SIM-swap risk entirely, but is only as strong as the security of the user\'s email inbox itself.' }
    ],
    sequenceFlow: [
      'User requests a code by submitting their email or phone number.',
      'Server generates a random 6-digit code, hashes it, and stores `{ hash, expiresAt, attempts: 0 }` against that identifier.',
      'Server dispatches the raw code via an email/SMS provider, never logging or returning it in any API response.',
      'User submits the code; server hashes the submission and compares it to the stored hash within the expiry window.',
      'On match, server marks the identifier verified (or completes the login) and immediately invalidates the code so it cannot be reused.'
    ],
    checklist: [
      'Rate-limit both code generation and verification attempts per identifier and per IP to block brute-force guessing of a 6-digit space.',
      'Never include the raw code in logs, analytics events, or error responses — treat it as a credential.',
      'Enforce a short expiry window (5–10 minutes) and invalidate the code immediately after first successful use.',
      'Cap verification attempts (e.g. 5) per issued code and require a fresh code after the cap is hit.'
    ]
  },
  rbac_basic: {
    name: 'Basic Role-Based Access Control (RBAC)',
    shortLabel: 'Basic RBAC',
    level: 'beginner',
    subtitle: 'Assign users to a small number of named roles, and gate features by role instead of by individual user.',
    problemStatement: 'A growing app has an "admin panel" and needs to stop every logged-in user from seeing it, but writing `if (user.email === "admin@company.com")` checks scattered across the codebase becomes unmanageable and error-prone as the team grows.',
    architectureOverview: 'Each user is assigned one or more roles from a small, fixed set (e.g. `viewer`, `editor`, `admin`). Each role is mapped to a set of permitted actions in a central table. Route/API middleware checks the current user\'s role(s) against the required permission for the requested action before allowing the request through, centralizing the authorization logic in one place instead of duplicating checks everywhere.',
    tradeoffs: [
      { title: 'Static Role-to-Permission Table', desc: 'Extremely simple to audit and reason about, but coarse-grained — cannot express "editor for project A only," so scaling to per-resource access needs a different pattern (ABAC/policy engine).' },
      { title: 'Roles Stored as JWT Claims', desc: 'Fast authorization checks with no database round-trip, but role changes don\'t take effect until the token is refreshed/reissued.' }
    ],
    sequenceFlow: [
      'Administrator assigns a user the `editor` role via an admin UI, persisted in a `user_roles` table.',
      'User logs in; the server attaches their role(s) to the session or embeds them as a JWT claim.',
      'User requests a protected action, e.g. `DELETE /posts/42`.',
      'Middleware checks a `rolePermissions` map: does `editor` include `posts:delete`?',
      'Request proceeds only if the role grants that permission; otherwise the middleware returns `403 Forbidden`.'
    ],
    checklist: [
      'Centralize the role-to-permission mapping in one module — never duplicate ad-hoc role checks across route handlers.',
      'Default to deny: an undefined role or permission should fail closed, not open.',
      'Keep roles coarse (a handful, not dozens) — once you need per-resource or attribute-based rules, migrate to ABAC/OPA instead of stacking more roles.',
      'Re-check the server-side role on every request; never trust a role flag sent from or cached only in the client.'
    ]
  },
  password_reset: {
    name: 'Self-Service Password Reset & Account Recovery',
    shortLabel: 'Password Reset',
    level: 'beginner',
    subtitle: 'Let a locked-out user regain access via a time-boxed, single-use secure link — without ever emailing the old password.',
    problemStatement: 'Users forget passwords constantly. Without a self-service flow, every forgotten password becomes a support ticket — and a naive implementation (emailing the existing password, or a predictable reset link) creates a serious account-takeover vulnerability.',
    architectureOverview: 'The user submits their email; the server generates a high-entropy, single-use reset token, stores its hash with a short expiry (typically 15–60 minutes), and emails a link containing the raw token. Visiting the link lets the user set a new password; the server verifies the token hash and expiry, updates the password hash, invalidates the token, and — critically — invalidates all existing sessions for that account.',
    tradeoffs: [
      { title: 'Single-Use Emailed Link', desc: 'Simple and requires no extra hardware, but is only as strong as the security of the user\'s email account.', },
      { title: 'Reset via Registered MFA Device', desc: 'Stronger — doesn\'t depend on email security at all — but locks out any user who has lost their MFA device along with their password.' }
    ],
    sequenceFlow: [
      'User clicks "Forgot password?" and submits their email address.',
      'Server always responds with an identical generic message ("If that account exists, a reset link was sent") regardless of whether the email matches an account, to prevent user enumeration.',
      'Server generates a random reset token, stores its hash + expiry, and emails a link like `/reset?token=<raw-token>`.',
      'User opens the link and submits a new password; server re-hashes the presented token and compares it against the stored hash within the expiry window.',
      'On success, server updates the password hash, deletes the reset token, and invalidates every other active session for that account.'
    ],
    checklist: [
      'Return the same response whether or not the submitted email exists, to prevent account enumeration via the reset endpoint.',
      'Generate the reset token with a cryptographically secure random generator and store only its hash, never the raw value.',
      'Enforce a short expiry (≤ 60 minutes) and make the token strictly single-use — invalidate it the moment it\'s consumed.',
      'Force-invalidate all other active sessions/refresh tokens for the account once the password is changed.'
    ]
  },
  mfa_totp_stepup: {
    name: 'Multi-Factor Step-Up Authentication (TOTP)',
    shortLabel: 'MFA Step-Up (TOTP)',
    level: 'intermediate',
    subtitle: 'Require a second, time-based one-time-password factor before allowing a high-risk action, even mid-session.',
    problemStatement: 'A password alone is a single point of failure — phished, reused, or leaked in a breach, it grants full account access. Sensitive actions (changing a password, wiring money, viewing PII) need proof of a second, independent factor, without forcing a full re-login for every routine request.',
    architectureOverview: 'During enrollment, the server generates a random shared secret, displays it as a QR code, and the user\'s authenticator app (Google/Microsoft Authenticator) derives a rolling 6-digit code every 30 seconds from that secret plus the current time (RFC 6238). At login, or at the moment a high-risk action is attempted, the server prompts for the current TOTP code and validates it (allowing a small clock-skew window) against the same shared secret.',
    tradeoffs: [
      { title: 'Step-Up at Point of Risk', desc: 'Minimizes user friction — most of the session stays low-friction — but requires the app to explicitly classify which actions are "high risk" enough to trigger it.' },
      { title: 'Require MFA at Every Login', desc: 'Simpler to reason about and implement, but adds friction to every single session, including low-risk ones like reading a public dashboard.' }
    ],
    sequenceFlow: [
      'User enables MFA; server generates a shared secret and renders it as a scannable QR code.',
      'User scans the code with an authenticator app, which begins generating rolling 6-digit codes from the shared secret.',
      'User later attempts a high-risk action (e.g. changing their email); the server intercepts it and challenges for a TOTP code.',
      'User enters the current 6-digit code from their app; the server independently computes the expected code from the stored secret and current time.',
      'On match (within a ±1 time-step skew window), the server marks the session as "step-up verified" for a short window and allows the action.'
    ],
    checklist: [
      'Store the TOTP shared secret encrypted at rest, never in plaintext.',
      'Allow a small clock-skew tolerance (typically ±1 time step) but reject codes outside that window to block replay.',
      'Provide printable backup/recovery codes at enrollment time in case the user loses their authenticator device.',
      'Rate-limit TOTP verification attempts to prevent brute-forcing the 6-digit code space.'
    ]
  },
  sso_reverse_proxy: {
    name: 'SSO via Reverse-Proxy Header Injection',
    shortLabel: 'Reverse-Proxy SSO',
    level: 'intermediate',
    subtitle: 'Centralize authentication at the network edge; backend apps trust a signed identity header instead of implementing auth themselves.',
    problemStatement: 'An organization has several internal legacy or lightweight applications, none of which can practically implement SAML/OIDC themselves, but all need a consistent single sign-on experience and centrally enforced authentication.',
    architectureOverview: 'A reverse proxy (or API gateway) sits in front of every internal application and terminates the actual SSO handshake (SAML/OIDC) itself. Once authenticated at the proxy, it injects a trusted, signed header (e.g. `X-Auth-Request-User`, `X-Auth-Request-Email`) into every request forwarded to the backend app. The backend application trusts that header completely instead of validating tokens itself — which only works because the network is configured so backend apps are unreachable except through the proxy.',
    tradeoffs: [
      { title: 'Header-Trust Proxy (e.g. oauth2-proxy)', desc: 'Adds SSO to legacy apps with zero code changes, but the entire model collapses if an attacker can reach the backend app directly and spoof the trusted header.' },
      { title: 'Native OIDC in Each App', desc: 'Each app independently validates its own tokens, removing the single point of trust, but requires implementing and maintaining OIDC logic in every application.' }
    ],
    sequenceFlow: [
      'User requests an internal app URL; the request first hits the reverse proxy.',
      'Proxy checks for an existing valid session cookie; if absent, it redirects the user through the SAML/OIDC login flow with the central IdP.',
      'On successful authentication, the proxy establishes its own session and stores the verified identity attributes.',
      'Proxy forwards the request to the backend app, injecting `X-Auth-Request-User`/`X-Auth-Request-Email` headers.',
      'Backend app reads those headers directly to determine the current user — it never sees or validates a SAML assertion or OIDC token itself.'
    ],
    checklist: [
      'Network-isolate every backend app so it is reachable only via the proxy — never expose it directly, or the trusted header can be spoofed.',
      'Have the proxy strip any client-supplied `X-Auth-Request-*` headers on the way in, before injecting its own, so a client can\'t forge them.',
      'Terminate TLS at the proxy and re-encrypt (or use a trusted private network) for the proxy-to-backend hop.',
      'Log every identity header injection at the proxy for audit purposes, since backend apps typically won\'t log the SSO handshake themselves.'
    ]
  },
  api_key_m2m: {
    name: 'API Key Authentication for Machine-to-Machine',
    shortLabel: 'API Key (M2M)',
    level: 'intermediate',
    subtitle: 'Issue a long-lived opaque secret to a server, script, or partner integration — no human login flow involved.',
    problemStatement: 'A partner\'s backend server (or an internal cron job) needs to call an API on a recurring, unattended basis. There\'s no human present to complete an interactive OAuth redirect flow, and the "identity" being authenticated is the calling system itself, not a person.',
    architectureOverview: 'The API issues a high-entropy API key tied to a specific client/integration record, storing only a hash of it (like a password). The calling system includes the key in every request, typically as an `Authorization: Bearer <key>` or a custom `X-API-Key` header. The server hashes the incoming key and looks it up to resolve which client is calling and what scopes/rate limits apply, without any interactive login step.',
    tradeoffs: [
      { title: 'Static, Long-Lived API Key', desc: 'Trivial for partners to integrate — copy one string into a config file — but a leaked key (committed to a public repo, logged accidentally) grants access until manually revoked.' },
      { title: 'Short-Lived Token via Client Credentials Grant', desc: 'Limits the blast radius of a leak since tokens expire quickly, but requires the calling system to implement an OAuth token-fetch-and-refresh cycle instead of a single static header.' }
    ],
    sequenceFlow: [
      'Administrator generates an API key for a partner integration; the server stores only a salted hash of it and shows the raw key exactly once.',
      'Partner\'s backend stores the raw key in its own server-side secret manager (never in client-side code).',
      'Partner\'s backend includes the key on every call, e.g. `Authorization: Bearer sk_live_...`.',
      'API gateway hashes the incoming key, looks up the matching client record, and attaches its scopes/rate-limit tier to the request context.',
      'Request proceeds if the key is valid, unexpired, and unrevoked; otherwise the gateway returns `401 Unauthorized`.'
    ],
    checklist: [
      'Store only a salted hash of the key server-side — treat it exactly like a password, never log or display it again after creation.',
      'Prefix keys by environment (`sk_live_`, `sk_test_`) to prevent test keys from being accidentally used against production.',
      'Support instant revocation and key rotation without requiring the partner to change any other integration detail.',
      'Enforce per-key rate limiting and scope restrictions so one compromised key can\'t exhaust the whole API or exceed its intended permissions.'
    ]
  },
  jwt_stateless_api: {
    name: 'Stateless JWT Bearer Token API Authorization',
    shortLabel: 'Stateless JWT API',
    level: 'intermediate',
    subtitle: 'Issue a signed, self-contained token so resource servers can authorize requests without a shared session store.',
    problemStatement: 'A horizontally scaled API (many stateless server instances behind a load balancer) needs to authorize each request without every instance querying a shared session database on every single call — that database round-trip becomes a bottleneck and a single point of failure at scale.',
    architectureOverview: 'After login, the authorization server issues a JSON Web Token signed with an asymmetric key (RS256) containing the user\'s ID, roles, and an expiry claim. Any resource server holding only the public key can verify the signature and trust the claims inside without calling back to the issuer or a shared database — the token itself carries all the information needed to authorize the request.',
    tradeoffs: [
      { title: 'Short-Lived Access Token + Refresh Token', desc: 'Limits the exposure window if a token leaks (it simply expires, typically in 5–15 minutes), but requires implementing a refresh-token exchange flow and secure refresh-token storage.' },
      { title: 'Long-Lived Single JWT', desc: 'Simplest possible client implementation with no refresh logic needed, but a leaked token stays valid for its entire (long) lifetime since stateless JWTs cannot be revoked before expiry.' }
    ],
    sequenceFlow: [
      'User authenticates once against the authorization server.',
      'Authorization server issues a JWT access token signed with its private key, containing `sub`, `roles`, and a short `exp` claim.',
      'Client includes the JWT as `Authorization: Bearer <jwt>` on every API call.',
      'Any resource server instance verifies the signature locally using the issuer\'s public key (fetched once from a JWKS endpoint) — no database call needed.',
      'Resource server reads the `roles`/`scope` claims directly from the verified token to make the authorization decision.'
    ],
    checklist: [
      'Always verify the signature algorithm explicitly server-side (reject `alg: none` and algorithm-confusion attempts) rather than trusting the token\'s own `alg` header.',
      'Keep access-token lifetimes short (minutes) precisely because a stateless JWT cannot be revoked before it expires.',
      'Fetch and cache the issuer\'s public keys from its JWKS endpoint rather than hardcoding a key, so key rotation doesn\'t require a redeploy.',
      'Never place sensitive PII inside the JWT payload — it is only signed, not encrypted, and is readable by anyone holding the token.'
    ]
  },
  jit_pam: {
    name: 'Zero Standing Privilege & Just-in-Time Elevation (PAM)',
    shortLabel: 'JIT Privileged Access',
    level: 'advanced',
    subtitle: 'Nobody holds standing admin rights; privileged access is checked out, time-boxed, and auto-revoked.',
    problemStatement: 'Administrators holding permanent, always-on privileged credentials are one of the highest-value targets for attackers — a single compromised admin account grants unlimited, indefinite access to critical systems, and standing privilege is very difficult to audit ("who could have done this?" vs. "who did this, and when?").',
    architectureOverview: 'A Privileged Access Management (PAM) vault stores every privileged credential (root passwords, cloud admin roles, database superuser accounts) and rotates them on a schedule. Administrators hold zero standing access; instead, they submit a request describing the system and duration needed. Once approved (manually or by policy), the vault grants a time-boxed session, brokers the actual connection (often without ever revealing the raw credential to the user), records the session, and automatically revokes/rotates the credential the instant the window closes.',
    tradeoffs: [
      { title: 'Manual Approval Workflow', desc: 'Adds a strong human control point for the highest-risk systems, but introduces latency — an admin can\'t react to a 2 a.m. incident without waking up an approver.' },
      { title: 'Policy-Based Auto-Approval', desc: 'Enables instant self-service elevation for pre-approved, lower-risk scenarios, but requires very carefully scoped policies to avoid becoming standing access in disguise.' }
    ],
    sequenceFlow: [
      'Administrator requests elevated access to a production database, specifying a reason and a time window (e.g. 30 minutes).',
      'PAM system evaluates the request against policy (or routes it to an approver) and grants a time-boxed access token if approved.',
      'PAM vault brokers the actual database connection, injecting the current rotated credential without ever displaying it to the administrator.',
      'All commands/queries executed during the session are recorded for audit and later replay if needed.',
      'The instant the time window expires, the vault force-terminates the session and rotates the credential, so nothing carries over to the next elevation.'
    ],
    checklist: [
      'Default every privileged account to zero standing access — elevation must always be explicitly requested and time-boxed.',
      'Rotate the underlying credential immediately after every checked-in session, not on a fixed calendar schedule alone.',
      'Record and retain full session logs (commands, keystrokes, or screen capture) for privileged sessions to support audit and incident response.',
      'Alert on any privileged action taken outside of an active, approved elevation window as a signal of vault bypass or compromise.'
    ]
  },
  caep_continuous: {
    name: 'Continuous Access Evaluation (CAEP / Shared Signals Framework)',
    shortLabel: 'CAEP Continuous Eval',
    level: 'advanced',
    subtitle: 'Push real-time risk and session-state events between systems instead of waiting for a token to naturally expire.',
    problemStatement: 'Traditional OAuth/OIDC tokens are only re-validated when they expire, which can be minutes to hours away. If a user is fired, their device is reported stolen, or a risk engine flags anomalous behavior mid-session, every relying application should revoke access immediately — not wait out the token\'s remaining lifetime.',
    architectureOverview: 'Implements the OpenID Shared Signals Framework: a central transmitter (the IdP or a risk engine) pushes signed Security Event Tokens (SETs) over a webhook-style stream to subscribed receiver applications whenever a relevant event occurs (`session-revoked`, `credential-change`, `device-compliance-change`, `token-claims-change`). Receivers subscribe once, then react to these signals by force-terminating sessions or demanding re-authentication, independent of the token\'s own expiry.',
    tradeoffs: [
      { title: 'Push-Based SET Delivery', desc: 'Near-instant propagation of critical events (a fired employee is locked out within seconds), but requires every relying app to run a webhook receiver and stay online to consume the stream.' },
      { title: 'Short Token Lifetimes Only (No CAEP)', desc: 'Simpler — no new receiver infrastructure needed — but caps the worst-case revocation delay at the token\'s lifetime rather than achieving true real-time revocation.' }
    ],
    sequenceFlow: [
      'Relying application registers as a CAEP receiver with the identity provider\'s Shared Signals transmitter, subscribing to relevant event types.',
      'A risk engine detects an anomaly (e.g. impossible-travel login) and instructs the transmitter to emit a `session-revoked` Security Event Token.',
      'Transmitter signs the SET and pushes it to every subscribed receiver\'s registered endpoint.',
      'Receiver verifies the SET\'s signature and issuer, then maps the event to the affected local session(s).',
      'Receiver immediately terminates the affected session or forces step-up re-authentication — without waiting for the original access token to expire.'
    ],
    checklist: [
      'Always verify the SET\'s signature and issuer before acting on it — an unverified webhook payload is an open door for forged revocations.',
      'Design receivers to be idempotent, since delivery may retry; processing the same SET twice must not cause errors.',
      'Map every SET event type your risk model cares about to a concrete local action (kill session, force MFA, flag account) — a subscribed-but-unhandled event type provides no real protection.',
      'Monitor stream/webhook health itself; a silently failing receiver reverts you to token-expiry-only revocation without anyone noticing.'
    ]
  },
  spiffe_workload: {
    name: 'Non-Human Workload Identity (SPIFFE/SPIRE mTLS SVIDs)',
    shortLabel: 'SPIFFE Workload ID',
    level: 'advanced',
    subtitle: 'Give every microservice a short-lived cryptographic identity instead of a shared static API key or network-location trust.',
    problemStatement: 'In a microservice/multi-cloud environment, services traditionally trust each other based on network location (e.g. "if it\'s inside our VPC, it\'s trusted") or long-lived static API keys — both break down once workloads move across clusters/clouds and neither survives a compromised network segment.',
    architectureOverview: 'Implements the SPIFFE standard via SPIRE. Each workload is assigned a unique, structured identity URI (a SPIFFE ID, e.g. `spiffe://prod.example.com/billing-service`). A SPIRE agent running on each node attests the workload\'s identity (via Kubernetes service account, cloud instance metadata, etc.) and issues a short-lived X.509 SVID (SPIFFE Verifiable Identity Document) certificate, automatically rotated well before expiry. Services present these SVIDs to each other during mutual TLS handshakes, replacing static shared secrets entirely.',
    tradeoffs: [
      { title: 'SPIRE-Issued Short-Lived X.509 SVIDs', desc: 'Automatic rotation dramatically shrinks the blast radius of a leaked credential (minutes, not months), but requires deploying and operating SPIRE server/agent infrastructure across every node.' },
      { title: 'Static Shared API Keys Between Services', desc: 'Trivial to set up with no extra infrastructure, but a single leaked key can be replayed indefinitely from anywhere until it\'s manually rotated.' }
    ],
    sequenceFlow: [
      'A new workload (pod/VM) starts up; the local SPIRE agent attests it using its Kubernetes service account or cloud instance identity document.',
      'SPIRE server validates the attestation against its registration policy and issues a short-lived X.509 SVID scoped to that workload\'s SPIFFE ID.',
      'Workload A initiates a connection to Workload B, presenting its SVID as its mTLS client certificate.',
      'Workload B validates Workload A\'s SVID against the shared SPIRE trust bundle and checks the SPIFFE ID against its own authorization policy.',
      'SPIRE agents transparently rotate each SVID well before expiry, so the mTLS connection keeps working without manual credential management.'
    ],
    checklist: [
      'Scope each SPIFFE ID as narrowly as the workload itself (one identity per service, not one shared identity per cluster).',
      'Keep SVID lifetimes short (minutes to hours) and rely on automatic rotation rather than manual certificate renewal.',
      'Enforce authorization based on the verified SPIFFE ID, not on network location/IP range, so identity survives workload migration across clusters or clouds.',
      'Monitor and alert on SPIRE server/agent availability — if attestation fails silently, workloads may fall back to no identity at all.'
    ]
  }
}

const LEVEL_ORDER: PatternLevel[] = ['beginner', 'intermediate', 'advanced']

export default function DesignPatternLibrary() {
  const [activePattern, setActivePattern] = useState<PatternType>('b2b_sso')
  const pattern = PATTERN_DATA[activePattern]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('pattern')
      if (id && Object.keys(PATTERN_DATA).includes(id)) {
        setTimeout(() => {
          setActivePattern(id as PatternType)
        }, 0)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Page Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Design Pattern Library</h1>
            <p className="text-xs text-text-secondary">Hardened reference patterns, sequence flows, trade-offs, and implementation checklists</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Library
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Pattern Selector */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Design Pattern
            </span>

            <div className="flex flex-col gap-3">
              {LEVEL_ORDER.map((level) => {
                const keysForLevel = (Object.keys(PATTERN_DATA) as PatternType[]).filter(
                  (key) => PATTERN_DATA[key].level === level
                )
                if (keysForLevel.length === 0) return null
                return (
                  <div key={level} className="flex flex-col gap-2">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider px-1">
                      {LEVEL_LABELS[level]}
                    </span>
                    {keysForLevel.map((key) => (
                      <button
                        key={key}
                        onClick={() => setActivePattern(key)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border transition flex items-center justify-between ${activePattern === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                      >
                        <span>{PATTERN_DATA[key].shortLabel}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activePattern === key ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick info panel */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <h3 className="text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-primary" /> Hardened Standards
            </h3>
            <p className="text-[10px] text-text-secondary leading-normal">
              Every design pattern in this library complies strictly with established IETF, W3C, and OpenID Foundation standards, guaranteeing industry-grade interoperability.
            </p>
          </div>
        </div>

        {/* Right column: Content references */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Hero Card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <BookOpen className="w-24 h-24 text-accent-primary" />
            </div>

            <div>
              <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-2.5 py-1 rounded-full">
                {pattern.shortLabel} · {LEVEL_LABELS[pattern.level]}
              </span>
              <h2 className="text-xl font-black text-text-primary mt-2.5">{pattern.name}</h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-1">{pattern.subtitle}</p>
            </div>

            <div className="pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="border border-status-danger/20 bg-status-danger/5 p-3.5 rounded-lg text-text-secondary">
                <span className="font-extrabold text-status-danger block mb-0.5 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Problem Statement
                </span>
                {pattern.problemStatement}
              </div>

              <div className="border border-accent-primary/25 bg-accent-glow p-3.5 rounded-lg text-text-secondary">
                <span className="font-extrabold text-accent-primary block mb-0.5 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> Solution Architecture
                </span>
                {pattern.architectureOverview}
              </div>
            </div>
          </div>

          {/* Dynamic ASCII Diagram card */}
          {pattern.sequenceDiagram && (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md space-y-3 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5 font-mono">
                <Terminal className="w-4 h-4 text-accent-primary animate-pulse" /> {pattern.sequenceDiagramTitle ?? 'Interactive Protocol Sequence Tracing'}
              </span>
              <pre className="text-[10px] font-mono text-text-secondary bg-bg-nested p-4 rounded-xl border border-border-subtle/50 overflow-x-auto leading-relaxed select-none">
                <code>{pattern.sequenceDiagram}</code>
              </pre>
            </div>
          )}

          {/* Sequence Flow vs Trade-offs split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sequence Flow Stepper */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-400" /> Architectural Sequence Flow
              </span>
              
              <div className="space-y-3">
                {pattern.sequenceFlow.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal text-text-secondary">
                    <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade-offs Analysis */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-400" /> Architectural Trade-offs
                </span>
                
                <div className="space-y-3">
                  {pattern.tradeoffs.map((trade) => (
                    <div key={trade.title} className="p-3 bg-bg-nested/40 border border-border-subtle rounded-lg text-xs leading-normal">
                      <span className="font-bold text-accent-primary block mb-0.5">{trade.title}</span>
                      <span className="text-text-secondary">{trade.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-subtle bg-bg-nested/10 p-2 text-[10px] text-text-muted font-mono text-center">
                Review security vs performance vectors before selection.
              </div>
            </div>

          </div>

          {/* Implementation Checklist block */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-accent-primary" /> Core Implementation Checklist
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-normal">
              {pattern.checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-status-success mt-0.5 font-bold shrink-0 text-sm">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Tools & Playgrounds */}
          {pattern.relatedResources && pattern.relatedResources.length > 0 && (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent-primary" /> Related Tools & Playgrounds
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pattern.relatedResources.map((res, i) => (
                  <Link
                    key={i}
                    to={res.path}
                    className="p-4 rounded-xl bg-bg-nested/40 border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/40 transition-all text-left flex flex-col justify-between group"
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
          )}

        </div>

      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
