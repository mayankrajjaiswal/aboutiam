import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DepthMode = 'beginner' | 'expert' | 'both'
export type RoleTrackId = 'fresher' | 'developer' | 'security_engineer' | 'iam_engineer' | 'architect' | 'principal'

interface PreferenceState {
  depthMode: DepthMode
  roleTrack: RoleTrackId | null
  setDepthMode: (mode: DepthMode) => void
  setRoleTrack: (track: RoleTrackId | null) => void
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      depthMode: 'both',
      roleTrack: null,
      setDepthMode: (depthMode) => set({ depthMode }),
      setRoleTrack: (roleTrack) => set({ roleTrack }),
    }),
    {
      name: 'aboutiam-preferences',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
