/**
 * Pure ROI/cost-comparison logic for the Passwordless ROI & Helpdesk Cost
 * Calculator (`/tools/passwordless-roi-calculator`). Models a 3-year cost
 * comparison between continuing password-based auth (with its recurring
 * helpdesk/lockout/MFA-fatigue costs) versus a FIDO passwordless rollout
 * (with device unit/fulfillment/support costs and a refresh cycle).
 *
 * Integrity requirement (NextGenIAM.md §7.3.3): every default value here is
 * explicitly labeled as either a cited, verifiable figure or an "illustrative
 * assumption" the user should replace with their own data -- see
 * `DEFAULT_ROI_INPUTS` below. This tool models a planning scenario, not a
 * vendor performance claim.
 */
export interface RoiInputs {
  population: number
  /** Password-reset tickets per user per year. */
  resetTicketsPerUserPerYear: number
  /** Fully-loaded cost per helpdesk ticket handled (USD). */
  costPerTicket: number
  /** Average lockout downtime per incident, in minutes. */
  lockoutMinutesPerIncident: number
  /** Lockout incidents per user per year. */
  lockoutIncidentsPerUserPerYear: number
  /** Fully-loaded hourly cost of the affected employee's time (USD). */
  loadedHourlyCost: number
  /** MFA-fatigue-driven security incidents per 1,000 users per year. */
  mfaFatigueIncidentsPer1000PerYear: number
  /** Average fully-loaded cost of investigating/remediating one MFA-fatigue incident (USD). */
  costPerMfaFatigueIncident: number
  /** One-time device unit cost per user (USD). */
  deviceUnitCost: number
  /** One-time fulfillment/personalization/distribution cost per user (USD). */
  deviceFulfillmentCost: number
  /** Ongoing device support cost per user per year (USD). */
  deviceSupportCostPerYear: number
  /** Years between device refresh (re-purchase) cycles. */
  deviceRefreshCycleYears: number
}

/**
 * Illustrative defaults. NONE of these are vendor performance claims or
 * verified industry benchmarks -- they are round, plausible starting points
 * for a 3-year planning model. Replace every one of them with your own
 * organization's actual ticket volume, cost-per-ticket, and device pricing
 * before relying on the output for a real budget decision.
 */
export const DEFAULT_ROI_INPUTS: RoiInputs = {
  population: 5000,
  resetTicketsPerUserPerYear: 2, // Illustrative assumption -- replace with your own helpdesk ticket data.
  costPerTicket: 25, // Illustrative assumption -- replace with your own fully-loaded helpdesk cost.
  lockoutMinutesPerIncident: 20, // Illustrative assumption.
  lockoutIncidentsPerUserPerYear: 1, // Illustrative assumption.
  loadedHourlyCost: 60, // Illustrative assumption -- replace with your own blended fully-loaded hourly cost.
  mfaFatigueIncidentsPer1000PerYear: 2, // Illustrative assumption.
  costPerMfaFatigueIncident: 5000, // Illustrative assumption -- incident investigation/remediation cost varies enormously by severity.
  deviceUnitCost: 35, // Illustrative assumption -- varies significantly by form factor (see fidoFormFactors.ts costBand).
  deviceFulfillmentCost: 15, // Illustrative assumption.
  deviceSupportCostPerYear: 8, // Illustrative assumption.
  deviceRefreshCycleYears: 4, // Illustrative assumption.
}

export interface YearlyRoiPoint {
  year: number
  cumulativePasswordCost: number
  cumulativePasswordlessCost: number
}

export interface RoiResult {
  yearlyPoints: YearlyRoiPoint[]
  threeYearPasswordCost: number
  threeYearPasswordlessCost: number
  threeYearSavings: number
  /** The year (fractional) at which cumulative passwordless cost drops below cumulative password cost, or null if it never does within 3 years. */
  breakEvenYear: number | null
  /** The two inputs whose ±20% change most shifts the 3-year savings figure. */
  mostInfluentialInputs: { input: keyof RoiInputs; savingsDeltaAt20PercentUp: number }[]
}

function annualPasswordCost(inputs: RoiInputs): number {
  const resetTicketCost = inputs.population * inputs.resetTicketsPerUserPerYear * inputs.costPerTicket
  const lockoutCost = inputs.population * inputs.lockoutIncidentsPerUserPerYear * (inputs.lockoutMinutesPerIncident / 60) * inputs.loadedHourlyCost
  const mfaFatigueCost = (inputs.population / 1000) * inputs.mfaFatigueIncidentsPer1000PerYear * inputs.costPerMfaFatigueIncident
  return resetTicketCost + lockoutCost + mfaFatigueCost
}

function annualPasswordlessCost(inputs: RoiInputs, year: number): number {
  const isRefreshYear = inputs.deviceRefreshCycleYears > 0 && year % inputs.deviceRefreshCycleYears === 0
  const oneTimeCost = year === 0 || isRefreshYear ? inputs.population * (inputs.deviceUnitCost + inputs.deviceFulfillmentCost) : 0
  const supportCost = inputs.population * inputs.deviceSupportCostPerYear
  return oneTimeCost + supportCost
}

export function computeRoi(inputs: RoiInputs): RoiResult {
  const yearlyPoints: YearlyRoiPoint[] = []
  let cumulativePassword = 0
  let cumulativePasswordless = 0

  for (let year = 0; year <= 3; year++) {
    if (year > 0) cumulativePassword += annualPasswordCost(inputs)
    cumulativePasswordless += annualPasswordlessCost(inputs, year)
    yearlyPoints.push({ year, cumulativePasswordCost: cumulativePassword, cumulativePasswordlessCost: cumulativePasswordless })
  }

  const threeYearPasswordCost = yearlyPoints[3].cumulativePasswordCost
  const threeYearPasswordlessCost = yearlyPoints[3].cumulativePasswordlessCost
  const threeYearSavings = threeYearPasswordCost - threeYearPasswordlessCost

  let breakEvenYear: number | null = null
  for (let i = 1; i < yearlyPoints.length; i++) {
    const prev = yearlyPoints[i - 1]
    const curr = yearlyPoints[i]
    const prevDiff = prev.cumulativePasswordlessCost - prev.cumulativePasswordCost
    const currDiff = curr.cumulativePasswordlessCost - curr.cumulativePasswordCost
    if (prevDiff > 0 && currDiff <= 0) {
      const fraction = prevDiff / (prevDiff - currDiff)
      breakEvenYear = prev.year + fraction
      break
    }
  }

  // Sensitivity: bump each numeric input by +20% independently and measure the
  // resulting change in 3-year savings, keeping every other input fixed.
  const sensitivityCandidates: (keyof RoiInputs)[] = [
    'resetTicketsPerUserPerYear', 'costPerTicket', 'lockoutIncidentsPerUserPerYear',
    'mfaFatigueIncidentsPer1000PerYear', 'costPerMfaFatigueIncident', 'deviceUnitCost', 'deviceSupportCostPerYear',
  ]
  const sensitivities = sensitivityCandidates.map((key) => {
    const bumped: RoiInputs = { ...inputs, [key]: inputs[key] * 1.2 }
    const bumpedResult3Year = computeThreeYearSavingsOnly(bumped)
    return { input: key, savingsDeltaAt20PercentUp: Math.abs(bumpedResult3Year - threeYearSavings) }
  })
  const mostInfluentialInputs = sensitivities
    .sort((a, b) => b.savingsDeltaAt20PercentUp - a.savingsDeltaAt20PercentUp)
    .slice(0, 2)

  return { yearlyPoints, threeYearPasswordCost, threeYearPasswordlessCost, threeYearSavings, breakEvenYear, mostInfluentialInputs }
}

function computeThreeYearSavingsOnly(inputs: RoiInputs): number {
  let cumulativePassword = 0
  let cumulativePasswordless = 0
  for (let year = 0; year <= 3; year++) {
    if (year > 0) cumulativePassword += annualPasswordCost(inputs)
    cumulativePasswordless += annualPasswordlessCost(inputs, year)
  }
  return cumulativePassword - cumulativePasswordless
}
