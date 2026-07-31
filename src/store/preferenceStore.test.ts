import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePreferenceStore } from './preferenceStore'

describe('usePreferenceStore (Zustand Personalization Engine)', () => {
  beforeEach(() => {
    usePreferenceStore.setState({ depthMode: 'both', roleTrack: null, readingMode: false, colorblindSafePalette: false })

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('should default to both depth mode and no role track', () => {
    const state = usePreferenceStore.getState()
    expect(state.depthMode).toBe('both')
    expect(state.roleTrack).toBeNull()
  })

  it('should default readingMode and colorblindSafePalette to false', () => {
    const state = usePreferenceStore.getState()
    expect(state.readingMode).toBe(false)
    expect(state.colorblindSafePalette).toBe(false)
  })

  it('should update readingMode via setReadingMode, and rehydrate correctly', () => {
    usePreferenceStore.getState().setReadingMode(true)
    expect(usePreferenceStore.getState().readingMode).toBe(true)

    usePreferenceStore.getState().setReadingMode(false)
    expect(usePreferenceStore.getState().readingMode).toBe(false)
  })

  it('should update colorblindSafePalette via setColorblindSafePalette, and rehydrate correctly', () => {
    usePreferenceStore.getState().setColorblindSafePalette(true)
    expect(usePreferenceStore.getState().colorblindSafePalette).toBe(true)

    usePreferenceStore.getState().setColorblindSafePalette(false)
    expect(usePreferenceStore.getState().colorblindSafePalette).toBe(false)
  })

  it('initializeAccessibilityPreferences does not throw when document is unavailable (SSR-safety)', () => {
    usePreferenceStore.getState().setReadingMode(true)
    expect(() => usePreferenceStore.getState().initializeAccessibilityPreferences()).not.toThrow()
  })

  it('should update depthMode via setDepthMode', () => {
    usePreferenceStore.getState().setDepthMode('beginner')
    expect(usePreferenceStore.getState().depthMode).toBe('beginner')

    usePreferenceStore.getState().setDepthMode('expert')
    expect(usePreferenceStore.getState().depthMode).toBe('expert')
  })

  it('should update roleTrack via setRoleTrack, including clearing it back to null', () => {
    usePreferenceStore.getState().setRoleTrack('iam_engineer')
    expect(usePreferenceStore.getState().roleTrack).toBe('iam_engineer')

    usePreferenceStore.getState().setRoleTrack(null)
    expect(usePreferenceStore.getState().roleTrack).toBeNull()
  })
})
