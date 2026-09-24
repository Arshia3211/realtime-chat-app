import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormAlert from '@/components/auth/FormAlert'
import FormField from '@/components/auth/FormField'
import PasswordInput from '@/components/auth/PasswordInput'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { authService } from '@/services/authService'
import { applyServerErrors } from '@/utils/formErrors'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ password }) => {
    setFormError(null)
    try {
      const { message } = await authService.resetPassword({ token, password })
      navigate('/login', { replace: true, state: { notice: message } })
    } catch (error) {
      // A bad/expired token comes back as a `token` field error; show it as a form message.
      const tokenError = error?.response?.data?.details?.fieldErrors?.token?.[0]
      setFormError(tokenError ?? applyServerErrors(error, setError))
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      description="Choose a new password for your account"
      footer={
        <Link to="/forgot-password" className="font-medium text-foreground underline-offset-4 hover:underline">
          Request a new link
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormAlert message={formError} />

        <FormField label="New password" error={errors.password} hint="At least 8 characters, with a letter and a number">
          <PasswordInput autoComplete="new-password" autoFocus {...register('password')} />
        </FormField>

        <FormField label="Confirm new password" error={errors.confirmPassword}>
          <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
