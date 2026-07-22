import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePreferenceStore } from './preferenceStore'

describe('usePreferenceStore (Zustand Personalization Engine)', () => {
  beforeEach(() => {
    usePreferenceStore.setState({ depthMode: 'both', roleTrack: null })

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
