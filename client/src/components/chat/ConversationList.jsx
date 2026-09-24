import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConversations } from '@/hooks/useConversations'
import { useAuthStore } from '@/stores/authStore'
import ConversationItem from './ConversationItem'

const SKELETON_ROWS = 5

export default function ConversationList() {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const { conversations, status, error, reload } = useConversations()

  if (status === 'error') {
    return (
      <div className="grid gap-2 p-4 text-sm">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="justify-self-start" onClick={reload}>
          Try again
        </Button>
      </div>
    )
  }

  if (status !== 'ready' && conversations.length === 0) {
    return (
      <ul aria-label="Loading conversations" aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="flex items-center gap-3 px-4 py-3">
            <div className="size-10 animate-pulse rounded-full bg-muted" />
            <div className="grid flex-1 gap-2">
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <MessageSquarePlus className="size-8" aria-hidden="true" />
        <p className="font-medium text-foreground">No conversations yet</p>
        <p>Search for someone above and click Message to start chatting.</p>
      </div>
    )
  }

  return (
    <nav aria-label="Conversations">
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <ConversationItem conversation={conversation} currentUserId={currentUserId} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
