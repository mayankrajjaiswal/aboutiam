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
