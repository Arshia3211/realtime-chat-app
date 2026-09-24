import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import FormAlert from '@/components/auth/FormAlert'
import FormField from '@/components/auth/FormField'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { authService } from '@/services/authService'
import { applyServerErrors } from '@/utils/formErrors'

export default function ForgotPassword() {
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }) => {
    setFormError(null)
    try {
      const { message } = await authService.forgotPassword(email)
      setSuccessMessage(message)
    } catch (error) {
      setFormError(applyServerErrors(error, setError))
    }
  }

  return (
    <AuthLayout
      title="Forgot password"
      description="Enter your email and we'll send you a link to reset your password"
      footer={
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {successMessage ? (
        <FormAlert message={successMessage} variant="success" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <FormAlert message={formError} />

          <FormField label="Email" error={errors.email}>
            <Input type="email" autoComplete="email" autoFocus {...register('email')} />
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
