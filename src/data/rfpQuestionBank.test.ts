import { describe, it, expect } from 'vitest'
import { RFP_QUESTION_BANK } from './rfpQuestionBank'
import { EXPLORE_PRODUCTS } from './exploreData'

describe('RFP_QUESTION_BANK', () => {
  it('has unique question ids', () => {
    const ids = RFP_QUESTION_BANK.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every question has a non-empty question string', () => {
    for (const q of RFP_QUESTION_BANK) {
      expect(q.question.length).toBeGreaterThan(0)
    }
  })

  it('covers all four RFP categories', () => {
    const categories = new Set(RFP_QUESTION_BANK.map((q) => q.category))
    expect(categories).toEqual(new Set(['Security & Compliance', 'Integration', 'TCO', 'Implementation Risk']))
  })

  it('has at least one baseline (always-included) question per category', () => {
    const categories = ['Security & Compliance', 'Integration', 'TCO', 'Implementation Risk'] as const
    for (const category of categories) {
      const baseline = RFP_QUESTION_BANK.filter((q) => q.category === category && q.applicableCapabilities.length === 0)
      expect(baseline.length).toBeGreaterThan(0)
    }
  })

  it('every relatedVendorIds entry resolves to a real EXPLORE_PRODUCTS id', () => {
    const validIds = new Set(EXPLORE_PRODUCTS.map((p) => p.id))
    for (const q of RFP_QUESTION_BANK) {
      for (const vendorId of q.relatedVendorIds ?? []) {
        expect(validIds.has(vendorId)).toBe(true)
      }
    }
  })
})
