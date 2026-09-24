import { LoaderCircle } from 'lucide-react'

export default function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="grid h-dvh place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        {label}
      </div>
    </div>
  )
}
