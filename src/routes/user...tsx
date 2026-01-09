import { createFileRoute } from '@tanstack/react-router'
import { UserDetailPage } from '@/pages/user/UserDetailPage'

export const Route = createFileRoute('/user/')({
  component: () => <UserDetailPage isOwnProfile={false} />,
})
