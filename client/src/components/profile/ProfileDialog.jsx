import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import FormAlert from '@/components/auth/FormAlert'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/services/api'
import { userService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import ProfileCard from './ProfileCard'

// Shows another user's public profile. Renders the cached copy immediately and
// refreshes it from the server each time the dialog opens.
export default function ProfileDialog({ userId, open, onOpenChange, children }) {
  const cachedUser = useUserStore((state) => (userId ? state.usersById[userId] : null))
  const cacheUsers = useUserStore((state) => state.cacheUsers)
  // Outcome of the latest completed request; loading/error are derived from it.
  const [result, setResult] = useState({ userId: null, error: null })

  useEffect(() => {
    if (!open || !userId) return undefined
    let cancelled = false

    userService
      .getById(userId)
      .then(({ data }) => {
        if (cancelled) return
        cacheUsers([data.user])
        setResult({ userId, error: null })
      })
      .catch((err) => {
        if (!cancelled) setResult({ userId, error: getErrorMessage(err, 'Could not load this profile') })
      })

    return () => {
      cancelled = true
    }
  }, [open, userId, cacheUsers])

  const error = result.userId === userId ? result.error : null
  const isLoading = !cachedUser && result.userId !== userId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogTitle className="sr-only">{cachedUser ? `${cachedUser.displayName}'s profile` : 'Profile'}</DialogTitle>
        <DialogDescription className="sr-only">Public profile details</DialogDescription>

        {cachedUser && <ProfileCard user={cachedUser}>{children}</ProfileCard>}
        {isLoading && (
          <div className="grid h-48 place-items-center" role="status" aria-label="Loading profile">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        <FormAlert message={error} />
      </DialogContent>
    </Dialog>
  )
}
