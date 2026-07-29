import { describe, it, expect } from 'vitest'
import { computeMappedRecord, findMappingConflicts, applyTransform } from './attributeTransform'
import { HR_MAPPING_SCENARIOS } from '../../data/hrAttributeMappingFixtures'

const scenario = HR_MAPPING_SCENARIOS.find((s) => s.id === 'workday-entra')!

describe('applyTransform', () => {
  it('direct transform passes the source value through unchanged', () => {
    expect(applyTransform({ type: 'direct' }, ['legal_first_name'], scenario.sampleRecord)).toBe('Priya')
  })

  it('concat transform joins multiple source values with the given separator', () => {
    const result = applyTransform({ type: 'concat', concatSeparator: ' ' }, ['legal_first_name', 'legal_last_name'], scenario.sampleRecord)
    expect(result).toBe('Priya Sharma')
  })

  it('concat transform defaults to a space separator when none is given', () => {
    const result = applyTransform({ type: 'concat' }, ['legal_first_name', 'legal_last_name'], scenario.sampleRecord)
    expect(result).toBe('Priya Sharma')
  })

  it('regex transform extracts the first capture group', () => {
    const result = applyTransform({ type: 'regex', regexPattern: '^([^@]+)@' }, ['work_email'], scenario.sampleRecord)
    expect(result).toBe('priya.sharma')
  })

  it('regex transform falls back to the raw value on an invalid pattern', () => {
    const result = applyTransform({ type: 'regex', regexPattern: '(' }, ['work_email'], scenario.sampleRecord)
    expect(result).toBe(scenario.sampleRecord.work_email)
  })

  it('lookup transform translates the value via the lookup table', () => {
    const result = applyTransform(
      { type: 'lookup', lookupTable: scenario.suggestedLookupTables.cost_center },
      ['cost_center'],
      scenario.sampleRecord,
    )
    expect(result).toBe('Engineering')
  })

  it('lookup transform falls back to the raw value for an unmapped key', () => {
    const result = applyTransform({ type: 'lookup', lookupTable: { 'CC-999': 'Unknown' } }, ['cost_center'], scenario.sampleRecord)
    expect(result).toBe('CC-100')
  })

  it('returns an empty string when no source fields are connected', () => {
    expect(applyTransform({ type: 'direct' }, [], scenario.sampleRecord)).toBe('')
  })
})

describe('computeMappedRecord', () => {
  it('produces correct output on fixture data for a direct mapping', () => {
    const record = computeMappedRecord(
      [{ sourceFieldId: 'legal_first_name', targetAttributeId: 'givenName' }],
      {},
      scenario.sampleRecord,
    )
    expect(record.givenName).toBe('Priya')
  })

  it('produces correct output for a concat-mapped target', () => {
    const record = computeMappedRecord(
      [
        { sourceFieldId: 'legal_first_name', targetAttributeId: 'displayName' },
        { sourceFieldId: 'legal_last_name', targetAttributeId: 'displayName' },
      ],
      { displayName: { type: 'concat', concatSeparator: ' ' } },
      scenario.sampleRecord,
    )
    expect(record.displayName).toBe('Priya Sharma')
  })
})

describe('findMappingConflicts', () => {
  it('flags a target with two non-concat sources as a duplicate', () => {
    const conflicts = findMappingConflicts(
      [
        { sourceFieldId: 'legal_first_name', targetAttributeId: 'givenName' },
        { sourceFieldId: 'legal_last_name', targetAttributeId: 'givenName' },
      ],
      scenario.targetAttributes,
      {},
    )
    expect(conflicts.duplicateTargets).toContain('givenName')
  })

  it('does not flag a target with two sources when the transform is concat', () => {
    const conflicts = findMappingConflicts(
      [
        { sourceFieldId: 'legal_first_name', targetAttributeId: 'displayName' },
        { sourceFieldId: 'legal_last_name', targetAttributeId: 'displayName' },
      ],
      scenario.targetAttributes,
      { displayName: { type: 'concat' } },
    )
    expect(conflicts.duplicateTargets).not.toContain('displayName')
  })

  it('flags every required target attribute with no connections as missing', () => {
    const conflicts = findMappingConflicts([], scenario.targetAttributes, {})
    const requiredIds = scenario.targetAttributes.filter((t) => t.required).map((t) => t.id)
    expect(conflicts.missingRequired.sort()).toEqual(requiredIds.sort())
  })

  it('does not flag a required target once it has a connection', () => {
    const conflicts = findMappingConflicts(
      [{ sourceFieldId: 'legal_first_name', targetAttributeId: 'givenName' }],
      scenario.targetAttributes,
      {},
    )
    expect(conflicts.missingRequired).not.toContain('givenName')
  })

  it('never flags optional target attributes as missing', () => {
    const conflicts = findMappingConflicts([], scenario.targetAttributes, {})
    expect(conflicts.missingRequired).not.toContain('department')
  })
})
