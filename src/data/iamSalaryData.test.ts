import { describe, it, expect } from 'vitest'
import { IAM_SALARY_DATA, REGION_MULTIPLIERS, estimateCompensation, type SalaryRole, type SalarySeniority, type SalarySpecialization } from './iamSalaryData'

const VALID_ROLES: SalaryRole[] = ['Engineer', 'Architect', 'Analyst', 'Manager']
const VALID_SENIORITIES: SalarySeniority[] = ['Junior', 'Mid', 'Senior', 'Staff/Principal']
const VALID_SPECIALIZATIONS: SalarySpecialization[] = ['Workforce IAM', 'CIAM', 'PAM', 'IGA']

describe('IAM_SALARY_DATA', () => {
  it('has unique entry ids', () => {
    const ids = IAM_SALARY_DATA.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every entry has a valid role/seniority/specialization combination', () => {
    for (const entry of IAM_SALARY_DATA) {
      expect(VALID_ROLES).toContain(entry.role)
      expect(VALID_SENIORITIES).toContain(entry.seniority)
      expect(VALID_SPECIALIZATIONS).toContain(entry.specialization)
    }
  })

  it('every entry has a non-empty citation and lastVerifiedDate', () => {
    for (const entry of IAM_SALARY_DATA) {
      expect(entry.citation.length).toBeGreaterThan(0)
      expect(entry.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('percentile ranges are strictly increasing (p25 < p50 < p75)', () => {
    for (const entry of IAM_SALARY_DATA) {
      expect(entry.p25).toBeLessThan(entry.p50)
      expect(entry.p50).toBeLessThan(entry.p75)
    }
  })

  it('covers at least 3 of the 4 roles', () => {
    const roles = new Set(IAM_SALARY_DATA.map((e) => e.role))
    expect(roles.size).toBeGreaterThanOrEqual(3)
  })

  it('covers all 4 specializations', () => {
    const specializations = new Set(IAM_SALARY_DATA.map((e) => e.specialization))
    expect(specializations.size).toBe(4)
  })
})

describe('REGION_MULTIPLIERS', () => {
  it('has a national-average baseline entry with multiplier 1.0', () => {
    expect(REGION_MULTIPLIERS.some((r) => r.multiplier === 1.0)).toBe(true)
  })

  it('every multiplier is a positive number', () => {
    for (const r of REGION_MULTIPLIERS) {
      expect(r.multiplier).toBeGreaterThan(0)
    }
  })
})

describe('estimateCompensation', () => {
  it('scales all three percentiles by the region multiplier', () => {
    const entry = IAM_SALARY_DATA[0]
    const result = estimateCompensation(entry, 2)
    expect(result.p25).toBe(Math.round(entry.p25 * 2))
    expect(result.p50).toBe(Math.round(entry.p50 * 2))
    expect(result.p75).toBe(Math.round(entry.p75 * 2))
  })

  it('a multiplier of 1.0 returns the base values unchanged', () => {
    const entry = IAM_SALARY_DATA[0]
    const result = estimateCompensation(entry, 1.0)
    expect(result).toEqual({ p25: entry.p25, p50: entry.p50, p75: entry.p75 })
  })

  it('preserves p25 < p50 < p75 ordering after scaling', () => {
    for (const entry of IAM_SALARY_DATA) {
      const result = estimateCompensation(entry, 0.32)
      expect(result.p25).toBeLessThan(result.p50)
      expect(result.p50).toBeLessThan(result.p75)
    }
  })
})
