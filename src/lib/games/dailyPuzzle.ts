import { DAILY_PUZZLE_BANK, type DailyPuzzle } from '../../data/dailyPuzzleBank'

const MS_PER_DAY = 86400000

/**
 * Deterministic date-seeded puzzle selection — every visitor on the same UTC
 * calendar date gets the same puzzle. `dateString` must be passed in (e.g. from
 * `new Date().toISOString().slice(0, 10)` at the call site) rather than read
 * internally, keeping this function pure/testable and avoiding Date.now() inside
 * a module that may run during static generation.
 */
export function getDailyPuzzle(dateString: string, bank: DailyPuzzle[] = DAILY_PUZZLE_BANK): DailyPuzzle {
  const daysSinceEpoch = Math.floor(new Date(`${dateString}T00:00:00Z`).getTime() / MS_PER_DAY)
  const index = ((daysSinceEpoch % bank.length) + bank.length) % bank.length
  return bank[index]
}

/** Wordle-style emoji result grid: one block per attempt, padded to maxAttempts with unused slots. */
export function buildResultEmojiGrid(attempts: boolean[], maxAttempts = 3): string {
  const blocks: string[] = attempts.slice(0, maxAttempts).map((correct) => (correct ? '🟩' : '🟥'))
  while (blocks.length < maxAttempts) blocks.push('⬜')
  return blocks.join('')
}

/** Compact, URL-safe shareable code following the existing `?a=<digits>` hydration convention (see Assess.tsx). */
export function encodeShareCode(puzzleId: string, attempts: boolean[]): string {
  const bits = attempts.map((a) => (a ? '1' : '0')).join('')
  return `${puzzleId}:${bits}`
}

export interface DecodedShareCode {
  puzzleId: string
  attempts: boolean[]
}

export function decodeShareCode(code: string): DecodedShareCode | null {
  const separatorIndex = code.indexOf(':')
  if (separatorIndex === -1) return null

  const puzzleId = code.slice(0, separatorIndex)
  const bits = code.slice(separatorIndex + 1)
  if (!puzzleId || !bits || ![...bits].every((c) => c === '0' || c === '1')) return null

  return { puzzleId, attempts: [...bits].map((c) => c === '1') }
}
