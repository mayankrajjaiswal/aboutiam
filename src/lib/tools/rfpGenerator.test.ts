import { describe, it, expect } from 'vitest'
import { generateRfp, countTotalQuestions, type RfpAnswers } from './rfpGenerator'
import { RFP_QUESTION_BANK } from '../../data/rfpQuestionBank'

const BASE_ANSWERS: RfpAnswers = {
  orgSize: 'Mid-Market',
  industry: 'Financial Services',
  existingIdp: 'Okta',
  priorityCapabilities: [],
}

describe('generateRfp', () => {
  it('always includes every category\'s mandatory (baseline) questions regardless of capability answers', () => {
    const sections = generateRfp(BASE_ANSWERS)
    const baselineIds = RFP_QUESTION_BANK.filter((q) => q.applicableCapabilities.length === 0).map((q) => q.id)
    const includedIds = sections.flatMap((s) => s.questions.map((q) => q.id))
    for (const id of baselineIds) {
      if (RFP_QUESTION_BANK.find((q) => q.id === id)?.applicableOrgSizes) continue
      expect(includedIds).toContain(id)
    }
  })

  it('pulls in capability-specific questions only when that capability is selected', () => {
    const withoutMfa = generateRfp(BASE_ANSWERS)
    const withMfa = generateRfp({ ...BASE_ANSWERS, priorityCapabilities: ['mfa'] })

    const withoutIds = withoutMfa.flatMap((s) => s.questions.map((q) => q.id))
    const withIds = withMfa.flatMap((s) => s.questions.map((q) => q.id))

    expect(withoutIds).not.toContain('sec-mfa-phishing-resistant')
    expect(withIds).toContain('sec-mfa-phishing-resistant')
  })

  it('respects org-size gating', () => {
    const smallOrg = generateRfp({ ...BASE_ANSWERS, orgSize: 'Small' })
    const enterpriseOrg = generateRfp({ ...BASE_ANSWERS, orgSize: 'Enterprise' })

    const smallIds = smallOrg.flatMap((s) => s.questions.map((q) => q.id))
    const enterpriseIds = enterpriseOrg.flatMap((s) => s.questions.map((q) => q.id))

    expect(smallIds).toContain('impl-small-support')
    expect(enterpriseIds).not.toContain('impl-small-support')
    expect(enterpriseIds).toContain('tco-enterprise-volume')
    expect(smallIds).not.toContain('tco-enterprise-volume')
  })

  it('selecting more capabilities never decreases the total question count', () => {
    const fewer = generateRfp({ ...BASE_ANSWERS, priorityCapabilities: ['mfa'] })
    const more = generateRfp({ ...BASE_ANSWERS, priorityCapabilities: ['mfa', 'pam', 'iga', 'ciam', 'sso'] })
    expect(countTotalQuestions(more)).toBeGreaterThanOrEqual(countTotalQuestions(fewer))
  })

  it('omits a section entirely when it has zero applicable questions', () => {
    const sections = generateRfp(BASE_ANSWERS)
    for (const section of sections) {
      expect(section.questions.length).toBeGreaterThan(0)
    }
  })

  it('never returns duplicate questions within the same generated RFP', () => {
    const sections = generateRfp({ ...BASE_ANSWERS, priorityCapabilities: ['mfa', 'pam', 'iga', 'ciam', 'sso'] })
    const ids = sections.flatMap((s) => s.questions.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
