import { questions, computeScores, getMaturityTier, type MaturityTier } from './scoring'

export interface PillarBreakdown {
  dimension: string
  score: number
}

export interface BoardSummary {
  percentage: number
  averageScore: number
  tier: MaturityTier
  pillars: PillarBreakdown[]
  weakestPillars: string[]
  dollarExposureNarrative: string
  nhiAddendum: string
}

// Illustrative, directional dollar-exposure framing per current Gartner board-reporting
// guidance (risk reduction expressed in relatable financial terms, not raw maturity
// jargon) — not a licensed actuarial or risk-quantification model.
const DOLLAR_EXPOSURE_BY_TIER: Record<string, string> = {
  'Tier 1: Ad-Hoc & Siloed':
    'This posture concentrates breach and business-disruption exposure in a small number of largely unmonitored paths (shared credentials, manual provisioning, standing privileges) — the same profile insurers and incident-cost studies most commonly associate with the higher end of reported breach-cost ranges.',
  'Tier 2: Standardized & Defined':
    'Core controls exist and reduce the widest attack paths, but standing privileges and less-resistant MFA still leave a materially higher exposure than a fully adaptive posture — closing the remaining gaps is a comparatively low-cost step relative to the exposure it removes.',
  'Tier 3: Adaptive Zero Trust':
    'This posture covers the controls most consistently associated with lower incident likelihood and severity in industry breach-cost reporting — the board-level ask at this tier shifts from "close the gap" to "maintain and monitor," including the non-human-identity gap below.',
}

// Fixed regardless of the 5-pillar structure above, since NHI/non-human-identity
// governance is a named 2026 boardroom gap that none of the existing pillars measure —
// surfaced even at a perfect Tier 3 score across every scored pillar.
const NHI_ADDENDUM =
  'Non-human identities (service accounts, API keys, workload identities, and increasingly agentic/AI identities) are not scored by any pillar above. This is a named, industry-wide 2026 governance gap independent of your overall maturity tier — board-level tracking of NHI inventory and lifecycle ownership is recommended even at Tier 3 overall maturity.'

export function buildBoardSummary(answers: Record<number, number>): BoardSummary {
  const { percentage, averageScore } = computeScores(answers)
  const tier = getMaturityTier(averageScore)

  const pillars: PillarBreakdown[] = questions.map((q, i) => ({
    dimension: q.dimension,
    score: answers[i] ?? 1,
  }))

  const minScore = Math.min(...pillars.map((p) => p.score))
  const weakestPillars = pillars.filter((p) => p.score === minScore).map((p) => p.dimension)

  return {
    percentage,
    averageScore,
    tier,
    pillars,
    weakestPillars,
    dollarExposureNarrative: DOLLAR_EXPOSURE_BY_TIER[tier.label] ?? DOLLAR_EXPOSURE_BY_TIER['Tier 1: Ad-Hoc & Siloed'],
    nhiAddendum: NHI_ADDENDUM,
  }
}

export function buildBoardSummaryMarkdown(summary: BoardSummary): string {
  const lines: string[] = []
  lines.push('# Executive Board Summary — Identity Program Posture')
  lines.push('')
  lines.push(`**Overall Maturity:** ${summary.tier.label} (${summary.percentage}%, avg ${summary.averageScore}/5.0)`)
  lines.push('')
  lines.push('## Dollar-Exposure Framing')
  lines.push(summary.dollarExposureNarrative)
  lines.push('')
  lines.push('## Weakest Pillar(s)')
  lines.push(summary.weakestPillars.map((p) => `- ${p}`).join('\n'))
  lines.push('')
  lines.push('## Pillar Breakdown')
  for (const pillar of summary.pillars) {
    lines.push(`- ${pillar.dimension}: ${pillar.score}/5`)
  }
  lines.push('')
  lines.push('## Non-Human Identity Governance (Fixed Addendum)')
  lines.push(summary.nhiAddendum)
  lines.push('')
  lines.push('---')
  lines.push('*Directional estimate for internal discussion only — not a licensed actuarial or risk-quantification model.*')
  return lines.join('\n')
}
