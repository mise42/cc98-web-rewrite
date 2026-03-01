import { createRootRouteWithContext, Outlet, HeadContent, Link } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { useMessageSync } from '@/hooks/useMessageSync'
import { useAuthSync } from '@/hooks/useAuthSync'
import { useThemeSync } from '@/hooks/useThemeSync'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: 'CC98 论坛',
      },
      {
        name: 'description',
        content: 'CC98 论坛 - 浙江大学学生社区',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
    ],
  }),
  component: RootComponent,
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">出错了</h1>
      <p className="text-muted-foreground mb-4">页面加载时发生了错误</p>
      {error && <p className="text-destructive text-sm mb-4">{error.message}</p>}
      <Button onClick={() => window.location.reload()}>刷新页面</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-xl font-semibold mb-2">页面不存在</p>
      <p className="text-muted-foreground mb-6">你访问的页面已不存在或链接有误</p>
      <Link to="/">
        <Button>返回首页</Button>
      </Link>
    </div>
  ),
})

function RootComponent() {
  useAuthSync()
  useMessageSync()
  useThemeSync()

  const userTheme = useAuthStore(state => state.user?.theme)
  const setLegacyThemeId = useThemeStore(state => state.setLegacyThemeId)

  useEffect(() => {
    if (typeof userTheme !== 'number') return
    setLegacyThemeId(userTheme)
  }, [setLegacyThemeId, userTheme])

  return (
    <>
      <HeadContent />
      <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
        <Header />
        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </>
  )
}
