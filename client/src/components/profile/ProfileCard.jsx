import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import UserAvatar from './UserAvatar'

// Avatar, name, username, bio and join date. `children` renders below (e.g. actions).
export default function ProfileCard({ user, children }) {
  if (!user) return null

  return (
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <UserAvatar user={user} size="xl" />
      <div className="min-w-0 max-w-full">
        <p className="truncate text-lg font-semibold">{user.displayName}</p>
        <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
      </div>
      {user.bio && <p className="max-w-sm text-sm wrap-break-word whitespace-pre-line">{user.bio}</p>}
      {user.createdAt && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
        </p>
      )}
      {children}
    </div>
  )
}
