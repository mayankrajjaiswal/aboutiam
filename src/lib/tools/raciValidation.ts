export type RaciLetter = 'R' | 'A' | 'C' | 'I'

/** A cell can hold more than one letter (e.g. the same person is both Responsible and Accountable). */
export type RaciCell = RaciLetter[]

/** matrix[activityId][roleName] = RaciCell */
export type RaciMatrix = Record<string, Record<string, RaciCell>>

export interface RaciValidationIssue {
  activityId: string
  severity: 'error' | 'warning'
  message: string
}

const OVERLOAD_THRESHOLD = 3

function rolesForActivity(matrix: RaciMatrix, activityId: string): Record<string, RaciCell> {
  return matrix[activityId] ?? {}
}

/**
 * Pure validation rules for a RACI matrix: exactly one Accountable owner per
 * activity, at least one Responsible party, and a governance-smell warning
 * when the same person is both Responsible and Accountable across too many
 * activities (a common real-world anti-pattern — one person owning both
 * doing and approving the work removes the separation RACI exists for).
 */
export function validateRaciMatrix(
  activityIds: string[],
  matrix: RaciMatrix,
  overloadThreshold = OVERLOAD_THRESHOLD
): RaciValidationIssue[] {
  const issues: RaciValidationIssue[] = []
  const dualRoleCounts = new Map<string, number>()

  for (const activityId of activityIds) {
    const roles = rolesForActivity(matrix, activityId)
    const accountableRoles = Object.entries(roles).filter(([, cell]) => cell.includes('A')).map(([role]) => role)
    const responsibleRoles = Object.entries(roles).filter(([, cell]) => cell.includes('R')).map(([role]) => role)

    if (accountableRoles.length === 0) {
      issues.push({ activityId, severity: 'error', message: 'No Accountable owner assigned — every activity needs exactly one.' })
    } else if (accountableRoles.length > 1) {
      issues.push({ activityId, severity: 'error', message: `Multiple Accountable owners assigned (${accountableRoles.join(', ')}) — every activity needs exactly one.` })
    }

    if (responsibleRoles.length === 0) {
      issues.push({ activityId, severity: 'error', message: 'No Responsible party assigned — every activity needs at least one.' })
    }

    for (const role of accountableRoles) {
      if (responsibleRoles.includes(role)) {
        dualRoleCounts.set(role, (dualRoleCounts.get(role) ?? 0) + 1)
      }
    }
  }

  for (const [role, count] of dualRoleCounts) {
    if (count >= overloadThreshold) {
      issues.push({
        activityId: '',
        severity: 'warning',
        message: `"${role}" is both Responsible and Accountable on ${count} activities — a common governance smell (no separation between doing the work and approving it).`,
      })
    }
  }

  return issues
}

export function isRaciMatrixValid(activityIds: string[], matrix: RaciMatrix): boolean {
  return !validateRaciMatrix(activityIds, matrix).some((issue) => issue.severity === 'error')
}
