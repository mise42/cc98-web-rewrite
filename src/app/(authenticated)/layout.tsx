'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuthStore()
  const hasHydrated = useSyncExternalStore(
    listener => useAuthStore.persist.onFinishHydration(listener),
    () => useAuthStore.persist.hasHydrated(),
    () => useAuthStore.persist.hasHydrated()
  )

  useEffect(() => {
    if (hasHydrated && !isLoading && !isAuthenticated) {
      const search = searchParams.toString()
      const redirectUrl = search ? `${pathname}?${search}` : pathname
      router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
    }
  }, [hasHydrated, isAuthenticated, isLoading, pathname, router, searchParams])

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <div>加载中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
