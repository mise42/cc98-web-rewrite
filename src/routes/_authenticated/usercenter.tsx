import { createFileRoute } from '@tanstack/react-router'
import { UserDetailPage } from '@/pages/user/UserDetailPage'

export const Route = createFileRoute('/_authenticated/usercenter')({
  component: () => <UserDetailPage isOwnProfile={true} />,
})
