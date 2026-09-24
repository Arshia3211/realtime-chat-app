import { cn } from '@/lib/utils'

// One row in the sidebar: avatar, name, last message, unread badge.
// Placeholder structure — full implementation in Phase 5.
export default function ConversationItem({ conversation, isActive = false, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(conversation.id)}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sidebar-accent',
        isActive && 'bg-sidebar-accent',
      )}
    >
      <span className="truncate font-medium">{conversation.name}</span>
    </button>
  )
}
