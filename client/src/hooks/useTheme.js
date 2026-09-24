import { useEffect } from 'react'
import { useUiStore } from '@/stores/uiStore'

// Applies the `dark` class to <html> based on the theme preference in uiStore.
export function useTheme() {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', isDark)
    }

    apply()
    if (theme !== 'system') return undefined

    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
