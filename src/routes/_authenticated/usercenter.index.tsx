import { createFileRoute } from '@tanstack/react-router'
import { UserCenterPage } from '@/pages/user/UserCenterPage'

export const Route = createFileRoute('/_authenticated/usercenter/')({
  component: UserCenterPage,
})
