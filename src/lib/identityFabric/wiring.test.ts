import { describe, it, expect } from 'vitest'
import { attemptWiring } from './wiring'
import { IDENTITY_FABRIC_SCENARIOS } from '../../data/identityFabricScenarios'

const scenario = IDENTITY_FABRIC_SCENARIOS[0]

describe('attemptWiring', () => {
  it('fails with a clear error when the app is wired directly to the IdP, bypassing orchestration', () => {
    const result = attemptWiring([{ fromId: 'app', toId: 'idp' }], scenario)
    expect(result.success).toBe(false)
    expect(result.message).toContain('Orchestration Node is required')
    expect(result.translationLog).toHaveLength(0)
  })

  it('fails when wiring is incomplete (only one leg connected)', () => {
    const result = attemptWiring([{ fromId: 'app', toId: 'orchestration' }], scenario)
    expect(result.success).toBe(false)
    expect(result.message).toContain('Incomplete wiring')
  })

  it('succeeds when both legs are wired through the orchestration node', () => {
    const result = attemptWiring(
      [
        { fromId: 'app', toId: 'orchestration' },
        { fromId: 'orchestration', toId: 'idp' },
      ],
      scenario,
    )
    expect(result.success).toBe(true)
    expect(result.translationLog).toEqual(scenario.translationSteps)
  })

  it('succeeds regardless of edge direction (idp->orchestration, orchestration->app)', () => {
    const result = attemptWiring(
      [
        { fromId: 'orchestration', toId: 'app' },
        { fromId: 'idp', toId: 'orchestration' },
      ],
      scenario,
    )
    expect(result.success).toBe(true)
  })

  it('fails with no edges at all', () => {
    const result = attemptWiring([], scenario)
    expect(result.success).toBe(false)
    expect(result.translationLog).toHaveLength(0)
  })

  it('contains every expected translation step in order on success', () => {
    const result = attemptWiring(
      [
        { fromId: 'app', toId: 'orchestration' },
        { fromId: 'orchestration', toId: 'idp' },
      ],
      scenario,
    )
    expect(result.translationLog).toEqual(scenario.translationSteps)
  })
})
