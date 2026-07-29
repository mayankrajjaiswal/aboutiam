import { describe, it, expect } from 'vitest'
import { FAPI2_SCENARIOS } from './fapi2Scenarios'

const VALID_CONTROL_KEYS = ['par', 'senderConstrainedToken', 'signedResponse']

describe('FAPI2_SCENARIOS', () => {
  it('has exactly 3 scenarios, one per FAPI 2.0 control', () => {
    expect(FAPI2_SCENARIOS.length).toBe(3)
  })

  it('has unique ids', () => {
    const ids = FAPI2_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique controlKeys covering all 3 defined controls', () => {
    const keys = FAPI2_SCENARIOS.map((s) => s.controlKey)
    expect(new Set(keys).size).toBe(keys.length)
    for (const key of VALID_CONTROL_KEYS) {
      expect(keys).toContain(key)
    }
  })

  it('every scenario has non-empty narrative fields for both the attack-succeeds and attack-blocked branches', () => {
    for (const scenario of FAPI2_SCENARIOS) {
      expect(scenario.title.length).toBeGreaterThan(0)
      expect(scenario.controlName.length).toBeGreaterThan(0)
      expect(scenario.attackDescription.length).toBeGreaterThan(0)
      expect(scenario.attackSuccessLog.length).toBeGreaterThan(0)
      expect(scenario.attackBlockedLog.length).toBeGreaterThan(0)
      expect(scenario.attackSuccessLog).not.toBe(scenario.attackBlockedLog)
    }
  })
})
