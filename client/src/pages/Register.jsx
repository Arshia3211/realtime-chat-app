import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import FormAlert from '@/components/auth/FormAlert'
import FormField from '@/components/auth/FormField'
import PasswordInput from '@/components/auth/PasswordInput'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema } from '@/lib/validations/auth'
import { applyServerErrors } from '@/utils/formErrors'

export default function Register() {
  const { register: registerAccount } = useAuth()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', username: '', email: '', password: '', confirmPassword: '' },
  })

  // Signed in immediately on success; PublicOnlyRoute then redirects to /chat.
  const onSubmit = async ({ confirmPassword, ...values }) => {
    setFormError(null)
    try {
      await registerAccount(values)
    } catch (error) {
      setFormError(applyServerErrors(error, setError))
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Start chatting in real time"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormAlert message={formError} />

        <FormField label="Display name" error={errors.displayName}>
          <Input autoComplete="name" autoFocus {...register('displayName')} />
        </FormField>

        <FormField label="Username" error={errors.username} hint="Letters, numbers and underscores">
          <Input autoComplete="username" autoCapitalize="none" spellCheck={false} {...register('username')} />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </FormField>

        <FormField label="Password" error={errors.password} hint="At least 8 characters, with a letter and a number">
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
