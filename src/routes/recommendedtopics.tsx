import { createFileRoute } from '@tanstack/react-router'
import { RecommendedTopicsPage } from '@/pages/topics/RecommendedTopicsPage'

export const Route = createFileRoute('/recommendedtopics')({
  component: RecommendedTopicsPage,
})
