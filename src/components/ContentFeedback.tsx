import { useState } from 'react'
import { ThumbsUp, Flag } from 'lucide-react'
import { buildIssueUrl, feedbackStorageKey, type FeedbackKind } from '../lib/contentFeedback'

interface ContentFeedbackProps {
  id: string
  title: string
  className?: string
}

export default function ContentFeedback({ id, title, className = '' }: ContentFeedbackProps) {
  const [voted, setVoted] = useState<FeedbackKind | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem(feedbackStorageKey(id))
    return saved === 'helpful' || saved === 'flag' ? saved : null
  })

  const handleClick = (kind: FeedbackKind) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(feedbackStorageKey(id), kind)
      window.open(buildIssueUrl(kind, id, title), '_blank', 'noopener,noreferrer')
    }
    setVoted(kind)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Was this accurate?</span>
      <button
        type="button"
        onClick={() => handleClick('helpful')}
        aria-pressed={voted === 'helpful'}
        title="This was accurate and helpful"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
          voted === 'helpful'
            ? 'border-status-success text-status-success bg-status-success/10'
            : 'border-border-subtle text-text-muted hover:text-status-success hover:border-status-success/40'
        }`}
      >
        <ThumbsUp className="w-3.5 h-3.5" /> Helpful
      </button>
      <button
        type="button"
        onClick={() => handleClick('flag')}
        aria-pressed={voted === 'flag'}
        title="Flag an inaccuracy"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
          voted === 'flag'
            ? 'border-status-danger text-status-danger bg-status-danger/10'
            : 'border-border-subtle text-text-muted hover:text-status-danger hover:border-status-danger/40'
        }`}
      >
        <Flag className="w-3.5 h-3.5" /> Flag
      </button>
    </div>
  )
}
