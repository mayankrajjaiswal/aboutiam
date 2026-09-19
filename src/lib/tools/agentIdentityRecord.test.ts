import { describe, it, expect } from 'vitest'
import { AGENT_RECORD_FIELDS } from '../../data/agentRegistryModel'
import {
  validateAgentRecord,
  buildRecordJson,
  buildRecordYaml,
  buildJobDescription,
  type AgentRecordValues,
} from './agentIdentityRecord'

function emptyValues(): AgentRecordValues {
  return {}
}

function completeValues(): AgentRecordValues {
  const values: AgentRecordValues = {}
  for (const field of AGENT_RECORD_FIELDS) {
    values[field.id] = field.exampleValue
  }
  return values
}

describe('validateAgentRecord', () => {
  it('flags every required field as missing when no values are provided', () => {
    const result = validateAgentRecord(emptyValues())
    const requiredCount = AGENT_RECORD_FIELDS.filter((f) => f.required).length
    expect(result.missingRequiredFields).toHaveLength(requiredCount)
  })

  it('reports 0% completeness with no values', () => {
    const result = validateAgentRecord(emptyValues())
    expect(result.completenessPercent).toBe(0)
  })

  it('reports 100% completeness when every field is filled with its example value', () => {
    const result = validateAgentRecord(completeValues())
    expect(result.completenessPercent).toBe(100)
    expect(result.missingRequiredFields).toHaveLength(0)
  })

  it('flags a critical warning when owner is missing', () => {
    const result = validateAgentRecord(emptyValues())
    expect(result.warnings.some((w) => w.fieldId === 'owner' && w.severity === 'critical')).toBe(true)
  })

  it('flags a high warning when expiry is missing', () => {
    const result = validateAgentRecord(emptyValues())
    expect(result.warnings.some((w) => w.fieldId === 'expiry' && w.severity === 'high')).toBe(true)
  })

  it('does not flag owner or expiry warnings once those fields are filled', () => {
    const result = validateAgentRecord({ owner: 'jane.doe@example.com', expiry: '2027-01-01' })
    expect(result.warnings.some((w) => w.fieldId === 'owner')).toBe(false)
    expect(result.warnings.some((w) => w.fieldId === 'expiry')).toBe(false)
  })

  it('flags over-broad permitted tools using a wildcard', () => {
    const result = validateAgentRecord({ permitted_tools: '*' })
    expect(result.warnings.some((w) => w.fieldId === 'permitted_tools')).toBe(true)
  })

  it('flags over-broad permitted tools using "all"', () => {
    const result = validateAgentRecord({ permitted_tools: 'all tools' })
    expect(result.warnings.some((w) => w.fieldId === 'permitted_tools')).toBe(true)
  })

  it('does not flag a specific, scoped tool list', () => {
    const result = validateAgentRecord({ permitted_tools: 'refund-api:create, refund-api:status' })
    expect(result.warnings.some((w) => w.fieldId === 'permitted_tools')).toBe(false)
  })

  it('flags over-broad permitted scopes', () => {
    const result = validateAgentRecord({ permitted_scopes: 'full-access' })
    expect(result.warnings.some((w) => w.fieldId === 'permitted_scopes')).toBe(true)
  })

  it('flags a missing approval trigger', () => {
    const result = validateAgentRecord(emptyValues())
    expect(result.warnings.some((w) => w.fieldId === 'approval_triggers' && w.severity === 'medium')).toBe(true)
  })

  it('flags a missing revocation trigger', () => {
    const result = validateAgentRecord(emptyValues())
    expect(result.warnings.some((w) => w.fieldId === 'revocation_trigger' && w.severity === 'medium')).toBe(true)
  })

  it('produces no warnings for a fully complete, well-scoped record', () => {
    const result = validateAgentRecord(completeValues())
    expect(result.warnings).toHaveLength(0)
  })
})

describe('buildRecordJson', () => {
  it('produces valid JSON grouped by field group', () => {
    const json = buildRecordJson(completeValues())
    const parsed = JSON.parse(json)
    expect(parsed.Identity.agent_id).toBe(AGENT_RECORD_FIELDS.find((f) => f.id === 'agent_id')!.exampleValue)
    expect(parsed.Lifecycle.expiry).toBe(AGENT_RECORD_FIELDS.find((f) => f.id === 'expiry')!.exampleValue)
  })

  it('includes every field group as a top-level key', () => {
    const json = buildRecordJson(emptyValues())
    const parsed = JSON.parse(json)
    const groups = new Set(AGENT_RECORD_FIELDS.map((f) => f.group))
    for (const group of groups) {
      expect(parsed).toHaveProperty(group)
    }
  })
})

describe('buildRecordYaml', () => {
  it('produces YAML with every field group as a top-level key', () => {
    const yaml = buildRecordYaml(completeValues())
    const groups = new Set(AGENT_RECORD_FIELDS.map((f) => f.group))
    for (const group of groups) {
      expect(yaml).toContain(`${group}:`)
    }
  })

  it('quotes values containing YAML-significant characters', () => {
    const yaml = buildRecordYaml({ display_name: 'agent: with a colon' })
    expect(yaml).toContain("display_name: 'agent: with a colon'")
  })

  it('renders empty values as an empty YAML string', () => {
    const yaml = buildRecordYaml(emptyValues())
    expect(yaml).toContain("agent_id: ''")
  })
})

describe('buildJobDescription', () => {
  it('includes the display name in the header', () => {
    const description = buildJobDescription({ display_name: 'Refund Sub-Agent' })
    expect(description).toContain('Refund Sub-Agent')
  })

  it('falls back to a placeholder when display name is not provided', () => {
    const description = buildJobDescription(emptyValues())
    expect(description).toContain('(unnamed agent)')
  })

  it('marks unfilled fields as "(not provided)"', () => {
    const description = buildJobDescription(emptyValues())
    expect(description).toContain('(not provided)')
  })

  it('includes every field label from the schema', () => {
    const description = buildJobDescription(completeValues())
    for (const field of AGENT_RECORD_FIELDS) {
      expect(description).toContain(field.label)
    }
  })
})
