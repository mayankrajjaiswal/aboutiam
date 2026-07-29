import { describe, it, expect } from 'vitest'
import {
  computeGrantedPermissions, computeEffectivePermissions, detectToxicCombinations, computeLeastPrivilegePolicy,
} from './ciemAnalysis'
import { CIEM_SCENARIOS, TOXIC_COMBINATION_RULES } from '../../data/ciemScenarios'

const directScenario = CIEM_SCENARIOS.find((s) => s.id === 'direct-toxic-combo')!
const crossAccountScenario = CIEM_SCENARIOS.find((s) => s.id === 'cross-account-toxic-combo')!
const cleanScenario = CIEM_SCENARIOS.find((s) => s.id === 'clean-least-privilege')!

describe('computeGrantedPermissions', () => {
  it('returns only permissions directly granted to the role, no chaining', () => {
    const granted = computeGrantedPermissions(crossAccountScenario, 'readonly-role')
    expect(granted).toEqual(['lambda:CreateFunction'])
    expect(granted).not.toContain('iam:PassRole')
  })
})

describe('computeEffectivePermissions', () => {
  it('matches granted permissions when there is no assumption chain', () => {
    const effective = computeEffectivePermissions(directScenario, 'dev-role')
    expect(effective.sort()).toEqual(['iam:PassRole', 'lambda:CreateFunction', 's3:GetObject'].sort())
  })

  it('includes permissions gained by assuming another role via CanAssume', () => {
    const effective = computeEffectivePermissions(crossAccountScenario, 'readonly-role')
    expect(effective).toContain('lambda:CreateFunction')
    expect(effective).toContain('iam:PassRole')
  })
})

describe('detectToxicCombinations', () => {
  it('fires on a role directly granted both halves of a toxic pair', () => {
    const findings = detectToxicCombinations(directScenario, TOXIC_COMBINATION_RULES)
    expect(findings.some((f) => f.roleId === 'dev-role' && f.rule.id === 'passrole-createfunction')).toBe(true)
  })

  it('fires on the escalation only reachable via a cross-account assumption chain', () => {
    const findings = detectToxicCombinations(crossAccountScenario, TOXIC_COMBINATION_RULES)
    expect(findings.some((f) => f.roleId === 'readonly-role' && f.rule.id === 'passrole-createfunction')).toBe(true)
  })

  it('does not fire on a clean role with no reachable toxic combination', () => {
    const findings = detectToxicCombinations(cleanScenario, TOXIC_COMBINATION_RULES)
    expect(findings).toHaveLength(0)
  })
})

describe('computeLeastPrivilegePolicy', () => {
  it('strictly narrows the original granted policy to only actually-used permissions', () => {
    const granted = computeGrantedPermissions(directScenario, 'dev-role')
    const leastPrivilege = computeLeastPrivilegePolicy(directScenario, 'dev-role')
    expect(leastPrivilege.length).toBeLessThan(granted.length)
    expect(leastPrivilege).not.toContain('iam:PassRole')
    expect(leastPrivilege).toContain('lambda:CreateFunction')
  })

  it('never includes a permission the role was not already granted', () => {
    const granted = new Set(computeGrantedPermissions(directScenario, 'dev-role'))
    const leastPrivilege = computeLeastPrivilegePolicy(directScenario, 'dev-role')
    for (const permission of leastPrivilege) {
      expect(granted.has(permission)).toBe(true)
    }
  })
})
