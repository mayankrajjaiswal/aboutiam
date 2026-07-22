import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface BookmarkedItem {
  id: string
  title: string
  link: string
}

interface BookmarksState {
  bookmarks: BookmarkedItem[]
  isBookmarked: (id: string) => boolean
  toggleBookmark: (item: BookmarkedItem) => void
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),
      toggleBookmark: (item) =>
        set((state) => ({
          bookmarks: state.bookmarks.some((b) => b.id === item.id)
            ? state.bookmarks.filter((b) => b.id !== item.id)
            : [...state.bookmarks, item]
        }))
    }),
    {
      name: 'aboutiam-bookmarks',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
