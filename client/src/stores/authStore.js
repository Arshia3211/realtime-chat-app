import { create } from 'zustand'

// Authenticated user + access token (memory only). The refresh token lives in an
// httpOnly cookie set by the server and is never readable from JavaScript.
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // True until the initial session restore (hooks/useAuth.js) has finished.
  isCheckingAuth: true,

  setAuth: ({ user, accessToken }) => set({ user, accessToken, isAuthenticated: Boolean(user) }),
  setAccessToken: (accessToken) => set({ accessToken }),
  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  setCheckingAuth: (isCheckingAuth) => set({ isCheckingAuth }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}))
