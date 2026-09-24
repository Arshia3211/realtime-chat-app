import { MessageCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ChatLayout from '@/components/chat/ChatLayout'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ConversationList from '@/components/chat/ConversationList'
import ConversationView from '@/components/chat/ConversationView'

export default function Chat() {
  const { conversationId } = useParams()
  const hasOpenConversation = Boolean(conversationId)

  // On small screens only one pane is shown: the list, or the open conversation.
  return (
    <ChatLayout
      sidebar={
        <ChatSidebar className={hasOpenConversation ? 'hidden md:flex' : 'flex'}>
          <ConversationList />
        </ChatSidebar>
      }
      mainClassName={hasOpenConversation ? 'flex' : 'hidden md:flex'}
    >
      {hasOpenConversation ? (
        <ConversationView key={conversationId} conversationId={conversationId} />
      ) : (
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MessageCircle className="size-10" aria-hidden="true" />
            <p className="text-sm">Select a conversation to start chatting.</p>
          </div>
        </div>
      )}
    </ChatLayout>
  )
}
