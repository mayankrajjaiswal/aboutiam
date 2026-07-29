import { describe, it, expect } from 'vitest'
import { TACACS_COMMAND_RULES, EDUGAIN_INSTITUTIONS, RADIUS_SAMPLE_ATTRIBUTES } from './legacyFederationData'

describe('legacyFederationData', () => {
  it('has both an allowed and a disallowed TACACS+ command rule', () => {
    expect(TACACS_COMMAND_RULES.some((r) => r.allowed)).toBe(true)
    expect(TACACS_COMMAND_RULES.some((r) => !r.allowed)).toBe(true)
  })

  it('has at least 3 eduGAIN institutions with unique ids', () => {
    expect(EDUGAIN_INSTITUTIONS.length).toBeGreaterThanOrEqual(3)
    const ids = EDUGAIN_INSTITUTIONS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every eduGAIN institution has a home IdP endpoint URL', () => {
    for (const institution of EDUGAIN_INSTITUTIONS) {
      expect(institution.homeIdpEndpoint).toMatch(/^https:\/\//)
    }
  })

  it('has a non-empty RADIUS sample attribute list', () => {
    expect(RADIUS_SAMPLE_ATTRIBUTES.length).toBeGreaterThan(0)
  })
})
