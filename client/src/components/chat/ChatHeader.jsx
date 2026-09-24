// Active conversation title, avatar, presence and actions.
// Placeholder structure — full implementation in Phase 5.
export default function ChatHeader({ title }) {
  return (
    <header className="flex h-16 items-center border-b px-4">
      <h2 className="truncate font-semibold">{title}</h2>
    </header>
  )
}
