import { api } from './api'

// Endpoints: server/src/routes/user.routes.js
export const userService = {
  search: (query, { limit, signal } = {}) =>
    api.get('/users/search', { params: { q: query, limit }, signal }).then((res) => res.data),
  getById: (userId) => api.get(`/users/${userId}`).then((res) => res.data),
  updateProfile: (data) => api.patch('/users/me', data).then((res) => res.data),
  changePassword: (data) => api.patch('/users/me/password', data).then((res) => res.data),

  uploadAvatar: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .put('/users/me/avatar', formData, {
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded * 100) / event.total))
        },
      })
      .then((res) => res.data)
  },
  removeAvatar: () => api.delete('/users/me/avatar').then((res) => res.data),
}
