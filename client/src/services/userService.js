import { api } from './api'

// Endpoints: server/src/routes/user.routes.js (Phase 4)
export const userService = {
  search: (query) => api.get('/users/search', { params: { q: query } }).then((res) => res.data),
  getById: (userId) => api.get(`/users/${userId}`).then((res) => res.data),
  updateProfile: (data) => api.patch('/users/me', data).then((res) => res.data),
  changePassword: (data) => api.patch('/users/me/password', data).then((res) => res.data),
}
