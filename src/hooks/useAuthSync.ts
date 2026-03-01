import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import tokenManager from '@/lib/token-manager'
import { authService } from '@/services/auth'

/**
 * 启动时同步认证状态：
 * - 无可用会话时清空本地登录态
 * - 有会话时拉取 /me 校准用户信息
 */
export function useAuthSync() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const setUser = useAuthStore(state => state.setUser)
  const logout = useAuthStore(state => state.logout)

  useEffect(() => {
    let cancelled = false

    const syncAuth = async () => {
      // 本地无任何可恢复会话，清理可能残留的持久化登录态
      if (!tokenManager.hasSession()) {
        if (isAuthenticated) {
          logout()
        }
        return
      }

      const token = await tokenManager.getAccessToken()
      if (!token) {
        if (!cancelled) {
          logout()
        }
        return
      }

      try {
        const user = await authService.getCurrentUser()
        if (!cancelled) {
          setUser(user)
        }
      } catch {
        if (!cancelled) {
          logout()
        }
      }
    }

    void syncAuth()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, logout, setUser])
}
