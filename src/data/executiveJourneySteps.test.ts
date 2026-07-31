import { describe, it, expect } from 'vitest'
import { EXECUTIVE_JOURNEY_STEPS } from './executiveJourneySteps'
import { ROUTE_META } from '../routeMeta'

const knownPaths = new Set(ROUTE_META.map((r) => r.path))

describe('EXECUTIVE_JOURNEY_STEPS', () => {
  it('has at least 2 steps with non-empty labels', () => {
    expect(EXECUTIVE_JOURNEY_STEPS.length).toBeGreaterThanOrEqual(2)
    for (const step of EXECUTIVE_JOURNEY_STEPS) {
      expect(step.label.length).toBeGreaterThan(0)
    }
  })

  it("every step's path resolves to a real, currently-registered route (guards against a future route rename silently breaking the breadcrumb)", () => {
    for (const step of EXECUTIVE_JOURNEY_STEPS) {
      const [pathname] = step.path.split('?')
      expect(knownPaths.has(pathname)).toBe(true)
    }
  })

  it('has no duplicate paths', () => {
    const paths = EXECUTIVE_JOURNEY_STEPS.map((s) => s.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
