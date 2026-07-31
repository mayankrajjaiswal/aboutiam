import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CoachMarkState {
  seenFeatureIds: string[]
  isSeen: (featureId: string) => boolean
  markSeen: (featureId: string) => void
  resetAll: () => void
}

/**
 * Per-feature "seen" tracking for CoachMark.tsx — generalizes tourStore.ts's
 * single global `hasSeenTour` boolean into a set of feature ids, one per
 * complex widget (Attack-Path Graph, Role Mining Workbench, etc).
 */
export const useCoachMarkStore = create<CoachMarkState>()(
  persist(
    (set, get) => ({
      seenFeatureIds: [],
      isSeen: (featureId) => get().seenFeatureIds.includes(featureId),
      markSeen: (featureId) =>
        set((state) => (state.seenFeatureIds.includes(featureId) ? state : { seenFeatureIds: [...state.seenFeatureIds, featureId] })),
      resetAll: () => set({ seenFeatureIds: [] }),
    }),
    {
      name: 'aboutiam-coach-marks',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
