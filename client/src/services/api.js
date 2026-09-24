import axios from 'axios'
import { config } from '@/lib/config'
import { useAuthStore } from '@/stores/authStore'

// Single Axios instance used by every service module.
export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // send the httpOnly refresh-token cookie
  timeout: 15_000,
})

api.interceptors.request.use((request) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`
  }
  return request
})

let refreshPromise = null

// Exchanges the refresh cookie for a new access token. Concurrent callers share
// one request, so a burst of 401s (or React StrictMode) triggers a single refresh.
export const refreshSession = () => {
  refreshPromise ??= api
    .post('/auth/refresh', null, { skipAuthRefresh: true })
    .then((res) => {
      const { user, accessToken } = res.data.data
      useAuthStore.getState().setAuth({ user, accessToken })
      return accessToken
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// On 401, refresh once and replay the original request. If refreshing fails the
// session is over: auth state is cleared and ProtectedLayout redirects to /login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const shouldRefresh =
      error.response?.status === 401 && original && !original.skipAuthRefresh && !original._retried

    if (!shouldRefresh) return Promise.reject(error)

    original._retried = true
    try {
      const accessToken = await refreshSession()
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch {
      useAuthStore.getState().clearAuth()
      return Promise.reject(error)
    }
  },
)

// Extracts a human-readable message from an Axios error (server returns { message }).
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?'
  return error?.message ?? fallback
}
