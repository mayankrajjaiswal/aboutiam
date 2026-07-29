import { useEffect, useState } from 'react'
import { Puzzle } from 'lucide-react'
import DailyPuzzleWidget from '../components/DailyPuzzleWidget'
import { decodeShareCode, buildResultEmojiGrid } from '../lib/games/dailyPuzzle'

function getSharedResultParam(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('r')
}

export default function DailyPuzzle() {
  const [sharedGrid, setSharedGrid] = useState<string | null>(null)

  useEffect(() => {
    const param = getSharedResultParam()
    const decoded = param ? decodeShareCode(param) : null
    if (decoded) {
      setTimeout(() => {
        setSharedGrid(buildResultEmojiGrid(decoded.attempts, 3))
      }, 0)
    }
  }, [])

  return (
    <div className="space-y-6 py-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Puzzle className="w-3.5 h-3.5" /> Daily Identity Puzzle
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">One IAM Puzzle a Day</h2>
        <p className="text-text-secondary">
          A new identity-security puzzle every day — spot the JWT vulnerability, catch the tampered SAML field, or guess the protocol from progressively revealing clues. Everyone gets the same puzzle on the same day.
        </p>
      </div>

      {sharedGrid && (
        <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 text-sm text-text-secondary">
          A friend shared their result: <span className="text-lg tracking-widest align-middle">{sharedGrid}</span>
        </div>
      )}

      <DailyPuzzleWidget />
    </div>
  )
}
