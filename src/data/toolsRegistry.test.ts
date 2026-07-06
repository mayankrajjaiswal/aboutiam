import { describe, it, expect } from 'vitest'
import { TOOLS } from './toolsRegistry'

describe('Security Tools Registry (toolsRegistry.ts)', () => {
  it('should assert all registered tools have completely unique slugs', () => {
    const slugs = TOOLS.map(t => t.slug)
    const uniqueSlugs = new Set(slugs)

    expect(slugs.length).toBe(uniqueSlugs.size)
  })

  it('should verify slugs contain only lowercase characters, numbers, and hyphens', () => {
    TOOLS.forEach(t => {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/)
    })
  })

  it('should assert all tools are assigned a valid, pre-defined category', () => {
    const validCategories = new Set([
      'Tokens & Assertions',
      'PKI & Certificates',
      'Hashing, Encoding & Secrets',
      'Auth & Directory Builders',
      'Emerging & Decentralized Identity'
    ])

    TOOLS.forEach(t => {
      expect(validCategories.has(t.category)).toBe(true)
    })
  })

  it('should enforce metadata lengths optimized for SEO and UI cards', () => {
    TOOLS.forEach(t => {
      expect(t.title.length).toBeGreaterThan(5)
      expect(t.title.length).toBeLessThan(100)

      expect(t.description.length).toBeGreaterThan(30)
      expect(t.description.length).toBeLessThan(350)
    })
  })

  it('should verify all "live" tools possess adequate keywords and FAQs for SEO indexing', () => {
    const liveTools = TOOLS.filter(t => t.status === 'live')

    expect(liveTools.length).toBeGreaterThan(0)

    liveTools.forEach(t => {
      // Every live tool must have at least 2 keywords
      expect(t.keywords.length).toBeGreaterThanOrEqual(2)

      // Every live tool must have at least 1 FAQ block for schema generation
      expect(t.faqs.length).toBeGreaterThanOrEqual(1)

      // FAQs must contain actual question/answer values
      t.faqs.forEach(faq => {
        expect(faq.q.trim().length).toBeGreaterThan(5)
        expect(faq.a.trim().length).toBeGreaterThan(10)
      })
    })
  })
})
