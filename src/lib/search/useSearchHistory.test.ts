import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchHistoryStore } from './useSearchHistory'

describe('useSearchHistoryStore', () => {
  beforeEach(() => {
    useSearchHistoryStore.setState({ recentQueries: [] })
  })

  it('adds a query to the front of the list', () => {
    useSearchHistoryStore.getState().pushQuery('oauth')
    expect(useSearchHistoryStore.getState().recentQueries).toEqual(['oauth'])
  })

  it('most-recent-first ordering: a newer push moves ahead of older ones', () => {
    useSearchHistoryStore.getState().pushQuery('oauth')
    useSearchHistoryStore.getState().pushQuery('saml')
    expect(useSearchHistoryStore.getState().recentQueries).toEqual(['saml', 'oauth'])
  })

  it('de-duplicates: re-pushing an existing query moves it to the front instead of adding a second entry', () => {
    useSearchHistoryStore.getState().pushQuery('oauth')
    useSearchHistoryStore.getState().pushQuery('saml')
    useSearchHistoryStore.getState().pushQuery('oauth')
    expect(useSearchHistoryStore.getState().recentQueries).toEqual(['oauth', 'saml'])
  })

  it('caps the ring buffer at 5 entries', () => {
    for (const q of ['a', 'b', 'c', 'd', 'e', 'f']) {
      useSearchHistoryStore.getState().pushQuery(q)
    }
    expect(useSearchHistoryStore.getState().recentQueries).toEqual(['f', 'e', 'd', 'c', 'b'])
  })

  it('ignores blank queries and slash commands', () => {
    useSearchHistoryStore.getState().pushQuery('   ')
    useSearchHistoryStore.getState().pushQuery('/theme')
    expect(useSearchHistoryStore.getState().recentQueries).toEqual([])
  })

  it('clearHistory empties the list', () => {
    useSearchHistoryStore.getState().pushQuery('oauth')
    useSearchHistoryStore.getState().clearHistory()
    expect(useSearchHistoryStore.getState().recentQueries).toEqual([])
  })
})
