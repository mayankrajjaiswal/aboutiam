const MS_PER_DAY = 86400000

/**
 * Deterministic date-seeded index into a list of a given length — every visitor on the
 * same UTC calendar date gets the same index. Shared by the Daily Puzzle and the
 * Fact-of-the-Day widget so both features stay in lockstep with one seeding algorithm
 * instead of drifting apart with their own copies.
 */
export function dateSeededIndex(dateString: string, length: number): number {
  if (length <= 0) return 0
  const daysSinceEpoch = Math.floor(new Date(`${dateString}T00:00:00Z`).getTime() / MS_PER_DAY)
  return ((daysSinceEpoch % length) + length) % length
}
