import { cn } from '@/lib/utils'

// Two-pane chat shell: sidebar (conversation list) + main panel (active chat).
// The page decides which pane is visible on small screens via the class props.
export default function ChatLayout({ sidebar, children, mainClassName }) {
  return (
    <div className="flex h-full min-h-0 w-full">
      {sidebar}
      <main className={cn('flex min-w-0 flex-1 flex-col', mainClassName)}>{children}</main>
    </div>
  )
}
