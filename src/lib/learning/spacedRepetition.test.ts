import { describe, it, expect } from 'vitest'
import { scheduleNextReview, isCardDue, type CardSchedule } from './spacedRepetition'

const NOW = '2026-01-01T00:00:00.000Z'

describe('scheduleNextReview (SM-2)', () => {
  it('schedules a first "good" review about 1 day out', () => {
    const result = scheduleNextReview(null, 'good', NOW)
    expect(result.intervalDays).toBe(1)
    expect(result.repetitions).toBe(1)
    expect(new Date(result.dueDate).getTime()).toBeGreaterThan(new Date(NOW).getTime())
  })

  it('grows the interval geometrically across repeated "good" grades', () => {
    let schedule: CardSchedule | null = null
    const intervals: number[] = []
    for (let i = 0; i < 5; i++) {
      schedule = scheduleNextReview(schedule, 'good', NOW)
      intervals.push(schedule.intervalDays)
    }
    // Each successive interval (after the initial two fixed steps) should be
    // at least as large as the one before it, and the run should have grown
    // overall — this is the "geometric via ease factor" behavior.
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1])
    }
    expect(intervals[intervals.length - 1]).toBeGreaterThan(intervals[0])
  })

  it('resets the interval and drops the ease factor on "again", never below the 1.3 floor', () => {
    let schedule: CardSchedule | null = scheduleNextReview(null, 'good', NOW)
    schedule = scheduleNextReview(schedule, 'good', NOW)
    const easeBeforeLapse = schedule.easeFactor

    schedule = scheduleNextReview(schedule, 'again', NOW)
    expect(schedule.intervalDays).toBe(1)
    expect(schedule.repetitions).toBe(0)
    expect(schedule.easeFactor).toBeLessThan(easeBeforeLapse)

    // Repeated lapses should converge to, but never fall below, the SM-2 floor.
    for (let i = 0; i < 20; i++) {
      schedule = scheduleNextReview(schedule, 'again', NOW)
    }
    expect(schedule.easeFactor).toBeCloseTo(1.3, 5)
    expect(schedule.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('grows the interval faster for "easy" than for "good" from the same starting point', () => {
    const afterGood = scheduleNextReview(scheduleNextReview(null, 'good', NOW), 'good', NOW)
    const afterEasy = scheduleNextReview(scheduleNextReview(null, 'good', NOW), 'easy', NOW)
    expect(afterEasy.intervalDays).toBeGreaterThan(afterGood.intervalDays)
  })

  it('treats "hard" as a pass (repetitions increase) but with a smaller ease bump than "good"', () => {
    const afterHard = scheduleNextReview(null, 'hard', NOW)
    const afterGood = scheduleNextReview(null, 'good', NOW)
    expect(afterHard.repetitions).toBe(1)
    expect(afterHard.easeFactor).toBeLessThan(afterGood.easeFactor)
  })
})

describe('isCardDue', () => {
  it('treats a never-reviewed card (undefined schedule) as due', () => {
    expect(isCardDue(undefined, NOW)).toBe(true)
  })

  it('is not due before its scheduled due date', () => {
    const schedule = scheduleNextReview(null, 'good', NOW)
    expect(isCardDue(schedule, NOW)).toBe(false)
  })

  it('is due once the due date has passed', () => {
    const schedule = scheduleNextReview(null, 'good', NOW)
    const wayLater = '2027-01-01T00:00:00.000Z'
    expect(isCardDue(schedule, wayLater)).toBe(true)
  })

  it('is due exactly at the due date boundary', () => {
    const schedule = scheduleNextReview(null, 'good', NOW)
    expect(isCardDue(schedule, schedule.dueDate)).toBe(true)
  })
})
