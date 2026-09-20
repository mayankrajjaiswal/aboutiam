/**
 * Dependency-ordered crypto migration workstreams -- the central teaching
 * point being that cryptographic components cannot migrate independently:
 * a CA must move to a PQC-capable signature algorithm before anything it
 * signs can meaningfully follow. Feeds the Crypto Agility Center hub
 * (`/next-gen/crypto-agility`, tabs `migration`/`cross-cutting`) and the
 * Crypto Migration Planner playground.
 * Standards: NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA),
 * finalized 2024-08-13/14 -- https://www.nist.gov/news-events/news/2024/08/
 * nist-releases-first-3-finalized-post-quantum-encryption-standards.
 * Federal deprecation targets (2030 key establishment / 2031 digital
 * signatures) and CNSA 2.0 timelines per the Federal Register notice --
 * https://www.federalregister.gov/documents/2024/08/14/2024-17956/
 * (both verified 2026-09-19, NextGenIAM.md §15).
 * Last reviewed: 2026-09-19.
 */
export type CryptoDomain =
  | 'Token Signing'
  | 'Transport'
  | 'PKI & CA'
  | 'Authenticator Hardware'
  | 'Credential Signatures'
  | 'Directory & Legacy'
  | 'Code Signing'

export type HndlExposure = 'none' | 'low' | 'medium' | 'high'

/** Matches nextGenThemes.ts NextGenThemeId -- kept as plain strings here to avoid a
 * circular import; validated against that type in cryptoAgilityRoadmap.test.ts. */
export type AffectedTheme = 'agentic-identity' | 'ai-security-fabric' | 'phishing-resistant-auth' | 'digital-wallets' | 'crypto-agility'

export interface CryptoMigrationWorkstream {
  id: string
  title: string
  domain: CryptoDomain
  currentAlgorithms: string[]
  targetAlgorithms: string[]
  /** Ids of other workstreams that must migrate first -- the ordering constraint. */
  dependsOn: string[]
  difficulty: 'low' | 'medium' | 'high'
  hndlExposure: HndlExposure
  affectedThemes: AffectedTheme[]
  migrationSteps: string[]
  verificationApproach: string
  standardRefs: string[]
}

export const CRYPTO_MIGRATION_WORKSTREAMS: CryptoMigrationWorkstream[] = [
  {
    id: 'root-ca-hierarchy',
    title: 'Root & Intermediate CA Hierarchy',
    domain: 'PKI & CA',
    currentAlgorithms: ['RSA-2048/4096', 'ECDSA P-256/P-384'],
    targetAlgorithms: ['ML-DSA (FIPS 204)', 'Hybrid classical+PQC certificates during transition'],
    dependsOn: [],
    difficulty: 'high',
    hndlExposure: 'low',
    affectedThemes: ['crypto-agility', 'phishing-resistant-auth', 'digital-wallets', 'agentic-identity'],
    migrationSteps: ['Stand up a parallel PQC-capable root/intermediate hierarchy', 'Issue hybrid certificates supporting both classical and PQC signatures during transition', 'Migrate issuance policy to PQC-only once client/relying-party support is confirmed', 'Retire the classical-only hierarchy on a defined sunset date'],
    verificationApproach: 'Validate a full chain-of-trust build using each new intermediate against target relying-party software before wide issuance.',
    standardRefs: ['x509-pki', 'pqc-fips203-205'],
  },
  {
    id: 'token-signing-jwt',
    title: 'Token Signing (JWT/JWS)',
    domain: 'Token Signing',
    currentAlgorithms: ['RS256', 'ES256', 'HS256'],
    targetAlgorithms: ['ML-DSA-based JWS algorithm (as standardized)', 'Hybrid signature during transition'],
    dependsOn: ['root-ca-hierarchy'],
    difficulty: 'medium',
    hndlExposure: 'medium',
    affectedThemes: ['agentic-identity', 'ai-security-fabric'],
    migrationSteps: ['Confirm the signing key\'s issuing CA has already migrated (dependency)', 'Add PQC algorithm support to the token issuer alongside the existing one', 'Publish updated JWKS with both key types during transition', 'Deprecate the classical algorithm once verifiers confirm support'],
    verificationApproach: 'Dual-sign tokens during transition and verify both signature paths independently before removing the classical one.',
    standardRefs: ['jose', 'pqc-fips203-205'],
  },
  {
    id: 'transport-tls',
    title: 'Transport Layer Security (TLS)',
    domain: 'Transport',
    currentAlgorithms: ['ECDHE key exchange', 'RSA/ECDSA certificates'],
    targetAlgorithms: ['ML-KEM (FIPS 203) key exchange', 'Hybrid key exchange (classical + ML-KEM) during transition'],
    dependsOn: ['root-ca-hierarchy'],
    difficulty: 'medium',
    hndlExposure: 'high',
    affectedThemes: ['agentic-identity', 'ai-security-fabric', 'digital-wallets'],
    migrationSteps: ['Enable hybrid key-exchange support in TLS termination points', 'Verify client compatibility across the estate before making hybrid mandatory', 'Monitor for the harvest-now-decrypt-later window closing as hybrid becomes the default'],
    verificationApproach: 'Confirm negotiated cipher suites in production traffic actually use the hybrid key exchange, not just that it is enabled.',
    standardRefs: ['pqc-fips203-205'],
  },
  {
    id: 'credential-signatures-vc',
    title: 'Verifiable Credential Signatures',
    domain: 'Credential Signatures',
    currentAlgorithms: ['EdDSA (Ed25519)', 'ECDSA P-256'],
    targetAlgorithms: ['ML-DSA (FIPS 204)', 'SLH-DSA (FIPS 205) for long-lived credentials'],
    dependsOn: ['root-ca-hierarchy'],
    difficulty: 'high',
    hndlExposure: 'high',
    affectedThemes: ['digital-wallets'],
    migrationSteps: ['Assess validity windows of already-issued credentials against the migration timeline', 'Add PQC signature support to the issuer', 'Reissue or extend long-lived credentials under the new algorithm ahead of classical-algorithm deprecation'],
    verificationApproach: 'Prioritize by validity window: a credential valid for 10 years carries far higher harvest-now-decrypt-later exposure than a session token valid for minutes.',
    standardRefs: ['vc-did', 'openid4vc', 'pqc-fips203-205'],
  },
  {
    id: 'authenticator-hardware',
    title: 'FIDO Authenticator Hardware Algorithms',
    domain: 'Authenticator Hardware',
    currentAlgorithms: ['ES256 (ECDSA P-256)', 'Ed25519'],
    targetAlgorithms: ['ML-DSA-44/65/87 (as added to WebAuthn/FIDO server requirements)'],
    dependsOn: [],
    difficulty: 'high',
    hndlExposure: 'low',
    affectedThemes: ['phishing-resistant-auth', 'crypto-agility'],
    migrationSteps: ['Confirm which fielded authenticator models support firmware-level algorithm updates versus requiring hardware replacement', 'Fold PQC-capable models into the next planned fleet refresh cycle (see fidoFleetLifecycle.ts)', 'Update relying-party algorithm-acceptance policy as PQC-capable authenticators become available'],
    verificationApproach: 'Track algorithm support per AAGUID/model as part of the fleet inventory, not as a separate, disconnected exercise.',
    standardRefs: ['webauthn', 'fido-certification', 'pqc-fips203-205'],
  },
  {
    id: 'directory-legacy-kerberos',
    title: 'Directory & Legacy Protocol Cryptography (Kerberos, LDAP-over-TLS)',
    domain: 'Directory & Legacy',
    currentAlgorithms: ['AES (Kerberos encryption types)', 'RC4 (legacy, should already be retired)'],
    targetAlgorithms: ['AES remains valid post-quantum for symmetric use; focus shifts to TLS transport and any asymmetric components'],
    dependsOn: ['transport-tls'],
    difficulty: 'medium',
    hndlExposure: 'low',
    affectedThemes: ['agentic-identity'],
    migrationSteps: ['Confirm no lingering legacy symmetric algorithms remain in active use', 'Migrate LDAP-over-TLS transport per the transport workstream', 'Document that Kerberos\'s symmetric cryptography is not itself PQC-exposed, narrowing scope to what actually needs migration'],
    verificationApproach: 'Audit for legacy algorithm negotiation still being accepted, not just what is configured as preferred.',
    standardRefs: ['kerberos', 'ldapv3'],
  },
  {
    id: 'code-signing',
    title: 'Code Signing & Software Supply Chain',
    domain: 'Code Signing',
    currentAlgorithms: ['RSA-2048/4096', 'ECDSA P-256'],
    targetAlgorithms: ['ML-DSA (FIPS 204)'],
    dependsOn: ['root-ca-hierarchy'],
    difficulty: 'medium',
    hndlExposure: 'high',
    affectedThemes: ['crypto-agility'],
    migrationSteps: ['Confirm the code-signing CA has migrated (dependency)', 'Dual-sign releases during transition', 'Update verification tooling across the deployment pipeline before deprecating classical signatures'],
    verificationApproach: 'Verify a sample release under both signature types in a staging deployment pipeline before switching production defaults.',
    standardRefs: ['pqc-fips203-205'],
  },
  {
    id: 'mtls-workload-identity',
    title: 'mTLS / Workload Identity Certificates (SPIFFE SVIDs)',
    domain: 'PKI & CA',
    currentAlgorithms: ['ECDSA P-256 SVIDs'],
    targetAlgorithms: ['ML-DSA-based SVIDs (as SPIFFE tooling adds support)'],
    dependsOn: ['root-ca-hierarchy', 'transport-tls'],
    difficulty: 'medium',
    hndlExposure: 'medium',
    affectedThemes: ['agentic-identity'],
    migrationSteps: ['Confirm SPIFFE/SPIRE tooling supports the target algorithm', 'Roll out to a non-production trust domain first', 'Expand to production once cross-workload interoperability is confirmed'],
    verificationApproach: 'Short SVID lifetimes already limit HNDL exposure meaningfully -- verify rotation is actually happening on schedule as the primary check.',
    standardRefs: ['spiffe-spire', 'pqc-fips203-205'],
  },
  {
    id: 'hsm-firmware',
    title: 'HSM Firmware & Root-of-Trust Algorithm Support',
    domain: 'PKI & CA',
    currentAlgorithms: ['RSA/ECDSA key generation and signing'],
    targetAlgorithms: ['ML-KEM / ML-DSA support added via validated firmware update'],
    dependsOn: [],
    difficulty: 'high',
    hndlExposure: 'none',
    affectedThemes: ['crypto-agility', 'phishing-resistant-auth', 'digital-wallets', 'agentic-identity'],
    migrationSteps: ['Confirm HSM vendor has a FIPS 140-3 validated firmware update adding PQC algorithm support', 'Schedule a key-ceremony-grade update process, not a routine patch', 'Re-validate the module\'s FIPS compliance status after update'],
    verificationApproach: 'Every other workstream in this registry ultimately depends on this one -- HSM firmware support is the true root dependency, even though it has no direct HNDL exposure itself.',
    standardRefs: ['x509-pki'],
  },
  {
    id: 'status-list-revocation',
    title: 'Credential Status-List / Revocation Signatures',
    domain: 'Credential Signatures',
    currentAlgorithms: ['EdDSA (Ed25519)'],
    targetAlgorithms: ['ML-DSA (FIPS 204)'],
    dependsOn: ['credential-signatures-vc'],
    difficulty: 'low',
    hndlExposure: 'low',
    affectedThemes: ['digital-wallets'],
    migrationSteps: ['Migrate the status-list issuer\'s signing key alongside the credential-issuer migration', 'Confirm verifier tooling accepts the new signature type before switching'],
    verificationApproach: 'Lower urgency than the credentials themselves -- a status list is short-lived and re-published frequently, reducing its own HNDL exposure.',
    standardRefs: ['vc-did', 'openid4vc'],
  },
]

export function getWorkstreamById(id: string): CryptoMigrationWorkstream | undefined {
  return CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.id === id)
}

export function getWorkstreamsByDomain(domain: CryptoDomain): CryptoMigrationWorkstream[] {
  return CRYPTO_MIGRATION_WORKSTREAMS.filter((w) => w.domain === domain)
}
