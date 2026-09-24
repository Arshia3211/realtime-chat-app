import { LogOut, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useSocketStore } from '@/stores/socketStore'

const navLinks = [
  { to: '/chat', label: 'Chat' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const isConnected = useSocketStore((state) => state.isConnected)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // ProtectedLayout redirects to /login once auth state is cleared.
  const handleLogout = async () => {
    setIsSigningOut(true)
    await logout()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4">
      <Link to="/chat" className="flex items-center gap-2 font-semibold">
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Realtime Chat</span>
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('text-muted-foreground hover:text-foreground', isActive && 'font-medium text-foreground')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <span
          className={cn('size-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-muted-foreground/40')}
          title={isConnected ? 'Connected' : 'Disconnected'}
          aria-label={isConnected ? 'Connected' : 'Disconnected'}
        />
        <span className="hidden max-w-40 truncate text-sm md:inline">{user?.displayName}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isSigningOut}>
          <LogOut aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
