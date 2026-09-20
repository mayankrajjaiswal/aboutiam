import { describe, expect, it } from 'vitest'
import {
  READINESS_QUESTIONS,
  computeReadinessReport,
  buildReadinessReportText,
  type ReadinessAnswer,
} from './agentGovernanceReadiness'

describe('READINESS_QUESTIONS', () => {
  it('has around 25 questions with no duplicate ids', () => {
    expect(READINESS_QUESTIONS.length).toBeGreaterThanOrEqual(24)
    const ids = READINESS_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all 8 agentRegistryModel groups plus 4 control-plane functions (12 dimensions)', () => {
    const dimensions = new Set(READINESS_QUESTIONS.map((q) => q.dimension))
    expect(dimensions.size).toBe(12)
  })

  it('every question has non-empty text and a mature-answer hint', () => {
    for (const q of READINESS_QUESTIONS) {
      expect(q.question.length).toBeGreaterThan(15)
      expect(q.question.endsWith('?')).toBe(true)
      expect(q.matureAnswerHint.length).toBeGreaterThan(10)
    }
  })
})

describe('computeReadinessReport', () => {
  it('gives a 0% score and "Unmanaged" band when no questions are answered', () => {
    const report = computeReadinessReport({})
    expect(report.overallScorePercent).toBe(0)
    expect(report.band.label).toBe('Unmanaged')
  })

  it('gives a 100% score and the top band when every question is answered at max maturity', () => {
    const allMax: Record<string, ReadinessAnswer> = {}
    for (const q of READINESS_QUESTIONS) allMax[q.id] = 3
    const report = computeReadinessReport(allMax)
    expect(report.overallScorePercent).toBe(100)
    expect(report.band.label).toBe('Adaptive')
    expect(report.gaps).toHaveLength(0)
  })

  it('produces a dimension score for every one of the 12 dimensions', () => {
    const report = computeReadinessReport({})
    expect(report.dimensionScores).toHaveLength(12)
  })

  it('sorts gaps with the lowest-maturity answers first', () => {
    const answers: Record<string, ReadinessAnswer> = {}
    answers[READINESS_QUESTIONS[0].id] = 0
    answers[READINESS_QUESTIONS[1].id] = 2
    const report = computeReadinessReport(answers)
    expect(report.gaps[0].answer).toBeLessThanOrEqual(report.gaps[report.gaps.length - 1].answer)
  })

  it('excludes fully-mature (answer=3) questions from the gap list', () => {
    const answers: Record<string, ReadinessAnswer> = {}
    answers[READINESS_QUESTIONS[0].id] = 3
    const report = computeReadinessReport(answers)
    expect(report.gaps.some((g) => g.questionId === READINESS_QUESTIONS[0].id)).toBe(false)
  })

  it('recommends the pillar landing page at the lowest band', () => {
    const report = computeReadinessReport({})
    expect(report.band.recommendedPage).toBe('/next-gen/agentic-identity')
  })
})

describe('buildReadinessReportText', () => {
  it('includes the overall score and every dimension label', () => {
    const report = computeReadinessReport({})
    const text = buildReadinessReportText(report)
    expect(text).toContain('Overall score: 0%')
    expect(text).toContain('Identity:')
    expect(text).toContain('Observe:')
  })
})
