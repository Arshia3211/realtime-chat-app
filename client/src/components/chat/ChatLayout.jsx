// Two-pane chat shell: sidebar (conversation list) + main panel (active chat).
// Responsive behaviour (single pane on mobile) is refined in Phase 16.
export default function ChatLayout({ sidebar, children }) {
  return (
    <div className="flex h-full min-h-0 w-full">
      {sidebar}
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
