import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface GoogleDriveSyncState {
  /** ISO timestamp of the last successful backup, or null if one has never run. Not sensitive — safe to persist locally. */
  lastBackupAt: string | null
  setLastBackupAt: (iso: string) => void
}

export const useGoogleDriveSyncStore = create<GoogleDriveSyncState>()(
  persist(
    (set) => ({
      lastBackupAt: null,
      setLastBackupAt: (iso) => set({ lastBackupAt: iso }),
    }),
    {
      name: 'aboutiam-drive-sync',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
