import { describe, it, expect } from 'vitest'
import { ATTACK_PATH_SCENARIOS } from './attackPathScenarios'

describe('attackPathScenarios', () => {
  it('has at least 2 scenarios spanning both difficulty tiers', () => {
    expect(ATTACK_PATH_SCENARIOS.length).toBeGreaterThanOrEqual(2)
    const difficulties = new Set(ATTACK_PATH_SCENARIOS.map((s) => s.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)
  })

  it('has unique scenario ids', () => {
    const ids = ATTACK_PATH_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const scenario of ATTACK_PATH_SCENARIOS) {
    describe(`scenario: ${scenario.id}`, () => {
      it('has unique node ids', () => {
        const ids = scenario.nodes.map((n) => n.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('has unique edge ids', () => {
        const ids = scenario.edges.map((e) => e.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('every edge references existing nodes', () => {
        const nodeIds = new Set(scenario.nodes.map((n) => n.id))
        for (const edge of scenario.edges) {
          expect(nodeIds.has(edge.source)).toBe(true)
          expect(nodeIds.has(edge.target)).toBe(true)
        }
      })

      it('startNodeId and targetNodeId exist among nodes', () => {
        const nodeIds = new Set(scenario.nodes.map((n) => n.id))
        expect(nodeIds.has(scenario.startNodeId)).toBe(true)
        expect(nodeIds.has(scenario.targetNodeId)).toBe(true)
      })

      it('the target node is of type "target"', () => {
        const target = scenario.nodes.find((n) => n.id === scenario.targetNodeId)
        expect(target?.type).toBe('target')
      })

      it('shortestPath starts at startNodeId and ends at targetNodeId', () => {
        expect(scenario.shortestPath[0]).toBe(scenario.startNodeId)
        expect(scenario.shortestPath[scenario.shortestPath.length - 1]).toBe(scenario.targetNodeId)
      })

      it('shortestPath is a genuinely connected path through the edges array', () => {
        for (let i = 0; i < scenario.shortestPath.length - 1; i++) {
          const from = scenario.shortestPath[i]
          const to = scenario.shortestPath[i + 1]
          const hasEdge = scenario.edges.some((e) => e.source === from && e.target === to)
          expect(hasEdge).toBe(true)
        }
      })

      it('shortestPath visits no node twice', () => {
        expect(new Set(scenario.shortestPath).size).toBe(scenario.shortestPath.length)
      })

      it('every edge has a non-empty technique name', () => {
        for (const edge of scenario.edges) {
          expect(edge.technique.length).toBeGreaterThan(0)
        }
      })
    })
  }
})
