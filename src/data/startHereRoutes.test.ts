import { describe, it, expect } from 'vitest'
import { START_HERE_GOALS } from './startHereRoutes'
import { ROUTE_META } from '../routeMeta'

const knownPaths = new Set(ROUTE_META.map((r) => r.path))

describe('START_HERE_GOALS', () => {
  it("every goal's step resolves to a real, currently-registered route", () => {
    for (const goal of START_HERE_GOALS) {
      for (const step of goal.steps) {
        const [pathname] = step.path.split('?')
        expect(knownPaths.has(pathname)).toBe(true)
      }
    }
  })

  it('every goal has at least 2 steps and a unique id', () => {
    const ids = new Set<string>()
    for (const goal of START_HERE_GOALS) {
      expect(goal.steps.length).toBeGreaterThanOrEqual(2)
      expect(ids.has(goal.id)).toBe(false)
      ids.add(goal.id)
    }
  })
})
