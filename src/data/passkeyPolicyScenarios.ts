export interface AuthenticatorDevice {
  id: string
  name: string
  aaguid: string
  attachment: 'platform' | 'cross-platform'
  hasResidentKey: boolean
  attestationFormat: 'none' | 'self' | 'packed'
  isHardwareBacked: boolean
  description: string
}

export const AUTHENTICATOR_DEVICES: AuthenticatorDevice[] = [
  {
    id: 'yubikey_5_fips',
    name: 'YubiKey 5 FIPS (Security Key)',
    aaguid: 'c53e054b-bd5c-48be-813c-0e2f5b0fcbc7',
    attachment: 'cross-platform',
    hasResidentKey: true,
    attestationFormat: 'packed', // hardware attestation
    isHardwareBacked: true,
    description: 'Hardware security key with FIPS 140-2 Level 3 validation. Supports hardware-backed direct packed attestation.'
  },
  {
    id: 'windows_hello_tpm',
    name: 'Windows Hello (TPM Bound)',
    aaguid: '602970a0-e221-4876-814d-176814d24100',
    attachment: 'platform',
    hasResidentKey: true,
    attestationFormat: 'self', // self-attestation
    isHardwareBacked: true,
    description: 'Platform authenticator bound to the device TPM (Trusted Platform Module). Hardware-backed but restricted to the local device.'
  },
  {
    id: 'icloud_keychain',
    name: 'Apple iCloud Keychain (Synced)',
    aaguid: '00000000-0000-0000-0000-000000000000', // Synced passkeys often use zero AAGUID
    attachment: 'platform',
    hasResidentKey: true,
    attestationFormat: 'none', // no attestation
    isHardwareBacked: false, // cloud-synced, not strictly hardware bound
    description: 'Multi-device cloud-synchronized passkey. Incredibly convenient for users, but does not provide hardware-bound non-exportability guarantees.'
  },
  {
    id: 'rogue_virtual_key',
    name: 'Rogue Emulator (Software Key)',
    aaguid: 'deadbeef-dead-beef-dead-beefdeadbeef',
    attachment: 'cross-platform',
    hasResidentKey: false,
    attestationFormat: 'none',
    isHardwareBacked: false,
    description: 'A software-emulated virtual authenticator running in a developer terminal. Exportable, malleable, and insecure for high-risk enterprise roles.'
  }
]

export interface PasskeyPolicy {
  requireResidentKey: boolean
  userVerification: 'required' | 'preferred' | 'discouraged'
  restrictAaguid: boolean
  requireHardwareAttestation: boolean
}

export interface PolicyValidationResult {
  allowed: boolean
  scoreDeduction: number
  logs: string[]
}

export function validatePasskeyRegistration(
  device: AuthenticatorDevice,
  policy: PasskeyPolicy
): PolicyValidationResult {
  const logs: string[] = []
  let allowed = true
  let scoreDeduction = 0

  logs.push(`[RP Policy Evaluation] Starting validation for device: ${device.name}`)
  logs.push(`[RP Policy Evaluation] Device parameters: AAGUID=${device.aaguid} | Attachment=${device.attachment} | Attestation=${device.attestationFormat}`)

  // 1. Resident Key check
  if (policy.requireResidentKey && !device.hasResidentKey) {
    allowed = false
    scoreDeduction += 25
    logs.push(`❌ [Policy Failure] Resident Key (Discoverable Credential) is required, but device '${device.name}' does not support it.`)
  } else if (device.hasResidentKey) {
    logs.push(`✓ [Policy Success] Resident Key requirement satisfied.`)
  }

  // 2. Hardware Attestation check
  if (policy.requireHardwareAttestation) {
    if (!device.isHardwareBacked || device.attestationFormat === 'none') {
      allowed = false
      scoreDeduction += 35
      logs.push(`❌ [Policy Failure] Hardware-backed cryptographic attestation is required. synched/software key '${device.name}' lacks valid hardware cert blocks.`)
    } else {
      logs.push(`✓ [Policy Success] Hardware-backed packed attestation certified. Valid certificate chain verified to Yubico/Microsoft trust anchors.`)
    }
  }

  // 3. AAGUID restriction list
  if (policy.restrictAaguid) {
    // Only YubiKey FIPS allowed
    if (device.id !== 'yubikey_5_fips') {
      allowed = false
      scoreDeduction += 40
      logs.push(`❌ [Policy Failure] AAGUID restriction list active. Device AAGUID '${device.aaguid}' is NOT in the allowed enterprise hardware inventory.`)
    } else {
      logs.push(`✓ [Policy Success] Device AAGUID '${device.aaguid}' matches the corporate allowed FIPS hardware keys list.`)
    }
  }

  if (allowed) {
    logs.push(`🎉 [Policy Cleared] Authenticator registration approved! Public key credential mapped in RP database.`)
  } else {
    logs.push(`❌ [Registration Refused] Transaction aborted. The security requirements established by the Relying Party were not satisfied.`)
  }

  return {
    allowed,
    scoreDeduction,
    logs
  }
}
