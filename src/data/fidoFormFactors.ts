/**
 * FIDO2/WebAuthn authenticator form factors, compared as a fleet-procurement
 * decision rather than a protocol catalogue -- the genuinely unserved gap
 * identified in NextGenIAM.md §4.3 (the portal already teaches the FIDO2
 * protocol well; this registry teaches choosing and operating hardware at
 * scale). Feeds the Phishing-Resistant Auth Center hub
 * (`/next-gen/phishing-resistant-auth`, tab `form-factors`) and the FIDO
 * Fleet Operations Simulator playground.
 * AAL ceilings per NIST SP 800-63-4 (final, published 2025-07-31):
 * https://csrc.nist.gov/pubs/sp/800/63/4/final -- AAL3 requires a
 * non-exportable private key and phishing resistance; AAL2 expects
 * phishing-resistant methods where practical (verified 2026-09-19).
 * Attestation/AAGUID behavior per FIDO Alliance and vendor AAGUID
 * documentation (verified 2026-09-19) -- see NextGenIAM.md §15.
 * Refresh cadence: semi-annually as new form factors reach market.
 * Last reviewed: 2026-09-19.
 */
export type FormFactorCategory = 'Platform' | 'Roaming Hardware' | 'Smart Card' | 'Wearable' | 'Mobile' | 'Hybrid'
export type AalCeiling = 'AAL2' | 'AAL3'
export type AttestationSupport = 'none' | 'basic' | 'enterprise'
export type CostBand = 'low' | 'medium' | 'high'

export interface FidoFormFactor {
  id: string
  name: string
  category: FormFactorCategory
  description: string
  analogy: string
  expert: string
  aalCeiling: AalCeiling
  attestationSupport: AttestationSupport
  syncable: boolean
  sharedDeviceFriendly: boolean
  cryptoAgility: string
  sustainability: string
  costBand: CostBand
  bestFitPopulations: string[]
  failureModes: string[]
  standardRefs: string[]
  sourceLink: string
  verifiedDate: string
}

export const FIDO_FORM_FACTORS: FidoFormFactor[] = [
  {
    id: 'platform-passkey-device-bound',
    name: 'Platform Passkey (Device-Bound)',
    category: 'Platform',
    description: 'A passkey generated and held in a device\'s secure enclave/TPM, never leaving that specific device.',
    analogy: 'A house key that only ever works in one specific lock -- you can\'t lend it out, but you also can\'t lose it separately from the house.',
    expert: 'Private key material is generated in and never leaves the platform authenticator\'s secure hardware (TPM/Secure Enclave); resident-key, user-verifying, and capable of AAL3 with enterprise attestation.',
    aalCeiling: 'AAL3',
    attestationSupport: 'enterprise',
    syncable: false,
    sharedDeviceFriendly: false,
    cryptoAgility: 'Tied to the OS/platform authenticator\'s algorithm support and update cadence -- refresh timeline follows the device\'s own hardware/OS lifecycle.',
    sustainability: 'No additional hardware to manufacture, ship, or dispose of -- uses hardware already deployed for other purposes.',
    costBand: 'low',
    bestFitPopulations: ['Workforce with company-issued laptops/phones', 'Low-friction single-device users'],
    failureModes: ['No roaming support -- unusable if the bound device is lost, damaged, or unavailable', 'Poor fit for shared or kiosk-style devices'],
    standardRefs: ['webauthn', 'fido-certification'],
    sourceLink: 'https://www.w3.org/TR/webauthn-3/',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'synced-passkey',
    name: 'Synced Passkey',
    category: 'Platform',
    description: 'A passkey synchronized across a user\'s devices via a platform or password-manager sync fabric (e.g. cloud keychain sync).',
    analogy: 'A key that automatically duplicates itself into every one of your pockets, so you\'re never locked out just because you left one coat at home.',
    expert: 'Private key material is wrapped and synchronized through an end-to-end encrypted sync fabric operated by the platform vendor -- convenient for account recovery, but the enterprise attestation guarantee weakens because the "device" boundary the RP is verifying is really a sync-fabric trust boundary.',
    aalCeiling: 'AAL2',
    attestationSupport: 'basic',
    syncable: true,
    sharedDeviceFriendly: false,
    cryptoAgility: 'Depends on the sync-fabric operator\'s own algorithm roadmap, which the relying party does not control directly.',
    sustainability: 'No additional hardware required.',
    costBand: 'low',
    bestFitPopulations: ['Consumer-scale deployments', 'Recovery-friendly workforce populations with lower assurance needs'],
    failureModes: ['Enterprise cannot fully attest an individual physical device', 'Sync-fabric compromise has a wider blast radius than a single device-bound key'],
    standardRefs: ['webauthn'],
    sourceLink: 'https://www.w3.org/TR/webauthn-3/',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'usb-nfc-security-key',
    name: 'USB / NFC Security Key',
    category: 'Roaming Hardware',
    description: 'A dedicated, portable hardware authenticator (e.g. a USB-A/USB-C/NFC key) that roams between multiple devices.',
    analogy: 'A physical car key you carry and can use in any car you\'re authorized to drive, rather than a key welded into one specific vehicle.',
    expert: 'A CTAP2-compliant roaming authenticator with non-exportable key storage, full enterprise attestation support, and the highest AAL3 assurance ceiling of any commonly deployed form factor -- the reference choice for privileged and high-assurance roles.',
    aalCeiling: 'AAL3',
    attestationSupport: 'enterprise',
    syncable: false,
    sharedDeviceFriendly: true,
    cryptoAgility: 'Firmware-updatable on some models; otherwise refresh requires physical hardware replacement, making the procurement cycle the crypto-agility constraint.',
    sustainability: 'Physical device manufacture, packaging, and shipping per unit; replacement on loss adds to lifecycle footprint unless a take-back/refurbishment program exists.',
    costBand: 'medium',
    bestFitPopulations: ['Privileged/admin accounts', 'Shared or kiosk workstations', 'Regulated high-assurance roles'],
    failureModes: ['Physical loss requires a replacement and re-enrollment workflow', 'Logistics overhead for a distributed or remote workforce'],
    standardRefs: ['webauthn', 'fido-certification'],
    sourceLink: 'https://fidoalliance.org/specifications/',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'smart-card-piv',
    name: 'Smart Card / PIV',
    category: 'Smart Card',
    description: 'A credential-carrying smart card, often converging physical building access with logical/computer authentication (common in government PIV/CAC deployments).',
    analogy: 'A single badge that both opens the office door and unlocks your computer, instead of carrying two separate credentials.',
    expert: 'Certificate-based authentication on a smart card, frequently bridging PKI-based logical access with physical access control -- strong assurance, but requires middleware and a reader estate that roaming FIDO keys do not.',
    aalCeiling: 'AAL3',
    attestationSupport: 'enterprise',
    syncable: false,
    sharedDeviceFriendly: true,
    cryptoAgility: 'Card and reader firmware/middleware must both support a new algorithm -- typically the slowest-moving form factor to migrate because of this coupling.',
    sustainability: 'Card manufacture and periodic reissuance (expiry-driven) contribute a steady replacement cadence.',
    costBand: 'high',
    bestFitPopulations: ['Regulated government/defense environments', 'Sites already converging physical and logical access'],
    failureModes: ['Middleware/reader-driver fragility across operating systems', 'Reader hardware estate is itself a fleet-management burden'],
    standardRefs: ['x509-pki', 'fido-certification'],
    sourceLink: 'https://fidoalliance.org/specifications/',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'wearable-badge-authenticator',
    name: 'Wearable / Badge Authenticator',
    category: 'Wearable',
    description: 'A FIDO authenticator embedded in a wearable form factor (ring, wristband, or badge) designed for hands-busy or shared-device environments.',
    analogy: 'A hospital badge you tap against a shared terminal between patients, without needing to plug anything in or type anything.',
    expert: 'Typically NFC-based tap authentication optimized for shift-work and shared-device populations where a pocketed USB key or a personal phone is impractical mid-task.',
    aalCeiling: 'AAL2',
    attestationSupport: 'basic',
    syncable: false,
    sharedDeviceFriendly: true,
    cryptoAgility: 'Constrained by the wearable\'s limited compute/battery envelope -- algorithm refresh generally requires hardware replacement.',
    sustainability: 'Small form factor reduces material per unit, but battery/charging infrastructure adds its own lifecycle and disposal considerations.',
    costBand: 'medium',
    bestFitPopulations: ['Clinical and industrial shift workers', 'Shared-terminal environments'],
    failureModes: ['Ergonomic wear/damage over shift-length use', 'Charging logistics for battery-powered variants'],
    standardRefs: ['fido-certification'],
    sourceLink: 'https://fidoalliance.org/specifications/',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'phone-as-authenticator-hybrid',
    name: 'Phone-as-Authenticator (CTAP Hybrid)',
    category: 'Hybrid',
    description: 'A smartphone acts as a roaming authenticator for a separate device via the CTAP hybrid transport (typically Bluetooth-proximity plus QR-code pairing).',
    analogy: 'Using your phone as a remote control to unlock your laptop, the way a car key fob unlocks a car without touching it.',
    expert: 'Uses the CTAP2 hybrid transport to let a phone\'s platform authenticator serve a separate client device, avoiding the need to issue dedicated hardware -- attractive for BYOD and contractor populations, at the cost of depending on Bluetooth proximity and phone availability.',
    aalCeiling: 'AAL2',
    attestationSupport: 'basic',
    syncable: true,
    sharedDeviceFriendly: false,
    cryptoAgility: 'Follows the phone platform\'s own OS/algorithm update cadence.',
    sustainability: 'No dedicated hardware required -- reuses a device the user already owns.',
    costBand: 'low',
    bestFitPopulations: ['BYOD workforce', 'Contractors and temporary access populations'],
    failureModes: ['Bluetooth pairing reliability issues', 'Unusable if the user\'s phone is dead, lost, or absent'],
    standardRefs: ['webauthn', 'fido-certification'],
    sourceLink: 'https://fidoalliance.org/specifications/',
    verifiedDate: '2026-09-19',
  },
]

export function getFormFactorsByCategory(category: FormFactorCategory): FidoFormFactor[] {
  return FIDO_FORM_FACTORS.filter((f) => f.category === category)
}

export function getFormFactorById(id: string): FidoFormFactor | undefined {
  return FIDO_FORM_FACTORS.find((f) => f.id === id)
}
