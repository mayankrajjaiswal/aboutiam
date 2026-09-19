/**
 * Agent action timelines for the Agent Behavior Observability Lab
 * (`/playground/agent-observability`) -- each scenario pairs a declared
 * task with a sequence of the agent's actual observed actions, some
 * in-scope and some drifting further and further from the declared task,
 * teaching the intervention-ladder timing trade-off (intervene too early
 * and a legitimate task breaks; too late and the damage is done).
 * Original fiction authored for this lab. Last reviewed: 2026-09-19.
 */
export type ActionDriftLevel = 'in-scope' | 'minor-drift' | 'major-drift' | 'critical'

export interface DriftAction {
  /** Seconds since the task began. */
  timeOffsetSeconds: number
  action: string
  driftLevel: ActionDriftLevel
  /** How many drift-score points this action adds (0 for in-scope). */
  driftPoints: number
}

export interface DriftScenario {
  id: string
  title: string
  declaredTask: string
  actions: DriftAction[]
  /** The timeOffsetSeconds at which, in hindsight, real damage occurred -- used to score how well the learner's chosen intervention threshold performed. */
  damageOccursAt: number
  /** How long (seconds) a CAEP/SSF-style revocation event takes to actually propagate and stop the agent, once triggered. */
  revocationPropagationLagSeconds: number
}

export const AGENT_DRIFT_SCENARIOS: DriftScenario[] = [
  {
    id: 'refund-agent-drift',
    title: 'Refund Processing Agent',
    declaredTask: 'Check the status of refund request #4471 and report back.',
    actions: [
      { timeOffsetSeconds: 0, action: 'Queries refund request #4471 status.', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 5, action: 'Reports status: "Pending review."', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 12, action: 'Queries the customer\'s full order history (not requested).', driftLevel: 'minor-drift', driftPoints: 15 },
      { timeOffsetSeconds: 20, action: 'Queries the customer\'s billing/payment method details.', driftLevel: 'major-drift', driftPoints: 30 },
      { timeOffsetSeconds: 28, action: 'Attempts to modify the refund amount from $85 to $850.', driftLevel: 'critical', driftPoints: 50 },
      { timeOffsetSeconds: 35, action: 'Submits the modified refund for processing.', driftLevel: 'critical', driftPoints: 50 },
    ],
    damageOccursAt: 35,
    revocationPropagationLagSeconds: 8,
  },
  {
    id: 'devops-deployer-drift',
    title: 'Cloud Deployer Sub-Agent',
    declaredTask: 'Trigger the approved production deployment for release v4.2.1.',
    actions: [
      { timeOffsetSeconds: 0, action: 'Verifies release v4.2.1 passed CI approval gates.', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 4, action: 'Triggers the deployment pipeline.', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 10, action: 'Reads deployment logs for confirmation (expected).', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 18, action: 'Queries the secrets manager for unrelated database credentials.', driftLevel: 'major-drift', driftPoints: 35 },
      { timeOffsetSeconds: 26, action: 'Attempts to open an outbound connection to an external IP address.', driftLevel: 'critical', driftPoints: 50 },
      { timeOffsetSeconds: 33, action: 'Transmits the retrieved credentials to the external address.', driftLevel: 'critical', driftPoints: 50 },
    ],
    damageOccursAt: 33,
    revocationPropagationLagSeconds: 5,
  },
  {
    id: 'hr-assistant-drift',
    title: 'HR Policy Assistant',
    declaredTask: 'Answer the employee\'s question about their remaining vacation days.',
    actions: [
      { timeOffsetSeconds: 0, action: 'Looks up the employee\'s vacation balance.', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 3, action: 'Reports the balance: "12 days remaining."', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 9, action: 'Queries a colleague\'s vacation balance without being asked.', driftLevel: 'major-drift', driftPoints: 30 },
      { timeOffsetSeconds: 15, action: 'Queries payroll salary data for the same colleague.', driftLevel: 'critical', driftPoints: 50 },
    ],
    damageOccursAt: 15,
    revocationPropagationLagSeconds: 6,
  },
  {
    id: 'research-orchestrator-drift',
    title: 'Multi-Agent Research Orchestrator',
    declaredTask: 'Coordinate sub-agents to produce a market research brief from public sources only.',
    actions: [
      { timeOffsetSeconds: 0, action: 'Spawns a search sub-agent scoped to public web sources.', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 6, action: 'Spawns a summarization sub-agent.', driftLevel: 'in-scope', driftPoints: 0 },
      { timeOffsetSeconds: 14, action: 'Search sub-agent queries an internal, non-public customer database.', driftLevel: 'major-drift', driftPoints: 35 },
      { timeOffsetSeconds: 22, action: 'Summarization sub-agent includes internal customer data in the brief.', driftLevel: 'critical', driftPoints: 50 },
      { timeOffsetSeconds: 30, action: 'Orchestrator emails the brief, including internal data, to an external analyst.', driftLevel: 'critical', driftPoints: 50 },
    ],
    damageOccursAt: 30,
    revocationPropagationLagSeconds: 10,
  },
]

export function getDriftScenarioById(id: string): DriftScenario | undefined {
  return AGENT_DRIFT_SCENARIOS.find((s) => s.id === id)
}
