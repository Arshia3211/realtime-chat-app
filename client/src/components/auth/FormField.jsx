import { cloneElement, useId } from 'react'
import { Label } from '@/components/ui/label'

// Label + input + validation message, wired together for screen readers.
// `children` is a single input element; `error` is a react-hook-form field error.
export default function FormField({ label, error, hint, children }) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error?.message ?? hint

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p id={messageId} className={error ? 'text-sm text-destructive' : 'text-xs text-muted-foreground'}>
          {message}
        </p>
      )}
    </div>
  )
}
