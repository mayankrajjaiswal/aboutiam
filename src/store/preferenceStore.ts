import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DepthMode = 'beginner' | 'expert' | 'both'
export type RoleTrackId = 'fresher' | 'developer' | 'security_engineer' | 'iam_engineer' | 'architect' | 'principal'

interface PreferenceState {
  depthMode: DepthMode
  roleTrack: RoleTrackId | null
  /** Spacing-adjusted, warm-background reading profile per British Dyslexia Association guidance. */
  readingMode: boolean
  /** Swaps the site's pass/fail/risk-tier status colors for a deuteranopia/protanopia-safe set. */
  colorblindSafePalette: boolean
  setDepthMode: (mode: DepthMode) => void
  setRoleTrack: (track: RoleTrackId | null) => void
  setReadingMode: (enabled: boolean) => void
  setColorblindSafePalette: (enabled: boolean) => void
  /** Re-applies the persisted reading-mode/colorblind-safe classes to <html> on mount (see App.tsx). */
  initializeAccessibilityPreferences: () => void
}

function applyAccessibilityClass(className: string, enabled: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle(className, enabled)
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      depthMode: 'both',
      roleTrack: null,
      readingMode: false,
      colorblindSafePalette: false,
      setDepthMode: (depthMode) => set({ depthMode }),
      setRoleTrack: (roleTrack) => set({ roleTrack }),
      setReadingMode: (enabled) => {
        set({ readingMode: enabled })
        applyAccessibilityClass('reading-mode', enabled)
      },
      setColorblindSafePalette: (enabled) => {
        set({ colorblindSafePalette: enabled })
        applyAccessibilityClass('colorblind-safe', enabled)
      },
      initializeAccessibilityPreferences: () => {
        applyAccessibilityClass('reading-mode', get().readingMode)
        applyAccessibilityClass('colorblind-safe', get().colorblindSafePalette)
      },
    }),
    {
      name: 'aboutiam-preferences',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
