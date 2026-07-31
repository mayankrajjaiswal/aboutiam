export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical'

export interface RiskEntry {
  id: string
  risk: string
  impact: 1 | 2 | 3 | 4 | 5
  likelihood: 1 | 2 | 3 | 4 | 5
  owner: string
  mitigation: string
  targetDate: string
}

/** Standard 5x5 impact x likelihood matrix, score = impact * likelihood (range 1-25). */
export function computeRiskScore(impact: number, likelihood: number): number {
  return impact * likelihood
}

/** Tier boundaries follow a common 5x5 GRC convention: Low 1-4, Medium 5-9, High 10-14, Critical 15-25. */
export function computeRiskTier(score: number): RiskTier {
  if (score >= 15) return 'Critical'
  if (score >= 10) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

export function scoreRiskEntry(entry: Pick<RiskEntry, 'impact' | 'likelihood'>): { score: number; tier: RiskTier } {
  const score = computeRiskScore(entry.impact, entry.likelihood)
  return { score, tier: computeRiskTier(score) }
}

/**
 * A small starter set of common identity risks, drawn loosely from the
 * existing Security Bulletins/breach categories for realism — editable or
 * deletable by the user, not a mandatory fixed list.
 */
export const STARTER_RISK_REGISTER: RiskEntry[] = [
  {
    id: 'no-mfa-legacy-vpn',
    risk: 'No MFA enforced on legacy VPN remote-access accounts',
    impact: 5,
    likelihood: 4,
    owner: 'Network Security Lead',
    mitigation: 'Enforce phishing-resistant MFA on all VPN endpoints; sunset password-only fallback.',
    targetDate: '2026-10-31',
  },
  {
    id: 'orphaned-service-accounts',
    risk: 'Orphaned service accounts with standing privileged access',
    impact: 4,
    likelihood: 4,
    owner: 'IAM Program Manager',
    mitigation: 'Run a full NHI inventory sweep; rotate or revoke every account with no active owner.',
    targetDate: '2026-09-30',
  },
  {
    id: 'single-idp-no-failover',
    risk: 'Single Identity Provider with no failover/break-glass path',
    impact: 5,
    likelihood: 2,
    owner: 'Identity Architecture Lead',
    mitigation: 'Stand up a documented, tested break-glass admin path independent of the primary IdP.',
    targetDate: '2026-12-15',
  },
  {
    id: 'saml-signing-key-single-copy',
    risk: 'SAML federation signing key has no rotation schedule',
    impact: 5,
    likelihood: 3,
    owner: 'Identity Architecture Lead',
    mitigation: 'Establish a periodic signing-key rotation policy and alert on key age.',
    targetDate: '2026-11-30',
  },
  {
    id: 'no-step-up-high-risk-actions',
    risk: 'No step-up authentication before high-risk administrative actions',
    impact: 4,
    likelihood: 3,
    owner: 'Security Engineering Lead',
    mitigation: 'Require WebAuthn/OTP step-up on privileged-role changes and payment approvals.',
    targetDate: '2027-01-31',
  },
]

export function buildRiskRegisterMarkdown(entries: RiskEntry[]): string {
  const rows = entries
    .map((e) => {
      const { score, tier } = scoreRiskEntry(e)
      return `| ${e.risk} | ${e.impact} | ${e.likelihood} | ${score} | ${tier} | ${e.owner} | ${e.mitigation} | ${e.targetDate} |`
    })
    .join('\n')

  return `# IAM Risk Register

| Risk | Impact | Likelihood | Score | Tier | Owner | Mitigation | Target Date |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}
`
}
