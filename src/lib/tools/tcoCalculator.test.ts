import { describe, it, expect } from 'vitest'
import { computeTco, TCO_PROJECTION_YEARS, BREACH_RISK_MULTIPLIER, type TcoInputs } from './tcoCalculator'

const BASE_INPUTS: TcoInputs = {
  engineerCount: 2,
  engineerAnnualCost: 150000,
  buildMaintenanceHoursPerYear: 500,
  commercialPerSeatCost: 8,
  seatCount: 500,
  includeBreachRiskAdjustment: false,
}

describe('computeTco', () => {
  it('produces exactly TCO_PROJECTION_YEARS years of cumulative results', () => {
    const result = computeTco(BASE_INPUTS)
    expect(result.years.length).toBe(TCO_PROJECTION_YEARS)
    expect(result.years.map((y) => y.year)).toEqual([1, 2, 3])
  })

  it('cumulative cost grows monotonically across years for both options', () => {
    const result = computeTco(BASE_INPUTS)
    for (let i = 1; i < result.years.length; i++) {
      expect(result.years[i].buildCostCumulative).toBeGreaterThan(result.years[i - 1].buildCostCumulative)
      expect(result.years[i].buyCostCumulative).toBeGreaterThan(result.years[i - 1].buyCostCumulative)
    }
  })

  it('final year cumulative cost matches totalBuildCost/totalBuyCost', () => {
    const result = computeTco(BASE_INPUTS)
    const last = result.years[result.years.length - 1]
    expect(result.totalBuildCost).toBe(last.buildCostCumulative)
    expect(result.totalBuyCost).toBe(last.buyCostCumulative)
  })

  it('is monotonic in build-maintenance-hours: more hours always increases build cost', () => {
    const low = computeTco({ ...BASE_INPUTS, buildMaintenanceHoursPerYear: 200 })
    const high = computeTco({ ...BASE_INPUTS, buildMaintenanceHoursPerYear: 1000 })
    expect(high.totalBuildCost).toBeGreaterThan(low.totalBuildCost)
  })

  it('is monotonic in engineer count: more engineers always increases build cost', () => {
    const low = computeTco({ ...BASE_INPUTS, engineerCount: 1 })
    const high = computeTco({ ...BASE_INPUTS, engineerCount: 5 })
    expect(high.totalBuildCost).toBeGreaterThan(low.totalBuildCost)
  })

  it('is monotonic in seat count: more seats always increases buy cost', () => {
    const low = computeTco({ ...BASE_INPUTS, seatCount: 100 })
    const high = computeTco({ ...BASE_INPUTS, seatCount: 1000 })
    expect(high.totalBuyCost).toBeGreaterThan(low.totalBuyCost)
  })

  it('is monotonic in per-seat cost: a higher per-seat price always increases buy cost', () => {
    const low = computeTco({ ...BASE_INPUTS, commercialPerSeatCost: 4 })
    const high = computeTco({ ...BASE_INPUTS, commercialPerSeatCost: 20 })
    expect(high.totalBuyCost).toBeGreaterThan(low.totalBuyCost)
  })

  it('the breach-risk toggle strictly increases the build total when enabled', () => {
    const withoutRisk = computeTco({ ...BASE_INPUTS, includeBreachRiskAdjustment: false })
    const withRisk = computeTco({ ...BASE_INPUTS, includeBreachRiskAdjustment: true })
    expect(withRisk.totalBuildCost).toBeGreaterThan(withoutRisk.totalBuildCost)
    expect(withRisk.totalBuildCost).toBeCloseTo(withoutRisk.totalBuildCost * BREACH_RISK_MULTIPLIER, -1)
  })

  it('the breach-risk toggle never affects the buy total', () => {
    const withoutRisk = computeTco({ ...BASE_INPUTS, includeBreachRiskAdjustment: false })
    const withRisk = computeTco({ ...BASE_INPUTS, includeBreachRiskAdjustment: true })
    expect(withRisk.totalBuyCost).toBe(withoutRisk.totalBuyCost)
  })

  it('handles zero inputs without throwing or producing NaN', () => {
    const result = computeTco({
      engineerCount: 0,
      engineerAnnualCost: 0,
      buildMaintenanceHoursPerYear: 0,
      commercialPerSeatCost: 0,
      seatCount: 0,
      includeBreachRiskAdjustment: true,
    })
    expect(result.totalBuildCost).toBe(0)
    expect(result.totalBuyCost).toBe(0)
    expect(Number.isNaN(result.totalBuildCost)).toBe(false)
  })
})
