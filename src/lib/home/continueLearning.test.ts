import { describe, it, expect } from 'vitest'
import { rankContinueLearningItems } from './continueLearning'
import { ACADEMY_TRACKS } from '../../data/academyTracks'

const firstModuleId = ACADEMY_TRACKS[0].modules[0].id
const secondModuleId = ACADEMY_TRACKS[0].modules[1].id

describe('rankContinueLearningItems', () => {
  it('returns an empty list for a brand-new visitor with no progress', () => {
    expect(rankContinueLearningItems({ academyTouched: {}, labsTouched: {}, bookmarks: [] })).toEqual([])
  })

  it('ranks items most-recently-touched first, across all three sources', () => {
    const result = rankContinueLearningItems({
      academyTouched: { [firstModuleId]: '2026-01-01T00:00:00.000Z' },
      labsTouched: { 'oauth-attack-lab': '2026-03-01T00:00:00.000Z' },
      bookmarks: [{ id: 'term-oidc', title: 'OIDC', link: '/encyclopedia?term=oidc', addedAt: '2026-06-01T00:00:00.000Z' }],
    })

    expect(result.map((r) => r.kind)).toEqual(['bookmark', 'playground', 'academy'])
  })

  it('resolves an academy module to its title and a /learn?track= deep link', () => {
    const [item] = rankContinueLearningItems({
      academyTouched: { [firstModuleId]: '2026-01-01T00:00:00.000Z' },
      labsTouched: {},
      bookmarks: [],
    })
    expect(item.title).toBe(ACADEMY_TRACKS[0].modules[0].title)
    expect(item.link).toBe(`/learn?track=${ACADEMY_TRACKS[0].id}`)
  })

  it('ignores an academy module id that no longer resolves to a real module (stale/renamed)', () => {
    const result = rankContinueLearningItems({
      academyTouched: { 'no-longer-exists': '2026-01-01T00:00:00.000Z' },
      labsTouched: {},
      bookmarks: [],
    })
    expect(result).toEqual([])
  })

  it('humanizes a modern playground moduleId and links to the catalog', () => {
    const [item] = rankContinueLearningItems({
      academyTouched: {},
      labsTouched: { role_mining_workbench: '2026-01-01T00:00:00.000Z' },
      bookmarks: [],
    })
    expect(item.title).toBe('Role Mining Workbench')
    expect(item.link).toBe('/playground')
  })

  it('humanizes a legacy lab- prefixed id (stripping the prefix) and links to /labs', () => {
    const [item] = rankContinueLearningItems({
      academyTouched: {},
      labsTouched: { 'lab-oauth': '2026-01-01T00:00:00.000Z' },
      bookmarks: [],
    })
    expect(item.title).toBe('Oauth')
    expect(item.link).toBe('/labs')
  })

  it('excludes bookmarks with no addedAt timestamp (saved before the field existed)', () => {
    const result = rankContinueLearningItems({
      academyTouched: {},
      labsTouched: {},
      bookmarks: [{ id: 'legacy', title: 'Legacy Bookmark', link: '/tools/x' }],
    })
    expect(result).toEqual([])
  })

  it('caps the result at the given limit', () => {
    const result = rankContinueLearningItems(
      {
        academyTouched: { [firstModuleId]: '2026-01-01T00:00:00.000Z', [secondModuleId]: '2026-01-02T00:00:00.000Z' },
        labsTouched: { role_mining_workbench: '2026-01-03T00:00:00.000Z' },
        bookmarks: [],
      },
      2
    )
    expect(result).toHaveLength(2)
  })
})
