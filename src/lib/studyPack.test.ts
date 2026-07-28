import { describe, it, expect } from 'vitest'
import {
  buildManifestMarkdown,
  buildEncyclopediaMarkdown,
  buildStandardsMarkdown,
  buildArchitecturesMarkdown,
  buildCheatSheetsMarkdown,
  buildStudyPackFiles,
} from './studyPack'
import { ENCYCLOPEDIA_TERMS } from '../data/encyclopediaData'
import { STANDARDS } from '../data/standardsData'
import { ARCHITECTURES } from '../data/architectureData'
import { CHEAT_SHEETS } from '../data/cheatSheetsData'

describe('buildManifestMarkdown', () => {
  it('lists every bundled file and the site URL', () => {
    const md = buildManifestMarkdown()
    expect(md).toContain('encyclopedia.md')
    expect(md).toContain('standards.md')
    expect(md).toContain('architectures.md')
    expect(md).toContain('cheat-sheets.md')
    expect(md).toContain('https://www.aboutiam.com')
  })
})

describe('buildEncyclopediaMarkdown', () => {
  const md = buildEncyclopediaMarkdown()

  it('includes every encyclopedia term and its analogy', () => {
    for (const term of ENCYCLOPEDIA_TERMS) {
      expect(md).toContain(term.term)
      expect(md).toContain(term.analogy)
    }
  })

  it('groups terms under category headings', () => {
    const categories = new Set(ENCYCLOPEDIA_TERMS.map((t) => t.category))
    for (const category of categories) {
      expect(md).toContain(`## ${category}`)
    }
  })
})

describe('buildStandardsMarkdown', () => {
  const md = buildStandardsMarkdown()

  it('includes every standard title and summary', () => {
    for (const standard of STANDARDS) {
      expect(md).toContain(standard.title)
      expect(md).toContain(standard.summary)
    }
  })
})

describe('buildArchitecturesMarkdown', () => {
  const md = buildArchitecturesMarkdown()

  it('includes every architecture name and description', () => {
    for (const architecture of ARCHITECTURES) {
      expect(md).toContain(architecture.name)
      expect(md).toContain(architecture.description)
    }
  })
})

describe('buildCheatSheetsMarkdown', () => {
  const md = buildCheatSheetsMarkdown()

  it('includes every cheat sheet title and its checklist items', () => {
    for (const sheet of CHEAT_SHEETS) {
      expect(md).toContain(sheet.title)
      for (const check of sheet.checks) {
        expect(md).toContain(check.task)
      }
    }
  })
})

describe('buildStudyPackFiles', () => {
  const files = buildStudyPackFiles()

  it('returns one non-empty file per bundled source, with no duplicate paths', () => {
    expect(files.length).toBeGreaterThanOrEqual(5)
    const paths = files.map((f) => f.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const file of files) {
      expect(file.content.length).toBeGreaterThan(0)
    }
  })

  it('includes the manifest as README.md', () => {
    const readme = files.find((f) => f.path === 'README.md')
    expect(readme?.content).toBe(buildManifestMarkdown())
  })
})
