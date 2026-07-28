import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { scheduleNextReview, type CardSchedule, type ReviewGrade } from '../lib/learning/spacedRepetition'

interface SpacedRepetitionState {
  schedules: Record<string, CardSchedule>
  recordReview: (breachId: string, grade: ReviewGrade, reviewedAt: string) => void
}

export const useSpacedRepetitionStore = create<SpacedRepetitionState>()(
  persist(
    (set, get) => ({
      schedules: {},
      recordReview: (breachId, grade, reviewedAt) =>
        set((state) => ({
          schedules: {
            ...state.schedules,
            [breachId]: scheduleNextReview(get().schedules[breachId] ?? null, grade, reviewedAt)
          }
        }))
    }),
    {
      name: 'aboutiam-spaced-repetition',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
