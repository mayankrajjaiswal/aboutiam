import type { OtIcsTopology } from '../../data/otIcsScenarios'

export type SegmentationMode = 'flat' | 'segmented'

/**
 * BFS lateral-movement simulation from a compromised node. In 'flat' mode
 * every edge is traversable. In 'segmented' (identity-based microsegmentation)
 * mode, an edge that crosses a zone boundary is only traversable if BOTH
 * endpoints can authenticate -- mirroring the real premise that most OT/ICS
 * field devices structurally cannot prove identity, so they get trapped
 * inside their local zone even after compromise.
 */
export function computeReachableNodes(topology: OtIcsTopology, startId: string, mode: SegmentationMode): string[] {
  const nodeById = new Map(topology.nodes.map((n) => [n.id, n]))
  const adjacency = new Map<string, string[]>()
  for (const node of topology.nodes) adjacency.set(node.id, [])
  for (const edge of topology.edges) {
    adjacency.get(edge.fromId)?.push(edge.toId)
    adjacency.get(edge.toId)?.push(edge.fromId)
  }

  const visited = new Set<string>([startId])
  const queue = [startId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const currentNode = nodeById.get(currentId)
    if (!currentNode) continue

    for (const neighborId of adjacency.get(currentId) ?? []) {
      if (visited.has(neighborId)) continue
      const neighborNode = nodeById.get(neighborId)
      if (!neighborNode) continue

      if (mode === 'flat') {
        visited.add(neighborId)
        queue.push(neighborId)
        continue
      }

      const sameZone = currentNode.zone === neighborNode.zone
      const bothCanAuthenticate = currentNode.canAuthenticate && neighborNode.canAuthenticate
      if (sameZone || bothCanAuthenticate) {
        visited.add(neighborId)
        queue.push(neighborId)
      }
    }
  }

  return Array.from(visited)
}
