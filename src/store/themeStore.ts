import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeType = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  initializeTheme: () => (() => void) | void
}

const applyTheme = (theme: ThemeType) => {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  
  let activeTheme = theme
  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    activeTheme = systemDark ? 'dark' : 'light'
  }
  
  root.classList.add(activeTheme)
  // Ensure background transitions don't flicker on load
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
    }
  )
)
