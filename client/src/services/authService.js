import { api } from './api'

// Endpoints: server/src/routes/auth.routes.js
// Login/register 401s mean "wrong credentials", not "expired token", so they skip
// the automatic refresh-and-retry in api.js.
const noRefresh = { skipAuthRefresh: true }

export const authService = {
  register: (data) => api.post('/auth/register', data, noRefresh).then((res) => res.data),
  login: (credentials) => api.post('/auth/login', credentials, noRefresh).then((res) => res.data),
  logout: () => api.post('/auth/logout', null, noRefresh).then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }, noRefresh).then((res) => res.data),
  resetPassword: (data) => api.post('/auth/reset-password', data, noRefresh).then((res) => res.data),
}
