import { Check, CircleAlert, Clock3 } from 'lucide-react'
import UserAvatar from '@/components/profile/UserAvatar'
import { cn } from '@/lib/utils'
import { formatMessageTime } from '@/utils/formatDate'

const StatusIcon = ({ status }) => {
  if (status === 'sending') return <Clock3 className="size-3" aria-label="Sending" />
  if (status === 'failed') return <CircleAlert className="size-3" aria-label="Not sent" />
  // Delivered/read ticks arrive in Phase 9.
  return <Check className="size-3" aria-label="Sent" />
}

// Quoted message shown above a reply.
function ReplyQuote({ replyTo, isOwn }) {
  return (
    <div
      className={cn(
        'mb-1 rounded-md border-l-2 px-2 py-1 text-xs',
        isOwn ? 'border-primary-foreground/60 bg-primary-foreground/10' : 'border-primary/60 bg-background/60',
      )}
    >
      <p className="font-medium">{replyTo.sender?.displayName ?? 'Deleted account'}</p>
      <p className={cn('line-clamp-2 opacity-80', replyTo.deletedAt && 'italic')}>
        {replyTo.deletedAt ? 'Message deleted' : replyTo.content}
      </p>
    </div>
  )
}

// One message. Consecutive messages from the same sender are grouped: only the
// last one in a group shows the sender's avatar.
export default function MessageBubble({ message, isOwn, isFirstInGroup, isLastInGroup, onRetry, onDiscard }) {
  const isDeleted = Boolean(message.deletedAt)
  const isFailed = message.status === 'failed'

  return (
    <div
      className={cn(
        'flex items-end gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
        isOwn ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-3' : 'mt-0.5',
      )}
      data-message-id={message.id}
    >
      {!isOwn &&
        (isLastInGroup ? (
          <UserAvatar user={message.sender ?? { displayName: '?' }} size="sm" />
        ) : (
          <span className="w-8 shrink-0" aria-hidden="true" />
        ))}

      <div className={cn('flex max-w-[min(75%,36rem)] flex-col', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-3 py-1.5 text-sm shadow-xs',
            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
            // Tighter corners on the sender's side where grouped bubbles meet.
            isOwn && !isFirstInGroup && 'rounded-tr-md',
            isOwn && !isLastInGroup && 'rounded-br-md',
            !isOwn && !isFirstInGroup && 'rounded-tl-md',
            !isOwn && !isLastInGroup && 'rounded-bl-md',
            message.status === 'sending' && 'opacity-70',
            isFailed && 'ring-2 ring-destructive/60',
          )}
        >
          {message.replyTo && <ReplyQuote replyTo={message.replyTo} isOwn={isOwn} />}
          {isDeleted ? (
            <p className="italic opacity-70">Message deleted</p>
          ) : (
            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
          )}
          <span
            className={cn(
              'mt-0.5 flex items-center justify-end gap-1 text-[10px] leading-none',
              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground',
            )}
          >
            <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
            {isOwn && <StatusIcon status={message.status} />}
          </span>
        </div>

        {isFailed && (
          <p className="mt-1 flex items-center gap-2 text-xs text-destructive" role="alert">
            <span>{message.error ?? 'Not sent'}</span>
            <button type="button" onClick={() => onRetry?.(message.clientId)} className="font-medium underline-offset-2 hover:underline">
              Retry
            </button>
            <button type="button" onClick={() => onDiscard?.(message.clientId)} className="font-medium underline-offset-2 hover:underline">
              Delete
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
