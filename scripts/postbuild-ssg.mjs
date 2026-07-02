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
