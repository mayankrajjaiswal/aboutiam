// Single source of truth for the /standards "Compliance Deadlines" tab — a hand-curated
// list of major identity/access-relevant regulatory deadlines. `confidence: 'confirmed'`
// marks dates fixed directly in an enacted regulation/standard; `confidence: 'estimated'`
// marks dates that depend on further implementing acts, phased rollouts, or a proposed
// (not yet finalized) rule, and so may still shift. Re-verify against `officialLink`
// before relying on any of these for real compliance planning — this list is an
// educational starting point, not legal or compliance advice.
export interface ComplianceDeadline {
  id: string
  regulation: string
  jurisdiction: string
  deadlineDate: string
  description: string
  relatedStandardId?: string
  officialLink: string
  verifiedDate: string
  confidence: 'confirmed' | 'estimated'
}

export const COMPLIANCE_DEADLINES: ComplianceDeadline[] = [
  {
    id: 'nis2-transposition',
    regulation: 'NIS2 Directive',
    jurisdiction: 'European Union',
    deadlineDate: '2024-10-17',
    description: 'Deadline for EU member states to transpose NIS2 into national law, extending cybersecurity and access-control obligations (incident reporting, supply-chain risk management) to a much broader set of "essential" and "important" entities.',
    officialLink: 'https://digital-strategy.ec.europa.eu/en/policies/nis2-directive',
    verifiedDate: '2026-07-21',
    confidence: 'confirmed',
  },
  {
    id: 'dora-application',
    regulation: 'DORA (Digital Operational Resilience Act)',
    jurisdiction: 'European Union',
    deadlineDate: '2025-01-17',
    description: 'Application date for DORA, mandating ICT risk management, third-party oversight, and strong access-control/authentication requirements for EU financial entities and their critical ICT providers.',
    officialLink: 'https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en',
    verifiedDate: '2026-07-21',
    confidence: 'confirmed',
  },
  {
    id: 'pci-dss-v4-future-dated',
    regulation: 'PCI DSS v4.0 — Future-Dated Requirements',
    jurisdiction: 'Global (PCI SSC)',
    deadlineDate: '2025-03-31',
    description: 'Date PCI DSS v4.0\'s previously "future-dated" requirements became mandatory, including expanded MFA coverage for all access into the cardholder data environment and stricter password/authentication controls.',
    officialLink: 'https://www.pcisecuritystandards.org/document_library/',
    verifiedDate: '2026-07-21',
    confidence: 'confirmed',
  },
  {
    id: 'nist-800-63-4-final',
    regulation: 'NIST SP 800-63-4 (Digital Identity Guidelines)',
    jurisdiction: 'United States (Federal)',
    deadlineDate: '2025-08-01',
    description: 'Approximate publication window for the final revision 4 of NIST\'s Digital Identity Guidelines, updating identity proofing, authentication, and federation assurance levels referenced across §standards §architecture pages on this site.',
    relatedStandardId: 'webauthn',
    officialLink: 'https://pages.nist.gov/800-63-4/',
    verifiedDate: '2026-07-21',
    confidence: 'estimated',
  },
  {
    id: 'ny-dfs-mfa-phase',
    regulation: '23 NYCRR Part 500 (NY DFS Cybersecurity Regulation)',
    jurisdiction: 'United States (New York)',
    deadlineDate: '2025-11-01',
    description: 'Approximate phased-compliance date by which the 2023 amendments to New York\'s financial services cybersecurity regulation require MFA for all covered entities\' access to nonpublic information and information systems.',
    officialLink: 'https://www.dfs.ny.gov/industry_guidance/cybersecurity',
    verifiedDate: '2026-07-21',
    confidence: 'estimated',
  },
  {
    id: 'eidas2-wallet-rollout',
    regulation: 'eIDAS 2.0 / EU Digital Identity Wallet',
    jurisdiction: 'European Union',
    deadlineDate: '2026-12-31',
    description: 'Target date by which EU member states are expected to make at least one EU Digital Identity Wallet available to citizens, per the eIDAS 2.0 regulation\'s implementing timeline.',
    relatedStandardId: 'oidc',
    officialLink: 'https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation',
    verifiedDate: '2026-07-21',
    confidence: 'estimated',
  },
  {
    id: 'eu-ai-act-biometric',
    regulation: 'EU AI Act — Biometric Categorization & Transparency Rules',
    jurisdiction: 'European Union',
    deadlineDate: '2026-08-02',
    description: 'Transparency obligations for biometric categorization and emotion-recognition AI systems come into force; high-risk biometric identification rules follow in a later phase.',
    officialLink: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    verifiedDate: '2026-07-29',
    confidence: 'confirmed',
  },
  {
    id: 'eu-age-verification-blueprint',
    regulation: 'EU Age Verification Blueprint',
    jurisdiction: 'European Union',
    deadlineDate: '2026-12-01',
    description: 'Privacy-preserving, zero-knowledge-proof-based age-assurance blueprint deadline for platforms serving minors — directly relevant to the ZKP age-proof pattern.',
    officialLink: 'https://digital-strategy.ec.europa.eu/en/policies/euclid-age-verification-app',
    verifiedDate: '2026-07-29',
    confidence: 'estimated',
  },
  {
    id: 'eidas2-relying-party-acceptance',
    regulation: 'eIDAS 2.0 — Relying-Party Wallet Acceptance Obligation',
    jurisdiction: 'European Union',
    deadlineDate: '2027-11-30',
    description: 'Regulated private-sector relying parties (banking, healthcare, telecoms, and large online platforms subject to the obligation) must begin accepting the EU Digital Identity Wallet as an authentication/attestation method — distinct from and later than the member-state wallet-availability deadline above.',
    relatedStandardId: 'eidas2-arf',
    officialLink: 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj/eng',
    verifiedDate: '2026-09-19',
    confidence: 'estimated',
  },
  {
    id: 'nist-pqc-federal-key-establishment',
    regulation: 'Federal PQC Migration — Key Establishment Deprecation Target',
    jurisdiction: 'United States (Federal Civilian Executive Branch, high-value systems)',
    deadlineDate: '2030-01-01',
    description: 'Federal guidance target for deprecating classical (non-quantum-resistant) key-establishment algorithms on federal civilian high-value systems, following the August 2024 finalization of FIPS 203 (ML-KEM).',
    relatedStandardId: 'pqc-fips203-205',
    officialLink: 'https://www.federalregister.gov/documents/2024/08/14/2024-17956/announcing-issuance-of-federal-information-processing-standards-fips-fips-203-module-lattice-based',
    verifiedDate: '2026-09-19',
    confidence: 'estimated',
  },
  {
    id: 'nist-pqc-federal-signatures',
    regulation: 'Federal PQC Migration — Digital Signature Deprecation Target',
    jurisdiction: 'United States (Federal Civilian Executive Branch, high-value systems)',
    deadlineDate: '2031-01-01',
    description: 'Federal guidance target for deprecating classical digital-signature algorithms on federal civilian high-value systems, following the finalization of FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA).',
    relatedStandardId: 'pqc-fips203-205',
    officialLink: 'https://www.federalregister.gov/documents/2024/08/14/2024-17956/announcing-issuance-of-federal-information-processing-standards-fips-fips-203-module-lattice-based',
    verifiedDate: '2026-09-19',
    confidence: 'estimated',
  },
  {
    id: 'cnsa-2-0-legacy-systems',
    regulation: 'CNSA 2.0 (Commercial National Security Algorithm Suite) — Legacy System Migration',
    jurisdiction: 'United States (National Security Systems)',
    deadlineDate: '2033-01-01',
    description: 'NSA\'s outer-bound target for legacy national security systems to complete migration to CNSA 2.0-mandated algorithms (including ML-KEM-1024); new systems were expected to support CNSA 2.0 immediately upon the September 2022 announcement.',
    relatedStandardId: 'pqc-fips203-205',
    officialLink: 'https://www.federalregister.gov/documents/2024/08/14/2024-17956/announcing-issuance-of-federal-information-processing-standards-fips-fips-203-module-lattice-based',
    verifiedDate: '2026-09-19',
    confidence: 'estimated',
  },
  {
    id: 'eu-ai-act-annex-iii-high-risk',
    regulation: 'EU AI Act — Annex III High-Risk AI System Obligations (as deferred by the Digital Omnibus on AI)',
    jurisdiction: 'European Union',
    deadlineDate: '2027-12-02',
    description: 'Full compliance obligations for standalone, use-case-based high-risk AI systems (employment, credit scoring, law enforcement, and similar) take effect on this date — deferred 16 months from the original 2026-08-02 date by Regulation (EU) 2026/1744 (the "Digital Omnibus on AI," in force 2026-07-27) because harmonised conformity standards were not ready in time. The requirements themselves are unchanged; only the enforcement date moved. Directly relevant to any AI agent deployed in an Annex III use case.',
    officialLink: 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act',
    verifiedDate: '2026-09-19',
    confidence: 'confirmed',
  },
]

export function getUpcomingDeadlines(): ComplianceDeadline[] {
  const today = new Date().toISOString().slice(0, 10)
  return COMPLIANCE_DEADLINES
    .filter((d) => d.deadlineDate >= today)
    .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))
}

export function getPastDeadlines(): ComplianceDeadline[] {
  const today = new Date().toISOString().slice(0, 10)
  return COMPLIANCE_DEADLINES
    .filter((d) => d.deadlineDate < today)
    .sort((a, b) => b.deadlineDate.localeCompare(a.deadlineDate))
}

export function getJurisdictions(): string[] {
  return Array.from(new Set(COMPLIANCE_DEADLINES.map((d) => d.jurisdiction))).sort()
}
