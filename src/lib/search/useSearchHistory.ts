import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SearchHistoryState {
  recentQueries: string[]
  pushQuery: (query: string) => void
  clearHistory: () => void
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recentQueries: [],
      pushQuery: (query) => {
        const trimmed = query.trim()
        if (!trimmed || trimmed.startsWith('/')) return
        set((state) => {
          const filtered = state.recentQueries.filter((q) => q !== trimmed)
          return {
            recentQueries: [trimmed, ...filtered].slice(0, 5), // Cap at 5 entries
          }
        })
      },
      clearHistory: () => set({ recentQueries: [] }),
    }),
    {
      name: 'aboutiam-search-history',
    }
  )
)
