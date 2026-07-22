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
  { id: 6, title: 'Zero Trust & Future Identity' }
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
