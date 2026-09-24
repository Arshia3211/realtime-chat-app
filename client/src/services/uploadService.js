import { api } from './api'

// Endpoints: server/src/routes/upload.routes.js (Phase 11)
const upload = (url, file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  return api
    .post(url, formData, {
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    .then((res) => res.data)
}

export const uploadService = {
  uploadAttachment: (file, onProgress) => upload('/uploads/attachment', file, onProgress),
  uploadAvatar: (file, onProgress) => upload('/uploads/avatar', file, onProgress),
}
