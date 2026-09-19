/**
 * The two complementary control surfaces for agent governance: design-time
 * Agent Identity (who is this agent, what may it do) and run-time AI Security
 * Fabric (what is it actually doing, should we intervene). Feeds the
 * Agentic Identity Center hub (`/next-gen/agentic-identity`, tab `governance`)
 * -- see NextGenIAM.md §1.2 for the pedagogical rationale for teaching these
 * as a paired model. Re-authored capability taxonomy, not reproduced from
 * any external source.
 * Last reviewed: 2026-09-19.
 */
export type GovernanceColumn = 'identity' | 'fabric'

export interface GovernanceCapability {
  id: string
  column: GovernanceColumn
  question: string
  capability: string
  description: string
}

export const AGENT_GOVERNANCE_CAPABILITIES: GovernanceCapability[] = [
  // Agent Identity (design-time / issuance)
  {
    id: 'identity-who',
    column: 'identity',
    question: 'Who is this agent?',
    capability: 'Agent Registry',
    description: 'A canonical, queryable inventory of every agent instance in the organization, each with a stable identifier -- the precondition for governing anything else.',
  },
  {
    id: 'identity-owner',
    column: 'identity',
    question: 'Who is it working for?',
    capability: 'Agent Identity & Ownership',
    description: 'A named human owner and principal binding (whose authority the agent acts under) recorded against every agent, so accountability survives personnel changes.',
  },
  {
    id: 'identity-purpose',
    column: 'identity',
    question: 'What is it allowed to do?',
    capability: 'Declared Agent Intent',
    description: 'A written purpose statement and explicit in-scope/out-of-scope task list, giving drift detection something concrete to compare observed behavior against.',
  },
  {
    id: 'identity-access',
    column: 'identity',
    question: 'What data and services can it access?',
    capability: 'MCP Tool & Data Protection',
    description: 'Scoped, least-privilege authority over the specific tools and data classes an agent may reach -- enforced at issuance, not left to the model\'s own judgment.',
  },
  {
    id: 'identity-conditions',
    column: 'identity',
    question: 'Under what circumstances?',
    capability: 'Conditional Authority',
    description: 'Environment, time-window, and human-approval-trigger constraints on when the agent\'s authority is actually usable.',
  },
  // AI Security Fabric (run-time / enforcement)
  {
    id: 'fabric-doing',
    column: 'fabric',
    question: 'What is the agent actually doing?',
    capability: 'Discovery & Observability',
    description: 'Continuous visibility into every agent, model endpoint, and MCP tool call actually occurring -- surfacing shadow AI that never went through registration.',
  },
  {
    id: 'fabric-drift',
    column: 'fabric',
    question: 'Is it staying within the task it was given?',
    capability: 'Task-Drift Detection',
    description: 'Comparison of an agent\'s declared intent against its observed actions, flagging divergence before it becomes an incident.',
  },
  {
    id: 'fabric-steer',
    column: 'fabric',
    question: 'Is someone trying to steer it off course?',
    capability: 'Semantic Guardrails / AI Firewall',
    description: 'Runtime evaluation of the meaning and intent of natural-language and tool-call payloads -- catching prompt injection and manipulation that structural policy alone would miss.',
  },
  {
    id: 'fabric-egress',
    column: 'fabric',
    question: 'Is sensitive information leaving the business?',
    capability: 'Egress Data Protection',
    description: 'Classification-aware controls on what data an agent\'s outputs and tool responses are permitted to carry outside an approved boundary.',
  },
  {
    id: 'fabric-intervene',
    column: 'fabric',
    question: 'When should we step in?',
    capability: 'Intervention & Dashboard',
    description: 'A graduated intervention ladder (log, warn, require approval, throttle, block, revoke) driven by the signals above, with a dashboard for the humans who make that call.',
  },
]

export function getCapabilitiesByColumn(column: GovernanceColumn): GovernanceCapability[] {
  return AGENT_GOVERNANCE_CAPABILITIES.filter((c) => c.column === column)
}
