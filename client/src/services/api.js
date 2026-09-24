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

// Phase 3: on 401, call /auth/refresh once, retry the original request,
// and clear auth if the refresh fails.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

// Extracts a human-readable message from an Axios error (server returns { message }).
export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ?? error?.message ?? fallback
