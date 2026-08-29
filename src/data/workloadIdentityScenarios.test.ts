import { describe, it, expect } from 'vitest'
import { WORKLOAD_SCENARIOS } from './workloadIdentityScenarios'

describe('Workload Identity Scenarios Data', () => {
  it('should list configured federation partners', () => {
    expect(WORKLOAD_SCENARIOS.length).toBeGreaterThan(0)
    const first = WORKLOAD_SCENARIOS[0]
    expect(first.id).toBeDefined()
    expect(first.provider).toBeDefined()
    expect(first.cloud).toBeDefined()
  })
})
