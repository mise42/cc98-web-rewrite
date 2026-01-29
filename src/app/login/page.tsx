'use client'

import { useSearchParams } from 'next/navigation'
import { LoginPage } from '@/screens/auth/LoginPage'

export default function Page() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined

  return <LoginPage redirect={redirect} />
}
