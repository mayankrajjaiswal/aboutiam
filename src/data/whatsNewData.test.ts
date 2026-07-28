import { describe, it, expect } from 'vitest'
import { WHATS_NEW_RELEASES, WHATS_NEW_VERSION } from './whatsNewData'

describe('whatsNewData', () => {
  it('has at least one release', () => {
    expect(WHATS_NEW_RELEASES.length).toBeGreaterThan(0)
  })

  it('exposes the newest release version as WHATS_NEW_VERSION', () => {
    expect(WHATS_NEW_VERSION).toBe(WHATS_NEW_RELEASES[0].version)
  })

  it('has unique version identifiers across releases', () => {
    const versions = WHATS_NEW_RELEASES.map((r) => r.version)
    expect(new Set(versions).size).toBe(versions.length)
  })

  it('every release has a date and at least one item with a title and description', () => {
    for (const release of WHATS_NEW_RELEASES) {
      expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(release.items.length).toBeGreaterThan(0)
      for (const item of release.items) {
        expect(item.title.length).toBeGreaterThan(0)
        expect(item.description.length).toBeGreaterThan(0)
      }
    }
  })

  it('every item path, when present, is a root-relative route', () => {
    for (const release of WHATS_NEW_RELEASES) {
      for (const item of release.items) {
        if (item.path) {
          expect(item.path.startsWith('/')).toBe(true)
        }
      }
    }
  })
})
