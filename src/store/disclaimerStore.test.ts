import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDisclaimerStore } from './disclaimerStore'

describe('useDisclaimerStore (Zustand First-Visit Disclaimer Engine)', () => {
  beforeEach(() => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: false, isOpen: false })

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('should initialize as unseen and closed', () => {
    const state = useDisclaimerStore.getState()
    expect(state.hasSeenDisclaimer).toBe(false)
    expect(state.isOpen).toBe(false)
  })

  it('should open the disclaimer on openDisclaimer()', () => {
    useDisclaimerStore.getState().openDisclaimer()
    expect(useDisclaimerStore.getState().isOpen).toBe(true)
    expect(useDisclaimerStore.getState().hasSeenDisclaimer).toBe(false)
  })

  it('should close the disclaimer and mark it as seen on closeDisclaimer()', () => {
    useDisclaimerStore.getState().openDisclaimer()
    useDisclaimerStore.getState().closeDisclaimer()
    expect(useDisclaimerStore.getState().isOpen).toBe(false)
    expect(useDisclaimerStore.getState().hasSeenDisclaimer).toBe(true)
  })
})
