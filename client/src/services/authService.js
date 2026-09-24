import { api } from './api'

// Endpoints: server/src/routes/auth.routes.js (Phase 3)
export const authService = {
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  refresh: () => api.post('/auth/refresh').then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then((res) => res.data),
}
