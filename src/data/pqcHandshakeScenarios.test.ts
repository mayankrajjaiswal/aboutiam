import { describe, it, expect } from 'vitest'
import { PQC_HANDSHAKE_SCENARIOS } from './pqcHandshakeScenarios'

describe('PQC Handshake Scenarios Data', () => {
  it('should have exactly 3 scenarios (classical, hybrid, pure)', () => {
    expect(PQC_HANDSHAKE_SCENARIOS).toHaveLength(3)
    const ids = PQC_HANDSHAKE_SCENARIOS.map(s => s.id)
    expect(ids).toContain('classical')
    expect(ids).toContain('hybrid')
    expect(ids).toContain('pure_pqc')
  })

  it('should have valid sizes and structures for each scenario', () => {
    PQC_HANDSHAKE_SCENARIOS.forEach(scenario => {
      expect(scenario.name).toBeDefined()
      expect(scenario.keyExchangeSize).toBeGreaterThan(0)
      expect(scenario.signatureSize).toBeGreaterThan(0)
      expect(scenario.certSize).toBeGreaterThan(0)
      expect(scenario.steps.length).toBeGreaterThan(0)
      
      scenario.steps.forEach(step => {
        expect(step.name).toBeDefined()
        expect(step.log).toBeDefined()
        expect(step.desc).toBeDefined()
        expect(step.packetSize).toBeGreaterThan(0)
        expect(['client', 'server', 'both']).toContain(step.wireHighlight)
      })
    })
  })
})
