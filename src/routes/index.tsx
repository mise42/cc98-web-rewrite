import { createBrowserRouter, Navigate } from 'react-router'
import { ErrorBoundary } from './error'
import { RootLayout } from './root'
import { ProtectedRoute } from './protected'
import { HomePage } from '@pages/home/HomePage'
import { LoginPage } from '@pages/auth/LoginPage'

/**
 * React Router v7 对象式路由配置
 * @see https://reactrouter.com/start/route
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <RootLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'boardlist',
        element: <div>版面列表（占位符）</div>,
      },
      {
        path: 'newtopics',
        element: <div>新帖列表（占位符）</div>,
      },
      {
        path: 'recommendedtopics',
        element: <div>精选帖子（占位符）</div>,
      },
      {
        path: 'usercenter',
        element: (
          <ProtectedRoute>
            <div>用户中心（占位符）</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'message',
        element: (
          <ProtectedRoute>
            <div>消息中心（占位符）</div>
          </ProtectedRoute>
        ),
      },
      // 404 页面
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
