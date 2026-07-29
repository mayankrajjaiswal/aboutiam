export type PrivilegeLevel = 'standard' | 'elevated' | 'privileged'

export interface CatalogItem {
  id: string
  name: string
  system: string
  privilegeLevel: PrivilegeLevel
  description: string
  /** ids of other catalog items this one conflicts with under Separation-of-Duties rules. */
  sodConflicts?: string[]
}

export const ACCESS_REQUEST_CATALOG: CatalogItem[] = [
  { id: 'app-read', name: 'Application Read Access', system: 'Core App Suite', privilegeLevel: 'standard', description: 'Read-only access to standard application dashboards and reports.' },
  { id: 'vpn-access', name: 'Corporate VPN Access', system: 'Network', privilegeLevel: 'standard', description: 'Remote access to the internal corporate network over VPN.' },
  { id: 'support-tickets', name: 'Support Ticket Queue', system: 'ServiceDesk', privilegeLevel: 'standard', description: 'View and respond to assigned customer support tickets.' },
  { id: 'invoice-approver', name: 'Invoice Approver', system: 'SAP Finance', privilegeLevel: 'elevated', description: 'Approve vendor invoices for payment processing.', sodConflicts: ['payment-issuer'] },
  { id: 'payment-issuer', name: 'Payment Issuer', system: 'SAP Finance', privilegeLevel: 'elevated', description: 'Issue outbound vendor payments once approved.', sodConflicts: ['invoice-approver'] },
  { id: 'hr-record-editor', name: 'HR Record Editor', system: 'Workday', privilegeLevel: 'elevated', description: 'Edit employee HR records including compensation fields.' },
  { id: 'code-committer', name: 'Production Code Committer', system: 'GitHub', privilegeLevel: 'elevated', description: 'Commit and merge code directly to production-tracked branches.', sodConflicts: ['change-approver'] },
  { id: 'change-approver', name: 'Change Advisory Board Approver', system: 'ServiceNow', privilegeLevel: 'elevated', description: 'Approve production change requests before deployment.', sodConflicts: ['code-committer'] },
  { id: 'domain-admin', name: 'Active Directory Domain Admin', system: 'Active Directory', privilegeLevel: 'privileged', description: 'Full administrative control over the AD domain — highest-impact entitlement in the catalog.' },
  { id: 'db-admin', name: 'Production Database Admin', system: 'Snowflake', privilegeLevel: 'privileged', description: 'Full read/write/schema access to the production data warehouse.' },
  { id: 'billing-admin', name: 'Billing System Admin', system: 'Stripe', privilegeLevel: 'privileged', description: 'Issue refunds, modify subscription pricing, and access raw payment data.' },
  { id: 'deploy-prod', name: 'Production Deployment Access', system: 'CI/CD Pipeline', privilegeLevel: 'privileged', description: 'Trigger deployments directly to the production environment.' },
]

export function getCatalogItem(id: string): CatalogItem | undefined {
  return ACCESS_REQUEST_CATALOG.find((item) => item.id === id)
}
