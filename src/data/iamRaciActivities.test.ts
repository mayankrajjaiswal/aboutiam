import { describe, it, expect } from 'vitest'
import { IAM_RACI_ACTIVITIES } from './iamRaciActivities'

describe('IAM_RACI_ACTIVITIES', () => {
  it('has unique, non-empty ids and names', () => {
    const ids = new Set<string>()
    for (const activity of IAM_RACI_ACTIVITIES) {
      expect(activity.name.length).toBeGreaterThan(0)
      expect(ids.has(activity.id)).toBe(false)
      ids.add(activity.id)
    }
  })

  it('has at least 5 starter activities', () => {
    expect(IAM_RACI_ACTIVITIES.length).toBeGreaterThanOrEqual(5)
  })
})
