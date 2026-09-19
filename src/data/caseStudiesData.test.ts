import { describe, it, expect } from 'vitest'
import { CASE_STUDIES, CASE_STUDY_CATEGORIES } from './caseStudiesData'

describe('CASE_STUDIES', () => {
  it('has unique ids', () => {
    const ids = CASE_STUDIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every entry has a category present in CASE_STUDY_CATEGORIES', () => {
    for (const study of CASE_STUDIES) {
      expect(CASE_STUDY_CATEGORIES).toContain(study.category)
    }
  })

  it('every entry has non-empty core narrative fields', () => {
    for (const study of CASE_STUDIES) {
      expect(study.summary.length).toBeGreaterThan(0)
      expect(study.problem.length).toBeGreaterThan(0)
      expect(study.architecture.length).toBeGreaterThan(0)
      expect(study.requirements.length).toBeGreaterThan(0)
      expect(study.challenges.length).toBeGreaterThan(0)
      expect(study.lessons.length).toBeGreaterThan(0)
      expect(study.mistakes.length).toBeGreaterThan(0)
      expect(study.bestPractices.length).toBeGreaterThan(0)
      expect(study.interviewQuestions.length).toBeGreaterThan(0)
      expect(study.threatModel.length).toBeGreaterThan(0)
    }
  })

  it('every relatedResources entry has a non-empty path', () => {
    for (const study of CASE_STUDIES) {
      for (const resource of study.relatedResources) {
        expect(resource.path.startsWith('/')).toBe(true)
      }
    }
  })

  it('includes the 3 Next-Gen IAM archetype case studies', () => {
    const ids = ['agent_governance_rollout', 'fido_fleet_migration', 'wallet_acceptance_readiness']
    for (const id of ids) {
      const study = CASE_STUDIES.find((c) => c.id === id)
      expect(study).toBeTruthy()
      expect(study?.category).toBe('Next-Gen IAM')
    }
  })

  it('anonymizes the 3 Next-Gen IAM case study companies as archetypes, not named organizations', () => {
    const ids = ['agent_governance_rollout', 'fido_fleet_migration', 'wallet_acceptance_readiness']
    for (const id of ids) {
      const study = CASE_STUDIES.find((c) => c.id === id)!
      expect(study.company).toContain('anonymized archetype')
    }
  })
})
