import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// UI preferences. Only `theme` is persisted to localStorage.
export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'system', // 'light' | 'dark' | 'system'
      isSidebarOpen: true,
      isProfileDialogOpen: false,

      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setProfileDialogOpen: (isProfileDialogOpen) => set({ isProfileDialogOpen }),
    }),
    {
      name: 'rtc-ui',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
