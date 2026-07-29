import { describe, it, expect } from 'vitest'
import { getDailyPuzzle, buildResultEmojiGrid, encodeShareCode, decodeShareCode } from './dailyPuzzle'
import { DAILY_PUZZLE_BANK } from '../../data/dailyPuzzleBank'

describe('getDailyPuzzle', () => {
  it('returns the same puzzle for the same date (determinism)', () => {
    const a = getDailyPuzzle('2026-07-29')
    const b = getDailyPuzzle('2026-07-29')
    expect(a.id).toBe(b.id)
  })

  it('cycles through the entire bank without an early repeat within one full window', () => {
    const seen = new Set<string>()
    const startDate = new Date('2026-01-01T00:00:00Z')
    for (let i = 0; i < DAILY_PUZZLE_BANK.length; i++) {
      const d = new Date(startDate.getTime() + i * 86400000)
      const dateString = d.toISOString().slice(0, 10)
      const puzzle = getDailyPuzzle(dateString)
      seen.add(puzzle.id)
    }
    expect(seen.size).toBe(DAILY_PUZZLE_BANK.length)
  })

  it('repeats only after a full bank-length cycle', () => {
    const first = getDailyPuzzle('2026-01-01')
    const oneCycleLater = new Date(new Date('2026-01-01T00:00:00Z').getTime() + DAILY_PUZZLE_BANK.length * 86400000)
    const repeated = getDailyPuzzle(oneCycleLater.toISOString().slice(0, 10))
    expect(repeated.id).toBe(first.id)
  })

  it('works against a small custom bank without throwing', () => {
    const tinyBank = DAILY_PUZZLE_BANK.slice(0, 2)
    const puzzle = getDailyPuzzle('2026-07-29', tinyBank)
    expect(tinyBank.map((p) => p.id)).toContain(puzzle.id)
  })
})

describe('buildResultEmojiGrid', () => {
  it('renders one green block per correct attempt', () => {
    expect(buildResultEmojiGrid([true], 3)).toBe('🟩⬜⬜')
  })

  it('renders red blocks for incorrect attempts', () => {
    expect(buildResultEmojiGrid([false, false, true], 3)).toBe('🟥🟥🟩')
  })

  it('pads with unused-slot blocks up to maxAttempts', () => {
    expect(buildResultEmojiGrid([], 3)).toBe('⬜⬜⬜')
  })

  it('truncates attempts beyond maxAttempts', () => {
    expect(buildResultEmojiGrid([true, true, true, true], 3)).toBe('🟩🟩🟩')
  })
})

describe('encodeShareCode / decodeShareCode', () => {
  it('round-trips a share code', () => {
    const encoded = encodeShareCode('jwt-1', [false, true])
    const decoded = decodeShareCode(encoded)
    expect(decoded).toEqual({ puzzleId: 'jwt-1', attempts: [false, true] })
  })

  it('returns null for a malformed code with no separator', () => {
    expect(decodeShareCode('not-a-valid-code')).toBeNull()
  })

  it('returns null for non-binary attempt bits', () => {
    expect(decodeShareCode('jwt-1:1a0')).toBeNull()
  })

  it('returns null for an empty attempts string', () => {
    expect(decodeShareCode('jwt-1:')).toBeNull()
  })

  it('round-trips every puzzle id in the bank', () => {
    for (const puzzle of DAILY_PUZZLE_BANK) {
      const encoded = encodeShareCode(puzzle.id, [true, false, true])
      expect(decodeShareCode(encoded)).toEqual({ puzzleId: puzzle.id, attempts: [true, false, true] })
    }
  })
})
