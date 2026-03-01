import { useThemeStore } from '@/stores/theme'

/**
 * 主题 Hook
 */
export function useTheme() {
  const { mode, legacyThemeId, setMode, setLegacyThemeId, toggleMode } = useThemeStore()

  return {
    mode,
    legacyThemeId,
    setMode,
    setLegacyThemeId,
    toggleMode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    isSystem: mode === 'system',
  }
}
