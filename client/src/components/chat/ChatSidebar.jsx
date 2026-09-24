// Conversation list with search and "new chat" actions.
// Placeholder structure — full implementation in Phase 5.
export default function ChatSidebar({ children }) {
  return (
    <aside className="flex h-full w-full flex-col border-r bg-sidebar md:w-80">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  )
}
