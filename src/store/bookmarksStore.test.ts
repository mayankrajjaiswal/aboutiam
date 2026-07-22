import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarksStore } from './bookmarksStore'

const sampleItem = { id: 'tool-jwt-decoder', title: 'JWT Decoder', link: '/tools/jwt-decoder' }
const otherItem = { id: 'term-oidc', title: 'OIDC', link: '/encyclopedia?term=oidc' }

describe('useBookmarksStore (Zustand Bookmarks Engine)', () => {
  beforeEach(() => {
    useBookmarksStore.setState({ bookmarks: [] })

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('should initialize with an empty bookmarks list', () => {
    expect(useBookmarksStore.getState().bookmarks).toEqual([])
  })

  it('should add a new bookmark on toggle', () => {
    useBookmarksStore.getState().toggleBookmark(sampleItem)
    expect(useBookmarksStore.getState().bookmarks).toEqual([sampleItem])
  })

  it('should remove an existing bookmark on toggle', () => {
    useBookmarksStore.getState().toggleBookmark(sampleItem)
    useBookmarksStore.getState().toggleBookmark(sampleItem)
    expect(useBookmarksStore.getState().bookmarks).toEqual([])
  })

  it('should not add duplicate entries for the same id', () => {
    useBookmarksStore.setState({ bookmarks: [sampleItem] })
    useBookmarksStore.getState().toggleBookmark({ ...sampleItem, title: 'Different Title' })
    // Toggling an already-bookmarked id removes it, regardless of payload differences
    expect(useBookmarksStore.getState().bookmarks).toEqual([])
  })

  it('should track multiple distinct bookmarks independently', () => {
    useBookmarksStore.getState().toggleBookmark(sampleItem)
    useBookmarksStore.getState().toggleBookmark(otherItem)
    expect(useBookmarksStore.getState().bookmarks).toHaveLength(2)
    expect(useBookmarksStore.getState().isBookmarked(sampleItem.id)).toBe(true)
    expect(useBookmarksStore.getState().isBookmarked(otherItem.id)).toBe(true)
    expect(useBookmarksStore.getState().isBookmarked('nonexistent')).toBe(false)
  })
})
