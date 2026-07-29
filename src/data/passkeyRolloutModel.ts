export interface RolloutAllocation {
  platformSdk: number
  helpDeskTraining: number
  legacyFallbackSunset: number
  recoveryInvestment: number
}

export interface QuarterOutcome {
  quarter: number
  adoptionPercent: number
  phishingIncidentRate: number
  helpDeskTicketVolume: number
  supportEscalation: boolean
}

export const TOTAL_BUDGET_POINTS = 100
export const QUARTERS_PER_YEAR = 4

/** Cited from the FIDO Alliance's 2026 State of Passwordless report. */
export const INDUSTRY_BENCHMARKS = {
  passkeySuccessRateCeiling: 93,
  legacyFallbackPhishableRate: 57,
  citation: 'FIDO Alliance 2026 State of Passwordless Report'
}

export const ALLOCATION_CATEGORIES: { key: keyof RolloutAllocation; label: string; desc: string }[] = [
  { key: 'platformSdk', label: 'Platform SDK Rollout', desc: 'iOS, Android, Windows Hello, and security-key SDK integration work.' },
  { key: 'helpDeskTraining', label: 'Help-Desk Training', desc: 'Training frontline support to handle passkey enrollment and troubleshooting.' },
  { key: 'legacyFallbackSunset', label: 'Legacy Fallback Sunset', desc: 'Retiring phishable fallback methods (SMS OTP, security questions) as passkeys roll out.' },
  { key: 'recoveryInvestment', label: 'Account Recovery Flow', desc: 'Building a robust, phishing-resistant account-recovery path for lost devices.' }
]

/**
 * Concave diminishing-returns curve: spreading a fixed budget across
 * categories yields a higher combined effectiveness than concentrating it
 * in one, by the same logic as Jensen's inequality on a concave function —
 * this is what makes a balanced allocation outperform an all-in-one bet.
 */
function effectiveness(points: number): number {
  const clamped = Math.max(0, Math.min(TOTAL_BUDGET_POINTS, points))
  return Math.sqrt(clamped) * 10
}

export function simulateQuarter(allocation: RolloutAllocation, prevAdoptionPercent: number, quarter: number): QuarterOutcome {
  const sdkEff = effectiveness(allocation.platformSdk)
  const trainingEff = effectiveness(allocation.helpDeskTraining)
  const fallbackEff = effectiveness(allocation.legacyFallbackSunset)
  const recoveryEff = effectiveness(allocation.recoveryInvestment)

  const adoptionGrowth = (sdkEff * 0.6 + trainingEff * 0.4) / 10
  const adoptionPercent = Math.min(INDUSTRY_BENCHMARKS.passkeySuccessRateCeiling, prevAdoptionPercent + adoptionGrowth)

  const phishingIncidentRate = Math.max(2, 20 - adoptionPercent * 0.15 - fallbackEff * 0.1)

  const helpDeskTicketVolume = Math.max(50, 400 - trainingEff * 2 - recoveryEff * 2 - adoptionPercent * 1.5)

  const supportEscalation = allocation.recoveryInvestment === 0

  return { quarter, adoptionPercent, phishingIncidentRate, helpDeskTicketVolume, supportEscalation }
}

export function simulateYear(allocation: RolloutAllocation): QuarterOutcome[] {
  const outcomes: QuarterOutcome[] = []
  let adoptionPercent = 0
  for (let quarter = 1; quarter <= QUARTERS_PER_YEAR; quarter++) {
    const outcome = simulateQuarter(allocation, adoptionPercent, quarter)
    outcomes.push(outcome)
    adoptionPercent = outcome.adoptionPercent
  }
  return outcomes
}

/** Higher is better. Rewards adoption, penalizes phishing incidents, ticket load, and a zero-recovery-investment support escalation. */
export function computeOutcomeScore(outcome: QuarterOutcome): number {
  return (
    outcome.adoptionPercent * 2 -
    outcome.phishingIncidentRate * 3 -
    outcome.helpDeskTicketVolume * 0.05 -
    (outcome.supportEscalation ? 25 : 0)
  )
}
