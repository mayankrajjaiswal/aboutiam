import { describe, it, expect } from 'vitest'
import { THALES_PRODUCTS, VENDOR_CATALOG, type NextGenTheme } from './vendorCatalog'
import { NEXT_GEN_THEMES, type NextGenThemeId } from './nextGenThemes'

describe('THALES_PRODUCTS', () => {
  it('has unique ids', () => {
    const ids = THALES_PRODUCTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the 2 new Next-Gen IAM product entries', () => {
    const ids = ['luna_hsm', 'ai_security_fabric']
    for (const id of ids) {
      expect(THALES_PRODUCTS.some((p) => p.id === id)).toBe(true)
    }
  })

  it('every nextGenThemeCapabilities entry has a non-empty capability, sourceLink, and verifiedDate', () => {
    for (const product of THALES_PRODUCTS) {
      for (const cap of product.nextGenThemeCapabilities ?? []) {
        expect(cap.capability.length).toBeGreaterThan(0)
        expect(cap.sourceLink).toMatch(/^https:\/\//)
        expect(cap.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('every nextGenThemeCapabilities theme id resolves to a real NextGenTheme', () => {
    const realThemeIds = new Set<NextGenThemeId>(NEXT_GEN_THEMES.map((t) => t.id))
    for (const product of THALES_PRODUCTS) {
      for (const cap of product.nextGenThemeCapabilities ?? []) {
        const theme: NextGenTheme = cap.theme
        expect(realThemeIds.has(theme as unknown as NextGenThemeId)).toBe(true)
      }
    }
  })

  it('covers at least 4 of the 5 Next-Gen IAM themes across all products', () => {
    const coveredThemes = new Set<NextGenTheme>()
    for (const product of THALES_PRODUCTS) {
      for (const cap of product.nextGenThemeCapabilities ?? []) {
        coveredThemes.add(cap.theme)
      }
    }
    expect(coveredThemes.size).toBeGreaterThanOrEqual(4)
  })
})

describe('VENDOR_CATALOG thales entry', () => {
  it('is marked as the featured flagship partner', () => {
    expect(VENDOR_CATALOG.thales.isFeatured).toBe(true)
  })
})
