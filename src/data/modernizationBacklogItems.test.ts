import { describe, it, expect } from 'vitest'
import { MODERNIZATION_BACKLOG_ITEMS } from './modernizationBacklogItems'

function hasCycle(): boolean {
  const byId = new Map(MODERNIZATION_BACKLOG_ITEMS.map((i) => [i.id, i]))
  const visiting = new Set<string>()
  const visited = new Set<string>()

  function visit(id: string): boolean {
    if (visited.has(id)) return false
    if (visiting.has(id)) return true
    visiting.add(id)
    const item = byId.get(id)
    for (const depId of item?.dependsOn ?? []) {
      if (visit(depId)) return true
    }
    visiting.delete(id)
    visited.add(id)
    return false
  }

  return MODERNIZATION_BACKLOG_ITEMS.some((item) => visit(item.id))
}

/** Kahn's algorithm — returns a valid topological order, or null if one doesn't exist. */
function topologicalOrder(): string[] | null {
  const inDegree = new Map<string, number>(MODERNIZATION_BACKLOG_ITEMS.map((i) => [i.id, (i.dependsOn ?? []).length]))
  const queue = MODERNIZATION_BACKLOG_ITEMS.filter((i) => (i.dependsOn ?? []).length === 0).map((i) => i.id)
  const order: string[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    order.push(id)
    for (const item of MODERNIZATION_BACKLOG_ITEMS) {
      if ((item.dependsOn ?? []).includes(id)) {
        const next = (inDegree.get(item.id) ?? 0) - 1
        inDegree.set(item.id, next)
        if (next === 0) queue.push(item.id)
      }
    }
  }

  return order.length === MODERNIZATION_BACKLOG_ITEMS.length ? order : null
}

describe('Modernization Backlog Items', () => {
  it('has exactly 20 items', () => {
    expect(MODERNIZATION_BACKLOG_ITEMS.length).toBe(20)
  })

  it('has unique ids', () => {
    const ids = MODERNIZATION_BACKLOG_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every dependsOn id refers to a real item', () => {
    const ids = new Set(MODERNIZATION_BACKLOG_ITEMS.map((i) => i.id))
    for (const item of MODERNIZATION_BACKLOG_ITEMS) {
      for (const depId of item.dependsOn ?? []) {
        expect(ids.has(depId)).toBe(true)
      }
    }
  })

  it('has no circular dependsOn chains', () => {
    expect(hasCycle()).toBe(false)
  })

  it('has a valid dependency-respecting full sequencing (solvability check)', () => {
    const order = topologicalOrder()
    expect(order).not.toBeNull()
    expect(order!.length).toBe(MODERNIZATION_BACKLOG_ITEMS.length)
  })

  it('every item has a positive cost and risk score', () => {
    for (const item of MODERNIZATION_BACKLOG_ITEMS) {
      expect(item.cost).toBeGreaterThan(0)
      expect(item.riskScore).toBeGreaterThan(0)
    }
  })
})
