import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const THEMES = ['light', 'dark', 'system']

export default function Settings() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)

  // Phase 4+: password change, notification preferences.
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-medium">Appearance</h2>
        <div className="flex gap-2">
          {THEMES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm capitalize',
                theme === option ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
