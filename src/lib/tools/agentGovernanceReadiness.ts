/**
 * Pure scoring logic for the Agent Governance Readiness Assessor
 * (`/tools/agent-governance-readiness`). ~25 questions spanning the 8
 * agentRegistryModel.ts field groups plus the 4 aiControlPlaneFunctions.ts
 * control-plane functions, each answered on a 0-3 maturity scale, producing
 * a banded score per dimension and a prioritized gap list.
 */
export type ReadinessDimension =
  | 'Identity' | 'Ownership' | 'Principal' | 'Intent' | 'Authority' | 'Conditions' | 'Provenance' | 'Lifecycle'
  | 'Discover' | 'Decide' | 'Enforce' | 'Observe'

export interface ReadinessQuestion {
  id: string
  dimension: ReadinessDimension
  question: string
  /** What a maturity-4 (fully mature) answer looks like, shown as guidance. */
  matureAnswerHint: string
}

export type ReadinessAnswer = 0 | 1 | 2 | 3

export interface ReadinessBand {
  label: string
  minScore: number
  recommendedPage: string
}

const READINESS_BANDS: ReadinessBand[] = [
  { label: 'Unmanaged', minScore: 0, recommendedPage: '/next-gen/agentic-identity' },
  { label: 'Inventoried', minScore: 34, recommendedPage: '/playground/agent-registry' },
  { label: 'Governed', minScore: 67, recommendedPage: '/playground/delegation-chain' },
  { label: 'Adaptive', minScore: 90, recommendedPage: '/next-gen/ai-security-fabric' },
]

export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  { id: 'q-identity-1', dimension: 'Identity', question: 'Does every AI agent instance have a stable, unique identifier?', matureAnswerHint: 'Every agent instance has a unique ID recorded in a central registry.' },
  { id: 'q-identity-2', dimension: 'Identity', question: 'Is each agent\'s model/runtime version tracked?', matureAnswerHint: 'Model/runtime fingerprint is a required field on every agent record.' },
  { id: 'q-identity-3', dimension: 'Identity', question: 'Can you produce a full inventory of active agents on demand?', matureAnswerHint: 'A single query returns every registered agent, current as of today.' },
  { id: 'q-ownership-1', dimension: 'Ownership', question: 'Does every agent have a named, accountable human owner?', matureAnswerHint: 'Every agent record has a specific owner, not a team alias.' },
  { id: 'q-ownership-2', dimension: 'Ownership', question: 'Is ownership transferred formally when an owner leaves?', matureAnswerHint: 'A defined process reassigns ownership automatically or via a required manual step.' },
  { id: 'q-principal-1', dimension: 'Principal', question: 'Is it always clear whose authority an agent acts under (its own, a user\'s, or an organization\'s)?', matureAnswerHint: 'Every agent record declares a principal type and, where applicable, who it acts for.' },
  { id: 'q-principal-2', dimension: 'Principal', question: 'Are delegation chains preserved across multiple hops?', matureAnswerHint: 'Multi-hop delegations carry the full chain back to the original principal.' },
  { id: 'q-intent-1', dimension: 'Intent', question: 'Does every agent have a written declared-intent / purpose statement?', matureAnswerHint: 'Every agent record includes an explicit purpose statement reviewed at registration.' },
  { id: 'q-intent-2', dimension: 'Intent', question: 'Are in-scope and out-of-scope tasks explicitly listed?', matureAnswerHint: 'Both in-scope and out-of-scope task lists exist and are used for drift detection.' },
  { id: 'q-authority-1', dimension: 'Authority', question: 'Is agent tool/API access scoped to the minimum required for its task?', matureAnswerHint: 'Every tool grant is reviewed against declared intent, not granted broadly by default.' },
  { id: 'q-authority-2', dimension: 'Authority', question: 'Are spend/rate limits enforced per agent?', matureAnswerHint: 'Every agent has a hard spend/rate cap sized to its legitimate volume.' },
  { id: 'q-conditions-1', dimension: 'Conditions', question: 'Are human-approval triggers defined for consequential actions?', matureAnswerHint: 'Specific risk thresholds trigger mandatory human approval before the action proceeds.' },
  { id: 'q-conditions-2', dimension: 'Conditions', question: 'Is agent authority restricted to specific environments (e.g. no cross-environment reuse)?', matureAnswerHint: 'An agent\'s credentials are only valid in the environment they were issued for.' },
  { id: 'q-provenance-1', dimension: 'Provenance', question: 'Is every change to an agent\'s authority logged with who approved it?', matureAnswerHint: 'A complete, queryable change history exists for every agent.' },
  { id: 'q-provenance-2', dimension: 'Provenance', question: 'Can you trace who registered a given agent and when?', matureAnswerHint: 'Registration provenance is recorded and auditable for every agent.' },
  { id: 'q-lifecycle-1', dimension: 'Lifecycle', question: 'Does every agent have a defined review cadence and expiry?', matureAnswerHint: 'Every agent record has a review date and an expiry that requires active renewal.' },
  { id: 'q-lifecycle-2', dimension: 'Lifecycle', question: 'Is there a documented decommissioning process (credential revocation, data retention)?', matureAnswerHint: 'A written decommission checklist runs automatically when an agent is retired.' },
  { id: 'q-lifecycle-3', dimension: 'Lifecycle', question: 'Are revocation triggers (beyond scheduled review) defined for immediate action?', matureAnswerHint: 'Specific events (owner departure, repeated drift flags) trigger immediate revocation.' },
  { id: 'q-discover-1', dimension: 'Discover', question: 'Can you detect agents or MCP tool connections that were never formally registered?', matureAnswerHint: 'Continuous discovery actively surfaces unregistered ("shadow") AI activity.' },
  { id: 'q-discover-2', dimension: 'Discover', question: 'Is there a single, current inventory of every MCP tool exposure across the organization?', matureAnswerHint: 'A live, centrally-maintained inventory of all tool exposures exists.' },
  { id: 'q-decide-1', dimension: 'Decide', question: 'Do you have semantic guardrails evaluating agent request intent, not just structured attributes?', matureAnswerHint: 'A tuned semantic guardrail runs alongside classic policy evaluation.' },
  { id: 'q-decide-2', dimension: 'Decide', question: 'Is guardrail strictness actively tuned against real traffic (not a one-time default)?', matureAnswerHint: 'Guardrail thresholds are reviewed and adjusted based on observed false-positive/negative rates.' },
  { id: 'q-enforce-1', dimension: 'Enforce', question: 'Is there an active AI firewall / inline enforcement point for agent traffic?', matureAnswerHint: 'An enforcement layer can block or modify agent actions in real time.' },
  { id: 'q-enforce-2', dimension: 'Enforce', question: 'Is egress data-loss-prevention applied to agent outputs and tool call arguments?', matureAnswerHint: 'Outbound agent content is inspected against data-classification rules before it leaves.' },
  { id: 'q-observe-1', dimension: 'Observe', question: 'Is agent behavior continuously compared against declared intent to detect drift?', matureAnswerHint: 'A drift-detection system flags divergence between declared intent and observed action.' },
  { id: 'q-observe-2', dimension: 'Observe', question: 'Does a defined intervention ladder exist, from logging up to session revocation?', matureAnswerHint: 'A graduated intervention ladder is defined and automatically triggered by drift signals.' },
]

export interface DimensionScore {
  dimension: ReadinessDimension
  answered: number
  totalQuestions: number
  scorePercent: number
}

export interface GapItem {
  questionId: string
  dimension: ReadinessDimension
  question: string
  matureAnswerHint: string
  answer: ReadinessAnswer
}

export interface ReadinessReport {
  overallScorePercent: number
  band: ReadinessBand
  dimensionScores: DimensionScore[]
  /** Lowest-scoring answers first -- the prioritized gap list. */
  gaps: GapItem[]
}

const MAX_ANSWER: ReadinessAnswer = 3

export function computeReadinessReport(answers: Record<string, ReadinessAnswer>): ReadinessReport {
  const dimensions = Array.from(new Set(READINESS_QUESTIONS.map((q) => q.dimension)))

  const dimensionScores: DimensionScore[] = dimensions.map((dimension) => {
    const questionsInDimension = READINESS_QUESTIONS.filter((q) => q.dimension === dimension)
    const totalPossible = questionsInDimension.length * MAX_ANSWER
    const achieved = questionsInDimension.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
    return {
      dimension,
      answered: questionsInDimension.filter((q) => answers[q.id] !== undefined).length,
      totalQuestions: questionsInDimension.length,
      scorePercent: totalPossible > 0 ? Math.round((achieved / totalPossible) * 100) : 0,
    }
  })

  const totalPossibleOverall = READINESS_QUESTIONS.length * MAX_ANSWER
  const achievedOverall = READINESS_QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
  const overallScorePercent = totalPossibleOverall > 0 ? Math.round((achievedOverall / totalPossibleOverall) * 100) : 0

  const band = [...READINESS_BANDS].reverse().find((b) => overallScorePercent >= b.minScore) ?? READINESS_BANDS[0]

  const gaps: GapItem[] = READINESS_QUESTIONS
    .map((q) => ({
      questionId: q.id,
      dimension: q.dimension,
      question: q.question,
      matureAnswerHint: q.matureAnswerHint,
      answer: answers[q.id] ?? 0,
    }))
    .filter((g) => g.answer < MAX_ANSWER)
    .sort((a, b) => a.answer - b.answer)

  return { overallScorePercent, band, dimensionScores, gaps }
}

export function buildReadinessReportText(report: ReadinessReport): string {
  const lines: string[] = [
    'Agent Governance Readiness Report',
    `Overall score: ${report.overallScorePercent}% (${report.band.label})`,
    '',
    'Per-Dimension Scores:',
    ...report.dimensionScores.map((d) => `  ${d.dimension}: ${d.scorePercent}% (${d.answered}/${d.totalQuestions} answered)`),
    '',
    'Prioritized Gaps (lowest maturity first):',
    ...report.gaps.map((g) => `  [${g.dimension}] ${g.question}\n    Current: ${g.answer}/3 — Mature answer: ${g.matureAnswerHint}`),
  ]
  return lines.join('\n')
}
