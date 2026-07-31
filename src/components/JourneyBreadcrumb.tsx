import { Link } from 'react-router-dom'
import { ChevronRight, Compass } from 'lucide-react'
import { EXECUTIVE_JOURNEY_STEPS } from '../data/executiveJourneySteps'

interface JourneyBreadcrumbProps {
  /** Must match one of EXECUTIVE_JOURNEY_STEPS' `path` (including its query string, if any). */
  currentPath: string
}

/**
 * Purely a navigational aid threading the GRC executive journey (Assess →
 * Compliance Deadlines → Modernization Backlog, and future steps as they ship)
 * across the pages that make it up. A visitor can still reach any of these
 * pages directly without ever seeing this breadcrumb.
 */
export default function JourneyBreadcrumb({ currentPath }: JourneyBreadcrumbProps) {
  return (
    <nav
      aria-label="Executive GRC journey"
      className="flex items-center gap-1.5 flex-wrap text-xs font-bold p-3 rounded-xl bg-bg-nested/40 border border-border-subtle"
    >
      <Compass className="w-3.5 h-3.5 text-accent-primary shrink-0" />
      {EXECUTIVE_JOURNEY_STEPS.map((step, idx) => {
        const isCurrent = step.path === currentPath
        return (
          <span key={step.path} className="flex items-center gap-1.5">
            {isCurrent ? (
              <span className="px-2 py-1 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/20" aria-current="step">
                {step.label}
              </span>
            ) : (
              <Link to={step.path} className="px-2 py-1 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-bg-nested transition-colors">
                {step.label}
              </Link>
            )}
            {idx < EXECUTIVE_JOURNEY_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />}
          </span>
        )
      })}
    </nav>
  )
}
