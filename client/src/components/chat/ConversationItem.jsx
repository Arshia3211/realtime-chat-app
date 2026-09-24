import { NavLink } from 'react-router-dom'
import UserAvatar from '@/components/profile/UserAvatar'
import { cn } from '@/lib/utils'
import { getConversationAvatar, getConversationTitle, getLastMessagePreview } from '@/utils/conversation'
import { formatConversationTime } from '@/utils/formatDate'

// One row in the sidebar: avatar, name, last message, time and unread badge.
export default function ConversationItem({ conversation, currentUserId }) {
  const title = getConversationTitle(conversation, currentUserId)
  const preview = getLastMessagePreview(conversation, currentUserId)
  const timestamp = conversation.lastMessage?.createdAt ?? conversation.createdAt
  const hasUnread = conversation.unreadCount > 0

  return (
    <NavLink
      to={`/chat/${conversation.id}`}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:outline-none',
          isActive && 'bg-sidebar-accent',
        )
      }
      aria-label={hasUnread ? `${title}, ${conversation.unreadCount} unread` : title}
    >
      <UserAvatar user={getConversationAvatar(conversation, currentUserId)} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn('truncate text-sm', hasUnread ? 'font-semibold' : 'font-medium')}>{title}</span>
          <time dateTime={timestamp} className="shrink-0 text-xs text-muted-foreground">
            {formatConversationTime(timestamp)}
          </time>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', hasUnread ? 'text-foreground' : 'text-muted-foreground')}>
            {preview}
          </span>
          {hasUnread && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </NavLink>
  )
}
