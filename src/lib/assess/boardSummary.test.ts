import { describe, it, expect } from 'vitest'
import { questions } from './scoring'
import { buildBoardSummary, buildBoardSummaryMarkdown } from './boardSummary'

describe('buildBoardSummary', () => {
  it('names the weakest pillar(s) for a low-scoring input', () => {
    const answers: Record<number, number> = {}
    questions.forEach((_, i) => { answers[i] = 5 })
    answers[0] = 1 // first dimension is the sole weak spot

    const summary = buildBoardSummary(answers)
    expect(summary.weakestPillars).toEqual([questions[0].dimension])
  })

  it('names every tied weakest pillar, not just the first', () => {
    const answers: Record<number, number> = {}
    questions.forEach((_, i) => { answers[i] = 5 })
    answers[0] = 1
    answers[1] = 1

    const summary = buildBoardSummary(answers)
    expect(summary.weakestPillars).toEqual(
      expect.arrayContaining([questions[0].dimension, questions[1].dimension])
    )
    expect(summary.weakestPillars).toHaveLength(2)
  })

  it('produces a well-formed summary with no answers at all (defaults every pillar to the lowest score)', () => {
    const summary = buildBoardSummary({})
    expect(summary.pillars).toHaveLength(questions.length)
    expect(summary.pillars.every((p) => p.score === 1)).toBe(true)
    expect(summary.weakestPillars).toHaveLength(questions.length)
    expect(Number.isNaN(summary.percentage)).toBe(false)
    expect(Number.isNaN(summary.averageScore)).toBe(false)
  })

  it('produces a well-formed summary at a perfect score (no divide-by-zero/undefined-pillar edge case)', () => {
    const answers: Record<number, number> = {}
    questions.forEach((_, i) => { answers[i] = 5 })

    const summary = buildBoardSummary(answers)
    expect(summary.percentage).toBe(100)
    expect(summary.weakestPillars).toHaveLength(questions.length)
    expect(summary.tier.label).toBe('Tier 3: Adaptive Zero Trust')
  })

  it('always includes the fixed NHI addendum regardless of score distribution', () => {
    const low = buildBoardSummary({})
    const high = buildBoardSummary(Object.fromEntries(questions.map((_, i) => [i, 5])))
    expect(low.nhiAddendum).toBe(high.nhiAddendum)
    expect(low.nhiAddendum.length).toBeGreaterThan(0)
  })

  it('every pillar dimension is unique and matches the scoring questions', () => {
    const summary = buildBoardSummary({})
    const dimensions = summary.pillars.map((p) => p.dimension)
    expect(new Set(dimensions).size).toBe(dimensions.length)
    expect(dimensions).toEqual(questions.map((q) => q.dimension))
  })
})

describe('buildBoardSummaryMarkdown', () => {
  it('renders every pillar and the NHI addendum into the markdown output', () => {
    const summary = buildBoardSummary({})
    const markdown = buildBoardSummaryMarkdown(summary)
    for (const pillar of summary.pillars) {
      expect(markdown).toContain(pillar.dimension)
    }
    expect(markdown).toContain(summary.nhiAddendum)
    expect(markdown).toContain('Non-Human Identity')
  })
})
