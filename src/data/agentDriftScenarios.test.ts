import { describe, expect, it } from 'vitest'
import { AGENT_DRIFT_SCENARIOS, getDriftScenarioById } from './agentDriftScenarios'

describe('agentDriftScenarios data integrity', () => {
  it('has at least 4 scenarios with no duplicate ids', () => {
    expect(AGENT_DRIFT_SCENARIOS.length).toBeGreaterThanOrEqual(4)
    const ids = AGENT_DRIFT_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every scenario has a non-empty declaredTask and at least 3 actions', () => {
    for (const s of AGENT_DRIFT_SCENARIOS) {
      expect(s.declaredTask.length).toBeGreaterThan(15)
      expect(s.actions.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('every scenario\'s actions are in ascending time order', () => {
    for (const s of AGENT_DRIFT_SCENARIOS) {
      for (let i = 1; i < s.actions.length; i++) {
        expect(s.actions[i].timeOffsetSeconds).toBeGreaterThan(s.actions[i - 1].timeOffsetSeconds)
      }
    }
  })

  it('every scenario starts with at least one in-scope action', () => {
    for (const s of AGENT_DRIFT_SCENARIOS) {
      expect(s.actions[0].driftLevel).toBe('in-scope')
    }
  })

  it('every scenario escalates to at least one critical action', () => {
    for (const s of AGENT_DRIFT_SCENARIOS) {
      expect(s.actions.some((a) => a.driftLevel === 'critical')).toBe(true)
    }
  })

  it('damageOccursAt matches the timeOffsetSeconds of a real action in the scenario', () => {
    for (const s of AGENT_DRIFT_SCENARIOS) {
      expect(s.actions.some((a) => a.timeOffsetSeconds === s.damageOccursAt)).toBe(true)
    }
  })

  it('has a positive revocationPropagationLagSeconds on every entry', () => {
    for (const s of AGENT_DRIFT_SCENARIOS) {
      expect(s.revocationPropagationLagSeconds).toBeGreaterThan(0)
    }
  })
})

describe('getDriftScenarioById', () => {
  it('returns the matching scenario', () => {
    expect(getDriftScenarioById('refund-agent-drift')?.title).toBe('Refund Processing Agent')
  })
})
