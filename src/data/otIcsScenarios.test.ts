import { describe, it, expect } from 'vitest'
import { OT_ICS_TOPOLOGY } from './otIcsScenarios'
import { computeReachableNodes } from '../lib/tools/otIcsSegmentation'

describe('OT_ICS_TOPOLOGY', () => {
  it('is a valid connected graph — every node is reachable from any other in flat mode', () => {
    for (const node of OT_ICS_TOPOLOGY.nodes) {
      const reachable = computeReachableNodes(OT_ICS_TOPOLOGY, node.id, 'flat')
      expect(reachable.length).toBe(OT_ICS_TOPOLOGY.nodes.length)
    }
  })

  it('every edge references real node ids', () => {
    const ids = new Set(OT_ICS_TOPOLOGY.nodes.map((n) => n.id))
    for (const edge of OT_ICS_TOPOLOGY.edges) {
      expect(ids.has(edge.fromId)).toBe(true)
      expect(ids.has(edge.toId)).toBe(true)
    }
  })

  it('has at least one node flagged unable to authenticate (the whole OT/ICS premise)', () => {
    expect(OT_ICS_TOPOLOGY.nodes.some((n) => !n.canAuthenticate)).toBe(true)
  })

  it('has at least one identity-verified node capable of bridging zones', () => {
    expect(OT_ICS_TOPOLOGY.nodes.some((n) => n.canAuthenticate)).toBe(true)
  })
})
