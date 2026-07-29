// Directional, documented default constants for the Build vs. Buy TCO Calculator.
// These are illustrative industry-average assumptions, not procurement-grade figures —
// always disclosed as such in the UI. STANDARD_ANNUAL_WORK_HOURS is the conventional
// 40-hours/week * 52-weeks/year full-time baseline used to convert "hours spent per
// year" into a fraction of a fully-loaded engineer's annual cost.
export const STANDARD_ANNUAL_WORK_HOURS = 2080

// Illustrative uplift applied to the self-built option's total cost when the
// breach-risk-adjustment toggle is enabled, reflecting the commonly-cited pattern that
// in-house-maintained auth stacks tend to patch known vulnerabilities more slowly than
// a commercial IDaaS vendor's dedicated security team. This is a directional multiplier
// for educational illustration, not a licensed actuarial or insurance figure.
export const BREACH_RISK_MULTIPLIER = 1.15

export const TCO_PROJECTION_YEARS = 3

export interface TcoInputs {
  engineerCount: number
  engineerAnnualCost: number
  buildMaintenanceHoursPerYear: number
  commercialPerSeatCost: number
  seatCount: number
  includeBreachRiskAdjustment: boolean
}

export interface TcoYearResult {
  year: number
  buildCostCumulative: number
  buyCostCumulative: number
}

export interface TcoResult {
  years: TcoYearResult[]
  annualBuildCost: number
  annualBuyCost: number
  totalBuildCost: number
  totalBuyCost: number
}

export function computeTco(inputs: TcoInputs): TcoResult {
  const {
    engineerCount,
    engineerAnnualCost,
    buildMaintenanceHoursPerYear,
    commercialPerSeatCost,
    seatCount,
    includeBreachRiskAdjustment,
  } = inputs

  const laborFraction = buildMaintenanceHoursPerYear / STANDARD_ANNUAL_WORK_HOURS
  const baseAnnualBuildCost = engineerCount * engineerAnnualCost * laborFraction
  const annualBuildCost = includeBreachRiskAdjustment ? baseAnnualBuildCost * BREACH_RISK_MULTIPLIER : baseAnnualBuildCost

  const annualBuyCost = commercialPerSeatCost * seatCount

  const years: TcoYearResult[] = []
  for (let year = 1; year <= TCO_PROJECTION_YEARS; year++) {
    years.push({
      year,
      buildCostCumulative: Math.round(annualBuildCost * year),
      buyCostCumulative: Math.round(annualBuyCost * year),
    })
  }

  return {
    years,
    annualBuildCost: Math.round(annualBuildCost),
    annualBuyCost: Math.round(annualBuyCost),
    totalBuildCost: years[years.length - 1].buildCostCumulative,
    totalBuyCost: years[years.length - 1].buyCostCumulative,
  }
}
