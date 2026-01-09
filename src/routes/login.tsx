import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage as LoginPageComponent } from '@/pages/auth/LoginPage'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <div>加载中...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return <LoginPageComponent />
}
