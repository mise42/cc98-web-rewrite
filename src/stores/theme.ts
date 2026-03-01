import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Constants } from '@/config/constants'
import type { ThemeMode } from '@/config/theme-presets'

interface ThemeState {
  mode: ThemeMode
  legacyThemeId: number
  setMode: (mode: ThemeMode) => void
  setLegacyThemeId: (themeId: number) => void
  toggleMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      mode: 'system',
      legacyThemeId: 0,
      setMode: mode => set({ mode }),
      setLegacyThemeId: legacyThemeId => set({ legacyThemeId }),
      toggleMode: () =>
        set(state => ({
          mode: state.mode === 'light' ? 'dark' : state.mode === 'dark' ? 'system' : 'light',
        })),
    }),
    {
      name: Constants.storageKeys.theme,
    }
  )
)
