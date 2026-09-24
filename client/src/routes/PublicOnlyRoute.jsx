import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Auth pages (login, register, …) are only for guests; signed-in users go to /chat.
export default function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/chat" replace /> : <Outlet />
}
