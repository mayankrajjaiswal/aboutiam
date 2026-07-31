import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StartHereGoalId } from '../data/startHereRoutes'

interface StartHereState {
  selectedGoalId: StartHereGoalId | null
  completedPaths: string[]
  selectGoal: (id: StartHereGoalId) => void
  toggleStepComplete: (path: string) => void
  isStepComplete: (path: string) => boolean
  reset: () => void
}

export const useStartHereStore = create<StartHereState>()(
  persist(
    (set, get) => ({
      selectedGoalId: null,
      completedPaths: [],
      selectGoal: (id) => set({ selectedGoalId: id, completedPaths: [] }),
      toggleStepComplete: (path) =>
        set((state) => ({
          completedPaths: state.completedPaths.includes(path)
            ? state.completedPaths.filter((p) => p !== path)
            : [...state.completedPaths, path],
        })),
      isStepComplete: (path) => get().completedPaths.includes(path),
      reset: () => set({ selectedGoalId: null, completedPaths: [] }),
    }),
    {
      name: 'aboutiam-start-here-progress',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
