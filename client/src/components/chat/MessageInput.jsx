import { SendHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MESSAGE_COUNTER_THRESHOLD, MESSAGE_MAX_LENGTH } from '@/lib/validations/message'
import { cn } from '@/lib/utils'

// Message composer. Enter sends, Shift+Enter adds a new line. The box grows with
// its content up to a limit. Attachments (Phase 11) and replies (Phase 10) plug in here.
export default function MessageInput({ onSend, disabled = false, placeholder = 'Write a message…' }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const trimmed = value.trim()
  const remaining = MESSAGE_MAX_LENGTH - value.length
  const isTooLong = remaining < 0
  const canSend = !disabled && trimmed.length > 0 && !isTooLong

  const submit = () => {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    // isComposing: don't send while an IME (e.g. Chinese/Japanese input) is composing.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex shrink-0 items-end gap-2 border-t p-3"
    >
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Message"
          aria-invalid={isTooLong || undefined}
          rows={1}
          disabled={disabled}
          autoFocus
          className="max-h-40 min-h-10 resize-none py-2.5"
        />
        {value.length >= MESSAGE_COUNTER_THRESHOLD && (
          <span
            className={cn(
              'absolute right-2 bottom-1 text-[10px]',
              isTooLong ? 'font-medium text-destructive' : 'text-muted-foreground',
            )}
            aria-live="polite"
          >
            {remaining}
          </span>
        )}
      </div>
      <Button type="submit" size="icon" className="size-10 shrink-0" disabled={!canSend} aria-label="Send message">
        <SendHorizontal aria-hidden="true" />
      </Button>
    </form>
  )
}
