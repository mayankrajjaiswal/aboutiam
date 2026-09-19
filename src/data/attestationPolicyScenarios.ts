/**
 * Simulated FIDO2/WebAuthn registration attempts for the AAGUID & Attestation
 * Policy Lab (`/playground/attestation-policy`) -- each attempt carries a
 * mock AAGUID, vendor/model label, attestation conveyance type, and
 * certification level, evaluated against a learner-authored policy.
 * AAGUIDs here are fictional placeholders in valid UUID form, not real
 * vendor AAGUIDs -- this lab teaches the allow-listing mechanism, not a
 * lookup against the real FIDO Metadata Service. Last reviewed: 2026-09-19.
 */
export type AttestationConveyance = 'none' | 'indirect' | 'direct' | 'enterprise'
export type CertificationLevel = 'L1' | 'L1plus' | 'L2' | 'L3' | 'uncertified'

export interface RegistrationAttempt {
  id: string
  aaguid: string
  vendorModel: string
  attestationConveyance: AttestationConveyance
  certificationLevel: CertificationLevel
  residentKey: boolean
  userVerified: boolean
  /** Whether a real enterprise would want to accept this attempt -- the ground truth for scoring. */
  shouldAccept: boolean
  /** Why this attempt should or shouldn't be accepted -- shown after evaluation. */
  explanation: string
}

export const REGISTRATION_ATTEMPTS: RegistrationAttempt[] = [
  {
    id: 'attempt-01',
    aaguid: '00000000-1111-2222-3333-444444444444',
    vendorModel: 'Acme SecureKey Pro (FIDO L2 certified)',
    attestationConveyance: 'direct',
    certificationLevel: 'L2',
    residentKey: true,
    userVerified: true,
    shouldAccept: true,
    explanation: 'A certified, direct-attested, resident-key, user-verified registration from an allow-listed vendor model — the ideal case.',
  },
  {
    id: 'attempt-02',
    aaguid: '00000000-5555-6666-7777-888888888888',
    vendorModel: 'Unknown Generic Authenticator',
    attestationConveyance: 'none',
    certificationLevel: 'uncertified',
    residentKey: false,
    userVerified: false,
    shouldAccept: false,
    explanation: 'No attestation, no certification, and no user verification — nothing here lets the enterprise confirm what device is actually being registered.',
  },
  {
    id: 'attempt-03',
    aaguid: '00000000-9999-aaaa-bbbb-cccccccccccc',
    vendorModel: 'Acme SecureKey Pro (FIDO L2 certified)',
    attestationConveyance: 'enterprise',
    certificationLevel: 'L2',
    residentKey: true,
    userVerified: true,
    shouldAccept: true,
    explanation: 'Enterprise attestation from a known-good, certified model — the strongest assurance level for a per-device enterprise deployment.',
  },
  {
    id: 'attempt-04',
    aaguid: '00000000-dddd-eeee-ffff-000000000001',
    vendorModel: 'Budget Authenticator X (never certified)',
    attestationConveyance: 'indirect',
    certificationLevel: 'uncertified',
    residentKey: true,
    userVerified: true,
    shouldAccept: false,
    explanation: 'Resident key and user verification are present, but the model was never FIDO certified — indirect attestation through an anonymization CA does not substitute for certification.',
  },
  {
    id: 'attempt-05',
    aaguid: '00000000-0002-0002-0002-000000000002',
    vendorModel: 'Acme SecureKey Pro (FIDO L2 certified)',
    attestationConveyance: 'direct',
    certificationLevel: 'L2',
    residentKey: false,
    userVerified: true,
    shouldAccept: true,
    explanation: 'A certified model without a resident key can still be acceptable for a policy that does not require passwordless (discoverable-credential) sign-in.',
  },
  {
    id: 'attempt-06',
    aaguid: '00000000-0003-0003-0003-000000000003',
    vendorModel: 'Legacy Authenticator (FIDO L1, superseded model)',
    attestationConveyance: 'direct',
    certificationLevel: 'L1',
    residentKey: false,
    userVerified: false,
    shouldAccept: false,
    explanation: 'Only L1 certified (the lowest level) and no user verification — acceptable for some low-assurance use cases, but not for a policy requiring AAL3-grade assurance.',
  },
  {
    id: 'attempt-07',
    aaguid: '00000000-0004-0004-0004-000000000004',
    vendorModel: 'Thales-class Hardware Key (FIDO L3 certified)',
    attestationConveyance: 'enterprise',
    certificationLevel: 'L3',
    residentKey: true,
    userVerified: true,
    shouldAccept: true,
    explanation: 'The highest FIDO certification level (L3, tamper-resistant hardware), enterprise attestation, resident key, and user verification — appropriate even for the strictest privileged-access policy.',
  },
  {
    id: 'attempt-08',
    aaguid: '00000000-0005-0005-0005-000000000005',
    vendorModel: 'Recently Recalled Model (certification revoked)',
    attestationConveyance: 'direct',
    certificationLevel: 'uncertified',
    residentKey: true,
    userVerified: true,
    shouldAccept: false,
    explanation: 'This model\'s certification was revoked after the fact — a policy allow-list that isn\'t actively maintained will keep accepting a device the FIDO Alliance no longer certifies. Stale allow-lists are a real operational failure mode.',
  },
]

export function getAttemptById(id: string): RegistrationAttempt | undefined {
  return REGISTRATION_ATTEMPTS.find((a) => a.id === id)
}
