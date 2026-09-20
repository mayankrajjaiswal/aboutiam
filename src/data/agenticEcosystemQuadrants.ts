/**
 * The four ecosystems in which an AI agent acts, each with a distinct trust
 * boundary and threat profile. This is the organizing model for the Agentic
 * Identity Center (`/next-gen/agentic-identity`, tab `quadrants`) and for the
 * Delegation Chain Auditor playground. Re-authored conceptual framework —
 * see NextGenIAM.md §1.1 and §2.3 for why this taxonomy is safe to teach
 * (it is a natural classification, not proprietary content, and every
 * example below is original, not reproduced from any source deck).
 * Last reviewed: 2026-09-19.
 */
export type AgenticQuadrantId = 'enterprise' | 'workforce' | 'partners' | 'consumers'

export interface AgenticQuadrant {
  id: AgenticQuadrantId
  title: string
  whoActs: string
  /** An original worked example, not reproduced from any external source. */
  exampleAsk: string
  identityProblems: string[]
  /** standardsData.ts ids where a direct match exists, plus other standard names as plain text. */
  applicableStandards: string[]
  threatProfile: string[]
  governanceNotes: string
  relatedLabs: string[]
}

export const AGENTIC_QUADRANTS: AgenticQuadrant[] = [
  {
    id: 'enterprise',
    title: 'Enterprise',
    whoActs: 'Agents operating entirely inside the organization\'s own environment, against its own systems and data.',
    exampleAsk: 'An internal support-ticket triage agent scans new tickets, checks them against a completeness policy, and flags any missing required fields back to the submitter.',
    identityProblems: [
      'What is the agent\'s standing authority when no human is in the loop for routine actions?',
      'Is the agent\'s identity distinguishable from the service account or pipeline that launched it?',
      'When the agent spawns a sub-agent for a sub-task, does authority narrow or stay as broad as the parent?',
    ],
    applicableStandards: ['spiffe-spire', 'rfc8693', 'oauth21'],
    threatProfile: [
      'Lateral movement via an over-broad service credential reused across many internal tools',
      'Secret sprawl — agent configuration holding long-lived static credentials instead of short-lived workload identity',
      'Silent privilege accumulation as an agent is reused for adjacent tasks over time without re-scoping',
    ],
    governanceNotes: 'The closest solved analogue is workload identity (SPIFFE/SPIRE): short-lived, cryptographically verifiable identity issued per workload instance rather than a shared static secret. Enterprise agents should be modeled the same way — an agent instance gets its own scoped identity, not a copy of a shared service account\'s.',
    relatedLabs: ['/playground/agent-identity', '/playground/workload-identity', '/playground/nhi-sprawl'],
  },
  {
    id: 'workforce',
    title: 'Modern Workforce',
    whoActs: 'Employees working alongside their own agents, where the agent prepares work and a human retains the decision.',
    exampleAsk: 'An analyst\'s research agent reviews a batch of vendor contracts, drafts a risk summary and a recommendation for each, and queues them for the analyst to approve or reject.',
    identityProblems: [
      'Whose authority does the agent act under — the employee\'s full entitlements, or a narrower delegated set?',
      'How is a human-approval checkpoint enforced so the agent cannot silently skip it under load or on retry?',
      'If the recommendation was wrong, who is accountable — the employee who approved it, or the agent that drafted it?',
    ],
    applicableStandards: ['ciba', 'oauth21', 'rfc9396-rar'],
    threatProfile: [
      'Approval rubber-stamping — the human-in-the-loop step becomes a formality under volume, defeating its purpose',
      'Consent/authority scope creep — an agent originally scoped to "draft" quietly gains a "submit" capability',
      'Accountability gaps when an incident review cannot tell whether a human or the agent made the actual decision',
    ],
    governanceNotes: 'OpenID Connect CIBA is the closest standards fit: it decouples the device initiating a request from the device where a human actually authenticates and approves it — the same separation a workforce agent needs between "the agent proposed this" and "a human authorized this."',
    relatedLabs: ['/playground/agent-identity', '/playground/token-exchange'],
  },
  {
    id: 'partners',
    title: 'Business Partners',
    whoActs: 'Partner or seller agents reaching an organization\'s shared services on behalf of their own clients.',
    exampleAsk: 'A brokerage\'s claims-intake agent submits a claim into an insurer\'s shared claims API on behalf of the brokerage\'s own client.',
    identityProblems: [
      'Does the insurer\'s system see the brokerage, the brokerage\'s agent, or the end client as the acting principal?',
      'How is a multi-hop chain (client → brokerage → brokerage\'s agent → insurer API) kept auditable end-to-end?',
      'What stops the partner\'s agent from acting outside the specific relationship it was onboarded for?',
    ],
    applicableStandards: ['rfc8693', 'vc-did', 'openid4vc'],
    threatProfile: [
      'Confused deputy — the insurer\'s API trusts the brokerage\'s agent more broadly than the specific delegation warrants',
      'Chain-of-custody loss — the original client\'s consent doesn\'t survive translation across each hop\'s identity system',
      'Cross-tenant confusion — a partner integration built for one client relationship is reused, unscoped, for another',
    ],
    governanceNotes: 'This is the on-behalf-of problem in its hardest form: authority crosses an organizational trust boundary, not just a process boundary. RFC 8693 token exchange with explicit `act`/`may_act` claims preserves the chain; a trust registry lets the insurer verify the brokerage is actually accredited to act in this way before honoring the delegation.',
    relatedLabs: ['/playground/token-exchange', '/playground/trust-registry', '/playground/federated-vp'],
  },
  {
    id: 'consumers',
    title: 'Consumers',
    whoActs: 'End users bringing their own personal agents to interact with an organization\'s consumer-facing services.',
    exampleAsk: 'A consumer\'s personal assistant agent files a lost-property claim on the owner\'s behalf with a transit authority\'s public claims portal.',
    identityProblems: [
      'What exactly did the consumer consent to the agent doing, and can that consent be inspected later?',
      'Can the consumer revoke the agent\'s authority mid-task, and does revocation actually stop in-flight actions?',
      'Who is liable if the agent acts on stale or misunderstood instructions from the consumer?',
    ],
    applicableStandards: ['oauth21', 'openid4vc', 'caep-ssf'],
    threatProfile: [
      'Over-broad consent — a single grant covers far more than the one task the consumer actually asked for',
      'Dark-pattern consent flows that make broad agent authority the easy default',
      'No usable revocation path once the agent has already started a multi-step task',
    ],
    governanceNotes: 'Consumer-facing agent authority should look like OAuth-scoped delegation with a real consent receipt, not an all-or-nothing account handoff. A wallet-style credential (verifiable, revocable, narrowly scoped to the one task) fits this quadrant better than a long-lived API key issued to "the user\'s agent" in general.',
    relatedLabs: ['/playground/openid4vc-wallet', '/playground/vc-did', '/playground/caep'],
  },
]

export function getQuadrantById(id: AgenticQuadrantId): AgenticQuadrant | undefined {
  return AGENTIC_QUADRANTS.find((q) => q.id === id)
}
