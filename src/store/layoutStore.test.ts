import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLayoutStore } from './layoutStore'

describe('useLayoutStore (Zustand Mobile/Desktop Layout Engine)', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test runs
    useLayoutStore.setState({
      isMobileSidebarOpen: false,
      isDesktopSidebarCollapsed: false,
    })
    
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('should initialize with correct default properties', () => {
    const state = useLayoutStore.getState()
    expect(state.isMobileSidebarOpen).toBe(false)
    expect(state.isDesktopSidebarCollapsed).toBe(false)
  })

  it('should explicitly set isMobileSidebarOpen state', () => {
    useLayoutStore.getState().setMobileSidebarOpen(true)
    expect(useLayoutStore.getState().isMobileSidebarOpen).toBe(true)

    useLayoutStore.getState().setMobileSidebarOpen(false)
    expect(useLayoutStore.getState().isMobileSidebarOpen).toBe(false)
  })

  it('should toggle isMobileSidebarOpen state on trigger', () => {
    useLayoutStore.getState().toggleMobileSidebar()
    expect(useLayoutStore.getState().isMobileSidebarOpen).toBe(true)

    useLayoutStore.getState().toggleMobileSidebar()
    expect(useLayoutStore.getState().isMobileSidebarOpen).toBe(false)
  })

  it('should toggle isDesktopSidebarCollapsed state on trigger', () => {
    useLayoutStore.getState().toggleDesktopSidebarCollapsed()
    expect(useLayoutStore.getState().isDesktopSidebarCollapsed).toBe(true)

    useLayoutStore.getState().toggleDesktopSidebarCollapsed()
    expect(useLayoutStore.getState().isDesktopSidebarCollapsed).toBe(false)
  })
})
