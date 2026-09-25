import { LoaderCircle } from 'lucide-react'
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { formatDayLabel, isDifferentDay, minutesBetween } from '@/utils/formatDate'
import MessageBubble from './MessageBubble'

// Messages further apart than this start a new visual group.
const GROUP_WINDOW_MINUTES = 5
// "Near the bottom": new messages from others only auto-scroll within this distance.
const STICK_TO_BOTTOM_PX = 150

const startsGroup = (message, previous) =>
  !previous ||
  previous.senderId !== message.senderId ||
  isDifferentDay(previous.createdAt, message.createdAt) ||
  minutesBetween(previous.createdAt, message.createdAt) > GROUP_WINDOW_MINUTES

function DaySeparator({ date }) {
  return (
    <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      <time dateTime={date}>{formatDayLabel(date)}</time>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

// Scrollable message history. Starts at the newest message, loads older pages when
// scrolled to the top (keeping the view steady), and follows new messages when the
// user is already near the bottom or sent the message themselves.
export default function MessageList({
  messages,
  currentUserId,
  status,
  error,
  hasMore,
  isLoadingOlder,
  onLoadOlder,
  onRetry,
  onDiscard,
  emptyState,
}) {
  const containerRef = useRef(null)
  const topSentinelRef = useRef(null)
  const snapshot = useRef({ firstId: null, lastId: null, scrollHeight: 0 })
  const isNearBottom = useRef(true)

  const rows = useMemo(
    () =>
      messages.map((message, index) => {
        const previous = messages[index - 1]
        const next = messages[index + 1]
        return {
          message,
          showDay: !previous || isDifferentDay(previous.createdAt, message.createdAt),
          isFirstInGroup: startsGroup(message, previous),
          isLastInGroup: !next || startsGroup(next, message),
        }
      }),
    [messages],
  )

  // Runs after the DOM updates but before paint, so position fixes don't flicker.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const firstId = messages[0]?.id ?? null
    const lastId = messages.at(-1)?.id ?? null
    const previous = snapshot.current

    if (!previous.lastId && lastId) {
      el.scrollTop = el.scrollHeight // first render with messages: jump to the newest
    } else if (firstId !== previous.firstId && lastId === previous.lastId) {
      el.scrollTop += el.scrollHeight - previous.scrollHeight // older page prepended: stay put
    } else if (lastId !== previous.lastId) {
      const last = messages.at(-1)
      if (last?.senderId === currentUserId || isNearBottom.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }
    }

    snapshot.current = { firstId, lastId, scrollHeight: el.scrollHeight }
  }, [messages, currentUserId])

  // Keep the newest message in view when the list is resized (e.g. the on-screen
  // keyboard opens on a phone, or the composer grows) and the user was at the bottom.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const observer = new ResizeObserver(() => {
      if (isNearBottom.current) el.scrollTop = el.scrollHeight
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [status])

  // Load older messages when the top of the list scrolls into view.
  useEffect(() => {
    const sentinel = topSentinelRef.current
    if (!sentinel || !hasMore) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onLoadOlder?.(),
      { root: containerRef.current, rootMargin: '200px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, onLoadOlder, messages.length])

  const handleScroll = (event) => {
    const el = event.currentTarget
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX
  }

  if (status === 'loading' || (status === 'idle' && messages.length === 0)) {
    return (
      <div className="grid flex-1 place-items-center" role="status" aria-label="Loading messages">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  if (status === 'error' && messages.length === 0) {
    return (
      <div className="grid flex-1 place-items-center p-6 text-center text-sm">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-6"
      role="log"
      aria-label="Messages"
      aria-live="polite"
    >
      <div ref={topSentinelRef} aria-hidden="true" />

      {hasMore ? (
        <div className="flex justify-center py-2">
          {isLoadingOlder ? (
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-label="Loading older messages" />
          ) : (
            <Button variant="ghost" size="sm" onClick={onLoadOlder}>
              Load older messages
            </Button>
          )}
        </div>
      ) : (
        emptyState
      )}

      {error && messages.length > 0 && <p className="py-2 text-center text-xs text-destructive">{error}</p>}

      {rows.map(({ message, showDay, isFirstInGroup, isLastInGroup }) => (
        <Fragment key={message.id}>
          {showDay && <DaySeparator date={message.createdAt} />}
          <MessageBubble
            message={message}
            isOwn={message.senderId === currentUserId}
            isFirstInGroup={isFirstInGroup || showDay}
            isLastInGroup={isLastInGroup}
            onRetry={onRetry}
            onDiscard={onDiscard}
          />
        </Fragment>
      ))}
    </div>
  )
}
