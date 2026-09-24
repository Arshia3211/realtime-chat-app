import { MessageCircle } from 'lucide-react'
import ChatLayout from '@/components/chat/ChatLayout'
import ChatSidebar from '@/components/chat/ChatSidebar'

export default function Chat() {
  // Phase 5+: load conversations into chatStore and render the active conversation
  // (selected via the :conversationId route param).
  return (
    <ChatLayout
      sidebar={
        <ChatSidebar>
          <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
        </ChatSidebar>
      }
    >
      <div className="grid flex-1 place-items-center p-8 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MessageCircle className="size-10" aria-hidden="true" />
          <p className="text-sm">Select a conversation to start chatting.</p>
        </div>
      </div>
    </ChatLayout>
  )
}
