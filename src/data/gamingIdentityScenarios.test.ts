import { describe, it, expect } from 'vitest'
import { GAMING_IDENTITY_SCENARIOS, evaluateGamingScenario } from './gamingIdentityScenarios'

describe('GAMING_IDENTITY_SCENARIOS', () => {
  it('defines exactly the 3 documented scenarios', () => {
    expect(GAMING_IDENTITY_SCENARIOS.map((s) => s.id)).toEqual(['account_linking', 'smurf_detection', 'wagering_kyc'])
  })

  it('every scenario has at least one signal with a non-empty label and description', () => {
    for (const scenario of GAMING_IDENTITY_SCENARIOS) {
      expect(scenario.signals.length).toBeGreaterThan(0)
      for (const signal of scenario.signals) {
        expect(signal.label.length).toBeGreaterThan(0)
        expect(signal.description.length).toBeGreaterThan(0)
      }
    }
  })

  it('has no duplicate signal ids within a scenario', () => {
    for (const scenario of GAMING_IDENTITY_SCENARIOS) {
      const ids = scenario.signals.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('evaluateGamingScenario — account_linking', () => {
  it('propagates a ban to every linked platform', () => {
    const outcome = evaluateGamingScenario('account_linking', ['console_linked', 'pc_linked', 'mobile_linked', 'ban_issued'])
    expect(outcome.triggered).toBe(true)
    expect(outcome.headline).toContain('3')
  })

  it('propagates a ban to exactly one linked platform', () => {
    const outcome = evaluateGamingScenario('account_linking', ['console_linked', 'ban_issued'])
    expect(outcome.triggered).toBe(true)
    expect(outcome.headline).toContain('1')
  })

  it('does not propagate when no accounts are linked', () => {
    const outcome = evaluateGamingScenario('account_linking', ['ban_issued'])
    expect(outcome.triggered).toBe(false)
  })

  it('does nothing when no ban has been issued, regardless of linking', () => {
    const outcome = evaluateGamingScenario('account_linking', ['console_linked', 'pc_linked', 'mobile_linked'])
    expect(outcome.triggered).toBe(false)
  })
})

describe('evaluateGamingScenario — smurf_detection', () => {
  it('flags evasion when device fingerprint and behavioral pattern both match (80% confidence)', () => {
    const outcome = evaluateGamingScenario('smurf_detection', ['device_fingerprint_match', 'behavioral_pattern_match'])
    expect(outcome.triggered).toBe(true)
    expect(outcome.confidence).toBe(80)
  })

  it('flags evasion on device fingerprint match alone (45% confidence is below threshold)', () => {
    const outcome = evaluateGamingScenario('smurf_detection', ['device_fingerprint_match'])
    expect(outcome.confidence).toBe(45)
    expect(outcome.triggered).toBe(false)
  })

  it('flags evasion when all 3 signals are present (100% confidence)', () => {
    const outcome = evaluateGamingScenario('smurf_detection', [
      'device_fingerprint_match',
      'behavioral_pattern_match',
      'fresh_account_after_ban',
    ])
    expect(outcome.confidence).toBe(100)
    expect(outcome.triggered).toBe(true)
  })

  it('does not flag when no signals are present (0% confidence)', () => {
    const outcome = evaluateGamingScenario('smurf_detection', [])
    expect(outcome.confidence).toBe(0)
    expect(outcome.triggered).toBe(false)
  })
})

describe('evaluateGamingScenario — wagering_kyc', () => {
  it('requires re-verification when any single risk signal fires', () => {
    expect(evaluateGamingScenario('wagering_kyc', ['large_withdrawal']).triggered).toBe(true)
    expect(evaluateGamingScenario('wagering_kyc', ['new_device']).triggered).toBe(true)
    expect(evaluateGamingScenario('wagering_kyc', ['geo_change']).triggered).toBe(true)
  })

  it('requires no re-verification when no risk signals fire', () => {
    expect(evaluateGamingScenario('wagering_kyc', []).triggered).toBe(false)
  })

  it('counts every fired risk signal in the detail text', () => {
    const outcome = evaluateGamingScenario('wagering_kyc', ['large_withdrawal', 'new_device', 'geo_change'])
    expect(outcome.detail).toContain('3')
  })
})
