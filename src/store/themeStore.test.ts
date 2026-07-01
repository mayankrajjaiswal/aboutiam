import { describe, it, expect } from 'vitest'
import { useThemeStore } from './themeStore'

describe('useThemeStore (Zustand Global State Engine)', () => {
  it('should initialize with system theme preference by default', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
  })

  it('should dynamically update theme states on toggle triggers', () => {
    // Transition to dark mode
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')

    // Transition to light mode
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')

    // Reset back to system mode
    useThemeStore.getState().setTheme('system')
    expect(useThemeStore.getState().theme).toBe('system')
  })
})
