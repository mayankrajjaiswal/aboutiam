import { describe, it, expect } from 'vitest'
import { CIEM_SCENARIOS, TOXIC_COMBINATION_RULES } from './ciemScenarios'
import { detectToxicCombinations } from '../lib/graph/ciemAnalysis'

describe('CIEM_SCENARIOS', () => {
  it('has at least 2 scenarios with unique ids', () => {
    expect(CIEM_SCENARIOS.length).toBeGreaterThanOrEqual(2)
    const ids = CIEM_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every edge references real node ids', () => {
    for (const scenario of CIEM_SCENARIOS) {
      const nodeIds = new Set(scenario.nodes.map((n) => n.id))
      for (const edge of scenario.edges) {
        expect(nodeIds.has(edge.source)).toBe(true)
        expect(nodeIds.has(edge.target)).toBe(true)
      }
    }
  })

  it('every scenario with "toxic-combo" in its id has its planted combination detectable', () => {
    const toxicScenarios = CIEM_SCENARIOS.filter((s) => s.id.includes('toxic-combo'))
    expect(toxicScenarios.length).toBeGreaterThan(0)
    for (const scenario of toxicScenarios) {
      const findings = detectToxicCombinations(scenario, TOXIC_COMBINATION_RULES)
      expect(findings.length).toBeGreaterThan(0)
    }
  })

  it('the clean scenario has zero detectable toxic combinations', () => {
    const clean = CIEM_SCENARIOS.find((s) => s.id === 'clean-least-privilege')!
    const findings = detectToxicCombinations(clean, TOXIC_COMBINATION_RULES)
    expect(findings).toHaveLength(0)
  })
})
