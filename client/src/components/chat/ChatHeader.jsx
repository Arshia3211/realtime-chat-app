import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileDialog from '@/components/profile/ProfileDialog'
import UserAvatar from '@/components/profile/UserAvatar'
import { getConversationAvatar, getConversationTitle, getPeer } from '@/utils/conversation'

// Active conversation: back link (mobile), avatar and name. Clicking the name
// of a one-to-one chat opens the other person's profile. Presence arrives in Phase 8.
export default function ChatHeader({ conversation, currentUserId }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const peer = conversation.type === 'DIRECT' ? getPeer(conversation, currentUserId) : null
  const title = getConversationTitle(conversation, currentUserId)

  const identity = (
    <>
      <UserAvatar user={getConversationAvatar(conversation, currentUserId)} size="md" />
      <span className="min-w-0 text-left">
        <span className="block truncate font-semibold">{title}</span>
        {peer && <span className="block truncate text-xs text-muted-foreground">@{peer.username}</span>}
      </span>
    </>
  )

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
      <Link
        to="/chat"
        className="grid size-9 place-items-center rounded-md hover:bg-accent md:hidden"
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>

      {peer ? (
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="flex min-w-0 items-center gap-3 rounded-md p-1 hover:bg-accent"
          aria-label={`View ${title}'s profile`}
        >
          {identity}
        </button>
      ) : (
        <div className="flex min-w-0 items-center gap-3 p-1">{identity}</div>
      )}

      {peer && <ProfileDialog userId={peer.id} open={isProfileOpen} onOpenChange={setIsProfileOpen} />}
    </header>
  )
}
