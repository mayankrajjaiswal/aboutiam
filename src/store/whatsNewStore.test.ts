import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWhatsNewStore } from './whatsNewStore'

describe('useWhatsNewStore (Zustand What\'s New changelog gate)', () => {
  beforeEach(() => {
    useWhatsNewStore.setState({ lastSeenVersion: null, isOpen: false })

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('should initialize as unseen and closed', () => {
    const state = useWhatsNewStore.getState()
    expect(state.lastSeenVersion).toBeNull()
    expect(state.isOpen).toBe(false)
  })

  it('should open on openWhatsNew()', () => {
    useWhatsNewStore.getState().openWhatsNew()
    expect(useWhatsNewStore.getState().isOpen).toBe(true)
    expect(useWhatsNewStore.getState().lastSeenVersion).toBeNull()
  })

  it('should close and persist the dismissed version on closeWhatsNew(version)', () => {
    useWhatsNewStore.getState().openWhatsNew()
    useWhatsNewStore.getState().closeWhatsNew('2026.07.28')
    expect(useWhatsNewStore.getState().isOpen).toBe(false)
    expect(useWhatsNewStore.getState().lastSeenVersion).toBe('2026.07.28')
  })
})
