import { describe, it, expect } from 'vitest'
import { findShortestPath, computeForceLayout } from './forcePath'
import { ATTACK_PATH_SCENARIOS } from '../../data/attackPathScenarios'

const FIXTURE_NODES = ['a', 'b', 'c', 'd', 'e']
const FIXTURE_EDGES = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
  { source: 'a', target: 'd' },
  { source: 'd', target: 'e' },
  { source: 'e', target: 'c' }
]

describe('findShortestPath', () => {
  it('finds the shorter of two routes to the same target', () => {
    const path = findShortestPath(FIXTURE_NODES, FIXTURE_EDGES, 'a', 'c')
    expect(path).toEqual(['a', 'b', 'c'])
  })

  it('returns a single-node path when start === target', () => {
    expect(findShortestPath(FIXTURE_NODES, FIXTURE_EDGES, 'a', 'a')).toEqual(['a'])
  })

  it('returns null when there is no path', () => {
    const nodes = ['x', 'y']
    const edges: { source: string; target: string }[] = []
    expect(findShortestPath(nodes, edges, 'x', 'y')).toBeNull()
  })

  it('returns null for an unknown start or target id', () => {
    expect(findShortestPath(FIXTURE_NODES, FIXTURE_EDGES, 'nope', 'c')).toBeNull()
    expect(findShortestPath(FIXTURE_NODES, FIXTURE_EDGES, 'a', 'nope')).toBeNull()
  })

  it('ignores edges that only run the wrong direction', () => {
    const nodes = ['a', 'b']
    const edges = [{ source: 'b', target: 'a' }]
    expect(findShortestPath(nodes, edges, 'a', 'b')).toBeNull()
  })

  it('never revisits a node', () => {
    const nodes = ['a', 'b', 'c']
    const edges = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'a' },
      { source: 'b', target: 'c' }
    ]
    const path = findShortestPath(nodes, edges, 'a', 'c')
    expect(path).toEqual(['a', 'b', 'c'])
    expect(new Set(path)).toHaveProperty('size', path?.length)
  })

  for (const scenario of ATTACK_PATH_SCENARIOS) {
    it(`matches the authored shortestPath for scenario "${scenario.id}"`, () => {
      const nodeIds = scenario.nodes.map((n) => n.id)
      const computed = findShortestPath(nodeIds, scenario.edges, scenario.startNodeId, scenario.targetNodeId)
      expect(computed).toEqual(scenario.shortestPath)
    })
  }
})

describe('computeForceLayout', () => {
  it('returns a finite position for every node', () => {
    const positions = computeForceLayout(FIXTURE_NODES, FIXTURE_EDGES, 800, 600, 50)
    for (const id of FIXTURE_NODES) {
      expect(Number.isFinite(positions[id].x)).toBe(true)
      expect(Number.isFinite(positions[id].y)).toBe(true)
    }
  })

  it('keeps every node within the [margin, dimension - margin] bounds', () => {
    const width = 800
    const height = 600
    const positions = computeForceLayout(FIXTURE_NODES, FIXTURE_EDGES, width, height, 100)
    for (const id of FIXTURE_NODES) {
      expect(positions[id].x).toBeGreaterThanOrEqual(24)
      expect(positions[id].x).toBeLessThanOrEqual(width - 24)
      expect(positions[id].y).toBeGreaterThanOrEqual(24)
      expect(positions[id].y).toBeLessThanOrEqual(height - 24)
    }
  })

  it('is deterministic across runs with identical inputs', () => {
    const first = computeForceLayout(FIXTURE_NODES, FIXTURE_EDGES, 800, 600, 80)
    const second = computeForceLayout(FIXTURE_NODES, FIXTURE_EDGES, 800, 600, 80)
    expect(first).toEqual(second)
  })

  it('handles an empty node list without throwing', () => {
    expect(computeForceLayout([], [], 800, 600)).toEqual({})
  })

  it('handles a single node without throwing', () => {
    const positions = computeForceLayout(['solo'], [], 800, 600, 10)
    expect(Number.isFinite(positions.solo.x)).toBe(true)
  })

  it('spreads connected nodes further apart than perfectly overlapping start positions', () => {
    const positions = computeForceLayout(FIXTURE_NODES, FIXTURE_EDGES, 800, 600, 150)
    const dx = positions.a.x - positions.b.x
    const dy = positions.a.y - positions.b.y
    expect(Math.sqrt(dx * dx + dy * dy)).toBeGreaterThan(0)
  })
})
