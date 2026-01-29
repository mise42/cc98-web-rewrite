'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'sonner'

interface ClientRootLayoutProps {
  children: React.ReactNode
}

export function ClientRootLayout({ children }: ClientRootLayoutProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </QueryClientProvider>
  )
}
