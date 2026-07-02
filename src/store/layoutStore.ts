import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LayoutState {
  isMobileSidebarOpen: boolean
  setMobileSidebarOpen: (isOpen: boolean) => void
  toggleMobileSidebar: () => void
  isDesktopSidebarCollapsed: boolean
  toggleDesktopSidebarCollapsed: () => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      isDesktopSidebarCollapsed: false,
      toggleDesktopSidebarCollapsed: () => set((state) => ({ isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed })),
    }),
    {
      name: 'aboutiam-sidebar-collapsed',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({ isDesktopSidebarCollapsed: state.isDesktopSidebarCollapsed }),
    }
  )
)
