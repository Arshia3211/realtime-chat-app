import { MessageCircle } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSocketStore } from '@/stores/socketStore'

const navLinks = [
  { to: '/chat', label: 'Chat' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

export default function Navbar() {
  const isConnected = useSocketStore((state) => state.isConnected)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <Link to="/chat" className="flex items-center gap-2 font-semibold">
        <MessageCircle className="size-5" aria-hidden="true" />
        Realtime Chat
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('text-muted-foreground hover:text-foreground', isActive && 'text-foreground font-medium')
            }
          >
            {label}
          </NavLink>
        ))}
        <span
          className={cn('size-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-muted-foreground/40')}
          title={isConnected ? 'Connected' : 'Disconnected'}
          aria-label={isConnected ? 'Connected' : 'Disconnected'}
        />
      </nav>
    </header>
  )
}
