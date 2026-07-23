import { describe, expect, it } from 'vitest'
import { KNOWLEDGE_GRAPH, COMPARISONS, LEARNING_TRACKS, INTERVIEW_QUESTIONS } from './aiKnowledgeGraph'

const LEARN_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const LEARN_GOALS = ['Security Engineer', 'IAM Architect']

describe('aiKnowledgeGraph', () => {
  it('gives every comparison a unique id', () => {
    const ids = COMPARISONS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every comparison a complete table and non-empty use-case lists', () => {
    COMPARISONS.forEach((c) => {
      expect(c.table.length, `comparison "${c.id}" has an empty table`).toBeGreaterThan(0)
      expect(c.useCasesA.length, `comparison "${c.id}" has empty useCasesA`).toBeGreaterThan(0)
      expect(c.useCasesB.length, `comparison "${c.id}" has empty useCasesB`).toBeGreaterThan(0)
    })
  })

  it('gives every learning track a unique level/goal combination', () => {
    const combos = LEARNING_TRACKS.map((t) => `${t.level}::${t.goal}`)
    expect(new Set(combos).size).toBe(combos.length)
  })

  it('only uses level/goal values that are selectable in the Assistant.tsx UI dropdowns', () => {
    // Regression test for the bug where LEARNING_TRACKS had an 'Expert' track
    // that could never be selected because the <select> only offered
    // 'Beginner'/'Intermediate' options.
    LEARNING_TRACKS.forEach((t) => {
      expect(LEARN_LEVELS, `level "${t.level}" on track "${t.title}" is not selectable in the UI`).toContain(t.level)
      expect(LEARN_GOALS, `goal "${t.goal}" on track "${t.title}" is not selectable in the UI`).toContain(t.goal)
    })
  })

  it('covers every declared level across at least one learning track', () => {
    const levels = new Set(LEARNING_TRACKS.map((t) => t.level))
    LEARN_LEVELS.forEach((level) => {
      expect(levels.has(level), `expected at least one learning track at level "${level}"`).toBe(true)
    })
  })

  it('gives every learning track step at least one resource', () => {
    LEARNING_TRACKS.forEach((t) => {
      t.steps.forEach((step) => {
        expect(step.resources.length, `step "${step.title}" on track "${t.title}" has no resources`).toBeGreaterThan(0)
      })
    })
  })

  it('gives every interview question a unique id', () => {
    const ids = INTERVIEW_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every interview question a non-empty hint and answer', () => {
    INTERVIEW_QUESTIONS.forEach((q) => {
      expect(q.hint.length, `question "${q.id}" has an empty hint`).toBeGreaterThan(0)
      expect(q.answer.length, `question "${q.id}" has an empty answer`).toBeGreaterThan(0)
    })
  })

  it('covers interview questions across more than one domain', () => {
    const domains = new Set(INTERVIEW_QUESTIONS.map((q) => q.domain))
    expect(domains.size).toBeGreaterThan(1)
  })

  it('gives every knowledge graph entry at least one resource', () => {
    Object.entries(KNOWLEDGE_GRAPH).forEach(([key, resources]) => {
      expect(resources.length, `knowledge graph key "${key}" has no resources`).toBeGreaterThan(0)
    })
  })

  it('matches multi-word knowledge graph keys against space-separated natural language', () => {
    // Regression test for the extractResources() bug in Assistant.tsx where an
    // underscored key like "zero_trust" never matched user input like "zero trust".
    const multiWordKeys = Object.keys(KNOWLEDGE_GRAPH).filter((k) => k.includes('_'))
    expect(multiWordKeys.length).toBeGreaterThan(0)
    multiWordKeys.forEach((key) => {
      const normalized = key.replace(/_/g, ' ')
      const sampleInput = `can you explain ${normalized} to me`
      expect(sampleInput.includes(normalized), `"${normalized}" should match natural language input`).toBe(true)
    })
  })
})
