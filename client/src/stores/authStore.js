import { create } from 'zustand'

// Authenticated user + access token. The refresh token will live in an
// httpOnly cookie set by the server (Phase 3), never in JS-accessible storage.
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // True until the initial session check (GET /auth/me) has finished (Phase 3).
  isCheckingAuth: false,

  setAuth: ({ user, accessToken }) => set({ user, accessToken, isAuthenticated: Boolean(user) }),
  setAccessToken: (accessToken) => set({ accessToken }),
  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  setCheckingAuth: (isCheckingAuth) => set({ isCheckingAuth }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}))
