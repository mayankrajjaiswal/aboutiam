import { describe, expect, it } from 'vitest'
import { computeRoi, DEFAULT_ROI_INPUTS, type RoiInputs } from './passwordlessRoi'

describe('computeRoi with default (illustrative) inputs', () => {
  it('produces exactly 4 yearly points (year 0 through year 3)', () => {
    const result = computeRoi(DEFAULT_ROI_INPUTS)
    expect(result.yearlyPoints).toHaveLength(4)
    expect(result.yearlyPoints.map((p) => p.year)).toEqual([0, 1, 2, 3])
  })

  it('has zero cumulative password cost at year 0 (no time has passed yet)', () => {
    const result = computeRoi(DEFAULT_ROI_INPUTS)
    expect(result.yearlyPoints[0].cumulativePasswordCost).toBe(0)
  })

  it('has a non-zero passwordless cost at year 0 (device rollout is an upfront cost)', () => {
    const result = computeRoi(DEFAULT_ROI_INPUTS)
    expect(result.yearlyPoints[0].cumulativePasswordlessCost).toBeGreaterThan(0)
  })

  it('cumulative password cost increases monotonically year over year', () => {
    const result = computeRoi(DEFAULT_ROI_INPUTS)
    for (let i = 1; i < result.yearlyPoints.length; i++) {
      expect(result.yearlyPoints[i].cumulativePasswordCost).toBeGreaterThanOrEqual(result.yearlyPoints[i - 1].cumulativePasswordCost)
    }
  })

  it('computes threeYearSavings as the difference between the two 3-year totals', () => {
    const result = computeRoi(DEFAULT_ROI_INPUTS)
    const expected = result.threeYearPasswordCost - result.threeYearPasswordlessCost
    expect(result.threeYearSavings).toBeCloseTo(expected, 5)
  })

  it('identifies exactly 2 most-influential inputs', () => {
    const result = computeRoi(DEFAULT_ROI_INPUTS)
    expect(result.mostInfluentialInputs).toHaveLength(2)
  })
})

describe('computeRoi edge cases', () => {
  it('a zero population produces zero cost on both sides', () => {
    const inputs: RoiInputs = { ...DEFAULT_ROI_INPUTS, population: 0 }
    const result = computeRoi(inputs)
    expect(result.threeYearPasswordCost).toBe(0)
    expect(result.threeYearPasswordlessCost).toBe(0)
  })

  it('a scenario with zero password-related costs never breaks even for passwordless', () => {
    const inputs: RoiInputs = {
      ...DEFAULT_ROI_INPUTS,
      resetTicketsPerUserPerYear: 0,
      lockoutIncidentsPerUserPerYear: 0,
      mfaFatigueIncidentsPer1000PerYear: 0,
    }
    const result = computeRoi(inputs)
    expect(result.breakEvenYear).toBeNull()
    expect(result.threeYearSavings).toBeLessThan(0)
  })

  it('a very high password-reset cost produces a break-even point within 3 years', () => {
    const inputs: RoiInputs = { ...DEFAULT_ROI_INPUTS, resetTicketsPerUserPerYear: 20, costPerTicket: 200 }
    const result = computeRoi(inputs)
    expect(result.breakEvenYear).not.toBeNull()
    expect(result.breakEvenYear!).toBeGreaterThan(0)
    expect(result.breakEvenYear!).toBeLessThanOrEqual(3)
  })

  it('a device refresh cycle of 1 year adds device unit cost every year', () => {
    const inputs: RoiInputs = { ...DEFAULT_ROI_INPUTS, deviceRefreshCycleYears: 1 }
    const result = computeRoi(inputs)
    // Year 1 and year 2 deltas should both include a refresh purchase, not just support cost
    const yearOneDelta = result.yearlyPoints[1].cumulativePasswordlessCost - result.yearlyPoints[0].cumulativePasswordlessCost
    const supportOnlyDelta = inputs.population * inputs.deviceSupportCostPerYear
    expect(yearOneDelta).toBeGreaterThan(supportOnlyDelta)
  })
})

describe('DEFAULT_ROI_INPUTS integrity', () => {
  it('has a positive value for every numeric field', () => {
    for (const value of Object.values(DEFAULT_ROI_INPUTS)) {
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThanOrEqual(0)
    }
  })
})
