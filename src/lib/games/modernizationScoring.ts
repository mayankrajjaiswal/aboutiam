import type { ModernizationItem } from '../../data/modernizationBacklogItems'

export const BUDGET_PER_QUARTER = 50
export const TOTAL_QUARTERS = 4

const DEPENDENCY_VIOLATION_PENALTY = 8
const BUDGET_OVERAGE_PENALTY = 20

/** Maps an item id to the quarter (1-4) it's scheduled in, or omits/nulls it if left off the roadmap. */
export type RoadmapAssignment = Record<string, number | null | undefined>

export interface ScoreResult {
  totalRiskReduced: number
  totalCostSpent: number
  riskReductionPerDollar: number
  dependencyViolations: number
  budgetViolations: number
  score: number
}

export function scoreRoadmap(items: ModernizationItem[], assignment: RoadmapAssignment): ScoreResult {
  let totalRiskReduced = 0
  let totalCostSpent = 0
  let dependencyViolations = 0
  const quarterCosts = new Map<number, number>()

  for (const item of items) {
    const quarter = assignment[item.id]
    if (quarter == null) continue

    totalRiskReduced += item.riskScore
    totalCostSpent += item.cost
    quarterCosts.set(quarter, (quarterCosts.get(quarter) ?? 0) + item.cost)

    for (const depId of item.dependsOn ?? []) {
      const depQuarter = assignment[depId]
      if (depQuarter == null || depQuarter >= quarter) {
        dependencyViolations++
      }
    }
  }

  let budgetViolations = 0
  for (const cost of quarterCosts.values()) {
    if (cost > BUDGET_PER_QUARTER) budgetViolations++
  }

  const riskReductionPerDollar = totalCostSpent > 0 ? totalRiskReduced / totalCostSpent : 0
  const score = totalRiskReduced - dependencyViolations * DEPENDENCY_VIOLATION_PENALTY - budgetViolations * BUDGET_OVERAGE_PENALTY

  return { totalRiskReduced, totalCostSpent, riskReductionPerDollar, dependencyViolations, budgetViolations, score }
}
