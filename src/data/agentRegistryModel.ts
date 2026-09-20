import type { AgenticQuadrantId } from './agenticEcosystemQuadrants'

/**
 * The "agent needs a job description" model: a portable identity-record
 * schema for an AI agent, plus sample agent records used by the Agent
 * Registry & Lifecycle Studio playground (`/playground/agent-registry`) and
 * the Agentic Identity Center hub (`/next-gen/agentic-identity`, tab
 * `job-description`). Each field is deliberately mapped back onto a classic
 * IAM concept a practitioner already knows — that mapping is the core
 * teaching device (see NextGenIAM.md §5.3.3).
 * Last reviewed: 2026-09-19.
 */
export type AgentRecordFieldGroup =
  | 'Identity'
  | 'Ownership'
  | 'Principal'
  | 'Intent'
  | 'Authority'
  | 'Conditions'
  | 'Provenance'
  | 'Lifecycle'

export interface AgentRecordField {
  id: string
  group: AgentRecordFieldGroup
  label: string
  purpose: string
  /** The classic IAM concept this maps onto -- the teaching payload. */
  iamEquivalent: string
  required: boolean
  exampleValue: string
}

export const AGENT_RECORD_FIELDS: AgentRecordField[] = [
  { id: 'agent_id', group: 'Identity', label: 'Agent ID', purpose: 'A stable, unique identifier for this specific agent instance.', iamEquivalent: 'Subject identifier / SPIFFE ID for a workload', required: true, exampleValue: 'agent:refund-subagent:prod:7f3a' },
  { id: 'display_name', group: 'Identity', label: 'Display Name', purpose: 'A human-readable name shown in logs, dashboards, and approval prompts.', iamEquivalent: 'Account display name', required: true, exampleValue: 'Refund Processing Sub-Agent' },
  { id: 'model_fingerprint', group: 'Identity', label: 'Model / Runtime Fingerprint', purpose: 'Which model version and runtime this agent instance is built on, for supply-chain traceability.', iamEquivalent: 'Software Bill of Materials (SBOM) entry', required: true, exampleValue: 'claude-sonnet-5 / runtime v2.3.1' },
  { id: 'owner', group: 'Ownership', label: 'Human Owner', purpose: 'The specific person accountable for this agent\'s behavior.', iamEquivalent: 'Application/account owner attestation', required: true, exampleValue: 'jane.doe@example.com' },
  { id: 'accountable_team', group: 'Ownership', label: 'Accountable Team', purpose: 'The team that reviews and maintains this agent if the owner leaves.', iamEquivalent: 'Cost center / resource owner group', required: true, exampleValue: 'Customer Support Platform Team' },
  { id: 'escalation_contact', group: 'Ownership', label: 'Escalation Contact', purpose: 'Who to page when the agent is behaving unexpectedly and the owner is unreachable.', iamEquivalent: 'On-call / incident escalation policy', required: false, exampleValue: 'platform-oncall@example.com' },
  { id: 'principal_type', group: 'Principal', label: 'Principal Type', purpose: 'Whether the agent acts under its own service authority, a specific user\'s authority, or an organization\'s.', iamEquivalent: '`act`/`may_act` claims (RFC 8693 delegation)', required: true, exampleValue: 'acts-for-user' },
  { id: 'acting_for', group: 'Principal', label: 'Acting For', purpose: 'The specific user, team, or organization this agent instance currently represents.', iamEquivalent: 'Delegation chain subject', required: false, exampleValue: 'user:c.martinez@example.com' },
  { id: 'declared_intent', group: 'Intent', label: 'Declared Intent', purpose: 'A written purpose statement of what this agent is for.', iamEquivalent: 'Authorization request purpose / RAR `authorization_details`', required: true, exampleValue: 'Initiate refund requests for orders already approved by a support agent.' },
  { id: 'in_scope_tasks', group: 'Intent', label: 'In-Scope Tasks', purpose: 'The explicit list of tasks this agent is meant to perform.', iamEquivalent: 'Entitlement / role definition', required: true, exampleValue: 'Create refund request; check refund status' },
  { id: 'out_of_scope_tasks', group: 'Intent', label: 'Out-of-Scope Tasks', purpose: 'Tasks explicitly excluded, to make drift detectable even when not enforced technically.', iamEquivalent: 'Segregation-of-duties constraint', required: false, exampleValue: 'Approve refunds; modify refund amounts; access billing admin' },
  { id: 'permitted_tools', group: 'Authority', label: 'Permitted Tools', purpose: 'The exact set of tools/APIs this agent may call.', iamEquivalent: 'API scope grant', required: true, exampleValue: 'refund-api:create, refund-api:status' },
  { id: 'permitted_scopes', group: 'Authority', label: 'Permitted Scopes', purpose: 'The OAuth-style scopes issued to this agent\'s tokens.', iamEquivalent: 'OAuth scope list', required: true, exampleValue: 'refund:request' },
  { id: 'data_classes', group: 'Authority', label: 'Data Classes', purpose: 'The categories of data this agent may read or write.', iamEquivalent: 'Data classification / ABAC resource attribute', required: true, exampleValue: 'order-metadata (no PII, no payment-instrument data)' },
  { id: 'spend_limit', group: 'Authority', label: 'Spend / Rate Limit', purpose: 'A hard ceiling on cost or call volume, bounding the blast radius of a compromised or looping agent.', iamEquivalent: 'Rate limiting / budget policy', required: false, exampleValue: '$500/day, 200 calls/hour' },
  { id: 'environments', group: 'Conditions', label: 'Environments', purpose: 'Which environments (prod, staging) this agent identity is valid in.', iamEquivalent: 'Conditional access environment constraint', required: true, exampleValue: 'production' },
  { id: 'time_windows', group: 'Conditions', label: 'Time Windows', purpose: 'When this agent is permitted to act, if restricted.', iamEquivalent: 'Conditional access time-of-day policy', required: false, exampleValue: 'business hours only, America/New_York' },
  { id: 'approval_triggers', group: 'Conditions', label: 'Human-Approval Triggers', purpose: 'The specific conditions under which this agent must pause for human approval before acting.', iamEquivalent: 'Step-up authentication trigger', required: true, exampleValue: 'Refund amount > $200' },
  { id: 'registered_by', group: 'Provenance', label: 'Registered By', purpose: 'Who registered this agent in the first place.', iamEquivalent: 'Provisioning record', required: true, exampleValue: 'jane.doe@example.com' },
  { id: 'approvals', group: 'Provenance', label: 'Approvals', purpose: 'Who signed off on granting this agent its current authority.', iamEquivalent: 'Access request approval chain', required: true, exampleValue: 'Approved by: platform-security@example.com (2026-06-01)' },
  { id: 'change_history', group: 'Provenance', label: 'Change History', purpose: 'A log of every change to this agent\'s authority since registration.', iamEquivalent: 'Audit trail / entitlement change log', required: true, exampleValue: '2 changes: scope narrowed 2026-07-10; owner transferred 2026-08-02' },
  { id: 'review_cadence', group: 'Lifecycle', label: 'Review Cadence', purpose: 'How often this agent\'s authority is re-certified.', iamEquivalent: 'Access recertification cycle', required: true, exampleValue: 'Quarterly' },
  { id: 'expiry', group: 'Lifecycle', label: 'Expiry', purpose: 'The date this agent\'s identity and authority automatically lapse without renewal.', iamEquivalent: 'Account/credential expiration', required: true, exampleValue: '2026-12-31' },
  { id: 'revocation_trigger', group: 'Lifecycle', label: 'Revocation Trigger', purpose: 'The conditions that cause immediate revocation rather than waiting for the review cadence.', iamEquivalent: 'Just-in-time deprovisioning trigger', required: true, exampleValue: 'Owner leaves team; 3 consecutive drift-detection flags' },
  { id: 'decommission_plan', group: 'Lifecycle', label: 'Decommission Plan', purpose: 'What happens to this agent\'s credentials, data access, and audit trail when it is retired.', iamEquivalent: 'Leaver process (JML)', required: false, exampleValue: 'Revoke tokens immediately; retain audit log 7 years; archive config' },
]

export interface GovernanceGap {
  fieldId: string
  issue: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  fix: string
}

export interface SampleAgentRecord {
  id: string
  name: string
  quadrant: AgenticQuadrantId
  values: Record<string, string>
  /** Deliberate governance defects seeded for the Agent Registry Studio to detect. */
  governanceGaps: GovernanceGap[]
}

export const SAMPLE_AGENT_RECORDS: SampleAgentRecord[] = [
  {
    id: 'refund-subagent',
    name: 'Refund Processing Sub-Agent',
    quadrant: 'workforce',
    values: {
      agent_id: 'agent:refund-subagent:prod:7f3a',
      display_name: 'Refund Processing Sub-Agent',
      declared_intent: 'Initiate refund requests for orders already approved by a support agent.',
      permitted_scopes: 'refund:request',
      approval_triggers: 'Refund amount > $200',
    },
    governanceGaps: [
      { fieldId: 'owner', issue: 'No human owner is recorded — nobody is accountable if this agent misbehaves.', severity: 'critical', fix: 'Assign a named owner from the Customer Support Platform Team.' },
      { fieldId: 'expiry', issue: 'No expiry date is set; the agent\'s authority never automatically lapses.', severity: 'high', fix: 'Set a review-driven expiry (e.g. renew every 90 days) rather than leaving it open-ended.' },
      { fieldId: 'data_classes', issue: 'Data classes are undeclared, so it is unclear whether this agent can read payment-instrument data it does not need.', severity: 'medium', fix: 'Explicitly scope to order-metadata only, excluding payment-instrument fields.' },
    ],
  },
  {
    id: 'devops-deployer',
    name: 'Cloud Deployer Sub-Agent',
    quadrant: 'enterprise',
    values: {
      agent_id: 'agent:cloud-deployer:prod:2c91',
      display_name: 'Cloud Deployer Sub-Agent',
      declared_intent: 'Trigger production Kubernetes deployments for releases already approved in the CI pipeline.',
      permitted_scopes: 'deploy:trigger, secrets:read',
      owner: 'devops-lead@example.com',
    },
    governanceGaps: [
      { fieldId: 'permitted_scopes', issue: 'Holds `secrets:read` in addition to `deploy:trigger` — the deploy action does not require reading secrets directly, and a compromised agent with this scope can exfiltrate credentials.', severity: 'critical', fix: 'Narrow scopes to `deploy:trigger` only; have the deployment pipeline itself (not the agent) fetch secrets via short-lived workload identity.' },
      { fieldId: 'approval_triggers', issue: 'No human-approval trigger exists for production deploys outside business hours.', severity: 'medium', fix: 'Require step-up approval for any deploy triggered outside the standard change window.' },
    ],
  },
  {
    id: 'clinical-research-agent',
    name: 'Clinical Trials Query Sub-Agent',
    quadrant: 'partners',
    values: {
      agent_id: 'agent:clinical-query:prod:9b12',
      display_name: 'Clinical Trials Query Sub-Agent',
      declared_intent: 'Query an external clinical trials database for anonymized trial-matching results.',
      permitted_scopes: 'trial:query, patient:phi',
      owner: 'clinical-research-lead@example.com',
      data_classes: 'anonymized trial metadata',
    },
    governanceGaps: [
      { fieldId: 'permitted_scopes', issue: 'Carries `patient:phi` (Protected Health Information) alongside `trial:query`, but the declared intent only requires anonymized queries — this scope crosses an organizational trust boundary into regulated data the partner does not need.', severity: 'critical', fix: 'Remove `patient:phi`; if identifiable data is genuinely required, that is a materially different, higher-scrutiny delegation that needs its own explicit approval.' },
      { fieldId: 'acting_for', issue: '"Acting For" is not recorded, so the specific clinician or study this agent represents cannot be traced from the record alone.', severity: 'medium', fix: 'Record the specific clinician or study protocol ID this agent instance is scoped to.' },
    ],
  },
  {
    id: 'claims-filing-agent',
    name: 'Consumer Claims-Filing Agent',
    quadrant: 'consumers',
    values: {
      agent_id: 'agent:claims-filing:prod:4e77',
      display_name: 'Consumer Claims-Filing Agent',
      declared_intent: 'File a single lost-property claim on behalf of the consumer who invoked it, for this session only.',
      permitted_scopes: 'claims:submit',
      owner: 'consumer-experience-lead@example.com',
      expiry: 'end of session',
      approval_triggers: 'none — consumer is present and approves each submission directly',
    },
    governanceGaps: [
      { fieldId: 'revocation_trigger', issue: 'No revocation trigger is defined for when the consumer closes the app mid-task — the agent\'s authority may outlive the session it was meant to be scoped to.', severity: 'high', fix: 'Bind revocation to session termination explicitly, not just to a time-based expiry.' },
    ],
  },
  {
    id: 'orchestrator-overgoverned',
    name: 'Enterprise Search Orchestrator (Over-Governed)',
    quadrant: 'enterprise',
    values: {
      agent_id: 'agent:search-orchestrator:prod:1a05',
      display_name: 'Enterprise Search Orchestrator',
      declared_intent: 'Answer employee questions by searching across approved internal knowledge sources.',
      permitted_scopes: 'search:read-approved-sources-only',
      owner: 'knowledge-platform-lead@example.com',
      approval_triggers: 'every single search query requires manager approval',
      time_windows: 'Tuesdays 10:00-11:00 only',
    },
    governanceGaps: [
      { fieldId: 'approval_triggers', issue: 'Requiring approval for every read-only search query makes the agent unusable for its stated low-risk purpose — this is over-governance, not security.', severity: 'medium', fix: 'Reserve approval triggers for genuinely risky actions (e.g. writes, cross-boundary data access); a read-only internal search does not need one.' },
      { fieldId: 'time_windows', issue: 'Restricting a read-only internal search assistant to a single hour per week defeats its purpose without reducing any real risk.', severity: 'low', fix: 'Remove the time restriction, or replace it with a risk-proportionate control (e.g. rate limiting) instead.' },
    ],
  },
  {
    id: 'swarm-coordinator',
    name: 'Multi-Agent Swarm Coordinator',
    quadrant: 'enterprise',
    values: {
      agent_id: 'agent:swarm-coordinator:prod:6f20',
      display_name: 'Multi-Agent Swarm Coordinator',
      declared_intent: 'Coordinate a team of specialized sub-agents (search, summarize, draft) to produce a research brief.',
      permitted_scopes: 'orchestrate:spawn-subagent',
      owner: 'research-platform-lead@example.com',
    },
    governanceGaps: [
      { fieldId: 'permitted_scopes', issue: 'Holds authority to spawn sub-agents but no constraint on what authority those sub-agents inherit — without an explicit narrowing rule, a spawned sub-agent could inherit the coordinator\'s full scope by default.', severity: 'high', fix: 'Add an explicit sub-agent scope-narrowing rule: each spawned sub-agent gets only the minimum scopes its specific sub-task requires, never the coordinator\'s full set.' },
      { fieldId: 'change_history', issue: 'No change history is recorded despite this agent having spawned sub-agents in the past — sub-agent creation events are not logged as authority changes.', severity: 'medium', fix: 'Log every sub-agent spawn event as an entry in the change history, including the scopes granted to the sub-agent.' },
    ],
  },
]

export function getFieldsByGroup(group: AgentRecordFieldGroup): AgentRecordField[] {
  return AGENT_RECORD_FIELDS.filter((f) => f.group === group)
}

export function getSampleAgentById(id: string): SampleAgentRecord | undefined {
  return SAMPLE_AGENT_RECORDS.find((a) => a.id === id)
}
