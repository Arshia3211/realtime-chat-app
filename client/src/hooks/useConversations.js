import { useCallback, useEffect } from 'react'
import { getErrorMessage } from '@/services/api'
import { chatService } from '@/services/chatService'
import { useChatStore } from '@/stores/chatStore'

// Loads the signed-in user's conversations into chatStore once per session.
// Phase 7 keeps the list live over Socket.IO; until then `reload` refetches it.
export function useConversations() {
  const conversations = useChatStore((state) => state.conversations)
  const status = useChatStore((state) => state.conversationsStatus)
  const error = useChatStore((state) => state.conversationsError)

  const reload = useCallback(async () => {
    const { setConversationsLoading, setConversations, setConversationsError } = useChatStore.getState()
    setConversationsLoading()
    try {
      const { data } = await chatService.getConversations()
      setConversations(data.conversations)
    } catch (err) {
      setConversationsError(getErrorMessage(err, 'Could not load conversations'))
    }
  }, [])

  useEffect(() => {
    if (useChatStore.getState().conversationsStatus === 'idle') reload()
  }, [reload])

  return { conversations, status, error, reload }
}
