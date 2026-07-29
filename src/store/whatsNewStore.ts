import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WhatsNewState {
  lastSeenVersion: string | null
  isOpen: boolean
  openWhatsNew: () => void
  closeWhatsNew: (version: string) => void
}

export const useWhatsNewStore = create<WhatsNewState>()(
  persist(
    (set) => ({
      lastSeenVersion: null,
      isOpen: false,
      openWhatsNew: () => set({ isOpen: true }),
      closeWhatsNew: (version) => set({ isOpen: false, lastSeenVersion: version }),
    }),
    {
      name: 'aboutiam-whats-new',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({ lastSeenVersion: state.lastSeenVersion }),
    }
  )
)
