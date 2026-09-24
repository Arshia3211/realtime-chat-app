import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSocketConnection } from '@/hooks/useSocket'
import { useAuthStore } from '@/stores/authStore'
import FullPageLoader from './FullPageLoader'
import Navbar from './Navbar'

// Wraps every authenticated page: redirects guests to /login (remembering where
// they were going), renders the navbar and owns the Socket.IO connection.
export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth)
  const location = useLocation()

  useSocketConnection()

  if (isCheckingAuth) return <FullPageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <div className="flex h-dvh flex-col">
      <Navbar />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
