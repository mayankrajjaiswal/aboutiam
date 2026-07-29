export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

export interface CardSchedule {
  easeFactor: number
  intervalDays: number
  repetitions: number
  dueDate: string
}

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5
}

function addDays(fromDate: string, days: number): string {
  const base = new Date(fromDate)
  base.setUTCDate(base.getUTCDate() + days)
  return base.toISOString()
}

/**
 * Canonical SM-2 scheduling. `reviewedAt` is passed in (never read from
 * `Date.now()` internally) so the function stays pure and independently
 * testable — the caller supplies "now" from wherever it's allowed to read it.
 */
export function scheduleNextReview(
  schedule: CardSchedule | null,
  grade: ReviewGrade,
  reviewedAt: string
): CardSchedule {
  const quality = GRADE_QUALITY[grade]
  const previousEase = schedule?.easeFactor ?? DEFAULT_EASE_FACTOR
  const previousRepetitions = schedule?.repetitions ?? 0
  const previousInterval = schedule?.intervalDays ?? 0

  const nextEaseRaw = previousEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const nextEase = Math.max(MIN_EASE_FACTOR, nextEaseRaw)

  if (quality < 3) {
    return {
      easeFactor: nextEase,
      intervalDays: 1,
      repetitions: 0,
      dueDate: addDays(reviewedAt, 1)
    }
  }

  const repetitions = previousRepetitions + 1
  let intervalDays: number
  if (repetitions === 1) {
    intervalDays = 1
  } else if (repetitions === 2) {
    intervalDays = 6
  } else {
    intervalDays = Math.round(previousInterval * nextEase)
  }

  // "Easy" should grow the next interval faster than "Good" at every step,
  // not just once the geometric-growth branch above kicks in.
  if (grade === 'easy') {
    intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * 1.3))
  }

  return {
    easeFactor: nextEase,
    intervalDays,
    repetitions,
    dueDate: addDays(reviewedAt, intervalDays)
  }
}

export function isCardDue(schedule: CardSchedule | undefined, now: string): boolean {
  if (!schedule) return true
  return new Date(schedule.dueDate).getTime() <= new Date(now).getTime()
}
