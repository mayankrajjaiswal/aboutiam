import { describe, it, expect } from 'vitest'
import { generateTabletopScript, scriptToMarkdown, type TabletopAnswers } from './tabletopGenerator'
import { BULLETINS } from '../../data/bulletinsData'

const SAMPLE_ANSWERS: TabletopAnswers = {
  industry: 'Financial Services',
  idpType: 'Okta',
  teamSize: 'Small (5-10)',
}

describe('generateTabletopScript', () => {
  it('every BULLETINS entry generates a complete script with non-empty objectives, injects, prompts, and rubric', () => {
    for (const bulletin of BULLETINS) {
      const script = generateTabletopScript(bulletin, SAMPLE_ANSWERS)
      expect(script.objectives.length).toBeGreaterThan(0)
      expect(script.injects.length).toBeGreaterThan(0)
      expect(script.discussionPrompts.length).toBeGreaterThan(0)
      expect(script.rubric.length).toBeGreaterThan(0)
    }
  })

  it('produces a T+0, T+15, and T+30 inject sequence', () => {
    const script = generateTabletopScript(BULLETINS[0], SAMPLE_ANSWERS)
    expect(script.injects.map((i) => i.timeOffset)).toEqual(['T+0', 'T+15', 'T+30'])
  })

  it('generates one discussion prompt per playbook step', () => {
    const bulletin = BULLETINS[0]
    const script = generateTabletopScript(bulletin, SAMPLE_ANSWERS)
    expect(script.discussionPrompts.length).toBe(bulletin.playbookSteps.length)
  })

  it('carries the bulletin id and reflects the questionnaire answers', () => {
    const bulletin = BULLETINS[0]
    const script = generateTabletopScript(bulletin, SAMPLE_ANSWERS)
    expect(script.bulletinId).toBe(bulletin.id)
    expect(script.industry).toBe(SAMPLE_ANSWERS.industry)
    expect(script.idpType).toBe(SAMPLE_ANSWERS.idpType)
    expect(script.teamSize).toBe(SAMPLE_ANSWERS.teamSize)
  })

  it('produces exactly 3 rubric areas', () => {
    const script = generateTabletopScript(BULLETINS[0], SAMPLE_ANSWERS)
    expect(script.rubric.length).toBe(3)
    expect(script.rubric.map((r) => r.area)).toEqual(['Identity Detection', 'Incident Communications', 'Remediation Execution'])
  })
})

describe('scriptToMarkdown', () => {
  it('produces a non-empty Markdown document containing the script title', () => {
    const script = generateTabletopScript(BULLETINS[0], SAMPLE_ANSWERS)
    const markdown = scriptToMarkdown(script)
    expect(markdown).toContain(script.title)
    expect(markdown).toContain('## Objectives')
    expect(markdown).toContain('## Timed Injects')
    expect(markdown).toContain('## Scoring Rubric')
  })
})
