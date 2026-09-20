import { describe, expect, it } from 'vitest'
import { AI_GUARDRAIL_REQUESTS, getRequestsByGroundTruth } from './aiGuardrailScenarios'

describe('aiGuardrailScenarios data integrity', () => {
  it('has around 20 requests with no duplicate ids', () => {
    expect(AI_GUARDRAIL_REQUESTS.length).toBeGreaterThanOrEqual(18)
    const ids = AI_GUARDRAIL_REQUESTS.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has a mix of all 3 ground-truth categories', () => {
    expect(getRequestsByGroundTruth('legitimate').length).toBeGreaterThan(0)
    expect(getRequestsByGroundTruth('drifting').length).toBeGreaterThan(0)
    expect(getRequestsByGroundTruth('hostile').length).toBeGreaterThan(0)
  })

  it('every request has non-empty content, declaredIntent, and explanation', () => {
    for (const r of AI_GUARDRAIL_REQUESTS) {
      expect(r.content.length).toBeGreaterThan(5)
      expect(r.declaredIntent.length).toBeGreaterThan(10)
      expect(r.explanation.length).toBeGreaterThan(15)
    }
  })

  it('has a valid groundTruth value on every entry', () => {
    const valid = new Set(['legitimate', 'drifting', 'hostile'])
    for (const r of AI_GUARDRAIL_REQUESTS) {
      expect(valid.has(r.groundTruth)).toBe(true)
    }
  })
})
