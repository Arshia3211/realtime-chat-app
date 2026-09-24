import { CircleAlert, CircleCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Form-level message (server error or success notice). Renders nothing without a message.
export default function FormAlert({ message, variant = 'error' }) {
  if (!message) return null
  const isError = variant === 'error'
  const Icon = isError ? CircleAlert : CircleCheck

  return (
    <Alert variant={isError ? 'destructive' : 'default'} role={isError ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
