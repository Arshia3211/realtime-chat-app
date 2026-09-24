// Shows who is typing in the active conversation.
// Placeholder structure — full implementation in Phase 8.
export default function TypingIndicator({ names = [] }) {
  return names.length > 0 ? (
    <p className="px-4 pb-2 text-xs text-muted-foreground">
      {names.join(', ')} {names.length === 1 ? 'is' : 'are'} typing…
    </p>
  ) : null
}
