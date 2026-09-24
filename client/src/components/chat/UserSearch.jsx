import { LoaderCircle, MessageCircle, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileDialog from '@/components/profile/ProfileDialog'
import UserAvatar from '@/components/profile/UserAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { getErrorMessage } from '@/services/api'
import { chatService } from '@/services/chatService'
import { userService } from '@/services/userService'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'

// Find people by name or username, view their profile and start a conversation.
export default function UserSearch() {
  const [query, setQuery] = useState('')
  // Latest completed search; loading state is derived by comparing queries.
  const [response, setResponse] = useState({ query: '', users: [], error: null })
  const [selectedUserId, setSelectedUserId] = useState(null)
  const cacheUsers = useUserStore((state) => state.cacheUsers)

  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState(null)
  const navigate = useNavigate()

  // Opens the existing one-to-one chat with this person, or creates it.
  const startConversation = async (userId) => {
    setIsStarting(true)
    setStartError(null)
    try {
      const { data } = await chatService.openDirect(userId)
      useChatStore.getState().upsertConversation(data.conversation)
      setSelectedUserId(null)
      setQuery('')
      navigate(`/chat/${data.conversation.id}`)
    } catch (err) {
      setStartError(getErrorMessage(err, 'Could not start the conversation'))
    } finally {
      setIsStarting(false)
    }
  }

  const trimmedQuery = query.trim()
  const debouncedQuery = useDebounce(trimmedQuery, 300)

  useEffect(() => {
    if (!debouncedQuery) return undefined

    // Abort the previous request so a slow response can't overwrite newer results.
    const controller = new AbortController()
    userService
      .search(debouncedQuery, { signal: controller.signal })
      .then(({ data }) => {
        cacheUsers(data.users)
        setResponse({ query: debouncedQuery, users: data.users, error: null })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setResponse({ query: debouncedQuery, users: [], error: getErrorMessage(err, 'Search failed') })
      })

    return () => controller.abort()
  }, [debouncedQuery, cacheUsers])

  const hasQuery = trimmedQuery.length > 0
  const isCurrent = hasQuery && response.query === trimmedQuery && trimmedQuery === debouncedQuery
  const isLoading = hasQuery && !isCurrent

  return (
    <div className="border-b">
      <div className="relative p-3">
        <Search
          className="pointer-events-none absolute top-1/2 left-5.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find people"
          aria-label="Find people by name or username"
          className="px-8 [&::-webkit-search-cancel-button]:hidden"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute top-1/2 right-5.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <X className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {isCurrent && (
        <div className="max-h-72 overflow-y-auto pb-2" aria-live="polite">
          {response.error && <p className="px-4 py-2 text-sm text-destructive">{response.error}</p>}
          {!response.error && response.users.length === 0 && (
            <p className="px-4 py-2 text-sm text-muted-foreground">No people found for “{response.query}”.</p>
          )}
          {response.users.length > 0 && (
            <ul aria-label="People">
              {response.users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-sidebar-accent"
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{user.displayName}</span>
                      <span className="block truncate text-xs text-muted-foreground">@{user.username}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ProfileDialog
        userId={selectedUserId}
        open={selectedUserId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserId(null)
            setStartError(null)
          }
        }}
      >
        <div className="grid w-full gap-2 pt-2">
          <Button onClick={() => startConversation(selectedUserId)} disabled={isStarting}>
            <MessageCircle aria-hidden="true" />
            {isStarting ? 'Opening…' : 'Message'}
          </Button>
          {startError && <p className="text-sm text-destructive">{startError}</p>}
        </div>
      </ProfileDialog>
    </div>
  )
}
