import { cn } from '@/lib/utils'
import UserSearch from './UserSearch'

// People search on top, conversation list below.
export default function ChatSidebar({ children, className }) {
  return (
    <aside className={cn('flex h-full w-full flex-col border-r bg-sidebar md:w-80', className)}>
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      <UserSearch />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  )
}
