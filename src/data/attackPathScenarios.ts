export type GraphNodeType = 'user' | 'group' | 'service-account' | 'machine' | 'target'
export type GraphEdgeType = 'MemberOf' | 'AdminTo' | 'HasSession' | 'CanRDP' | 'Owns'

export interface GraphNode {
  id: string
  label: string
  type: GraphNodeType
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: GraphEdgeType
  /** Real-world technique name this hop represents (simplified BloodHound-style edge semantics). */
  technique: string
}

export interface AttackPathScenario {
  id: string
  title: string
  difficulty: 'Beginner' | 'Advanced'
  description: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  startNodeId: string
  targetNodeId: string
  /** The ordered node ids from startNodeId to targetNodeId along the true shortest escalation path. */
  shortestPath: string[]
}

export const ATTACK_PATH_SCENARIOS: AttackPathScenario[] = [
  {
    id: 'obvious-path',
    title: 'Help Desk to Domain Admin',
    difficulty: 'Beginner',
    description: 'A single, mostly-linear escalation chain from a low-privilege user to Domain Admins — a good first BloodHound-style trace with only a couple of dead-end decoys.',
    startNodeId: 'alice',
    targetNodeId: 'domain_admins',
    shortestPath: ['alice', 'it_support', 'wkst042', 'svc_sql', 'dbserver01', 'bob_admin', 'domain_admins'],
    nodes: [
      { id: 'alice', label: 'alice', type: 'user' },
      { id: 'it_support', label: 'IT-Support', type: 'group' },
      { id: 'wkst042', label: 'WKST-042', type: 'machine' },
      { id: 'svc_sql', label: 'svc_sql', type: 'service-account' },
      { id: 'dbserver01', label: 'DB-SERVER01', type: 'machine' },
      { id: 'bob_admin', label: 'bob_admin', type: 'user' },
      { id: 'domain_admins', label: 'Domain Admins', type: 'target' },
      { id: 'carol', label: 'carol', type: 'user' },
      { id: 'hr_group', label: 'HR-Group', type: 'group' },
      { id: 'wkst099', label: 'WKST-099', type: 'machine' }
    ],
    edges: [
      { id: 'e1', source: 'alice', target: 'it_support', type: 'MemberOf', technique: 'Nested Group Membership' },
      { id: 'e2', source: 'it_support', target: 'wkst042', type: 'AdminTo', technique: 'Local Admin Rights (GenericAll ACL)' },
      { id: 'e3', source: 'wkst042', target: 'svc_sql', type: 'HasSession', technique: 'Credential Dumping (Mimikatz/LSASS)' },
      { id: 'e4', source: 'svc_sql', target: 'dbserver01', type: 'AdminTo', technique: 'Service Account Reuse Across Hosts' },
      { id: 'e5', source: 'dbserver01', target: 'bob_admin', type: 'HasSession', technique: 'Session Hijacking' },
      { id: 'e6', source: 'bob_admin', target: 'domain_admins', type: 'MemberOf', technique: 'Domain Admin Group Membership' },
      { id: 'e7', source: 'carol', target: 'hr_group', type: 'MemberOf', technique: 'Nested Group Membership' },
      { id: 'e8', source: 'alice', target: 'wkst099', type: 'CanRDP', technique: 'Lateral Movement via RDP' }
    ]
  },
  {
    id: 'multiple-false-paths',
    title: 'Contractor Account to Cloud Admin',
    difficulty: 'Advanced',
    description: 'A larger, branching graph with a genuinely shorter escalation route and a longer, more tempting-looking alternate route that merges back in later — plus several dead-end decoy branches.',
    startNodeId: 'u1',
    targetNodeId: 'cloud_admin',
    shortestPath: ['u1', 'g1', 'm1', 'sa1', 'm2', 'u2', 'cloud_admin'],
    nodes: [
      { id: 'u1', label: 'contractor01', type: 'user' },
      { id: 'g1', label: 'Contractors-Group', type: 'group' },
      { id: 'm1', label: 'JUMP-BOX01', type: 'machine' },
      { id: 'sa1', label: 'svc_deploy', type: 'service-account' },
      { id: 'm2', label: 'APP-SERVER02', type: 'machine' },
      { id: 'u2', label: 'ops_lead', type: 'user' },
      { id: 'cloud_admin', label: 'Cloud Admin Role', type: 'target' },
      { id: 'g2', label: 'Dev-Group', type: 'group' },
      { id: 'm3', label: 'DEV-BOX03', type: 'machine' },
      { id: 'm4', label: 'DEV-BOX04', type: 'machine' },
      { id: 'sa2', label: 'svc_ci', type: 'service-account' },
      { id: 'm5', label: 'BUILD-SERVER05', type: 'machine' },
      { id: 'u3', label: 'release_mgr', type: 'user' },
      { id: 'g3', label: 'Guest-Group', type: 'group' },
      { id: 'm6', label: 'KIOSK06', type: 'machine' },
      { id: 'u4', label: 'intern04', type: 'user' },
      { id: 'g4', label: 'Interns-Group', type: 'group' },
      { id: 'm7', label: 'LAB-BOX07', type: 'machine' },
      { id: 'm8', label: 'BACKUP08', type: 'machine' },
      { id: 'm9', label: 'ARCHIVE09', type: 'machine' },
      { id: 'u5', label: 'vendor05', type: 'user' },
      { id: 'm10', label: 'VENDOR-BOX10', type: 'machine' },
      { id: 'm11', label: 'PRINT-SRV11', type: 'machine' },
      { id: 'sa4', label: 'svc_report', type: 'service-account' }
    ],
    edges: [
      { id: 'e1', source: 'u1', target: 'g1', type: 'MemberOf', technique: 'Nested Group Membership' },
      { id: 'e2', source: 'g1', target: 'm1', type: 'AdminTo', technique: 'Local Admin Rights (GenericAll ACL)' },
      { id: 'e3', source: 'm1', target: 'sa1', type: 'HasSession', technique: 'Credential Dumping (Mimikatz/LSASS)' },
      { id: 'e4', source: 'sa1', target: 'm2', type: 'AdminTo', technique: 'Service Account Reuse Across Hosts' },
      { id: 'e5', source: 'm2', target: 'u2', type: 'HasSession', technique: 'Session Hijacking' },
      { id: 'e6', source: 'u2', target: 'cloud_admin', type: 'MemberOf', technique: 'Cloud Admin Role Assignment' },

      { id: 'e7', source: 'u1', target: 'g2', type: 'MemberOf', technique: 'Nested Group Membership' },
      { id: 'e8', source: 'g2', target: 'm3', type: 'AdminTo', technique: 'GenericWrite ACL Abuse' },
      { id: 'e9', source: 'm3', target: 'm4', type: 'CanRDP', technique: 'Lateral Movement via RDP' },
      { id: 'e10', source: 'm4', target: 'sa2', type: 'HasSession', technique: 'Credential Dumping (Mimikatz/LSASS)' },
      { id: 'e11', source: 'sa2', target: 'm5', type: 'AdminTo', technique: 'Service Account Reuse Across Hosts' },
      { id: 'e12', source: 'm5', target: 'u3', type: 'HasSession', technique: 'Session Hijacking' },
      { id: 'e13', source: 'u3', target: 'm2', type: 'CanRDP', technique: 'Lateral Movement via RDP' },

      { id: 'e14', source: 'u1', target: 'g3', type: 'MemberOf', technique: 'Nested Group Membership' },
      { id: 'e15', source: 'g3', target: 'm6', type: 'AdminTo', technique: 'Local Admin Rights (GenericAll ACL)' },
      { id: 'e16', source: 'u4', target: 'g4', type: 'MemberOf', technique: 'Nested Group Membership' },
      { id: 'e17', source: 'g4', target: 'm7', type: 'AdminTo', technique: 'Local Admin Rights (GenericAll ACL)' },
      { id: 'e18', source: 'm1', target: 'm8', type: 'AdminTo', technique: 'Local Admin Rights (GenericAll ACL)' },
      { id: 'e19', source: 'sa1', target: 'm9', type: 'Owns', technique: 'Service Account Object Ownership' },
      { id: 'e20', source: 'u5', target: 'm10', type: 'CanRDP', technique: 'Lateral Movement via RDP' },
      { id: 'e21', source: 'g1', target: 'm11', type: 'AdminTo', technique: 'Local Admin Rights (GenericAll ACL)' },
      { id: 'e22', source: 'm2', target: 'sa4', type: 'Owns', technique: 'Object Ownership Abuse' }
    ]
  }
]
