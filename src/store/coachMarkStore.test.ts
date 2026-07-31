import { describe, it, expect, beforeEach } from 'vitest'
import { useCoachMarkStore } from './coachMarkStore'

describe('useCoachMarkStore', () => {
  beforeEach(() => {
    useCoachMarkStore.setState({ seenFeatureIds: [] })
  })

  it('starts with no feature marked seen', () => {
    expect(useCoachMarkStore.getState().isSeen('attack-path-graph')).toBe(false)
  })

  it('marks a feature seen and tracks features independently', () => {
    useCoachMarkStore.getState().markSeen('attack-path-graph')
    expect(useCoachMarkStore.getState().isSeen('attack-path-graph')).toBe(true)
    expect(useCoachMarkStore.getState().isSeen('role-mining-workbench')).toBe(false)
  })

  it('marking an already-seen feature again does not duplicate it', () => {
    useCoachMarkStore.getState().markSeen('attack-path-graph')
    useCoachMarkStore.getState().markSeen('attack-path-graph')
    expect(useCoachMarkStore.getState().seenFeatureIds).toEqual(['attack-path-graph'])
  })

  it('resetAll clears every seen feature', () => {
    useCoachMarkStore.getState().markSeen('attack-path-graph')
    useCoachMarkStore.getState().markSeen('role-mining-workbench')
    useCoachMarkStore.getState().resetAll()
    expect(useCoachMarkStore.getState().seenFeatureIds).toEqual([])
  })
})
