import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Password input with a show/hide toggle. Forwards all props (incl. react-hook-form's register()).
export default function PasswordInput({ className, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = isVisible ? EyeOff : Eye

  return (
    <div className="relative">
      <Input type={isVisible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
