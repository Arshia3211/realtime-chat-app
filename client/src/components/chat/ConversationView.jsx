import { LoaderCircle, MessageCircleOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import UserAvatar from '@/components/profile/UserAvatar'
import { useMessages } from '@/hooks/useMessages'
import { getErrorMessage } from '@/services/api'
import { chatService } from '@/services/chatService'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { getConversationAvatar, getConversationTitle } from '@/utils/conversation'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

// The open conversation. Uses the copy already in the list when possible and
// fetches it otherwise (e.g. a direct link or a conversation beyond the list).
export default function ConversationView({ conversationId }) {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const conversation = useChatStore((state) => state.conversations.find((c) => c.id === conversationId))
  const [loadError, setLoadError] = useState({ conversationId: null, message: null })
  const messages = useMessages(conversationId)

  useEffect(() => {
    useChatStore.getState().setActiveConversation(conversationId)
    return () => useChatStore.getState().setActiveConversation(null)
  }, [conversationId])

  // Fetch when not in the list.
  useEffect(() => {
    if (conversation) return undefined
    let cancelled = false
    chatService
      .getConversation(conversationId)
      .then(({ data }) => !cancelled && useChatStore.getState().upsertConversation(data.conversation))
      .catch((err) => {
        if (cancelled) return
        const message =
          err?.response?.status === 404 || err?.response?.status === 400
            ? 'This conversation does not exist or you are not a member of it.'
            : getErrorMessage(err, 'Could not load this conversation')
        setLoadError({ conversationId, message })
      })
    return () => {
      cancelled = true
    }
  }, [conversationId, conversation])

  // Opening a conversation clears its unread badge.
  const unreadCount = conversation?.unreadCount ?? 0
  useEffect(() => {
    if (unreadCount === 0) return
    useChatStore.getState().updateConversation(conversationId, { unreadCount: 0 })
    chatService.markAsRead(conversationId).catch(() => {
      // Not critical: the badge will reappear on the next reload if this failed.
    })
  }, [conversationId, unreadCount])

  const error = loadError.conversationId === conversationId ? loadError.message : null

  if (error) {
    return (
      <div className="grid flex-1 place-items-center p-8 text-center">
        <div className="flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
          <MessageCircleOff className="size-10" aria-hidden="true" />
          <p className="text-sm">{error}</p>
          <Link to="/chat" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
            Back to conversations
          </Link>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="grid flex-1 place-items-center" role="status" aria-label="Loading conversation">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  const title = getConversationTitle(conversation, currentUserId)

  return (
    <>
      <ChatHeader conversation={conversation} currentUserId={currentUserId} />
      <MessageList
        messages={messages.items}
        currentUserId={currentUserId}
        status={messages.status}
        error={messages.error}
        hasMore={messages.hasMore}
        isLoadingOlder={messages.isLoadingOlder}
        onLoadOlder={messages.loadOlder}
        onRetry={messages.retryMessage}
        onDiscard={messages.discardMessage}
        emptyState={
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-8 text-center">
            <UserAvatar user={getConversationAvatar(conversation, currentUserId)} size="lg" />
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">This is the beginning of your conversation.</p>
          </div>
        }
      />
      <MessageInput onSend={messages.sendMessage} placeholder={`Message ${title}`} />
    </>
  )
}
