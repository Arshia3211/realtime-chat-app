import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'

export default function ResetPassword() {
  // Phase 3: read the token with useParams() and submit the new password.
  return (
    <AuthLayout
      title="Reset password"
      description="Choose a new password for your account"
      footer={<Link to="/login" className="text-foreground underline">Back to sign in</Link>}
    >
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Form coming in Phase 3.
        </p>
    </AuthLayout>
  )
}
