import { Outlet } from 'react-router'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'

/**
 * 根布局组件
 * 包含全局的 Header 和 Footer，使用 Outlet 渲染子路由
 */
export function RootLayout() {
  return (
    <div className="main-container">
      <Header />
      <main
        style={{
          minHeight: 'calc(100vh - 64px - 200px)',
          marginTop: '64px',
          padding: '2rem',
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
