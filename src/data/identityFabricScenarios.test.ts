import { describe, it, expect } from 'vitest'
import { IDENTITY_FABRIC_SCENARIOS } from './identityFabricScenarios'

describe('IDENTITY_FABRIC_SCENARIOS', () => {
  it('has at least 3 scenarios with unique ids', () => {
    expect(IDENTITY_FABRIC_SCENARIOS.length).toBeGreaterThanOrEqual(3)
    const ids = IDENTITY_FABRIC_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every scenario has mismatched app/idp protocols (the whole point of needing orchestration)', () => {
    for (const scenario of IDENTITY_FABRIC_SCENARIOS) {
      expect(scenario.appProtocol).not.toBe(scenario.idpProtocol)
    }
  })

  it('every scenario has at least 3 ordered translation steps', () => {
    for (const scenario of IDENTITY_FABRIC_SCENARIOS) {
      expect(scenario.translationSteps.length).toBeGreaterThanOrEqual(3)
    }
  })
})
