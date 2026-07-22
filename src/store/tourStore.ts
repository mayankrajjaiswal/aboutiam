import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TourState {
  hasSeenTour: boolean
  isOpen: boolean
  openTour: () => void
  closeTour: () => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasSeenTour: false,
      isOpen: false,
      openTour: () => set({ isOpen: true }),
      closeTour: () => set({ isOpen: false, hasSeenTour: true }),
    }),
    {
      name: 'aboutiam-guided-tour',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({ hasSeenTour: state.hasSeenTour }),
    }
  )
)
