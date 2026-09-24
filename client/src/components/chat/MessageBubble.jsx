import { cn } from '@/lib/utils'

// Single message: content, timestamp, status, reactions, reply preview.
// Placeholder structure — full implementation in Phase 6.
export default function MessageBubble({ message, isOwn = false }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message?.content}
      </div>
    </div>
  )
}
