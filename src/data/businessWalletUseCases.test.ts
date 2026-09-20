import { describe, expect, it } from 'vitest'
import { BUSINESS_WALLET_USE_CASES, getUseCasesByRole, getUseCaseById } from './businessWalletUseCases'

describe('businessWalletUseCases data integrity', () => {
  it('has at least 8 use cases with no duplicate ids', () => {
    expect(BUSINESS_WALLET_USE_CASES.length).toBeGreaterThanOrEqual(8)
    const ids = BUSINESS_WALLET_USE_CASES.map((u) => u.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every use case has a non-empty problemToday and walletApproach', () => {
    for (const u of BUSINESS_WALLET_USE_CASES) {
      expect(u.problemToday.length).toBeGreaterThan(30)
      expect(u.walletApproach.length).toBeGreaterThan(30)
    }
  })

  it('every use case has at least one credential type, standard, and governance challenge', () => {
    for (const u of BUSINESS_WALLET_USE_CASES) {
      expect(u.credentialTypes.length).toBeGreaterThan(0)
      expect(u.standardsProfile.length).toBeGreaterThan(0)
      expect(u.governanceChallenges.length).toBeGreaterThan(0)
    }
  })

  it('every use case has a non-empty businessValue and at least one related lab', () => {
    for (const u of BUSINESS_WALLET_USE_CASES) {
      expect(u.businessValue.length).toBeGreaterThan(20)
      expect(u.relatedLabs.length).toBeGreaterThan(0)
    }
  })

  it('has a valid role on every entry', () => {
    const validRoles = new Set(['holder', 'issuer', 'verifier', 'multiple'])
    for (const u of BUSINESS_WALLET_USE_CASES) {
      expect(validRoles.has(u.role)).toBe(true)
    }
  })

  it('covers more than one role (not all holder-only)', () => {
    const roles = new Set(BUSINESS_WALLET_USE_CASES.map((u) => u.role))
    expect(roles.size).toBeGreaterThan(1)
  })
})

describe('getUseCasesByRole / getUseCaseById', () => {
  it('filters by role', () => {
    const issuerCases = getUseCasesByRole('issuer')
    for (const u of issuerCases) expect(u.role).toBe('issuer')
  })

  it('returns the matching use case by id', () => {
    expect(getUseCaseById('company-registration-credential')?.sector).toContain('B2B')
  })
})
