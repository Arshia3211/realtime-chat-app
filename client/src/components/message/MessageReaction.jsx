import { cn } from '@/lib/utils'

// Emoji reaction chip with count; toggles the current user reaction.
// Placeholder structure — full implementation in Phase 10.
export default function MessageReaction({ emoji, count, isActive = false, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
        isActive && 'border-primary bg-primary/10',
      )}
    >
      <span>{emoji}</span>
      <span>{count}</span>
    </button>
  )
}
