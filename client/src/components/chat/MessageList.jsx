// Scrollable, paginated list of messages for the active conversation.
// Placeholder structure — full implementation in Phase 6.
export default function MessageList({ children }) {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">{children}</div>
  )
}
