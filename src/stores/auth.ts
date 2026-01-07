import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth'
import type { IUser } from '@/types/api'

/**
 * 认证状态
 */
interface AuthState {
  // 状态
  user: IUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // 操作
  login: (username: string, password: string) => Promise<void>
  loginWithOAuth: (code: string) => Promise<void>
  logout: () => void
  setUser: (user: IUser) => void
  clearError: () => void
}

/**
 * 认证 Store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 登录
      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user } = await authService.login({ username, password })
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登录失败',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          // 重新抛出错误，让调用方能够捕获
          throw error
        }
      },

      // OAuth 登录
      loginWithOAuth: async code => {
        set({ isLoading: true, error: null })
        try {
          const { user } = await authService.handleOAuthCallback(code)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'OAuth 登录失败',
            isLoading: false,
          })
        }
      },

      // 登出
      logout: () => {
        authService.logout()
        set({ user: null, isAuthenticated: false })
      },

      // 设置用户信息
      setUser: user => set({ user, isAuthenticated: !!user }),

      // 清除错误
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
