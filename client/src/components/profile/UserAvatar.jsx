import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-24 text-2xl',
}

// "Ada Lovelace" → "AL"; falls back to the first letter of the username.
const getInitials = (user) => {
  const words = (user?.displayName ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return (user?.username?.[0] ?? '?').toUpperCase()
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

// User photo with an initials fallback while loading or when there's no photo.
export default function UserAvatar({ user, size = 'md', className }) {
  return (
    <Avatar className={cn(SIZES[size], className)}>
      {user?.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={user.displayName ?? ''} className="object-cover" />
      )}
      <AvatarFallback className="font-medium">{getInitials(user)}</AvatarFallback>
    </Avatar>
  )
}
