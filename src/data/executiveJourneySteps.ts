export interface ExecutiveJourneyStep {
  label: string
  path: string
}

/**
 * The GRC executive journey — a small, static, ordered sequence threading
 * together pages that already exist independently, so a board-minded visitor
 * sees them as one guided workflow instead of four disconnected pages they'd
 * have to know to seek out individually. Single source of truth imported by
 * every page in the sequence (JourneyBreadcrumb.tsx) so the steps can never
 * drift between pages. Additive: a future step (e.g. the E5 Executive Command
 * Center hub, or an E9/E10 RACI/Risk Register tool) slots in here once built —
 * do not add a step whose path isn't a real, currently-registered route yet.
 */
export const EXECUTIVE_JOURNEY_STEPS: ExecutiveJourneyStep[] = [
  { label: 'Assess', path: '/assess' },
  { label: 'Compliance Deadlines', path: '/standards?view=deadlines' },
  { label: 'Modernization Backlog', path: '/playground/modernization-backlog' },
]
