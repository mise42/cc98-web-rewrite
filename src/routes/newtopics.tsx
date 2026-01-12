import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { NewTopicsPage } from '@/pages/topics/NewTopicsPage'
import { useAuthStore } from '@/stores/auth'

const newTopicsSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  mode: z.enum(['pagination', 'infinite']).optional().default('pagination'),
})

export const Route = createFileRoute('/newtopics')({
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
  component: NewTopicsPage,
  validateSearch: newTopicsSearchSchema,
})
