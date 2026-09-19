import { describe, expect, it } from 'vitest'
import { AI_CONTROL_PLANE_FUNCTIONS, getFunctionById } from './aiControlPlaneFunctions'

describe('aiControlPlaneFunctions data integrity', () => {
  it('has exactly the 4 loop functions in order 1-4', () => {
    expect(AI_CONTROL_PLANE_FUNCTIONS).toHaveLength(4)
    expect(AI_CONTROL_PLANE_FUNCTIONS.map((f) => f.order)).toEqual([1, 2, 3, 4])
    expect(AI_CONTROL_PLANE_FUNCTIONS.map((f) => f.id)).toEqual(['discover', 'decide', 'enforce', 'observe'])
  })

  it('every function has a non-empty question, description, and classic analogue', () => {
    for (const f of AI_CONTROL_PLANE_FUNCTIONS) {
      expect(f.question.endsWith('?')).toBe(true)
      expect(f.description.length).toBeGreaterThan(30)
      expect(f.classicAnalogue.length).toBeGreaterThan(10)
      expect(f.capabilities.length).toBeGreaterThan(0)
      expect(f.feedsFrom.length).toBeGreaterThan(10)
    }
  })

  it('the loop closes: observe feeds discover', () => {
    const observe = getFunctionById('observe')
    const discover = getFunctionById('discover')
    expect(discover?.feedsFrom.toLowerCase()).toContain('observe')
    expect(observe).toBeDefined()
  })
})
