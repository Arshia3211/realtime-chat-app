import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import FormAlert from '@/components/auth/FormAlert'
import FormField from '@/components/auth/FormField'
import PasswordInput from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/button'
import { changePasswordSchema } from '@/lib/validations/profile'
import { userService } from '@/services/userService'
import { applyServerErrors } from '@/utils/formErrors'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

// Changing the password keeps this device signed in and signs out all others.
export default function ChangePasswordForm() {
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: EMPTY })

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setFormError(null)
    setSuccessMessage(null)
    try {
      const { message } = await userService.changePassword({ currentPassword, newPassword })
      reset(EMPTY)
      setSuccessMessage(message)
    } catch (error) {
      setFormError(applyServerErrors(error, setError))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormAlert message={formError} />
      <FormAlert message={successMessage} variant="success" />

      <FormField label="Current password" error={errors.currentPassword}>
        <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
      </FormField>

      <FormField label="New password" error={errors.newPassword} hint="At least 8 characters, with a letter and a number">
        <PasswordInput autoComplete="new-password" {...register('newPassword')} />
      </FormField>

      <FormField label="Confirm new password" error={errors.confirmPassword}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>

      <p className="text-xs text-muted-foreground">You'll stay signed in here. Other devices will be signed out.</p>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </div>
    </form>
  )
}
