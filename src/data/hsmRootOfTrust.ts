import type { NextGenThemeId } from './nextGenThemes'

/**
 * Hardware root-of-trust concepts -- what a Hardware Security Module (HSM)
 * guarantees that software key storage cannot, and why every theme in the
 * Next-Gen IAM pillar ultimately depends on one. Feeds the Crypto Agility
 * Center hub (`/next-gen/crypto-agility`, tab `root-of-trust`).
 * FIPS 140-3 is the current NIST cryptographic module validation programme
 * (superseding FIPS 140-2); each concept below references the specific
 * public standard or programme it draws on. Last reviewed: 2026-09-19.
 */
export type RootOfTrustCategory = 'Key Custody' | 'Validation & Assurance' | 'Operations' | 'Identity Dependency'

export interface RootOfTrustConcept {
  id: string
  title: string
  category: RootOfTrustCategory
  analogy: string
  expert: string
  /** Which next-gen themes ultimately depend on this concept. */
  dependentThemes: NextGenThemeId[]
  standardRefs: string[]
  sourceLink: string
  verifiedDate: string
}

export const HSM_ROOT_OF_TRUST_CONCEPTS: RootOfTrustConcept[] = [
  {
    id: 'non-extractability',
    title: 'Non-Extractable Private Keys',
    category: 'Key Custody',
    analogy: 'A safe that can perform a signature for you but will never hand you the combination -- you get the output, never the secret itself.',
    expert: 'An HSM generates and stores private key material inside tamper-resistant hardware and performs cryptographic operations (signing, decryption) internally, so the key itself is never exposed in plaintext outside the module boundary -- fundamentally different from a software keystore, where the key exists in memory and is exposed to the host OS at some point.',
    dependentThemes: ['crypto-agility', 'phishing-resistant-auth', 'digital-wallets', 'agentic-identity'],
    standardRefs: ['x509-pki'],
    sourceLink: 'https://csrc.nist.gov/pubs/fips/140-3/final',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'fips-140-3-levels',
    title: 'FIPS 140-3 Validation Levels',
    category: 'Validation & Assurance',
    analogy: 'A building\'s fire-safety rating: level 1 confirms basic materials meet code, while a higher level requires demonstrated resistance to a determined attacker actually trying to break in, not just a checklist review.',
    expert: 'FIPS 140-3 (which supersedes FIPS 140-2) defines four increasing security levels for cryptographic modules, covering physical security, tamper-evidence and tamper-response, role-based authentication, and self-tests -- an HSM\'s validated level is the concrete, independently-verified assurance claim an organization can actually rely on rather than take a vendor\'s word for.',
    dependentThemes: ['crypto-agility', 'phishing-resistant-auth', 'digital-wallets'],
    standardRefs: ['x509-pki'],
    sourceLink: 'https://csrc.nist.gov/projects/cryptographic-module-validation-program',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'key-ceremony-dual-control',
    title: 'Key Ceremony & Dual Control',
    category: 'Operations',
    analogy: 'A bank vault that requires two separate keyholders to turn their keys simultaneously -- neither person alone can open it, so no single individual can compromise the root.',
    expert: 'Root key generation is performed as a formal, witnessed ceremony requiring multiple authorized participants (dual control / M-of-N quorum) acting together, with the process documented and auditable -- preventing any single insider from generating or exfiltrating the root key alone.',
    dependentThemes: ['crypto-agility'],
    standardRefs: ['x509-pki'],
    sourceLink: 'https://csrc.nist.gov/pubs/fips/140-3/final',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'tamper-detection-response',
    title: 'Tamper Detection & Response',
    category: 'Operations',
    analogy: 'A safe that automatically shreds its contents the instant someone tries to drill into it, rather than merely recording that a break-in was attempted.',
    expert: 'Higher FIPS 140-3 levels require an HSM to actively detect physical tampering (drilling, voltage manipulation, temperature attacks) and respond by zeroizing key material -- an active defense, not just a passive audit log of an attempted breach.',
    dependentThemes: ['crypto-agility', 'phishing-resistant-auth'],
    standardRefs: ['x509-pki'],
    sourceLink: 'https://csrc.nist.gov/pubs/fips/140-3/final',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'hsm-backed-ca-hierarchy',
    title: 'HSM-Backed CA Hierarchy',
    category: 'Identity Dependency',
    analogy: 'Every notary stamp in a country ultimately traces back to a single, physically-secured master seal -- if that seal is compromised, every stamp it ever authorized is suspect.',
    expert: 'A PKI\'s root and intermediate Certificate Authority private keys are generated and held inside HSMs precisely because everything the CA signs -- every certificate, every credential, every token-signing key it ultimately underwrites -- inherits its trustworthiness from that one root key\'s protection.',
    dependentThemes: ['crypto-agility', 'agentic-identity', 'phishing-resistant-auth', 'digital-wallets'],
    standardRefs: ['x509-pki'],
    sourceLink: 'https://csrc.nist.gov/pubs/fips/140-3/final',
    verifiedDate: '2026-09-19',
  },
  {
    id: 'key-lifecycle-rotation',
    title: 'Key Lifecycle & Rotation',
    category: 'Operations',
    analogy: 'Changing the locks on a schedule even when nothing has gone wrong, so a key that was quietly copied years ago eventually stops working anyway.',
    expert: 'Root and intermediate keys follow a defined generation-to-retirement lifecycle with planned rotation, distinct from and slower-moving than the token/session key rotation happening constantly above it -- and it is precisely this slow-moving root layer that a crypto-agility migration (see cryptoAgilityRoadmap.ts) must plan around first.',
    dependentThemes: ['crypto-agility'],
    standardRefs: ['x509-pki'],
    sourceLink: 'https://csrc.nist.gov/pubs/fips/140-3/final',
    verifiedDate: '2026-09-19',
  },
]

export function getConceptsByCategory(category: RootOfTrustCategory): RootOfTrustConcept[] {
  return HSM_ROOT_OF_TRUST_CONCEPTS.filter((c) => c.category === category)
}

export function getConceptById(id: string): RootOfTrustConcept | undefined {
  return HSM_ROOT_OF_TRUST_CONCEPTS.find((c) => c.id === id)
}
