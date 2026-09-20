/**
 * Pure logic for the Wallet Readiness Assessor (`/tools/wallet-readiness-assessor`).
 * Given an organization's sector, jurisdiction footprint, and which of the three
 * digital-wallet roles apply (verifier / issuer / holder), produces a role-specific
 * readiness checklist, an applicable standards profile, and the relevant compliance
 * deadlines pulled live from `complianceDeadlines.ts`.
 *
 * This is educational planning guidance, not legal advice -- every deadline and
 * standard reference should be re-verified against its own official source before
 * being relied on for a real compliance program.
 */
import { COMPLIANCE_DEADLINES, type ComplianceDeadline } from '../../data/complianceDeadlines'

export type WalletRole = 'verifier' | 'issuer' | 'holder'

export type WalletSector =
  | 'banking-financial-services'
  | 'healthcare'
  | 'telecommunications'
  | 'large-online-platform'
  | 'government-public-sector'
  | 'other-private-sector'

export type WalletJurisdictionFootprint =
  | 'eu-only'
  | 'us-only'
  | 'eu-and-us'
  | 'global'

export interface WalletReadinessInputs {
  sectors: WalletSector[]
  roles: WalletRole[]
  jurisdictions: WalletJurisdictionFootprint[]
}

export interface ChecklistItem {
  id: string
  role: WalletRole
  task: string
  rationale: string
}

const VERIFIER_CHECKLIST: ChecklistItem[] = [
  { id: 'v-1', role: 'verifier', task: 'Decide which wallet-presented credential formats you must accept (e.g. mdoc/mDL, SD-JWT VC, W3C Verifiable Credentials).', rationale: 'Different wallet programmes issue different credential formats; a relying party that only supports one format will silently reject holders using another.' },
  { id: 'v-2', role: 'verifier', task: 'Implement OpenID4VP (or the presentation protocol your target wallets use) as a request-and-verify flow, not just a QR display.', rationale: 'Presentation protocols define how a verifier requests, and cryptographically validates, a selective disclosure from a wallet -- this is not a generic OAuth flow.' },
  { id: 'v-3', role: 'verifier', task: 'Build or source a trust list / trust registry lookup so you only accept credentials from issuers you actually trust.', rationale: 'A wallet can present a cryptographically valid credential from an issuer you never intended to trust -- verification alone is not the same as authorization.' },
  { id: 'v-4', role: 'verifier', task: 'Confirm your legal/compliance team has reviewed which acceptance obligation deadlines apply to your sector and jurisdiction.', rationale: 'Several jurisdictions are moving from "wallets may be accepted" to "regulated relying parties must accept wallets" on a fixed timeline -- see the deadlines below.' },
  { id: 'v-5', role: 'verifier', task: 'Define a fallback path for users who do not yet have a compatible wallet.', rationale: 'Wallet rollouts are phased over years; a verifier-only flow with no fallback excludes the majority of your user base for years after go-live.' },
]

const ISSUER_CHECKLIST: ChecklistItem[] = [
  { id: 'i-1', role: 'issuer', task: 'Select and implement a credential issuance protocol (e.g. OpenID4VCI) matching the wallets your holders actually use.', rationale: 'Issuance and presentation are separate protocol surfaces -- supporting presentation does not automatically mean you can issue.' },
  { id: 'i-2', role: 'issuer', task: 'Establish a key-management and rotation process for your issuer signing keys, independent from your existing PKI if it is not credential-aware.', rationale: 'A compromised or improperly rotated issuer key can retroactively undermine every credential you have ever issued.' },
  { id: 'i-3', role: 'issuer', task: 'Register with (or otherwise become discoverable in) the trust frameworks/registries relevant to your sector and jurisdiction.', rationale: 'An issuer that is cryptographically correct but absent from a relying party\'s trust list will have every credential it issues silently rejected.' },
  { id: 'i-4', role: 'issuer', task: 'Define your credential revocation mechanism and test that relying parties actually check it.', rationale: 'A credential that cannot be revoked (or that verifiers never check for revocation) turns a one-time compromise into a permanent one.' },
  { id: 'i-5', role: 'issuer', task: 'Decide your selective-disclosure claim structure up front -- which attributes are separately disclosable versus bundled.', rationale: 'Retrofitting selective disclosure after credentials are already issued to holders is far more disruptive than designing for it from day one.' },
]

const HOLDER_CHECKLIST: ChecklistItem[] = [
  { id: 'h-1', role: 'holder', task: 'Confirm whether you are building/operating a wallet app, or simply need your workforce/customers to use a third-party wallet.', rationale: 'These are very different engineering efforts -- operating a wallet means secure key storage, biometric binding, and backup/recovery; using one means only integration.' },
  { id: 'h-2', role: 'holder', task: 'If operating a wallet, implement secure key storage backed by device hardware (secure enclave / TEE / StrongBox equivalent).', rationale: 'Wallet private keys held in ordinary app storage are a single-point compromise for every credential in that wallet.' },
  { id: 'h-3', role: 'holder', task: 'Design a device-loss and key-recovery process that does not silently re-issue trust to an attacker.', rationale: 'Recovery flows are consistently the weakest link in credential wallets -- an attacker who can trigger recovery inherits every credential the legitimate holder had.' },
  { id: 'h-4', role: 'holder', task: 'Support at least one widely-adopted presentation protocol so your holders can actually use their credentials at real relying parties.', rationale: 'A wallet holding standards-compliant credentials that no verifier can request is functionally useless to its holder.' },
]

const CHECKLISTS: Record<WalletRole, ChecklistItem[]> = {
  verifier: VERIFIER_CHECKLIST,
  issuer: ISSUER_CHECKLIST,
  holder: HOLDER_CHECKLIST,
}

const SECTOR_ACCEPTANCE_OBLIGATED: WalletSector[] = [
  'banking-financial-services',
  'healthcare',
  'telecommunications',
  'large-online-platform',
]

export interface StandardsProfileEntry {
  standardId: string
  label: string
  appliesToRoles: WalletRole[]
}

const STANDARDS_PROFILE: StandardsProfileEntry[] = [
  { standardId: 'openid4vci', label: 'OpenID for Verifiable Credential Issuance (OpenID4VCI)', appliesToRoles: ['issuer'] },
  { standardId: 'openid4vc', label: 'OpenID for Verifiable Presentations (OpenID4VP)', appliesToRoles: ['verifier'] },
  { standardId: 'vc-did', label: 'W3C Verifiable Credentials Data Model / Decentralized Identifiers', appliesToRoles: ['issuer', 'holder', 'verifier'] },
  { standardId: 'eidas2-arf', label: 'eIDAS 2.0 Architecture and Reference Framework (EU wallets specifically)', appliesToRoles: ['issuer', 'holder', 'verifier'] },
]

export interface WalletReadinessReport {
  applicableChecklist: ChecklistItem[]
  standardsProfile: StandardsProfileEntry[]
  relevantDeadlines: ComplianceDeadline[]
  acceptanceObligationLikely: boolean
  summary: string
}

export function computeWalletReadiness(inputs: WalletReadinessInputs): WalletReadinessReport {
  const applicableChecklist = inputs.roles.flatMap((role) => CHECKLISTS[role])

  const standardsProfile = STANDARDS_PROFILE.filter((entry) =>
    entry.appliesToRoles.some((role) => inputs.roles.includes(role)),
  )

  const inEuScope = inputs.jurisdictions.includes('eu-only') || inputs.jurisdictions.includes('eu-and-us') || inputs.jurisdictions.includes('global')
  const inUsScope = inputs.jurisdictions.includes('us-only') || inputs.jurisdictions.includes('eu-and-us') || inputs.jurisdictions.includes('global')

  const relevantDeadlines = COMPLIANCE_DEADLINES.filter((deadline) => {
    const isWalletRelated = deadline.relatedStandardId === 'eidas2-arf' || deadline.id.startsWith('eidas2')
    if (!isWalletRelated) return false
    if (deadline.jurisdiction === 'European Union') return inEuScope
    return inEuScope || inUsScope
  }).sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))

  const acceptanceObligationLikely =
    inputs.roles.includes('verifier') &&
    inEuScope &&
    inputs.sectors.some((sector) => SECTOR_ACCEPTANCE_OBLIGATED.includes(sector))

  const roleList = inputs.roles.length > 0 ? inputs.roles.join(', ') : 'no role selected yet'
  const summary = acceptanceObligationLikely
    ? `Based on your inputs (roles: ${roleList}), your organization is likely subject to an EU wallet-acceptance obligation on a fixed timeline -- confirm the exact deadline for your sector with your compliance team.`
    : `Based on your inputs (roles: ${roleList}), no acceptance obligation was matched -- this does not rule one out, it only reflects the sectors and jurisdictions you selected.`

  return { applicableChecklist, standardsProfile, relevantDeadlines, acceptanceObligationLikely, summary }
}
