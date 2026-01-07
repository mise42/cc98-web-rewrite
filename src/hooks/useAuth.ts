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
 * 需要认证的 Hook
 * 如果未登录，自动跳转到登录页
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore()

  // TODO: 实现路由跳转（需要在 React Router 中集成）
  // const navigate = useNavigate()
  // if (!isLoading && !isAuthenticated) {
  //   navigate('/login', { replace: true });
  // }

  return { isAuthenticated, isLoading }
}
