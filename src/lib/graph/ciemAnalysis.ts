import type { CiemScenario, ToxicCombinationRule } from '../../data/ciemScenarios'

function roleIds(scenario: CiemScenario): string[] {
  return scenario.nodes.filter((n) => n.type === 'role').map((n) => n.id)
}

/** Permissions granted directly to a role via its own 'Grants' edges — "on paper," no chaining. */
export function computeGrantedPermissions(scenario: CiemScenario, roleId: string): string[] {
  return scenario.edges
    .filter((e) => e.type === 'Grants' && e.source === roleId && e.permission)
    .map((e) => e.permission!)
}

/**
 * Permissions actually reachable from a role once role-assumption chains
 * ('CanAssume') and cross-account trust ('TrustsAccount') are followed —
 * "effective," not just "granted." This is the whole CIEM point: a role's
 * own policy can look harmless while what it can actually reach is not.
 */
export function computeEffectivePermissions(scenario: CiemScenario, roleId: string): string[] {
  const visited = new Set<string>([roleId])
  const queue = [roleId]
  const permissions = new Set<string>(computeGrantedPermissions(scenario, roleId))

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const edge of scenario.edges) {
      if (edge.type !== 'CanAssume' && edge.type !== 'TrustsAccount') continue
      if (edge.source !== current) continue
      if (visited.has(edge.target)) continue
      visited.add(edge.target)
      queue.push(edge.target)
      for (const permission of computeGrantedPermissions(scenario, edge.target)) {
        permissions.add(permission)
      }
    }
  }

  return Array.from(permissions)
}

export interface ToxicFinding {
  roleId: string
  rule: ToxicCombinationRule
}

export function detectToxicCombinations(scenario: CiemScenario, rules: ToxicCombinationRule[]): ToxicFinding[] {
  const findings: ToxicFinding[] = []
  for (const roleId of roleIds(scenario)) {
    const effective = new Set(computeEffectivePermissions(scenario, roleId))
    for (const rule of rules) {
      if (rule.requiredPermissions.every((perm) => effective.has(perm))) {
        findings.push({ roleId, rule })
      }
    }
  }
  return findings
}

/**
 * Recalculates a minimal policy for a role: the intersection of what it was
 * granted and what the mock CloudTrail-style access log shows it actually
 * used. Never adds anything the role wasn't already granted.
 */
export function computeLeastPrivilegePolicy(scenario: CiemScenario, roleId: string): string[] {
  const granted = new Set(computeGrantedPermissions(scenario, roleId))
  const usedPermissions = new Set(
    scenario.accessLog.filter((entry) => entry.roleId === roleId && entry.used).map((entry) => entry.permission),
  )
  return Array.from(granted).filter((permission) => usedPermissions.has(permission))
}
