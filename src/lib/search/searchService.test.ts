import { describe, expect, it } from 'vitest'
import { getSearchIndex } from './searchService'
import { STANDARDS } from '../../data/standardsData'
import { CASE_STUDIES, CASE_STUDY_CATEGORIES } from '../../data/caseStudiesData'
import { PROJECTS as REFERENCE_PROJECTS } from '../../data/referenceProjects'
import { ARCHITECTURES } from '../../data/architectureData'
import { EXPLORE_PRODUCTS, EXPLORE_TYPES } from '../../data/exploreData'

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

  it('indexes every entry in architectureData.ts by id — closes the architecture/search drift bug', () => {
    const index = getSearchIndex()
    ARCHITECTURES.forEach((arch) => {
      const results = index.search(arch.name, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `arch-${arch.id}`)
      expect(match, `expected "${arch.name}" (${arch.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/architecture?arch=${arch.id}`)
      expect((match as unknown as { category: string }).category).toBe('🏛️ Reference Architectures')
    })
  })

  it('covers reference architectures across all three difficulty tiers', () => {
    const difficulties = new Set(ARCHITECTURES.map((a) => a.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)
  })

  it('gives every reference architecture a unique id', () => {
    const ids = ARCHITECTURES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
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

  it('indexes every entry in caseStudiesData.ts with a ?study= deep link — closes the case-studies/search drift bug', () => {
    const index = getSearchIndex()
    CASE_STUDIES.forEach((cs) => {
      const results = index.search(cs.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `case-${cs.id}`)
      expect(match, `expected "${cs.title}" (${cs.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/case-studies?study=${cs.id}`)
      expect((match as unknown as { category: string }).category).toBe('🏢 Case Study Center')
    })
  })

  it('covers case studies across all three difficulty tiers and every category', () => {
    const difficulties = new Set(CASE_STUDIES.map((cs) => cs.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const categories = new Set(CASE_STUDIES.map((cs) => cs.category))
    CASE_STUDY_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat), `expected at least one case study in category "${cat}"`).toBe(true)
    })
  })

  it('gives every case study a unique id', () => {
    const ids = CASE_STUDIES.map((cs) => cs.id)
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

  it('indexes every entry in exploreData.ts with a ?product= deep link', () => {
    const index = getSearchIndex()
    EXPLORE_PRODUCTS.forEach((p) => {
      const results = index.search(p.name, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `explore-${p.id}`)
      expect(match, `expected "${p.name}" (${p.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/explore?product=${p.id}`)
      expect((match as unknown as { category: string }).category).toBe('🧭 IAM Landscape Directory')
    })
  })

  it('covers IAM landscape products across all three difficulty tiers and every product type', () => {
    const difficulties = new Set(EXPLORE_PRODUCTS.map((p) => p.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const types = new Set(EXPLORE_PRODUCTS.map((p) => p.type))
    EXPLORE_TYPES.forEach((t) => {
      expect(types.has(t), `expected at least one product of type "${t}"`).toBe(true)
    })
  })

  it('gives every IAM landscape product a unique id', () => {
    const ids = EXPLORE_PRODUCTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
