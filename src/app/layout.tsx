/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next'
import '@/index.css'
import '@/styles/globals.css'
import { ClientRootLayout } from './ClientRootLayout'

export const metadata: Metadata = {
  title: 'CC98 论坛 - Rewrite',
  description: 'CC98 论坛 - 浙江大学学生社区',
  referrer: 'no-referrer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  )
}
