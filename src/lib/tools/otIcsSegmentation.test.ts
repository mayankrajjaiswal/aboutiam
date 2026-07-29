import { describe, it, expect } from 'vitest'
import { computeReachableNodes } from './otIcsSegmentation'
import { OT_ICS_TOPOLOGY } from '../../data/otIcsScenarios'

describe('computeReachableNodes', () => {
  it('flat mode reaches every node in the topology from a compromised HMI', () => {
    const reachable = computeReachableNodes(OT_ICS_TOPOLOGY, 'hmi-1', 'flat')
    expect(reachable.length).toBe(OT_ICS_TOPOLOGY.nodes.length)
  })

  it('segmented mode strictly reduces the number of reachable nodes from the same compromise point', () => {
    const flatReachable = computeReachableNodes(OT_ICS_TOPOLOGY, 'hmi-1', 'flat')
    const segmentedReachable = computeReachableNodes(OT_ICS_TOPOLOGY, 'hmi-1', 'segmented')
    expect(segmentedReachable.length).toBeLessThan(flatReachable.length)
  })

  it('segmented mode traps an unauthenticated compromised HMI inside its own zone', () => {
    const segmentedReachable = computeReachableNodes(OT_ICS_TOPOLOGY, 'hmi-1', 'segmented').sort()
    expect(segmentedReachable).toEqual(['hmi-1', 'plc-1', 'sensor-1'].sort())
  })

  it('segmented mode still allows an identity-verified node to bridge zones', () => {
    const segmentedReachable = computeReachableNodes(OT_ICS_TOPOLOGY, 'engineering-workstation', 'segmented')
    expect(segmentedReachable).toContain('boundary-gateway')
  })

  it('always includes the start node itself', () => {
    expect(computeReachableNodes(OT_ICS_TOPOLOGY, 'sensor-2', 'segmented')).toContain('sensor-2')
  })
})
