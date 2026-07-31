import { describe, it, expect } from 'vitest'
import { buildFieldGuideSections, buildFieldGuideDoc, buildFieldGuidePdfBlob, type FieldGuideSection } from './fieldGuidePdf'

const FIXTURE_SECTIONS: FieldGuideSection[] = [
  { title: 'Section One', rows: [['Term A', 'Detail A'], ['Term B', 'Detail B']] },
  { title: 'Section Two', rows: [['Term C', 'Detail C']] },
]

describe('buildFieldGuideSections', () => {
  it('returns the 3 expected sections, each with at least one row', () => {
    const sections = buildFieldGuideSections()
    expect(sections.map((s) => s.title)).toEqual([
      'IAM Encyclopedia',
      'Living Standards & RFC Explorer',
      'Developer Playbooks (Cheat Sheets)',
    ])
    for (const section of sections) {
      expect(section.rows.length).toBeGreaterThan(0)
    }
  })
})

describe('buildFieldGuideDoc', () => {
  it('produces a well-formed jsPDF document from a fixture content set without throwing', async () => {
    const doc = await buildFieldGuideDoc(FIXTURE_SECTIONS)
    expect(doc).toBeTruthy()
    expect(typeof doc.output).toBe('function')
  })

  it('the generated document has one title page plus one page per section', async () => {
    const doc = await buildFieldGuideDoc(FIXTURE_SECTIONS)
    expect(doc.getNumberOfPages()).toBe(FIXTURE_SECTIONS.length + 1)
  })

  it('works against the real site content without throwing', async () => {
    const doc = await buildFieldGuideDoc()
    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
  })
})

describe('buildFieldGuidePdfBlob', () => {
  it('produces a non-empty PDF blob', async () => {
    const blob = await buildFieldGuidePdfBlob()
    expect(blob.size).toBeGreaterThan(0)
    expect(blob.type).toBe('application/pdf')
  })
})
