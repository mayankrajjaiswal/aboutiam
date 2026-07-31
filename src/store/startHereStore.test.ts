import { describe, it, expect, beforeEach } from 'vitest'
import { useStartHereStore } from './startHereStore'

describe('useStartHereStore', () => {
  beforeEach(() => {
    useStartHereStore.setState({ selectedGoalId: null, completedPaths: [] })
  })

  it('selecting a goal clears any prior progress', () => {
    useStartHereStore.getState().selectGoal('explore-labs')
    useStartHereStore.getState().toggleStepComplete('/playground')
    useStartHereStore.getState().selectGoal('assess-org')
    expect(useStartHereStore.getState().selectedGoalId).toBe('assess-org')
    expect(useStartHereStore.getState().completedPaths).toEqual([])
  })

  it('toggles a step complete and back to incomplete', () => {
    useStartHereStore.getState().toggleStepComplete('/assess')
    expect(useStartHereStore.getState().isStepComplete('/assess')).toBe(true)
    useStartHereStore.getState().toggleStepComplete('/assess')
    expect(useStartHereStore.getState().isStepComplete('/assess')).toBe(false)
  })

  it('reset clears the goal and progress', () => {
    useStartHereStore.getState().selectGoal('learn-fundamentals')
    useStartHereStore.getState().toggleStepComplete('/primer')
    useStartHereStore.getState().reset()
    expect(useStartHereStore.getState().selectedGoalId).toBeNull()
    expect(useStartHereStore.getState().completedPaths).toEqual([])
  })
})
