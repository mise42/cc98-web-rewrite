import { createFileRoute, Navigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage as LoginPageComponent } from '@/pages/auth/LoginPage'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  head: () => ({
    meta: [
      {
        title: '登录 - CC98 论坛',
      },
    ],
  }),
  component: LoginRoute,
})

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const search = Route.useSearch()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <div>加载中...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={search.redirect || '/'} />
  }

  return <LoginPageComponent redirect={search.redirect} />
}
