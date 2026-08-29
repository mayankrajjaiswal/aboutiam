import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LayoutState {
  isMobileSidebarOpen: boolean
  setMobileSidebarOpen: (isOpen: boolean) => void
  toggleMobileSidebar: () => void
  isDesktopSidebarCollapsed: boolean
  toggleDesktopSidebarCollapsed: () => void
  isZenMode: boolean
  setZenMode: (isZen: boolean) => void
  toggleZenMode: () => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      isDesktopSidebarCollapsed: false,
      toggleDesktopSidebarCollapsed: () => set((state) => ({ isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed })),
      isZenMode: false,
      setZenMode: (isZen) => set({ isZenMode: isZen }),
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
    }),
    {
      name: 'aboutiam-sidebar-collapsed',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({ isDesktopSidebarCollapsed: state.isDesktopSidebarCollapsed }),
    }
  )
)
