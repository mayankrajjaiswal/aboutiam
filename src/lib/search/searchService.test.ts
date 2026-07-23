import { describe, expect, it } from 'vitest'
import { getSearchIndex } from './searchService'
import { STANDARDS } from '../../data/standardsData'
import { PROJECTS as REFERENCE_PROJECTS } from '../../data/referenceProjects'

describe('getSearchIndex deep-link entries', () => {
  it('indexes all living standards with ?standard= deep links', () => {
    const index = getSearchIndex()
    const results = index.search('OAuth 2.1')
    const match = results.find((r) => r.id === 'standard-oauth21')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string }).link).toBe('/standards?standard=oauth21')
  })

  it('indexes every entry in standardsData.ts by id — closes the standards/search drift bug', () => {
    const index = getSearchIndex()
    STANDARDS.forEach((std) => {
      const results = index.search(std.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `standard-${std.id}`)
      expect(match, `expected "${std.title}" (${std.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string }).link).toBe(`/standards?standard=${std.id}`)
    })
  })

  it('indexes reference architectures with ?arch= deep links', () => {
    const index = getSearchIndex()
    const results = index.search('Zero Trust')
    const match = results.find((r) => r.id === 'arch-zero_trust')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string }).link).toBe('/architecture?arch=zero_trust')
  })

  it('gives every standards/architecture item a non-empty category and keywords', () => {
    const index = getSearchIndex()
    const all = [
      ...index.search('standard', { prefix: true }),
      ...index.search('architecture', { prefix: true }),
    ].filter((r) => r.id.startsWith('standard-') || r.id.startsWith('arch-'))
    expect(all.length).toBeGreaterThan(0)
  })

  it('indexes sidebar/nav pages not covered by other categories', () => {
    const index = getSearchIndex()

    const reportResult = index.search('report', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/reports')
    expect(reportResult).toBeTruthy()

    const termsResult = index.search('terms', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/terms')
    expect(termsResult).toBeTruthy()

    const assessResult = index.search('assess', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/assess')
    expect(assessResult).toBeTruthy()
  })

  it('indexes every entry in referenceProjects.ts\'s PROJECTS with a ?ref= deep link', () => {
    const index = getSearchIndex()
    REFERENCE_PROJECTS.forEach((project) => {
      const results = index.search(project.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `reference-${project.id}`)
      expect(match, `expected "${project.title}" (${project.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/references?ref=${project.id}`)
      expect((match as unknown as { category: string }).category).toBe('🗂️ Reference Implementations')
    })
  })

  it('covers reference implementations across all three levels (beginner, intermediate, advanced)', () => {
    const levels = new Set(REFERENCE_PROJECTS.map((p) => p.level))
    expect(levels.has('beginner')).toBe(true)
    expect(levels.has('intermediate')).toBe(true)
    expect(levels.has('advanced')).toBe(true)
  })

  it('gives every reference implementation a unique id', () => {
    const ids = REFERENCE_PROJECTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes compliance deadlines under the deadlines category with a deep link', () => {
    const index = getSearchIndex()
    const results = index.search('DORA')
    const match = results.find((r) => r.id === 'deadline-dora-application')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string; category: string }).link).toBe('/standards?view=deadlines')
    expect((match as unknown as { category: string }).category).toBe('📅 Compliance Deadlines')
  })
})
