import { useCallback, useEffect } from 'react'
import { refreshSession } from '@/services/api'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'

// Restores the session on page load using the refresh cookie. Mount once (App).
export function useAuthInit() {
  useEffect(() => {
    const { setCheckingAuth, clearAuth } = useAuthStore.getState()

    refreshSession()
      .catch(() => clearAuth()) // no/expired cookie: user is simply signed out
      .finally(() => setCheckingAuth(false))
  }, [])
}

// Sign-in / sign-up / sign-out actions for components.
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const login = useCallback(
    async (credentials) => {
      const { data } = await authService.login(credentials)
      setAuth(data)
      return data.user
    },
    [setAuth],
  )

  const register = useCallback(
    async (details) => {
      const { data } = await authService.register(details)
      setAuth(data)
      return data.user
    },
    [setAuth],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      // Clear local state even if the request fails (e.g. server offline).
      clearAuth()
      useChatStore.getState().reset()
    }
  }, [clearAuth])

  return { user, isAuthenticated, login, register, logout }
}
