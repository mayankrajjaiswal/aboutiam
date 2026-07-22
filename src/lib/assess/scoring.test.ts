import { describe, expect, it } from 'vitest'
import { questions, computeScores, getMaturityTier, encodeAnswers, decodeAnswers } from './scoring'

describe('computeScores', () => {
  it('computes percentage and average from all-Tier-1 answers', () => {
    const answers = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 }
    const { totalScore, maxScore, percentage, averageScore } = computeScores(answers)
    expect(totalScore).toBe(5)
    expect(maxScore).toBe(questions.length * 5)
    expect(percentage).toBe(20)
    expect(averageScore).toBe(1.0)
  })

  it('computes percentage and average from all-Tier-3 answers', () => {
    const answers = { 0: 5, 1: 5, 2: 5, 3: 5, 4: 5 }
    const { percentage, averageScore } = computeScores(answers)
    expect(percentage).toBe(100)
    expect(averageScore).toBe(5.0)
  })

  it('treats unanswered questions as absent from the total', () => {
    const { totalScore } = computeScores({ 0: 3 })
    expect(totalScore).toBe(3)
  })
})

describe('getMaturityTier', () => {
  it('returns Tier 1 for low average scores', () => {
    expect(getMaturityTier(1.0).label).toBe('Tier 1: Ad-Hoc & Siloed')
  })

  it('returns Tier 2 for mid average scores', () => {
    expect(getMaturityTier(2.6).label).toBe('Tier 2: Standardized & Defined')
  })

  it('returns Tier 3 for high average scores', () => {
    expect(getMaturityTier(5.0).label).toBe('Tier 3: Adaptive Zero Trust')
  })

  it('places the exact tier boundaries on the lower tier', () => {
    expect(getMaturityTier(1.8).label).toBe('Tier 1: Ad-Hoc & Siloed')
    expect(getMaturityTier(3.4).label).toBe('Tier 2: Standardized & Defined')
  })
})

describe('encodeAnswers / decodeAnswers', () => {
  it('round-trips a full set of answers', () => {
    const answers = { 0: 1, 1: 3, 2: 5, 3: 3, 4: 1 }
    const encoded = encodeAnswers(answers)
    expect(encoded).toBe('13531')
    expect(decodeAnswers(encoded)).toEqual(answers)
  })

  it('defaults missing answers to 1 when encoding', () => {
    expect(encodeAnswers({ 2: 5 })).toBe('11511')
  })

  it('rejects null, empty, and wrong-length params', () => {
    expect(decodeAnswers(null)).toBeNull()
    expect(decodeAnswers('')).toBeNull()
    expect(decodeAnswers('135')).toBeNull()
    expect(decodeAnswers('135311')).toBeNull()
  })

  it('rejects params containing digits outside {1,3,5}', () => {
    expect(decodeAnswers('99999')).toBeNull()
    expect(decodeAnswers('12345')).toBeNull()
  })
})
