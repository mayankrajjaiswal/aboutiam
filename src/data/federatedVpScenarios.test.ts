import { describe, it, expect } from 'vitest'
import { VP_SCENARIOS } from './federatedVpScenarios'

describe('Federated VP Scenarios Data', () => {
  it('should contain academic and untrusted scenario templates', () => {
    expect(VP_SCENARIOS.length).toBe(2)
    const first = VP_SCENARIOS[0]
    expect(first.issuerRegistry).toBe('DE_Registry')
    expect(first.claims.length).toBeGreaterThan(2)
  })
})
