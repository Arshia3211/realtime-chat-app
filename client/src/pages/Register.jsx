import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'

export default function Register() {
  return (
    <AuthLayout
      title="Create an account"
      description="Start chatting in real time"
      footer={
        <>
          Already have an account? <Link to="/login" className="text-foreground underline">Sign in</Link>
        </>
      }
    >
      {/* Phase 3: React Hook Form + Zod registration form */}
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Form coming in Phase 3.
        </p>
    </AuthLayout>
  )
}
