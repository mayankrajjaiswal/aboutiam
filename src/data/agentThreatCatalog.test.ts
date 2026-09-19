import { describe, expect, it } from 'vitest'
import {
  AGENT_THREAT_CATALOG,
  getThreatsByCategory,
  getThreatById,
  type AgentThreatCategory,
} from './agentThreatCatalog'

const ALL_CATEGORIES: AgentThreatCategory[] = [
  'Intent Manipulation', 'Privilege Abuse', 'Data Exfiltration',
  'Identity & Attribution', 'Supply Chain', 'Availability & Cost',
]

describe('agentThreatCatalog data integrity', () => {
  it('has at least 12 threats with no duplicate ids', () => {
    expect(AGENT_THREAT_CATALOG.length).toBeGreaterThanOrEqual(12)
    const ids = AGENT_THREAT_CATALOG.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('spans all 6 threat categories', () => {
    for (const category of ALL_CATEGORIES) {
      expect(getThreatsByCategory(category).length).toBeGreaterThan(0)
    }
  })

  it('every threat has both an identity control and a fabric control (the two-column model)', () => {
    for (const t of AGENT_THREAT_CATALOG) {
      expect(t.identityControls.length).toBeGreaterThan(0)
      expect(t.fabricControls.length).toBeGreaterThan(0)
    }
  })

  it('every threat has a non-empty description and attack narrative', () => {
    for (const t of AGENT_THREAT_CATALOG) {
      expect(t.description.length).toBeGreaterThan(30)
      expect(t.attackNarrative.length).toBeGreaterThan(30)
    }
  })

  it('every threat has a valid ISO verifiedDate and https sourceLink', () => {
    for (const t of AGENT_THREAT_CATALOG) {
      expect(t.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(t.sourceLink.startsWith('https://')).toBe(true)
    }
  })

  it('every threat maps to at least one OWASP LLM Top 10 framework entry', () => {
    for (const t of AGENT_THREAT_CATALOG) {
      expect(t.frameworkMapping.length).toBeGreaterThan(0)
      for (const mapping of t.frameworkMapping) {
        expect(mapping).toMatch(/^LLM\d{2}:/)
      }
    }
  })

  it('every threat has at least one related lab path', () => {
    for (const t of AGENT_THREAT_CATALOG) {
      expect(t.relatedLabs.length).toBeGreaterThan(0)
      for (const path of t.relatedLabs) {
        expect(path.startsWith('/playground/') || path.startsWith('/tools/')).toBe(true)
      }
    }
  })

  it('every severity is a valid value', () => {
    const valid = new Set(['low', 'medium', 'high', 'critical'])
    for (const t of AGENT_THREAT_CATALOG) {
      expect(valid.has(t.severity)).toBe(true)
    }
  })
})

describe('getThreatById', () => {
  it('returns the matching threat', () => {
    expect(getThreatById('prompt-injection-privilege-escalation')?.severity).toBe('critical')
  })
})
