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
    <div className={`${className} max-w-xs p-4 rounded-xl border border-accent-primary/20 bg-bg-card/90 backdrop-blur-md shadow-xl shadow-accent-primary/5 hover-cyber-glow flex items-start gap-2.5 z-20 transition-all duration-300 animate-fadeIn`}>
      <div className="relative shrink-0 mt-0.5 select-none pointer-events-none">
        <span className="absolute inset-0 rounded-full bg-accent-primary/30 animate-ping opacity-75"></span>
        <div className="w-6 h-6 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/20 relative z-10">
          <Lightbulb className="w-3.5 h-3.5 animate-pulse-slow" />
        </div>
      </div>
      <div className="space-y-1 flex-1">
        <span className="text-[9px] font-black uppercase tracking-wider text-accent-primary">Quick Tip</span>
        <p className="text-xs text-text-primary font-semibold leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss tip"
        className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer p-0.5 hover:bg-bg-sidebar rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
