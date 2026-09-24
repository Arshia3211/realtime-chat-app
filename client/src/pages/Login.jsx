import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import FormAlert from '@/components/auth/FormAlert'
import FormField from '@/components/auth/FormField'
import PasswordInput from '@/components/auth/PasswordInput'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/lib/validations/auth'
import { applyServerErrors } from '@/utils/formErrors'

export default function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const [formError, setFormError] = useState(null)
  // Set by ResetPassword after a successful reset.
  const notice = location.state?.notice

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  // On success PublicOnlyRoute redirects to the page the user originally wanted.
  const onSubmit = async (values) => {
    setFormError(null)
    try {
      await login(values)
    } catch (error) {
      setFormError(applyServerErrors(error, setError))
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to Realtime Chat"
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormAlert message={notice} variant="success" />
        <FormAlert message={formError} />

        <FormField label="Email or username" error={errors.identifier}>
          <Input autoComplete="username" autoFocus {...register('identifier')} />
        </FormField>

        <div className="grid gap-2">
          <FormField label="Password" error={errors.password}>
            <PasswordInput autoComplete="current-password" {...register('password')} />
          </FormField>
          <Link
            to="/forgot-password"
            className="justify-self-end text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
