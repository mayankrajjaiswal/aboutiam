// Kept in sync with scripts/postbuild-ssg.mjs (that script can't cheaply import
// TypeScript at build time, so it keeps its own plain-JS copy of this table).
export interface RouteMeta {
  path: string
  title: string
  description: string
}

export const ROUTE_META: RouteMeta[] = [
  { path: '/', title: 'Overview Dashboard', description: 'Progress tracker, track graduations, and identity-history trivia for the AboutIAM interactive identity workspace.' },
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

const DEFAULT_META: RouteMeta = {
  path: '/',
  title: 'AboutIAM Secure Workspace',
  description: 'Open-source, 100% client-side academy and simulation workbench for Identity and Access Management.',
}

export function getRouteMeta(pathname: string): RouteMeta {
  const exact = ROUTE_META.find((r) => r.path === pathname)
  if (exact) return exact
  const prefix = ROUTE_META.find((r) => r.path !== '/' && pathname.startsWith(r.path))
  return prefix ?? DEFAULT_META
}
