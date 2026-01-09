import { createFileRoute, redirect } from '@tanstack/react-router'
import { BoardDetailPage } from '@/pages/board/BoardDetailPage'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/board/$boardId')({
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
