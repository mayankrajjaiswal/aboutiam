export interface RuleBadge {
  id: string
  title: string
  desc: string
  requirement: string
  unlocked: boolean
  category: 'Milestone'
}

const TRACKS: { id: number; title: string }[] = [
  { id: 1, title: 'Foundations of Identity' },
  { id: 2, title: 'Directory Services & Legacy SSO' },
  { id: 3, title: 'Modern Federation & APIs' },
  { id: 4, title: 'Customer IAM (CIAM)' },
  { id: 5, title: 'Enterprise Governance & Privilege' },
  { id: 6, title: 'Zero Trust & Future Identity' },
  { id: 7, title: 'Next-Generation Identity' }
]

const MODULES_PER_TRACK = 6

/** One badge per Learn.tsx track, unlocked once all `m{track}.1..6` modules are marked complete. */
export function getTrackGraduationBadges(completedModules: Record<string, boolean>): RuleBadge[] {
  return TRACKS.map((track) => {
    const unlocked = Array.from({ length: MODULES_PER_TRACK }, (_, i) => `m${track.id}.${i + 1}`)
      .every((moduleId) => !!completedModules[moduleId])

    return {
      id: `badge-track-graduate-${track.id}`,
      title: `${track.title} Graduate`,
      desc: `Complete all ${MODULES_PER_TRACK} modules in the "${track.title}" Academy track.`,
      requirement: `Finish every module in Track ${track.id}`,
      category: 'Milestone',
      unlocked
    }
  })
}

const TOTAL_PLAYGROUNDS = 32

const PLAYGROUND_MILESTONES = [
  { count: 5, label: 'Playground Initiate' },
  { count: 12, label: 'Playground Adept' },
  { count: 22, label: 'Playground Veteran' },
  { count: TOTAL_PLAYGROUNDS, label: 'Playground Grandmaster' }
]

/** Cumulative milestone badges over the total count of completed Playgrounds/Labs (`aboutiam_labs_completed`). */
export function getPlaygroundMilestoneBadges(labsCompletedCount: number): RuleBadge[] {
  return PLAYGROUND_MILESTONES.map((milestone) => ({
    id: `badge-playground-milestone-${milestone.count}`,
    title: milestone.label,
    desc: `Complete ${milestone.count} of the ${TOTAL_PLAYGROUNDS} interactive Identity Playgrounds.`,
    requirement: `Finish ${milestone.count}+ Playgrounds`,
    category: 'Milestone',
    unlocked: labsCompletedCount >= milestone.count
  }))
}

/** `usePlayground` moduleIds for the 4 flagship + 6 remaining Next-Gen IAM agentic-identity/AI-fabric playgrounds. */
const AGENTIC_LAB_MODULE_IDS = [
  'agent_registry_studio',
  'delegation_chain_auditor',
  'ai_guardrail_studio',
  'prompt_injection_escalation',
  'agent_observability_lab',
]

const FIDO_FLEET_MODULE_ID = 'fido_fleet_ops'
const CRYPTO_MIGRATION_MODULE_ID = 'crypto_migration_planner'

/**
 * Three Next-Gen IAM pillar badges (NextGenIAM.md §8.7): "Agent Governor" (every
 * agentic-identity/AI-fabric lab), "Fleet Commander" (the FIDO fleet simulator),
 * and "Crypto Agile" (a dependency-valid crypto migration plan -- `finishPlayground`
 * on that lab only fires once the plan is actually valid, so completion alone is
 * the correct signal here, unlike a lab where any completion counts).
 */
export function getNextGenAchievementBadges(completedLabModuleIds: string[]): RuleBadge[] {
  const completed = new Set(completedLabModuleIds)

  return [
    {
      id: 'badge-agent-governor',
      title: 'Agent Governor',
      desc: 'Complete every agentic-identity and AI Security Fabric playground: Agent Registry Studio, Delegation Chain Auditor, AI Guardrail Studio, Prompt Injection Escalation, and Agent Observability Lab.',
      requirement: 'Finish all 5 agentic-identity/AI-fabric playgrounds',
      category: 'Milestone',
      unlocked: AGENTIC_LAB_MODULE_IDS.every((id) => completed.has(id)),
    },
    {
      id: 'badge-fleet-commander',
      title: 'Fleet Commander',
      desc: 'Complete the FIDO Fleet Operations Simulator, provisioning and supporting a passkey device fleet across its full lifecycle.',
      requirement: 'Finish the FIDO Fleet Operations Simulator',
      category: 'Milestone',
      unlocked: completed.has(FIDO_FLEET_MODULE_ID),
    },
    {
      id: 'badge-crypto-agile',
      title: 'Crypto Agile',
      desc: 'Produce a dependency-valid cryptographic migration plan in the Crypto Migration Planner, correctly sequencing dependent workstreams before what relies on them.',
      requirement: 'Complete the Crypto Migration Planner with a valid migration order',
      category: 'Milestone',
      unlocked: completed.has(CRYPTO_MIGRATION_MODULE_ID),
    },
  ]
}
