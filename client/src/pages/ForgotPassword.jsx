import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot password"
      description="We will email you a link to reset your password"
      footer={<Link to="/login" className="text-foreground underline">Back to sign in</Link>}
    >
      {/* Phase 3: email form -> POST /auth/forgot-password */}
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Form coming in Phase 3.
        </p>
    </AuthLayout>
  )
}
