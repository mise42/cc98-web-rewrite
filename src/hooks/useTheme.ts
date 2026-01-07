import { useThemeStore } from '@/stores/theme'

/**
 * 主题 Hook
 */
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore()

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}
