import { createFileRoute, redirect } from '@tanstack/react-router'
import { TopicDetailPage } from '@/pages/topic/TopicDetailPage'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/topic/$topicId')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading } = useAuthStore.getState()

    if (!isLoading && !isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: TopicDetailPage,
})
