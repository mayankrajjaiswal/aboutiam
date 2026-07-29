import { describe, it, expect } from 'vitest'
import { HR_MAPPING_SCENARIOS } from './hrAttributeMappingFixtures'

describe('HR_MAPPING_SCENARIOS', () => {
  it('has at least two scenarios', () => {
    expect(HR_MAPPING_SCENARIOS.length).toBeGreaterThanOrEqual(2)
  })

  it('every scenario has unique HR field ids and unique target attribute ids', () => {
    for (const scenario of HR_MAPPING_SCENARIOS) {
      const fieldIds = scenario.hrFields.map((f) => f.id)
      const targetIds = scenario.targetAttributes.map((t) => t.id)
      expect(new Set(fieldIds).size).toBe(fieldIds.length)
      expect(new Set(targetIds).size).toBe(targetIds.length)
    }
  })

  it('every scenario has at least one required target attribute', () => {
    for (const scenario of HR_MAPPING_SCENARIOS) {
      expect(scenario.targetAttributes.some((t) => t.required)).toBe(true)
    }
  })

  it('every HR field has a sample value in sampleRecord', () => {
    for (const scenario of HR_MAPPING_SCENARIOS) {
      for (const field of scenario.hrFields) {
        expect(scenario.sampleRecord[field.id]).toBeTruthy()
      }
    }
  })

  it('every suggested lookup table key references a real HR field id', () => {
    for (const scenario of HR_MAPPING_SCENARIOS) {
      const fieldIds = new Set(scenario.hrFields.map((f) => f.id))
      for (const fieldId of Object.keys(scenario.suggestedLookupTables)) {
        expect(fieldIds.has(fieldId)).toBe(true)
      }
    }
  })
})
