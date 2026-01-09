import { createFileRoute, redirect } from '@tanstack/react-router'
import { RecommendedTopicsPage } from '@/pages/topics/RecommendedTopicsPage'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/recommendedtopics')({
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
  component: RecommendedTopicsPage,
})
