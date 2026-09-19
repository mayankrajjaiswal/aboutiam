import { describe, expect, it } from 'vitest'
import {
  AGENT_RECORD_FIELDS,
  SAMPLE_AGENT_RECORDS,
  getFieldsByGroup,
  getSampleAgentById,
  type AgentRecordFieldGroup,
} from './agentRegistryModel'

const ALL_GROUPS: AgentRecordFieldGroup[] = [
  'Identity', 'Ownership', 'Principal', 'Intent', 'Authority', 'Conditions', 'Provenance', 'Lifecycle',
]

describe('AGENT_RECORD_FIELDS data integrity', () => {
  it('has no duplicate field ids', () => {
    const ids = AGENT_RECORD_FIELDS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all 8 field groups with at least 2 fields each', () => {
    for (const group of ALL_GROUPS) {
      expect(getFieldsByGroup(group).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every field has a non-empty purpose, iamEquivalent, and exampleValue', () => {
    for (const f of AGENT_RECORD_FIELDS) {
      expect(f.purpose.length).toBeGreaterThan(10)
      expect(f.iamEquivalent.length).toBeGreaterThan(5)
      expect(f.exampleValue.length).toBeGreaterThan(0)
    }
  })

  it('has at least one required field per group (governance backbone)', () => {
    for (const group of ALL_GROUPS) {
      const fields = getFieldsByGroup(group)
      expect(fields.some((f) => f.required)).toBe(true)
    }
  })
})

describe('SAMPLE_AGENT_RECORDS data integrity', () => {
  it('has no duplicate sample agent ids', () => {
    const ids = SAMPLE_AGENT_RECORDS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has at least 6 sample agents spanning multiple quadrants', () => {
    expect(SAMPLE_AGENT_RECORDS.length).toBeGreaterThanOrEqual(6)
    const quadrants = new Set(SAMPLE_AGENT_RECORDS.map((a) => a.quadrant))
    expect(quadrants.size).toBeGreaterThanOrEqual(3)
  })

  it('every sample agent has at least one governance gap', () => {
    for (const agent of SAMPLE_AGENT_RECORDS) {
      expect(agent.governanceGaps.length).toBeGreaterThan(0)
    }
  })

  it('every governance gap references a real field id', () => {
    const validFieldIds = new Set(AGENT_RECORD_FIELDS.map((f) => f.id))
    for (const agent of SAMPLE_AGENT_RECORDS) {
      for (const gap of agent.governanceGaps) {
        expect(validFieldIds.has(gap.fieldId)).toBe(true)
      }
    }
  })

  it('includes at least one deliberately over-governed sample (the usability-cost lesson)', () => {
    const overGoverned = SAMPLE_AGENT_RECORDS.find((a) => a.id === 'orchestrator-overgoverned')
    expect(overGoverned).toBeDefined()
    expect(overGoverned?.governanceGaps.some((g) => g.severity === 'low' || g.severity === 'medium')).toBe(true)
  })

  it('every governance gap has a non-empty issue and fix', () => {
    for (const agent of SAMPLE_AGENT_RECORDS) {
      for (const gap of agent.governanceGaps) {
        expect(gap.issue.length).toBeGreaterThan(15)
        expect(gap.fix.length).toBeGreaterThan(10)
      }
    }
  })
})

describe('getSampleAgentById', () => {
  it('returns the matching sample agent', () => {
    expect(getSampleAgentById('refund-subagent')?.name).toBe('Refund Processing Sub-Agent')
  })

  it('returns undefined for an unknown id', () => {
    expect(getSampleAgentById('does-not-exist')).toBeUndefined()
  })
})
