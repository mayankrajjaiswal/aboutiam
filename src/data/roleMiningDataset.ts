import type { UserEntitlements } from '../lib/analytics/jaccardClustering'

// A hand-authored, deterministic (no Math.random()) ~30 user x 15 entitlement matrix.
// Six archetype entitlement bundles are deliberately assigned to groups of users so the
// clustering algorithm has genuine, discoverable role candidates to find, plus 8 "noise"
// users with unique/near-unique entitlement mixes representing orphaned access.
export const ALL_ENTITLEMENTS = [
  'app-read', 'app-write', 'db-read', 'db-admin', 'vpn-access',
  'finance-view', 'finance-approve', 'hr-view', 'hr-edit', 'admin-console',
  'audit-log-read', 'deploy-prod', 'deploy-staging', 'support-tickets', 'billing-admin',
]

const FINANCE_ANALYST = ['app-read', 'finance-view', 'audit-log-read']
const FINANCE_APPROVER = ['app-read', 'finance-view', 'finance-approve', 'audit-log-read']
const HR_SPECIALIST = ['app-read', 'hr-view', 'hr-edit', 'support-tickets']
const BACKEND_ENGINEER = ['app-read', 'app-write', 'db-read', 'deploy-staging']
const SENIOR_ENGINEER = ['app-read', 'app-write', 'db-read', 'db-admin', 'deploy-staging', 'deploy-prod']
const IT_ADMIN = ['app-read', 'vpn-access', 'admin-console', 'support-tickets']

export const ROLE_MINING_DATASET: UserEntitlements[] = [
  { userId: 'finance.alice', entitlements: FINANCE_ANALYST },
  { userId: 'finance.bella', entitlements: FINANCE_ANALYST },
  { userId: 'finance.carlos', entitlements: FINANCE_ANALYST },
  { userId: 'finance.diana', entitlements: FINANCE_ANALYST },
  { userId: 'finance.ethan', entitlements: FINANCE_ANALYST },

  { userId: 'finance.frank', entitlements: FINANCE_APPROVER },
  { userId: 'finance.grace', entitlements: FINANCE_APPROVER },
  { userId: 'finance.hank', entitlements: FINANCE_APPROVER },

  { userId: 'hr.irene', entitlements: HR_SPECIALIST },
  { userId: 'hr.jack', entitlements: HR_SPECIALIST },
  { userId: 'hr.karen', entitlements: HR_SPECIALIST },
  { userId: 'hr.leo', entitlements: HR_SPECIALIST },

  { userId: 'eng.mia', entitlements: BACKEND_ENGINEER },
  { userId: 'eng.noah', entitlements: BACKEND_ENGINEER },
  { userId: 'eng.olivia', entitlements: BACKEND_ENGINEER },
  { userId: 'eng.paul', entitlements: BACKEND_ENGINEER },

  { userId: 'eng.quinn', entitlements: SENIOR_ENGINEER },
  { userId: 'eng.ravi', entitlements: SENIOR_ENGINEER },
  { userId: 'eng.sara', entitlements: SENIOR_ENGINEER },

  { userId: 'it.tom', entitlements: IT_ADMIN },
  { userId: 'it.uma', entitlements: IT_ADMIN },
  { userId: 'it.victor', entitlements: IT_ADMIN },

  // Noise / orphan users — unique or near-unique entitlement mixes with no real cluster.
  { userId: 'orphan.wendy', entitlements: ['app-read', 'billing-admin'] },
  { userId: 'orphan.xavier', entitlements: ['app-read', 'db-admin', 'billing-admin'] },
  { userId: 'orphan.yasmin', entitlements: ['vpn-access'] },
  { userId: 'orphan.zack', entitlements: ['app-read', 'hr-view'] },
  { userId: 'orphan.amara', entitlements: ['admin-console', 'billing-admin', 'db-admin'] },
  { userId: 'orphan.bruno', entitlements: ['app-read'] },
  { userId: 'orphan.chloe', entitlements: ['finance-view', 'db-read'] },
  { userId: 'orphan.deepak', entitlements: ['support-tickets', 'audit-log-read'] },
]
