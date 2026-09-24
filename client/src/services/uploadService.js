import { api } from './api'

// Endpoints: server/src/routes/upload.routes.js (Phase 11). Avatars use userService.
export const uploadService = {
  uploadAttachment: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post('/uploads/attachment', formData, {
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded * 100) / event.total))
        },
      })
      .then((res) => res.data)
  },
}
