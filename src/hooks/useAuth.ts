import { useAuthStore } from '@/stores/auth'

/**
 * 认证 Hook
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, loginWithOAuth, logout } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithOAuth,
    logout,
  }
}

/**
 * 需要认证的 Hook（辅助用途，路由保护请使用 beforeLoad）
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore()
  return { isAuthenticated, isLoading }
}
