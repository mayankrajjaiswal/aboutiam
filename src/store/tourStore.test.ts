import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTourStore } from './tourStore'

describe('useTourStore (Zustand Guided Tour Engine)', () => {
  beforeEach(() => {
    useTourStore.setState({ hasSeenTour: false, isOpen: false })

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('should initialize as unseen and closed', () => {
    const state = useTourStore.getState()
    expect(state.hasSeenTour).toBe(false)
    expect(state.isOpen).toBe(false)
  })

  it('should open the tour on openTour()', () => {
    useTourStore.getState().openTour()
    expect(useTourStore.getState().isOpen).toBe(true)
    expect(useTourStore.getState().hasSeenTour).toBe(false)
  })

  it('should close the tour and mark it as seen on closeTour()', () => {
    useTourStore.getState().openTour()
    useTourStore.getState().closeTour()
    expect(useTourStore.getState().isOpen).toBe(false)
    expect(useTourStore.getState().hasSeenTour).toBe(true)
  })
})
