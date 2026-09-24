import ChangePasswordForm from '@/components/settings/ChangePasswordForm'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'

const THEMES = ['light', 'dark', 'system']

export default function Settings() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto grid max-w-2xl gap-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <section className="rounded-xl border p-4 sm:p-6">
          <h2 className="mb-3 font-medium">Appearance</h2>
          <div className="flex gap-2" role="radiogroup" aria-label="Theme">
            {THEMES.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={theme === option}
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

        <section className="rounded-xl border p-4 sm:p-6">
          <h2 className="mb-4 font-medium">Change password</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  )
}
