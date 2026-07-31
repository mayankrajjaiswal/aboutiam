import { Lightbulb, X } from 'lucide-react'
import { useCoachMark } from '../lib/useCoachMark'

interface CoachMarkProps {
  /** Unique id for this specific widget/feature — never re-shown once dismissed for this id. */
  featureId: string
  message: string
  /** Positioning classes for the surrounding wrapper (e.g. "absolute top-3 left-3 z-20"). */
  className?: string
}

/**
 * A small, dismissible, first-visit-to-*this-specific-feature* tooltip — distinct
 * from and complementary to the global GuidedTour (which orients a visitor to the
 * site's sections once, not to any one complicated interactive widget).
 */
export default function CoachMark({ featureId, message, className = 'absolute top-3 left-3 z-20' }: CoachMarkProps) {
  const { isVisible, dismiss } = useCoachMark(featureId)
  if (!isVisible) return null

  return (
    <div className={`${className} max-w-xs p-3 rounded-xl bg-accent-glow border border-accent-primary/30 shadow-lg flex items-start gap-2`}>
      <Lightbulb className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
      <p className="text-xs text-text-primary font-semibold leading-relaxed flex-1">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss tip"
        className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
