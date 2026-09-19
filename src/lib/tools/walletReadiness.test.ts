import { describe, it, expect } from 'vitest'
import { computeWalletReadiness, type WalletReadinessInputs } from './walletReadiness'

function inputs(overrides: Partial<WalletReadinessInputs> = {}): WalletReadinessInputs {
  return {
    sectors: [],
    roles: [],
    jurisdictions: [],
    ...overrides,
  }
}

describe('computeWalletReadiness', () => {
  it('returns an empty checklist when no roles are selected', () => {
    const report = computeWalletReadiness(inputs())
    expect(report.applicableChecklist).toHaveLength(0)
  })

  it('returns only the verifier checklist when only verifier is selected', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier'] }))
    expect(report.applicableChecklist.every((item) => item.role === 'verifier')).toBe(true)
    expect(report.applicableChecklist.length).toBeGreaterThan(0)
  })

  it('combines checklists across multiple selected roles', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier', 'issuer'] }))
    const roles = new Set(report.applicableChecklist.map((item) => item.role))
    expect(roles.has('verifier')).toBe(true)
    expect(roles.has('issuer')).toBe(true)
    expect(roles.has('holder')).toBe(false)
  })

  it('includes all three role checklists when all roles are selected', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier', 'issuer', 'holder'] }))
    const roles = new Set(report.applicableChecklist.map((item) => item.role))
    expect(roles.size).toBe(3)
  })

  it('filters the standards profile to only standards relevant to selected roles', () => {
    const report = computeWalletReadiness(inputs({ roles: ['issuer'] }))
    expect(report.standardsProfile.some((s) => s.standardId === 'openid4vci')).toBe(true)
    expect(report.standardsProfile.some((s) => s.standardId === 'openid4vc')).toBe(false)
  })

  it('returns no wallet-related deadlines when no jurisdiction is selected', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier'] }))
    expect(report.relevantDeadlines).toHaveLength(0)
  })

  it('returns EU wallet deadlines when jurisdiction includes the EU', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier'], jurisdictions: ['eu-only'] }))
    expect(report.relevantDeadlines.length).toBeGreaterThan(0)
    expect(report.relevantDeadlines.every((d) => d.jurisdiction === 'European Union')).toBe(true)
  })

  it('sorts relevant deadlines chronologically', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier'], jurisdictions: ['eu-only'] }))
    const dates = report.relevantDeadlines.map((d) => d.deadlineDate)
    const sorted = [...dates].sort()
    expect(dates).toEqual(sorted)
  })

  it('flags a likely acceptance obligation for a verifier in an obligated sector within EU scope', () => {
    const report = computeWalletReadiness(
      inputs({ roles: ['verifier'], sectors: ['banking-financial-services'], jurisdictions: ['eu-only'] }),
    )
    expect(report.acceptanceObligationLikely).toBe(true)
  })

  it('does not flag an acceptance obligation for a sector not in the obligated list', () => {
    const report = computeWalletReadiness(
      inputs({ roles: ['verifier'], sectors: ['other-private-sector'], jurisdictions: ['eu-only'] }),
    )
    expect(report.acceptanceObligationLikely).toBe(false)
  })

  it('does not flag an acceptance obligation when the role is not verifier', () => {
    const report = computeWalletReadiness(
      inputs({ roles: ['issuer'], sectors: ['banking-financial-services'], jurisdictions: ['eu-only'] }),
    )
    expect(report.acceptanceObligationLikely).toBe(false)
  })

  it('does not flag an acceptance obligation for a US-only footprint', () => {
    const report = computeWalletReadiness(
      inputs({ roles: ['verifier'], sectors: ['banking-financial-services'], jurisdictions: ['us-only'] }),
    )
    expect(report.acceptanceObligationLikely).toBe(false)
  })

  it('treats a global footprint as including EU scope for deadlines', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier'], jurisdictions: ['global'] }))
    expect(report.relevantDeadlines.length).toBeGreaterThan(0)
  })

  it('produces a human-readable summary mentioning the selected roles', () => {
    const report = computeWalletReadiness(inputs({ roles: ['verifier', 'holder'] }))
    expect(report.summary).toContain('verifier')
    expect(report.summary).toContain('holder')
  })
})
