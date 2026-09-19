import { describe, expect, it } from 'vitest'
import { AGENT_GOVERNANCE_CAPABILITIES, getCapabilitiesByColumn } from './agentGovernanceCapabilities'

describe('agentGovernanceCapabilities data integrity', () => {
  it('has no duplicate ids', () => {
    const ids = AGENT_GOVERNANCE_CAPABILITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has 5-7 capabilities per column, both columns present', () => {
    const identity = getCapabilitiesByColumn('identity')
    const fabric = getCapabilitiesByColumn('fabric')
    expect(identity.length).toBeGreaterThanOrEqual(5)
    expect(identity.length).toBeLessThanOrEqual(7)
    expect(fabric.length).toBeGreaterThanOrEqual(5)
    expect(fabric.length).toBeLessThanOrEqual(7)
    expect(identity.length + fabric.length).toBe(AGENT_GOVERNANCE_CAPABILITIES.length)
  })

  it('every capability has a non-empty question, capability name, and description', () => {
    for (const c of AGENT_GOVERNANCE_CAPABILITIES) {
      expect(c.question.length).toBeGreaterThan(10)
      expect(c.question.endsWith('?')).toBe(true)
      expect(c.capability.length).toBeGreaterThan(3)
      expect(c.description.length).toBeGreaterThan(20)
    }
  })
})
