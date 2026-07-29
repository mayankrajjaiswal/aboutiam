import { describe, it, expect } from 'vitest'
import { AGENT_IDENTITY_SCENARIOS } from './agentIdentityScenarios'

describe('Agent Identity Scenarios', () => {
  it('should have unique IDs', () => {
    const ids = AGENT_IDENTITY_SCENARIOS.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should contain a valid trap scope that exists in the starting scopes', () => {
    for (const scenario of AGENT_IDENTITY_SCENARIOS) {
      expect(scenario.startingScopes).toContain(scenario.trapScope)
      expect(scenario.trapExplanation.length).toBeGreaterThan(0)
    }
  })

  it('should have required tool scopes as subsets of starting scopes', () => {
    for (const scenario of AGENT_IDENTITY_SCENARIOS) {
      for (const requiredScope of scenario.requiredToolScopes) {
        expect(scenario.startingScopes).toContain(requiredScope)
      }
    }
  })
})
