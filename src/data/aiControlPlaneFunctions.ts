/**
 * The four-function loop that makes up an AI control plane (a.k.a. "AI
 * security fabric"): Discover -> Decide -> Enforce -> Observe, feeding back
 * into Discover. Feeds the AI Security Fabric Center hub
 * (`/next-gen/ai-security-fabric`, tab `concept`). Explicit analogy to a
 * network control plane (PEP/PDP split) since most IAM practitioners already
 * know that model. Re-authored framing, not reproduced from any external
 * source -- see NextGenIAM.md §5.4.1.
 * Last reviewed: 2026-09-19.
 */
export interface AiControlPlaneFunction {
  id: 'discover' | 'decide' | 'enforce' | 'observe'
  order: number
  title: string
  question: string
  description: string
  /** The classic network/IAM control-plane analogue, for the explicit teaching bridge. */
  classicAnalogue: string
  capabilities: string[]
  /** What feeds into this function from the previous stage of the loop. */
  feedsFrom: string
}

export const AI_CONTROL_PLANE_FUNCTIONS: AiControlPlaneFunction[] = [
  {
    id: 'discover',
    order: 1,
    title: 'Discover',
    question: 'What agents, models, and tools actually exist -- registered or not?',
    description: 'Continuous inventory of every agent instance, model endpoint, and MCP tool exposure across the estate, including unregistered "shadow AI" that never went through a formal onboarding process.',
    classicAnalogue: 'Asset discovery / CMDB reconciliation, and CIEM\'s discovery of unused cloud entitlements.',
    capabilities: ['Agent and model endpoint inventory', 'MCP tool exposure mapping', 'Shadow AI detection'],
    feedsFrom: 'Observe (the loop\'s previous cycle) -- new or anomalous entities surfaced by observability get added to the inventory.',
  },
  {
    id: 'decide',
    order: 2,
    title: 'Decide',
    question: 'Given what exists, what should be allowed?',
    description: 'Policy evaluation combining structured rules (classic ABAC/RBAC-style conditions) with semantic guardrails that assess the meaning and intent of a request, not just its formal attributes.',
    classicAnalogue: 'The Policy Decision Point (PDP) in a PEP/PDP architecture.',
    capabilities: ['Structured policy engine', 'Semantic guardrail evaluation', 'Risk scoring per request'],
    feedsFrom: 'Discover -- the decision engine can only evaluate agents and tools it knows about.',
  },
  {
    id: 'enforce',
    order: 3,
    title: 'Enforce',
    question: 'How is that decision actually carried out?',
    description: 'Runtime enforcement of the decision: allowing, blocking, or modifying agent actions and tool calls, and applying egress controls to prevent sensitive data leaving through agent outputs.',
    classicAnalogue: 'The Policy Enforcement Point (PEP) -- a network firewall or API gateway, applied to agent traffic instead of network packets.',
    capabilities: ['AI firewall / inline blocking', 'Egress data-loss prevention', 'Tool-call interception'],
    feedsFrom: 'Decide -- enforcement carries out exactly what the decision function determined, nothing more.',
  },
  {
    id: 'observe',
    order: 4,
    title: 'Observe',
    question: 'What actually happened, and does it warrant escalation?',
    description: 'Behavioral telemetry comparing declared intent against observed action, anomaly baselining, and audit-trail generation -- the signal that drives both the intervention ladder and the next Discover cycle.',
    classicAnalogue: 'SIEM/UEBA behavioral analytics, applied to agent action streams instead of user login events.',
    capabilities: ['Task-drift detection', 'Anomaly baselining', 'Audit-chain generation', 'Intervention-ladder triggering'],
    feedsFrom: 'Enforce -- every enforced (or allowed) action becomes a telemetry event for observability to evaluate.',
  },
]

export function getFunctionById(id: AiControlPlaneFunction['id']): AiControlPlaneFunction | undefined {
  return AI_CONTROL_PLANE_FUNCTIONS.find((f) => f.id === id)
}
