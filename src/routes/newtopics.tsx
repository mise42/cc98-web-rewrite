import { createFileRoute, redirect } from '@tanstack/react-router'
import { NewTopicsPage } from '@/pages/topics/NewTopicsPage'
import { useAuthStore } from '@/stores/auth'

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
})
