import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * 路由守卫组件
 * 如果用户未登录，自动重定向到登录页
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  // 显示加载状态
  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div>加载中...</div>
      </div>
    )
  }

  // 未登录重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 已登录，渲染子组件
  return <>{children}</>
}
