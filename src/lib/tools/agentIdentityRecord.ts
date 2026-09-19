/**
 * Pure logic for the Agent Identity Record Generator (`/tools/agent-identity-record`).
 * Takes user-supplied values for the 25 fields defined in `agentRegistryModel.ts`
 * (AGENT_RECORD_FIELDS) and emits a portable agent identity record as JSON/YAML,
 * plus a human-readable "agent job description" document. Validates completeness
 * and flags over-broad authority, a missing owner, and an absent expiry -- the
 * same governance defects the Agent Registry Studio playground teaches.
 */
import { AGENT_RECORD_FIELDS, type AgentRecordField } from '../../data/agentRegistryModel'

export type AgentRecordValues = Record<string, string>

export interface ValidationWarning {
  fieldId: string
  severity: 'medium' | 'high' | 'critical'
  message: string
}

export interface ValidationResult {
  missingRequiredFields: AgentRecordField[]
  warnings: ValidationWarning[]
  completenessPercent: number
}

const OVER_BROAD_TOOL_PATTERNS = [/\*/, /\ball\b/i, /\bany\b/i, /^admin/i]
const OVER_BROAD_SCOPE_PATTERNS = [/\*/, /\ball\b/i, /\bfull[-_]?access\b/i]

export function validateAgentRecord(values: AgentRecordValues): ValidationResult {
  const missingRequiredFields = AGENT_RECORD_FIELDS.filter(
    (field) => field.required && !(values[field.id] ?? '').trim(),
  )

  const warnings: ValidationWarning[] = []

  if (!(values.owner ?? '').trim()) {
    warnings.push({ fieldId: 'owner', severity: 'critical', message: 'No human owner is named. An agent without a named owner has no one accountable for its behavior.' })
  }

  if (!(values.expiry ?? '').trim()) {
    warnings.push({ fieldId: 'expiry', severity: 'high', message: 'No expiry is set. Without an expiry, this agent\'s authority persists indefinitely with no forced re-certification.' })
  }

  const permittedTools = (values.permitted_tools ?? '').trim()
  if (permittedTools && OVER_BROAD_TOOL_PATTERNS.some((pattern) => pattern.test(permittedTools))) {
    warnings.push({ fieldId: 'permitted_tools', severity: 'high', message: 'Permitted tools looks over-broad (wildcard, "all", "any", or an admin-prefixed tool). Scope this to the exact tools the declared intent requires.' })
  }

  const permittedScopes = (values.permitted_scopes ?? '').trim()
  if (permittedScopes && OVER_BROAD_SCOPE_PATTERNS.some((pattern) => pattern.test(permittedScopes))) {
    warnings.push({ fieldId: 'permitted_scopes', severity: 'high', message: 'Permitted scopes looks over-broad (wildcard or a full-access grant). Narrow this to the minimum scopes the declared intent requires.' })
  }

  if (!(values.approval_triggers ?? '').trim()) {
    warnings.push({ fieldId: 'approval_triggers', severity: 'medium', message: 'No human-approval trigger is defined. Consequential actions should have a defined threshold that pauses for human review.' })
  }

  if (!(values.revocation_trigger ?? '').trim()) {
    warnings.push({ fieldId: 'revocation_trigger', severity: 'medium', message: 'No revocation trigger is defined beyond the review cadence. Define events (owner departure, drift flags) that cause immediate revocation.' })
  }

  const filledCount = AGENT_RECORD_FIELDS.filter((field) => (values[field.id] ?? '').trim()).length
  const completenessPercent = Math.round((filledCount / AGENT_RECORD_FIELDS.length) * 100)

  return { missingRequiredFields, warnings, completenessPercent }
}

export function buildRecordJson(values: AgentRecordValues): string {
  const record: Record<string, Record<string, string>> = {}
  for (const field of AGENT_RECORD_FIELDS) {
    record[field.group] ??= {}
    record[field.group][field.id] = values[field.id] ?? ''
  }
  return JSON.stringify(record, null, 2)
}

function yamlEscape(value: string): string {
  if (value === '') return "''"
  if (/[:#{}[\],&*!|>'"%@`]/.test(value) || /^\s|\s$/.test(value)) {
    return `'${value.replace(/'/g, "''")}'`
  }
  return value
}

export function buildRecordYaml(values: AgentRecordValues): string {
  const groups = Array.from(new Set(AGENT_RECORD_FIELDS.map((field) => field.group)))
  const lines: string[] = []
  for (const group of groups) {
    lines.push(`${group}:`)
    for (const field of AGENT_RECORD_FIELDS.filter((f) => f.group === group)) {
      lines.push(`  ${field.id}: ${yamlEscape(values[field.id] ?? '')}`)
    }
  }
  return lines.join('\n')
}

export function buildJobDescription(values: AgentRecordValues): string {
  const groups = Array.from(new Set(AGENT_RECORD_FIELDS.map((field) => field.group)))
  const lines: string[] = [
    `Agent Job Description: ${values.display_name || '(unnamed agent)'}`,
    '',
  ]
  for (const group of groups) {
    lines.push(`${group}`)
    for (const field of AGENT_RECORD_FIELDS.filter((f) => f.group === group)) {
      const value = (values[field.id] ?? '').trim()
      lines.push(`  ${field.label}: ${value || '(not provided)'}`)
    }
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}
