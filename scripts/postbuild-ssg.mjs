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
  { path: '/playground', title: 'Simulators & Playgrounds', description: 'Index of every interactive IAM simulator: OAuth, SAML, JWT, FIDO2, Zero Trust, and more.' },
  { path: '/tools', title: 'Free Client-Side IAM & Security Tools', description: '19 free, 100% browser-based identity and security utilities — JWT, SAML, X.509, bcrypt, TOTP, PKCE, and more. No signup, no uploads, nothing leaves your device.' },
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
  { path: '/playground/jwt', title: 'JWT Studio & Exploit Arena', description: 'Browser-native HS256 JWT signing, plus the none-algorithm and JWKS-spoofing exploits.' },
  { path: '/playground/oauth', title: 'OAuth 2.0 / OIDC Handshake Visualizer', description: 'Step-by-step front/back-channel OAuth 2.0 and OIDC flow animation with PKCE and raw HTTP inspection.' },
  { path: '/playground/saml', title: 'SAML 2.0 XML Workbench', description: 'SAML assertion builder and Signature Wrapping (SSW) attack simulator.' },
  { path: '/playground/fido2', title: 'FIDO2 / WebAuthn Lab', description: 'Emulated FIDO2/WebAuthn key ceremonies parsing clientDataJSON and authenticatorData.' },
  { path: '/playground/access', title: 'Access Control Lab', description: 'Dynamic ABAC vs. static RBAC access-control policy evaluation engine.' },
  { path: '/playground/ldap', title: 'LDAP Tree Simulator', description: 'Active Directory schema tree simulator with live LDAP filter search.' },
  { path: '/playground/zta', title: 'Zero Trust Planner', description: 'NIST SP 800-207 Zero Trust risk-scoring planner.' },
  { path: '/playground/ai-threat-lab', title: 'AI Threat Lab', description: 'Voice-deepfake attack simulations against legacy MFA vs. FIDO2 hardware bounds.' },
  { path: '/playground/zkp-wallet', title: 'ZKP Wallet', description: 'Zero-knowledge age proofs that verify without exposing raw birthdates.' },
  { path: '/playground/ambient-trust', title: 'Ambient Trust', description: 'Continuous ambient biometric telemetry and session trust-score decay.' },
  { path: '/playground/workload-mesh', title: 'Workload Mesh', description: 'SPIFFE/SPIRE attestation and X.509 SVID credential issuance simulator.' },
  { path: '/explore/matchmaker', title: 'Auth Matchmaker', description: 'Wizard that recommends an authentication stack with copyable boilerplate code.' },
  { path: '/assess', title: 'GRC Maturity Assessments', description: '5-pillar organizational readiness assessment with an exportable roadmap.' },
  { path: '/explore', title: 'IAM Landscape Directory', description: 'Identity product blueprints with copyable integration code.' },
  { path: '/assistant', title: 'AI IAM Architect Chat', description: 'Simulated RAG assistant producing sample IAM policies and Rego scripts.' },
  { path: '/encyclopedia', title: 'Master IAM Glossary', description: 'Searchable A-Z glossary of 35+ Identity and Access Management standards and acronyms.' },
  { path: '/wall-of-shame', title: 'Vulnerability Lab', description: 'Historic identity breaches, including Golden SAML and MFA push-bombing fatigue attacks.' },
  { path: '/cheat-sheets', title: 'Developer Playbooks', description: 'Compliance checklists for SPAs and machine-to-machine credentials.' },
  { path: '/contributors', title: 'Team & Contact', description: 'Meet the AboutIAM contributors and get in touch.' },
]

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const replaceTag = (html, regex, replacement) => html.replace(regex, () => replacement)

function renderPage(template, route) {
  const title = `${route.title} | AboutIAM`
  const description = escapeHtml(route.description)
  const canonicalUrl = `${SITE_URL}${route.path}/`

  let html = template
  html = replaceTag(html, /<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
  html = replaceTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonicalUrl}" />`)
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}" />`)
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)
  return html
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8')

for (const route of ROUTES) {
  const outDir = join(distDir, ...route.path.split('/').filter(Boolean))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), renderPage(template, route))
}

console.log(`postbuild-ssg: wrote ${ROUTES.length} pre-rendered route pages`)
