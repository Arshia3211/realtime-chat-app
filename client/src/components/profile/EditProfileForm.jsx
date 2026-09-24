import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import FormAlert from '@/components/auth/FormAlert'
import FormField from '@/components/auth/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BIO_MAX_LENGTH, profileSchema } from '@/lib/validations/profile'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { applyServerErrors } from '@/utils/formErrors'

const toFormValues = (user) => ({
  displayName: user?.displayName ?? '',
  username: user?.username ?? '',
  bio: user?.bio ?? '',
})

export default function EditProfileForm() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  })

  const bioLength = useWatch({ control, name: 'bio' })?.length ?? 0

  // Only the fields the user actually changed are sent.
  const onSubmit = async (values) => {
    setFormError(null)
    setSuccessMessage(null)
    const changes = Object.fromEntries(Object.keys(dirtyFields).map((key) => [key, values[key]]))

    try {
      const { data } = await userService.updateProfile(changes)
      updateUser(data.user)
      reset(toFormValues(data.user)) // new baseline for "unsaved changes"
      setSuccessMessage('Profile updated')
    } catch (error) {
      setFormError(applyServerErrors(error, setError))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormAlert message={formError} />
      <FormAlert message={successMessage} variant="success" />

      <FormField label="Display name" error={errors.displayName}>
        <Input autoComplete="name" {...register('displayName')} />
      </FormField>

      <FormField label="Username" error={errors.username} hint="Letters, numbers and underscores">
        <Input autoComplete="username" autoCapitalize="none" spellCheck={false} {...register('username')} />
      </FormField>

      <FormField
        label="Bio"
        error={errors.bio}
        hint={`${bioLength}/${BIO_MAX_LENGTH} characters`}
      >
        <Textarea rows={4} maxLength={BIO_MAX_LENGTH} placeholder="Tell people a little about yourself" {...register('bio')} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
