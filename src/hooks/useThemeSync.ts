import { useEffect } from 'react'
import { applyTheme } from '@/lib/theme'
import { useThemeStore } from '@/stores/theme'

/**
 * 将主题状态同步到 DOM。
 */
export function useThemeSync() {
  const mode = useThemeStore(state => state.mode)
  const legacyThemeId = useThemeStore(state => state.legacyThemeId)

  useEffect(() => {
    applyTheme(mode, legacyThemeId)
  }, [mode, legacyThemeId])

  useEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme('system', legacyThemeId)
    mediaQuery.addEventListener('change', listener)

    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [mode, legacyThemeId])
}
