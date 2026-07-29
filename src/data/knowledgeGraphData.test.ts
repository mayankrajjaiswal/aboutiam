import { describe, it, expect } from 'vitest'
import { ENCYCLOPEDIA_TERMS } from './encyclopediaData'
import { STANDARDS } from './standardsData'
import { ARCHITECTURES } from './architectureData'
import {
  KNOWLEDGE_GRAPH_EDGES,
  KNOWLEDGE_GRAPH_NODES,
  getKnowledgeGraphNode,
  getNeighborIds,
} from './knowledgeGraphData'

describe('knowledgeGraphData', () => {
  it('has a non-trivial number of edges and nodes', () => {
    expect(KNOWLEDGE_GRAPH_EDGES.length).toBeGreaterThan(50)
    expect(KNOWLEDGE_GRAPH_NODES.length).toBeGreaterThan(30)
  })

  it('every edge id resolves to a real record in its source dataset (no typo\'d ids)', () => {
    const standardIds = new Set(STANDARDS.map((s) => s.id))
    const architectureIds = new Set(ARCHITECTURES.map((a) => a.id))
    const termIds = new Set(ENCYCLOPEDIA_TERMS.map((t) => t.id))

    for (const [a, b] of KNOWLEDGE_GRAPH_EDGES) {
      for (const id of [a, b]) {
        const [type, rawId] = id.split(':')
        if (type === 'standard') expect(standardIds.has(rawId), `missing standard: ${id}`).toBe(true)
        else if (type === 'architecture') expect(architectureIds.has(rawId), `missing architecture: ${id}`).toBe(true)
        else if (type === 'term') expect(termIds.has(rawId), `missing term: ${id}`).toBe(true)
        else throw new Error(`Unknown node type prefix on edge id: ${id}`)
      }
    }
  })

  it('has no self-loops or exact duplicate edges', () => {
    const seen = new Set<string>()
    for (const [a, b] of KNOWLEDGE_GRAPH_EDGES) {
      expect(a).not.toBe(b)
      const key = [a, b].sort().join('|')
      expect(seen.has(key), `duplicate edge: ${a} <-> ${b}`).toBe(false)
      seen.add(key)
    }
  })

  it('every node referenced by an edge is present in KNOWLEDGE_GRAPH_NODES with a resolved label/description/path', () => {
    for (const [a, b] of KNOWLEDGE_GRAPH_EDGES) {
      for (const id of [a, b]) {
        const node = getKnowledgeGraphNode(id)
        expect(node, `unresolved node: ${id}`).toBeDefined()
        expect(node!.label.length).toBeGreaterThan(0)
        expect(node!.description.length).toBeGreaterThan(0)
        expect(node!.path.startsWith('/')).toBe(true)
      }
    }
  })

  it('getNeighborIds returns both directions of an edge and no duplicates', () => {
    const neighbors = getNeighborIds('standard:oauth21')
    expect(neighbors).toContain('standard:oidc')
    expect(neighbors).toContain('term:oauth')
    expect(new Set(neighbors).size).toBe(neighbors.length)
  })

  it('getNeighborIds returns an empty array for an id with no edges', () => {
    expect(getNeighborIds('term:not-a-real-node')).toEqual([])
  })
})
