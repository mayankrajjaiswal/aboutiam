import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeType = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  initializeTheme: () => (() => void) | void
}

const applyTheme = (theme: ThemeType) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  
  let activeTheme = theme
  if (theme === 'system') {
    const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    activeTheme = systemDark ? 'dark' : 'light'
  }
  
  root.classList.add(activeTheme)
  root.style.colorScheme = activeTheme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      initializeTheme: () => {
        const theme = get().theme
        applyTheme(theme)
        
        if (typeof window === 'undefined') return () => {}
        
        // Setup media query listener for system theme shifts
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          if (get().theme === 'system') {
            applyTheme('system')
          }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
    }),
    {
      name: 'aboutiam-theme-preference',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined, // SSR-Safe Zustand Persist
    }
  )
)
