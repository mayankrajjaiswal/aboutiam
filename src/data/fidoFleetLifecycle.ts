/**
 * The 8-stage FIDO authenticator fleet lifecycle -- the genuinely unserved
 * gap identified in NextGenIAM.md §4.3: the portal already teaches FIDO2/
 * WebAuthn protocol mechanics well, but nothing covers running a fleet of
 * physical/platform authenticators across procurement through disposal.
 * Feeds the Phishing-Resistant Auth Center hub
 * (`/next-gen/phishing-resistant-auth`, tab `fleet-lifecycle`) and the FIDO
 * Fleet Operations Simulator playground.
 * Last reviewed: 2026-09-19.
 */
export interface FleetLifecycleKpi {
  name: string
  definition: string
}

export interface FleetLifecycleStage {
  id: string
  order: number
  title: string
  objective: string
  activities: string[]
  whatGoesWrong: string[]
  controls: string[]
  kpis: FleetLifecycleKpi[]
  /** Owning function(s) -- fleet ops is cross-functional, and naming owners is itself the insight. */
  stakeholders: string[]
}

export const FIDO_FLEET_LIFECYCLE: FleetLifecycleStage[] = [
  {
    id: 'procure',
    order: 1,
    title: 'Procure',
    objective: 'Select and purchase the right mix of authenticator form factors for the organization\'s actual population segments.',
    activities: ['Segment the population by role, device type, and assurance need', 'Select form factors per segment (see fidoFormFactors.ts)', 'Negotiate volume pricing and support SLAs with vendors'],
    whatGoesWrong: ['A single form factor is chosen for the entire organization, ignoring segment differences (e.g. shared-device shift workers forced onto individually-owned USB keys)', 'No budget line for ongoing replacement, only initial purchase'],
    controls: ['A documented segmentation model tying each population to a specific form factor', 'A replacement-rate budget baked into procurement from the start, not treated as a surprise cost later'],
    kpis: [{ name: 'Cost per enrolled user', definition: 'Total procurement + fulfillment spend divided by users successfully enrolled.' }],
    stakeholders: ['IT Procurement', 'Identity & Access Management team', 'Finance'],
  },
  {
    id: 'personalise',
    order: 2,
    title: 'Personalise',
    objective: 'Brand, configure, and prepare authenticators for the specific organization and use case before distribution.',
    activities: ['Apply organizational branding/printing where the form factor supports it', 'Pre-configure policy defaults (PIN requirements, algorithm selection)', 'Package devices for the intended distribution channel'],
    whatGoesWrong: ['Personalization becomes a bottleneck that delays rollout by weeks', 'Inconsistent configuration across a batch causes enrollment failures downstream'],
    controls: ['Automate configuration application rather than manual per-unit setup', 'Batch-verify a sample from each personalization run before shipping'],
    kpis: [{ name: 'Personalization throughput', definition: 'Units personalized and verified per day.' }],
    stakeholders: ['Vendor fulfillment partner', 'IAM team'],
  },
  {
    id: 'fulfil',
    order: 3,
    title: 'Fulfil / Distribute',
    objective: 'Get the right authenticator to the right person, verifiably, at the right time.',
    activities: ['Ship or hand-deliver devices per the distribution plan', 'Track chain of custody from personalization to the individual recipient', 'Provide a fallback path for remote or newly-hired users'],
    whatGoesWrong: ['No chain-of-custody record, so a lost-in-transit device cannot be distinguished from one that was delivered and then compromised', 'Remote employees receive devices weeks after starting, forcing password fallback in the interim'],
    controls: ['Signed receipt/acknowledgment at handoff, recorded against the recipient\'s identity record', 'A remote-fulfillment SLA aligned to onboarding timelines'],
    kpis: [{ name: 'Time-to-device', definition: 'Days from user request/onboarding to device in hand.' }, { name: 'Custody-verified rate', definition: 'Percentage of shipments with a confirmed chain-of-custody record.' }],
    stakeholders: ['Fulfillment/logistics', 'HR onboarding', 'IAM team'],
  },
  {
    id: 'enrol',
    order: 4,
    title: 'Enrol / Bind',
    objective: 'Cryptographically bind the authenticator to the specific user\'s account, with attestation checked against policy.',
    activities: ['User performs the WebAuthn registration ceremony', 'Enterprise attestation is verified against the AAGUID allow-list (see fidoFormFactors.ts)', 'A backup/recovery authenticator is registered where policy requires one'],
    whatGoesWrong: ['No backup authenticator is enrolled, so a single lost device causes a full lockout', 'Attestation checking is skipped for speed, silently admitting non-compliant hardware'],
    controls: ['Mandatory second-authenticator enrollment for any AAL3 population', 'Attestation verification enforced at registration time, not audited after the fact'],
    kpis: [{ name: 'Enrollment completion rate', definition: 'Percentage of distributed devices successfully bound to an account within a target window.' }, { name: 'Backup-authenticator coverage', definition: 'Percentage of enrolled users with a second registered authenticator.' }],
    stakeholders: ['IAM team', 'Helpdesk'],
  },
  {
    id: 'support',
    order: 5,
    title: 'Support / Break-Fix',
    objective: 'Handle lost, damaged, or malfunctioning authenticators without falling back to a phishable method.',
    activities: ['Verify the requester\'s identity through an equally strong alternate method before re-provisioning', 'Issue a temporary or replacement authenticator', 'Revoke the lost/damaged device\'s registration'],
    whatGoesWrong: ['Helpdesk falls back to a knowledge-based (phishable) identity check under pressure to resolve tickets quickly, reintroducing the exact vulnerability FIDO was deployed to close', 'The lost device is not promptly revoked, leaving a live credential unaccounted for'],
    controls: ['A defined, equally-strong identity-verification process for break-fix requests (e.g. verification via a second registered authenticator or in-person check)', 'Immediate revocation of the lost/damaged device as the first step of any replacement workflow'],
    kpis: [{ name: 'Password-reset-equivalent ticket rate', definition: 'Authenticator-related helpdesk tickets per 1,000 users per month.' }, { name: 'Time-to-revoke', definition: 'Minutes from a loss report to the device\'s registration being revoked.' }],
    stakeholders: ['Helpdesk', 'IAM team', 'Security operations'],
  },
  {
    id: 'refresh',
    order: 6,
    title: 'Rotate / Refresh',
    objective: 'Replace authenticators on a planned cadence before they fail, expire, or fall out of crypto-agility.',
    activities: ['Track hardware end-of-life and firmware update capability per fielded model', 'Plan a rolling refresh rather than a single all-at-once replacement event', 'Retire authenticator models that lose FIDO certification or fall off the enterprise attestation allow-list'],
    whatGoesWrong: ['No refresh plan exists until a model is abruptly deprecated or decertified, forcing an unplanned emergency replacement across the whole fleet', 'Refresh planning ignores the crypto-agility posture of the hardware itself (see cryptoAgilityRoadmap.ts)'],
    controls: ['A rolling refresh schedule tied to hardware lifecycle, not a reactive one', 'Crypto-agility review folded into the refresh-planning cycle'],
    kpis: [{ name: 'Fleet age distribution', definition: 'Percentage of fielded authenticators past their planned refresh date.' }],
    stakeholders: ['IAM team', 'Procurement', 'Security architecture'],
  },
  {
    id: 'revoke',
    order: 7,
    title: 'Revoke',
    objective: 'Immediately and reliably remove an authenticator\'s authority when a user leaves, a device is compromised, or policy requires it.',
    activities: ['Deregister the authenticator from the account at offboarding', 'Propagate revocation to every relying party the credential was registered with', 'Confirm no lingering session or cached trust remains valid'],
    whatGoesWrong: ['Offboarding revokes the account but not every registered authenticator individually, leaving orphaned credentials', 'Revocation is not propagated in real time, leaving a window of live access after the decision to revoke is made'],
    controls: ['Offboarding checklist that explicitly enumerates and revokes every registered authenticator, not just the account', 'Real-time revocation propagation rather than batch/overnight processing'],
    kpis: [{ name: 'Orphaned-credential count', definition: 'Registered authenticators with no active, employed owner.' }, { name: 'Revocation propagation time', definition: 'Time from revocation decision to the credential being unusable everywhere it was registered.' }],
    stakeholders: ['IAM team', 'HR offboarding', 'Security operations'],
  },
  {
    id: 'recycle',
    order: 8,
    title: 'Recycle / Dispose',
    objective: 'Retire physical authenticators safely and sustainably once revoked.',
    activities: ['Securely wipe or destroy key material per the hardware vendor\'s guidance', 'Route retired hardware through a refurbishment or e-waste recycling program where available', 'Record disposal for audit purposes'],
    whatGoesWrong: ['Retired devices are discarded without confirming key material is unrecoverable', 'No eco-design consideration is given to the disposal volume created by a large fleet refresh'],
    controls: ['A documented secure-disposal or refurbishment procedure per form factor', 'Sustainability criteria (packaging, multi-use devices, refurbishment programs) folded into procurement, so disposal volume is designed down from the start'],
    kpis: [{ name: 'Secure-disposal completion rate', definition: 'Percentage of retired devices disposed of per the documented procedure, with a record kept.' }],
    stakeholders: ['IT Asset Management', 'Sustainability/procurement', 'Security operations'],
  },
]

export function getStageById(id: string): FleetLifecycleStage | undefined {
  return FIDO_FLEET_LIFECYCLE.find((s) => s.id === id)
}
