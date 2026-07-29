// Static, citation-linked crypto-agility risk table consumed by src/lib/tools/pqcReadiness.ts.
// Quantum vulnerability here means "broken by a sufficiently large fault-tolerant quantum
// computer running Shor's algorithm" (asymmetric/ECC) or "materially weakened by Grover's
// algorithm" (symmetric) -- not a statement about today's classical security.

export type MigrationPriority = 'Critical' | 'High' | 'Medium' | 'Info'

export interface PqcAlgorithmRisk {
  /** Canonical display name shown in reports. */
  algorithm: string
  /** Strings as they can appear in x509.ts signatureAlgorithm/publicKey.algorithm, JWKS "alg"/"kty", or a TLS cipher-suite name. Matched case-insensitively as a substring. */
  aliases: string[]
  quantumVulnerable: boolean
  vulnerabilityReason: string
  recommendedHybrid: string
  migrationPriority: MigrationPriority
  citation: string
}

export const PQC_ALGORITHM_RISK_TABLE: PqcAlgorithmRisk[] = [
  {
    algorithm: 'RSA',
    aliases: ['RSA', 'RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'SHA1withRSA', 'SHA256withRSA', 'SHA384withRSA', 'SHA512withRSA'],
    quantumVulnerable: true,
    vulnerabilityReason: 'Integer factorization is efficiently solved by Shor\'s algorithm on a sufficiently large fault-tolerant quantum computer, regardless of key length.',
    recommendedHybrid: 'RSA + ML-KEM-768 hybrid key exchange for TLS; migrate signatures to ML-DSA-65.',
    migrationPriority: 'Critical',
    citation: 'NIST IR 8547 (transition to PQC); FIPS 203/204 (ML-KEM/ML-DSA)',
  },
  {
    algorithm: 'ECDSA',
    aliases: ['EC', 'ECDSA', 'ES256', 'ES384', 'ES512', 'ECDSA-SHA256', 'ECDSA-SHA384', 'ECDSA-SHA512', 'P-256', 'P-384', 'P-521'],
    quantumVulnerable: true,
    vulnerabilityReason: 'The discrete logarithm problem over elliptic curves is broken by Shor\'s algorithm, and ECC requires fewer logical qubits to break than RSA at an equivalent classical security level.',
    recommendedHybrid: 'X25519 + ML-KEM-768 hybrid key exchange; migrate signatures to ML-DSA-44/65.',
    migrationPriority: 'Critical',
    citation: 'NIST IR 8547 (transition to PQC); FIPS 203/204 (ML-KEM/ML-DSA)',
  },
  {
    algorithm: 'EdDSA (Ed25519 / Ed448)',
    aliases: ['EdDSA', 'Ed25519', 'Ed448'],
    quantumVulnerable: true,
    vulnerabilityReason: 'EdDSA is also an elliptic-curve construction and is broken by Shor\'s algorithm on a cryptographically relevant quantum computer.',
    recommendedHybrid: 'Hybrid Ed25519 + ML-DSA-44 dual signatures during the transition period.',
    migrationPriority: 'High',
    citation: 'FIPS 204 (ML-DSA); IETF draft-ietf-tls-hybrid-design',
  },
  {
    algorithm: 'DH / DSA (finite-field)',
    aliases: ['DH', 'DSA', 'DiffieHellman', 'Diffie-Hellman'],
    quantumVulnerable: true,
    vulnerabilityReason: 'The finite-field discrete logarithm problem is broken by Shor\'s algorithm, the same class of attack as RSA factorization.',
    recommendedHybrid: 'Migrate key exchange to ML-KEM-768; migrate signatures to ML-DSA-65.',
    migrationPriority: 'Critical',
    citation: 'NIST IR 8547 (transition to PQC)',
  },
  {
    algorithm: 'AES-128',
    aliases: ['AES128', 'AES_128', 'AES-128'],
    quantumVulnerable: true,
    vulnerabilityReason: 'Grover\'s algorithm provides a quadratic speedup against symmetric ciphers, roughly halving effective key strength -- AES-128 degrades to ~64-bit quantum-adjusted security, below the recommended floor.',
    recommendedHybrid: 'Upgrade to AES-256 for any data requiring long-term ("harvest now, decrypt later") confidentiality.',
    migrationPriority: 'Medium',
    citation: 'NIST IR 8547; NSA CNSA 2.0 suite (mandates AES-256)',
  },
  {
    algorithm: 'AES-256',
    aliases: ['AES256', 'AES_256', 'AES-256'],
    quantumVulnerable: false,
    vulnerabilityReason: 'Grover\'s quadratic speedup still leaves AES-256 at ~128-bit quantum-adjusted security, which NIST and NSA CNSA 2.0 consider sufficient against quantum adversaries.',
    recommendedHybrid: 'Already quantum-resistant -- no migration needed.',
    migrationPriority: 'Info',
    citation: 'NSA CNSA 2.0 suite',
  },
  {
    algorithm: 'ML-KEM (512/768/1024)',
    aliases: ['ML-KEM', 'MLKEM', 'KYBER', 'X25519MLKEM', 'X25519Kyber'],
    quantumVulnerable: false,
    vulnerabilityReason: 'A lattice-based key-encapsulation mechanism with no known efficient quantum attack, standardized as FIPS 203.',
    recommendedHybrid: 'Already PQC -- no action needed.',
    migrationPriority: 'Info',
    citation: 'FIPS 203 (ML-KEM), finalized August 2024',
  },
  {
    algorithm: 'ML-DSA (44/65/87)',
    aliases: ['ML-DSA', 'MLDSA', 'DILITHIUM'],
    quantumVulnerable: false,
    vulnerabilityReason: 'A lattice-based digital signature scheme with no known efficient quantum attack, standardized as FIPS 204.',
    recommendedHybrid: 'Already PQC -- no action needed.',
    migrationPriority: 'Info',
    citation: 'FIPS 204 (ML-DSA), finalized August 2024',
  },
  {
    algorithm: 'SLH-DSA (SPHINCS+)',
    aliases: ['SLH-DSA', 'SLHDSA', 'SPHINCS+', 'SPHINCS'],
    quantumVulnerable: false,
    vulnerabilityReason: 'A stateless hash-based signature scheme -- security reduces to hash-function preimage resistance, with no known efficient quantum attack beyond Grover\'s generic speedup already accounted for in its parameter sets.',
    recommendedHybrid: 'Already PQC -- no action needed (larger signatures than ML-DSA; use as a conservative backup algorithm).',
    migrationPriority: 'Info',
    citation: 'FIPS 205 (SLH-DSA), finalized August 2024',
  },
]

export function findPqcAlgorithmRisk(label: string): PqcAlgorithmRisk | null {
  const normalized = label.trim().toLowerCase()
  if (!normalized) return null

  // Match against the longest alias found, not the first table entry, so a more
  // specific alias (e.g. "ML-DSA") always wins over a shorter generic one it
  // happens to contain as a substring (e.g. "DSA").
  let best: { entry: PqcAlgorithmRisk; aliasLength: number } | null = null
  for (const entry of PQC_ALGORITHM_RISK_TABLE) {
    for (const alias of entry.aliases) {
      if (normalized.includes(alias.toLowerCase()) && (!best || alias.length > best.aliasLength)) {
        best = { entry, aliasLength: alias.length }
      }
    }
  }
  return best?.entry ?? null
}
