import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'

export default function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to Realtime Chat"
      footer={
        <>
          No account? <Link to="/register" className="text-foreground underline">Create one</Link>
          <span className="mx-2">·</span>
          <Link to="/forgot-password" className="text-foreground underline">Forgot password?</Link>
        </>
      }
    >
      {/* Phase 3: React Hook Form + Zod login form */}
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Form coming in Phase 3.
        </p>
    </AuthLayout>
  )
}
