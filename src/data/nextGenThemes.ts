import type { LucideIcon } from 'lucide-react'
import { Bot, ShieldAlert, Fingerprint, Wallet, AtomIcon } from 'lucide-react'

/**
 * The five strategic shifts reshaping enterprise identity, as taught by the
 * Next-Gen IAM pillar (`/next-gen`). Hand-curated framing of publicly-observable
 * industry direction — see NextGenIAM.md §1 and §2 for the full governance
 * rationale (themes only, no vendor-internal specifics). Each theme's
 * `relatedLabs`/`relatedTools` paths are cross-checked against `routeMeta.ts`
 * by nextGenThemes.test.ts as new next-gen routes ship.
 * Refresh cadence: quarterly, alongside the standards/compliance registries
 * it references. Last reviewed: 2026-09-19.
 */
export type NextGenThemeId =
  | 'agentic-identity'
  | 'ai-security-fabric'
  | 'phishing-resistant-auth'
  | 'digital-wallets'
  | 'crypto-agility'

export interface NextGenMaturityBand {
  level: 1 | 2 | 3 | 4
  label: string
  description: string
  nextStep: string
}

export interface NextGenTheme {
  id: NextGenThemeId
  title: string
  /** One-line thesis for the theme. */
  thesis: string
  /** The forcing function — regulation, threat, or technology shift driving urgency. */
  whyNow: string
  analogy: string
  expert: string
  route: string
  icon: LucideIcon
  /** Existing + new lab routes that teach this theme. Paths only — resolved against ROUTE_META by tests. */
  relatedLabs: string[]
  /** Existing + new tool routes that teach this theme. */
  relatedTools: string[]
  maturityBands: NextGenMaturityBand[]
}

export const NEXT_GEN_THEMES: NextGenTheme[] = [
  {
    id: 'agentic-identity',
    title: 'Agentic Identity & Governance',
    thesis: 'AI agents are becoming first-class principals. An agent needs a job description, an owner, declared intent, and hard limits — the same identity lifecycle humans already have.',
    whyNow: 'Autonomous and multi-agent systems are moving from demos into production workflows faster than governance models for them have matured, leaving most organizations with agents that hold standing authority nobody explicitly granted.',
    analogy: 'Hiring a new employee without a job description, a manager, a badge that expires, or a list of what they are and are not allowed to touch — then giving them a master key "just in case."',
    expert: 'Extends classical IAM subject modeling (accounts, service principals, workload identities) to a new principal type that is autonomous, can spawn sub-agents, and accumulates authority across multi-hop delegation chains — requiring registry, ownership, declared-intent, and lifecycle disciplines that most IAM programs have not yet built.',
    route: '/next-gen/agentic-identity',
    icon: Bot,
    relatedLabs: [
      '/playground/agent-identity',
      '/playground/autonomous-agent',
      '/playground/token-exchange',
      '/playground/mcp-server',
      '/playground/nhi-sprawl',
      '/playground/ai-swarm',
      '/playground/workload-identity',
    ],
    relatedTools: ['/tools/eu-ai-act-assessor'],
    maturityBands: [
      { level: 1, label: 'Unmanaged', description: 'Agents run with ambient, standing credentials; no registry exists.', nextStep: 'Inventory every agent and the scopes/tools it can currently reach.' },
      { level: 2, label: 'Inventoried', description: 'Agents are catalogued, but ownership and declared intent are inconsistent.', nextStep: 'Assign an accountable owner and a written purpose statement to every registered agent.' },
      { level: 3, label: 'Governed', description: 'Every agent has an identity record: owner, declared intent, scoped authority, and an expiry.', nextStep: 'Add delegation-chain controls so authority narrows (never widens) across sub-agent hops.' },
      { level: 4, label: 'Adaptive', description: 'Agent authority is continuously right-sized against observed behavior, with automated revocation on drift.', nextStep: 'Feed drift signals from the AI Security Fabric back into registry-level policy automatically.' },
    ],
  },
  {
    id: 'ai-security-fabric',
    title: 'AI Security Fabric',
    thesis: 'Issuing an agent an identity is not enough. You need a runtime control plane that observes what the agent actually does, detects task drift and prompt manipulation, blocks sensitive egress, and can step in.',
    whyNow: 'Design-time authorization cannot catch a legitimate agent whose task has been hijacked mid-session — that requires continuous, runtime observation and enforcement, the same lesson network security learned when static ACLs proved insufficient against active intrusion.',
    analogy: 'A building badge (identity) gets you through the door, but a security team watching the cameras (the fabric) is what notices you have wandered into the server room you were never meant to enter.',
    expert: 'A runtime control plane operating a discover → decide → enforce → observe loop over agentic workloads: discovery of unregistered agents/tools, semantic guardrails evaluating intent and meaning (not just structured attributes), an AI firewall enforcing egress and tool-call policy, and behavioral observability comparing declared intent against observed action to detect drift.',
    route: '/next-gen/ai-security-fabric',
    icon: ShieldAlert,
    relatedLabs: ['/playground/ai-threat-lab', '/playground/rag-authorization', '/playground/mcp-server', '/playground/ai-swarm'],
    relatedTools: ['/tools/identity-sbom-analyzer', '/tools/eu-ai-act-assessor'],
    maturityBands: [
      { level: 1, label: 'Blind', description: 'No visibility into what deployed agents actually do at runtime.', nextStep: 'Stand up discovery: inventory every agent, model endpoint, and MCP tool exposure.' },
      { level: 2, label: 'Observing', description: 'Telemetry exists, but nothing evaluates it against declared intent.', nextStep: 'Define declared-intent baselines per agent and start comparing observed action against them.' },
      { level: 3, label: 'Enforcing', description: 'Semantic guardrails and egress policy actively block out-of-bounds requests.', nextStep: 'Tune the guardrail thresholds against real traffic to manage the false-positive/false-negative trade-off.' },
      { level: 4, label: 'Intervening', description: 'An intervention ladder (log → warn → approve → throttle → block → revoke) fires automatically on drift.', nextStep: 'Propagate revocation events (CAEP/SSF-style) to every downstream session within a bounded latency.' },
    ],
  },
  {
    id: 'phishing-resistant-auth',
    title: 'Phishing-Resistant Auth & FIDO Device Fleets',
    thesis: 'FIDO is the settled answer to phishing. The unsolved problem is operating it at fleet scale: form-factor choice, personalization, distribution, lifecycle, and helpdesk economics.',
    whyNow: 'NIST SP 800-63-4 (final, July 2025) now expects phishing-resistant methods at AAL2 and requires them at AAL3, while passwords are explicitly no longer considered phishing-resistant — pushing enterprises from "should we deploy FIDO" to "how do we run tens of thousands of authenticators."',
    analogy: 'Everyone agrees hard hats prevent injuries on a job site; the actual challenge is procuring the right size for every worker, replacing lost ones by Monday morning, and retiring the ones that no longer meet code.',
    expert: 'WebAuthn/FIDO2 solves the cryptographic phishing-resistance problem (origin binding, no shared secret); what remains unsolved operationally is fleet lifecycle management — procurement, personalization, fulfillment, enrollment, break-fix, attestation-based enterprise policy, crypto-agility of the authenticator hardware itself, and the total-cost-of-ownership case against password-driven helpdesk load.',
    route: '/next-gen/phishing-resistant-auth',
    icon: Fingerprint,
    relatedLabs: [
      '/playground/fido2',
      '/playground/fido2-conditional-ui',
      '/playground/passkey-internals',
      '/playground/passkey-policy',
      '/playground/passkey-rollout-strategist',
    ],
    relatedTools: ['/tools/webauthn-decoder'],
    maturityBands: [
      { level: 1, label: 'Password-first', description: 'Passwords remain the default; MFA is bolted on inconsistently.', nextStep: 'Pilot platform passkeys for one low-risk population to build enrollment muscle.' },
      { level: 2, label: 'Piloted', description: 'FIDO authentication works for a pilot group, but no fleet-operations model exists.', nextStep: 'Segment your population by device/role and match form factors before scaling.' },
      { level: 3, label: 'Fleet-managed', description: 'A defined lifecycle covers procurement through revocation and recycling across segments.', nextStep: 'Add enterprise attestation/AAGUID policy so only approved authenticator models are accepted.' },
      { level: 4, label: 'Optimized', description: 'Helpdesk cost, coverage of privileged accounts, and device crypto-agility are all actively measured and improved.', nextStep: 'Track the authenticator hardware\'s own crypto-agility posture against PQC migration timelines.' },
    ],
  },
  {
    id: 'digital-wallets',
    title: 'Digital Wallets & Verifiable Credentials',
    thesis: 'Wallet-based identity is proven at national scale and becoming a legal obligation for relying parties in the EU. The full lifecycle matters: verification, issuance, and the under-served organizational (business) wallet.',
    whyNow: 'Regulation (EU) 2024/1183 (eIDAS 2.0) requires every member state to offer a compliant EUDI Wallet by December 2026, with a relying-party acceptance obligation following for regulated private-sector services — turning wallet support from an option into a compliance deadline.',
    analogy: 'A physical passport already lets one document prove many different facts (identity, age, visa status) to many different parties without each one calling the passport office — a digital wallet does the same for any organization willing to become an issuer, holder, or verifier.',
    expert: 'The credential lifecycle spans three distinct roles — issuer (issues credentials via OpenID4VCI), holder (stores and presents via a wallet; increasingly an organizational holder, not just a person), and verifier/relying party (validates via OpenID4VP/mdoc presentation) — each with its own trust, key-management, and revocation obligations under the emerging eIDAS 2.0 / EUDI Wallet Architecture and Reference Framework.',
    route: '/next-gen/digital-wallets',
    icon: Wallet,
    relatedLabs: [
      '/playground/openid4vc-wallet',
      '/playground/vc-did',
      '/playground/federated-vp',
      '/playground/mdl-proximity',
      '/playground/trust-registry',
      '/playground/zkp-wallet',
    ],
    relatedTools: ['/tools/sd-jwt-decoder', '/tools/sd-jwt-wallet-sdk', '/tools/did-key-generator', '/tools/did-document-validator'],
    maturityBands: [
      { level: 1, label: 'Unaware', description: 'No wallet-acceptance plan exists despite an approaching relying-party obligation.', nextStep: 'Identify whether your sector falls under the eIDAS 2.0 relying-party acceptance obligation and by when.' },
      { level: 2, label: 'Verifier-ready', description: 'The organization can verify a presented credential, but issues none of its own.', nextStep: 'Scope whether your organization also needs to become an issuer or an organizational holder.' },
      { level: 3, label: 'Full lifecycle', description: 'Issuance, holding (including a business wallet), and verification are all operational.', nextStep: 'Formalize revocation (status-list) handling and custody/delegation controls for the organizational wallet.' },
      { level: 4, label: 'Interoperable', description: 'The organization operates across multiple wallet programmes and trust models seamlessly.', nextStep: 'Track programme-by-programme standards drift (OpenID4VP versions, mdoc profiles) as an ongoing discipline.' },
    ],
  },
  {
    id: 'crypto-agility',
    title: 'Crypto Agility, PQC & Root of Trust',
    thesis: 'Every theme above rests on cryptography with a finite shelf life. Post-quantum migration and hardware-anchored trust are the cross-cutting substrate binding agentic identity, the AI fabric, FIDO fleets, and wallets together.',
    whyNow: 'NIST finalized FIPS 203/204/205 in August 2024 with federal deprecation targets of 2030–2031 for classical key-establishment and signatures, and "harvest-now-decrypt-later" means data encrypted today is already exposed to a future quantum adversary.',
    analogy: 'Changing every lock in a large building is only fast if you already know exactly which doors have which locks, which locks depend on which master key, and in what order they can safely be swapped — crypto agility is having that map before you need it.',
    expert: 'A discipline of inventory → prioritize-by-exposure → migrate → verify, applied to every cryptographic dependency in an identity estate (token signing, TLS, PKI/CA hierarchies, authenticator attestation keys, credential signatures), anchored by a hardware root of trust (HSM-backed, FIPS 140-3 validated) that classical and post-quantum algorithms alike ultimately depend on.',
    route: '/next-gen/crypto-agility',
    icon: AtomIcon,
    relatedLabs: ['/playground/pqc-handshake', '/playground/cert-chain', '/playground/mpc-threshold'],
    relatedTools: ['/tools/pqc-readiness-auditor', '/tools/pki-ca-workbench'],
    maturityBands: [
      { level: 1, label: 'Unmapped', description: 'No inventory of which cryptographic algorithms protect which identity components.', nextStep: 'Build a first-pass inventory: token signing, TLS, CA hierarchy, authenticator and credential signature algorithms.' },
      { level: 2, label: 'Assessed', description: 'The inventory exists and each component has an estimated harvest-now-decrypt-later exposure.', nextStep: 'Sequence a dependency-ordered migration plan — the CA and root of trust must move before what it signs.' },
      { level: 3, label: 'Migrating', description: 'PQC or hybrid algorithms are rolling out to prioritized components on a defined timeline.', nextStep: 'Verify each migrated component against target compliance dates (e.g. CNSA 2.0, federal deprecation targets).' },
      { level: 4, label: 'Agile', description: 'The organization can swap a cryptographic algorithm across its identity estate without re-architecting.', nextStep: 'Extend agility practices to authenticator hardware and wallet credential signature refresh cycles.' },
    ],
  },
]

export function getThemeById(id: NextGenThemeId): NextGenTheme | undefined {
  return NEXT_GEN_THEMES.find((t) => t.id === id)
}
