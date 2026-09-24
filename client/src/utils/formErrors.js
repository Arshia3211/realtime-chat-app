import { getErrorMessage } from '@/services/api'

// Copies server-side field errors ({ details: { fieldErrors } }) onto a
// react-hook-form form. Returns a form-level message for anything left over.
export const applyServerErrors = (error, setError) => {
  const fieldErrors = error?.response?.data?.details?.fieldErrors ?? {}
  const fields = Object.entries(fieldErrors).filter(([, messages]) => messages?.length)

  fields.forEach(([field, messages], index) => {
    setError(field, { type: 'server', message: messages[0] }, { shouldFocus: index === 0 })
  })

  // Field errors already explain the problem; otherwise show the general message.
  return fields.length > 0 ? null : getErrorMessage(error)
}
