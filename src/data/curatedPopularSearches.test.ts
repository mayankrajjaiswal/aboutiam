import { describe, it, expect } from 'vitest'
import { CURATED_POPULAR_SEARCHES } from './curatedPopularSearches'
import { ROUTE_META } from '../routeMeta'
import { ARCHITECTURES } from './architectureData'
import { ENCYCLOPEDIA_TERMS } from './encyclopediaData'

const knownPaths = new Set(ROUTE_META.map((r) => r.path))

describe('CURATED_POPULAR_SEARCHES', () => {
  it('has unique, non-empty ids and labels', () => {
    const ids = new Set<string>()
    for (const entry of CURATED_POPULAR_SEARCHES) {
      expect(entry.label.length).toBeGreaterThan(0)
      expect(ids.has(entry.id)).toBe(false)
      ids.add(entry.id)
    }
  })

  it('every entry\'s link resolves to a currently-registered route', () => {
    for (const entry of CURATED_POPULAR_SEARCHES) {
      const [pathname, query] = entry.link.split('?')
      expect(knownPaths.has(pathname)).toBe(true)

      if (query) {
        const params = new URLSearchParams(query)
        const archId = params.get('arch')
        if (archId) expect(ARCHITECTURES.some((a) => a.id === archId)).toBe(true)
        const termId = params.get('term')
        if (termId) expect(ENCYCLOPEDIA_TERMS.some((t) => t.id === termId)).toBe(true)
      }
    }
  })
})
