import { createRootRouteWithContext, Outlet, HeadContent } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'

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
        content: 'CC98 论坛 - 清华大学学生社区',
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
})

function RootComponent() {
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
