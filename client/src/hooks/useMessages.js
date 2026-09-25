import { useCallback, useEffect } from 'react'
import { getErrorMessage } from '@/services/api'
import { messageService } from '@/services/messageService'
import { useAuthStore } from '@/stores/authStore'
import { EMPTY_MESSAGES, useChatStore } from '@/stores/chatStore'

const PAGE_SIZE = 30

const store = () => useChatStore.getState()

// Message history, older-page loading and optimistic sending for one conversation.
export function useMessages(conversationId) {
  const state = useChatStore((s) => s.messagesByConversation[conversationId] ?? EMPTY_MESSAGES)

  // Load the newest page on open. If history is cached it's merged in, which also
  // picks up messages that arrived meanwhile (Phase 7 pushes them live instead).
  useEffect(() => {
    let cancelled = false
    store().setMessagesLoading(conversationId)
    messageService
      .getMessages(conversationId, { limit: PAGE_SIZE })
      .then(({ data }) => !cancelled && store().receiveMessagesPage(conversationId, data))
      .catch((err) => !cancelled && store().setMessagesError(conversationId, getErrorMessage(err, 'Could not load messages')))
    return () => {
      cancelled = true
    }
  }, [conversationId])

  const loadOlder = useCallback(async () => {
    const current = store().messagesByConversation[conversationId]
    if (!current?.hasMore || current.isLoadingOlder || !current.nextCursor) return

    store().setLoadingOlder(conversationId, true)
    try {
      const { data } = await messageService.getMessages(conversationId, { before: current.nextCursor, limit: PAGE_SIZE })
      store().receiveMessagesPage(conversationId, data, { older: true })
    } catch (err) {
      store().setMessagesError(conversationId, getErrorMessage(err, 'Could not load older messages'))
    }
  }, [conversationId])

  // Posts an optimistic message; it's replaced by the server copy on success or
  // marked `failed` (with retry) on error.
  const deliver = useCallback(
    async (pending) => {
      store().updateMessage(conversationId, pending.id, { status: 'sending', error: null })
      try {
        const { data } = await messageService.sendMessage(conversationId, {
          content: pending.content,
          replyToId: pending.replyToId ?? undefined,
        })
        store().confirmMessage(conversationId, pending.clientId, data.message)
        store().updateConversation(conversationId, {
          lastMessage: data.message,
          lastMessageAt: data.message.createdAt,
          unreadCount: 0,
        })
      } catch (err) {
        store().updateMessage(conversationId, pending.id, {
          status: 'failed',
          error: getErrorMessage(err, 'Not sent'),
        })
      }
    },
    [conversationId],
  )

  const sendMessage = useCallback(
    (content, { replyTo } = {}) => {
      const user = useAuthStore.getState().user
      const clientId = `local-${crypto.randomUUID()}`
      const pending = {
        id: clientId,
        clientId,
        status: 'sending',
        conversationId,
        type: 'TEXT',
        content,
        senderId: user.id,
        sender: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
        replyToId: replyTo?.id ?? null,
        replyTo: replyTo ?? null,
        editedAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
      }
      store().addMessage(conversationId, pending)
      deliver(pending)
    },
    [conversationId, deliver],
  )

  const retryMessage = useCallback(
    (clientId) => {
      const pending = store().messagesByConversation[conversationId]?.items.find((m) => m.clientId === clientId)
      if (pending) deliver(pending)
    },
    [conversationId, deliver],
  )

  const discardMessage = useCallback(
    (clientId) => store().removeMessage(conversationId, clientId),
    [conversationId],
  )

  return { ...state, loadOlder, sendMessage, retryMessage, discardMessage }
}
