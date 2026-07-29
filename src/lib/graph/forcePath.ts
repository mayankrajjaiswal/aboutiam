export interface GraphPoint {
  x: number
  y: number
}

interface EdgeLike {
  source: string
  target: string
}

/** BFS shortest path (directed, unweighted) from startId to targetId. Returns null if unreachable. */
export function findShortestPath(nodeIds: string[], edges: EdgeLike[], startId: string, targetId: string): string[] | null {
  if (!nodeIds.includes(startId) || !nodeIds.includes(targetId)) return null
  if (startId === targetId) return [startId]

  const adjacency = new Map<string, string[]>()
  nodeIds.forEach((id) => adjacency.set(id, []))
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target)
  }

  const visited = new Set<string>([startId])
  const queue: string[][] = [[startId]]

  while (queue.length > 0) {
    const path = queue.shift()!
    const last = path[path.length - 1]
    for (const neighbor of adjacency.get(last) ?? []) {
      if (visited.has(neighbor)) continue
      const nextPath = [...path, neighbor]
      if (neighbor === targetId) return nextPath
      visited.add(neighbor)
      queue.push(nextPath)
    }
  }

  return null
}

/**
 * Deterministic spring/repulsion force layout. Initial positions are placed on a circle
 * (index-based, no randomness) so the same graph always renders identically.
 */
export function computeForceLayout(
  nodeIds: string[],
  edges: EdgeLike[],
  width: number,
  height: number,
  iterations = 250
): Record<string, GraphPoint> {
  const n = nodeIds.length
  const positions: Record<string, GraphPoint> = {}
  const velocities: Record<string, GraphPoint> = {}

  nodeIds.forEach((id, i) => {
    const angle = n > 0 ? (2 * Math.PI * i) / n : 0
    const radius = Math.min(width, height) / 3
    positions[id] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    }
    velocities[id] = { x: 0, y: 0 }
  })

  if (n === 0) return positions

  const repulsionStrength = 2200
  const springStrength = 0.02
  const springLength = Math.min(width, height) / 4
  const damping = 0.85
  const margin = 24

  for (let iter = 0; iter < iterations; iter++) {
    const forces: Record<string, GraphPoint> = {}
    nodeIds.forEach((id) => (forces[id] = { x: 0, y: 0 }))

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodeIds[i]
        const b = nodeIds[j]
        const dx = positions[a].x - positions[b].x
        const dy = positions[a].y - positions[b].y
        const distSq = Math.max(dx * dx + dy * dy, 1)
        const dist = Math.sqrt(distSq)
        const force = repulsionStrength / distSq
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        forces[a].x += fx
        forces[a].y += fy
        forces[b].x -= fx
        forces[b].y -= fy
      }
    }

    for (const edge of edges) {
      const a = positions[edge.source]
      const b = positions[edge.target]
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const displacement = dist - springLength
      const fx = (dx / dist) * displacement * springStrength
      const fy = (dy / dist) * displacement * springStrength
      forces[edge.source].x += fx
      forces[edge.source].y += fy
      forces[edge.target].x -= fx
      forces[edge.target].y -= fy
    }

    nodeIds.forEach((id) => {
      velocities[id].x = (velocities[id].x + forces[id].x) * damping
      velocities[id].y = (velocities[id].y + forces[id].y) * damping
      positions[id].x = Math.max(margin, Math.min(width - margin, positions[id].x + velocities[id].x))
      positions[id].y = Math.max(margin, Math.min(height - margin, positions[id].y + velocities[id].y))
    })
  }

  return positions
}
