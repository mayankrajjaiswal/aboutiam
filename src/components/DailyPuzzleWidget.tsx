import { useState } from 'react'
import { Puzzle, Check, X, Share2, Lightbulb } from 'lucide-react'
import { getDailyPuzzle, buildResultEmojiGrid, encodeShareCode } from '../lib/games/dailyPuzzle'

const MAX_ATTEMPTS = 3

const FORMAT_LABELS: Record<string, string> = {
  'jwt-vuln': 'Spot the JWT Vulnerability',
  'saml-tamper': 'Spot the SAML Tampering',
  'protocol-guess': 'Guess the Protocol',
}

export default function DailyPuzzleWidget() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const puzzle = getDailyPuzzle(today)

  const [attempts, setAttempts] = useState<boolean[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealedClues, setRevealedClues] = useState(1)
  const [copied, setCopied] = useState(false)

  const isSolved = attempts.includes(true)
  const isFailed = !isSolved && attempts.length >= MAX_ATTEMPTS
  const isOver = isSolved || isFailed

  const handleGuess = (index: number) => {
    if (isOver) return
    const correct = index === puzzle.correctIndex
    setAttempts((prev) => [...prev, correct])
    setSelectedIndex(index)
    if (!correct && puzzle.clues && revealedClues < puzzle.clues.length) {
      setRevealedClues((prev) => Math.min(prev + 1, puzzle.clues!.length))
    }
  }

  const handleShare = () => {
    const grid = buildResultEmojiGrid(attempts, MAX_ATTEMPTS)
    const code = encodeShareCode(puzzle.id, attempts)
    const url = `${window.location.origin}/daily-puzzle?r=${code}`
    const text = `AboutIAM Daily Puzzle — ${today}\n${FORMAT_LABELS[puzzle.format]}\n${grid}\n${url}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-accent-primary" /> Daily Identity Puzzle
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{today}</span>
      </div>

      <p className="text-xs font-bold text-accent-primary uppercase tracking-wider">{FORMAT_LABELS[puzzle.format]}</p>

      {puzzle.format === 'protocol-guess' && puzzle.clues ? (
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {puzzle.clues.slice(0, revealedClues).map((clue, idx) => (
            <li key={idx} className="flex gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-status-warning shrink-0 mt-0.5" />
              {clue}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-text-secondary leading-relaxed">{puzzle.prompt}</p>
      )}

      <div className="space-y-2">
        {puzzle.choices.map((choice, idx) => {
          const wasGuessed = attempts.length > 0 && selectedIndex === idx
          const isCorrectChoice = idx === puzzle.correctIndex
          const showCorrectness = isOver && (isCorrectChoice || wasGuessed)
          return (
            <button
              key={idx}
              onClick={() => handleGuess(idx)}
              disabled={isOver}
              className={`w-full text-left p-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                showCorrectness && isCorrectChoice
                  ? 'bg-status-success/10 border-status-success/40 text-status-success'
                  : showCorrectness && wasGuessed
                    ? 'bg-status-danger/10 border-status-danger/40 text-status-danger'
                    : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary disabled:cursor-not-allowed'
              }`}
            >
              {choice}
              {showCorrectness && isCorrectChoice && <Check className="w-3.5 h-3.5 shrink-0" />}
              {showCorrectness && wasGuessed && !isCorrectChoice && <X className="w-3.5 h-3.5 shrink-0" />}
            </button>
          )
        })}
      </div>

      {attempts.length > 0 && (
        <p className="text-lg tracking-widest" aria-label="Attempt result grid">{buildResultEmojiGrid(attempts, MAX_ATTEMPTS)}</p>
      )}

      {isOver && (
        <div className="p-3 rounded-lg bg-bg-nested border border-border-subtle/50 space-y-3">
          <p className="text-xs text-text-secondary leading-relaxed">{puzzle.explanation}</p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-bold transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Share Result'}
          </button>
        </div>
      )}

      {!isOver && (
        <p className="text-[10px] text-text-muted">Attempt {attempts.length + 1} of {MAX_ATTEMPTS}</p>
      )}
    </div>
  )
}
