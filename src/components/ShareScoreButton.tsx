import { Share2, Trophy } from 'lucide-react'
import { buildDiscussionUrl, buildLeaderboardBrowseUrl, type ShareScoreInput } from '../lib/community/shareScoreUrl'

interface ShareScoreButtonProps extends ShareScoreInput {
  className?: string
}

/**
 * Opens a pre-filled GitHub Discussions post so a visitor can manually share their
 * score to the community leaderboard — deliberately manual-paste only, no AboutIAM-run
 * server or scheduled aggregator in the loop. See src/lib/community/shareScoreUrl.ts.
 */
export default function ShareScoreButton({ moduleName, score, date, className = '' }: ShareScoreButtonProps) {
  const handleShare = () => {
    window.open(buildDiscussionUrl({ moduleName, score, date }), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-accent-primary/30 text-accent-primary hover:bg-accent-glow/70 text-xs font-bold transition-all"
      >
        <Share2 className="w-3.5 h-3.5" /> Share Your Score
      </button>
      <a
        href={buildLeaderboardBrowseUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary"
      >
        <Trophy className="w-3.5 h-3.5" /> Browse the community leaderboard →
      </a>
    </div>
  )
}
