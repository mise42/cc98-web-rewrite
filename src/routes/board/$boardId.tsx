import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { BoardDetailPage } from '@/pages/board/BoardDetailPage'
import { useAuthStore } from '@/stores/auth'

const boardSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
})

export const Route = createFileRoute('/board/$boardId')({
  validateSearch: boardSearchSchema,
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
  component: BoardDetailPage,
})
