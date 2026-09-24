import { MessageCircle } from 'lucide-react'

// Centered card shell shared by login, register and password-reset pages.
export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <MessageCircle className="size-8" aria-hidden="true" />
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
