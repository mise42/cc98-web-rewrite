// TODO: Implement theme store
// import { useThemeStore } from '@/stores/theme'

/**
 * 主题 Hook
 */
export function useTheme() {
  return {
    theme: 'light',
    setTheme: () => {},
    toggleTheme: () => {},
    isDark: false,
    isLight: true,
  }
}
