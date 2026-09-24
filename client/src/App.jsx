import { RouterProvider } from 'react-router-dom'
import { useAuthInit } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { router } from '@/routes/router'

export default function App() {
  useTheme()
  useAuthInit()

  return <RouterProvider router={router} />
}
