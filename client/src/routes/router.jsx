import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import Chat from '@/pages/Chat'
import ForgotPassword from '@/pages/ForgotPassword'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import Register from '@/pages/Register'
import ResetPassword from '@/pages/ResetPassword'
import Settings from '@/pages/Settings'
import PublicOnlyRoute from './PublicOnlyRoute'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/chat" replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password/:token', element: <ResetPassword /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/chat', element: <Chat /> },
      { path: '/chat/:conversationId', element: <Chat /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
