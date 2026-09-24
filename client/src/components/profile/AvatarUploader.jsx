import { Camera, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FormAlert from '@/components/auth/FormAlert'
import { Button } from '@/components/ui/button'
import { AVATAR_ACCEPT, validateAvatarFile } from '@/lib/validations/profile'
import { getErrorMessage } from '@/services/api'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import UserAvatar from './UserAvatar'

export default function AvatarUploader() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [progress, setProgress] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState(null)

  const isBusy = progress !== null || isRemoving

  // Release the local preview's memory when it's replaced or the component unmounts.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow picking the same file again
    if (!file) return

    const validationError = validateAvatarFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    setProgress(0)
    try {
      const { data } = await userService.uploadAvatar(file, setProgress)
      updateUser(data.user)
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'))
    } finally {
      setPreviewUrl(null)
      setProgress(null)
    }
  }

  const handleRemove = async () => {
    setError(null)
    setIsRemoving(true)
    try {
      const { data } = await userService.removeAvatar()
      updateUser(data.user)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not remove photo'))
    } finally {
      setIsRemoving(false)
    }
  }

  const displayedUser = previewUrl ? { ...user, avatarUrl: previewUrl } : user

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <UserAvatar user={displayedUser} size="xl" className={progress !== null ? 'opacity-60' : undefined} />
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => inputRef.current?.click()}>
              <Camera aria-hidden="true" />
              {progress !== null ? `Uploading… ${progress}%` : user?.avatarUrl ? 'Change photo' : 'Upload photo'}
            </Button>
            {user?.avatarUrl && (
              <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={handleRemove}>
                <Trash2 aria-hidden="true" />
                {isRemoving ? 'Removing…' : 'Remove'}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF, up to 5 MB.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose profile photo"
        onChange={handleFileChange}
      />
      <FormAlert message={error} />
    </div>
  )
}
