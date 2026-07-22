import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface DisclaimerState {
  hasSeenDisclaimer: boolean
  isOpen: boolean
  openDisclaimer: () => void
  closeDisclaimer: () => void
}

export const useDisclaimerStore = create<DisclaimerState>()(
  persist(
    (set) => ({
      hasSeenDisclaimer: false,
      isOpen: false,
      openDisclaimer: () => set({ isOpen: true }),
      closeDisclaimer: () => set({ isOpen: false, hasSeenDisclaimer: true }),
    }),
    {
      name: 'aboutiam-disclaimer',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({ hasSeenDisclaimer: state.hasSeenDisclaimer }),
    }
  )
)
