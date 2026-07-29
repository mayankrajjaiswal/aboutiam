export type CiemNodeType = 'role' | 'policy' | 'resource' | 'account'
export type CiemEdgeType = 'CanAssume' | 'Grants' | 'TrustsAccount'

export interface CiemNode {
  id: string
  label: string
  type: CiemNodeType
}

export interface CiemEdge {
  id: string
  source: string
  target: string
  type: CiemEdgeType
  /** For 'Grants' edges only: the specific IAM permission the source role has on the target resource. */
  permission?: string
}

export interface ToxicCombinationRule {
  id: string
  name: string
  description: string
  requiredPermissions: [string, string]
}

export const TOXIC_COMBINATION_RULES: ToxicCombinationRule[] = [
  {
    id: 'passrole-createfunction',
    name: 'PassRole + CreateFunction Privilege Escalation',
    description: 'A role that can pass an IAM role to a new Lambda function and also create Lambda functions can attach a privileged role to code it controls, then invoke it to act with that role\'s permissions.',
    requiredPermissions: ['iam:PassRole', 'lambda:CreateFunction'],
  },
  {
    id: 'passrole-runinstances',
    name: 'PassRole + RunInstances Privilege Escalation',
    description: 'A role that can pass a role to a new EC2 instance and also launch instances can attach a privileged instance profile to a machine it controls.',
    requiredPermissions: ['iam:PassRole', 'ec2:RunInstances'],
  },
]

export interface AccessLogEntry {
  roleId: string
  permission: string
  used: boolean
}

export interface CiemScenario {
  id: string
  title: string
  description: string
  nodes: CiemNode[]
  edges: CiemEdge[]
  accessLog: AccessLogEntry[]
}

export const CIEM_SCENARIOS: CiemScenario[] = [
  {
    id: 'direct-toxic-combo',
    title: 'Direct Toxic Combination',
    description: 'A single developer role is directly granted both halves of a known privilege-escalation pair — no cross-account chain required.',
    nodes: [
      { id: 'dev-role', label: 'DeveloperRole', type: 'role' },
      { id: 'lambda-service', label: 'Lambda Service', type: 'resource' },
      { id: 'iam-roles', label: 'IAM Roles', type: 'resource' },
      { id: 's3-bucket', label: 'S3 Data Bucket', type: 'resource' },
    ],
    edges: [
      { id: 'e1', source: 'dev-role', target: 'lambda-service', type: 'Grants', permission: 'lambda:CreateFunction' },
      { id: 'e2', source: 'dev-role', target: 'iam-roles', type: 'Grants', permission: 'iam:PassRole' },
      { id: 'e3', source: 'dev-role', target: 's3-bucket', type: 'Grants', permission: 's3:GetObject' },
    ],
    accessLog: [
      { roleId: 'dev-role', permission: 'lambda:CreateFunction', used: true },
      { roleId: 'dev-role', permission: 'iam:PassRole', used: false },
      { roleId: 'dev-role', permission: 's3:GetObject', used: true },
    ],
  },
  {
    id: 'cross-account-toxic-combo',
    title: 'Cross-Account Toxic Combination',
    description: 'Neither role has the full toxic pair on its own — the escalation only becomes reachable once a cross-account trust lets one role assume the other.',
    nodes: [
      { id: 'account-a', label: 'Account A', type: 'account' },
      { id: 'account-b', label: 'Account B', type: 'account' },
      { id: 'readonly-role', label: 'ReadOnlyRole (Account A)', type: 'role' },
      { id: 'audit-role', label: 'AuditRole (Account B)', type: 'role' },
      { id: 'lambda-service', label: 'Lambda Service', type: 'resource' },
      { id: 'iam-roles', label: 'IAM Roles', type: 'resource' },
    ],
    edges: [
      { id: 'e1', source: 'account-a', target: 'account-b', type: 'TrustsAccount' },
      { id: 'e2', source: 'readonly-role', target: 'audit-role', type: 'CanAssume' },
      { id: 'e3', source: 'readonly-role', target: 'lambda-service', type: 'Grants', permission: 'lambda:CreateFunction' },
      { id: 'e4', source: 'audit-role', target: 'iam-roles', type: 'Grants', permission: 'iam:PassRole' },
    ],
    accessLog: [
      { roleId: 'readonly-role', permission: 'lambda:CreateFunction', used: true },
      { roleId: 'audit-role', permission: 'iam:PassRole', used: false },
    ],
  },
  {
    id: 'clean-least-privilege',
    title: 'Clean, Least-Privilege Role',
    description: 'A role with no reachable toxic combination at all — a baseline to confirm the detector doesn\'t cry wolf.',
    nodes: [
      { id: 'reporting-role', label: 'ReportingRole', type: 'role' },
      { id: 's3-bucket', label: 'S3 Reports Bucket', type: 'resource' },
      { id: 'cloudwatch', label: 'CloudWatch Logs', type: 'resource' },
    ],
    edges: [
      { id: 'e1', source: 'reporting-role', target: 's3-bucket', type: 'Grants', permission: 's3:GetObject' },
      { id: 'e2', source: 'reporting-role', target: 'cloudwatch', type: 'Grants', permission: 'logs:GetLogEvents' },
    ],
    accessLog: [
      { roleId: 'reporting-role', permission: 's3:GetObject', used: true },
      { roleId: 'reporting-role', permission: 'logs:GetLogEvents', used: true },
    ],
  },
]
