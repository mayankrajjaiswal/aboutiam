import { describe, it, expect } from 'vitest'
import { INCIDENT_COMMANDER_SCENARIOS, type IncidentScenario } from './incidentCommanderScenarios'
import { BULLETINS } from './bulletinsData'

const MAX_DECISIONS = 5

function resolvePath(scenario: IncidentScenario, nodeId: string, decisionIndex: number, depth = 0): void {
  if (depth > MAX_DECISIONS) {
    throw new Error(`Scenario "${scenario.id}" did not terminate within ${MAX_DECISIONS} decisions`)
  }
  const node = scenario.nodes.find((n) => n.id === nodeId)
  expect(node, `node "${nodeId}" referenced but not defined in scenario "${scenario.id}"`).toBeTruthy()
  const decision = node!.decisions[decisionIndex]
  expect(decision).toBeTruthy()

  if (decision.next.startsWith('outcome:')) {
    const outcomeId = decision.next.slice('outcome:'.length)
    expect(scenario.outcomes[outcomeId as keyof typeof scenario.outcomes], `outcome "${outcomeId}" undefined in scenario "${scenario.id}"`).toBeTruthy()
    return
  }

  // Recurse into every decision from the next node to prove the whole subtree terminates.
  const nextNode = scenario.nodes.find((n) => n.id === decision.next)
  expect(nextNode, `node "${decision.next}" referenced but not defined in scenario "${scenario.id}"`).toBeTruthy()
  nextNode!.decisions.forEach((_, i) => resolvePath(scenario, decision.next, i, depth + 1))
}

describe('INCIDENT_COMMANDER_SCENARIOS', () => {
  it('every scenario has at least 2 nodes and cross-references a real bulletin', () => {
    for (const scenario of INCIDENT_COMMANDER_SCENARIOS) {
      expect(scenario.nodes.length).toBeGreaterThanOrEqual(2)
      expect(BULLETINS.some((b) => b.id === scenario.bulletinId)).toBe(true)
    }
  })

  it('every node has at least 2 decisions, and no decision list is empty', () => {
    for (const scenario of INCIDENT_COMMANDER_SCENARIOS) {
      for (const node of scenario.nodes) {
        expect(node.decisions.length).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('the decision tree is fully connected — every referenced node/outcome exists, and every path terminates within a bounded number of decisions', () => {
    for (const scenario of INCIDENT_COMMANDER_SCENARIOS) {
      const startNode = scenario.nodes.find((n) => n.id === scenario.startNodeId)
      expect(startNode, `startNodeId "${scenario.startNodeId}" not found in scenario "${scenario.id}"`).toBeTruthy()
      startNode!.decisions.forEach((_, i) => resolvePath(scenario, scenario.startNodeId, i))
    }
  })

  it('every node (except unreachable dead code) is reachable from the start node', () => {
    for (const scenario of INCIDENT_COMMANDER_SCENARIOS) {
      const reachable = new Set<string>([scenario.startNodeId])
      const queue = [scenario.startNodeId]
      while (queue.length > 0) {
        const current = queue.pop()!
        const node = scenario.nodes.find((n) => n.id === current)
        for (const decision of node?.decisions ?? []) {
          if (!decision.next.startsWith('outcome:') && !reachable.has(decision.next)) {
            reachable.add(decision.next)
            queue.push(decision.next)
          }
        }
      }
      expect(reachable.size).toBe(scenario.nodes.length)
    }
  })
})
