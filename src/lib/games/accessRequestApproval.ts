import type { CatalogItem } from '../../data/accessRequestCatalog'

export type Approver = 'manager' | 'app-owner' | 'compliance-officer'

export interface ApprovalStep {
  approver: Approver
  reason: string
  status: 'approved' | 'pending'
}

export interface ConflictPair {
  requestedId: string
  conflictsWithId: string
}

export interface ApprovalResult {
  steps: ApprovalStep[]
  autoApproved: boolean
  hasConflict: boolean
  conflicts: ConflictPair[]
}

/**
 * Deterministic approval chain: manager approval always runs first; a privileged item
 * additionally requires app-owner sign-off; an SoD conflict against the cart or the
 * user's existing access additionally requires a compliance-officer override and blocks
 * auto-approval.
 */
export function evaluateAccessRequest(cartItems: CatalogItem[], existingAccessIds: string[] = []): ApprovalResult {
  const steps: ApprovalStep[] = [
    { approver: 'manager', reason: 'Standard manager approval required for every access request.', status: 'approved' },
  ]

  const needsAppOwner = cartItems.some((item) => item.privilegeLevel === 'privileged')
  if (needsAppOwner) {
    steps.push({ approver: 'app-owner', reason: 'A privileged entitlement requires the resource owner\'s sign-off.', status: 'approved' })
  }

  const cartIds = new Set(cartItems.map((i) => i.id))
  const heldIds = new Set([...existingAccessIds, ...cartIds])
  const conflicts: ConflictPair[] = []
  for (const item of cartItems) {
    for (const conflictId of item.sodConflicts ?? []) {
      if (heldIds.has(conflictId)) {
        conflicts.push({ requestedId: item.id, conflictsWithId: conflictId })
      }
    }
  }

  const hasConflict = conflicts.length > 0
  if (hasConflict) {
    steps.push({ approver: 'compliance-officer', reason: 'Separation-of-Duties conflict detected — requires a compliance override before access is granted.', status: 'pending' })
  }

  return {
    steps,
    autoApproved: !needsAppOwner && !hasConflict,
    hasConflict,
    conflicts,
  }
}
