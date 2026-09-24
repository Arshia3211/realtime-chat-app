import { Navigate, Outlet, useLocation } from 'react-router-dom'
import FullPageLoader from '@/components/layout/FullPageLoader'
import { useAuthStore } from '@/stores/authStore'

// Auth pages (login, register, …) are only for guests. Signed-in users are sent
// to the page they originally requested (set by ProtectedLayout), or /chat.
export default function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth)
  const location = useLocation()

  if (isCheckingAuth) return <FullPageLoader />

  if (isAuthenticated) {
    const from = location.state?.from
    const target = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : '/chat'
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
