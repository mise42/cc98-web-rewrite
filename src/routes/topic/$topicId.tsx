import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { TopicDetailPage } from '@/pages/topic/TopicDetailPage'
import { useAuthStore } from '@/stores/auth'

const topicSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  mode: z.enum(['pagination', 'infinite']).optional().default('pagination'),
})

export const Route = createFileRoute('/topic/$topicId')({
  validateSearch: topicSearchSchema,
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
